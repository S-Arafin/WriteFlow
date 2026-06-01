import { UsageAgentType } from '@prisma/client';

export interface LogUsagePayload {
  userId: string;
  agentType: UsageAgentType;
  promptSnippet?: string;
  tokensUsed: number;
  model: string;
}

/**
 * Dispatches a fire-and-forget non-blocking fetch call to our Node.js
 * serverless usage-logger API route. This prevents slow database writes
 * from blocking or introducing latency to active OpenAI completion streams.
 */
export function logAiUsageAsync(
  baseUrl: string,
  payload: LogUsagePayload
): void {
  const url = new URL('/api/usage/log', baseUrl).toString();

  fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  }).catch((err) => {
    // Graceful error logging to prevent interrupting caller execution
    console.error(
      '[logAiUsageAsync] Failed to send usage log asynchronously:',
      err
    );
  });
}
