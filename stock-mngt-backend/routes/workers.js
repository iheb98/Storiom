const express = require('express');
const router = express.Router();
const { User, Worker, Address } = require('../models');
const utility = require('../utility');
const checkSubscription = require('../checkSubscription');

router.post('/create', utility.authenticate, checkSubscription, async (req, res) => {
    const { firstName, lastName, email, password, phone, country, street, city, state, postalCode, language, entryDate, salary, functionInStore, worksInStore, superiorId, role } = req.body
    try {
        const createdWorker = await Worker.create({ firstName, lastName, email, password, phone, language, password: password, entryDate, salary, function: functionInStore, storeId: worksInStore, superiorId, role, creatorUserId: req.user.id })
        const createdAddress = await Address.create({ userId: createdWorker.id, country, street, city, state, postalCode })
        res.json({
            success: true,
            message: "Worker created successfully"
        })
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.toString()
        })
    }
})


router.put('/edit', utility.authenticate, checkSubscription, (req, res) => {
    const { id, firstName, lastName, phone, email, credit, description } = req.body
    Worker.findOne(
        {
            where: {
                id,
                creatorUserId: req.user.id
            }
        }
    ).then(worker => {
        worker.firstName = firstName
        worker.lastName = lastName
        worker.email = email
        worker.phone = phone
        worker.description = description
        worker.credit = credit ? credit : 0
        worker.save().then(
            savedWorker => {
                res.json({ message: 'Fournisseur modifié', success: true })
            }
        ).catch(err => {
            res.status(500).json({ err: err })
        })
    }).catch(err => {
        res.status(500).json({ err: err })
    })
})

router.get('/store/:id', utility.authenticate, checkSubscription, (req, res, next) => {
    const id = req.params.id;
    Worker.findAll(utility.paginate({
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
            role: 'Worker',
            creatorUserId: req.user.id
        }
    }, { page: req.query.page, pageSize: req.query.size })).then(workers => {
        res.json(workers)
    }).catch(err => {
        res.status(500).json({
            success: false,
            message: err.toString()
        })
    })
});

router.get('/all/store/:id', utility.authenticate, checkSubscription, (req, res, next) => {
    const id = req.params.id;
    Worker.findAll({
        where: {
            store_id: id,
            creatorUserId: req.user.id
        }
    }).then(workers => {
        res.json(workers)
    }).catch(err => {
        res.status(500).json({
            success: false,
            message: err.toString()
        })
    })
});

router.get('/count/store/:id', utility.authenticate, checkSubscription, (req, res, next) => {
    const id = req.params.id;
    Worker.count({
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
            role: 'Worker',
            creatorUserId: req.user.id
        }
    }).then(countWorkers => {
        res.json(countWorkers)
    }).catch(err => {
        res.status(500).json({
            success: false,
            message: err.toString()
        })
    })
});

router.delete('/:id', utility.authenticate, checkSubscription, (req, res, next) => {
    const id = req.params.id;
    Worker.destroy({
        where: {
            id,
            creatorUserId: req.user.id
        }
    }).then(deletedRows => {
        if (deletedRows > 0)
            res.json({ success: true, message: "Worker deleted" })
        else
            res.status(500).json({ success: false, message: "Worker not found" })
    }).catch(err => {
        res.status(500).json({
            success: false,
            message: err.toString()
        })
    })
});

router.get('/:id', utility.authenticate, checkSubscription, (req, res, next) => {
    const id = req.params.id;
    Worker.findOne({
        where: {
            id,
            creatorUserId: req.user.id
        }, include: []
    }).then(worker => {
        res.json(worker)

    }).catch(err => {
        res.status(500).json({
            success: false,
            message: err.toString()
        })
    })
});


module.exports = router;