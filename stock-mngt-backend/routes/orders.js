const express = require('express');
const router = express.Router();
const { Order, OrderItem, CartItem, Product, Store, User } = require('../models');
const utility = require('../utility');
const { Op } = require('sequelize');

// CREATE ORDER (Checkout)
router.post('/create', utility.authenticate, async (req, res) => {
    try {
        const userId = req.user.id;

        // 1. Get Cart Items
        const cartItems = await CartItem.findAll({
            where: { userId },
            include: [{ model: Product, as: 'product' }]
        });

        if (!cartItems.length) {
            return res.status(400).json({ success: false, message: "Cart is empty" });
        }

        // 2. Group by Store
        const itemsByStore = {};
        for (const item of cartItems) {
            const storeId = item.product.storeId;
            if (!itemsByStore[storeId]) {
                itemsByStore[storeId] = [];
            }
            itemsByStore[storeId].push(item);
        }

        const createdOrders = [];

        // 3. Create Order per Store
        for (const storeId in itemsByStore) {
            const items = itemsByStore[storeId];
            let totalAmount = 0;

            // Create Order
            const order = await Order.create({
                userId,
                storeId: parseInt(storeId),
                status: 'PENDING',
                totalAmount: 0 // Will update after items
            });

            // Create Order Items
            for (const item of items) {
                const price = item.product.sellingPrice; // Snapshot price
                const lineTotal = price * item.quantity;
                totalAmount += lineTotal;

                await OrderItem.create({
                    orderId: order.id,
                    productId: item.product.id,
                    quantity: item.quantity,
                    price: price
                });
            }

            // Update Order Total
            order.totalAmount = totalAmount;
            await order.save();
            createdOrders.push(order);
        }

        // 4. Clear Cart
        await CartItem.destroy({ where: { userId } });

        res.json({ success: true, orders: createdOrders });

    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: err.message });
    }
});

// GET MY ORDERS (As Customer)
router.get('/my-orders', utility.authenticate, async (req, res) => {
    try {
        const userId = req.user.id;
        const orders = await Order.findAll({
            where: { userId },
            include: [
                { model: Store, as: 'store' },
                {
                    model: OrderItem,
                    as: 'items',
                    include: [{ model: Product, as: 'product' }]
                }
            ],
            order: [['createdAt', 'DESC']]
        });

        res.json(orders);
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// GET STORE ORDERS (As Store Owner/Worker)
router.get('/store/:storeId', utility.authenticate, async (req, res) => {
    try {
        const storeId = req.params.storeId;

        // Ensure user has access to this store (Add your checkSubscription/permission logic here if needed)
        // For now preventing random access:
        // const store = await Store.findByPk(storeId);
        // if (store.userId !== req.user.id) return res.status(403).json({message: "Unauthorized"});

        const orders = await Order.findAll({
            where: { storeId },
            include: [
                { model: User, as: 'user', attributes: ['id', 'firstName', 'lastName', 'email', 'phone'] },
                {
                    model: OrderItem,
                    as: 'items',
                    include: [{ model: Product, as: 'product' }]
                }
            ],
            order: [['createdAt', 'DESC']]
        });

        res.json(orders);
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// UPDATE ORDER STATUS
router.put('/:id/status', utility.authenticate, async (req, res) => {
    try {
        const { status } = req.body;
        const orderId = req.params.id;

        const order = await Order.findByPk(orderId);
        if (!order) return res.status(404).json({ success: false, message: "Order not found" });

        // Add permission check here (Only store owner should update status)

        order.status = status;
        await order.save();

        res.json({ success: true, order });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
