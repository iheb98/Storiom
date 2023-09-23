const express = require('express');
const router = express.Router();
const { Product, Operation, Credit } = require('../models');
const utility = require('../utility');

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
                    utility.Sequelize.where(utility.Sequelize.fn('date', utility.Sequelize.col('createdAt')), '=', utility.getSimpleDate(new Date()))
                ],
                creatorUserId: req.user.id
            }
        })
        console.log(utility.getSimpleDate(new Date()))

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