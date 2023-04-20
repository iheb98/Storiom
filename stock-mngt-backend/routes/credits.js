const express = require('express');
const router = express.Router();
const { Credit } = require('../models');
const utility = require('../utility');


router.post('/create',utility.authenticate, (req, res) => {
    const { firstName, lastName, phone, email, comment, amount, givenDate, returnDate, storeId } = req.body
    Credit.create({ firstName, lastName, phone, email, comment, amount, givenDate, returnDate, storeId }).then(createdCredit => {
        res.json({
            credit: createdCredit
        })
    }).catch(err => {
        res.status(500).json(err)
    })
})

router.delete('/:id',utility.authenticate, (req, res, next) => {
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

router.get('/:id',utility.authenticate, (req, res, next) => {
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