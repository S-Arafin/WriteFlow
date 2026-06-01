import { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

type PlanType = 'FREE' | 'PRO' | 'TEAM';

import { logAiUsageAsync } from '@/lib/ai/logger';
import { openai } from '@/lib/ai/openai';
import { DRAFT_SYSTEM_PROMPT, createDraftPrompt } from '@/lib/ai/prompts';
import { checkRateLimit } from '@/lib/ai/ratelimit';
import prisma from '@/lib/prisma';

// Node.js serverless runtime — avoids the 1 MB Edge Function size limit
export const runtime = 'nodejs';

const secret = process.env.NEXTAUTH_SECRET;

/**
 * Edge API Route for Agent 1 (Content Draft Generator).
 * Features JWT session validation, Upstash Redis rate limiting,
 * prompt injection protection, streaming output, and asynchronous token tracking.
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

    // 3. Request payload validation
    const body = await req.json();
    const { title, instructions } = body;

    if (!title || !instructions) {
      return new Response(
        'Missing required fields: title and instructions are required.',
        {
          status: 400,
        }
      );
    }

    // 4. Construct prompt securely using XML injection protections
    const systemPrompt = DRAFT_SYSTEM_PROMPT;
    const userPrompt = createDraftPrompt({ title, instructions });

    const model = 'gpt-4o-mini';

    // 5. OpenAI Chat Completion with streaming
    const responseStream = await openai.chat.completions.create({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      stream: true,
    });

    // 6. Return Streaming Response and track tokens non-blockingly
    const encoder = new TextEncoder();
    let completeText = '';

    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of responseStream) {
            const content = chunk.choices[0]?.delta?.content || '';
            if (content) {
              completeText += content;
              controller.enqueue(encoder.encode(content));
            }
          }
          controller.close();

          // Stream complete: trigger fire-and-forget non-blocking usage logging
          // 1 word ~= 1.33 tokens. (charCount / 4) is a highly reliable token heuristic for logging
          const estimatedTokens = Math.ceil(completeText.length / 4) + 50; // add baseline prompt overhead
          logAiUsageAsync(req.url, {
            userId,
            agentType: 'DRAFT',
            promptSnippet: instructions.slice(0, 100),
            tokensUsed: estimatedTokens,
            model,
          });
        } catch (streamError) {
          console.error(
            '[Draft Agent Stream] Stream parsing failed:',
            streamError
          );
          controller.error(streamError);
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch (error) {
    console.error('[Draft Agent] General failure:', error);
    return new Response('An unexpected internal server error occurred.', {
      status: 500,
    });
  }
}
