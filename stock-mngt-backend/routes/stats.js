const express = require('express');
const router = express.Router();
const { Product, Operation, Credit } = require('../models');
const utility = require('../utility');

const sequelize = require('sequelize');
const { Op } = require('sequelize');

router.get('/store/:id/widgets', utility.authenticate, async (req, res, next) => {
    const id = req.params.id;
    try {
        const products = await Product.findAll({
            where: {
                store_id: id,
                creatorUserId: req.user.id
            }
        })
        const credits = await Credit.findAll({
            where: {
                store_id: id,
                creatorUserId: req.user.id
            }
        })
        const operations = await Operation.findAll({
            where: {
                [utility.Op.and]: [
                    utility.Sequelize.where(utility.Sequelize.fn('date', utility.Sequelize.col('date')), '=', utility.getSimpleDate(new Date()))
                ],
                creatorUserId: req.user.id
            }
        })
        let totalValue = 0;
        let criticalStock = 0;
        let todayRevenue = 0;
        let totalCredits = 0;
        products.forEach(element => {
            totalValue += element.quantity * element.sellingPrice
            criticalStock += element.quantity < 10 ? 1 : 0
        });

        credits.forEach(element => {
            totalCredits += element.amount
        });

        operations.forEach(element => {
            todayRevenue += element.amount * element.price
        })
        res.json({ totalValue, criticalStock, todayRevenue, totalCredits })
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.toString()
        })

    }
});

router.get('/count/store/:id', utility.authenticate, (req, res, next) => {
    const id = req.params.id;
    Product.count({
        where: {
            store_id: id,
            ...utility.buildQuery(req.query.query),
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


router.delete('/:id', utility.authenticate, (req, res, next) => {
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
});

router.get('/store/:id/bestSelling', utility.authenticate, (req, res, next) => {
    Operation.findAll({
        where: {
            type: "SOLD",
            creatorUserId: req.user.id
        }, include: ['product'],
        attributes: [
            'product_id',
            [sequelize.fn('SUM', sequelize.col('amount')), 'total_amount']
        ],
        group: ['product_id'],
        order: [[sequelize.literal('total_amount'), 'DESC']],
    }).then(operations => {

        res.json(operations)
    }).catch(err => {
        res.status(500).json({
            success: false,
            message: err.toString()
        })
    })
});

router.get('/store/:id/mostProfitable', utility.authenticate, (req, res, next) => {
    Operation.findAll({
        where: {
            type: "SOLD",
            creatorUserId: req.user.id
        }, include: ['product'],
        attributes: [
            'product_id',
            [
                sequelize.literal('(SUM((selling_price - buying_price) * amount))'),
                'total_profit'
            ]
        ],
        group: ['product_id'],
        order: [[sequelize.literal('total_profit'), 'DESC']]
    }).then(operations => {
        res.json(operations)
    }).catch(err => {
        res.status(500).json({
            success: false,
            message: err.toString()
        })
    })
});

router.get('/store/:id/operationStats', utility.authenticate, (req, res, next) => {
    const { type, value } = req.query;

    let dateCondition = [];

    if (type && value) {
        switch (type) {
            case 'ANNUALLY':
                dateCondition.push(sequelize.where(sequelize.fn('YEAR', sequelize.col('date')), value));
                break;
            case 'MONTHLY':
                const [year, month] = value.split('-');
                dateCondition.push(sequelize.where(sequelize.fn('YEAR', sequelize.col('date')), year));
                dateCondition.push(sequelize.where(sequelize.fn('MONTH', sequelize.col('date')), month));
                break;
            case 'DAILY':
                const [y, m, d] = value.split('-');
                dateCondition.push(sequelize.where(sequelize.fn('YEAR', sequelize.col('date')), y));
                dateCondition.push(sequelize.where(sequelize.fn('MONTH', sequelize.col('date')), m));
                dateCondition.push(sequelize.where(sequelize.fn('DAY', sequelize.col('date')), d));
                break;
            default:
                return res.status(400).json({
                    success: false,
                    message: 'Invalid type. Use "year", "month", or "day".'
                });
        }
    }
    Operation.findAll({
        where: {
            type: ["SOLD", "LOADED"],
            creatorUserId: req.user.id,
            ...(dateCondition.length > 0 && { [Op.and]: dateCondition })
        },
        include: ['product']
    })
        .then(operations => {
            res.json(operations);
        })
        .catch(err => {
            res.status(500).json({
                success: false,
                message: err.toString()
            });
        });
});


router.get('/store/:id/operationStats/product', utility.authenticate, (req, res, next) => {
    const { type, value, product } = req.query;

    let dateCondition = [];

    if (type && value) {
        switch (type) {
            case 'ANNUALLY':
                dateCondition.push(sequelize.where(sequelize.fn('YEAR', sequelize.col('date')), value));
                break;
            case 'MONTHLY':
                const [year, month] = value.split('-');
                dateCondition.push(sequelize.where(sequelize.fn('YEAR', sequelize.col('date')), year));
                dateCondition.push(sequelize.where(sequelize.fn('MONTH', sequelize.col('date')), month));
                break;
            case 'DAILY':
                const [y, m, d] = value.split('-');
                dateCondition.push(sequelize.where(sequelize.fn('YEAR', sequelize.col('date')), y));
                dateCondition.push(sequelize.where(sequelize.fn('MONTH', sequelize.col('date')), m));
                dateCondition.push(sequelize.where(sequelize.fn('DAY', sequelize.col('date')), d));
                break;
            default:
                return res.status(400).json({
                    success: false,
                    message: 'Invalid type. Use "year", "month", or "day".'
                });
        }
    }
    Operation.findAll({
        where: {
            type: ["SOLD", "LOADED"],
            creatorUserId: req.user.id,
            product_id: product,
            ...(dateCondition.length > 0 && { [Op.and]: dateCondition })
        },
    })
        .then(operations => {
            res.json(operations);
        })
        .catch(err => {
            res.status(500).json({
                success: false,
                message: err.toString()
            });
        });
});

router.get('/:id', utility.authenticate, (req, res, next) => {
    const id = req.params.id;
    Product.findOne({
        where: {
            id,
            creatorUserId: req.user.id
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