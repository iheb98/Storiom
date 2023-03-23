const express = require('express');
const router = express.Router();
const { Receipt, Operation, Product } = require('../models');

router.post('/create', (req, res) => {
    const { code, total, tax, type, name, date, userId, storeId, supplierId, operations } = req.body
    Receipt.create({ code, total, tax, type, name, date, userId, storeId, supplierId }).then(createdReceipt => {
        let total = 0;
        operations.forEach(item => {
            let { amount, price, productId } = item
            Operation.create({ amount, type, price, date, productId, receiptId: createdReceipt.id }).then(
                createdOperation => {
                    total += createdOperation.price * amount
                }
            )
        })
        res.json({
            receipt: createdReceipt
        })
    }).catch(err => {
        res.status(500).json(err)
    })
})

router.get('/', (req, res, next) => {
    Receipt.findAll().then(categories => {
        res.json(categories)
    }).catch(err => {
        res.status(500).json(err)
    })
});

router.delete('/:id', (req, res, next) => {
    const id = req.params.id;
    Receipt.destroy({
        where: {
            id
        }
    }).then(deletedRows => {
        if (deletedRows > 0)
            res.json({ success: true, message: "Receipt deleted" })
        else
            res.status(500).json({ success: false, message: "Receipt not found" })
    }).catch(err => {
        res.status(500).json(err)
    })
});

router.get('/:id', (req, res, next) => {
    const id = req.params.id;
    Receipt.findOne({
        where: {
            id
        }, include: ['responsible', {
            model: Operation,
            as: 'operations',
            include: {
                model: Product,
                as: 'product'
            }
        }]
    }).then(receipt => {
        res.json(receipt)

    }).catch(err => {
        console.log(err)
        res.status(500).json(err)
    })
});

module.exports = router;