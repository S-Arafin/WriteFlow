import { NextResponse, NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { z } from 'zod';

import { gemini } from '@/lib/ai/gemini';
import { logAiUsageAsync } from '@/lib/ai/logger';
import { REWRITE_SYSTEM_PROMPT, createRewritePrompt } from '@/lib/ai/prompts';
import { checkRateLimit } from '@/lib/ai/ratelimit';
import prisma from '@/lib/prisma';

type PlanType = 'FREE' | 'PRO' | 'TEAM';

// Node.js serverless runtime — avoids the 1 MB Edge Function size limit
export const runtime = 'nodejs';

const secret = process.env.NEXTAUTH_SECRET;

/**
 * Edge API Route for Agent 2 (Rewrite & Tone Editor).
 * Requires session authorization, rate checks, and performs non-streaming completions
 * to ensure complete word/phrase replacement inside active editor highlights.
 */
export async function POST(req: NextRequest) {
  try {
    // 1. Session verification at Edge boundary using NextAuth JWT
    const token = await getToken({ req, secret });

    if (!token || !token.id) {
      return new Response('Unauthorized: Session not found', { status: 401 });
    }

    const userId = token.id as string;
    const userPlan = token.plan as PlanType;

    // Check if AI is enabled globally via direct DB query (avoids loopback fetch)
    try {
      const siteConfig = await prisma.siteConfig.findUnique({
        where: { id: 'singleton' },
        select: { aiEnabled: true },
      });
      if (siteConfig && !siteConfig.aiEnabled) {
        return new Response(
          'Service Unavailable: AI features are currently disabled by the administrator.',
          { status: 503 }
        );
      }
    } catch (err) {
      console.error('Failed to verify global AI status:', err);
    }

    // 2. Upstash Redis plan-based rate limiter
    const rateLimit = await checkRateLimit(userId, userPlan);

    if (!rateLimit.success) {
      const resetSeconds = Math.ceil((rateLimit.reset - Date.now()) / 1000);
      return new Response('Too Many Requests: Plan rate limit reached.', {
        status: 429,
        headers: {
          'Retry-After': resetSeconds.toString(),
        },
      });
    }

    // 3. Request payload validation with Zod
    let parsedJson: unknown;
    try {
      parsedJson = await req.json();
    } catch {
      return new Response('Invalid JSON payload.', { status: 400 });
    }

    const rewriteRouteSchema = z.object({
      selectedText: z.string().min(1, 'Selected text is required'),
      tone: z.string().min(1, 'Tone is required'),
    });

    const validationResult = rewriteRouteSchema.safeParse(parsedJson);
    if (!validationResult.success) {
      return new Response(
        validationResult.error.issues[0]?.message ||
          'Invalid input validation error.',
        {
          status: 400,
        }
      );
    }

    const { selectedText, tone } = validationResult.data;

    // 4. Construct prompt securely using XML injection protections
    const systemPrompt = REWRITE_SYSTEM_PROMPT;
    const userPrompt = createRewritePrompt({ selectedText, tone });

    const model = 'gemini-2.5-flash';

    // 5. Google Gemini Chat Completion - non-streaming to avoid layout shifts in the editor
    const response = await gemini.models.generateContent({
      model,
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
      },
    });

    const rewritten = response.text || '';

    // 6. Non-blocking token usage logging
    const totalTokens =
      Math.ceil((rewritten.length + selectedText.length) / 4) + 60;
    logAiUsageAsync(req.url, {
      userId,
      agentType: 'REWRITE',
      promptSnippet: `Tone: ${tone} | ${selectedText.slice(0, 50)}`,
      tokensUsed: totalTokens,
      model,
    });

    return NextResponse.json({ rewritten });
  } catch (error) {
    const err = error as {
      status?: string;
      statusCode?: number;
      code?: number;
      message?: string;
    };
    console.error('[Rewrite Agent] General failure:', error);
    const status = typeof err.code === 'number' ? err.code : 500;
    const message =
      err.message || 'An unexpected internal server error occurred.';
    return new Response(message, { status });
  }
}
