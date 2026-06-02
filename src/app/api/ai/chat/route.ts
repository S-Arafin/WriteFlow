import { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { z } from 'zod';

import { gemini } from '@/lib/ai/gemini';
import { logAiUsageAsync } from '@/lib/ai/logger';
import { CHAT_SYSTEM_PROMPT, createChatPrompt } from '@/lib/ai/prompts';
import { checkRateLimit } from '@/lib/ai/ratelimit';
import prisma from '@/lib/prisma';

type PlanType = 'FREE' | 'PRO' | 'TEAM';

// Node.js serverless runtime — avoids the 1 MB Edge Function size limit
export const runtime = 'nodejs';

const secret = process.env.NEXTAUTH_SECRET;

/**
 * Edge API Route for Agent 3 (Chat Assistant).
 * Features user session checks, rate limits, history constraints (max 20 messages),
 * document character limits (max 3000 chars), streaming output, and usage tracking.
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

    const chatRouteSchema = z.object({
      messages: z
        .array(
          z.object({
            role: z.enum(['user', 'assistant']),
            content: z.string().min(1, 'Message content cannot be empty'),
          })
        )
        .min(1, 'Messages array is required'),
      documentContent: z.string().optional().nullable(),
    });

    const validationResult = chatRouteSchema.safeParse(parsedJson);
    if (!validationResult.success) {
      return new Response(
        validationResult.error.issues[0]?.message ||
          'Invalid input validation error.',
        {
          status: 400,
        }
      );
    }

    const { messages, documentContent } = validationResult.data;

    // 4. Strictly enforce context windows
    // Truncate message history to the last 20 messages
    const trimmedHistory = messages.slice(-20);
    // Truncate document context to the first 3000 characters
    const truncatedDoc = (documentContent || '').slice(0, 3000);

    // Build the final conversation array for OpenAI.
    // We map the final message to our createChatPrompt prompt with secure XML bounds.
    const lastUserMessage = trimmedHistory[trimmedHistory.length - 1];
    if (!lastUserMessage) {
      return new Response('Bad Request: Message history is empty.', {
        status: 400,
      });
    }
    const systemPrompt = CHAT_SYSTEM_PROMPT;

    const geminiContents = [
      ...trimmedHistory.slice(0, -1).map((msg) => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }],
      })),
      {
        role: 'user',
        parts: [
          {
            text: createChatPrompt({
              query: lastUserMessage.content,
              documentContent: truncatedDoc,
            }),
          },
        ],
      },
    ];

    const model = 'gemini-2.5-flash';

    // 5. Google Gemini Chat Completion with streaming
    const responseStream = await gemini.models.generateContentStream({
      model,
      contents: geminiContents,
      config: {
        systemInstruction: systemPrompt,
      },
    });

    // 6. Return Streaming Response and track tokens non-blockingly
    const encoder = new TextEncoder();
    let completeText = '';

    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of responseStream) {
            const content = chunk.text || '';
            if (content) {
              completeText += content;
              controller.enqueue(encoder.encode(content));
            }
          }
          controller.close();

          // Stream complete: trigger fire-and-forget non-blocking usage logging
          const estimatedTokens =
            Math.ceil(
              (completeText.length +
                lastUserMessage.content.length +
                truncatedDoc.length) /
                4
            ) + 80;
          logAiUsageAsync(req.url, {
            userId,
            agentType: 'CHAT',
            promptSnippet: lastUserMessage.content.slice(0, 100),
            tokensUsed: estimatedTokens,
            model,
          });
        } catch (streamError) {
          console.error(
            '[Chat Agent Stream] Stream parsing failed:',
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
    const err = error as {
      status?: number;
      statusCode?: number;
      error?: { message?: string };
      message?: string;
    };
    console.error('[Chat Agent] General failure:', error);
    const status = err.status || err.statusCode || 500;
    const message =
      err.error?.message ||
      err.message ||
      'An unexpected internal server error occurred.';
    return new Response(message, { status });
  }
}
