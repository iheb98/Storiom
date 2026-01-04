const express = require('express');
const router = express.Router();
const { ServiceRequest, StoreService, Store, User } = require('../models');
const utility = require('../utility');

// Generate random tracking code (8 characters alphanumeric)
function generateTrackingCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}

// GET customer's service requests
router.get('/my-requests', utility.authenticate, async (req, res) => {
    try {
        const userId = req.user.id;
        const requests = await ServiceRequest.findAll({
            where: { userId },
            include: [
                { model: StoreService, as: 'service' },
                { model: Store, as: 'store' }
            ],
            order: [['createdAt', 'DESC']]
        });
        res.json(requests);
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// PUBLIC: Lookup service requests by phone and tracking code (for guests)
router.post('/lookup', async (req, res) => {
    try {
        const { phone, code } = req.body;

        if (!phone || !code) {
            return res.status(400).json({
                success: false,
                message: 'Numéro de téléphone et code requis'
            });
        }

        const requests = await ServiceRequest.findAll({
            where: {
                guestPhone: phone,
                trackingCode: code.toUpperCase()
            },
            include: [
                { model: StoreService, as: 'service' },
                { model: Store, as: 'store' }
            ],
            order: [['createdAt', 'DESC']]
        });

        if (requests.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Aucune demande trouvée avec ces informations'
            });
        }

        // Return requests with tracking code visible for this lookup
        const requestsWithCode = requests.map(r => ({
            ...r.get(),
            userId: undefined,
            user_id: undefined,
            store_id: undefined
        }));

        res.json(requestsWithCode);
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// GET store's service requests (admin)
router.get('/store/:storeId', utility.authenticate, async (req, res) => {
    try {
        const storeId = req.params.storeId;
        const requests = await ServiceRequest.findAll({
            where: { storeId },
            include: [
                { model: StoreService, as: 'service' },
                { model: User, as: 'user', attributes: ['id', 'firstName', 'lastName', 'email', 'phone'] }
            ],
            order: [['createdAt', 'DESC']]
        });

        // Include guest info and tracking code for admin view
        const requestsWithDetails = requests.map(r => {
            const data = r.get();
            return {
                ...data,
                userId: undefined,
                user_id: undefined,
                store_id: undefined,
                // Include tracking code for admin
                trackingCode: data.trackingCode
            };
        });

        res.json(requestsWithDetails);
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// GET single service request
router.get('/:id', utility.authenticate, async (req, res) => {
    try {
        const request = await ServiceRequest.findByPk(req.params.id, {
            include: [
                { model: StoreService, as: 'service' },
                { model: Store, as: 'store' },
                { model: User, as: 'user', attributes: ['id', 'firstName', 'lastName', 'email', 'phone'] }
            ]
        });
        if (!request) {
            return res.status(404).json({ success: false, message: 'Request not found' });
        }

        // Include tracking code for admin view
        const data = request.get();
        res.json({
            ...data,
            userId: undefined,
            user_id: undefined,
            store_id: undefined,
            trackingCode: data.trackingCode
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// CREATE service request (customer - logged in user)
router.post('/', utility.authenticate, async (req, res) => {
    try {
        const userId = req.user.id;

        // Get the service to get its price and store
        const service = await StoreService.findByPk(req.body.storeServiceId);
        if (!service) {
            return res.status(404).json({ success: false, message: 'Service not found' });
        }

        // Get user info for tracking lookup
        const user = await User.findByPk(userId);

        // Generate tracking code for all requests
        const trackingCode = generateTrackingCode();

        const request = await ServiceRequest.create({
            userId,
            storeId: service.storeId,
            storeServiceId: req.body.storeServiceId,
            customerNote: req.body.customerNote,
            price: req.body.price || service.price,
            status: 'PENDING',
            trackingCode,
            // Store user's phone for lookup compatibility
            guestPhone: user?.phone || null,
            guestName: user ? `${user.firstName} ${user.lastName}` : null,
            guestEmail: user?.email || null
        });

        // Fetch with associations
        const fullRequest = await ServiceRequest.findByPk(request.id, {
            include: [
                { model: StoreService, as: 'service' },
                { model: Store, as: 'store' }
            ]
        });

        // Return with tracking code visible
        res.status(201).json({
            ...fullRequest.get(),
            trackingCode
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
});


// CREATE service request for guest (admin - for customers without account)
router.post('/guest', utility.authenticate, async (req, res) => {
    try {
        const { storeServiceId, storeId, guestName, guestPhone, guestEmail, customerNote, price } = req.body;

        // Validate required fields
        if (!storeServiceId || !storeId) {
            return res.status(400).json({
                success: false,
                message: 'Service et boutique requis'
            });
        }

        if (!guestPhone) {
            return res.status(400).json({
                success: false,
                message: 'Numéro de téléphone requis pour le client'
            });
        }

        // Get the service to get its price
        const service = await StoreService.findByPk(storeServiceId);
        if (!service) {
            return res.status(404).json({ success: false, message: 'Service not found' });
        }

        // Generate unique tracking code
        let trackingCode = generateTrackingCode();

        // Ensure uniqueness (very unlikely to conflict, but safe)
        let existingWithCode = await ServiceRequest.findOne({ where: { trackingCode } });
        while (existingWithCode) {
            trackingCode = generateTrackingCode();
            existingWithCode = await ServiceRequest.findOne({ where: { trackingCode } });
        }

        const request = await ServiceRequest.create({
            userId: null, // Guest request
            storeId,
            storeServiceId,
            guestName,
            guestPhone,
            guestEmail,
            trackingCode,
            customerNote,
            price: price || service.price,
            status: 'PENDING'
        });

        // Fetch with associations
        const fullRequest = await ServiceRequest.findByPk(request.id, {
            include: [
                { model: StoreService, as: 'service' },
                { model: Store, as: 'store' }
            ]
        });

        // Return with tracking code visible
        const data = fullRequest.get();
        res.status(201).json({
            ...data,
            userId: undefined,
            user_id: undefined,
            store_id: undefined,
            trackingCode: trackingCode // Include for admin to share with customer
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// UPDATE service request status (admin)
router.put('/:id/status', utility.authenticate, async (req, res) => {
    try {
        const request = await ServiceRequest.findByPk(req.params.id, {
            include: [
                { model: StoreService, as: 'service' },
                { model: Store, as: 'store' },
                { model: User, as: 'user', attributes: ['id', 'firstName', 'lastName', 'email', 'phone'] }
            ]
        });
        if (!request) {
            return res.status(404).json({ success: false, message: 'Request not found' });
        }

        const { status, adminNote, price } = req.body;
        const previousStatus = request.status;
        const updates = { status };

        if (adminNote !== undefined) {
            updates.adminNote = adminNote;
        }

        // Update price if provided (especially for COMPLETED status)
        if (price !== undefined && price !== null) {
            updates.price = price;
        }

        // Set timestamps based on status
        if (status === 'IN_PROGRESS' && !request.startedAt) {
            updates.startedAt = new Date();
        }
        if (status === 'COMPLETED' && !request.completedAt) {
            updates.completedAt = new Date();
        }

        await request.update(updates);

        // Send email notification if status changed
        if (previousStatus !== status) {
            try {
                const sendMail = require('../mailService');
                const { serviceRequestStatusEmail } = require('../emailTemplates');

                // Status labels for email
                const statusLabels = {
                    PENDING: 'En attente',
                    IN_PROGRESS: 'En cours',
                    COMPLETED: 'Terminé',
                    CANCELLED: 'Annulé'
                };

                // Get recipient email (either registered user or guest)
                const recipientEmail = request.user?.email || request.guestEmail;
                const customerName = request.user
                    ? `${request.user.firstName} ${request.user.lastName}`
                    : request.guestName || 'Client';

                // Get store owner email for CC
                const storeOwner = await User.findByPk(request.store?.userId);
                const storeOwnerEmail = storeOwner?.email;

                if (recipientEmail) {
                    const emailData = {
                        customerName,
                        serviceName: request.service?.name || 'Service',
                        storeName: request.store?.name || 'Boutique',
                        status,
                        statusLabel: statusLabels[status] || status,
                        trackingCode: request.trackingCode,
                        adminNote: updates.adminNote || request.adminNote,
                        trackUrl: `https://storiom.com/track-request`
                    };

                    const emailHtml = serviceRequestStatusEmail(emailData);
                    const emailSubject = `Votre demande #${request.id} - ${statusLabels[status]}`;

                    // Send email with CC to store owner
                    await sendMail(
                        recipientEmail,
                        emailSubject,
                        emailHtml,
                        storeOwnerEmail ? { cc: storeOwnerEmail } : {}
                    );

                    console.log(`Status change email sent to ${recipientEmail}${storeOwnerEmail ? `, CC: ${storeOwnerEmail}` : ''}`);
                }
            } catch (emailError) {
                console.error('Failed to send status change email:', emailError);
                // Don't fail the request if email fails
            }
        }

        res.json({ success: true, request });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
});


// UPDATE service request (admin - for notes, price)
router.put('/:id', utility.authenticate, async (req, res) => {
    try {
        const request = await ServiceRequest.findByPk(req.params.id);
        if (!request) {
            return res.status(404).json({ success: false, message: 'Request not found' });
        }

        await request.update({
            adminNote: req.body.adminNote,
            price: req.body.price
        });

        res.json({ success: true, request });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// DELETE service request
router.delete('/:id', utility.authenticate, async (req, res) => {
    try {
        const request = await ServiceRequest.findByPk(req.params.id);
        if (!request) {
            return res.status(404).json({ success: false, message: 'Request not found' });
        }

        await request.destroy();
        res.json({ success: true, message: 'Request deleted' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;

