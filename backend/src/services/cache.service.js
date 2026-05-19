const NodeCache = require('node-cache');

let redisClient = null;
let upstashClient = null;
let memoryCache = null;
let cacheType = 'none';

// Upstash REST client — uses fetch, no persistent TCP connection
const createUpstashClient = (url, token) => {
  const baseUrl = url.endsWith('/') ? url.slice(0, -1) : url;
  const headers = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };

  const request = async (command, ...args) => {
    const body = JSON.stringify([command, ...args]);
    const res = await fetch(baseUrl, { method: 'POST', headers, body });
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

// Initialize cache — tries Upstash REST, then ioredis, then falls back to in-memory
const initCache = async () => {
  const redisUrl = process.env.REDIS_URL;
  const upstashUrl = process.env.UPSTASH_REDIS_REST_URL;
  const upstashToken = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (upstashUrl && upstashToken) {
    try {
      upstashClient = createUpstashClient(upstashUrl, upstashToken);
      await upstashClient.ping();
      cacheType = 'redis';
      console.log(`Cache: Upstash Redis connected (${upstashUrl})`);
      return;
    } catch (err) {
      console.warn(`Upstash REST failed: ${err.message}`);
      upstashClient = null;
    }
  }

  if (redisUrl) {
    try {
      const Redis = require('ioredis');
      redisClient = new Redis(redisUrl, {
        maxRetriesPerRequest: 3,
        retryStrategy: (times) => (times > 3 ? null : Math.min(times * 200, 2000)),
        connectTimeout: 8000,
        commandTimeout: 5000,
        lazyConnect: true,
        enableReadyCheck: true,
        ...(redisUrl.startsWith('rediss://') ? { tls: {} } : {}),
      });

      await redisClient.connect();
      await redisClient.ping();
      cacheType = 'redis';
      console.log(`Cache: Redis connected (${redisUrl.replace(/\/\/.*@/, '//***@')})`);

      redisClient.on('error', (err) => {
        console.warn(`Redis error: ${err.message} — switching to memory cache`);
        if (cacheType === 'redis') { cacheType = 'memory'; ensureMemoryCache(); }
      });
      redisClient.on('reconnecting', () => console.log('Redis reconnecting...'));
      redisClient.on('connect', () => {
        if (cacheType === 'memory') { cacheType = 'redis'; console.log('Redis reconnected'); }
      });
      return;
    } catch (err) {
      console.warn(`Redis (ioredis) failed: ${err.message} — using in-memory cache`);
      redisClient = null;
    }
  }

  ensureMemoryCache();
  cacheType = 'memory';
  if (!redisUrl && !upstashUrl) {
    console.log('Cache: In-memory (node-cache). Set UPSTASH_REDIS_REST_URL or REDIS_URL to enable Redis.');
  } else {
    console.log('Cache: In-memory (node-cache) fallback.');
  }
};

const ensureMemoryCache = () => {
  if (!memoryCache) {
    memoryCache = new NodeCache({ stdTTL: 60, checkperiod: 30, useClones: false, maxKeys: 500 });
  }
};

// Unified Redis helpers
const redisGet = async (key) => {
  if (upstashClient) return upstashClient.get(key);
  if (redisClient) return redisClient.get(key);
  return null;
};

const redisSet = async (key, value, ttlSeconds) => {
  if (upstashClient) return upstashClient.set(key, value, 'PX', ttlSeconds * 1000);
  if (redisClient) return redisClient.set(key, value, 'EX', ttlSeconds);
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

// Public cache API
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
    if (cacheType === 'redis') { await redisSet(key, JSON.stringify(value), ttl); return; }
    if (cacheType === 'memory' && memoryCache) { memoryCache.set(key, value, ttl); }
  } catch (err) {
    console.warn(`Cache SET error (${key}): ${err.message}`);
  }
};

const del = async (key) => {
  try {
    if (cacheType === 'redis') { await redisDel(key); return; }
    if (cacheType === 'memory' && memoryCache) { memoryCache.del(key); }
  } catch (err) {
    console.warn(`Cache DEL error (${key}): ${err.message}`);
  }
};

const delPattern = async (pattern) => {
  try {
    if (cacheType === 'redis') {
      const keys = await redisKeys(pattern);
      if (keys && keys.length > 0) for (const k of keys) await redisDel(k);
      return;
    }
    if (cacheType === 'memory' && memoryCache) {
      const prefix = pattern.replace('*', '');
      memoryCache.keys().filter((k) => k.startsWith(prefix)).forEach((k) => memoryCache.del(k));
    }
  } catch (err) {
    console.warn(`Cache DEL_PATTERN error (${pattern}): ${err.message}`);
  }
};

const flush = async () => {
  try {
    if (cacheType === 'redis') await redisFlush();
    if (cacheType === 'memory' && memoryCache) memoryCache.flushAll();
    console.log('Cache flushed');
  } catch (err) {
    console.warn(`Cache FLUSH error: ${err.message}`);
  }
};

const getStats = () => {
  if (cacheType === 'redis') {
    return {
      type: upstashClient ? 'upstash-redis' : 'ioredis',
      status: upstashClient ? 'ready' : (redisClient?.status || 'unknown'),
    };
  }
  if (cacheType === 'memory' && memoryCache) {
    const stats = memoryCache.getStats();
    const total = stats.hits + stats.misses;
    return {
      type: 'memory',
      keys: memoryCache.keys().length,
      hits: stats.hits,
      misses: stats.misses,
      hitRate: total > 0 ? ((stats.hits / total) * 100).toFixed(1) + '%' : '0%',
    };
  }
  return { type: 'none' };
};

const disconnect = async () => {
  if (redisClient) {
    try { await redisClient.quit(); } catch (_) {}
    console.log('Redis disconnected');
  }
};

module.exports = { initCache, get, set, del, delPattern, flush, getStats, disconnect, getCacheType: () => cacheType };
