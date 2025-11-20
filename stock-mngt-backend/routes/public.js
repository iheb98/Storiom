const express = require('express');
const router = express.Router();
const { Product, Category, Store, Supplier } = require('../models');
const { Op, Sequelize, where } = require('sequelize');
const utility = require('../utility');

/**
 * @route   GET /api/public/products/random
 * @desc    Get a list of random products for the public homepage
 * @access  Public
 */
router.get('/products/random', async (req, res) => {
    const limit = req.query.limit ? parseInt(req.query.limit, 10) : 12;

    try {
        const products = await Product.findAll({
            where: {
                toDisplay: true, // Only show products marked for display
                quantity: { [Op.gt]: 0 } // Only show products that are in stock
            },
            order: Sequelize.literal('RANDOM()'), // This works for PostgreSQL and SQLite
            limit: limit,
            include: [
                { model: Store, as: 'store', attributes: ['name'] }
            ]
        });
        res.json(products);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
});

/**
 * @route   GET /api/public/categories/tree
 * @desc    Get all static categories and their sub-categories as a tree
 * @access  Public
 */
router.get('/categories/tree', async (req, res) => {
    try {
        const categories = await Category.findAll({
            where: {
                // We fetch top-level categories that are static (shared across stores)
                parentCategoryId: null,
                static: true
            },
            include: [ // A recursive include to fetch the entire category tree
                {
                    model: Category,
                    as: 'subCategories',
                    include: {
                        model: Category,
                        as: 'subCategories',
                        include: {
                            model: Category,
                            as: 'subCategories',
                            include: { model: Category, as: 'subCategories' }
                        }
                    }
                }
            ]
        });
        res.json(categories);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
});

/**
 * @route   GET /api/public/products/search
 * @desc    Search for products by name or description
 * @access  Public
 */
router.get('/products/search', async (req, res) => {
    const query = req.query.q || '';

    try {
        const products = await Product.findAll({
            where: {
                toDisplay: true,
                [Op.or]: [
                    { name: { [Op.iLike]: `%${query}%` } },
                    { description: { [Op.iLike]: `%${query}%` } }
                ]
            },
            limit: 20 // Limit search results
        });
        res.json(products);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
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

function extractAndRemoveCategoryId(query) {
    // 1. Extract categoryId value
    const match = query.match(/categoryId\s*=\s*(\d+)/);
    const categoryId = match ? match[1] : null;

    // 2. Remove the "categoryId = X," part (with or without comma/extra spaces)
    const cleaned = query
        .replace(/,\s*categoryId\s*=\s*\d+|categoryId\s*=\s*\d+\s*,?/g, '') // remove the segment
        .replace(/\s{2,}/g, ' ')                                           // fix double spaces
        .trim()
        .replace(/,\s*,/g, ',');                                           // fix leftover commas

    return { categoryId, cleaned };
}


router.get('/allStores/products', async (req, res) => {
    try {
        // -------------------------------
        // 0. Pagination
        // -------------------------------
        const pagination = {
            page: parseInt(req.query.page) || 0,
            pageSize: parseInt(req.query.size) || 24
        };

        // -------------------------------
        // 1. Default Order
        // -------------------------------
        let order = [['createdAt', 'DESC']];

        // -------------------------------
        // 2. Sorting logic
        // -------------------------------
        if (req.query.sort) {
            switch (req.query.sort) {
                case "priceAsc":
                    order = [['sellingPrice', 'ASC']];
                    break;

                case "priceDesc":
                    order = [['sellingPrice', 'DESC']];
                    break;
            }
        }

        // -------------------------------
        // 3. Extract categoryId from query
        // -------------------------------
        let rawQuery = req.query.query || "";
        const extracted = extractAndRemoveCategoryId(rawQuery);
        rawQuery = extracted.cleaned;
        const extractedCategoryId = extracted.categoryId;

        // -------------------------------
        // 4. Build where clause
        // -------------------------------
        let whereClause = {
            isVisible: true,
            ...utility.buildQuery(rawQuery)
        };

        // -------------------------------
        // 5. Handle category descendants
        // -------------------------------
        if (extractedCategoryId !== null) {
            const categoryIds = await getAllCategoryIds(Category, extractedCategoryId);
            whereClause.categoryId = { [Op.in]: categoryIds };
        }

        // -------------------------------
        // 6. Search filter
        // -------------------------------
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

        // -------------------------------
        // 7. Fetch products
        // -------------------------------
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

        return res.json(products);

    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: err.toString() });
    }
});




router.get('/allStores/products/count', async (req, res) => {
    try {
        let rawQuery = req.query.query || "";
        let extractedCategoryId = null;

        // -------------------------------
        // 1. Extract categoryId from query string
        // -------------------------------
        const result = extractAndRemoveCategoryId(rawQuery);
        rawQuery = result.cleaned;
        extractedCategoryId = result.categoryId;

        // -------------------------------
        // 2. Build base where clause
        // -------------------------------
        let whereClause = {
            isVisible: true,
            ...utility.buildQuery(rawQuery)
        };

        // -------------------------------
        // 3. Handle category descendants
        // -------------------------------
        if (extractedCategoryId !== null) {
            const categoryIds = await getAllCategoryIds(Category, extractedCategoryId);
            whereClause.categoryId = { [Op.in]: categoryIds };
        }

        // -------------------------------
        // 4. Handle search
        // -------------------------------
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

        // -------------------------------
        // 5. Count only
        // -------------------------------
        const total = await Product.count({
            where: whereClause,
            include: [
                { model: Category, as: 'category', required: false }
            ]
        });

        res.json({ count: total });

    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: err.toString() });
    }
});


router.get('/allStores', (req, res, next) => {
    Store.findAll().then(stores => {
        res.json(stores)
    }).catch(err => {
        res.status(500).json({
            success: false,
            message: err.toString()
        })
    })
});

router.get('/publicProduct/:id', (req, res, next) => {
    const id = req.params.id;
    Product.findOne({
        where: {
            id,
            isVisible: true,
            toDisplay: true
        }, include: ['brand', 'category', 'supplier', 'store']
    }).then(product => {
        res.json(product)

    }).catch(err => {
        res.status(500).json({
            success: false,
            message: err.toString()
        })
    })
});

module.exports = router;