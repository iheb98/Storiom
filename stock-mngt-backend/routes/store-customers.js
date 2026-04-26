const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const { StoreCustomer, Store, Address, Order, OrderItem, Product, Review } = require('../models');
const utility = require('../utility');
const sendMail = require('../mailService');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;

// ========================================
// Middleware: extract storeId from body or token
// ========================================
const authenticateCustomer = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.sendStatus(401);
    jwt.verify(token, process.env.SECRET, (err, decoded) => {
        if (err) return res.sendStatus(403);
        if (decoded.type !== 'store-customer') return res.sendStatus(403);
        req.customer = decoded;
        next();
    });
};

// ========================================
// REGISTER
// ========================================
router.post('/register', async (req, res) => {
    const { firstName, lastName, email, phone, password, storeId, address } = req.body;

    if (!email || !password || !storeId) {
        return res.status(400).json({ success: false, message: 'Email, mot de passe et storeId sont requis.' });
    }

    try {
        // Check store exists
        const store = await Store.findByPk(storeId, {
            include: [{ model: Address, as: 'address' }]
        });
        if (!store) {
            return res.status(404).json({ success: false, message: 'Boutique introuvable.' });
        }

        // Check if email already registered for this store
        const existing = await StoreCustomer.findOne({
            where: { email: email.toLowerCase(), storeId }
        });
        if (existing) {
            return res.json({ success: false, errorType: 'EMAIL_FOUND', message: 'Cette adresse e-mail est déjà utilisée pour cette boutique.' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const confirmationToken = crypto.randomBytes(32).toString('hex');
        const tokenExpiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24); // 24h

        const customer = await StoreCustomer.create({
            firstName,
            lastName,
            email: email.toLowerCase(),
            phone,
            password: hashedPassword,
            storeId,
            address: address || null,
            isConfirmed: false,
            confirmationToken,
            tokenExpiresAt
        });

        // Build confirmation URL using store's custom domain or fallback
        let baseUrl = 'https://storiom.com';
        if (store.customDomain && store.domainVerified) {
            baseUrl = `https://${store.customDomain}`;
        }
        const confirmUrl = `${baseUrl}/store-home/confirm?token=${confirmationToken}`;

        const emailHtml = `
        <!DOCTYPE html>
        <html lang="fr">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f7fa;">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f5f7fa; padding: 40px 20px;">
                <tr>
                    <td align="center">
                        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);">
                            <tr>
                                <td style="background: linear-gradient(135deg, #4f46e5 0%, #3730a3 100%); padding: 40px 40px 50px; text-align: center;">
                                    <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 700;">
                                        Bienvenue chez ${store.name} !
                                    </h1>
                                </td>
                            </tr>
                            <tr>
                                <td style="padding: 40px;">
                                    <h2 style="margin: 0 0 15px; color: #2c3e50; font-size: 20px;">
                                        Bonjour ${firstName || 'Client'} 👋
                                    </h2>
                                    <p style="margin: 0 0 25px; color: #7f8c8d; font-size: 16px; line-height: 1.6;">
                                        Merci de vous être inscrit. Veuillez confirmer votre adresse e-mail en cliquant sur le bouton ci-dessous.
                                    </p>
                                    <table role="presentation" cellspacing="0" cellpadding="0" style="margin: 30px auto;">
                                        <tr>
                                            <td align="center" style="background: linear-gradient(135deg, #4f46e5 0%, #3730a3 100%); border-radius: 12px;">
                                                <a href="${confirmUrl}" target="_blank" style="display: inline-block; padding: 18px 45px; color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 600;">
                                                    ✅ Confirmer mon compte
                                                </a>
                                            </td>
                                        </tr>
                                    </table>
                                    <div style="display: inline-block; background-color: #fff3e0; padding: 12px 20px; border-radius: 8px; margin-bottom: 20px;">
                                        <span style="color: #f57c00; font-size: 14px; font-weight: 500;">
                                            ⏱️ Ce lien expire dans 24 heures
                                        </span>
                                    </div>
                                    <p style="margin: 20px 0 0; color: #7f8c8d; font-size: 14px; line-height: 1.6;">
                                        Si le bouton ne fonctionne pas, copiez ce lien :<br>
                                        <a href="${confirmUrl}" style="color: #4f46e5; word-break: break-all;">${confirmUrl}</a>
                                    </p>
                                </td>
                            </tr>
                            <tr>
                                <td style="background-color: #f8f9fa; padding: 20px 40px; text-align: center; border-top: 1px solid #e8ecef;">
                                    <p style="margin: 0; color: #bdc3c7; font-size: 12px;">
                                        © ${new Date().getFullYear()} ${store.name}. Tous droits réservés.
                                    </p>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
        </body>
        </html>
        `;

        await sendMail(email, `Confirmez votre compte - ${store.name}`, emailHtml);

        res.json({
            success: true,
            message: 'Inscription réussie. Veuillez vérifier votre email pour confirmer votre compte.'
        });

    } catch (err) {
        console.error('Store customer register error:', err);
        res.status(500).json({ success: false, message: err.toString() });
    }
});

// ========================================
// CONFIRM ACCOUNT
// ========================================
router.post('/confirm', async (req, res) => {
    const { token } = req.body;
    try {
        const customer = await StoreCustomer.findOne({
            where: {
                confirmationToken: token,
                tokenExpiresAt: { [Op.gt]: new Date() }
            }
        });

        if (!customer) {
            return res.status(400).json({ success: false, message: 'Token invalide ou expiré.' });
        }

        customer.isConfirmed = true;
        customer.confirmationToken = null;
        customer.tokenExpiresAt = null;
        await customer.save();

        // Auto-login after confirmation
        const accessToken = utility.generateAccessToken({
            id: customer.id,
            storeId: customer.storeId,
            firstName: customer.firstName,
            lastName: customer.lastName,
            type: 'store-customer'
        });
        const refreshToken = await utility.generateRefreshToken({
            id: customer.id,
            storeId: customer.storeId,
            firstName: customer.firstName,
            lastName: customer.lastName,
            type: 'store-customer'
        });

        res.json({ success: true, message: 'Compte confirmé avec succès.', accessToken, refreshToken });
    } catch (err) {
        console.error('Confirm error:', err);
        res.status(500).json({ success: false, message: err.toString() });
    }
});

// ========================================
// LOGIN
// ========================================
router.post('/login', async (req, res) => {
    const { email, password, storeId } = req.body;

    if (!email || !password || !storeId) {
        return res.status(400).json({ success: false, message: 'Email, mot de passe et storeId sont requis.' });
    }

    try {
        const customer = await StoreCustomer.findOne({
            where: { email: email.toLowerCase(), storeId }
        });

        if (!customer) {
            return res.json({ success: false, errorType: 'EMAIL_ERROR', message: 'Aucun compte trouvé avec cet email.' });
        }

        if (!customer.isConfirmed) {
            return res.json({ success: false, errorType: 'NOT_CONFIRMED', message: 'Veuillez confirmer votre email avant de vous connecter.' });
        }

        const isMatch = await bcrypt.compare(password, customer.password);
        if (!isMatch) {
            return res.json({ success: false, errorType: 'PASSWORD_ERROR', message: 'Mot de passe incorrect.' });
        }

        const accessToken = utility.generateAccessToken({
            id: customer.id,
            storeId: customer.storeId,
            firstName: customer.firstName,
            lastName: customer.lastName,
            type: 'store-customer'
        });
        const refreshToken = await utility.generateRefreshToken({
            id: customer.id,
            storeId: customer.storeId,
            firstName: customer.firstName,
            lastName: customer.lastName,
            type: 'store-customer'
        });

        res.json({ success: true, accessToken, refreshToken });
    } catch (err) {
        console.error('Store customer login error:', err);
        res.status(500).json({ success: false, message: err.toString() });
    }
});

// ========================================
// FORGOT PASSWORD
// ========================================
router.post('/forgot-password', async (req, res) => {
    const { email, storeId } = req.body;

    if (!email || !storeId) {
        return res.status(400).json({ success: false, message: 'Email et storeId sont requis.' });
    }

    try {
        const customer = await StoreCustomer.findOne({
            where: { email: email.toLowerCase(), storeId }
        });

        if (!customer) {
            // Don't reveal if email exists
            return res.json({ success: true, message: 'Si un compte existe, un email a été envoyé.' });
        }

        const store = await Store.findByPk(storeId);
        const token = crypto.randomBytes(32).toString('hex');
        const expires = new Date(Date.now() + 1000 * 60 * 60); // 1 hour

        customer.resetPasswordToken = token;
        customer.resetPasswordExpires = expires;
        await customer.save();

        // Build reset URL using store's custom domain
        let baseUrl = 'https://storiom.com';
        if (store && store.customDomain && store.domainVerified) {
            baseUrl = `https://${store.customDomain}`;
        }
        const resetUrl = `${baseUrl}/store-home/reset-password/${token}`;
        const storeName = store ? store.name : 'Boutique';

        const emailHtml = `
        <!DOCTYPE html>
        <html lang="fr">
        <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
        <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f7fa;">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f5f7fa; padding: 40px 20px;">
                <tr>
                    <td align="center">
                        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);">
                            <tr>
                                <td style="background: linear-gradient(135deg, #4f46e5 0%, #3730a3 100%); padding: 40px; text-align: center;">
                                    <h1 style="margin: 0; color: #ffffff; font-size: 24px;">🔐 Réinitialisation de mot de passe</h1>
                                </td>
                            </tr>
                            <tr>
                                <td style="padding: 40px;">
                                    <h2 style="margin: 0 0 15px; color: #2c3e50; font-size: 20px;">Bonjour ${customer.firstName || 'Client'} 👋</h2>
                                    <p style="margin: 0 0 25px; color: #7f8c8d; font-size: 16px; line-height: 1.6;">
                                        Nous avons reçu une demande de réinitialisation de votre mot de passe pour votre compte ${storeName}.
                                    </p>
                                    <table role="presentation" cellspacing="0" cellpadding="0" style="margin: 30px auto;">
                                        <tr>
                                            <td align="center" style="background: linear-gradient(135deg, #4f46e5 0%, #3730a3 100%); border-radius: 12px;">
                                                <a href="${resetUrl}" target="_blank" style="display: inline-block; padding: 18px 45px; color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 600;">
                                                    🔓 Réinitialiser mon mot de passe
                                                </a>
                                            </td>
                                        </tr>
                                    </table>
                                    <div style="display: inline-block; background-color: #fff3e0; padding: 12px 20px; border-radius: 8px;">
                                        <span style="color: #f57c00; font-size: 14px; font-weight: 500;">⏱️ Ce lien expire dans 1 heure</span>
                                    </div>
                                    <p style="margin: 20px 0 0; color: #7f8c8d; font-size: 14px;">
                                        Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.
                                    </p>
                                </td>
                            </tr>
                            <tr>
                                <td style="background-color: #f8f9fa; padding: 20px 40px; text-align: center; border-top: 1px solid #e8ecef;">
                                    <p style="margin: 0; color: #bdc3c7; font-size: 12px;">© ${new Date().getFullYear()} ${storeName}</p>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
        </body>
        </html>
        `;

        await sendMail(email, `Réinitialisation de mot de passe - ${storeName}`, emailHtml);
        res.json({ success: true, message: 'Si un compte existe, un email a été envoyé.' });
    } catch (err) {
        console.error('Forgot password error:', err);
        res.status(500).json({ success: false, message: err.toString() });
    }
});

// ========================================
// RESET PASSWORD
// ========================================
router.post('/reset-password', async (req, res) => {
    const { token, newPassword } = req.body;

    try {
        const customer = await StoreCustomer.findOne({
            where: {
                resetPasswordToken: token,
                resetPasswordExpires: { [Op.gt]: new Date() }
            }
        });

        if (!customer) {
            return res.status(400).json({ success: false, message: 'Token invalide ou expiré.' });
        }

        const hashed = await bcrypt.hash(newPassword, 10);
        customer.password = hashed;
        customer.resetPasswordToken = null;
        customer.resetPasswordExpires = null;
        await customer.save();

        res.json({ success: true, message: 'Mot de passe réinitialisé avec succès.' });
    } catch (err) {
        console.error('Reset password error:', err);
        res.status(500).json({ success: false, message: err.toString() });
    }
});

// ========================================
// GET PROFILE (authenticated)
// ========================================
router.get('/profile', authenticateCustomer, async (req, res) => {
    try {
        const customer = await StoreCustomer.findByPk(req.customer.id);
        if (!customer) return res.status(404).json({ success: false, message: 'Client non trouvé.' });
        res.json({ success: true, customer });
    } catch (err) {
        res.status(500).json({ success: false, message: err.toString() });
    }
});

// ========================================
// UPDATE PROFILE (authenticated)
// ========================================
router.put('/profile', authenticateCustomer, async (req, res) => {
    try {
        const customer = await StoreCustomer.findByPk(req.customer.id);
        if (!customer) return res.status(404).json({ success: false, message: 'Client non trouvé.' });

        const { firstName, lastName, phone, address } = req.body;
        if (firstName !== undefined) customer.firstName = firstName;
        if (lastName !== undefined) customer.lastName = lastName;
        if (phone !== undefined) customer.phone = phone;
        if (address !== undefined) customer.address = address;
        // Force Sequelize to detect JSONB changes
        customer.changed('address', true);
        await customer.save();

        res.json({ success: true, customer, message: 'Profil mis à jour.' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.toString() });
    }
});

// ========================================
// TOKEN REFRESH
// ========================================
router.post('/token', async (req, res) => {
    const { RefreshToken } = require('../models');
    const refreshToken = req.body.token;
    if (!refreshToken) return res.sendStatus(401);

    try {
        const foundToken = await RefreshToken.findOne({ where: { value: refreshToken } });
        if (!foundToken) return res.sendStatus(403);

        jwt.verify(refreshToken, process.env.SECRET, async (err, tokenData) => {
            if (err) return res.sendStatus(403);
            if (tokenData.type !== 'store-customer') return res.sendStatus(403);

            const customer = await StoreCustomer.findByPk(tokenData.id);
            if (!customer) return res.sendStatus(500);

            const accessToken = utility.generateAccessToken({
                id: customer.id,
                storeId: customer.storeId,
                firstName: customer.firstName,
                lastName: customer.lastName,
                type: 'store-customer'
            });
            res.json({ accessToken });
        });
    } catch (err) {
        res.sendStatus(500);
    }
});
// ========================================
// PLACE ORDER (store customer checkout)
// ========================================
router.post('/place-order', authenticateCustomer, async (req, res) => {
    try {
        const customerId = req.customer.id;
        const storeId = req.customer.storeId;
        const { items, customerName, customerPhone, customerAddress, notes } = req.body;

        // items = [{ productId, quantity }]
        if (!items || !items.length) {
            return res.status(400).json({ success: false, message: 'Le panier est vide.' });
        }

        const customer = await StoreCustomer.findByPk(customerId);
        if (!customer) {
            return res.status(404).json({ success: false, message: 'Client non trouvé.' });
        }

        let totalAmount = 0;
        const orderItems = [];

        // Validate products and calculate total
        for (const item of items) {
            const product = await Product.findByPk(item.productId);
            if (!product || product.storeId !== storeId) {
                return res.status(400).json({ success: false, message: `Produit #${item.productId} introuvable.` });
            }

            let price = product.sellingPrice;
            if (product.discount && product.discount > 0) {
                price = product.sellingPrice * (1 - product.discount / 100);
            }

            totalAmount += price * item.quantity;
            orderItems.push({ productId: product.id, quantity: item.quantity, price });
        }

        // Create order
        const order = await Order.create({
            storeId,
            storeCustomerId: customerId,
            userId: null,
            status: 'PENDING',
            totalAmount,
            customerName: customerName || `${customer.firstName} ${customer.lastName}`,
            customerPhone: customerPhone || customer.phone,
            customerAddress: customerAddress || [customer.address?.street, customer.address?.city, customer.address?.state, customer.address?.postalCode].filter(Boolean).join(', ') || '',
            notes: notes || ''
        });

        // Create order items
        for (const item of orderItems) {
            await OrderItem.create({
                orderId: order.id,
                productId: item.productId,
                quantity: item.quantity,
                price: item.price
            });
        }

        res.json({ success: true, order });
    } catch (err) {
        console.error('Place order error:', err);
        res.status(500).json({ success: false, message: err.toString() });
    }
});

// ========================================
// MY ORDERS (store customer)
// ========================================
router.get('/my-orders', authenticateCustomer, async (req, res) => {
    try {
        const orders = await Order.findAll({
            where: { storeCustomerId: req.customer.id, storeId: req.customer.storeId },
            include: [
                {
                    model: OrderItem,
                    as: 'items',
                    include: [{ model: Product, as: 'product' }]
                }
            ],
            order: [['createdAt', 'DESC']]
        });
        res.json({ success: true, orders });
    } catch (err) {
        res.status(500).json({ success: false, message: err.toString() });
    }
});

// ========================================
// SUBMIT REVIEW (store customer)
// ========================================
router.post('/reviews', authenticateCustomer, async (req, res) => {
    const { rating, comment, productId } = req.body;
    const customerId = req.customer.id;
    const storeId = req.customer.storeId;

    if (!rating || !productId) {
        return res.status(400).json({ success: false, message: 'Note et produit requis.' });
    }

    try {
        // Verify product belongs to this store
        const product = await Product.findByPk(productId);
        if (!product || product.storeId !== storeId) {
            return res.status(400).json({ success: false, message: 'Produit introuvable.' });
        }

        // Check for existing review by this customer on this product
        const existing = await Review.findOne({
            where: { storeCustomerId: customerId, productId: parseInt(productId) }
        });

        if (existing) {
            existing.rating = rating;
            existing.comment = comment;
            existing.status = 'approved';
            await existing.save();

            const updated = await Review.findOne({
                where: { id: existing.id },
                include: [{ model: StoreCustomer, as: 'storeCustomer', attributes: ['firstName', 'lastName'] }]
            });
            return res.json({ success: true, review: updated });
        }

        const newReview = await Review.create({
            rating,
            comment,
            productId: parseInt(productId),
            storeCustomerId: customerId,
            userId: null,
            status: 'approved'
        });

        const full = await Review.findOne({
            where: { id: newReview.id },
            include: [{ model: StoreCustomer, as: 'storeCustomer', attributes: ['firstName', 'lastName'] }]
        });
        res.json({ success: true, review: full });
    } catch (err) {
        console.error('Store review error:', err);
        res.status(500).json({ success: false, message: err.toString() });
    }
});

// ========================================
// GET STORE REVIEWS for a product (public)
// ========================================
router.get('/reviews/:productId', async (req, res) => {
    try {
        const productId = parseInt(req.params.productId);
        const reviews = await Review.findAll({
            where: { productId, storeCustomerId: { [Op.ne]: null }, status: 'approved' },
            include: [{ model: StoreCustomer, as: 'storeCustomer', attributes: ['firstName', 'lastName'] }],
            order: [['createdAt', 'DESC']]
        });
        res.json({ success: true, reviews });
    } catch (err) {
        res.status(500).json({ success: false, message: err.toString() });
    }
});

// ========================================
// CART ROUTES (store customer)
// ========================================

const { CartItem } = require('../models');

// GET CART
router.get('/cart', authenticateCustomer, async (req, res) => {
    try {
        const customerId = req.customer.id;
        const items = await CartItem.findAll({
            where: { storeCustomerId: customerId },
            include: [{ model: Product, as: 'product' }]
        });
        res.json(items);
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// ADD TO CART
router.post('/cart/add', authenticateCustomer, async (req, res) => {
    try {
        const customerId = req.customer.id;
        const { productId, quantity } = req.body;

        let item = await CartItem.findOne({ where: { storeCustomerId: customerId, productId } });

        if (item) {
            item.quantity += (quantity || 1);
            await item.save();
        } else {
            item = await CartItem.create({ storeCustomerId: customerId, productId, quantity: quantity || 1 });
        }

        res.json({ success: true, item });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// UPDATE CART QUANTITY
router.put('/cart/update', authenticateCustomer, async (req, res) => {
    try {
        const customerId = req.customer.id;
        const { productId, quantity } = req.body;

        const item = await CartItem.findOne({ where: { storeCustomerId: customerId, productId } });

        if (!item) {
            return res.status(404).json({ success: false, message: "Item not found" });
        }

        item.quantity = quantity;
        await item.save();

        res.json({ success: true, item });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// REMOVE ITEM FROM CART
router.delete('/cart/:productId', authenticateCustomer, async (req, res) => {
    try {
        const customerId = req.customer.id;
        const productId = req.params.productId;

        await CartItem.destroy({ where: { storeCustomerId: customerId, productId } });

        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// CLEAR FULL CART
router.delete('/cart', authenticateCustomer, async (req, res) => {
    try {
        const customerId = req.customer.id;
        await CartItem.destroy({ where: { storeCustomerId: customerId } });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
