const express = require('express');
const router = express.Router();
const { Brand } = require('../models');
const utility = require('../utility');
const checkSubscription = require('../checkSubscription');
router.post('/create', utility.authenticate, checkSubscription, (req, res) => {
    const { name, parentBrandId, storeId } = req.body
    Brand.create({ name, parentBrandId, storeId }).then(createdBrand => {
        res.json(createdBrand)
    }).catch(err => {
        res.status(500).json({
            success: false,
            message: err.toString()
        })
    })
})

router.put('/edit', utility.authenticate, checkSubscription, (req, res) => {
    const { id, name } = req.body;
    Brand.findOne(
        {
            where: {
                id
            }
        }
    ).then(brand => {
        brand.name = name
        brand.save().then(
            savedBrand => {
                res.json({ message: 'Marque modifié', success: true })
            }
        ).catch(err => {
            res.status(500).json({
                success: false,
                message: err.toString()
            })
        })
    }).catch(err => {
        res.status(500).json({
            success: false,
            message: err.toString()
        })
    })
})


router.get('/store/:id', utility.authenticate, checkSubscription, (req, res, next) => {
    const storeId = req.params.id;

    Brand.findAll({
        where: {
            storeId
        }
    }).then(brand => {
        res.json(brand)

    }).catch(err => {
        res.status(500).json({
            success: false,
            message: err.toString()
        })
    })
});


router.delete('/:id', utility.authenticate, checkSubscription, (req, res, next) => {
    const id = req.params.id;
    Brand.destroy({
        where: {
            id
        }
    }).then(deletedRows => {
        if (deletedRows > 0)
            res.json({ success: true, message: "Brand deleted" })
        else
            res.status(500).json({ success: false, message: "Brand not found" })
    }).catch(err => {
        res.status(500).json({
            success: false,
            message: err.toString()
        })
    })
});

router.get('/:id', utility.authenticate, checkSubscription, (req, res, next) => {
    const id = req.params.id;
    Brand.findOne({
        where: {
            id
        },
        include: {
            model: Brand, as: 'subBrands', include: {
                model: Brand, as: 'subBrands',
                include: {
                    model: Brand, as: 'subBrands',
                    include: {
                        model: Brand, as: 'subBrands',
                        include: { model: Brand, as: 'subBrands' }
                    }
                }
            }
        }
    }).then(brand => {
        res.json(brand)

    }).catch(err => {
        res.status(500).json({
            success: false,
            message: err.toString()
        })
    })
});

router.get('/parent/:id', utility.authenticate, checkSubscription, (req, res, next) => {
    const id = req.params.id;
    Brand.findOne({
        where: {
            id
        },
        include: {
            model: Brand, as: 'parentBrand', include: {
                model: Brand, as: 'parentBrand',
                include: {
                    model: Brand, as: 'parentBrand',
                    include: {
                        model: Brand, as: 'parentBrand',
                        include: { model: Brand, as: 'parentBrand' }
                    }
                }
            }
        }
    }).then(brand => {
        res.json(brand)

    }).catch(err => {
        console.log(err)
        res.status(500).json({
            success: false,
            message: err.toString()
        })
    })
});

module.exports = router;