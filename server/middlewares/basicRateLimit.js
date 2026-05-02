const buckets = new Map();

export function basicRateLimit({ windowMs = 60_000, max = 10, keyPrefix = 'global' } = {}) {
  return (req, res, next) => {
    const ip = req.ip || req.connection?.remoteAddress || 'unknown';
    const key = `${keyPrefix}:${ip}`;
    const now = Date.now();
    const existing = buckets.get(key);

    if (!existing || now > existing.resetAt) {
      buckets.set(key, { count: 1, resetAt: now + windowMs });
      return next();
    }

    existing.count += 1;
    if (existing.count > max) {
      const retryAfter = Math.ceil((existing.resetAt - now) / 1000);
      return res.status(429).json({
        success: false,
        message: `Too many requests. Try again in ${retryAfter} seconds.`,
        error: { retryAfter },
      });
    }

    next();
  };
}

