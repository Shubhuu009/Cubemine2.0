/**
 * Cache Service — Dual-layer caching with Upstash Redis REST API + node-cache fallback
 *
 * Strategy:
 *   1. If REDIS_URL is set (rediss:// or redis://) → connect via ioredis (standard Redis / Upstash TLS)
 *   2. If UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN → use Upstash REST API via fetch
 *   3. Otherwise → fall back to node-cache (in-memory)
 *
 * All methods are async-safe and never throw — cache failures are silent.
 */

const NodeCache = require('node-cache');

let redisClient = null;
let upstashClient = null;
let memoryCache = null;
let cacheType = 'none';

// ─── Upstash REST Client ───────────────────────────────────
const createUpstashClient = (url, token) => {
  const baseUrl = url.endsWith('/') ? url.slice(0, -1) : url;
  const headers = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };

  const request = async (command, ...args) => {
    const body = JSON.stringify([command, ...args]);
    const res = await fetch(`${baseUrl}`, {
      method: 'POST',
      headers,
      body,
    });
    if (!res.ok) throw new Error(`Upstash HTTP ${res.status}: ${await res.text()}`);
    const json = await res.json();
    return json.result;
  };

  return {
    get: (key) => request('GET', key),
    set: (key, value, px, ttlMs) => request('SET', key, value, 'PX', ttlMs),
    del: (...keys) => request('DEL', ...keys),
    keys: (pattern) => request('KEYS', pattern),
    ping: () => request('PING'),
    flushdb: () => request('FLUSHDB'),
    status: 'ready',
  };
};

// ─── Initialize Cache ─────────────────────────────────────
const initCache = async () => {
  const redisUrl = process.env.REDIS_URL;
  const upstashUrl = process.env.UPSTASH_REDIS_REST_URL;
  const upstashToken = process.env.UPSTASH_REDIS_REST_TOKEN;

  // ── Attempt Upstash REST API first (if both vars set) ──
  if (upstashUrl && upstashToken) {
    try {
      upstashClient = createUpstashClient(upstashUrl, upstashToken);
      await upstashClient.ping();
      cacheType = 'redis';
      console.log('✅ Cache: Upstash Redis REST API connected');
      console.log(`   └─ Endpoint: ${upstashUrl}`);
      return;
    } catch (err) {
      console.warn(`⚠️  Upstash REST connection failed: ${err.message}`);
      upstashClient = null;
    }
  }

  // ── Attempt ioredis (standard Redis or Upstash TLS rediss://) ──
  if (redisUrl) {
    try {
      const Redis = require('ioredis');

      redisClient = new Redis(redisUrl, {
        maxRetriesPerRequest: 3,
        retryStrategy: (times) => {
          if (times > 3) return null;
          return Math.min(times * 200, 2000);
        },
        connectTimeout: 8000,
        commandTimeout: 5000,
        lazyConnect: true,
        enableReadyCheck: true,
        // TLS for Upstash / Redis Cloud
        ...(redisUrl.startsWith('rediss://') ? { tls: {} } : {}),
      });

      await redisClient.connect();
      await redisClient.ping();
      cacheType = 'redis';
      console.log('✅ Cache: Redis (ioredis) connected successfully');
      console.log(`   └─ Endpoint: ${redisUrl.replace(/\/\/.*@/, '//***@')}`);

      redisClient.on('error', (err) => {
        console.warn(`⚠️  Redis error: ${err.message} — falling back to memory cache`);
        if (cacheType === 'redis') {
          cacheType = 'memory';
          ensureMemoryCache();
        }
      });

      redisClient.on('reconnecting', () => console.log('🔄 Redis reconnecting...'));
      redisClient.on('connect', () => {
        if (cacheType === 'memory') {
          cacheType = 'redis';
          console.log('✅ Redis reconnected — switching back from memory cache');
        }
      });

      return;
    } catch (err) {
      console.warn(`⚠️  Redis (ioredis) connection failed: ${err.message}`);
      console.warn('   └─ Falling back to in-memory cache (node-cache)');
      redisClient = null;
    }
  }

  // ── Fallback: in-memory cache ──
  ensureMemoryCache();
  cacheType = 'memory';
  console.log('📦 Cache: Using in-memory cache (node-cache)');
  if (!redisUrl && !upstashUrl) {
    console.log('   └─ Set REDIS_URL or UPSTASH_REDIS_REST_URL/TOKEN to enable Redis');
  }
};

const ensureMemoryCache = () => {
  if (!memoryCache) {
    memoryCache = new NodeCache({
      stdTTL: 60,
      checkperiod: 30,
      useClones: false,
      maxKeys: 500,
    });
  }
};

// ─── Unified Redis helper ──────────────────────────────────
const redisGet = async (key) => {
  if (upstashClient) return upstashClient.get(key);
  if (redisClient) return redisClient.get(key);
  return null;
};

const redisSet = async (key, value, ttlSeconds) => {
  if (upstashClient) {
    // Upstash REST uses PX (milliseconds)
    return upstashClient.set(key, value, 'PX', ttlSeconds * 1000);
  }
  if (redisClient) {
    return redisClient.set(key, value, 'EX', ttlSeconds);
  }
};

const redisDel = async (key) => {
  if (upstashClient) return upstashClient.del(key);
  if (redisClient) return redisClient.del(key);
};

const redisKeys = async (pattern) => {
  if (upstashClient) return upstashClient.keys(pattern);
  if (redisClient) return redisClient.keys(pattern);
  return [];
};

const redisFlush = async () => {
  if (upstashClient) return upstashClient.flushdb();
  if (redisClient) return redisClient.flushdb();
};

// ─── Cache Operations ─────────────────────────────────────

const get = async (key) => {
  try {
    if (cacheType === 'redis') {
      const data = await redisGet(key);
      return data ? JSON.parse(data) : null;
    }
    if (cacheType === 'memory' && memoryCache) {
      const data = memoryCache.get(key);
      return data !== undefined ? data : null;
    }
    return null;
  } catch (err) {
    console.warn(`Cache GET error (${key}): ${err.message}`);
    return null;
  }
};

const set = async (key, value, ttl = 60) => {
  try {
    if (cacheType === 'redis') {
      await redisSet(key, JSON.stringify(value), ttl);
      return;
    }
    if (cacheType === 'memory' && memoryCache) {
      memoryCache.set(key, value, ttl);
    }
  } catch (err) {
    console.warn(`Cache SET error (${key}): ${err.message}`);
  }
};

const del = async (key) => {
  try {
    if (cacheType === 'redis') {
      await redisDel(key);
      return;
    }
    if (cacheType === 'memory' && memoryCache) {
      memoryCache.del(key);
    }
  } catch (err) {
    console.warn(`Cache DEL error (${key}): ${err.message}`);
  }
};

const delPattern = async (pattern) => {
  try {
    if (cacheType === 'redis') {
      const keys = await redisKeys(pattern);
      if (keys && keys.length > 0) {
        for (const k of keys) await redisDel(k);
      }
      return;
    }
    if (cacheType === 'memory' && memoryCache) {
      const prefix = pattern.replace('*', '');
      const keys = memoryCache.keys().filter((k) => k.startsWith(prefix));
      keys.forEach((k) => memoryCache.del(k));
    }
  } catch (err) {
    console.warn(`Cache DEL_PATTERN error (${pattern}): ${err.message}`);
  }
};

const flush = async () => {
  try {
    if (cacheType === 'redis') await redisFlush();
    if (cacheType === 'memory' && memoryCache) memoryCache.flushAll();
    console.log('🗑️  Cache flushed');
  } catch (err) {
    console.warn(`Cache FLUSH error: ${err.message}`);
  }
};

const getStats = () => {
  if (cacheType === 'redis') {
    const client = upstashClient || redisClient;
    return {
      type: upstashClient ? 'upstash-redis' : 'ioredis',
      status: upstashClient ? 'ready' : (redisClient?.status || 'unknown'),
    };
  }
  if (cacheType === 'memory' && memoryCache) {
    const stats = memoryCache.getStats();
    return {
      type: 'memory',
      keys: memoryCache.keys().length,
      hits: stats.hits,
      misses: stats.misses,
      hitRate: stats.hits + stats.misses > 0
        ? ((stats.hits / (stats.hits + stats.misses)) * 100).toFixed(1) + '%'
        : '0%',
    };
  }
  return { type: 'none' };
};

const disconnect = async () => {
  if (redisClient) {
    try { await redisClient.quit(); } catch (_) {}
    console.log('Redis disconnected');
  }
  // Upstash REST is stateless — no disconnect needed
};

module.exports = {
  initCache,
  get,
  set,
  del,
  delPattern,
  flush,
  getStats,
  disconnect,
  getCacheType: () => cacheType,
};
