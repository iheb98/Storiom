const express = require('express');
const router = express.Router();
const { Expense } = require('../models');
const utility = require('../utility');


router.post('/create', utility.authenticate, (req, res) => {
    const { title, amount, comment, date, storeId } = req.body
    Expense.create({ title, amount, comment, date, storeId, creatorUserId: req.user.id }).then(createdExpense => {
        res.json({
            expense: createdExpense
        })
    }).catch(err => {
        res.status(500).json(err)
    })
})

router.delete('/:id', utility.authenticate, (req, res, next) => {
    const id = req.params.id;
    Expense.destroy({
        where: {
            id,
            creatorUserId: req.user.id
        }
    }).then(deletedRows => {
        if (deletedRows > 0)
            res.json({ success: true, message: "Expense deleted" })
        else
            res.status(500).json({ success: false, message: "Expense not found" })
    }).catch(err => {
        res.status(500).json(err)
    })
});

router.get('/store/:id', utility.authenticate, (req, res, next) => {

    const id = req.params.id;
    Expense.findAll(utility.paginate({
        where: {
            storeId: id,
            ...utility.buildQuery(req.query.query),
            creatorUserId: req.user.id
        }
    }, { page: req.query.page, pageSize: req.query.size })).then(users => {
        res.json(users)
    }).catch(err => {
        console.log(err)
        res.status(500).json(err)
    })
});





router.get('/count/store/:id', utility.authenticate, (req, res, next) => {
    const id = req.params.id;
    Expense.count({
        where: {
            storeId: id,
            ...utility.buildQuery(req.query.query),
            creatorUserId: req.user.id
        }
    }).then(countUsers => {
        res.json(countUsers)
    }).catch(err => {
        res.status(500).json(err)
    })
});

router.put('/edit', utility.authenticate, (req, res, next) => {
    Expense.findOne({
        where: {
            id: req.body.id,
            creatorUserId: req.user.id
        }
    }).then(expense => {
        expense.title = req.body.title
        expense.amount = req.body.amount
        expense.date = req.body.date
        expense.comment = req.body.comment
        expense.save().then(savedExpense => {
            res.json({ message: "Expense updated", success: true })
        })
    }).catch(err => {
        res.status(500).json(err)
    })
});

router.get('/:id', utility.authenticate, (req, res, next) => {
    const id = req.params.id;
    Expense.findOne({
        where: {
            id,
            creatorUserId: req.user.id
        }
    }).then(expense => {
        res.json(expense)

    }).catch(err => {
        res.status(500).json(err)
    })
});

module.exports = router;