/**
 * Cache service - Upstash Redis REST API only.
 * Uses fetch (no TCP sockets), works in serverless and local Node 18+.
 * If UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN are not set the app
 * still runs, but cache calls become safe no-ops.
 */

let client = null;
let ready = false;

const initCache = async () => {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    console.warn('Cache: UPSTASH_REDIS_REST_URL / TOKEN not set - caching disabled.');
    return;
  }

  const baseUrl = url.endsWith('/') ? url.slice(0, -1) : url;
  const headers = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };

  const request = async (command, ...args) => {
    const res = await fetch(baseUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify([command, ...args]),
    });
    if (!res.ok) throw new Error(`Upstash ${res.status}: ${await res.text()}`);
    return (await res.json()).result;
  };

  client = {
    get: (key) => request('GET', key),
    set: (key, value, ttlMs) => request('SET', key, value, 'PX', ttlMs),
    del: (...keys) => request('DEL', ...keys),
    keys: (pattern) => request('KEYS', pattern),
    flushdb: () => request('FLUSHDB'),
    ping: () => request('PING'),
  };

  try {
    await client.ping();
    ready = true;
    console.log(`Cache: Upstash Redis connected (${baseUrl})`);
  } catch (err) {
    client = null;
    ready = false;
    console.warn(`Cache: Upstash connection failed - ${err.message}. Caching disabled.`);
  }
};

const get = async (key) => {
  if (!ready) return null;
  try {
    const data = await client.get(key);
    return data ? JSON.parse(data) : null;
  } catch (err) {
    console.warn(`Cache GET error (${key}): ${err.message}`);
    return null;
  }
};

const set = async (key, value, ttlSeconds = 60) => {
  if (!ready) return;
  try {
    await client.set(key, JSON.stringify(value), ttlSeconds * 1000);
  } catch (err) {
    console.warn(`Cache SET error (${key}): ${err.message}`);
  }
};

const del = async (key) => {
  if (!ready) return;
  try {
    await client.del(key);
  } catch (err) {
    console.warn(`Cache DEL error (${key}): ${err.message}`);
  }
};

const delPattern = async (pattern) => {
  if (!ready) return;
  try {
    const keys = await client.keys(pattern);
    if (keys && keys.length > 0) {
      await client.del(...keys);
    }
  } catch (err) {
    console.warn(`Cache DEL_PATTERN error (${pattern}): ${err.message}`);
  }
};

const flush = async () => {
  if (!ready) return;
  try {
    await client.flushdb();
    console.log('Cache flushed');
  } catch (err) {
    console.warn(`Cache FLUSH error: ${err.message}`);
  }
};

const createScanSession = async (sessionId, payload, ttlSeconds = 10 * 60) => {
  await set(`scan:${sessionId}`, payload, ttlSeconds);
};

const getScanSession = async (sessionId) => get(`scan:${sessionId}`);
const deleteScanSession = async (sessionId) => del(`scan:${sessionId}`);

const getStats = () => ({
  type: ready ? 'upstash-redis' : 'disabled',
  status: ready ? 'connected' : 'not configured',
});

const getCacheType = () => (ready ? 'upstash-redis' : 'disabled');

const disconnect = async () => {};

module.exports = {
  initCache,
  get,
  set,
  del,
  delPattern,
  flush,
  createScanSession,
  getScanSession,
  deleteScanSession,
  getStats,
  getCacheType,
  disconnect,
};
