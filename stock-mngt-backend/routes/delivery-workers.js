const express = require('express');
const router = express.Router();
const { DeliveryWorker } = require('../models');

// Get all delivery workers for a store
router.get('/store/:id', async (req, res) => {
    try {
        const deliveryWorkers = await DeliveryWorker.findAll({
            where: { storeId: req.params.id },
            order: [['createdAt', 'DESC']]
        });
        res.json(deliveryWorkers);
    } catch (error) {
        console.error('Error fetching delivery workers:', error);
        res.status(500).json({ message: 'Error fetching delivery workers' });
    }
});

// Get single delivery worker
router.get('/:id', async (req, res) => {
    try {
        const deliveryWorker = await DeliveryWorker.findByPk(req.params.id);
        if (!deliveryWorker) {
            return res.status(404).json({ message: 'Delivery worker not found' });
        }
        res.json(deliveryWorker);
    } catch (error) {
        console.error('Error fetching delivery worker:', error);
        res.status(500).json({ message: 'Error fetching delivery worker' });
    }
});

// Create delivery worker
router.post('/', async (req, res) => {
    try {
        const deliveryWorker = await DeliveryWorker.create({
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: req.body.email,
            phone: req.body.phone,
            whatsapp: req.body.whatsapp,
            description: req.body.description,
            supportedStates: req.body.supportedStates || [],
            storeId: req.body.storeId,
            sendEmail: req.body.sendEmail,
            sendWhatsApp: req.body.sendWhatsApp,
            sendSMS: req.body.sendSMS
        });
        res.status(201).json(deliveryWorker);
    } catch (error) {
        console.error('Error creating delivery worker:', error);
        res.status(500).json({ message: 'Error creating delivery worker' });
    }
});

// Update delivery worker
router.put('/:id', async (req, res) => {
    try {
        const deliveryWorker = await DeliveryWorker.findByPk(req.params.id);
        if (!deliveryWorker) {
            return res.status(404).json({ message: 'Delivery worker not found' });
        }

        await deliveryWorker.update({
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: req.body.email,
            phone: req.body.phone,
            whatsapp: req.body.whatsapp,
            description: req.body.description,
            supportedStates: req.body.supportedStates,
            sendEmail: req.body.sendEmail,
            sendWhatsApp: req.body.sendWhatsApp,
            sendSMS: req.body.sendSMS
        });

        res.json(deliveryWorker);
    } catch (error) {
        console.error('Error updating delivery worker:', error);
        res.status(500).json({ message: 'Error updating delivery worker' });
    }
});

// Delete delivery worker
router.delete('/:id', async (req, res) => {
    try {
        const deliveryWorker = await DeliveryWorker.findByPk(req.params.id);
        if (!deliveryWorker) {
            return res.status(404).json({ message: 'Delivery worker not found' });
        }

        await deliveryWorker.destroy();
        res.json({ message: 'Delivery worker deleted successfully' });
    } catch (error) {
        console.error('Error deleting delivery worker:', error);
        res.status(500).json({ message: 'Error deleting delivery worker' });
    }
});

module.exports = router;
