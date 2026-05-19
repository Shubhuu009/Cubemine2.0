const cache = require('../services/cache.service');

// Cache a public route (same response for all users)
// Usage: router.get('/leaderboard', cacheRoute('leaderboard', 30), controller)
const cacheRoute = (prefix, ttl = 60) => {
  return async (req, res, next) => {
    const queryKey = Object.keys(req.query)
      .sort()
      .map((k) => `${k}=${req.query[k]}`)
      .join('&');
    const cacheKey = `route:${prefix}${queryKey ? ':' + queryKey : ''}`;

    try {
      const cached = await cache.get(cacheKey);
      if (cached) {
        return res.status(200)
          .set('X-Cache', 'HIT')
          .set('X-Cache-Type', cache.getCacheType())
          .json(cached);
      }

      const originalJson = res.json.bind(res);
      res.json = (body) => {
        if (res.statusCode === 200 && body?.success) {
          cache.set(cacheKey, body, ttl).catch(() => {});
        }
        res.set('X-Cache', 'MISS');
        res.set('X-Cache-Type', cache.getCacheType());
        return originalJson(body);
      };

      next();
    } catch (err) {
      next();
    }
  };
};

// Cache a per-user route (different cache per authenticated user)
// Usage: router.get('/statistics', authenticate, cacheUserRoute('statistics', 60), controller)
const cacheUserRoute = (prefix, ttl = 60) => {
  return async (req, res, next) => {
    const userId = req.user?._id || req.user?.id;
    if (!userId) return next();

    const queryKey = Object.keys(req.query)
      .sort()
      .map((k) => `${k}=${req.query[k]}`)
      .join('&');
    const cacheKey = `user:${userId}:${prefix}${queryKey ? ':' + queryKey : ''}`;

    try {
      const cached = await cache.get(cacheKey);
      if (cached) {
        return res.status(200)
          .set('X-Cache', 'HIT')
          .set('X-Cache-Type', cache.getCacheType())
          .json(cached);
      }

      const originalJson = res.json.bind(res);
      res.json = (body) => {
        if (res.statusCode === 200 && body?.success) {
          cache.set(cacheKey, body, ttl).catch(() => {});
        }
        res.set('X-Cache', 'MISS');
        res.set('X-Cache-Type', cache.getCacheType());
        return originalJson(body);
      };

      next();
    } catch (err) {
      next();
    }
  };
};

// Invalidate cache patterns after a successful mutation
// Usage: router.post('/solve', authenticate, invalidateCache(['leaderboard:*', 'user::userId:statistics*']), controller)
const invalidateCache = (patterns = []) => {
  return async (req, res, next) => {
    const originalJson = res.json.bind(res);
    res.json = (body) => {
      if (res.statusCode >= 200 && res.statusCode < 300 && body?.success) {
        const userId = req.user?._id || req.user?.id;
        patterns.forEach((pattern) => {
          const resolvedPattern = pattern.replace(':userId', userId || '');
          cache.delPattern(resolvedPattern).catch(() => {});
        });
      }
      return originalJson(body);
    };

    next();
  };
};

module.exports = { cacheRoute, cacheUserRoute, invalidateCache };
