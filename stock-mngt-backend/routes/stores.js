const express = require('express');
const router = express.Router();
const { Store, Brand, Expense, Address, Subscription, StoragePurchase, User } = require('../models');
const utility = require('../utility');
const checkSubscription = require('../checkSubscription');
const checkPlanTier = require('../checkPlanTier');

router.post('/create', utility.authenticate, async (req, res) => {
    try {
        const { name, logo, images, description, country, street, city, state, postalCode, phone, email, site, userId, isVisibleToPublic, isSupportingDeliveries, taxId } = req.body;

        const createdStore = await Store.create({
            name, logo, images: JSON.stringify(images), active: true, phone, email, site,
            description, userId, creatorUserId: req.user.id, isVisibleToPublic, isSupportingDeliveries, taxId
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

        User.findOne({ where: { id: req.user.id } }).then(user => {
            user.role = 'Owner'
            user.save().then(savedUser => {
                res.json({ store: createdStore });
            })
        })
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.toString()
        });
    }
})

router.put('/edit', utility.authenticate, checkSubscription, (req, res) => {
    const { name, logo, images, description, country, street, city, state, postalCode, phone, email, site, isVisibleToPublic, isSupportingDeliveries, taxId } = req.body
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
        store.taxId = taxId
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

// ═══════════════════════════════════════════════════════════
//  CUSTOM DOMAIN MANAGEMENT
// ═══════════════════════════════════════════════════════════

/**
 * @route   PUT /api/stores/:id/domain
 * @desc    Set or update the custom domain for a store
 */
router.put('/:id/domain', utility.authenticate, checkSubscription, checkPlanTier('STOCK_WEBSITE'), async (req, res) => {
    try {
        const id = req.params.id;
        let { domain } = req.body;

        if (!domain) {
            return res.status(400).json({ success: false, message: 'Le domaine est requis' });
        }

        // Normalize: remove protocol, trailing slash, www
        domain = domain.replace(/^https?:\/\//, '').replace(/\/$/, '').replace(/^www\./, '').toLowerCase().trim();

        // Validate domain format
        const domainRegex = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$/;
        if (!domainRegex.test(domain)) {
            return res.status(400).json({ success: false, message: 'Format de domaine invalide' });
        }

        // Check if domain is already taken by another store
        const existing = await Store.findOne({ where: { customDomain: domain } });
        if (existing && existing.id !== parseInt(id)) {
            return res.status(409).json({ success: false, message: 'Ce domaine est déjà utilisé par un autre magasin' });
        }

        const store = await Store.findOne({ where: { id } });
        if (!store) {
            return res.status(404).json({ success: false, message: 'Magasin introuvable' });
        }

        // Clear old domain from cache if changing
        if (store.customDomain && store.customDomain !== domain) {
            const { clearDomainCache } = require('../domainResolver');
            clearDomainCache(store.customDomain);
        }

        store.customDomain = domain;
        store.domainVerified = false; // Reset verification when domain changes
        await store.save();

        res.json({
            success: true,
            message: 'Domaine mis à jour. Veuillez vérifier la configuration DNS.',
            domain: store.customDomain,
            domainVerified: store.domainVerified
        });
    } catch (err) {
        console.error('Error setting domain:', err);
        res.status(500).json({ success: false, message: err.toString() });
    }
});

/**
 * @route   POST /api/stores/:id/domain/verify
 * @desc    Verify that the custom domain DNS is pointing to our server
 */
router.post('/:id/domain/verify', utility.authenticate, checkSubscription, checkPlanTier('STOCK_WEBSITE'), async (req, res) => {
    try {
        const id = req.params.id;
        const store = await Store.findOne({ where: { id } });

        if (!store) {
            return res.status(404).json({ success: false, message: 'Magasin introuvable' });
        }

        if (!store.customDomain) {
            return res.status(400).json({ success: false, message: 'Aucun domaine configuré' });
        }

        // DNS verification using Node's dns module
        const dns = require('dns').promises;
        let verified = false;
        let details = '';

        try {
            // Check CNAME records
            const cnames = await dns.resolveCname(store.customDomain);
            if (cnames.some(c => c.includes('storiom.com'))) {
                verified = true;
                details = `CNAME trouvé: ${cnames.join(', ')}`;
            } else {
                details = `CNAME trouvé mais ne pointe pas vers storiom.com: ${cnames.join(', ')}`;
            }
        } catch (cnameErr) {
            // No CNAME, try A record
            try {
                const addresses = await dns.resolve4(store.customDomain);
                const vpsIp = '161.97.186.60';
                if (addresses.includes(vpsIp)) {
                    verified = true;
                    details = `Enregistrement A trouvé: ${addresses.join(', ')}`;
                } else {
                    details = `Enregistrement A trouvé mais ne pointe pas vers notre serveur (${vpsIp}): ${addresses.join(', ')}`;
                }
            } catch (aErr) {
                details = 'Aucun enregistrement DNS trouvé. Veuillez configurer un CNAME vers storiom.com ou un A record vers 161.97.186.60';
            }
        }

        if (verified) {
            store.domainVerified = true;
            await store.save();

            const { clearDomainCache } = require('../domainResolver');
            clearDomainCache(store.customDomain);
        }

        res.json({
            success: true,
            verified,
            domain: store.customDomain,
            details
        });
    } catch (err) {
        console.error('Error verifying domain:', err);
        res.status(500).json({ success: false, message: err.toString() });
    }
});

/**
 * @route   DELETE /api/stores/:id/domain
 * @desc    Remove custom domain from a store
 */
router.delete('/:id/domain', utility.authenticate, checkSubscription, checkPlanTier('STOCK_WEBSITE'), async (req, res) => {
    try {
        const id = req.params.id;
        const store = await Store.findOne({ where: { id } });

        if (!store) {
            return res.status(404).json({ success: false, message: 'Magasin introuvable' });
        }

        if (store.customDomain) {
            const { clearDomainCache } = require('../domainResolver');
            clearDomainCache(store.customDomain);
        }

        store.customDomain = null;
        store.domainVerified = false;
        await store.save();

        res.json({ success: true, message: 'Domaine personnalisé supprimé' });
    } catch (err) {
        console.error('Error removing domain:', err);
        res.status(500).json({ success: false, message: err.toString() });
    }
});

/**
 * @route   PUT /api/stores/:id/theme
 * @desc    Update the store's theme settings
 */
router.put('/:id/theme', utility.authenticate, checkSubscription, checkPlanTier('STOCK_WEBSITE'), async (req, res) => {
    try {
        const id = req.params.id;
        const { theme } = req.body;

        const store = await Store.findOne({ where: { id } });
        if (!store) {
            return res.status(404).json({ success: false, message: 'Magasin introuvable' });
        }

        // Deep merge to preserve nested objects, then force Sequelize to detect the change
        const currentTheme = store.theme || {};
        const mergedTheme = {};
        const allKeys = new Set([...Object.keys(currentTheme), ...Object.keys(theme)]);
        for (const key of allKeys) {
            if (theme[key] !== undefined && typeof theme[key] === 'object' && !Array.isArray(theme[key]) && theme[key] !== null
                && currentTheme[key] && typeof currentTheme[key] === 'object' && !Array.isArray(currentTheme[key])) {
                mergedTheme[key] = { ...currentTheme[key], ...theme[key] };
            } else if (theme.hasOwnProperty(key)) {
                mergedTheme[key] = theme[key];
            } else {
                mergedTheme[key] = currentTheme[key];
            }
        }
        store.theme = mergedTheme;
        store.changed('theme', true);
        await store.save();

        if (store.customDomain) {
            const { clearDomainCache } = require('../domainResolver');
            clearDomainCache(store.customDomain);
        }

        res.json({ success: true, theme: store.theme });
    } catch (err) {
        res.status(500).json({ success: false, message: err.toString() });
    }
});
