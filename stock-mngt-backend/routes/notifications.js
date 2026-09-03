const express = require('express');
const router = express.Router();
const { Notification, Order, OrderItem, Product, User, StoreCustomer } = require('../models');
const utility = require('../utility');
const { Op } = require('sequelize');

// GET NOTIFICATIONS for a store
router.get('/store/:storeId', utility.authenticate, async (req, res) => {
    try {
        const storeId = req.params.storeId;
        const { unreadOnly, limit } = req.query;

        const where = { storeId };
        if (unreadOnly === 'true') {
            where.isRead = false;
        }

        const notifications = await Notification.findAll({
            where,
            order: [['createdAt', 'DESC']],
            limit: parseInt(limit) || 50,
        });

        const unreadCount = await Notification.count({
            where: { storeId, isRead: false }
        });

        res.json({ success: true, notifications, unreadCount });
    } catch (err) {
        console.error('Error fetching notifications:', err);
        res.status(500).json({ success: false, message: err.message });
    }
});

// MARK NOTIFICATION AS READ
router.put('/:id/read', utility.authenticate, async (req, res) => {
    try {
        const notification = await Notification.findByPk(req.params.id);
        if (!notification) return res.status(404).json({ success: false, message: 'Notification introuvable.' });

        notification.isRead = true;
        await notification.save();

        res.json({ success: true, notification });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// MARK ALL NOTIFICATIONS AS READ for a store
router.put('/store/:storeId/read-all', utility.authenticate, async (req, res) => {
    try {
        await Notification.update(
            { isRead: true },
            { where: { storeId: req.params.storeId, isRead: false } }
        );

        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
