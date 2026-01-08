const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const db = require('../models');
const { Wishlist, Product, ProductStats } = db;
const utility = require('../utility');

/**
 * Add product to wishlist
 * POST /api/wishlist/add
 * Body: { productId }
 */
router.post('/add', utility.authenticate, async (req, res) => {
    try {
        const userId = req.user.id;
        const { productId } = req.body;

        if (!productId) {
            return res.status(400).json({ success: false, message: 'productId is required' });
        }

        // Check if product exists
        const product = await Product.findByPk(productId);
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        // Check if already in wishlist
        const existing = await Wishlist.findOne({
            where: { userId, productId }
        });

        if (existing) {
            return res.json({ success: true, message: 'Already in wishlist', wishlistItem: existing });
        }

        // Create wishlist entry
        const wishlistItem = await Wishlist.create({ userId, productId });

        // Update ProductStats wishlist count
        const [stats] = await ProductStats.findOrCreate({
            where: { productId },
            defaults: { productId }
        });
        await stats.update({
            wishlistCount: (stats.wishlistCount || 0) + 1
        });

        res.json({ success: true, message: 'Added to wishlist', wishlistItem });
    } catch (error) {
        console.error('Error adding to wishlist:', error);
        res.status(500).json({ success: false, message: 'Failed to add to wishlist' });
    }
});

/**
 * Remove product from wishlist
 * DELETE /api/wishlist/:productId
 */
router.delete('/:productId', utility.authenticate, async (req, res) => {
    try {
        const userId = req.user.id;
        const productId = parseInt(req.params.productId);

        const deleted = await Wishlist.destroy({
            where: { userId, productId }
        });

        if (deleted) {
            // Update ProductStats wishlist count
            const stats = await ProductStats.findOne({ where: { productId } });
            if (stats && stats.wishlistCount > 0) {
                await stats.update({
                    wishlistCount: stats.wishlistCount - 1
                });
            }
        }

        res.json({ success: true, message: deleted ? 'Removed from wishlist' : 'Not in wishlist' });
    } catch (error) {
        console.error('Error removing from wishlist:', error);
        res.status(500).json({ success: false, message: 'Failed to remove from wishlist' });
    }
});

/**
 * Get user's wishlist
 * GET /api/wishlist
 */
router.get('/', utility.authenticate, async (req, res) => {
    try {
        const userId = req.user.id;

        const wishlistItems = await Wishlist.findAll({
            where: { userId },
            include: [{
                model: Product,
                as: 'product',
                include: ['category', 'store']
            }],
            order: [['created_at', 'DESC']]
        });

        res.json(wishlistItems);
    } catch (error) {
        console.error('Error fetching wishlist:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch wishlist' });
    }
});

/**
 * Check if product is in wishlist
 * GET /api/wishlist/check/:productId
 */
router.get('/check/:productId', utility.authenticate, async (req, res) => {
    try {
        const userId = req.user.id;
        const productId = parseInt(req.params.productId);

        const exists = await Wishlist.findOne({
            where: { userId, productId }
        });

        res.json({ inWishlist: !!exists });
    } catch (error) {
        console.error('Error checking wishlist:', error);
        res.status(500).json({ success: false, message: 'Failed to check wishlist' });
    }
});

/**
 * Check multiple products at once (for product lists)
 * POST /api/wishlist/check-batch
 * Body: { productIds: [1, 2, 3] }
 */
router.post('/check-batch', utility.authenticate, async (req, res) => {
    try {
        const userId = req.user.id;
        const { productIds } = req.body;

        if (!productIds || !Array.isArray(productIds)) {
            return res.status(400).json({ success: false, message: 'productIds array is required' });
        }

        const wishlistItems = await Wishlist.findAll({
            where: {
                userId,
                productId: { [Op.in]: productIds }
            },
            attributes: ['productId']
        });

        const wishlistProductIds = wishlistItems.map(item => item.productId);

        res.json({ wishlistProductIds });
    } catch (error) {
        console.error('Error checking batch wishlist:', error);
        res.status(500).json({ success: false, message: 'Failed to check wishlist' });
    }
});

/**
 * Get wishlist count
 * GET /api/wishlist/count
 */
router.get('/count', utility.authenticate, async (req, res) => {
    try {
        const userId = req.user.id;

        const count = await Wishlist.count({
            where: { userId }
        });

        res.json({ count });
    } catch (error) {
        console.error('Error counting wishlist:', error);
        res.status(500).json({ success: false, message: 'Failed to count wishlist' });
    }
});

module.exports = router;
