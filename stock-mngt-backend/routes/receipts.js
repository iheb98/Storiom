const express = require('express');
const router = express.Router();
const { Receipt, Operation, Product } = require('../models');
const utility = require('../utility');

router.post('/create', utility.authenticate,(req, res) => {
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

router.delete('/:id',utility.authenticate, (req, res, next) => {
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

router.get('/:id',utility.authenticate, (req, res, next) => {
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