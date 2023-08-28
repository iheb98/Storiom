const express = require('express');
const router = express.Router();
const { Brand } = require('../models');
const utility = require('../utility');

router.post('/create',utility.authenticate, (req, res) => {
    const { name, parentBrandId, storeId } = req.body
    Brand.create({ name, parentBrandId, storeId }).then(createdBrand => {
        res.json(createdBrand)
    }).catch(err => {
        res.status(500).json(err)
    })
})

router.put('/edit',utility.authenticate, (req, res) => {
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
            res.status(500).json(err)
        })
    }).catch(err => {
        res.status(500).json(err)
    })
})


router.get('/store/:id',utility.authenticate, (req, res, next) => {
    const storeId = req.params.id;

    Brand.findAll({
        where: {
            storeId
        }
    }).then(brand => {
        res.json(brand)

    }).catch(err => {
        res.status(500).json(err)
    })
});


router.delete('/:id',utility.authenticate, (req, res, next) => {
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
        res.status(500).json(err)
    })
});

router.get('/:id',utility.authenticate, (req, res, next) => {
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
        res.status(500).json(err)
    })
});

router.get('/parent/:id',utility.authenticate, (req, res, next) => {
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
        res.status(500).json(err)
    })
});

module.exports = router;