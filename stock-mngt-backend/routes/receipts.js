const express = require('express');
const router = express.Router();
const { Receipt, Operation, Product, Store, Address } = require('../models');
const utility = require('../utility');

router.post('/create', utility.authenticate, async (req, res) => {
    const { code, tva, type, name, date, userId, storeId, supplierId, operations } = req.body
    let total = 0;
    operations.forEach(item => {
        total += item.price * item.amount
    })
    Receipt.count({
        where: {
            store_id: storeId,
            creatorUserId: req.user.id
        }
    }).then(countReceipts => {
        Receipt.create({ code: codeFormater(countReceipts + 1), total, tva, type, name, date, userId: req.user.id, storeId, supplierId, creatorUserId: req.user.id }).then(createdReceipt => {
            let total = 0;
            operations.forEach(async item => {
                let { amount, price, id } = item
                Operation.create({ amount, type, price, date, productId: id, receiptId: createdReceipt.id, creatorUserId: req.user.id }).then(
                    createdOperation => {
                        total += createdOperation.price * amount
                    }
                )
                let product = await Product.findOne({
                    where: {
                        id
                    }
                })
                if (type == 'SOLD')
                    await product.update({ quantity: product.quantity - item.amount })
                else
                    await product.update({ quantity: product.quantity + item.amount })
            })
            res.json({
                receipt: createdReceipt
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

router.delete('/:id', utility.authenticate, (req, res, next) => {
    const id = req.params.id;
    Receipt.findOne({
        where: {
            id,
            visible: true
        }
    }).then(receipt => {
        if (receipt) {
            receipt.visible = false
            receipt.save().then(savedReceipt => {
                res.json({ success: true, message: "Receipt deleted" })
            })
        }
        else
            res.status(500).json({ success: false, message: "Receipt not found" })
    }).catch(err => {
        res.status(500).json({
            success: false,
            message: err.toString()
        })
    })
});

router.get('/store/:id', utility.authenticate, (req, res, next) => {
    const id = req.params.id;
    Receipt.findAll(utility.paginate({
        where: {
            store_id: id,
            visible: true,
            ...utility.buildQuery(req.query.query),
            creatorUserId: req.user.id
        },
        include: ['supplier'],
        order: [
            ['date', 'DESC']
        ]
    }, { page: req.query.page, pageSize: req.query.size })).then(receipts => {
        res.json(receipts)
    }).catch(err => {
        res.status(500).json({
            success: false,
            message: err.toString()
        })
    })
});

router.get('/store/:id/last', utility.authenticate, (req, res, next) => {
    const id = req.params.id;
    Receipt.findAll({
        where: {

            store_id: id,
            creatorUserId: req.user.id,
            [utility.Op.and]: [
                utility.Sequelize.where(utility.Sequelize.fn('date', utility.Sequelize.col('date')), '=', utility.getSimpleDate(new Date()))
            ]
        },
        limit: req.query.limit ? Number(req.query.limit) : null,
        order: [
            ['date', 'DESC']
        ]
    }).then(operations => {
        res.json(operations)
    }).catch(err => {
        res.status(500).json({
            success: false,
            message: err.toString()
        })
    })
});

router.get('/count/store/:id', utility.authenticate, (req, res, next) => {
    const id = req.params.id;
    Receipt.count({
        where: {
            store_id: id,
            visible: true,
            ...utility.buildQuery(req.query.query),
            creatorUserId: req.user.id
        }
    }).then(countReceipts => {
        res.json(countReceipts)
    }).catch(err => {
        res.status(500).json({
            success: false,
            message: err.toString()
        })
    })
});

router.get('/:id', utility.authenticate, (req, res, next) => {
    const id = req.params.id;
    Receipt.findOne({
        where: {
            id,
            creatorUserId: req.user.id,
            visible: true
        }, include: ['responsible', {
            model: Operation,
            as: 'operations',
            include: {
                model: Product,
                as: 'product'
            }
        }, {
                model: Store,
                as: 'store',
                include: {
                    model: Address,
                    as: 'address'
                }
            }]
    }).then(receipt => {
        console.log(receipt)
        res.json(receipt)

    }).catch(err => {
        res.status(500).json({
            success: false,
            message: err.toString()
        })
    })
});

const codeFormater = (code) => {
    let result = '' + code
    while (result.length < 7) {
        result = '0' + result;
    }

    return 'F' + result
}

module.exports = router;