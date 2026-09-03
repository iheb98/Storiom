/**
 * Storefront Router — Server-Side Rendered store pages for SEO
 *
 * Only activated for custom domain requests (req.isCustomDomain && req.resolvedStore).
 * Renders full HTML pages with EJS templates so search engines can index store content.
 *
 * Routes:
 *   GET /              → Store landing page
 *   GET /products      → Product listing with filters
 *   GET /product/:id   → Individual product detail
 *
 * Interactive routes (cart, login, account) are NOT handled here —
 * they fall through to the Angular SPA.
 */

const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const { Store, Product, Category, Address, Brand, StoreCategoryVisibility } = require('../models');

// CDN URL for R2-hosted images
const CDN_URL = process.env.CDN_URL || 'https://storiom-r2-worker.storiom.workers.dev';

// FA4 icon mapping (same as Angular component)
const ICON_MAP = {
    truck: 'fa-truck', shield: 'fa-shield', refresh: 'fa-refresh',
    headset: 'fa-headphones', star: 'fa-star', heart: 'fa-heart',
    gift: 'fa-gift', bolt: 'fa-bolt', leaf: 'fa-leaf',
    gem: 'fa-diamond', check: 'fa-check'
};

/**
 * Resolve image URL — full URLs stay as-is, relative paths get CDN prefix
 */
function resolveImage(path) {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    return `${CDN_URL}/${path}`;
}

/**
 * Extract product image URL from the images JSON field
 */
function getProductImage(product) {
    let images = product.images;
    if (!images) return '';
    if (typeof images === 'string') {
        try { images = JSON.parse(images); } catch { return ''; }
    }
    if (!Array.isArray(images) || images.length === 0) return '';
    const idx = product.mainImageIndex || 0;
    const img = images[idx < images.length ? idx : 0];
    return resolveImage(img?.url || img);
}

/**
 * Get all product image URLs
 */
function getAllProductImages(product) {
    let images = product.images;
    if (!images) return [];
    if (typeof images === 'string') {
        try { images = JSON.parse(images); } catch { return []; }
    }
    if (!Array.isArray(images)) return [];
    return images.map(img => resolveImage(img?.url || img));
}

/**
 * Build common template data from store
 */
function buildStoreData(store, protocol, host) {
    const storeData = store.toJSON ? store.toJSON() : store;
    const theme = storeData.theme || {};
    const seo = theme.seo || {};
    const hero = theme.hero || {};
    const social = theme.social || {};
    const footer = theme.footer || {};
    const sections = theme.sections || {};
    const usps = theme.usps || {};
    const about = theme.about || {};
    const announcement = theme.announcement || {};

    // Address
    const addr = storeData.address || {};
    const addressParts = [addr.street, addr.city, addr.postalCode].filter(Boolean);
    const storeCity = [addr.city, addr.state].filter(Boolean).join(', ');

    // Logo
    const storeLogo = storeData.logo ? resolveImage(storeData.logo) : '';

    // Hero images
    const heroImages = hero.images && hero.images.length > 0
        ? hero.images
        : (hero.backgroundImage ? [hero.backgroundImage] : []);

    // OG image priority: SEO setting > hero bg > store logo
    let ogImage = seo.ogImage || '';
    if (!ogImage && heroImages.length > 0) ogImage = heroImages[0];
    if (!ogImage && storeData.logo) ogImage = storeData.logo;
    ogImage = resolveImage(ogImage);

    return {
        storeName: storeData.name || 'Boutique',
        storeDescription: storeData.description || '',
        storePhone: storeData.phone || '',
        storeEmail: storeData.email || '',
        storeSite: storeData.site || '',
        storeAddress: addressParts.join(', '),
        storeCity,
        storeLogo,
        storeId: storeData.id,

        // Theme
        primaryColor: theme.primaryColor || '#4f46e5',
        accentColor: theme.accentColor || '#f59e0b',
        fontFamily: theme.fontFamily || 'Inter',
        mode: theme.mode || 'light',

        // Sections
        hero, sections, usps, about, announcement, footer,
        heroImages,
        heroTitle: hero.title || storeData.name || '',
        heroSubtitle: hero.subtitle || storeData.description || '',
        heroCta: hero.ctaText || 'Découvrir nos produits',
        ogImage,
        seo,

        // Social
        socialFacebook: social.facebook || '',
        socialInstagram: social.instagram || '',
        socialTiktok: social.tiktok || '',

        // Helpers
        cdnUrl: CDN_URL,
        iconMap: ICON_MAP,

        // Footer defaults
        footer: {
            bgColor: footer.bgColor || '#0f172a',
            textColor: footer.textColor || '#94a3b8',
            text: footer.text || '',
            showContact: footer.showContact !== false,
            showSocial: footer.showSocial !== false,
            showQuickLinks: footer.showQuickLinks !== false
        }
    };
}


// ═══════════════════════════════════════════════
//  GET / — Store Landing Page
// ═══════════════════════════════════════════════
router.get('/', async (req, res) => {
    try {
        const store = req.resolvedStore;
        const protocol = req.headers['x-forwarded-proto'] || 'https';
        const host = req.headers.host;
        const data = buildStoreData(store, protocol, host);

        // Featured products (8 most recent)
        const products = await Product.findAll({
            where: {
                storeId: store.id,
                isVisible: true,
                toDisplayStore: true
            },
            order: [['createdAt', 'DESC']],
            limit: 8,
            raw: true
        });

        // Attach image URLs
        products.forEach(p => { p._image = getProductImage(p); });

        // Categories — match the public.js logic (static visible + store custom)
        const visibilityRecords = await StoreCategoryVisibility.findAll({
            where: { storeId: store.id },
            attributes: ['categoryId', 'visible'],
            raw: true
        });
        const visibilityMap = {};
        visibilityRecords.forEach(r => { visibilityMap[r.categoryId] = r.visible; });

        const staticCategories = await Category.findAll({
            where: { parentCategoryId: null, static: true },
            raw: true
        });
        const customCategories = await Category.findAll({
            where: { storeId: store.id, parentCategoryId: null, static: { [Op.not]: true } },
            raw: true
        });
        const categories = [
            ...staticCategories.filter(c => visibilityMap[c.id] !== false),
            ...customCategories
        ].slice(0, 8);

        // SEO
        const title = data.seo.metaTitle || data.storeName;
        const description = data.seo.metaDescription
            || (data.storeDescription ? data.storeDescription.substring(0, 160) : `Découvrez ${data.storeName}`);
        const canonicalUrl = `${protocol}://${host}/`;

        // JSON-LD structured data
        const jsonLd = {
            '@context': 'https://schema.org',
            '@type': 'Store',
            name: data.storeName,
            description: description,
            url: canonicalUrl,
            ...(data.storeLogo && { logo: data.storeLogo }),
            ...(data.storePhone && { telephone: data.storePhone }),
            ...(data.storeEmail && { email: data.storeEmail }),
            ...(data.storeAddress && {
                address: {
                    '@type': 'PostalAddress',
                    streetAddress: store.address?.street || '',
                    addressLocality: store.address?.city || '',
                    postalCode: store.address?.postalCode || ''
                }
            })
        };

        res.render('store-landing', {
            ...data,
            products,
            categories,
            title,
            description,
            canonicalUrl,
            jsonLd
        });

    } catch (err) {
        console.error('Storefront landing error:', err);
        res.status(500).send('Une erreur est survenue.');
    }
});


// ═══════════════════════════════════════════════
//  GET /products — Product Listing
// ═══════════════════════════════════════════════
router.get('/products', async (req, res) => {
    try {
        const store = req.resolvedStore;
        const protocol = req.headers['x-forwarded-proto'] || 'https';
        const host = req.headers.host;
        const data = buildStoreData(store, protocol, host);

        const selectedCategory = req.query.category ? parseInt(req.query.category) : null;
        const currentPage = req.query.page ? parseInt(req.query.page) : 0;
        const pageSize = 24;

        // Build where clause
        const where = {
            storeId: store.id,
            isVisible: true,
            toDisplayStore: true
        };

        if (selectedCategory) {
            // Get all descendant category IDs
            const allCatIds = await getAllCategoryIds(selectedCategory);
            where.categoryId = { [Op.in]: allCatIds };
        }

        // Products
        const { rows: products, count: productCount } = await Product.findAndCountAll({
            where,
            order: [['createdAt', 'DESC']],
            limit: pageSize,
            offset: currentPage * pageSize,
            raw: true
        });

        products.forEach(p => { p._image = getProductImage(p); });

        // Categories for filter chips — same visibility logic
        const visibilityRecords = await StoreCategoryVisibility.findAll({
            where: { storeId: store.id },
            attributes: ['categoryId', 'visible'],
            raw: true
        });
        const visibilityMap = {};
        visibilityRecords.forEach(r => { visibilityMap[r.categoryId] = r.visible; });

        const staticCats = await Category.findAll({
            where: { parentCategoryId: null, static: true },
            raw: true
        });
        const customCats = await Category.findAll({
            where: { storeId: store.id, parentCategoryId: null, static: { [Op.not]: true } },
            raw: true
        });
        const categories = [
            ...staticCats.filter(c => visibilityMap[c.id] !== false),
            ...customCats
        ];

        // Selected category name
        let selectedCategoryName = '';
        if (selectedCategory) {
            const cat = categories.find(c => c.id === selectedCategory);
            selectedCategoryName = cat ? cat.name : '';
        }

        const title = `Produits${selectedCategoryName ? ' - ' + selectedCategoryName : ''} | ${data.storeName}`;
        const description = `Découvrez tous les produits de ${data.storeName}${selectedCategoryName ? ' dans la catégorie ' + selectedCategoryName : ''}.`;
        const canonicalUrl = `${protocol}://${host}/products${selectedCategory ? '?category=' + selectedCategory : ''}`;

        res.render('store-products', {
            ...data,
            products,
            categories,
            productCount,
            currentPage,
            pageSize,
            selectedCategory,
            selectedCategoryName,
            title,
            description,
            canonicalUrl
        });

    } catch (err) {
        console.error('Storefront products error:', err);
        res.status(500).send('Une erreur est survenue.');
    }
});


// ═══════════════════════════════════════════════
//  GET /product/:id — Product Detail
// ═══════════════════════════════════════════════
router.get('/product/:id', async (req, res) => {
    try {
        const store = req.resolvedStore;
        const protocol = req.headers['x-forwarded-proto'] || 'https';
        const host = req.headers.host;
        const data = buildStoreData(store, protocol, host);

        const product = await Product.findOne({
            where: {
                id: req.params.id,
                isVisible: true,
                toDisplayStore: true,
                storeId: store.id
            },
            include: [
                { model: Brand, as: 'brand', attributes: ['name'] },
                { model: Category, as: 'category', attributes: ['id', 'name'] }
            ]
        });

        if (!product) {
            return res.redirect('/products');
        }

        const productData = product.toJSON ? product.toJSON() : product;
        const mainImage = getProductImage(productData);
        const allImages = getAllProductImages(productData);
        const categoryName = productData.category?.name || '';

        const title = `${productData.name} | ${data.storeName}`;
        const description = productData.description
            ? productData.description.replace(/<[^>]*>/g, '').substring(0, 160)
            : `Découvrez ${productData.name} sur ${data.storeName}${productData.sellingPrice ? ' — ' + productData.sellingPrice.toFixed(2) + ' DT' : ''}`;
        const canonicalUrl = `${protocol}://${host}/product/${productData.id}`;
        const ogImage = mainImage || data.ogImage;

        // JSON-LD Product schema
        const jsonLd = {
            '@context': 'https://schema.org',
            '@type': 'Product',
            name: productData.name,
            description: description,
            url: canonicalUrl,
            ...(mainImage && { image: mainImage }),
            ...(productData.brand && { brand: { '@type': 'Brand', name: productData.brand.name } }),
            offers: {
                '@type': 'Offer',
                price: productData.sellingPrice || 0,
                priceCurrency: 'TND',
                availability: productData.quantity > 0
                    ? 'https://schema.org/InStock'
                    : 'https://schema.org/OutOfStock',
                seller: { '@type': 'Organization', name: data.storeName }
            }
        };

        res.render('store-product', {
            ...data,
            product: productData,
            mainImage,
            allImages,
            categoryName,
            title,
            description,
            canonicalUrl,
            ogImage,
            jsonLd
        });

    } catch (err) {
        console.error('Storefront product detail error:', err);
        res.status(500).send('Une erreur est survenue.');
    }
});


/**
 * Recursively collect all descendant category IDs for filtering
 */
async function getAllCategoryIds(parentId) {
    const ids = [parentId];
    const queue = [parentId];
    while (queue.length > 0) {
        const id = queue.shift();
        const children = await Category.findAll({
            where: { parentCategoryId: id },
            attributes: ['id'],
            raw: true
        });
        for (const child of children) {
            ids.push(child.id);
            queue.push(child.id);
        }
    }
    return ids;
}


module.exports = router;
