/**
 * Cache Middleware — Express middleware for route-level caching
 *
 * Usage:
 *   const { cacheRoute, cacheUserRoute, invalidateCache } = require('./middleware/cache.middleware');
 *
 *   // Public route cache (same response for everyone)
 *   router.get('/leaderboard', cacheRoute('leaderboard', 30), controller);
 *
 *   // Per-user cache (different cache per authenticated user)
 *   router.get('/statistics', authenticate, cacheUserRoute('statistics', 60), controller);
 *
 *   // Invalidate cache when data changes
 *   router.post('/solve', authenticate, invalidateCache(['leaderboard:*', 'statistics:*']), controller);
 */

const cache = require('../services/cache.service');

/**
 * Cache a public route response (same key for all users)
 * @param {string} prefix - Cache key prefix (e.g., 'leaderboard')
 * @param {number} ttl - TTL in seconds
 */
const cacheRoute = (prefix, ttl = 60) => {
  return async (req, res, next) => {
    // Build cache key from prefix + query params
    const queryKey = Object.keys(req.query)
      .sort()
      .map((k) => `${k}=${req.query[k]}`)
      .join('&');
    const cacheKey = `route:${prefix}${queryKey ? ':' + queryKey : ''}`;

    try {
      // Check cache
      const cached = await cache.get(cacheKey);
      if (cached) {
        // Add cache header so frontend knows
        return res.status(200)
          .set('X-Cache', 'HIT')
          .set('X-Cache-Type', cache.getCacheType())
          .json(cached);
      }

      // Cache MISS — intercept res.json to cache the response
      const originalJson = res.json.bind(res);
      res.json = (body) => {
        // Only cache successful responses
        if (res.statusCode === 200 && body?.success) {
          cache.set(cacheKey, body, ttl).catch(() => {});
        }
        res.set('X-Cache', 'MISS');
        res.set('X-Cache-Type', cache.getCacheType());
        return originalJson(body);
      };

      next();
    } catch (err) {
      // Cache error — continue without cache
      next();
    }
  };
};

/**
 * Cache a per-user route response (different cache per user)
 * @param {string} prefix - Cache key prefix (e.g., 'statistics')
 * @param {number} ttl - TTL in seconds
 */
const cacheUserRoute = (prefix, ttl = 60) => {
  return async (req, res, next) => {
    const userId = req.user?._id || req.user?.id;
    if (!userId) return next(); // No user = no cache

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

/**
 * Middleware to invalidate cache patterns when data changes
 * @param {string[]} patterns - Array of cache key patterns to invalidate
 */
const invalidateCache = (patterns = []) => {
  return async (req, res, next) => {
    const originalJson = res.json.bind(res);
    res.json = (body) => {
      // Invalidate after successful mutation
      if (res.statusCode >= 200 && res.statusCode < 300 && body?.success) {
        const userId = req.user?._id || req.user?.id;

        patterns.forEach((pattern) => {
          // Replace :userId placeholder
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
