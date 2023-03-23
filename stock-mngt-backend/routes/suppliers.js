const express = require('express');
const router = express.Router();
const { Supplier } = require('../models');

router.post('/create', (req, res) => {
    const { firstName, lastName, phone, email, storeId } = req.body
    Supplier.create({ firstName, lastName, phone, email, storeId }).then(createdSupplier => {
        res.json({
            supplier: createdSupplier
        })
    }).catch(err => {
        res.status(500).json(err)
    })
})

router.get('/', (req, res, next) => {
    Supplier.findAll().then(categories => {
        res.json(categories)
    }).catch(err => {
        res.status(500).json(err)
    })
});

router.delete('/:id', (req, res, next) => {
    const id = req.params.id;
    Supplier.destroy({
        where: {
            id
        }
    }).then(deletedRows => {
        if (deletedRows > 0)
            res.json({ success: true, message: "Supplier deleted" })
        else
            res.status(500).json({ success: false, message: "Supplier not found" })
    }).catch(err => {
        res.status(500).json(err)
    })
});

router.get('/:id', (req, res, next) => {
    const id = req.params.id;
    Supplier.findOne({
        where: {
            id
        }, include: ['receipts']
    }).then(supplier => {
        res.json(supplier)

    }).catch(err => {
        res.status(500).json(err)
    })
});

module.exports = router;