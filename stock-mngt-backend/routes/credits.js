const express = require('express');
const router = express.Router();
const { Credit } = require('../models');
const utility = require('../utility');
const checkSubscription = require('../checkSubscription');

router.post('/create', utility.authenticate, checkSubscription, (req, res) => {
    const { firstName, lastName, phone, email, comment, amount, givenDate, returnDate, storeId, status } = req.body
    Credit.create({ firstName, lastName, phone, email, comment, amount, givenDate, returnDate, storeId, status: status || false, creatorUserId: req.user.id }).then(createdCredit => {
        res.json({
            credit: createdCredit
        })
    }).catch(err => {
        res.status(500).json({
            success: false,
            message: err.toString()
        })
    })
})

router.delete('/:id', utility.authenticate, checkSubscription, (req, res, next) => {
    const id = req.params.id;
    Credit.destroy({
        where: {
            id,
            creatorUserId: req.user.id
        }
    }).then(deletedRows => {
        if (deletedRows > 0)
            res.json({ success: true, message: "Credit deleted" })
        else
            res.status(500).json({ success: false, message: "Credit not found" })
    }).catch(err => {
        res.status(500).json({
            success: false,
            message: err.toString()
        })
    })
});

router.put('/edit', utility.authenticate, checkSubscription, (req, res, next) => {
    Credit.findOne({
        where: {
            id: req.body.id,
            creatorUserId: req.user.id
        }
    }).then(credit => {
        credit.firstName = req.body.firstName
        credit.lastName = req.body.lastName
        credit.phone = req.body.phone
        credit.email = req.body.email
        credit.givenDate = req.body.givenDate
        credit.returnDate = req.body.returnDate
        credit.amount = req.body.amount
        credit.comment = req.body.comment
        credit.status = req.body.status
        credit.save().then(savedCredit => {
            res.json({ message: "Credit updated", success: true })
        })
    }).catch(err => {
        res.status(500).json({
            success: false,
            message: err.toString()
        })
    })
});

router.get('/store/:id', utility.authenticate, checkSubscription, (req, res, next) => {
    const id = req.params.id;
    Credit.findAll(utility.paginate({
        where: {
            storeId: id,
            ...utility.buildQuery(req.query.query),
            creatorUserId: req.user.id
        }
    }, { page: req.query.page, pageSize: req.query.size })).then(users => {
        res.json(users)
    }).catch(err => {
        res.status(500).json({
            success: false,
            message: err.toString()
        })
    })
});



router.get('/count/store/:id', utility.authenticate, checkSubscription, (req, res, next) => {
    const id = req.params.id;
    Credit.count({
        where: {
            storeId: id,
            ...utility.buildQuery(req.query.query),
            creatorUserId: req.user.id
        }
    }).then(countUsers => {
        res.json(countUsers)
    }).catch(err => {
        res.status(500).json({
            success: false,
            message: err.toString()
        })
    })
});

router.get('/:id', utility.authenticate, checkSubscription, (req, res, next) => {
    const id = req.params.id;
    Credit.findOne({
        where: {
            id,
            creatorUserId: req.user.id
        }
    }).then(credit => {
        res.json(credit)

    }).catch(err => {
        res.status(500).json({
            success: false,
            message: err.toString()
        })
    })
});

module.exports = router;