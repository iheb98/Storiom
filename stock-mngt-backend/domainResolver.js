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

// Cache resolved domains for 5 minutes to avoid DB lookups on every request
const domainCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

function isPlatformDomain(host) {
    // Remove port number if present
    const hostname = host.split(':')[0];
    return PLATFORM_DOMAINS.includes(hostname);
}

async function resolveDomain(hostname) {
    // Check cache first
    const cached = domainCache.get(hostname);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        return cached.store;
    }

    // Look up in database
    const store = await Store.findOne({
        where: {
            customDomain: hostname,
            domainVerified: true,
            active: true
        },
        include: [{ model: Address, as: 'address' }]
    });

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

module.exports = { domainResolver, clearDomainCache, clearAllDomainCache, isPlatformDomain };
