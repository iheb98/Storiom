/**
 * Storiom R2 CDN Worker
 * Serves files from Cloudflare R2 bucket with caching and CORS support
 */

export default {
    async fetch(request, env, ctx) {
        const url = new URL(request.url);
        const key = decodeURIComponent(url.pathname.slice(1)); // Remove leading slash and decode

        // Handle CORS preflight
        if (request.method === 'OPTIONS') {
            return handleCORS();
        }

        // Handle empty path or root
        if (!key || key === '') {
            return new Response('Storiom CDN - Ready', {
                status: 200,
                headers: corsHeaders()
            });
        }

        // Only allow GET and HEAD requests
        if (request.method !== 'GET' && request.method !== 'HEAD') {
            return new Response('Method Not Allowed', {
                status: 405,
                headers: corsHeaders()
            });
        }

        try {
            // Get object from R2
            const object = await env.BUCKET.get(key);

            if (!object) {
                return new Response('Not Found', {
                    status: 404,
                    headers: corsHeaders()
                });
            }

            // Build response headers
            const headers = new Headers();

            // Write R2 metadata headers (content-type, etc.)
            object.writeHttpMetadata(headers);

            // Add caching headers
            headers.set('etag', object.httpEtag);
            headers.set('Cache-Control', 'public, max-age=31536000, immutable'); // Cache for 1 year

            // Add CORS headers
            headers.set('Access-Control-Allow-Origin', '*');
            headers.set('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
            headers.set('Access-Control-Allow-Headers', 'Content-Type');

            // Add security headers
            headers.set('X-Content-Type-Options', 'nosniff');

            // Return the object
            return new Response(object.body, {
                headers,
                status: 200,
            });

        } catch (error) {
            console.error('Error fetching from R2:', error);
            return new Response('Internal Server Error', {
                status: 500,
                headers: corsHeaders()
            });
        }
    },
};

/**
 * CORS headers helper
 */
function corsHeaders() {
    return {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
    };
}

/**
 * Handle CORS preflight requests
 */
function handleCORS() {
    return new Response(null, {
        status: 204,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Access-Control-Max-Age': '86400', // Cache preflight for 24 hours
        },
    });
}
