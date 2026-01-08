const express = require('express');
const router = express.Router();
const { Store, Brand, Expense, Address, Subscription, StoragePurchase } = require('../models');
const utility = require('../utility');
const checkSubscription = require('../checkSubscription');

router.post('/create', utility.authenticate, async (req, res) => {
    try {
        const { name, logo, images, description, country, street, city, state, postalCode, phone, email, site, userId, isVisibleToPublic, isSupportingDeliveries } = req.body;

        const createdStore = await Store.create({
            name, logo, images: JSON.stringify(images), active: true, phone, email, site,
            description, userId, creatorUserId: req.user.id, isVisibleToPublic, isSupportingDeliveries
        });

        await Address.create({ storeId: createdStore.id, country, street, city, state, postalCode });

        // Create subscription for the user when they create their first store
        const existingSubscription = await Subscription.findOne({ where: { userId: req.user.id } });
        if (!existingSubscription) {
            await Subscription.create({
                userId: req.user.id,
                duration: 'TRIAL'
            });
        }

        res.json({ store: createdStore });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.toString()
        });
    }
})

router.put('/edit', utility.authenticate, checkSubscription, (req, res) => {
    const { name, logo, images, description, country, street, city, state, postalCode, phone, email, site, isVisibleToPublic, isSupportingDeliveries } = req.body
    Store.findOne({
        where: {
            id: req.body.id
        }, include: ['address']
    }).then(store => {
        store.name = name
        store.images = JSON.stringify(images)
        store.description = description
        store.phone = phone
        store.email = email
        store.site = site
        store.logo = logo ? logo : store.logo
        store.isVisibleToPublic = isVisibleToPublic
        store.isSupportingDeliveries = isSupportingDeliveries
        store.save().then(savedStore => {
            Address.findOne({
                where: {
                    id: store.address.id
                }
            }).then(address => {
                address.country = country
                address.street = street
                address.city = city
                address.state = state
                address.postalCode = postalCode
                address.save().then(savedAddress => {
                    res.json({ message: 'Store updated successfully!', success: true })
                })
            }).catch(err => {
                res.json(err)
            })
        }).catch(err => {
            res.json(err)
        })
    }).catch(err => {
        res.json(err)
    })
})

router.post('/expenses/create', utility.authenticate, checkSubscription, (req, res) => {
    const { amount, comment, date, storeId } = req.body
    Expense.create({ amount, comment, date, storeId }).then(createdExpense => {
        res.json({
            expense: createdExpense
        })
    }).catch(err => {
        res.status(500).json({
            success: false,
            message: err.toString()
        })
    })
})

router.get('/:id/expenses', utility.authenticate, checkSubscription, (req, res) => {
    const storeId = req.params.id;
    Expense.findAll({
        where: {
            storeId
        }
    }).then(store => {
        res.json(store)

    }).catch(err => {
        res.status(500).json({
            success: false,
            message: err.toString()
        })
    })
})

router.post('/brands/create', utility.authenticate, checkSubscription, (req, res) => {
    const { name, storeId } = req.body
    Brand.create({ name, storeId }).then(createdBrand => {
        res.json(createdBrand)
    }).catch(err => {
        res.status(500).json({
            success: false,
            message: err.toString()
        })
    })
})

router.get('/:id/brands', utility.authenticate, checkSubscription, (req, res) => {
    const storeId = req.params.id
    Brand.findAll({ where: { storeId } }).then(brands => {
        res.json(brands)
    }).catch(err => {
        res.status(500).json({
            success: false,
            message: err.toString()
        })
    })
})

router.get('/', (req, res, next) => {
    Store.findAll().then(stores => {
        res.json(stores)
    }).catch(err => {
        res.status(500).json({
            success: false,
            message: err.toString()
        })
    })
});

// Get the stores of a user by its id
router.get('/user/:id', utility.authenticate, checkSubscription, (req, res, next) => {
    const userId = req.params.id;
    Store.findAll({
        where: {
            userId
        }
    }).then(stores => {
        res.json(stores)
    }).catch(err => {
        res.status(500).json({
            success: false,
            message: err.toString()
        })
    })
});

router.delete('/:id', (req, res, next) => {
    const id = req.params.id;
    Store.destroy({
        where: {
            id
        }
    }).then(deletedRows => {
        if (deletedRows > 0)
            res.json({ success: true, message: "Store deleted" })
        else
            res.status(500).json({ success: false, message: "Store not found" })
    }).catch(err => {
        res.status(500).json({
            success: false,
            message: err.toString()
        })
    })
});

router.get('/:id', utility.authenticate, checkSubscription, (req, res, next) => {
    const id = req.params.id;
    Store.findOne({
        where: {
            id
        }, include: ['address']
    }).then(store => {
        res.json(store)

    }).catch(err => {
        res.status(500).json({
            success: false,
            message: err.toString()
        })
    })
});

// Get storage usage for a store
router.get('/:id/storage', utility.authenticate, checkSubscription, async (req, res) => {
    try {
        const id = req.params.id;
        const store = await Store.findOne({ where: { id } });

        if (!store) {
            return res.status(404).json({ success: false, message: 'Store not found' });
        }

        const usedBytes = parseInt(store.storageUsedBytes) || 0;
        const limitBytes = parseInt(store.storageLimitBytes) || 524288000; // 500 MB default
        const purchasedBytes = parseInt(store.purchasedStorageBytes) || 0;
        const storageExpiresAt = store.purchasedStorageExpiresAt;
        const isStorageExpired = storageExpiresAt ? new Date() > new Date(storageExpiresAt) : true;

        // If storage expired, don't count purchased storage
        const effectivePurchasedBytes = isStorageExpired ? 0 : purchasedBytes;
        const totalLimitBytes = limitBytes + effectivePurchasedBytes;
        const percentage = totalLimitBytes > 0 ? (usedBytes / totalLimitBytes) * 100 : 0;

        res.json({
            success: true,
            storageUsedBytes: usedBytes,
            storageUsedMB: (usedBytes / (1024 * 1024)).toFixed(2),
            storageUsedGB: (usedBytes / (1024 * 1024 * 1024)).toFixed(2),
            storageLimitBytes: limitBytes,
            storageLimitMB: (limitBytes / (1024 * 1024)).toFixed(2),
            storageLimitGB: (limitBytes / (1024 * 1024 * 1024)).toFixed(2),
            purchasedStorageBytes: purchasedBytes,
            purchasedStorageGB: (purchasedBytes / (1024 * 1024 * 1024)).toFixed(2),
            purchasedStorageExpiresAt: storageExpiresAt,
            isStorageExpired: isStorageExpired,
            effectivePurchasedBytes: effectivePurchasedBytes,
            totalLimitBytes: totalLimitBytes,
            totalLimitMB: (totalLimitBytes / (1024 * 1024)).toFixed(2),
            totalLimitGB: (totalLimitBytes / (1024 * 1024 * 1024)).toFixed(2),
            percentageUsed: percentage.toFixed(1)
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.toString() });
    }
});

// Update storage usage for a store (add or subtract bytes)
router.post('/:id/storage/update', utility.authenticate, checkSubscription, async (req, res) => {
    try {
        const id = req.params.id;
        const { bytes, operation } = req.body; // operation: 'add' or 'subtract'

        const store = await Store.findOne({ where: { id } });

        if (!store) {
            return res.status(404).json({ success: false, message: 'Store not found' });
        }

        let currentBytes = parseInt(store.storageUsedBytes) || 0;

        if (operation === 'add') {
            currentBytes += bytes;
        } else if (operation === 'subtract') {
            currentBytes = Math.max(0, currentBytes - bytes); // Don't go below 0
        } else {
            return res.status(400).json({ success: false, message: 'Invalid operation. Use "add" or "subtract".' });
        }

        store.storageUsedBytes = currentBytes;
        await store.save();

        res.json({
            success: true,
            storageUsedBytes: currentBytes,
            storageUsedMB: (currentBytes / (1024 * 1024)).toFixed(2)
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.toString() });
    }
});

// Purchase additional storage (50 GB per purchase)
const STORAGE_EXTENSION_BYTES = 50 * 1024 * 1024 * 1024; // 50 GB

router.post('/:id/storage/purchase', utility.authenticate, checkSubscription, async (req, res) => {
    try {
        const id = req.params.id;
        const store = await Store.findOne({ where: { id } });

        if (!store) {
            return res.status(404).json({ success: false, message: 'Store not found' });
        }

        // Add 50 GB to purchased storage
        const currentPurchased = parseInt(store.purchasedStorageBytes) || 0;
        const newPurchased = currentPurchased + STORAGE_EXTENSION_BYTES;

        store.purchasedStorageBytes = newPurchased;
        await store.save();

        const limitBytes = parseInt(store.storageLimitBytes) || 524288000;
        const totalLimitBytes = limitBytes + newPurchased;

        res.json({
            success: true,
            message: 'Storage extended by 50 GB',
            purchasedStorageBytes: newPurchased,
            purchasedStorageGB: (newPurchased / (1024 * 1024 * 1024)).toFixed(2),
            totalLimitBytes: totalLimitBytes,
            totalLimitGB: (totalLimitBytes / (1024 * 1024 * 1024)).toFixed(2)
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.toString() });
    }
});

// Get storage purchases for a store
router.get('/:id/storage-purchases', utility.authenticate, checkSubscription, async (req, res) => {
    try {
        const id = req.params.id;

        const purchases = await StoragePurchase.findAll({
            where: { storeId: id },
            order: [['expiresAt', 'DESC']]
        });

        const now = new Date();
        const purchasesWithStatus = purchases.map(p => ({
            id: p.id,
            sizeGB: p.sizeGB,
            duration: p.duration,
            purchasedAt: p.purchasedAt,
            expiresAt: p.expiresAt,
            amount: p.amount,
            currency: p.currency,
            isActive: new Date(p.expiresAt) > now,
            daysRemaining: Math.max(0, Math.ceil((new Date(p.expiresAt) - now) / (1000 * 60 * 60 * 24)))
        }));

        res.json({
            success: true,
            purchases: purchasesWithStatus,
            activePurchases: purchasesWithStatus.filter(p => p.isActive),
            expiredPurchases: purchasesWithStatus.filter(p => !p.isActive)
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.toString() });
    }
});

module.exports = router;