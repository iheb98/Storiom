const express = require('express');
const router = express.Router();
const { StoreService, Store } = require('../models');
const utility = require('../utility');

// GET all services for a store
router.get('/store/:storeId', async (req, res) => {
    try {
        const storeId = req.params.storeId;
        const services = await StoreService.findAll({
            where: { storeId },
            order: [['createdAt', 'DESC']]
        });
        res.json(services);
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// GET active services for a store (public)
router.get('/store/:storeId/active', async (req, res) => {
    try {
        const storeId = req.params.storeId;
        const services = await StoreService.findAll({
            where: { storeId, isActive: true },
            order: [['category', 'ASC'], ['name', 'ASC']]
        });
        res.json(services);
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// GET single service
router.get('/:id', async (req, res) => {
    try {
        const service = await StoreService.findByPk(req.params.id, {
            include: [{ model: Store, as: 'store' }]
        });
        if (!service) {
            return res.status(404).json({ success: false, message: 'Service not found' });
        }
        res.json(service);
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// CREATE service
router.post('/', utility.authenticate, async (req, res) => {
    try {
        const service = await StoreService.create({
            name: req.body.name,
            description: req.body.description,
            price: req.body.price || 0,
            estimatedDuration: req.body.estimatedDuration,
            category: req.body.category || 'general',
            image: req.body.image,
            isActive: req.body.isActive !== false,
            storeId: req.body.storeId
        });
        res.status(201).json(service);
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// UPDATE service
router.put('/:id', utility.authenticate, async (req, res) => {
    try {
        const service = await StoreService.findByPk(req.params.id);
        if (!service) {
            return res.status(404).json({ success: false, message: 'Service not found' });
        }

        await service.update({
            name: req.body.name,
            description: req.body.description,
            price: req.body.price,
            estimatedDuration: req.body.estimatedDuration,
            category: req.body.category,
            image: req.body.image,
            isActive: req.body.isActive,
            isPriceVariable: req.body.isPriceVariable,
        });

        res.json(service);
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// DELETE service
router.delete('/:id', utility.authenticate, async (req, res) => {
    try {
        const service = await StoreService.findByPk(req.params.id);
        if (!service) {
            return res.status(404).json({ success: false, message: 'Service not found' });
        }

        await service.destroy();
        res.json({ success: true, message: 'Service deleted' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
