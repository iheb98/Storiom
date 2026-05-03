/**
 * Open Graph Tags Middleware
 * 
 * Serves minimal HTML with proper OG/Twitter meta tags to social media crawlers.
 * Facebook, Twitter, WhatsApp, etc. don't execute JavaScript, so Angular-rendered
 * meta tags are invisible to them. This middleware serves pre-rendered meta tags
 * directly from the database.
 * 
 * Nginx detects bot user-agents and proxies requests here instead of serving
 * the static Angular SPA.
 */

const express = require('express');
const router = express.Router();
const { Store, Product, Address } = require('./models');

// CDN URL for R2-hosted images
const CDN_URL = process.env.CDN_URL || 'https://storiom-r2-worker.storiom.workers.dev';
const PLATFORM_URL = 'https://storiom.com';

/**
 * Escape HTML special characters to prevent XSS in meta tags
 */
function escapeHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

/**
 * Resolve an image path to a full URL
 * - Full URLs (http/https) are returned as-is
 * - Relative paths get the CDN prefix
 */
function resolveImageUrl(imagePath) {
    if (!imagePath) return '';
    if (imagePath.startsWith('http')) return imagePath;
    return `${CDN_URL}/${imagePath}`;
}

/**
 * Build a minimal HTML page with OG tags
 */
function buildOgHtml({ title, description, image, url, type, siteName, extra }) {
    const safeTitle = escapeHtml(title);
    const safeDesc = escapeHtml(description);
    const safeImage = escapeHtml(image);
    const safeUrl = escapeHtml(url);
    const safeSiteName = escapeHtml(siteName || 'Storiom');

    let extraTags = '';
    if (extra) {
        for (const [key, value] of Object.entries(extra)) {
            if (value) {
                extraTags += `    <meta property="${escapeHtml(key)}" content="${escapeHtml(String(value))}" />\n`;
            }
        }
    }

    return `<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="utf-8" />
    <title>${safeTitle}</title>
    <meta name="description" content="${safeDesc}" />

    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="${escapeHtml(type || 'website')}" />
    <meta property="og:title" content="${safeTitle}" />
    <meta property="og:description" content="${safeDesc}" />
    <meta property="og:url" content="${safeUrl}" />
    <meta property="og:site_name" content="${safeSiteName}" />
${safeImage ? `    <meta property="og:image" content="${safeImage}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />\n` : ''}
    <!-- Twitter Card -->
    <meta name="twitter:card" content="${safeImage ? 'summary_large_image' : 'summary'}" />
    <meta name="twitter:title" content="${safeTitle}" />
    <meta name="twitter:description" content="${safeDesc}" />
${safeImage ? `    <meta name="twitter:image" content="${safeImage}" />\n` : ''}
${extraTags}
    <!-- Canonical URL -->
    <link rel="canonical" href="${safeUrl}" />
</head>
<body>
    <h1>${safeTitle}</h1>
    <p>${safeDesc}</p>
    <noscript>
        <p>Visitez <a href="${safeUrl}">${safeUrl}</a> pour voir cette page.</p>
    </noscript>
    <script>
        // Non-bot visitors who somehow reach this page get redirected to the real SPA
        if (!/bot|crawl|spider|facebook|twitter|whatsapp|telegram|slack|discord|pinterest|linkedin/i.test(navigator.userAgent)) {
            window.location.replace(window.location.href);
        }
    </script>
</body>
</html>`;
}

/**
 * Extract store ID from various URL patterns:
 *  - /preview-store/:storeId
 *  - /preview-store/:storeId/product/:productId
 *  - /store-home/product/:productId  (custom domain — store resolved from Host)
 */
function parseUrl(path) {
    const result = { storeId: null, productId: null, isStoreLanding: false };

    // /preview-store/:storeId/product/:productId
    let match = path.match(/\/preview-store\/(\d+)\/product\/(\d+)/);
    if (match) {
        result.storeId = parseInt(match[1]);
        result.productId = parseInt(match[2]);
        return result;
    }

    // /preview-store/:storeId (landing)
    match = path.match(/\/preview-store\/(\d+)/);
    if (match) {
        result.storeId = parseInt(match[1]);
        result.isStoreLanding = true;
        return result;
    }

    // /store-home/product/:productId (custom domain)
    match = path.match(/\/store-home\/product\/(\d+)/);
    if (match) {
        result.productId = parseInt(match[1]);
        return result;
    }

    // /store-home or / (custom domain landing)
    if (path === '/' || path === '/store-home' || path.startsWith('/store-home')) {
        result.isStoreLanding = true;
        return result;
    }

    return result;
}

/**
 * Main OG tags handler
 */
router.get('*', async (req, res) => {
    try {
        const requestPath = req.query.path || req.path || '/';
        const host = req.headers.host || req.headers['x-forwarded-host'] || 'storiom.com';
        const protocol = req.headers['x-forwarded-proto'] || 'https';
        const fullUrl = `${protocol}://${host}${requestPath}`;
        const parsed = parseUrl(requestPath);

        // ========================================
        // 1. Resolve the store
        // ========================================
        let store = null;

        if (parsed.storeId) {
            // Direct store ID from URL
            store = await Store.findOne({
                where: { id: parsed.storeId, active: true },
                include: [{ model: Address, as: 'address' }],
                raw: false
            });
        } else if (req.resolvedStore) {
            // Custom domain — already resolved by domainResolver middleware
            store = req.resolvedStore;
        } else {
            // Try resolving from Host header (custom domain not yet resolved in this middleware chain)
            const { isPlatformDomain } = require('./domainResolver');
            if (!isPlatformDomain(host)) {
                const hostname = host.split(':')[0];
                store = await Store.findOne({
                    where: { customDomain: hostname, domainVerified: true, active: true },
                    include: [{ model: Address, as: 'address' }],
                    raw: false
                });
            }
        }

        // ========================================
        // 2. Product page
        // ========================================
        if (parsed.productId) {
            const product = await Product.findOne({
                where: { id: parsed.productId, isVisible: true },
                include: [{ model: Store, as: 'store' }],
                raw: false
            });

            if (product) {
                const productData = product.toJSON ? product.toJSON() : product;
                const storeName = store?.name || productData.store?.name || 'Storiom';
                const images = productData.images || [];
                const mainImageIndex = productData.mainImageIndex || 0;
                const productImage = images.length > mainImageIndex
                    ? resolveImageUrl(images[mainImageIndex]?.url || images[mainImageIndex])
                    : (images.length > 0 ? resolveImageUrl(images[0]?.url || images[0]) : '');

                const productPrice = productData.sellingPrice
                    ? `${productData.sellingPrice.toFixed(2)} ${productData.currency || 'DT'}`
                    : '';

                const title = `${productData.name} | ${storeName}`;
                const desc = productData.description
                    ? productData.description.substring(0, 200)
                    : `Découvrez ${productData.name} sur ${storeName}${productPrice ? ` — ${productPrice}` : ''}`;

                return res.send(buildOgHtml({
                    title,
                    description: desc,
                    image: productImage,
                    url: fullUrl,
                    type: 'product',
                    siteName: storeName,
                    extra: {
                        'product:price:amount': productData.sellingPrice || '',
                        'product:price:currency': productData.currency || 'TND'
                    }
                }));
            }
        }

        // ========================================
        // 3. Store landing page
        // ========================================
        if (store) {
            const storeData = store.toJSON ? store.toJSON() : store;
            const theme = storeData.theme || {};
            const seo = theme.seo || {};

            const title = seo.metaTitle || storeData.name || 'Boutique';
            const desc = seo.metaDescription
                || (storeData.description ? storeData.description.substring(0, 200) : `Découvrez ${storeData.name} sur Storiom`);

            // OG image priority: SEO setting > hero background > store logo
            let ogImage = seo.ogImage || '';
            if (!ogImage && theme.hero?.backgroundImage) {
                ogImage = theme.hero.backgroundImage;
            }
            if (!ogImage && theme.hero?.images?.length > 0) {
                ogImage = theme.hero.images[0];
            }
            if (!ogImage && storeData.logo) {
                ogImage = storeData.logo;
            }
            ogImage = resolveImageUrl(ogImage);

            return res.send(buildOgHtml({
                title,
                description: desc,
                image: ogImage,
                url: fullUrl,
                type: 'website',
                siteName: storeData.name
            }));
        }

        // ========================================
        // 4. Fallback: Main platform (storiom.com)
        // ========================================
        return res.send(buildOgHtml({
            title: 'Storiom — Créez votre boutique en ligne gratuitement',
            description: 'Storiom est la plateforme tunisienne de gestion de stock et de vente en ligne. Créez votre boutique, gérez vos produits et vendez en quelques clics.',
            image: `${PLATFORM_URL}/assets/og-image.png`,
            url: fullUrl,
            type: 'website',
            siteName: 'Storiom'
        }));

    } catch (err) {
        console.error('OG Tags middleware error:', err);
        // On error, still return basic OG tags so sharing doesn't completely fail
        res.send(buildOgHtml({
            title: 'Storiom',
            description: 'Plateforme de gestion de stock et boutique en ligne',
            image: '',
            url: `https://${req.headers.host || 'storiom.com'}${req.query.path || '/'}`,
            type: 'website',
            siteName: 'Storiom'
        }));
    }
});

module.exports = router;
