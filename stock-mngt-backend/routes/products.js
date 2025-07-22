const express = require('express');
const router = express.Router();
const { Product, Operation } = require('../models');
const utility = require('../utility');
const checkSubscription = require('../checkSubscription');

router.post('/create', utility.authenticate, checkSubscription, (req, res) => {
    const { name, code, buyingPrice, sellingPrice, currency, color, size, description, images, quantity, unit, storeId, supplierId, categoryId, brandId } = req.body
    Product.create({ name, code, buyingPrice, sellingPrice, currency, color, size, description, images: JSON.stringify(images), quantity, unit, storeId, supplierId, categoryId, brandId, creatorUserId: req.user.id }).then(createdProduct => {
        res.json({
            product: createdProduct
        })
    }).catch(err => {
        console.log(err)
        res.status(500).json({ err })
    })
})

router.put('/edit', utility.authenticate, checkSubscription, (req, res) => {
    const { id, name, color, quantity, unit, images, sellingPrice, description, buyingPrice, size, supplierId, categoryId, brandId } = req.body
    Product.findOne(
        {
            where: {
                id,
                creatorUserId: req.user.id
            }
        }
    ).then(product => {
        product.name = name
        product.color = color
        product.images = JSON.stringify(images)
        product.quantity = quantity
        product.unit = unit
        product.supplierId = supplierId
        product.categoryId = categoryId
        product.brandId = brandId
        product.description = description
        product.sellingPrice = sellingPrice
        product.buyingPrice = buyingPrice
        product.size = size
        product.save().then(
            savedProduct => {
                res.json({ message: 'Produit modifié', success: true })
            }
        ).catch(err => {
            res.status(500).json({ err: err })
        })
    }).catch(err => {
        console.log(err)
        res.status(500).json({ err: err })
    })
})

router.get('/all', (req, res, next) => {
    const id = req.params.id;
    Product.findAll({
        where: {
            
        }, include: ['brand', 'category', 'supplier']
    }).then(product => {
        res.json(product)

    }).catch(err => {
        res.status(500).json({
            success: false,
            message: err.toString()
        })
    })
});

router.get('/store/:id', utility.authenticate, checkSubscription, (req, res, next) => {
    const id = req.params.id;
    Product.findAll(utility.paginate({
        where: {
            store_id: id,
            ...utility.buildQuery(req.query.query),
            creatorUserId: req.user.id,
            isVisible: true
        }, include: ['supplier', 'category']
    }, { page: req.query.page, pageSize: req.query.size })).then(products => {
        res.json(products)
    }).catch(err => {
        res.status(500).json({
            success: false,
            message: err.toString()
        })
    })
});

router.get('/store/:id/critical', utility.authenticate, checkSubscription, (req, res, next) => {
    const id = req.params.id;
    Product.findAll({
        where: {
            store_id: id,
            creatorUserId: req.user.id,
            isVisible: true,
            quantity: {
                [utility.Op.lte]: 10
            }
        },
        limit: req.query.limit ? Number(req.query.limit) : null,
        order: [
            ['quantity', 'ASC']
        ]
    }).then(products => {
        res.json([...products])
    }).catch(err => {
        res.status(500).json({
            success: false,
            message: err.toString()
        })
    })
});

router.get('/count/store/:id', utility.authenticate, checkSubscription, (req, res, next) => {
    const id = req.params.id;
    Product.count({
        where: {
            store_id: id,
            ...utility.buildQuery(req.query.query),
            isVisible: true,
            creatorUserId: req.user.id
        }
    }).then(countProducts => {
        res.json(countProducts)
    }).catch(err => {
        res.status(500).json({
            success: false,
            message: err.toString()
        })
    })
});


router.delete('/:id', utility.authenticate, checkSubscription, (req, res, next) => {
    const id = req.params.id;
    Product.findOne({
        where: {
            id,
            creatorUserId: req.user.id
        }
    }).then(product => {
        product.isVisible = false;
        product.save().then(
            savedProduct => {
                res.status(200).json({ success: true, message: "Produit supprimé" })
            }
        ).catch(err => {
            res.status(500).json({ err: err })
        })
    }).catch(err => {
        res.status(500).json({
            success: false,
            message: err.toString()
        })
    })
});

/*router.delete('/:id', utility.authenticate, checkSubscription, (req, res, next) => {
    const id = req.params.id;
    Product.destroy({
        where: {
            id,
            creatorUserId: req.user.id
        }
    }).then(deletedRows => {
        if (deletedRows > 0)
            res.json({ success: true, message: "Product deleted" })
        else
            res.status(500).json({ success: false, message: "Product not found" })
    }).catch(err => {
        res.status(500).json({
            success: false,
            message: err.toString()
        })
    })
});*/

router.get('/:id', utility.authenticate, checkSubscription, (req, res, next) => {
    const id = req.params.id;
    Product.findOne({
        where: {
            id,
            creatorUserId: req.user.id,
            isVisible: true
        }, include: ['brand', 'category', 'supplier']
    }).then(product => {
        res.json(product)

    }).catch(err => {
        res.status(500).json({
            success: false,
            message: err.toString()
        })
    })
});



module.exports = router;