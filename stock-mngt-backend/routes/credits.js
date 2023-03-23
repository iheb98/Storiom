const express = require('express');
const router = express.Router();
const { Credit } = require('../models');

router.post('/create', (req, res) => {
    const { firstName, lastName, phone, email, comment, amount, givenDate, returnDate, storeId } = req.body
    Credit.create({ firstName, lastName, phone, email, comment, amount, givenDate, returnDate, storeId }).then(createdCredit => {
        res.json({
            credit: createdCredit
        })
    }).catch(err => {
        res.status(500).json(err)
    })
})

router.get('/', (req, res, next) => {
    Credit.findAll().then(categories => {
        res.json(categories)
    }).catch(err => {
        res.status(500).json(err)
    })
});

router.delete('/:id', (req, res, next) => {
    const id = req.params.id;
    Credit.destroy({
        where: {
            id
        }
    }).then(deletedRows => {
        if (deletedRows > 0)
            res.json({ success: true, message: "Credit deleted" })
        else
            res.status(500).json({ success: false, message: "Credit not found" })
    }).catch(err => {
        res.status(500).json(err)
    })
});

router.get('/:id', (req, res, next) => {
    const id = req.params.id;
    Credit.findOne({
        where: {
            id
        }
    }).then(credit => {
        res.json(credit)

    }).catch(err => {
        res.status(500).json(err)
    })
});

module.exports = router;