import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

type PlanType = 'FREE' | 'PRO' | 'TEAM';

const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

// Initialize Upstash clients if environment variables exist
const hasRedis = !!(redisUrl && redisToken);

const redis = hasRedis
  ? new Redis({
      url: redisUrl,
      token: redisToken,
    })
  : null;

// Free rate limiter: 10 requests per 1 hour
const freeLimiter =
  redis &&
  new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, '1 h'),
    analytics: true,
    prefix: '@upstash/ratelimit/free',
  });

// Pro/Team rate limiter: 100 requests per 1 hour
const proLimiter =
  redis &&
  new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(100, '1 h'),
    analytics: true,
    prefix: '@upstash/ratelimit/pro',
  });

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number; // epoch timestamp in ms when limit resets
}

/**
 * Checks rate limits on a sliding window using Upstash Redis.
 * Falls back to a bypass state in local development environments if
 * Upstash environment variables are not configured.
 */
export async function checkRateLimit(
  userId: string,
  plan: PlanType
): Promise<RateLimitResult> {
  // If Redis credentials are not configured, bypass the rate limit gracefully
  if (!hasRedis || !freeLimiter || !proLimiter) {
    console.warn(
      '[checkRateLimit] Upstash Redis credentials not configured. Bypassing rate limit.'
    );
    return {
      success: true,
      limit: plan === 'FREE' ? 10 : 100,
      remaining: 999,
      reset: Date.now() + 3600000,
    };
  }

  const key = `ratelimit:${userId}`;
  const limiter = plan === 'FREE' ? freeLimiter : proLimiter;

  try {
    const { success, limit, remaining, reset } = await limiter.limit(key);
    return { success, limit, remaining, reset };
  } catch (error) {
    console.error('[checkRateLimit] Upstash rate limit error:', error);
    // Safe fallback: allow query in case of Upstash network failures to prevent outage
    return {
      success: true,
      limit: plan === 'FREE' ? 10 : 100,
      remaining: 1,
      reset: Date.now() + 3600000,
    };
  }
}
