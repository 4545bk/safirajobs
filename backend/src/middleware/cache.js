/**
 * Enhanced in-memory cache middleware
 * Features: TTL, ETag, hit rate tracking, stale-while-revalidate
 * Suitable for single-instance deployments (Render free tier)
 */

const logger = require('../utils/logger');

const cache = new Map();

// ===================
// Configuration
// ===================
const CONFIG = {
    DEFAULT_TTL: 5 * 60 * 1000,     // 5 minutes default
    STALE_TTL: 10 * 60 * 1000,      // Serve stale for 10 min while revalidating
    MAX_ENTRIES: 200,               // Max cached entries
    PRUNE_PERCENT: 0.2,             // Remove 20% when full
};

// ===================
// Statistics
// ===================
const stats = {
    hits: 0,
    misses: 0,
    staleHits: 0,
    sets: 0,
    invalidations: 0,
    startTime: Date.now(),
};

/**
 * Get current cache stats with hit rate
 */
const getStats = () => {
    const total = stats.hits + stats.misses;
    const hitRate = total > 0 ? ((stats.hits / total) * 100).toFixed(1) : 0;
    const uptimeHours = ((Date.now() - stats.startTime) / 1000 / 60 / 60).toFixed(2);

    return {
        entries: cache.size,
        maxEntries: CONFIG.MAX_ENTRIES,
        hits: stats.hits,
        misses: stats.misses,
        staleHits: stats.staleHits,
        hitRate: `${hitRate}%`,
        uptimeHours: parseFloat(uptimeHours),
    };
};

/**
 * Generate ETag from data
 */
const generateETag = (data) => {
    const str = JSON.stringify(data);
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return `"${Math.abs(hash).toString(16)}"`;
};

/**
 * Clear all cache entries
 */
const clearCache = () => {
    const count = cache.size;
    cache.clear();
    stats.invalidations += count;
    logger.info('Cache cleared', { entriesRemoved: count });
    return count;
};

/**
 * Remove oldest entries when cache is full (LRU-style)
 */
const pruneCache = () => {
    if (cache.size >= CONFIG.MAX_ENTRIES) {
        const removeCount = Math.ceil(CONFIG.MAX_ENTRIES * CONFIG.PRUNE_PERCENT);

        // Sort by last accessed time and remove oldest
        const entries = Array.from(cache.entries())
            .sort((a, b) => a[1].lastAccessed - b[1].lastAccessed)
            .slice(0, removeCount);

        entries.forEach(([key]) => cache.delete(key));
        logger.debug('Cache pruned', { entriesRemoved: removeCount });
    }
};

/**
 * Remove expired entries (garbage collection)
 */
const removeExpired = () => {
    const now = Date.now();
    let removed = 0;

    for (const [key, entry] of cache.entries()) {
        // Remove entries past stale threshold
        if (now > entry.expiry + CONFIG.STALE_TTL) {
            cache.delete(key);
            removed++;
        }
    }

    if (removed > 0) {
        logger.debug('Expired cache entries removed', { count: removed });
    }

    return removed;
};

// Run garbage collection every 5 minutes
setInterval(removeExpired, 5 * 60 * 1000);

/**
 * Cache middleware factory
 * @param {number} ttl - Time to live in milliseconds
 */
const cacheMiddleware = (ttl = CONFIG.DEFAULT_TTL) => {
    return (req, res, next) => {
        // Only cache GET requests
        if (req.method !== 'GET') {
            return next();
        }

        const key = req.originalUrl;
        const cached = cache.get(key);
        const now = Date.now();

        // Check for cached entry
        if (cached) {
            // Update last accessed for LRU
            cached.lastAccessed = now;

            // Check ETag for 304 Not Modified
            const clientETag = req.headers['if-none-match'];
            if (clientETag && clientETag === cached.etag) {
                stats.hits++;
                return res.status(304).end();
            }

            // Fresh cache - return immediately
            if (now < cached.expiry) {
                stats.hits++;
                res.set('X-Cache', 'HIT');
                res.set('ETag', cached.etag);
                res.set('Cache-Control', `max-age=${Math.floor((cached.expiry - now) / 1000)}`);
                return res.json(cached.data);
            }

            // Stale cache - return stale while allowing revalidation
            if (now < cached.expiry + CONFIG.STALE_TTL) {
                stats.staleHits++;
                res.set('X-Cache', 'STALE');
                res.set('ETag', cached.etag);
                return res.json(cached.data);
            }
        }

        // Cache MISS
        stats.misses++;

        // Store original json method
        const originalJson = res.json.bind(res);

        // Override json to cache successful responses
        res.json = (data) => {
            if (res.statusCode === 200 && data?.success) {
                pruneCache();

                const etag = generateETag(data);
                const entry = {
                    data,
                    etag,
                    expiry: now + ttl,
                    cachedAt: new Date().toISOString(),
                    lastAccessed: now,
                };

                cache.set(key, entry);
                stats.sets++;

                res.set('X-Cache', 'MISS');
                res.set('ETag', etag);
                res.set('Cache-Control', `max-age=${Math.floor(ttl / 1000)}`);
            }

            return originalJson(data);
        };

        next();
    };
};

/**
 * Invalidate cache entries matching a pattern
 * @param {string} pattern - Pattern to match (string contains)
 */
const invalidatePattern = (pattern) => {
    let count = 0;
    for (const key of cache.keys()) {
        if (key.includes(pattern)) {
            cache.delete(key);
            count++;
        }
    }
    stats.invalidations += count;
    logger.info('Cache pattern invalidated', { pattern, entriesRemoved: count });
    return count;
};

/**
 * Get a specific cache entry (for debugging)
 */
const getCacheEntry = (key) => {
    const entry = cache.get(key);
    if (!entry) return null;

    return {
        key,
        etag: entry.etag,
        cachedAt: entry.cachedAt,
        expiresAt: new Date(entry.expiry).toISOString(),
        isExpired: Date.now() > entry.expiry,
        isStale: Date.now() > entry.expiry + CONFIG.STALE_TTL,
    };
};

module.exports = {
    cacheMiddleware,
    clearCache,
    getStats,
    invalidatePattern,
    getCacheEntry,
    removeExpired,
    CONFIG,
};
