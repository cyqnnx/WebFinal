import { Ratelimit } from '@upstash/ratelimit';
import { redis } from './redis.js';

// Tune limits based on your needs; these are intentionally conservative defaults.
export const authLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, '1 m'),
});

export const orderLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(20, '1 m'),
});

