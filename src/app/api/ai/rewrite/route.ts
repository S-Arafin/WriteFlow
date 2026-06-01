import { NextResponse, NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

type PlanType = 'FREE' | 'PRO' | 'TEAM';

import { logAiUsageAsync } from '@/lib/ai/logger';
import { openai } from '@/lib/ai/openai';
import { REWRITE_SYSTEM_PROMPT, createRewritePrompt } from '@/lib/ai/prompts';
import { checkRateLimit } from '@/lib/ai/ratelimit';

export const runtime = 'edge';

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
    const { selectedText, tone } = body;

    if (!selectedText || !tone) {
      return new Response(
        'Missing required fields: selectedText and tone are required.',
        {
          status: 400,
        }
      );
    }

    // 4. Construct prompt securely using XML injection protections
    const systemPrompt = REWRITE_SYSTEM_PROMPT;
    const userPrompt = createRewritePrompt({ selectedText, tone });

    const model = 'gpt-4o-mini';

    // 5. OpenAI Chat Completion - non-streaming to avoid layout shifts in the editor
    const response = await openai.chat.completions.create({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      stream: false,
    });

    const rewritten = response.choices[0]?.message?.content || '';

    // 6. Non-blocking token usage logging
    const totalTokens =
      response.usage?.total_tokens ||
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
    console.error('[Rewrite Agent] General failure:', error);
    return new Response('An unexpected internal server error occurred.', {
      status: 500,
    });
  }
}
