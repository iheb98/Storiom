const express = require('express');
const router = express.Router();
const { Category } = require('../models');
const utility = require('../utility');
const checkSubscription = require('../checkSubscription');
const { Op } = require('sequelize');

router.post('/create', utility.authenticate, checkSubscription, (req, res) => {
    const { name, parentCategoryId, storeId } = req.body
    Category.create({ name, parentCategoryId, storeId, static: req.user.id == 5 ? true : false }).then(createdCategory => {
        res.json(createdCategory)
    }).catch(err => {
        res.status(500).json({
            success: false,
            message: err.toString()
        })
    })
})

router.put('/edit', utility.authenticate, checkSubscription, (req, res) => {
    const { id, name } = req.body;
    Category.findOne(
        {
            where: {
                id
            }
        }
    ).then(category => {
        if (req.user.id != 5 && category.static == true) {
            res.status(500).json({
                success: false,
                message: "Tu n'as pas le droit de modifier cette Catégorie"
            })
        } else {
            category.name = name
            category.save().then(
                savedCategory => {
                    res.json({ message: 'Catégorie modifié', success: true })
                }
            ).catch(err => {
                res.status(500).json({
                    success: false,
                    message: err.toString()
                })
            })
        }
    }).catch(err => {
        res.status(500).json({
            success: false,
            message: err.toString()
        })
    })
})


router.get('/store/:id', utility.authenticate, checkSubscription, (req, res, next) => {
    const storeId = req.params.id;

    Category.findAll({
        where: {
            [Op.or]: {
                storeId,
                [Op.and]: {
                    parentCategoryId: null,
                    static: true
                }
            }
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
        res.status(500).json({
            success: false,
            message: err.toString()
        })
    })
});

router.get('/store/:id/flat', utility.authenticate, checkSubscription, async (req, res, next) => {
    try {
        const storeId = req.params.id;

        const categories = await Category.findAll({
            where: {
                [Op.or]: {
                    storeId,
                    [Op.and]: {
                        parentCategoryId: null,
                        static: true
                    }
                }
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
        });

        const flattenCategories = (categories, parentPath = '') => {
            let result = [];

            categories.forEach(category => {
                const categoryPath = parentPath ? `${parentPath} > ${category.name}` : category.name;

                result.push({ name: categoryPath, id: category.id });

                if (category.subCategories && category.subCategories.length > 0) {
                    result = result.concat(flattenCategories(category.subCategories, categoryPath));
                }
            });

            return result;
        };

        const flattenedCategories = flattenCategories(categories);

        res.json(flattenedCategories);
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.toString()
        });
    }
});

function extractCategories(data) {
    let result = [];
    data.forEach(item => {
        result.push({ id: item.id, name: item.name });
        if (item.subCategories && item.subCategories.length > 0) {
            result = result.concat(extractCategories(item.subCategories));
        }
    });
    return result;
}


router.delete('/:id', utility.authenticate, checkSubscription, (req, res, next) => {
    const id = req.params.id;

    Category.findOne(
        {
            where: {
                id
            }
        }
    ).then(category => {
        if (req.user.id != 5 && category.static == true) {
            res.status(500).json({
                success: false,
                message: "Tu n'as pas le droit de modifier cette Catégorie"
            })
        } else {
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
                res.status(500).json({
                    success: false,
                    message: err.toString()
                })
            })
        }
    }).catch(err => {
        res.status(500).json({
            success: false,
            message: err.toString()
        })
    })

});

router.get('/:id', utility.authenticate, checkSubscription, (req, res, next) => {
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
        res.status(500).json({
            success: false,
            message: err.toString()
        })
    })
});

router.get('/parent/:id', utility.authenticate, checkSubscription, (req, res, next) => {
    const id = req.params.id;
    Category.findOne({
        where: {
            id
        },
        include: {
            model: Category, as: 'parentCategory', include: {
                model: Category, as: 'parentCategory',
                include: {
                    model: Category, as: 'parentCategory',
                    include: {
                        model: Category, as: 'parentCategory',
                        include: { model: Category, as: 'parentCategory' }
                    }
                }
            }
        }
    }).then(category => {
        res.json(category)

    }).catch(err => {
        console.log(err)
        res.status(500).json({
            success: false,
            message: err.toString()
        })
    })
});

module.exports = router;