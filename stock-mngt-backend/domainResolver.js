/**
 * Domain Resolver Middleware
 * 
 * Detects if the request is coming from a custom domain (e.g. store1.com)
 * and resolves it to the corresponding store. Attaches the store to req.resolvedStore.
 * 
 * If the request is from the main Storiom domain or localhost, it passes through normally.
 */
const { Store, Address } = require('./models');

// Domains that are "ours" — not custom store domains
const PLATFORM_DOMAINS = [
    'storiom.com',
    'www.storiom.com',
    'localhost',
    '127.0.0.1',
    '161.97.186.60'
];

// Cache resolved domains to avoid DB lookups on every request
const domainCache = new Map();
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes
const MAX_CACHE_SIZE = 500;        // Prevent memory leaks from domain scan attacks

// Stats
const domainCacheStats = { hits: 0, misses: 0 };

function isPlatformDomain(host) {
    // Remove port number if present
    const hostname = host.split(':')[0];
    return PLATFORM_DOMAINS.includes(hostname);
}

async function resolveDomain(hostname) {
    // Check cache first
    const cached = domainCache.get(hostname);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        domainCacheStats.hits++;
        return cached.store;
    }

    domainCacheStats.misses++;

    // Look up in database
    const store = await Store.findOne({
        where: {
            customDomain: hostname,
            domainVerified: true,
            active: true
        },
        include: [{ model: Address, as: 'address' }]
    });

    // Evict oldest entry if cache is full (LRU-style)
    if (domainCache.size >= MAX_CACHE_SIZE) {
        const oldestKey = domainCache.keys().next().value;
        domainCache.delete(oldestKey);
    }

    // Cache the result (even null to avoid repeated DB lookups for invalid domains)
    domainCache.set(hostname, {
        store: store || null,
        timestamp: Date.now()
    });

    return store || null;
}

// Clear cache for a specific domain (called when domain settings change)
function clearDomainCache(hostname) {
    domainCache.delete(hostname);
}

// Clear entire cache
function clearAllDomainCache() {
    domainCache.clear();
}

// Get domain cache stats
function getDomainCacheStats() {
    return {
        size: domainCache.size,
        maxSize: MAX_CACHE_SIZE,
        ttlMinutes: CACHE_TTL / 60000,
        ...domainCacheStats,
        hitRate: domainCacheStats.hits + domainCacheStats.misses > 0
            ? ((domainCacheStats.hits / (domainCacheStats.hits + domainCacheStats.misses)) * 100).toFixed(1) + '%'
            : '0%'
    };
}

const domainResolver = async (req, res, next) => {
    try {
        const host = req.headers.host || req.headers['x-forwarded-host'] || '';
        const hostname = host.split(':')[0]; // Remove port

        // If it's our platform domain, skip resolution
        if (isPlatformDomain(host)) {
            req.resolvedStore = null;
            req.isCustomDomain = false;
            return next();
        }

        // Try to resolve the custom domain
        const store = await resolveDomain(hostname);

        if (store) {
            req.resolvedStore = store;
            req.isCustomDomain = true;
        } else {
            req.resolvedStore = null;
            req.isCustomDomain = false;
            // Don't block the request — the frontend will handle "domain not found"
        }

        next();
    } catch (err) {
        console.error('Domain resolver error:', err);
        // Don't block the app on resolver errors
        req.resolvedStore = null;
        req.isCustomDomain = false;
        next();
    }
};

module.exports = { domainResolver, clearDomainCache, clearAllDomainCache, isPlatformDomain, getDomainCacheStats };
