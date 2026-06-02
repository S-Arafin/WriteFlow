import prisma from '@/lib/prisma';

type UsageAgentType = 'DRAFT' | 'REWRITE' | 'CHAT' | 'SUMMARISE';

export interface LogUsagePayload {
  userId: string;
  agentType: UsageAgentType;
  promptSnippet?: string;
  tokensUsed: number;
  model: string;
}

/**
 * Directly writes AI usage records to the database using Prisma.
 * Bypasses local API loopback fetch calls to avoid server-side session issues.
 */
export function logAiUsageAsync(
  _baseUrl: string, // Kept to maintain compatibility with existing callers
  payload: LogUsagePayload
): void {
  prisma.usageLog
    .create({
      data: {
        userId: payload.userId,
        agentType: payload.agentType,
        promptSnippet: payload.promptSnippet?.trim() || null,
        tokensUsed: payload.tokensUsed,
        model: payload.model,
      },
    })
    .catch((err) => {
      console.error(
        '[logAiUsageAsync] Failed to write usage log to database:',
        err
      );
    });
}
