const express = require('express');
const router = express.Router();
const { Order, OrderItem, CartItem, Product, Store, User, Address, DeliveryWorker, Operation } = require('../models');
const utility = require('../utility');
const { Op } = require('sequelize');
const sendMail = require('../mailService');

// Helper function to send notification to delivery workers and assign to order
async function notifyDeliveryWorkers(order, user, store, items) {
    try {
        // Get user's address to find their state
        const userAddress = await Address.findOne({ where: { userId: user.id } });
        if (!userAddress || !userAddress.state) {
            console.log('No address/state found for user, skipping delivery worker notification');
            return null;
        }

        // Find delivery workers for this store that support this state and have sendEmail enabled
        const deliveryWorkers = await DeliveryWorker.findAll({
            where: {
                storeId: store.id,
                sendEmail: true
            }
        });

        // Filter workers whose supportedStates includes the user's state
        const matchingWorkers = deliveryWorkers.filter(worker =>
            worker.supportedStates && worker.supportedStates.includes(userAddress.state)
        );

        if (matchingWorkers.length === 0) {
            console.log('No delivery workers found for state:', userAddress.state);
            return null;
        }

        // Use the first matching worker as the assigned delivery worker
        const assignedWorker = matchingWorkers[0];

        // Assign the delivery worker to the order
        order.deliveryWorkerId = assignedWorker.id;
        await order.save();
        console.log(`Assigned delivery worker ${assignedWorker.firstName} ${assignedWorker.lastName} to order #${order.id}`);

        // Build order items HTML
        const itemsHtml = items.map(item => `
            <tr>
                <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.product.name}</td>
                <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
                <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">${item.product.sellingPrice?.toFixed(2)} DT</td>
                <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">${(item.quantity * item.product.sellingPrice)?.toFixed(2)} DT</td>
            </tr>
        `).join('');

        // Build email HTML
        const emailHtml = `
            <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f5f5f5; padding: 20px;">
                <div style="background: #3f51b5; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
                    <h1 style="margin: 0; font-size: 24px;">🚚 Nouvelle Commande</h1>
                    <p style="margin: 10px 0 0; opacity: 0.9;">Commande #${order.id}</p>
                </div>
                
                <div style="background: white; padding: 20px; border-radius: 0 0 8px 8px;">
                    <h2 style="color: #333; margin-top: 0;">Détails du Client</h2>
                    <table style="width: 100%; margin-bottom: 20px;">
                        <tr>
                            <td style="padding: 5px 0; color: #666;">Nom:</td>
                            <td style="padding: 5px 0;"><strong>${user.firstName} ${user.lastName}</strong></td>
                        </tr>
                        <tr>
                            <td style="padding: 5px 0; color: #666;">Téléphone:</td>
                            <td style="padding: 5px 0;"><strong>${user.phone || 'Non renseigné'}</strong></td>
                        </tr>
                        <tr>
                            <td style="padding: 5px 0; color: #666;">Email:</td>
                            <td style="padding: 5px 0;"><strong>${user.email}</strong></td>
                        </tr>
                        <tr>
                            <td style="padding: 5px 0; color: #666;">Adresse:</td>
                            <td style="padding: 5px 0;"><strong>${userAddress.street || ''}, ${userAddress.city || ''}, ${userAddress.state || ''} ${userAddress.postalCode || ''}</strong></td>
                        </tr>
                    </table>

                    <h2 style="color: #333;">Articles Commandés</h2>
                    <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                        <thead>
                            <tr style="background: #f8f9fa;">
                                <th style="padding: 10px; text-align: left; border-bottom: 2px solid #ddd;">Produit</th>
                                <th style="padding: 10px; text-align: center; border-bottom: 2px solid #ddd;">Qté</th>
                                <th style="padding: 10px; text-align: right; border-bottom: 2px solid #ddd;">Prix</th>
                                <th style="padding: 10px; text-align: right; border-bottom: 2px solid #ddd;">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${itemsHtml}
                        </tbody>
                        <tfoot>
                            <tr style="background: #f8f9fa;">
                                <td colspan="3" style="padding: 15px; text-align: right; font-weight: bold;">Total:</td>
                                <td style="padding: 15px; text-align: right; font-weight: bold; color: #3f51b5;">${order.totalAmount?.toFixed(2)} DT</td>
                            </tr>
                        </tfoot>
                    </table>

                    <div style="background: #e8f5e9; padding: 15px; border-radius: 8px; border-left: 4px solid #4caf50;">
                        <strong style="color: #2e7d32;">Zone de livraison:</strong> ${userAddress.state}
                    </div>
                </div>

                <p style="color: #999; font-size: 12px; text-align: center; margin-top: 20px;">
                    Cet email a été envoyé automatiquement par ${store.name}
                </p>
            </div>
        `;

        // Build CC list (only store email)
        const ccList = [];
        if (store.email) ccList.push(store.email);

        // Send email to the assigned delivery worker
        if (assignedWorker.email) {
            try {
                // Build CC recipients for Brevo API format
                const ccRecipients = ccList.map(email => ({ email }));

                await sendMail(
                    assignedWorker.email,
                    `🚚 Nouvelle commande #${order.id} - ${userAddress.state}`,
                    emailHtml,
                    ccRecipients.length > 0 ? { cc: ccRecipients } : {}
                );

                console.log(`Email sent to delivery worker: ${assignedWorker.firstName} ${assignedWorker.lastName} (${assignedWorker.email})`);
            } catch (emailErr) {
                console.error(`Failed to send email to ${assignedWorker.email}:`, emailErr);
            }
        }

        return assignedWorker.id;
    } catch (err) {
        console.error('Error notifying delivery workers:', err);
        return null;
    }
}

// CREATE ORDER (Checkout)
router.post('/create', utility.authenticate, async (req, res) => {
    try {
        const userId = req.user.id;

        // Get full user data for notification
        const user = await User.findByPk(userId);

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

            // Get store for notification
            const store = await Store.findByPk(parseInt(storeId));

            // Create Order
            const order = await Order.create({
                userId,
                storeId: parseInt(storeId),
                status: 'PENDING',
                totalAmount: 0 // Will update after items
            });

            // Create Order Items
            for (const item of items) {
                // Calculate price with discount if applicable
                let price = item.product.sellingPrice; // Original price
                if (item.product.discount && item.product.discount > 0) {
                    // Apply discount: discountedPrice = sellingPrice * (1 - discount/100)
                    price = item.product.sellingPrice * (1 - item.product.discount / 100);
                }

                const lineTotal = price * item.quantity;
                totalAmount += lineTotal;

                await OrderItem.create({
                    orderId: order.id,
                    productId: item.product.id,
                    quantity: item.quantity,
                    price: price  // This is now the discounted price
                });
            }

            // Update Order Total
            order.totalAmount = totalAmount;
            await order.save();
            createdOrders.push(order);

            // 5. Notify delivery workers (async, don't wait)
            notifyDeliveryWorkers(order, user, store, items).catch(err => {
                console.error('Delivery worker notification failed:', err);
            });
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
                },
                { model: DeliveryWorker, as: 'deliveryWorker' }
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

        const order = await Order.findByPk(orderId, {
            include: [{
                model: OrderItem,
                as: 'items',
                include: [{ model: Product, as: 'product' }]
            }]
        });
        if (!order) return res.status(404).json({ success: false, message: "Order not found" });

        const previousStatus = order.status;

        // Handle cancellation - revert product quantities if order was confirmed/shipped
        if (status === 'CANCELLED' && (previousStatus === 'CONFIRMED' || previousStatus === 'SHIPPED')) {
            // Revert product quantities and create CANCELLED operations for all items
            for (const item of order.items) {
                if (item.product) {
                    // Add back the quantity that was sold
                    await Product.update(
                        { quantity: item.product.quantity + item.quantity },
                        { where: { id: item.product.id } }
                    );

                    // Create CANCELLED operation for tracking
                    await Operation.create({
                        type: 'CANCELLED',
                        amount: item.quantity,
                        price: item.price,
                        date: new Date(),
                        productId: item.product.id,
                        receiptId: null,
                        creatorUserId: req.user.id,
                        impactStock: true
                    });
                }
            }
        }

        order.status = status;
        await order.save();

        res.json({ success: true, order });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// UPDATE ORDER DELIVERY WORKER
router.put('/:id/delivery-worker', utility.authenticate, async (req, res) => {
    try {
        const { deliveryWorkerId } = req.body;
        const orderId = req.params.id;

        const order = await Order.findByPk(orderId);
        if (!order) return res.status(404).json({ success: false, message: "Order not found" });

        order.deliveryWorkerId = deliveryWorkerId || null;
        await order.save();

        // Fetch the updated order with delivery worker
        const updatedOrder = await Order.findByPk(orderId, {
            include: [{ model: DeliveryWorker, as: 'deliveryWorker' }]
        });

        res.json({ success: true, order: updatedOrder });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;

