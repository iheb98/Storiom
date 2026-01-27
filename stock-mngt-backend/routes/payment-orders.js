const express = require('express');
const router = express.Router();
const { PaymentOrder, User, Subscription, Store, StoragePurchase } = require('../models');
const utility = require('../utility');
const sendMail = require('../mailService');

// Pricing configuration (in TND)
const SUBSCRIPTION_PRICES = {
    '1M': 50,
    '3M': 140,   // ~7% discount
    '6M': 260,   // ~13% discount
    '12M': 500   // ~17% discount
};

const STORAGE_PRICE_PER_50GB = 10;

// Storage plans with GB options and duration discounts
const STORAGE_PLANS = {
    50: { '1M': 10, '3M': 28, '6M': 52, '12M': 100 },   // 10 TND base
    100: { '1M': 18, '3M': 50, '6M': 94, '12M': 180 },  // ~10% discount per 50GB
    200: { '1M': 34, '3M': 95, '6M': 178, '12M': 340 }  // ~15% discount per 50GB
};

// Admin email for notifications
const ADMIN_EMAIL = 'ihebferjani0100@gmail.com';

// Bank transfer instructions
const BANK_INSTRUCTIONS = {
    bankName: 'Banque Nationale Agricole (BNA)',
    accountHolder: 'STORIOM SARL',
    rib: '',
    instructions: [
        'Connectez-vous à votre banque en ligne ou rendez-vous à votre agence',
        'Effectuez un virement vers le RIB ci-dessus',
        'Mentionnez votre numéro de commande dans le motif du virement',
        'Cliquez sur "J\'ai effectué le paiement" une fois terminé',
        'Votre abonnement sera activé après vérification (24-48h)'
    ]
};

// Generate unique order number: ord-{userId}-{sequentialNumber}
async function generateOrderNumber(userId) {
    const orderCount = await PaymentOrder.count({ where: { userId } });
    const sequentialNumber = (orderCount + 1).toString().padStart(4, '0');
    return `ORD-${userId}-${sequentialNumber}`;
}

// Calculate subscription expiration date
function calculateExpirationDate(plan, fromDate = new Date()) {
    const date = new Date(fromDate);
    switch (plan) {
        case '1M': date.setMonth(date.getMonth() + 1); break;
        case '3M': date.setMonth(date.getMonth() + 3); break;
        case '6M': date.setMonth(date.getMonth() + 6); break;
        case '12M': date.setMonth(date.getMonth() + 12); break;
    }
    return date;
}

// ============================================
// USER ROUTES
// ============================================

// Get pricing info
router.get('/pricing', (req, res) => {
    res.json({
        subscription: SUBSCRIPTION_PRICES,
        storage: { pricePerUnit: STORAGE_PRICE_PER_50GB, unitSizeGB: 50 },
        storagePlans: STORAGE_PLANS,
        currency: 'TND'
    });
});

// Create payment order
router.post('/create', utility.authenticate, async (req, res) => {
    try {
        const { paymentType, subscriptionPlan, storageGB, storageDuration } = req.body;
        const userId = req.user.id;

        // Calculate amount
        let amount = 0;
        if (paymentType === 'SUBSCRIPTION') {
            if (!SUBSCRIPTION_PRICES[subscriptionPlan]) {
                return res.status(400).json({ success: false, message: 'Invalid subscription plan' });
            }
            amount = SUBSCRIPTION_PRICES[subscriptionPlan];
        } else if (paymentType === 'STORAGE_EXTENSION') {
            const gb = storageGB || 50;
            const duration = storageDuration || '1M';
            if (!STORAGE_PLANS[gb] || !STORAGE_PLANS[gb][duration]) {
                return res.status(400).json({ success: false, message: 'Invalid storage plan' });
            }
            amount = STORAGE_PLANS[gb][duration];
        } else {
            return res.status(400).json({ success: false, message: 'Invalid payment type' });
        }

        // Create order
        const order = await PaymentOrder.create({
            orderNumber: await generateOrderNumber(userId),
            userId,
            paymentType,
            subscriptionPlan: paymentType === 'SUBSCRIPTION' ? subscriptionPlan : null,
            storageGB: paymentType === 'STORAGE_EXTENSION' ? (storageGB || 50) : null,
            storageDuration: paymentType === 'STORAGE_EXTENSION' ? (storageDuration || '1M') : null,
            amount,
            currency: 'TND',
            status: 'PENDING'
        });

        // Get user info for email
        const user = await User.findByPk(userId);

        // Send email to admin
        const adminEmailHtml = `
      <h2>Nouvelle commande de paiement</h2>
      <p><strong>Numéro de commande:</strong> ${order.orderNumber}</p>
      <p><strong>Client:</strong> ${user.firstName} ${user.lastName} (${user.email})</p>
      <p><strong>Type:</strong> ${paymentType === 'SUBSCRIPTION' ? 'Abonnement ' + subscriptionPlan : 'Extension stockage ' + order.storageGB + ' GB'}</p>
      <p><strong>Montant:</strong> ${amount} TND</p>
      <p><strong>Date:</strong> ${new Date().toLocaleString('fr-FR')}</p>
      <p><a href="https://storiom.com/superadmin/payment-orders">Voir dans l'interface admin</a></p>
    `;
        await sendMail(ADMIN_EMAIL, `Nouvelle commande #${order.orderNumber}`, adminEmailHtml);

        res.json({
            success: true,
            order: {
                id: order.id,
                orderNumber: order.orderNumber,
                paymentType: order.paymentType,
                subscriptionPlan: order.subscriptionPlan,
                storageGB: order.storageGB,
                amount: order.amount,
                currency: order.currency,
                status: order.status,
                createdAt: order.createdAt
            },
            bankInstructions: BANK_INSTRUCTIONS
        });
    } catch (error) {
        console.error('Error creating payment order:', error);
        res.status(500).json({ success: false, message: error.toString() });
    }
});

// Get user's orders
router.get('/my-orders', utility.authenticate, async (req, res) => {
    try {
        const orders = await PaymentOrder.findAll({
            where: { userId: req.user.id },
            order: [['createdAt', 'DESC']]
        });
        res.json({ success: true, orders });
    } catch (error) {
        res.status(500).json({ success: false, message: error.toString() });
    }
});

// Get single order
router.get('/:id', utility.authenticate, async (req, res) => {
    try {
        const order = await PaymentOrder.findOne({
            where: { id: req.params.id, userId: req.user.id }
        });
        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }
        res.json({ success: true, order, bankInstructions: BANK_INSTRUCTIONS });
    } catch (error) {
        res.status(500).json({ success: false, message: error.toString() });
    }
});

// User confirms payment made
router.post('/:id/confirm-payment', utility.authenticate, async (req, res) => {
    try {
        const order = await PaymentOrder.findOne({
            where: { id: req.params.id, userId: req.user.id }
        });

        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        if (order.status !== 'PENDING') {
            return res.status(400).json({ success: false, message: 'Order cannot be confirmed' });
        }

        order.status = 'USER_CONFIRMED';
        order.userConfirmedAt = new Date();
        await order.save();

        // Get user info
        const user = await User.findByPk(req.user.id);

        // Notify admin
        const adminEmailHtml = `
      <h2>Paiement confirmé par l'utilisateur</h2>
      <p><strong>Numéro de commande:</strong> ${order.orderNumber}</p>
      <p><strong>Client:</strong> ${user.firstName} ${user.lastName} (${user.email})</p>
      <p><strong>Type:</strong> ${order.paymentType === 'SUBSCRIPTION' ? 'Abonnement ' + order.subscriptionPlan : 'Extension stockage ' + order.storageGB + ' GB'}</p>
      <p><strong>Montant:</strong> ${order.amount} TND</p>
      <p><strong>L'utilisateur confirme avoir effectué le virement bancaire.</strong></p>
      <p style="color: #c62828;">Veuillez vérifier la réception du paiement et valider la commande.</p>
      <p><a href="https://storiom.com/superadmin/payment-orders">Valider dans l'interface admin</a></p>
    `;
        await sendMail(ADMIN_EMAIL, `⚠️ Paiement à vérifier #${order.orderNumber}`, adminEmailHtml);

        res.json({ success: true, message: 'Payment confirmation sent', order });
    } catch (error) {
        res.status(500).json({ success: false, message: error.toString() });
    }
});

// User cancels their own order
router.post('/:id/cancel', utility.authenticate, async (req, res) => {
    try {
        const order = await PaymentOrder.findOne({
            where: { id: req.params.id, userId: req.user.id }
        });

        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        if (order.status !== 'PENDING') {
            return res.status(400).json({ success: false, message: 'Seules les commandes en attente peuvent être annulées' });
        }

        order.status = 'CANCELLED';
        order.notes = 'Annulée par l\'utilisateur';
        await order.save();

        res.json({ success: true, message: 'Commande annulée', order });
    } catch (error) {
        res.status(500).json({ success: false, message: error.toString() });
    }
});

// ============================================
// ADMIN ROUTES
// ============================================

// Get all orders (admin only)
router.get('/admin/all', utility.authenticate, async (req, res) => {
    try {
        // TODO: Add proper admin check
        const { status } = req.query;
        const where = status ? { status } : {};

        const orders = await PaymentOrder.findAll({
            where,
            include: [{ model: User, as: 'user', attributes: ['id', 'firstName', 'lastName', 'email'] }],
            order: [['createdAt', 'DESC']]
        });
        res.json({ success: true, orders });
    } catch (error) {
        res.status(500).json({ success: false, message: error.toString() });
    }
});

// Validate payment (admin only)
router.post('/admin/:id/validate', utility.authenticate, async (req, res) => {
    try {
        const { bankReference, notes } = req.body;
        const adminId = req.user.id;

        const order = await PaymentOrder.findByPk(req.params.id, {
            include: [{ model: User, as: 'user' }]
        });

        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        if (order.status === 'PAID') {
            return res.status(400).json({ success: false, message: 'Order already paid' });
        }

        // Update order
        order.status = 'PAID';
        order.bankReference = bankReference;
        order.validatedAt = new Date();
        order.validatedBy = adminId;
        order.notes = notes;
        await order.save();

        // Process based on payment type
        if (order.paymentType === 'SUBSCRIPTION') {
            // Debug log
            console.log('Processing subscription order:', {
                orderId: order.id,
                userId: order.userId,
                subscriptionPlan: order.subscriptionPlan
            });

            if (!order.subscriptionPlan) {
                console.error('ERROR: subscriptionPlan is null or undefined for order:', order.id);
                return res.status(400).json({ success: false, message: 'Plan d\'abonnement invalide' });
            }

            // Renew subscription
            let subscription = await Subscription.findOne({ where: { userId: order.userId } });

            const now = new Date();
            let startDate = now;

            // If subscription exists and not expired, extend from expiration date
            if (subscription && subscription.expirationDate > now) {
                startDate = new Date(subscription.expirationDate);
                console.log('Extending from existing expiration:', subscription.expirationDate);
            } else {
                console.log('Starting new subscription from now');
            }

            const expirationDate = calculateExpirationDate(order.subscriptionPlan, startDate);
            console.log('New expiration date calculated:', expirationDate);

            if (subscription) {
                subscription.duration = order.subscriptionPlan;
                subscription.paymentDate = now;
                subscription.activationDate = startDate;
                subscription.expirationDate = expirationDate;
                await subscription.save();
            } else {
                subscription = await Subscription.create({
                    userId: order.userId,
                    duration: order.subscriptionPlan,
                    paymentDate: now,
                    activationDate: now,
                    expirationDate: expirationDate
                });
            }

            // Send confirmation email to user
            const userEmailHtml = `
        <h2>Votre abonnement a été activé !</h2>
        <p>Bonjour ${order.user.firstName},</p>
        <p>Votre paiement pour la commande <strong>#${order.orderNumber}</strong> a été reçu et validé.</p>
        <p><strong>Détails de l'abonnement:</strong></p>
        <ul>
          <li>Plan: ${order.subscriptionPlan}</li>
          <li>Valide jusqu'au: ${expirationDate.toLocaleDateString('fr-FR')}</li>
        </ul>
        <p>Merci pour votre confiance !</p>
        <p>L'équipe Storiom</p>
      `;
            await sendMail(order.user.email, 'Votre abonnement Storiom est activé !', userEmailHtml);

        } else if (order.paymentType === 'STORAGE_EXTENSION') {
            // Add storage to user's store
            const store = await Store.findOne({ where: { userId: order.userId } });
            if (store) {
                const additionalBytes = order.storageGB * 1024 * 1024 * 1024;
                store.purchasedStorageBytes = (parseInt(store.purchasedStorageBytes) || 0) + additionalBytes;

                // Calculate duration months from storageDuration
                const durationMonths = {
                    '1M': 1, '3M': 3, '6M': 6, '12M': 12
                }[order.storageDuration || '1M'] || 1;

                // Calculate expiration date for this purchase
                const purchaseExpiration = new Date();
                purchaseExpiration.setMonth(purchaseExpiration.getMonth() + durationMonths);

                // Create StoragePurchase record
                await StoragePurchase.create({
                    storeId: store.id,
                    userId: order.userId,
                    paymentOrderId: order.id,
                    sizeGB: order.storageGB,
                    duration: order.storageDuration || '1M',
                    purchasedAt: new Date(),
                    expiresAt: purchaseExpiration,
                    amount: order.amount,
                    currency: order.currency
                });

                // Update store's overall expiration (use latest expiration)
                if (!store.purchasedStorageExpiresAt || purchaseExpiration > new Date(store.purchasedStorageExpiresAt)) {
                    store.purchasedStorageExpiresAt = purchaseExpiration;
                }

                await store.save();
            }

            // Send confirmation email to user
            const durationLabel = { '1M': '1 mois', '3M': '3 mois', '6M': '6 mois', '12M': '12 mois' }[order.storageDuration || '1M'];
            const expirationDate = store ? store.purchasedStorageExpiresAt : new Date();
            const userEmailHtml = `
        <h2>Votre stockage a été augmenté !</h2>
        <p>Bonjour ${order.user.firstName},</p>
        <p>Votre paiement pour la commande <strong>#${order.orderNumber}</strong> a été reçu et validé.</p>
        <p><strong>${order.storageGB} GB</strong> de stockage supplémentaire ont été ajoutés pour <strong>${durationLabel}</strong>.</p>
        <p><strong>Expiration:</strong> ${new Date(expirationDate).toLocaleDateString('fr-FR')}</p>
        <p>Merci pour votre confiance !</p>
        <p>L'équipe Storiom</p>
      `;
            await sendMail(order.user.email, 'Stockage supplémentaire ajouté !', userEmailHtml);
        }

        res.json({ success: true, message: 'Order validated and processed', order });
    } catch (error) {
        console.error('Error validating order:', error);
        res.status(500).json({ success: false, message: error.toString() });
    }
});

// Cancel order (admin only)
router.post('/admin/:id/cancel', utility.authenticate, async (req, res) => {
    try {
        const { notes } = req.body;
        const order = await PaymentOrder.findByPk(req.params.id);

        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        order.status = 'CANCELLED';
        order.notes = notes;
        await order.save();

        res.json({ success: true, message: 'Order cancelled', order });
    } catch (error) {
        res.status(500).json({ success: false, message: error.toString() });
    }
});

module.exports = router;
