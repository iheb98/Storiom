const express = require('express');
const router = express.Router();
const { Op, Sequelize } = require('sequelize');
const db = require('../models');
const { ProductStats, UserInteractions, Product } = db;
const utility = require('../utility');

// Weight values for different interaction types (for popularity calculation)
const INTERACTION_WEIGHTS = {
    view: 0.1,
    click: 0.2,
    cart_add: 0.5,
    order: 1.0,
    wishlist_add: 0.3,
    search: 0.05
};

/**
 * Track a product event (view, click, cart_add, etc.)
 * POST /api/analytics/track
 * Body: { productId, interactionType, userId?, storeId?, categoryId?, quantity?, searchTerm? }
 */
router.post('/track', async (req, res) => {
    try {
        const { productId, interactionType, userId, storeId, categoryId, quantity, searchTerm, sessionId } = req.body;

        if (!productId || !interactionType) {
            return res.status(400).json({ error: 'productId and interactionType are required' });
        }

        // Get or create ProductStats record
        const [stats, created] = await ProductStats.findOrCreate({
            where: { productId },
            defaults: { productId }
        });

        // Update aggregate stats based on interaction type
        const updateData = { updatedAt: new Date() };

        switch (interactionType) {
            case 'view':
                updateData.viewCount = (stats.viewCount || 0) + 1;
                updateData.lastViewedAt = new Date();
                break;
            case 'click':
                updateData.clickCount = (stats.clickCount || 0) + 1;
                break;
            case 'cart_add':
                updateData.cartAddCount = (stats.cartAddCount || 0) + 1;
                updateData.lastCartAddAt = new Date();
                break;
            case 'order':
                updateData.orderCount = (stats.orderCount || 0) + 1;
                updateData.totalQuantitySold = (stats.totalQuantitySold || 0) + (quantity || 1);
                updateData.lastOrderedAt = new Date();
                break;
            case 'wishlist_add':
                updateData.wishlistCount = (stats.wishlistCount || 0) + 1;
                break;
            case 'wishlist_remove':
                updateData.wishlistCount = Math.max((stats.wishlistCount || 0) - 1, 0);
                break;
            case 'search':
                updateData.searchImpressions = (stats.searchImpressions || 0) + 1;
                break;
        }

        // Calculate popularity score
        updateData.popularityScore = calculatePopularityScore({
            ...stats.dataValues,
            ...updateData
        });

        await stats.update(updateData);

        // If user is logged in, track individual interaction for recommendations
        if (userId && !['wishlist_remove', 'cart_remove'].includes(interactionType)) {
            await UserInteractions.create({
                userId,
                productId,
                storeId,
                categoryId,
                interactionType,
                quantity: quantity || 1,
                searchTerm,
                weight: INTERACTION_WEIGHTS[interactionType] || 1.0,
                sessionId
            });
        }

        res.json({ success: true, stats: updateData });
    } catch (error) {
        console.error('Error tracking event:', error);
        res.status(500).json({ error: 'Failed to track event' });
    }
});

/**
 * Get product statistics
 * GET /api/analytics/product/:productId
 */
router.get('/product/:productId', utility.authenticate, async (req, res) => {
    try {
        const { productId } = req.params;

        const stats = await ProductStats.findOne({ where: { productId } });

        if (!stats) {
            return res.json({
                productId: parseInt(productId),
                viewCount: 0,
                clickCount: 0,
                cartAddCount: 0,
                orderCount: 0,
                wishlistCount: 0,
                searchImpressions: 0,
                totalQuantitySold: 0,
                totalRevenue: 0,
                popularityScore: 0,
                conversionRate: 0,
                cartToOrderRate: 0
            });
        }

        // Calculate derived metrics
        const conversionRate = stats.viewCount > 0
            ? ((stats.orderCount / stats.viewCount) * 100).toFixed(2)
            : 0;
        const cartToOrderRate = stats.cartAddCount > 0
            ? ((stats.orderCount / stats.cartAddCount) * 100).toFixed(2)
            : 0;

        res.json({
            ...stats.dataValues,
            conversionRate: parseFloat(conversionRate),
            cartToOrderRate: parseFloat(cartToOrderRate)
        });
    } catch (error) {
        console.error('Error fetching product stats:', error);
        res.status(500).json({ error: 'Failed to fetch product stats' });
    }
});

/**
 * Get trending products (most popular recently)
 * GET /api/analytics/trending?storeId=X&limit=10
 */
router.get('/trending', async (req, res) => {
    try {
        const { storeId, limit = 10 } = req.query;

        const whereClause = {};
        const includeClause = [{
            model: Product,
            as: 'product',
            required: true,
            where: storeId ? { storeId } : {}
        }];

        const trending = await ProductStats.findAll({
            where: whereClause,
            include: includeClause,
            order: [
                ['popularityScore', 'DESC'],
                ['viewCount', 'DESC']
            ],
            limit: parseInt(limit)
        });

        res.json(trending);
    } catch (error) {
        console.error('Error fetching trending products:', error);
        res.status(500).json({ error: 'Failed to fetch trending products' });
    }
});

/**
 * Get personalized recommendations for a user
 * GET /api/analytics/recommendations/:userId?limit=10
 */
router.get('/recommendations/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const { limit = 10, storeId } = req.query;

        // Get user's recent interactions to understand preferences
        const recentInteractions = await UserInteractions.findAll({
            where: { userId },
            order: [['created_at', 'DESC']],
            limit: 50
        });

        if (recentInteractions.length === 0) {
            // New user - return popular products
            return res.json(await getPopularProducts(limit, storeId));
        }

        // Get categories and products user has interacted with
        const interactedProductIds = [...new Set(recentInteractions.map(i => i.productId))];
        const interactedCategoryIds = [...new Set(recentInteractions.filter(i => i.categoryId).map(i => i.categoryId))];

        // Calculate category preferences (weighted by interaction type)
        const categoryWeights = {};
        recentInteractions.forEach(interaction => {
            if (interaction.categoryId) {
                categoryWeights[interaction.categoryId] = (categoryWeights[interaction.categoryId] || 0) + interaction.weight;
            }
        });

        // Sort categories by preference weight
        const preferredCategories = Object.entries(categoryWeights)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([catId]) => parseInt(catId));

        // Find products in preferred categories that user hasn't interacted with
        const whereClause = {
            id: { [Op.notIn]: interactedProductIds }
        };
        if (storeId) {
            whereClause.storeId = storeId;
        }
        if (preferredCategories.length > 0) {
            whereClause.categoryId = { [Op.in]: preferredCategories };
        }

        const recommendedProducts = await Product.findAll({
            where: whereClause,
            include: [{
                model: ProductStats,
                as: 'stats',
                required: false
            }],
            order: [[{ model: ProductStats, as: 'stats' }, 'popularityScore', 'DESC NULLS LAST']],
            limit: parseInt(limit)
        });

        res.json(recommendedProducts);
    } catch (error) {
        console.error('Error fetching recommendations:', error);
        res.status(500).json({ error: 'Failed to fetch recommendations' });
    }
});

/**
 * Get similar products based on viewing/buying patterns
 * GET /api/analytics/similar/:productId?limit=5
 */
router.get('/similar/:productId', async (req, res) => {
    try {
        const { productId } = req.params;
        const { limit = 5 } = req.query;

        // Find users who interacted with this product
        const usersWhoInteracted = await UserInteractions.findAll({
            where: {
                productId,
                interactionType: { [Op.in]: ['view', 'order', 'cart_add'] }
            },
            attributes: ['userId'],
            group: ['userId'],
            limit: 100
        });

        const userIds = usersWhoInteracted.map(u => u.userId);

        if (userIds.length === 0) {
            // No user data - return products from same category
            const product = await Product.findByPk(productId);
            if (!product) return res.json([]);

            const similarByCategory = await Product.findAll({
                where: {
                    id: { [Op.ne]: productId },
                    categoryId: product.categoryId
                },
                include: [{
                    model: ProductStats,
                    as: 'stats',
                    required: false
                }],
                order: [[{ model: ProductStats, as: 'stats' }, 'popularityScore', 'DESC NULLS LAST']],
                limit: parseInt(limit)
            });

            return res.json(similarByCategory);
        }

        // Find other products these users also interacted with
        const similarProducts = await UserInteractions.findAll({
            where: {
                userId: { [Op.in]: userIds },
                productId: { [Op.ne]: productId },
                interactionType: { [Op.in]: ['view', 'order', 'cart_add'] }
            },
            attributes: [
                'productId',
                [Sequelize.fn('COUNT', Sequelize.col('product_id')), 'interactionCount'],
                [Sequelize.fn('SUM', Sequelize.col('weight')), 'totalWeight']
            ],
            group: ['productId'],
            order: [[Sequelize.literal('totalWeight'), 'DESC']],
            limit: parseInt(limit)
        });

        const productIds = similarProducts.map(sp => sp.productId);

        const products = await Product.findAll({
            where: { id: { [Op.in]: productIds } },
            include: [{
                model: ProductStats,
                as: 'stats',
                required: false
            }]
        });

        res.json(products);
    } catch (error) {
        console.error('Error fetching similar products:', error);
        res.status(500).json({ error: 'Failed to fetch similar products' });
    }
});

/**
 * Get store analytics summary
 * GET /api/analytics/store/:storeId
 */
router.get('/store/:storeId', utility.authenticate, async (req, res) => {
    try {
        const { storeId } = req.params;

        // Get all products for this store
        const products = await Product.findAll({
            where: { storeId },
            attributes: ['id']
        });

        const productIds = products.map(p => p.id);

        // Aggregate stats for all store products
        const aggregateStats = await ProductStats.findOne({
            where: { productId: { [Op.in]: productIds } },
            attributes: [
                [Sequelize.fn('SUM', Sequelize.col('view_count')), 'totalViews'],
                [Sequelize.fn('SUM', Sequelize.col('order_count')), 'totalOrders'],
                [Sequelize.fn('SUM', Sequelize.col('cart_add_count')), 'totalCartAdds'],
                [Sequelize.fn('SUM', Sequelize.col('wishlist_count')), 'totalWishlists'],
                [Sequelize.fn('SUM', Sequelize.col('total_quantity_sold')), 'totalQuantitySold'],
                [Sequelize.fn('SUM', Sequelize.col('total_revenue')), 'totalRevenue'],
                [Sequelize.fn('AVG', Sequelize.col('popularity_score')), 'avgPopularityScore']
            ],
            raw: true
        });

        // Get top 5 performing products
        const topProducts = await ProductStats.findAll({
            where: { productId: { [Op.in]: productIds } },
            include: [{
                model: Product,
                as: 'product',
                attributes: ['id', 'name', 'sellingPrice', 'thumbnails']
            }],
            order: [['popularityScore', 'DESC']],
            limit: 5
        });

        res.json({
            summary: aggregateStats || {},
            topProducts
        });
    } catch (error) {
        console.error('Error fetching store analytics:', error);
        res.status(500).json({ error: 'Failed to fetch store analytics' });
    }
});

// Helper function to calculate popularity score
function calculatePopularityScore(stats) {
    const viewWeight = 0.1;
    const clickWeight = 0.2;
    const cartWeight = 0.5;
    const orderWeight = 1.0;
    const wishlistWeight = 0.3;

    const score =
        (stats.viewCount || 0) * viewWeight +
        (stats.clickCount || 0) * clickWeight +
        (stats.cartAddCount || 0) * cartWeight +
        (stats.orderCount || 0) * orderWeight +
        (stats.wishlistCount || 0) * wishlistWeight;

    // Apply time decay (recent activity is more valuable)
    const daysSinceLastView = stats.lastViewedAt
        ? Math.floor((Date.now() - new Date(stats.lastViewedAt)) / (1000 * 60 * 60 * 24))
        : 30;
    const decayFactor = Math.max(0.5, 1 - (daysSinceLastView / 60)); // 50% minimum

    return (score * decayFactor).toFixed(2);
}

// Helper function to get popular products
async function getPopularProducts(limit, storeId) {
    const whereClause = storeId ? { storeId } : {};

    return Product.findAll({
        where: whereClause,
        include: [{
            model: ProductStats,
            as: 'stats',
            required: false
        }],
        order: [[{ model: ProductStats, as: 'stats' }, 'popularityScore', 'DESC NULLS LAST']],
        limit: parseInt(limit)
    });
}

module.exports = router;
