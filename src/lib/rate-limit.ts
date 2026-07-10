interface RateLimitRecord {
  attempts: number;
  resetAt: number;
}

export interface RateLimitResult {
  allowed: boolean;
  retryAfterSec: number;
}

export interface RateLimiter {
  (key: string): RateLimitResult;
  reset: (key: string) => void;
}

/**
 * In-memory, per-process rate limiter. State is not shared across serverless
 * instances/cold starts — an accepted trade-off for this site's traffic level.
 */
export function createRateLimiter(opts: { max: number; windowMs: number }): RateLimiter {
  const hits = new Map<string, RateLimitRecord>();

  const limiter = ((key: string): RateLimitResult => {
    const now = Date.now();
    const record = hits.get(key);

    if (!record || now > record.resetAt) {
      hits.set(key, { attempts: 1, resetAt: now + opts.windowMs });
      return { allowed: true, retryAfterSec: 0 };
    }

    if (record.attempts >= opts.max) {
      return { allowed: false, retryAfterSec: Math.ceil((record.resetAt - now) / 1000) };
    }

    record.attempts += 1;
    return { allowed: true, retryAfterSec: 0 };
  }) as RateLimiter;

  limiter.reset = (key: string) => {
    hits.delete(key);
  };

  return limiter;
}
