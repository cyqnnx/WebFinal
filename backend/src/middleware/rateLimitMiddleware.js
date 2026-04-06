export function upstashRateLimit(limiter, { keyPrefix = 'rl' } = {}) {
  return async function rateLimitHandler(req, res, next) {
    const ip =
      (typeof req.headers['x-forwarded-for'] === 'string' && req.headers['x-forwarded-for']) ||
      req.ip ||
      'unknown';
    const identifier = `${keyPrefix}:${ip}`;

    try {
      const { success, remaining, reset } = await limiter.limit(identifier, {
        // Give Upstash a hint about client identity for better analytics/deny-lists.
        ip: ip,
        userAgent: req.headers['user-agent'],
      });

      if (!success) {
        return res.status(429).json({
          error: {
            message: 'Too many requests, please try again later.',
            remaining,
            reset,
          },
        });
      }

      return next();
    } catch (err) {
      // Fail open if Upstash is temporarily unreachable.
      return next();
    }
  };
}

