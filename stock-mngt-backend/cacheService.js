/**
 * Cache Service — Centralized in-memory caching with node-cache
 * 
 * Provides named cache buckets with different TTLs for different data types.
 * Uses a getOrSet pattern: cache-miss triggers the fetch function, cache-hit returns instantly.
 * 
 * Usage:
 *   const { getOrSet, invalidate, invalidatePattern } = require('./cacheService');
 *   
 *   // Cache a DB query result for 5 minutes
 *   const data = await getOrSet('subscriptions', `user:${userId}`, async () => {
 *       return await User.findOne({ where: { id: userId }, include: ['subscription'] });
 *   });
 *   
 *   // Invalidate a specific key
 *   invalidate('subscriptions', `user:${userId}`);
 *   
 *   // Invalidate all keys matching a pattern in a bucket
 *   invalidatePattern('storefront', `store:${storeId}`);
 */

const NodeCache = require('node-cache');

// Cache bucket configurations (TTL in seconds)
const CACHE_CONFIG = {
    subscriptions:   { ttl: 300,  maxKeys: 1000,  checkperiod: 60  },  // 5 min
    categories:      { ttl: 1800, maxKeys: 200,   checkperiod: 120 },  // 30 min
    brands:          { ttl: 1800, maxKeys: 500,   checkperiod: 120 },  // 30 min
    storeDetails:    { ttl: 600,  maxKeys: 200,   checkperiod: 60  },  // 10 min
    storefront:      { ttl: 300,  maxKeys: 500,   checkperiod: 60  },  // 5 min
    publicProducts:  { ttl: 300,  maxKeys: 1000,  checkperiod: 60  },  // 5 min
    analytics:       { ttl: 600,  maxKeys: 500,   checkperiod: 60  },  // 10 min
};

// Create cache instances
const caches = {};
for (const [name, config] of Object.entries(CACHE_CONFIG)) {
    caches[name] = new NodeCache({
        stdTTL: config.ttl,
        maxKeys: config.maxKeys,
        checkperiod: config.checkperiod,
        useClones: false,  // Better performance — don't clone objects on get
        deleteOnExpire: true
    });
}

// Stats tracking
const stats = {
    hits: 0,
    misses: 0,
    invalidations: 0
};

/**
 * Get a value from cache, or set it if not present.
 * @param {string} bucket - Cache bucket name (e.g., 'subscriptions', 'categories')
 * @param {string} key - Cache key
 * @param {Function} fetchFn - Async function to fetch the data on cache miss
 * @param {number} [customTtl] - Optional custom TTL in seconds (overrides bucket default)
 * @returns {Promise<any>} The cached or freshly fetched data
 */
async function getOrSet(bucket, key, fetchFn, customTtl) {
    const cache = caches[bucket];
    if (!cache) {
        console.warn(`[Cache] Unknown bucket: ${bucket}, bypassing cache`);
        return await fetchFn();
    }

    const cached = cache.get(key);
    if (cached !== undefined) {
        stats.hits++;
        return cached;
    }

    stats.misses++;
    const data = await fetchFn();
    
    if (data !== undefined && data !== null) {
        if (customTtl !== undefined) {
            cache.set(key, data, customTtl);
        } else {
            cache.set(key, data);
        }
    }

    return data;
}

/**
 * Invalidate a specific key in a bucket
 */
function invalidate(bucket, key) {
    const cache = caches[bucket];
    if (cache) {
        cache.del(key);
        stats.invalidations++;
    }
}

/**
 * Invalidate all keys in a bucket that start with a given prefix
 */
function invalidatePattern(bucket, prefix) {
    const cache = caches[bucket];
    if (!cache) return;

    const keys = cache.keys();
    const matchingKeys = keys.filter(k => k.startsWith(prefix));
    if (matchingKeys.length > 0) {
        cache.del(matchingKeys);
        stats.invalidations += matchingKeys.length;
    }
}

/**
 * Flush an entire bucket
 */
function flushBucket(bucket) {
    const cache = caches[bucket];
    if (cache) {
        const count = cache.getStats().keys;
        cache.flushAll();
        stats.invalidations += count;
    }
}

/**
 * Get cache statistics for monitoring
 */
function getStats() {
    const bucketStats = {};
    for (const [name, cache] of Object.entries(caches)) {
        const s = cache.getStats();
        bucketStats[name] = {
            keys: s.keys,
            hits: s.hits,
            misses: s.misses,
            ksize: s.ksize,
            vsize: s.vsize
        };
    }

    return {
        global: {
            hits: stats.hits,
            misses: stats.misses,
            invalidations: stats.invalidations,
            hitRate: stats.hits + stats.misses > 0
                ? ((stats.hits / (stats.hits + stats.misses)) * 100).toFixed(1) + '%'
                : '0%'
        },
        buckets: bucketStats
    };
}

module.exports = {
    getOrSet,
    invalidate,
    invalidatePattern,
    flushBucket,
    getStats
};
