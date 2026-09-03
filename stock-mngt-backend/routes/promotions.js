const express = require('express');
const router = express.Router();
const { PromotionConfig, PaymentOrder } = require('../models');
const utility = require('../utility');

/**
 * Middleware to ensure user has Admin role
 */
function requireAdmin(req, res, next) {
    if (req.user.role !== 'Admin') {
        return res.status(403).json({ success: false, message: 'Accès réservé aux administrateurs' });
    }
    next();
}

// ============================================
// ADMIN ROUTES
// ============================================

/**
 * @route   GET /api/promotions/config
 * @desc    Get current promotion config (admin only)
 * @access  Admin
 */
router.get('/config', utility.authenticate, requireAdmin, async (req, res) => {
    try {
        let config = await PromotionConfig.findByPk(1);
        if (!config) {
            // Create default config if it doesn't exist
            config = await PromotionConfig.create({
                id: 1,
                isActive: false,
                discountPercent: 50,
                maxUsers: 50,
                usedCount: 0,
                description: 'Offre early-bird : réduction pour les premiers utilisateurs'
            });
        }
        res.json({ success: true, config });
    } catch (err) {
        console.error('Error getting promo config:', err);
        res.status(500).json({ success: false, message: err.toString() });
    }
});

/**
 * @route   PUT /api/promotions/config
 * @desc    Update promotion config (admin only)
 * @access  Admin
 */
router.put('/config', utility.authenticate, requireAdmin, async (req, res) => {
    try {
        const { isActive, discountPercent, maxUsers, description } = req.body;

        let config = await PromotionConfig.findByPk(1);
        if (!config) {
            config = await PromotionConfig.create({ id: 1 });
        }

        // Validate discount percent
        if (discountPercent !== undefined) {
            if (discountPercent < 1 || discountPercent > 90) {
                return res.status(400).json({ success: false, message: 'Le pourcentage doit être entre 1 et 90' });
            }
            config.discountPercent = discountPercent;
        }

        // Validate max users
        if (maxUsers !== undefined) {
            if (maxUsers < 1) {
                return res.status(400).json({ success: false, message: 'Le nombre maximum doit être au moins 1' });
            }
            config.maxUsers = maxUsers;
        }

        if (isActive !== undefined) config.isActive = isActive;
        if (description !== undefined) config.description = description;

        await config.save();

        res.json({ success: true, config, message: 'Configuration mise à jour' });
    } catch (err) {
        console.error('Error updating promo config:', err);
        res.status(500).json({ success: false, message: err.toString() });
    }
});

/**
 * @route   PUT /api/promotions/reset
 * @desc    Reset used count (admin only)
 * @access  Admin
 */
router.put('/reset', utility.authenticate, requireAdmin, async (req, res) => {
    try {
        const config = await PromotionConfig.findByPk(1);
        if (!config) {
            return res.status(404).json({ success: false, message: 'Config not found' });
        }

        config.usedCount = 0;
        await config.save();

        res.json({ success: true, config, message: 'Compteur réinitialisé' });
    } catch (err) {
        console.error('Error resetting promo:', err);
        res.status(500).json({ success: false, message: err.toString() });
    }
});

// ============================================
// PUBLIC ROUTE
// ============================================

/**
 * @route   GET /api/promotions/status
 * @desc    Get public promo status (for subscription page)
 * @access  Authenticated
 */
router.get('/status', utility.authenticate, async (req, res) => {
    try {
        const config = await PromotionConfig.findByPk(1);

        if (!config || !config.isActive) {
            return res.json({ success: true, active: false });
        }

        const slotsRemaining = Math.max(0, config.maxUsers - config.usedCount);

        if (slotsRemaining === 0) {
            return res.json({ success: true, active: false });
        }

        // Check if this user already has a PAID subscription order (not eligible)
        const hasPaidBefore = await PaymentOrder.count({
            where: { userId: req.user.id, paymentType: 'SUBSCRIPTION', status: 'PAID' }
        });

        if (hasPaidBefore > 0) {
            return res.json({ success: true, active: false, reason: 'already_subscribed' });
        }

        res.json({
            success: true,
            active: true,
            discountPercent: config.discountPercent,
            slotsRemaining,
            description: config.description
        });
    } catch (err) {
        console.error('Error getting promo status:', err);
        res.status(500).json({ success: false, message: err.toString() });
    }
});

module.exports = router;
