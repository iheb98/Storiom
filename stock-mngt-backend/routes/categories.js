const express = require('express');
const router = express.Router();
const { Category } = require('../models');

router.post('/create', (req, res) => {
    const { name, parentCategoryId, storeId } = req.body
    Category.create({ name, parentCategoryId, storeId }).then(createdCategory => {
        res.json({
            category: createdCategory
        })
    }).catch(err => {
        res.status(500).json(err)
    })
})

router.get('/', (req, res, next) => {
    Category.findAll().then(categories => {
        res.json(categories)
    }).catch(err => {
        res.status(500).json(err)
    })
});

router.get('/store/:id', (req, res, next) => {
    const storeId = req.params.id;
    Category.findOne({
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
        res.status(500).json(err)
    })
});


router.delete('/:id', (req, res, next) => {
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

router.get('/:id', (req, res, next) => {
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