const express = require('express');
const router = express.Router();
const { Category } = require('../models');
const utility = require('../utility');

router.post('/create',utility.authenticate, (req, res) => {
    const { name, parentCategoryId, storeId } = req.body
    Category.create({ name, parentCategoryId, storeId }).then(createdCategory => {
        res.json(createdCategory)
    }).catch(err => {
        res.status(500).json(err)
    })
})

router.put('/edit',utility.authenticate, (req, res) => {
    const { id, name } = req.body;
    Category.findOne(
        {
            where: {
                id
            }
        }
    ).then(category => {
        category.name = name
        category.save().then(
            savedCategory => {
                res.json({ message: 'Categorie modifié', success: true })
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

    Category.findAll({
        where: {
            storeId
        },
        include: {
            model: Category, as: 'subCategories',
            include: {
                model: Category, as: 'subCategories',
                include: {
                    model: Category, as: 'subCategories',
                    include: {
                        model: Category, as: 'subCategories',
                        include: { model: Category, as: 'subCategories' }
                    }
                }
            }
        }
    }).then(category => {
        res.json(category)

    }).catch(err => {
        console.log(err)
        res.status(500).json(err)
    })
});


router.delete('/:id',utility.authenticate, (req, res, next) => {
    const id = req.params.id;
    Category.destroy({
        where: {
            id
        }
    }).then(deletedRows => {
        if (deletedRows > 0)
            res.json({ success: true, message: "Category deleted" })
        else
            res.status(500).json({ success: false, message: "Category not found" })
    }).catch(err => {
        res.status(500).json(err)
    })
});

router.get('/:id',utility.authenticate, (req, res, next) => {
    const id = req.params.id;
    Category.findOne({
        where: {
            id
        },
        include: {
            model: Category, as: 'subCategories', include: {
                model: Category, as: 'subCategories',
                include: {
                    model: Category, as: 'subCategories',
                    include: {
                        model: Category, as: 'subCategories',
                        include: { model: Category, as: 'subCategories' }
                    }
                }
            }
        }
    }).then(category => {
        res.json(category)

    }).catch(err => {
        res.status(500).json(err)
    })
});

module.exports = router;