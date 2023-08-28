const express = require('express');
const router = express.Router();
const { Supplier } = require('../models');
const utility = require('../utility');


router.post('/create', utility.authenticate, (req, res) => {
    const { firstName, lastName, phone, email, storeId, credit, description } = req.body
    Supplier.create({ firstName, lastName, phone, email, storeId, credit, description, creatorUserId: req.user.id }).then(createdSupplier => {
        res.json({
            supplier: createdSupplier
        })
    }).catch(err => {
        res.status(500).json(err)
    })
})


router.put('/edit', utility.authenticate, (req, res) => {
    const { id, firstName, lastName, phone, email, credit, description } = req.body
    Supplier.findOne(
        {
            where: {
                id,
                creatorUserId: req.user.id
            }
        }
    ).then(supplier => {
        supplier.firstName = firstName
        supplier.lastName = lastName
        supplier.email = email
        supplier.phone = phone
        supplier.description = description
        supplier.credit = credit ? credit : 0
        supplier.save().then(
            savedSupplier => {
                res.json({ message: 'Fournisseur modifié', success: true })
            }
        ).catch(err => {
            res.status(500).json({ err: err })
        })
    }).catch(err => {
        res.status(500).json({ err: err })
    })
})

router.get('/store/:id', utility.authenticate, (req, res, next) => {
    const id = req.params.id;
    Supplier.findAll(utility.paginate({
        where: {
            store_id: id,
            firstName: {
                [utility.Op.like]: req.query.firstName ? '%' + req.query.firstName + '%' : '%'
            },
            lastName: {
                [utility.Op.like]: req.query.lastName ? '%' + req.query.lastName + '%' : '%'
            },
            email: {
                [utility.Op.like]: req.query.email ? '%' + req.query.email + '%' : '%'
            },
            phone: {
                [utility.Op.like]: req.query.phone ? '%' + req.query.phone + '%' : '%'
            },
            credit: utility.fromTo(req.query.creditFrom, req.query.creditTo),
            creatorUserId: req.user.id
        }
    }, { page: req.query.page, pageSize: req.query.size })).then(suppliers => {
        res.json(suppliers)
    }).catch(err => {
        res.status(500).json(err)
    })
});

router.get('/all/store/:id', utility.authenticate, (req, res, next) => {
    const id = req.params.id;
    Supplier.findAll({
        where: {
            store_id: id,
            creatorUserId: req.user.id
        }
    }).then(suppliers => {
        res.json(suppliers)
    }).catch(err => {
        res.status(500).json(err)
    })
});

router.get('/count/store/:id', utility.authenticate, (req, res, next) => {
    const id = req.params.id;
    Supplier.count({
        where: {
            store_id: id,
            firstName: {
                [utility.Op.like]: req.query.firstName ? '%' + req.query.firstName + '%' : '%'
            },
            lastName: {
                [utility.Op.like]: req.query.lastName ? '%' + req.query.lastName + '%' : '%'
            },
            email: {
                [utility.Op.like]: req.query.email ? '%' + req.query.email + '%' : '%'
            },
            phone: {
                [utility.Op.like]: req.query.phone ? '%' + req.query.phone + '%' : '%'
            },
            credit: utility.fromTo(req.query.creditFrom, req.query.creditTo),
            creatorUserId: req.user.id
        }
    }).then(countSuppliers => {
        res.json(countSuppliers)
    }).catch(err => {
        res.status(500).json(err)
    })
});

router.delete('/:id', utility.authenticate, (req, res, next) => {
    const id = req.params.id;
    Supplier.destroy({
        where: {
            id,
            creatorUserId: req.user.id
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

router.get('/:id', utility.authenticate, (req, res, next) => {
    const id = req.params.id;
    Supplier.findOne({
        where: {
            id,
            creatorUserId: req.user.id
        }, include: ['receipts']
    }).then(supplier => {
        res.json(supplier)

    }).catch(err => {
        res.status(500).json(err)
    })
});


module.exports = router;