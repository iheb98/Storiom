const express = require('express');
const router = express.Router();
const { Receipt, Operation, Product, Store, Address } = require('../models');
const utility = require('../utility');
const checkSubscription = require('../checkSubscription');
const { Op } = require('sequelize');

router.post('/create', utility.authenticate, checkSubscription, async (req, res) => {
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


router.post('/sell/single', utility.authenticate, checkSubscription, async (req, res) => {
    let { amount, price, id, date } = req.body
    Operation.create({
        amount, type: "SOLD", price, date: date ? new Date(date) : new Date(), productId: id,
        receiptId: null, creatorUserId: req.user.id
    }).then(
        async createdOperation => {
            let product = await Product.findOne({
                where: {
                    id
                }
            })
            await product.update({ quantity: product.quantity - amount })
            res.json({
                operation: createdOperation
            })
        }
    ).catch(err => {
        res.status(500).json({
            success: false,
            message: err.toString()
        })
    })
})



router.post('/load/single', utility.authenticate, checkSubscription, async (req, res) => {
    let { amount, price, id, date } = req.body
    Operation.create({
        amount, type: "LOADED", price, date: date ? new Date(date) : new Date(), productId: id,
        receiptId: null, creatorUserId: req.user.id
    }).then(
        async createdOperation => {
            let product = await Product.findOne({
                where: {
                    id
                }
            })
            await product.update({ quantity: product.quantity + amount })
            res.json({
                operation: createdOperation
            })
        }
    ).catch(err => {
        res.status(500).json({
            success: false,
            message: err.toString()
        })
    })
})

router.get('/operations', utility.authenticate, checkSubscription, async (req, res) => {
    Operation.findAll(utility.paginate({
        where: {
            ...utility.buildQuery(req.query.query),
            creatorUserId: req.user.id
        },
        include: [{
            model: Product,
            as: 'product',
            where: {
                name: {
                    [Op.iLike]: req.query.query.indexOf('product') != -1 ?
                        `%${req.query.query.match(/product\.name\s*~\s*'([^']+)'/)[1]}%` :
                        '%%'
                }
            }
        }],
        order: [
            ['date', 'DESC']
        ]
    }, { page: req.query.page, pageSize: req.query.size })).then(
        operations => {
            res.json(
                operations
            )
        }
    ).catch(err => {
        res.status(500).json({
            success: false,
            message: err.toString()
        })
    })
})

router.get('/allOperations', async (req, res) => {
    Operation.findAll({
        include: [{
            model: Product,
            as: 'product'
        }],
        order: [
            ['date', 'DESC']
        ]
    }).then(
        operations => {
            res.json(
                operations
            )
        }
    ).catch(err => {
        res.status(500).json({
            success: false,
            message: err.toString()
        })
    })
})

router.get('/count/operations', utility.authenticate, checkSubscription, (req, res, next) => {
    const id = req.params.id;
    Operation.count({
        where: {
            ...utility.buildQuery(req.query.query),
            creatorUserId: req.user.id
        }
    }).then(countOperations => {
        res.json(countOperations)
    }).catch(err => {
        res.status(500).json({
            success: false,
            message: err.toString()
        })
    })
});



router.delete('/:id', utility.authenticate, checkSubscription, (req, res, next) => {
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

router.delete('/operations/:id', utility.authenticate, checkSubscription, (req, res, next) => {
    const id = req.params.id;
    Operation.findOne({
        where: {
            id
        },
        include: ['product']
    }).then(operation => {
        Product.findOne({
            where: {
                id: operation.product.id
            }
        }).then(product => {
            if (operation.type == "SOLD") {
                product.quantity += operation.amount
            } else {
                product.quantity -= operation.amount
            }
            product.save();
            Operation.destroy({
                where: {
                    id,
                    creatorUserId: req.user.id
                }
            }).then(deletedRows => {
                if (deletedRows > 0)
                    res.json({ success: true, message: "Operation deleted" })
                else
                    res.status(500).json({ success: false, message: "Operation not found" })
            }).catch(err => {
                res.status(500).json({
                    success: false,
                    message: err.toString()
                })
            })
        })
    })

});

router.get('/store/:id', utility.authenticate, checkSubscription, (req, res, next) => {
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

router.get('/operations/:id', utility.authenticate, checkSubscription, (req, res, next) => {
    const id = req.params.id;
    Operation.findOne({
        where: {
            id,
            creatorUserId: req.user.id,
        },
        include: ['product']
    }).then(operation => {
        res.json(operation)

    }).catch(err => {
        res.status(500).json({
            success: false,
            message: err.toString()
        })
    })
});

router.put('/operations/edit', utility.authenticate, checkSubscription, async (req, res) => {
    const { id, price, amount, type, date } = req.body
    Operation.findOne(
        {
            where: {
                id,
                creatorUserId: req.user.id
            }, include: ['product', 'receipt']
        }
    ).then(async operation => {
        Product.findOne({
            where: {
                id: operation.product.id
            }
        }).then(async product => {
            operation.price = price
            if (operation.type == "SOLD") {
                if (amount > operation.amount) {
                    product.quantity -= amount - operation.amount
                } else if (amount < operation.amount) {
                    product.quantity += operation.amount - amount
                }
            } else {
                if (amount > operation.amount) {
                    product.quantity += amount - operation.amount
                } else if (amount < operation.amount) {
                    product.quantity -= operation.amount - amount
                }
            }
            await product.save();
            operation.amount = amount
            operation.date = date
            operation.type = type
            operation.save().then(
                async savedOperation => {
                    if (operation.receipt) {
                        const receipt = await Receipt.findOne({
                            where: {
                                id: operation.receipt.id
                            }, include: ['operations']
                        })
                        let total = 0;
                        console.log(receipt.operations)
                        for (let op of receipt.operations) {
                            total += op.amount * op.price
                        }
                        receipt.total = total;
                        await receipt.save()
                    }
                    res.json({ message: 'Operation modifié', success: true })
                }
            ).catch(err => {
                res.status(500).json(err)
            })
        })
    }).catch(err => {
        res.status(500).json(JSON.stringify(err))
    })
})

router.get('/store/:id/last', utility.authenticate, checkSubscription, (req, res, next) => {
    const id = req.params.id;
    console.log(id)
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

router.get('/count/store/:id', utility.authenticate, checkSubscription, (req, res, next) => {
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

router.get('/:id', utility.authenticate, checkSubscription, (req, res, next) => {
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