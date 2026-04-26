const express = require('express');
const router = express.Router();
const { Product, Category, Store, Supplier, Review, User, Address, ProductStats, Brand } = require('../models');
const { Op, Sequelize, where } = require('sequelize');
const utility = require('../utility');

// Helper: determine if request is in store context (custom domain or preview)
function isStoreContext(req) {
    return !!(req.resolvedStore || req.query.storeContext === 'true');
}

/**
 * @route   GET /api/public/products/random
 * @desc    Get a list of random products for the public homepage
 * @access  Public
 */
router.get('/products/random', async (req, res) => {
    const limit = req.query.limit ? parseInt(req.query.limit, 10) : 12;

    try {
        const products = await Product.findAll({
            where: {
                ...(isStoreContext(req) ? { toDisplayStore: true } : { toDisplay: true }),
                isVisible: true, // Only show visible products
                //quantity: { [Op.gt]: 0 } // Only show products that are in stock
            },
            order: Sequelize.literal('RANDOM()'), // This works for PostgreSQL and SQLite
            limit: limit,
            include: [
                {
                    model: Store,
                    as: 'store',
                    attributes: ['name', 'isSupportingDeliveries', 'id'],
                    where: { isVisibleToPublic: true, active: true },
                    required: true,
                    include: [
                        { model: Address, as: 'address', attributes: ['state', 'city'] }
                    ]
                },
                { model: Review, as: 'reviews', attributes: ['rating'] }
            ]
        });
        res.json(products);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
});

/**
 * @route   GET /api/public/categories/tree
 * @desc    Get categories as a tree. If storeId is passed, returns store-visible categories.
 * @access  Public
 */
router.get('/categories/tree', async (req, res) => {
    try {
        const storeId = req.query.storeId || (req.resolvedStore ? req.resolvedStore.id : null);

        const subCategoryInclude = {
            model: Category,
            as: 'subCategories',
            include: {
                model: Category,
                as: 'subCategories',
                include: {
                    model: Category,
                    as: 'subCategories',
                    include: { model: Category, as: 'subCategories' }
                }
            }
        };

        if (storeId) {
            // Store context: get visible static categories + store's custom categories
            const { StoreCategoryVisibility } = require('../models');

            // Get visibility overrides for this store
            const visibilityRecords = await StoreCategoryVisibility.findAll({
                where: { storeId },
                attributes: ['categoryId', 'visible']
            });
            const visibilityMap = {};
            visibilityRecords.forEach(r => { visibilityMap[r.categoryId] = r.visible; });

            // Get static categories (global)
            const staticCategories = await Category.findAll({
                where: { parentCategoryId: null, static: true },
                include: [subCategoryInclude]
            });

            // Get store's custom categories (non-static, belonging to this store)
            const customCategories = await Category.findAll({
                where: { storeId, parentCategoryId: null, static: { [Op.not]: true } },
                include: [subCategoryInclude]
            });

            // Filter static categories: only include if visible (default: visible if no override)
            const visibleStaticCategories = staticCategories.filter(cat => {
                return visibilityMap[cat.id] !== false; // visible unless explicitly set to false
            });

            res.json([...visibleStaticCategories, ...customCategories]);
        } else {
            // Marketplace: only static categories
            const categories = await Category.findAll({
                where: { parentCategoryId: null, static: true },
                include: [subCategoryInclude]
            });
            res.json(categories);
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
});

/**
 * @route   GET /api/public/products/search
 * @desc    Search for products by name or description
 * @access  Public
 */
router.get('/products/search', async (req, res) => {
    const query = req.query.q || '';

    try {
        const products = await Product.findAll({
            where: {
                ...(isStoreContext(req) ? { toDisplayStore: true } : { toDisplay: true }),
                [Op.or]: [
                    { name: { [Op.iLike]: `%${query}%` } },
                    { description: { [Op.iLike]: `%${query}%` } }
                ]
            },
            limit: 20, // Limit search results
            include: [
                { model: Review, as: 'reviews', attributes: ['rating'] },
                {
                    model: Store,
                    as: 'store',
                    attributes: ['name', 'isSupportingDeliveries'],
                    where: { isVisibleToPublic: true, active: true },
                    required: true
                }
            ]
        });
        res.json(products);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
});

/**
 * Recursive function to get all descendant category IDs
 */
async function getAllCategoryIds(CategoryModel, parentCategoryId) {
    const ids = [parentCategoryId];

    async function getChildren(id) {
        const children = await CategoryModel.findAll({
            where: { parentCategoryId: id },
            attributes: ['id']
        });
        for (const child of children) {
            ids.push(child.id);
            await getChildren(child.id);
        }
    }

    await getChildren(parentCategoryId);
    return ids;
}

/**
 * GET /store/:id/products
 * Query params:
 * - page
 * - size
 * - searchable
 * - categoryId (optional, parent category)
 * - query (optional, filters built by utility.buildQuery)
 */

function extractAndRemoveCategoryId(query) {
    // 1. Extract categoryId value
    const match = query.match(/categoryId\s*=\s*(\d+)/);
    const categoryId = match ? match[1] : null;

    // 2. Remove the "categoryId = X," part (with or without comma/extra spaces)
    const cleaned = query
        .replace(/,\s*categoryId\s*=\s*\d+|categoryId\s*=\s*\d+\s*,?/g, '') // remove the segment
        .replace(/\s{2,}/g, ' ')                                           // fix double spaces
        .trim()
        .replace(/,\s*,/g, ',');                                           // fix leftover commas

    return { categoryId, cleaned };
}


router.get('/allStores/products', async (req, res) => {
    try {
        // If on a custom domain, auto-scope to that store
        if (req.resolvedStore) {
            req.query.query = (req.query.query || '') + (req.query.query ? ',' : '') + `storeId = '${req.resolvedStore.id}'`;
        }
        // -------------------------------
        // 0. Pagination
        // -------------------------------
        const pagination = {
            page: parseInt(req.query.page) || 0,
            pageSize: parseInt(req.query.size) || 24
        };

        // -------------------------------
        // 1. Default Order
        // -------------------------------
        let order = [['createdAt', 'DESC']];

        // -------------------------------
        // 2. Sorting logic
        // -------------------------------
        if (req.query.sort) {
            switch (req.query.sort) {
                case "priceAsc":
                    order = [['sellingPrice', 'ASC']];
                    break;

                case "priceDesc":
                    order = [['sellingPrice', 'DESC']];
                    break;
            }
        }

        // -------------------------------
        // 3. Extract categoryId from query
        // -------------------------------
        let rawQuery = req.query.query || "";
        const extracted = extractAndRemoveCategoryId(rawQuery);
        rawQuery = extracted.cleaned;
        const extractedCategoryId = extracted.categoryId;

        // -------------------------------
        // 4. Build where clause
        // -------------------------------
        let whereClause = {
            isVisible: true,
            ...(isStoreContext(req) ? { toDisplayStore: true } : { toDisplay: true }),
            ...utility.buildQuery(rawQuery)
        };

        // -------------------------------
        // 5. Handle category descendants
        // -------------------------------
        if (extractedCategoryId !== null) {
            const categoryIds = await getAllCategoryIds(Category, extractedCategoryId);
            whereClause.categoryId = { [Op.in]: categoryIds };
        }

        // -------------------------------
        // 6. Search filter
        // -------------------------------
        if (req.query.searchable) {
            const searchable = req.query.searchable;
            whereClause = {
                ...whereClause,
                name: { [Op.iLike]: `%${searchable}%` }
            };
        }

        // -------------------------------
        // 6b. Price range filter
        // -------------------------------
        if (req.query.minPrice) {
            whereClause.sellingPrice = {
                ...(whereClause.sellingPrice || {}),
                [Op.gte]: parseFloat(req.query.minPrice)
            };
        }
        if (req.query.maxPrice) {
            whereClause.sellingPrice = {
                ...(whereClause.sellingPrice || {}),
                [Op.lte]: parseFloat(req.query.maxPrice)
            };
        }

        // -------------------------------
        // 6c. Brand filter
        // -------------------------------
        if (req.query.brandId) {
            whereClause.brandId = parseInt(req.query.brandId);
        }

        // -------------------------------
        // 7. Build store filter for location
        // -------------------------------
        const storeWhere = { isVisibleToPublic: true, active: true };
        const addressWhere = {};

        if (req.query.state && req.query.state !== 'null') {
            addressWhere.state = req.query.state;
        }
        if (req.query.city && req.query.city !== 'null') {
            addressWhere.city = req.query.city;
        }

        // -------------------------------
        // 8. Fetch products
        // -------------------------------
        const products = await Product.findAll(
            utility.paginate({
                where: whereClause,
                include: [
                    { model: Supplier, as: 'supplier', required: false },
                    { model: Category, as: 'category', required: false },
                    { model: Brand, as: 'brand', required: false },
                    {
                        model: Store,
                        as: 'store',
                        attributes: ['id', 'name', 'isSupportingDeliveries'],
                        where: storeWhere,
                        required: true,
                        include: [
                            {
                                model: Address,
                                as: 'address',
                                attributes: ['state', 'city'],
                                where: Object.keys(addressWhere).length > 0 ? addressWhere : undefined,
                                required: Object.keys(addressWhere).length > 0
                            }
                        ]
                    },
                    { model: Review, as: 'reviews', attributes: ['rating'], required: false }
                ],
                order
            }, pagination)
        );

        // -------------------------------
        // 9. Check wishlist status if authenticated
        // -------------------------------
        let userId = null;
        const authHeader = req.headers.authorization;

        if (authHeader && authHeader.startsWith('Bearer ')) {
            try {
                const token = authHeader.split(' ')[1];
                const jwt = require('jsonwebtoken');
                // Use ignoreExpiration for this non-critical feature (just showing heart icons)
                const decoded = jwt.verify(token, process.env.SECRET, { ignoreExpiration: true });
                userId = decoded.id;
            } catch (e) {
                // Invalid token, ignore - products will still load, just without wishlist status
            }
        }

        let wishlistProductIds = new Set();
        if (userId) {
            const { Wishlist } = require('../models');
            const wishlistItems = await Wishlist.findAll({
                where: { userId },
                attributes: ['productId']
            });
            wishlistProductIds = new Set(wishlistItems.map(w => w.productId));
        }

        // Add isInWishlist to each product
        const productsWithWishlist = products.map(p => {
            const product = p.toJSON();
            product.isInWishlist = wishlistProductIds.has(product.id);
            return product;
        });

        return res.json(productsWithWishlist);

    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: err.toString() });
    }
});

/**
 * @route   GET /api/public/brands/store/:storeId
 * @desc    Get all brands used by products in a given store
 * @access  Public
 */
router.get('/brands/store/:storeId', async (req, res) => {
    try {
        const storeId = req.params.storeId;
        const products = await Product.findAll({
            where: { storeId, isVisible: true, brandId: { [Op.not]: null } },
            attributes: ['brandId'],
            group: ['brandId'],
            raw: true
        });
        const brandIds = products.map(p => p.brandId).filter(Boolean);
        if (brandIds.length === 0) return res.json([]);

        const brands = await Brand.findAll({
            where: { id: { [Op.in]: brandIds } },
            order: [['name', 'ASC']]
        });
        res.json(brands);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
});



router.get('/allStores/products/count', async (req, res) => {
    try {
        let rawQuery = req.query.query || "";
        let extractedCategoryId = null;

        // -------------------------------
        // 1. Extract categoryId from query string
        // -------------------------------
        const result = extractAndRemoveCategoryId(rawQuery);
        rawQuery = result.cleaned;
        extractedCategoryId = result.categoryId;

        // -------------------------------
        // 2. Build base where clause
        // -------------------------------
        let whereClause = {
            isVisible: true,
            ...(isStoreContext(req) ? { toDisplayStore: true } : { toDisplay: true }),
            ...utility.buildQuery(rawQuery)
        };

        // -------------------------------
        // 3. Handle category descendants
        // -------------------------------
        if (extractedCategoryId !== null) {
            const categoryIds = await getAllCategoryIds(Category, extractedCategoryId);
            whereClause.categoryId = { [Op.in]: categoryIds };
        }

        // -------------------------------
        // 4. Handle search
        // -------------------------------
        if (req.query.searchable) {
            const searchable = req.query.searchable;
            whereClause = {
                ...whereClause,
                name: { [Op.iLike]: `%${searchable}%` }
            };
        }

        // -------------------------------
        // 4b. Price range filter
        // -------------------------------
        if (req.query.minPrice) {
            whereClause.sellingPrice = {
                ...(whereClause.sellingPrice || {}),
                [Op.gte]: parseFloat(req.query.minPrice)
            };
        }
        if (req.query.maxPrice) {
            whereClause.sellingPrice = {
                ...(whereClause.sellingPrice || {}),
                [Op.lte]: parseFloat(req.query.maxPrice)
            };
        }

        // -------------------------------
        // 5. Build location filter
        // -------------------------------
        const storeWhere = { isVisibleToPublic: true, active: true };
        const addressWhere = {};

        if (req.query.state && req.query.state !== 'null') {
            addressWhere.state = req.query.state;
        }
        if (req.query.city && req.query.city !== 'null') {
            addressWhere.city = req.query.city;
        }

        // -------------------------------
        // 6. Count only
        // -------------------------------
        const total = await Product.count({
            where: whereClause,
            include: [
                { model: Category, as: 'category', required: false },
                {
                    model: Store,
                    as: 'store',
                    where: storeWhere,
                    required: true,
                    include: [
                        {
                            model: Address,
                            as: 'address',
                            where: Object.keys(addressWhere).length > 0 ? addressWhere : undefined,
                            required: Object.keys(addressWhere).length > 0
                        }
                    ]
                }
            ]
        });

        res.json({ count: total });

    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: err.toString() });
    }
});


router.get('/allStores', (req, res, next) => {
    // If on a custom domain, return only that store
    const whereClause = { active: true, isVisibleToPublic: true };
    if (req.resolvedStore) {
        whereClause.id = req.resolvedStore.id;
    }

    Store.findAll({
        where: whereClause,
        include: ['address']
    }).then(stores => {
        res.json(stores)
    }).catch(err => {
        res.status(500).json({
            success: false,
            message: err.toString()
        })
    })
});

/**
 * @route   GET /api/public/store/:id
 * @desc    Get a single public store details
 * @access  Public
 */
router.get('/store/:id', async (req, res) => {
    const id = req.params.id;
    try {
        const store = await Store.findOne({
            where: { id, active: true },
            include: ['address']
        });
        if (!store) {
            return res.status(404).json({ message: 'Store not found' });
        }
        res.json(store);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
});

router.get('/publicProduct/:id', (req, res, next) => {
    const id = req.params.id;
    Product.findOne({
        where: {
            id,
            isVisible: true,
            ...(isStoreContext(req) ? { toDisplayStore: true } : { toDisplay: true })
        }, include: ['brand', 'category', 'supplier', 'store', {
            model: Review,
            as: 'reviews',
            where: { status: 'approved' },
            required: false, // Include even if no reviews
            include: [{
                model: User,
                as: 'user',
                attributes: ['firstName', 'lastName']
            }]
        }]
    }).then(product => {
        res.json(product)

    }).catch(err => {
        res.status(500).json({
            success: false,
            message: err.toString()
        })
    })
});

/**
 * @route   GET /api/public/products/:id/recommendations
 * @desc    Get recommended products (same category, store, or popular)
 * @access  Public
 */
router.get('/products/:id/recommendations', async (req, res) => {
    const productId = parseInt(req.params.id);
    const limit = parseInt(req.query.limit) || 8;
    const storeIdFilter = req.query.storeId ? parseInt(req.query.storeId) : null;

    try {
        // First, get the current product to know its category and store
        const currentProduct = await Product.findByPk(productId, {
            attributes: ['id', 'categoryId', 'storeId']
        });

        if (!currentProduct) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Build conditions for recommendations
        const recommendations = [];

        // 1. Same category products (prioritize)
        if (currentProduct.categoryId) {
            const catWhere = {
                categoryId: currentProduct.categoryId,
                id: { [Op.ne]: productId },
                toDisplay: true,
                isVisible: true,
                quantity: { [Op.gt]: 0 }
            };
            // If storeId filter provided, scope to that store
            if (storeIdFilter) catWhere.storeId = storeIdFilter;

            const sameCategoryProducts = await Product.findAll({
                where: catWhere,
                include: [
                    {
                        model: Store,
                        as: 'store',
                        attributes: ['name', 'id', 'isSupportingDeliveries'],
                        where: { isVisibleToPublic: true, active: true },
                        required: true
                    },
                    {
                        model: ProductStats,
                        as: 'stats',
                        attributes: ['viewCount', 'orderCount', 'popularityScore'],
                        required: false
                    },
                    { model: Review, as: 'reviews', attributes: ['rating'] }
                ],
                order: [[Sequelize.literal('COALESCE("stats"."popularity_score", 0)'), 'DESC']],
                limit: limit,
                subQuery: false
            });
            recommendations.push(...sameCategoryProducts);
        }

        // 2. If we need more, get popular products from the same store
        const targetStoreId = storeIdFilter || currentProduct.storeId;
        if (recommendations.length < limit && targetStoreId) {
            const existingIds = recommendations.map(p => p.id);
            existingIds.push(productId);

            const sameStoreProducts = await Product.findAll({
                where: {
                    storeId: targetStoreId,
                    id: { [Op.notIn]: existingIds },
                    toDisplay: true,
                    isVisible: true,
                    quantity: { [Op.gt]: 0 }
                },
                include: [
                    {
                        model: Store,
                        as: 'store',
                        attributes: ['name', 'id'],
                        where: { isVisibleToPublic: true, active: true },
                        required: true
                    },
                    {
                        model: ProductStats,
                        as: 'stats',
                        attributes: ['viewCount', 'orderCount', 'popularityScore'],
                        required: false
                    },
                    { model: Review, as: 'reviews', attributes: ['rating'] }
                ],
                order: [[Sequelize.literal('COALESCE("stats"."popularity_score", 0)'), 'DESC']],
                limit: limit - recommendations.length,
                subQuery: false
            });
            recommendations.push(...sameStoreProducts);
        }

        // 3. If still need more and NOT scoped to a specific store, get globally popular products
        if (recommendations.length < limit && !storeIdFilter) {
            const existingIds = recommendations.map(p => p.id);
            existingIds.push(productId);

            const popularProducts = await Product.findAll({
                where: {
                    id: { [Op.notIn]: existingIds },
                    toDisplay: true,
                    isVisible: true,
                    quantity: { [Op.gt]: 0 }
                },
                include: [
                    {
                        model: Store,
                        as: 'store',
                        attributes: ['name', 'id'],
                        where: { isVisibleToPublic: true, active: true },
                        required: true
                    },
                    {
                        model: ProductStats,
                        as: 'stats',
                        attributes: ['viewCount', 'orderCount', 'popularityScore'],
                        required: false
                    },
                    { model: Review, as: 'reviews', attributes: ['rating'] }
                ],
                order: [[Sequelize.literal('COALESCE("stats"."popularity_score", 0)'), 'DESC']],
                limit: limit - recommendations.length,
                subQuery: false
            });
            recommendations.push(...popularProducts);
        }

        res.json(recommendations.slice(0, limit));
    } catch (err) {
        console.error('Error fetching recommendations:', err);
        res.status(500).json({ message: 'Server Error' });
    }
});

router.post('/reviews', utility.authenticate, async (req, res) => {
    let { rating, comment, productId } = req.body;
    productId = parseInt(productId); // Ensure productId is an integer
    try {
        console.log(`[DEBUG] POST /reviews - User: ${req.user.id}, Product: ${productId}`);
        const existingReview = await Review.findOne({
            where: {
                userId: req.user.id,
                productId: productId
            }
        });
        console.log(`[DEBUG] Existing review found: ${!!existingReview}`);

        if (existingReview) {
            existingReview.rating = rating;
            existingReview.comment = comment;
            existingReview.status = 'approved'; // Re-approve on edit? Or keep 'pending'? Let's keep 'approved' for now.
            await existingReview.save();

            // Fetch updated with user details
            const updatedReview = await Review.findOne({
                where: { id: existingReview.id },
                include: [{ model: User, as: 'user', attributes: ['firstName', 'lastName'] }]
            });
            return res.json(updatedReview);

        } else {
            const newReview = await Review.create({
                rating,
                comment,
                productId,
                userId: req.user.id,
                status: 'approved'
            });

            const fullReview = await Review.findOne({
                where: { id: newReview.id },
                include: [{ model: User, as: 'user', attributes: ['firstName', 'lastName'] }]
            });
            return res.json(fullReview);
        }

    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.toString()
        });
    }
});

/**
 * @route   GET /api/public/allServices
 * @desc    Get all active services from all active stores
 * @access  Public
 */
router.get('/allServices', async (req, res) => {
    const { StoreService, Store } = require('../models');
    const searchable = req.query.searchable || '';

    try {
        let whereClause = { isActive: true };

        // Add search filter if provided
        if (searchable) {
            whereClause = {
                ...whereClause,
                [Op.or]: [
                    { name: { [Op.iLike]: `%${searchable}%` } },
                    { description: { [Op.iLike]: `%${searchable}%` } }
                ]
            };
        }

        const services = await StoreService.findAll({
            where: whereClause,
            include: [{
                model: Store,
                as: 'store',
                attributes: ['id', 'name', 'logo'],
                where: {
                    isVisibleToPublic: true,
                    active: true
                },
                required: true,
                include: [{
                    model: Address,
                    as: 'address',
                    attributes: ['state', 'city']
                }]
            }],
            order: [['name', 'ASC']]
        });

        res.json(services);
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: err.toString() });
    }
});

/**
 * @route   GET /api/public/platform-stats
 * @desc    Get platform statistics for the About page
 * @access  Public
 */
router.get('/platform-stats', async (req, res) => {
    try {
        // Count active stores
        const storesCount = await Store.count({
            where: { isVisibleToPublic: true, active: true }
        });

        // Count available products
        const productsCount = await Product.count({
            where: {
                toDisplay: true,
                isVisible: true,
                quantity: { [Op.gt]: 0 }
            }
        });

        // Count parent categories only (no parentCategoryId)
        const categoriesCount = await Category.count({
            where: { parentCategoryId: null }
        });

        res.json({
            stores: storesCount,
            products: productsCount,
            categories: categoriesCount
        });
    } catch (err) {
        console.error('Error fetching platform stats:', err);
        res.status(500).json({ message: 'Server Error' });
    }
});

/**
 * @route   POST /api/public/contact
 * @desc    Handle contact form submission
 * @access  Public
 */
router.post('/contact', async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;

        // Validate required fields
        if (!name || !email || !subject || !message) {
            return res.status(400).json({
                success: false,
                message: 'Tous les champs sont obligatoires'
            });
        }

        // Send email notification to admin
        const sendMail = require('../mailService');
        const adminEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_FROM_ADDRESS;

        const subjectLabels = {
            'general': 'Question générale',
            'support': 'Support technique',
            'partnership': 'Partenariat',
            'complaint': 'Réclamation',
            'other': 'Autre'
        };

        const emailHtml = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #4f46e5, #4338ca); padding: 30px; text-align: center;">
                    <h1 style="color: white; margin: 0;">Nouveau message de contact</h1>
                </div>
                <div style="padding: 30px; background: #f8fafc;">
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr>
                            <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; font-weight: bold; width: 120px;">Nom:</td>
                            <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0;">${name}</td>
                        </tr>
                        <tr>
                            <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; font-weight: bold;">Email:</td>
                            <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0;"><a href="mailto:${email}">${email}</a></td>
                        </tr>
                        <tr>
                            <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; font-weight: bold;">Sujet:</td>
                            <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0;">${subjectLabels[subject] || subject}</td>
                        </tr>
                    </table>
                    <div style="margin-top: 20px;">
                        <h3 style="color: #1e293b; margin-bottom: 10px;">Message:</h3>
                        <div style="background: white; padding: 20px; border-radius: 8px; border: 1px solid #e2e8f0;">
                            <p style="margin: 0; white-space: pre-wrap; color: #64748b;">${message}</p>
                        </div>
                    </div>
                </div>
                <div style="padding: 20px; text-align: center; color: #64748b; font-size: 12px;">
                    Ce message a été envoyé depuis le formulaire de contact de Storiom
                </div>
            </div>
        `;

        await sendMail(
            adminEmail,
            `[Contact Storiom] ${subjectLabels[subject] || subject} - ${name}`,
            emailHtml,
            { replyTo: { email: email, name: name } }
        );

        res.json({ success: true, message: 'Message envoyé avec succès' });
    } catch (err) {
        console.error('Error sending contact message:', err);
        res.status(500).json({ success: false, message: 'Erreur lors de l\'envoi du message' });
    }
});

/**
 * @route   GET /api/public/resolve-domain
 * @desc    Resolve a custom domain to a store (used by frontend on init)
 * @access  Public
 */
router.get('/resolve-domain', async (req, res) => {
    try {
        const host = req.query.host || req.headers.host || '';
        const hostname = host.split(':')[0];

        const { isPlatformDomain } = require('../domainResolver');
        if (isPlatformDomain(hostname)) {
            return res.json({ isDomainStore: false, store: null });
        }

        const store = await Store.findOne({
            where: {
                customDomain: hostname,
                domainVerified: true,
                active: true
            },
            include: ['address']
        });

        if (store) {
            return res.json({
                isDomainStore: true,
                store: {
                    id: store.id,
                    name: store.name,
                    description: store.description,
                    logo: store.logo,
                    images: store.images ? JSON.parse(store.images) : [],
                    phone: store.phone,
                    email: store.email,
                    site: store.site,
                    theme: store.theme,
                    address: store.address,
                    isSupportingDeliveries: store.isSupportingDeliveries
                }
            });
        }

        return res.json({ isDomainStore: false, store: null });
    } catch (err) {
        console.error('Error resolving domain:', err);
        res.status(500).json({ isDomainStore: false, store: null, error: 'Resolution failed' });
    }
});

module.exports = router;
