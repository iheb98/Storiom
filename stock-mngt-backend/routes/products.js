const express = require('express');
const router = express.Router();
const { Product } = require('../models');

router.post('/create', (req, res) => {
    const { name, code, buyingPrice, sellingPrice, currency, sizeType, color, size, images, quantity, storeId, supplierId, categoryId, brandId } = req.body
    Product.create({ name, code, buyingPrice, sellingPrice, currency, sizeType, color, size, images: JSON.stringify(images), quantity, storeId, supplierId, categoryId, brandId }).then(createdProduct => {
        res.json({
            product: createdProduct
        })
    }).catch(err => {
        res.status(500).json(err)
    })
})

router.get('/', (req, res, next) => {
    Product.findAll().then(products => {
        res.json(products)
    }).catch(err => {
        res.status(500).json(err)
    })
});



router.delete('/:id', (req, res, next) => {
    const id = req.params.id;
    Product.destroy({
        where: {
            id
        }
    }).then(deletedRows => {
        if (deletedRows > 0)
            res.json({ success: true, message: "Product deleted" })
        else
            res.status(500).json({ success: false, message: "Product not found" })
    }).catch(err => {
        res.status(500).json(err)
    })
});

router.get('/:id', (req, res, next) => {
    const id = req.params.id;
    Product.findOne({
        where: {
            id
        }, include : ['brand','category']
    }).then(product => {
        res.json(product)

    }).catch(err => {
        console.log(err)
        res.status(500).json(err)
    })
});

module.exports = router;