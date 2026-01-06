const express = require('express');
const router = express.Router();
const { Product, Operation, Supplier, Category, CartItem } = require('../models');
const utility = require('../utility');
const checkSubscription = require('../checkSubscription');
const { Op, literal } = require('sequelize');



// GET CART
router.get('/cart', utility.authenticate, async (req, res) => {
    try {
        const userId = req.user.id;

        const items = await CartItem.findAll({
            where: { userId },
            include: [{ model: Product, as: "product" }]
        });

        res.json(items);

    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// CLEAR FULL CART
router.delete('/cart', utility.authenticate, async (req, res) => {
    try {
        const userId = req.user.id;

        await CartItem.destroy({ where: { userId } });

        res.json({ success: true });

    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// ADD TO CART
router.post('/cart/add', utility.authenticate, async (req, res) => {
    try {
        const userId = req.user.id;
        const { productId, quantity } = req.body;

        let item = await CartItem.findOne({ where: { userId, productId } });

        if (item) {
            item.quantity += quantity;
            await item.save();
        } else {
            item = await CartItem.create({ userId, productId, quantity });
        }

        res.json({ success: true, item });

    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false, message: err.message });
    }
});

// UPDATE CART QUANTITY
router.put('/cart/update', utility.authenticate, async (req, res) => {
    try {
        const userId = req.user.id;
        const { productId, quantity } = req.body;

        const item = await CartItem.findOne({ where: { userId, productId } });

        if (!item) {
            return res.status(404).json({ success: false, message: "Item not found" });
        }

        item.quantity = quantity;
        await item.save();

        res.json({ success: true, item });

    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// REMOVE ITEM FROM CART
router.delete('/cart/:productId', utility.authenticate, async (req, res) => {
    try {
        const userId = req.user.id;
        const productId = req.params.productId;

        await CartItem.destroy({ where: { userId, productId } });

        res.json({ success: true });

    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.post('/create', utility.authenticate, checkSubscription, (req, res) => {
    const { name, code, buyingPrice, sellingPrice, currency, color, size, description, images, thumbnails, quantity, unit, storeId, supplierId, categoryId, brandId, criticalStockIndicator, toDisplay } = req.body
    Product.create({ name, code, buyingPrice, sellingPrice, currency, color, size, description, images: JSON.stringify(images), thumbnails: JSON.stringify(thumbnails || []), quantity, unit, storeId, supplierId, categoryId, brandId, creatorUserId: req.user.id, criticalStockIndicator, toDisplay }).then(createdProduct => {
        console.log(quantity)
        if (quantity > 0) {
            Operation.create({ receiptId: null, type: "LOADED", productId: createdProduct.id, amount: quantity, price: createdProduct.buyingPrice, date: new Date(), creatorUserId: req.user.id })
                .then(createdOperation => {
                    res.json({
                        product: createdProduct
                    })
                }).catch(err => {
                    console.log(err)
                    res.status(500).json({ err })
                })
        } else {
            res.json({
                product: createdProduct
            })
        }
    }).catch(err => {
        console.log(err)
        res.status(500).json({ err })
    })
})

router.put('/edit', utility.authenticate, checkSubscription, (req, res) => {
    const { id, name, code, color, quantity, unit, images, thumbnails, sellingPrice, description, buyingPrice, size, supplierId, categoryId, brandId, criticalStockIndicator, toDisplay, activateCriticalStockIndicator } = req.body
    Product.findOne(
        {
            where: {
                id,
                creatorUserId: req.user.id
            }
        }
    ).then(product => {
        product.name = name
        product.code = code
        product.color = color
        product.images = JSON.stringify(images)
        product.thumbnails = JSON.stringify(thumbnails || [])
        product.quantity = quantity
        product.unit = unit
        product.supplierId = supplierId
        product.categoryId = categoryId
        product.brandId = brandId
        product.description = description
        product.sellingPrice = sellingPrice
        product.buyingPrice = buyingPrice
        product.toDisplay = toDisplay
        product.criticalStockIndicator = criticalStockIndicator
        product.activateCriticalStockIndicator = activateCriticalStockIndicator
        product.size = size
        product.save().then(
            savedProduct => {
                res.json({ message: 'Produit modifié', success: true })
            }
        ).catch(err => {
            res.status(500).json({ err: err })
        })
    }).catch(err => {
        console.log(err)
        res.status(500).json({ err: err })
    })
})

// Bulk update toDisplay for selected products or all products
router.put('/bulk-visibility', utility.authenticate, checkSubscription, async (req, res) => {
    try {
        const { ids, toDisplay, updateAll, storeId } = req.body;
        const userId = req.user.id;

        let whereClause = {
            creatorUserId: userId,
            isVisible: true
        };

        if (storeId) {
            whereClause.store_id = storeId;
        }

        if (!updateAll) {
            if (!ids || ids.length === 0) {
                return res.status(400).json({ success: false, message: "Aucun produit sélectionné" });
            }
            whereClause.id = { [Op.in]: ids };
        }

        const [affectedCount] = await Product.update(
            { toDisplay: toDisplay },
            { where: whereClause }
        );

        res.json({
            success: true,
            message: `${affectedCount} produit(s) mis à jour`,
            affectedCount
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: err.toString() });
    }
});

router.get('/all', (req, res, next) => {
    const id = req.params.id;
    Product.findAll({
        where: {

        }, include: ['brand', 'category', 'supplier']
    }).then(product => {
        res.json(product)

    }).catch(err => {
        res.status(500).json({
            success: false,
            message: err.toString()
        })
    })
});
router.get('/store/:id', utility.authenticate, checkSubscription, (req, res, next) => {
    const id = req.params.id;

    // Pagination options
    const pagination = {
        page: req.query.page,
        pageSize: req.query.size
    };

    // Common ordering clause: newest first
    const order = [['createdAt', 'DESC']];

    const whereClause = {
        store_id: id,
        ...utility.buildQuery(req.query.query),
        creatorUserId: req.user.id,
        isVisible: true
    };

    if (req.query.critical === 'true') {
        whereClause[Op.and] = [
            literal('"quantity" <= "critical_stock_indicator" AND "activate_critical_stock_indicator" = true')
        ];
    }

    if (!req.query.searchable) {
        Product.findAll(
            utility.paginate({
                where: whereClause,
                include: ['supplier', 'category'],
                order
            }, pagination)
        ).then(products => {
            res.json(products);
        }).catch(err => {
            res.status(500).json({ success: false, message: err.toString() });
        });
    } else {
        const searchable = req.query.searchable;

        const searchFilter = searchable
            ? {
                [Op.or]: [
                    { name: { [Op.iLike]: `%${searchable}%` } },
                    { '$category.name$': { [Op.iLike]: `%${searchable}%` } },
                    { code: { [Op.iLike]: `%${searchable}%` } }
                ]
            }
            : {};

        Product.findAll(
            utility.paginate({
                where: {
                    ...searchFilter,
                    store_id: id,
                    creatorUserId: req.user.id,
                    isVisible: true
                },
                include: [
                    { model: Supplier, as: 'supplier', required: false },
                    { model: Category, as: 'category', required: false }
                ],
                order
            }, pagination)
        ).then(products => {
            res.json(products);
        }).catch(err => {
            res.status(500).json({ success: false, message: err.toString() });
        });
    }
});


router.get('/count/store/:id', utility.authenticate, checkSubscription, (req, res, next) => {
    if (!req.query.searchable) {
        const id = req.params.id;

        const whereClause = {
            store_id: id,
            ...utility.buildQuery(req.query.query),
            isVisible: true,
            creatorUserId: req.user.id
        };

        if (req.query.critical === 'true') {
            whereClause[Op.and] = [
                literal('"quantity" <= "critical_stock_indicator"')
            ];
        }

        Product.count({
            where: whereClause
        }).then(countProducts => {
            res.json(countProducts)
        }).catch(err => {
            res.status(500).json({
                success: false,
                message: err.toString()
            })
        })

    } else {

        const id = req.params.id;
        const searchable = req.query.searchable;

        const searchFilter = searchable
            ? {
                [Op.or]: [
                    { name: { [Op.iLike]: `%${searchable}%` } },
                    { '$category.name$': { [Op.iLike]: `%${searchable}%` } }
                ]
            }
            : {};

        Product.count({
            where: {
                store_id: id,
                isVisible: true,
                creatorUserId: req.user.id,
                ...searchFilter,
            },
            include: [
                {
                    model: Category,
                    as: 'category',
                    required: false
                }
            ]
        })
            .then(countProducts => {
                res.json(countProducts);
            })
            .catch(err => {
                res.status(500).json({
                    success: false,
                    message: err.toString()
                });
            });

    }
});



router.get('/allStores', (req, res, next) => {
    const id = req.params.id;

    // Pagination options
    const pagination = {
        page: req.query.page,
        pageSize: req.query.size
    };

    // Common ordering clause: newest first
    const order = [['createdAt', 'DESC']];

    if (!req.query.searchable) {
        Product.findAll(
            utility.paginate({
                where: {
                    ...utility.buildQuery(req.query.query),
                    isVisible: true
                },
                include: ['supplier', 'category'],
                order
            }, pagination)
        ).then(products => {
            res.json(products);
        }).catch(err => {
            res.status(500).json({ success: false, message: err.toString() });
        });
    } else {
        const searchable = req.query.searchable;

        const searchFilter = searchable
            ? {
                [Op.or]: [
                    { name: { [Op.iLike]: `%${searchable}%` } },
                    { '$category.name$': { [Op.iLike]: `%${searchable}%` } },
                ]
            }
            : {};

        Product.findAll(
            utility.paginate({
                where: {
                    ...searchFilter,
                    isVisible: true
                },
                include: [
                    { model: Supplier, as: 'supplier', required: false },
                    { model: Category, as: 'category', required: false }
                ],
                order
            }, pagination)
        ).then(products => {
            res.json(products);
        }).catch(err => {
            res.status(500).json({ success: false, message: err.toString() });
        });
    }
});


router.get('/count/allStores', (req, res, next) => {
    if (!req.query.searchable) {
        const id = req.params.id;
        Product.count({
            where: {
                ...utility.buildQuery(req.query.query),
                isVisible: true,
            }
        }).then(countProducts => {
            res.json(countProducts)
        }).catch(err => {
            res.status(500).json({
                success: false,
                message: err.toString()
            })
        })

    } else {

        const id = req.params.id;
        const searchable = req.query.searchable;

        const searchFilter = searchable
            ? {
                [Op.or]: [
                    { name: { [Op.iLike]: `%${searchable}%` } },
                    { '$category.name$': { [Op.iLike]: `%${searchable}%` } }
                ]
            }
            : {};

        Product.count({
            where: {
                store_id: id,
                isVisible: true,
                creatorUserId: req.user.id,
                ...searchFilter,
            },
            include: [
                {
                    model: Category,
                    as: 'category',
                    required: false
                }
            ]
        })
            .then(countProducts => {
                res.json(countProducts);
            })
            .catch(err => {
                res.status(500).json({
                    success: false,
                    message: err.toString()
                });
            });

    }
});

router.get('/store/:id/critical', utility.authenticate, checkSubscription, (req, res, next) => {
    const id = req.params.id;

    Product.findAll({
        where: {
            store_id: id,
            creatorUserId: req.user.id,
            isVisible: true,
            activate_critical_stock_indicator: true,
            [Op.and]: [
                literal('"quantity" <= "critical_stock_indicator"')
            ]
        },
        limit: req.query.limit ? Number(req.query.limit) : null,
        order: [['quantity', 'ASC']]
    })
        .then(products => res.json(products))
        .catch(err => {
            res.status(500).json({
                success: false,
                message: err.toString()
            });
        });
});




router.delete('/:id', utility.authenticate, checkSubscription, (req, res, next) => {
    const id = req.params.id;
    Product.findOne({
        where: {
            id,
            creatorUserId: req.user.id
        }
    }).then(product => {
        product.isVisible = false;
        product.save().then(
            savedProduct => {
                res.status(200).json({ success: true, message: "Produit supprimé" })
            }
        ).catch(err => {
            res.status(500).json({ err: err })
        })
    }).catch(err => {
        res.status(500).json({
            success: false,
            message: err.toString()
        })
    })
});



/*router.delete('/:id', utility.authenticate, checkSubscription, (req, res, next) => {
    const id = req.params.id;
    Product.destroy({
        where: {
            id,
            creatorUserId: req.user.id
        }
    }).then(deletedRows => {
        if (deletedRows > 0)
            res.json({ success: true, message: "Product deleted" })
        else
            res.status(500).json({ success: false, message: "Product not found" })
    }).catch(err => {
        res.status(500).json({
            success: false,
            message: err.toString()
        })
    })
});*/

router.get('/:id', utility.authenticate, checkSubscription, (req, res, next) => {
    const id = req.params.id;
    Product.findOne({
        where: {
            id,
            creatorUserId: req.user.id,
            isVisible: true
        }, include: ['brand', 'category', 'supplier']
    }).then(product => {
        res.json(product)

    }).catch(err => {
        res.status(500).json({
            success: false,
            message: err.toString()
        })
    })
});

/**
 * Recursive function to get all descendant category IDs
 */
async function getAllCategoryIds(CategoryModel, parentCategoryId) {
    const ids = [parentCategoryId];

    async function getChildren(id) {
        const children = await CategoryModel.findAll({
            where: { parentCategoryId: id },
            attributes: ['id']
        });
        for (const child of children) {
            ids.push(child.id);
            await getChildren(child.id);
        }
    }

    await getChildren(parentCategoryId);
    return ids;
}

/**
 * GET /store/:id/products
 * Query params:
 * - page
 * - size
 * - searchable
 * - categoryId (optional, parent category)
 * - query (optional, filters built by utility.buildQuery)
 */
router.get('/allStores/products', utility.authenticate, checkSubscription, async (req, res) => {
    try {

        // Pagination options
        const pagination = {
            page: parseInt(req.query.page) || 0,
            pageSize: parseInt(req.query.size) || 24
        };

        const order = [['createdAt', 'DESC']];

        // Base where clause
        let whereClause = {
            creatorUserId: req.user.id,
            isVisible: true,
            ...utility.buildQuery(req.query.query)
        };

        // Handle category filter (parent + all descendants)
        if (req.query.categoryId) {
            const categoryIds = await getAllCategoryIds(Category, parseInt(req.query.categoryId));
            whereClause.categoryId = { [Op.in]: categoryIds };
        }

        // Handle search
        if (req.query.searchable) {
            const searchable = req.query.searchable;
            whereClause = {
                ...whereClause,
                [Op.or]: [
                    { name: { [Op.iLike]: `%${searchable}%` } },
                    { '$category.name$': { [Op.iLike]: `%${searchable}%` } }
                ]
            };
        }

        const products = await Product.findAll(
            utility.paginate({
                where: whereClause,
                include: [
                    { model: Supplier, as: 'supplier', required: false },
                    { model: Category, as: 'category', required: false }
                ],
                order
            }, pagination)
        );

        res.json(products);
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: err.toString() });
    }
});

router.get('/allStores/products/count', utility.authenticate, checkSubscription, async (req, res) => {
    try {
        // Base where clause
        let whereClause = {
            creatorUserId: req.user.id,
            isVisible: true,
            ...utility.buildQuery(req.query.query)
        };

        // Handle category filter (parent + all descendants)
        if (req.query.categoryId) {
            const categoryIds = await getAllCategoryIds(Category, parseInt(req.query.categoryId));
            whereClause.categoryId = { [Op.in]: categoryIds };
        }

        // Handle search
        if (req.query.searchable) {
            const searchable = req.query.searchable;
            whereClause = {
                ...whereClause,
                [Op.or]: [
                    { name: { [Op.iLike]: `%${searchable}%` } },
                    { '$category.name$': { [Op.iLike]: `%${searchable}%` } }
                ]
            };
        }

        const count = await Product.count({
            where: whereClause,
            include: [
                { model: Supplier, as: 'supplier', required: false },
                { model: Category, as: 'category', required: false }
            ]
        });

        res.json({ count });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: err.toString() });
    }
});


module.exports = router;