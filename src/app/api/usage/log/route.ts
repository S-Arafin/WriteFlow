import { UsageAgentType } from '@prisma/client';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';

import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

const logUsageSchema = z.object({
  userId: z.string().uuid('Invalid user reference'),
  agentType: z.nativeEnum(UsageAgentType),
  promptSnippet: z.string().optional(),
  tokensUsed: z.number().int().nonnegative('Tokens must be non-negative'),
  model: z.string().min(1, 'Model name is required'),
});

/**
 * Standard Node.js serverless route to log usage records to the database.
 * Protects database access behind session verification to ensure user integrity.
 */
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const parsed = logUsageSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid payload', details: parsed.error.issues },
        { status: 400 }
      );
    }

    const payload = parsed.data;

    // Security check: ensure current session user matches the logged userId
    if (session.user.id !== payload.userId) {
      return NextResponse.json(
        { error: 'Forbidden: User session mismatch' },
        { status: 403 }
      );
    }

    // Persist log entry in database
    const log = await prisma.usageLog.create({
      data: {
        userId: payload.userId,
        agentType: payload.agentType,
        promptSnippet: payload.promptSnippet?.trim() || null,
        tokensUsed: payload.tokensUsed,
        model: payload.model,
      },
    });

    return NextResponse.json({ success: true, id: log.id });
  } catch (error) {
    console.error('[API Usage Log] Unexpected error:', error);
    return NextResponse.json(
      { error: 'An unexpected internal error occurred' },
      { status: 500 }
    );
  }
}
