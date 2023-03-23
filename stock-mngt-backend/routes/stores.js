const express = require('express');
const router = express.Router();
const { Store, Brand, Expense } = require('../models');

router.post('/create', (req, res) => {
    const { name, logo, images, description, userId } = req.body
    Store.create({ name, logo, images: JSON.stringify(images), description, userId }).then(createdStore => {
        res.json({
            store: createdStore
        })
    }).catch(err => {
        res.status(500).json(err)
    })
})

router.post('/expenses/create', (req, res) => {
    const { amount, comment, date, storeId } = req.body
    Expense.create({ amount, comment, date, storeId }).then(createdExpense => {
        res.json({
            expense: createdExpense
        })
    }).catch(err => {
        res.status(500).json(err)
    })
})

router.get('/:id/expenses', (req, res) => {
    const storeId = req.params.id;
    Expense.findAll({
        where: {
            storeId
        }
    }).then(store => {
        res.json(store)

    }).catch(err => {
        res.status(500).json(err)
    })
})

router.get('/', (req, res, next) => {
    Store.findAll().then(stores => {
        res.json(stores)
    }).catch(err => {
        res.status(500).json(err)
    })
});

router.post('/brands/create', (req, res) => {
    const { name, storeId } = req.body
    Brand.create({ name, storeId }).then(createdBrand => {
        res.json(createdBrand)
    }).catch(err => {
        res.status(500).json(err)
    })
})

router.get('/:id/brands', (req, res) => {
    const storeId = req.params.id
    Brand.findAll({ where: { storeId } }).then(brands => {
        res.json(brands)
    }).catch(err => {
        res.status(500).json(err)
    })
})

router.get('/', (req, res, next) => {
    Store.findAll().then(stores => {
        res.json(stores)
    }).catch(err => {
        res.status(500).json(err)
    })
});

// Get the stores of a user by its id
router.get('/user/:id', (req, res, next) => {
    const userId = req.params.id;
    Store.findAll({
        where: {
            userId
        }
    }).then(stores => {
        res.json(stores)
    }).catch(err => {
        res.status(500).json(err)
    })
});


router.delete('/:id', (req, res, next) => {
    const id = req.params.id;
    Store.destroy({
        where: {
            id
        }
    }).then(deletedRows => {
        if (deletedRows > 0)
            res.json({ success: true, message: "Store deleted" })
        else
            res.status(500).json({ success: false, message: "Store not found" })
    }).catch(err => {
        res.status(500).json(err)
    })
});

router.get('/:id', (req, res, next) => {
    const id = req.params.id;
    Store.findOne({
        where: {
            id
        }
    }).then(store => {
        res.json(store)

    }).catch(err => {
        res.status(500).json(err)
    })
});

module.exports = router;