const express = require('express');
const router = express.Router();
const { Category, StoreCategoryVisibility } = require('../models');
const utility = require('../utility');
const checkSubscription = require('../checkSubscription');
const { Op } = require('sequelize');

// CREATE CATEGORY
// Admin creates static categories, Owner creates store-specific ones
router.post('/create', utility.authenticate, checkSubscription, (req, res) => {
    const { name, parentCategoryId, storeId, image, icon } = req.body;
    const isAdmin = req.user.role === 'Admin' || req.user.role === 'SuperAdmin';
    const isStatic = isAdmin && !storeId;

    Category.create({
        name,
        parentCategoryId,
        storeId: isStatic ? null : storeId,
        image,
        icon,
        static: isStatic,
        creatorUserId: req.user.id
    }).then(createdCategory => {
        res.json(createdCategory)
    }).catch(err => {
        res.status(500).json({
            success: false,
            message: err.toString()
        })
    })
})

// EDIT CATEGORY
// Admin can edit any, Owner can edit their own (non-static) categories
router.put('/edit', utility.authenticate, checkSubscription, (req, res) => {
    const { id, name, image, icon } = req.body;
    Category.findOne({ where: { id } }).then(category => {
        const isAdmin = req.user.role === 'Admin' || req.user.role === 'SuperAdmin';
        const isOwner = req.user.role === 'Owner';

        if (isAdmin) {
            // Admin can edit anything
        } else if (isOwner && !category.static) {
            // Owner can edit their own non-static categories
        } else {
            return res.status(403).json({
                success: false,
                message: "Vous n'avez pas le droit de modifier cette catégorie"
            });
        }

        category.name = name;
        if (image !== undefined) category.image = image;
        if (icon !== undefined) category.icon = icon;
        category.save().then(() => {
            res.json({ message: 'Catégorie modifiée', success: true })
        }).catch(err => {
            res.status(500).json({ success: false, message: err.toString() })
        })
    }).catch(err => {
        res.status(500).json({ success: false, message: err.toString() })
    })
})

// GET CATEGORIES FOR STORE (tree view)
// Returns static parent categories + store-specific categories
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

// GET FLAT CATEGORIES FOR STORE
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

// DELETE CATEGORY
// Admin can delete any, Owner can delete their own (non-static) categories
router.delete('/:id', utility.authenticate, checkSubscription, (req, res, next) => {
    const id = req.params.id;
    Category.findOne({ where: { id } }).then(category => {
        const isAdmin = req.user.role === 'Admin' || req.user.role === 'SuperAdmin';
        const isOwner = req.user.role === 'Owner';

        if (isAdmin) {
            // Admin can delete anything
        } else if (isOwner && !category.static) {
            // Owner can delete their own non-static categories
        } else {
            return res.status(403).json({
                success: false,
                message: "Vous n'avez pas le droit de supprimer cette catégorie"
            });
        }

        Category.destroy({ where: { id } }).then(deletedRows => {
            if (deletedRows > 0)
                res.json({ success: true, message: "Category deleted" })
            else
                res.status(500).json({ success: false, message: "Category not found" })
        }).catch(err => {
            res.status(500).json({ success: false, message: err.toString() })
        })
    }).catch(err => {
        res.status(500).json({ success: false, message: err.toString() })
    })
});

// GET SINGLE CATEGORY (tree)
router.get('/:id', utility.authenticate, checkSubscription, (req, res, next) => {
    const id = req.params.id;
    Category.findOne({
        where: { id },
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
        res.status(500).json({ success: false, message: err.toString() })
    })
});

// GET PARENT CHAIN
router.get('/parent/:id', utility.authenticate, checkSubscription, (req, res, next) => {
    const id = req.params.id;
    Category.findOne({
        where: { id },
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
        res.status(500).json({ success: false, message: err.toString() })
    })
});

// ========================================
// STORE CATEGORY VISIBILITY
// ========================================

// GET visibility settings for a store
router.get('/store/:id/visibility', utility.authenticate, checkSubscription, async (req, res) => {
    try {
        const storeId = req.params.id;
        const records = await StoreCategoryVisibility.findAll({
            where: { storeId },
            attributes: ['categoryId', 'visible']
        });
        // Return as a map: { categoryId: visible }
        const visibilityMap = {};
        records.forEach(r => {
            visibilityMap[r.categoryId] = r.visible;
        });
        res.json(visibilityMap);
    } catch (err) {
        res.status(500).json({ success: false, message: err.toString() });
    }
});

// TOGGLE visibility of a category for a store
router.put('/store/:storeId/visibility/:categoryId', utility.authenticate, checkSubscription, async (req, res) => {
    try {
        const { storeId, categoryId } = req.params;
        const { visible } = req.body;

        const [record, created] = await StoreCategoryVisibility.findOrCreate({
            where: { storeId, categoryId },
            defaults: { visible }
        });

        if (!created) {
            record.visible = visible;
            await record.save();
        }

        res.json({ success: true, categoryId: parseInt(categoryId), visible: record.visible });
    } catch (err) {
        res.status(500).json({ success: false, message: err.toString() });
    }
});

// BULK SET visibility for a store (set multiple categories at once)
router.put('/store/:storeId/visibility', utility.authenticate, checkSubscription, async (req, res) => {
    try {
        const storeId = req.params.storeId;
        const { categories } = req.body; // Array of { categoryId, visible }

        const promises = categories.map(({ categoryId, visible }) =>
            StoreCategoryVisibility.findOrCreate({
                where: { storeId, categoryId },
                defaults: { visible }
            }).then(([record, created]) => {
                if (!created) {
                    record.visible = visible;
                    return record.save();
                }
            })
        );

        await Promise.all(promises);
        res.json({ success: true, message: `${categories.length} catégorie(s) mises à jour` });
    } catch (err) {
        res.status(500).json({ success: false, message: err.toString() });
    }
});

module.exports = router;