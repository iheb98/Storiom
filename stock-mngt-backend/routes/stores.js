const express = require('express');
const router = express.Router();
const { Store, Brand, Expense, Address } = require('../models');
const utility = require('../utility');
const checkSubscription = require('../checkSubscription');

router.post('/create', utility.authenticate, checkSubscription, (req, res) => {
    const { name, logo, images, description, country, street, city, state, postalCode, phone, email, site, userId, isVisibleToPublic, isSupportingDeliveries } = req.body
    Store.create({ name, logo, images: JSON.stringify(images), active: true, phone, email, site, description, userId, creatorUserId: req.user.id, isVisibleToPublic, isSupportingDeliveries }).then(createdStore => {
        Address.create({ storeId: createdStore.id, country, street, city, state, postalCode }).then(createdAdress => {
            res.json({
                store: createdStore
            })
        }).catch(err => {
            res.status(500).json({
                success: false,
                message: err.toString()
            })
        })
    }).catch(err => {
        res.status(500).json({
            success: false,
            message: err.toString()
        })
    })
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

router.delete('/:id', utility.authenticate, checkSubscription, (req, res, next) => {
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

module.exports = router;