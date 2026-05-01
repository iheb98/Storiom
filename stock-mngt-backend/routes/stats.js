const express = require('express');
const router = express.Router();
const { Product, Operation, Credit, Category, Receipt, ServiceRequest, StoreService } = require('../models');
const utility = require('../utility');
const checkSubscription = require('../checkSubscription');
const sequelize = require('sequelize');
const { Op } = require('sequelize');

router.get('/store/:id/widgets', utility.authenticate, checkSubscription, async (req, res, next) => {
    const id = req.params.id;
    try {
        const products = await Product.findAll({
            where: {
                store_id: id,
                creatorUserId: req.user.id,
                isVisible: true
            }
        })
        const credits = await Credit.findAll({
            where: {
                store_id: id,
                creatorUserId: req.user.id,
                status: false
            }
        })
        const operations = await Operation.findAll({
            where: {
                [utility.Op.and]: [
                    utility.Sequelize.where(
                        utility.Sequelize.fn('date', utility.Sequelize.col('Operation.date')),
                        '=',
                        utility.getSimpleDate(new Date())
                    ),
                    {
                        [utility.Op.or]: [
                            { '$receipt.visible$': true },
                            { receiptId: null } // Adjust if your foreign key is named differently
                        ]
                    }
                ],
                creatorUserId: req.user.id
            },
            include: [
                {
                    model: Receipt,
                    as: 'receipt',
                    required: false,       // <-- crucial to allow null receipts
                    attributes: []         // <-- only if you don't need receipt fields
                }
            ]
        });

        let totalValue = 0;
        let criticalStock = 0;
        let todayRevenue = 0;
        let totalCredits = 0;
        let stockValue = 0;
        products.forEach(element => {
            totalValue += element.quantity * element.sellingPrice
            stockValue += element.quantity * element.buyingPrice
            criticalStock += element.activateCriticalStockIndicator &&
                element.quantity <= element.criticalStockIndicator ? 1 : 0
        });

        credits.forEach(element => {
            totalCredits += element.amount
        });

        operations.forEach(element => {
            if (element.type == "SOLD") {
                todayRevenue += element.amount * element.price
            }
        })
        res.json({ totalValue, criticalStock, todayRevenue, totalCredits, stockValue })
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.toString()
        })

    }
});

router.get('/count/store/:id', utility.authenticate, checkSubscription, (req, res, next) => {
    const id = req.params.id;
    Product.count({
        where: {
            store_id: id,
            ...utility.buildQuery(req.query.query),
            creatorUserId: req.user.id
        }
    }).then(countProducts => {
        res.json(countProducts)
    }).catch(err => {
        res.status(500).json({
            success: false,
            message: err.toString()
        })
    })
});


router.delete('/:id', utility.authenticate, checkSubscription, (req, res, next) => {
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
});

router.get('/store/:id/bestSelling', utility.authenticate, checkSubscription, (req, res, next) => {
    Operation.findAll({
        where: {
            type: "SOLD",
            creatorUserId: req.user.id,
            [Op.or]: [
                { '$receipt.visible$': true },
                { receiptId: null } // Adjust if foreign key has a different name
            ]
        },
        include: [
            'product',
            {
                model: Receipt,
                as: 'receipt',
                required: false,   // LEFT JOIN to include null receipts
                attributes: []
            }
        ],
        attributes: [
            'product_id',
            [sequelize.fn('SUM', sequelize.col('amount')), 'total_amount']
        ],
        group: ['product_id', 'product.id'],
        order: [[sequelize.literal('total_amount'), 'DESC']]
    }).then(operations => {

        res.json(operations)
    }).catch(err => {
        res.status(500).json({
            success: false,
            message: err.toString()
        })
    })
});

router.get('/store/:id/mostProfitable', utility.authenticate, checkSubscription, (req, res, next) => {
    Operation.findAll({
        where: {
            type: "SOLD",
            creatorUserId: req.user.id
        }, include: ['product',
            {
                model: Receipt,
                as: 'receipt',
                where: { visible: true },
                attributes: []
            }
        ],
        attributes: [
            'product_id',
            [
                sequelize.literal('(SUM((selling_price - buying_price) * amount))'),
                'total_profit'
            ]
        ],
        group: ['product_id', 'product.id'],
        order: [[sequelize.literal('total_profit'), 'DESC']]
    }).then(operations => {
        res.json(operations)
    }).catch(err => {
        res.status(500).json({
            success: false,
            message: err.toString()
        })
    })
});

router.get('/store/:id/operationStats', utility.authenticate, checkSubscription, (req, res, next) => {
    let { type, value } = req.query;

    let dateCondition = [];

    if (type && value) {
        switch (type) {
            case 'Annuel':
                if (!/^\d{4}$/.test(value)) {
                    return res.status(400).json({ success: false, message: 'Invalid year format.' });
                }
                dateCondition.push(
                    sequelize.where(sequelize.literal(`EXTRACT(YEAR FROM "Operation"."date")`), parseInt(value))
                );
                break;

            case 'Mensuel':
                console.log("Received Mensuel value:", value); // Debugging log

                if (typeof value !== 'string') {
                    return res.status(400).json({ success: false, message: 'Invalid month format. Expected a string in "YYYY-MM" format.' });
                }

                value = value.trim(); // Remove extra spaces

                // Ensure the month is always two digits (e.g., "2026-02" instead of "2026-2")
                let [year, month] = value.split('-');

                if (!year || !month) {
                    return res.status(400).json({ success: false, message: `Invalid month format. Received "${value}". Use "YYYY-MM".` });
                }

                month = month.padStart(2, '0'); // Convert "2" to "02" if needed

                if (!/^\d{4}-\d{2}$/.test(`${year}-${month}`)) {
                    return res.status(400).json({ success: false, message: `Invalid month format. Expected "YYYY-MM", but received "${year}-${month}".` });
                }

                year = parseInt(year);
                month = parseInt(month);

                if (month < 1 || month > 12) {
                    return res.status(400).json({ success: false, message: `Invalid month "${month}". Must be between 01 and 12.` });
                }

                dateCondition.push(
                    sequelize.where(sequelize.literal(`EXTRACT(YEAR FROM "Operation"."date")`), year)
                );
                dateCondition.push(
                    sequelize.where(sequelize.literal(`EXTRACT(MONTH FROM "Operation"."date")`), month)
                );
                break;


            case 'Quotidien':
                if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
                    return res.status(400).json({ success: false, message: 'Invalid date format. Use "YYYY-MM-DD".' });
                }
                const [y, m, d] = value.split('-').map(Number);
                dateCondition.push(
                    sequelize.where(sequelize.literal(`EXTRACT(YEAR FROM "Operation"."date")`), y)
                );
                dateCondition.push(
                    sequelize.where(sequelize.literal(`EXTRACT(MONTH FROM "Operation"."date")`), m)
                );
                dateCondition.push(
                    sequelize.where(sequelize.literal(`EXTRACT(DAY FROM "Operation"."date")`), d)
                );
                break;

            default:
                return res.status(400).json({
                    success: false,
                    message: 'Invalid type. Use "Annuel", "Mensuel", or "Quotidien".'
                });
        }
    }

    Operation.findAll({
        where: {
            type: ["SOLD", "LOADED"],
            creatorUserId: req.user.id,
            [Op.and]: [
                ...(dateCondition.length > 0 ? dateCondition : []),
                {
                    [Op.or]: [
                        { '$receipt.visible$': true },
                        { receiptId: null }
                    ]
                }
            ]
        },
        include: [
            'product',
            {
                model: Receipt,
                as: 'receipt',
                required: false,
                attributes: []
            }
        ]
    })
        .then(operations => {
            res.json(operations);
        })
        .catch(err => {
            res.status(500).json({
                success: false,
                message: err.toString()
            });
        });
});

router.get('/store/:id/operationStats/categories/items', utility.authenticate, checkSubscription, (req, res, next) => {
    let { type, value } = req.query;

    let dateCondition = [];

    if (type && value) {
        switch (type) {
            case 'Annuel':
                if (!/^\d{4}$/.test(value)) {
                    return res.status(400).json({ success: false, message: 'Invalid year format.' });
                }
                dateCondition.push(
                    sequelize.where(sequelize.literal(`EXTRACT(YEAR FROM "Operation"."date")`), parseInt(value))
                );
                break;

            case 'Mensuel':
                console.log("Received Mensuel value:", value); // Debugging log

                if (typeof value !== 'string') {
                    return res.status(400).json({ success: false, message: 'Invalid month format. Expected a string in "YYYY-MM" format.' });
                }

                value = value.trim(); // Remove extra spaces

                // Ensure the month is always two digits (e.g., "2026-02" instead of "2026-2")
                let [year, month] = value.split('-');

                if (!year || !month) {
                    return res.status(400).json({ success: false, message: `Invalid month format. Received "${value}". Use "YYYY-MM".` });
                }

                month = month.padStart(2, '0'); // Convert "2" to "02" if needed

                if (!/^\d{4}-\d{2}$/.test(`${year}-${month}`)) {
                    return res.status(400).json({ success: false, message: `Invalid month format. Expected "YYYY-MM", but received "${year}-${month}".` });
                }

                year = parseInt(year);
                month = parseInt(month);

                if (month < 1 || month > 12) {
                    return res.status(400).json({ success: false, message: `Invalid month "${month}". Must be between 01 and 12.` });
                }

                dateCondition.push(
                    sequelize.where(sequelize.literal(`EXTRACT(YEAR FROM "Operation"."date")`), year)
                );
                dateCondition.push(
                    sequelize.where(sequelize.literal(`EXTRACT(MONTH FROM "Operation"."date")`), month)
                );
                break;


            case 'Quotidien':
                if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
                    return res.status(400).json({ success: false, message: 'Invalid date format. Use "YYYY-MM-DD".' });
                }
                const [y, m, d] = value.split('-').map(Number);
                dateCondition.push(
                    sequelize.where(sequelize.literal(`EXTRACT(YEAR FROM "Operation"."date")`), y)
                );
                dateCondition.push(
                    sequelize.where(sequelize.literal(`EXTRACT(MONTH FROM "Operation"."date")`), m)
                );
                dateCondition.push(
                    sequelize.where(sequelize.literal(`EXTRACT(DAY FROM "Operation"."date")`), d)
                );
                break;

            default:
                return res.status(400).json({
                    success: false,
                    message: 'Invalid type. Use "Annuel", "Mensuel", or "Quotidien".'
                });
        }
    }


    Operation.findAll({
        where: {
            type: ["SOLD"],
            creatorUserId: req.user.id,
            [Op.and]: [
                ...(dateCondition.length > 0 ? dateCondition : []),
                {
                    [Op.or]: [
                        { '$receipt.visible$': true },
                        { receiptId: null } // adjust this if your foreign key is named differently
                    ]
                }
            ]
        },
        include: [
            {
                model: Product,
                as: 'product',
                include: [
                    {
                        model: Category,
                        as: 'category'
                    }
                ]
            },
            {
                model: Receipt,
                as: 'receipt',
                attributes: [],
                required: false // Important: left join to allow nulls
            }
        ]
    })
        .then(operations => {
            // Group by category and calculate total number of items sold per category
            const categoryData = operations.reduce((acc, operation) => {
                const category = operation.product.category ? operation.product.category.name : "Non classé";
                const amountSold = operation.amount;

                if (!acc[category]) {
                    acc[category] = { totalAmount: 0 };
                }
                acc[category].totalAmount += amountSold;

                return acc;
            }, {});

            // Convert to array and sort by number of items sold in descending order
            const sortedCategories = Object.entries(categoryData)
                .sort(([, a], [, b]) => b.totalAmount - a.totalAmount)
                .slice(0, 5);  // Limit to top 5

            // Prepare data for the chart
            const labels = sortedCategories.map(([category]) => category);
            const totalSold = sortedCategories.map(([, data]) => data.totalAmount);

            // Define different background colors for each category
            const backgroundColors = ['#1E88E5', '#43A047', '#F4511E', '#FB8C00', '#8E24AA']
                ;  // You can add more or generate dynamically

            const chartData = {
                labels: labels,
                datasets: [
                    {
                        label: 'Produits Vendues',
                        backgroundColor: backgroundColors.slice(0, labels.length), // Assign colors to each category
                        data: totalSold
                    }
                ]
            };

            res.json(chartData);
        })
        .catch(err => {
            res.status(500).json({
                success: false,
                message: err.toString()
            });
        });
});


router.get('/store/:id/operationStats/categories', utility.authenticate, checkSubscription, (req, res, next) => {
    let { type, value } = req.query;

    let dateCondition = [];

    if (type && value) {
        switch (type) {
            case 'Annuel':
                if (!/^\d{4}$/.test(value)) {
                    return res.status(400).json({ success: false, message: 'Invalid year format.' });
                }
                dateCondition.push(
                    sequelize.where(sequelize.literal(`EXTRACT(YEAR FROM "Operation"."date")`), parseInt(value))
                );
                break;

            case 'Mensuel':
                console.log("Received Mensuel value:", value); // Debugging log

                if (typeof value !== 'string') {
                    return res.status(400).json({ success: false, message: 'Invalid month format. Expected a string in "YYYY-MM" format.' });
                }

                value = value.trim(); // Remove extra spaces

                // Ensure the month is always two digits (e.g., "2026-02" instead of "2026-2")
                let [year, month] = value.split('-');

                if (!year || !month) {
                    return res.status(400).json({ success: false, message: `Invalid month format. Received "${value}". Use "YYYY-MM".` });
                }

                month = month.padStart(2, '0'); // Convert "2" to "02" if needed

                if (!/^\d{4}-\d{2}$/.test(`${year}-${month}`)) {
                    return res.status(400).json({ success: false, message: `Invalid month format. Expected "YYYY-MM", but received "${year}-${month}".` });
                }

                year = parseInt(year);
                month = parseInt(month);

                if (month < 1 || month > 12) {
                    return res.status(400).json({ success: false, message: `Invalid month "${month}". Must be between 01 and 12.` });
                }

                dateCondition.push(
                    sequelize.where(sequelize.literal(`EXTRACT(YEAR FROM "Operation"."date")`), year)
                );
                dateCondition.push(
                    sequelize.where(sequelize.literal(`EXTRACT(MONTH FROM "Operation"."date")`), month)
                );
                break;


            case 'Quotidien':
                if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
                    return res.status(400).json({ success: false, message: 'Invalid date format. Use "YYYY-MM-DD".' });
                }
                const [y, m, d] = value.split('-').map(Number);
                dateCondition.push(
                    sequelize.where(sequelize.literal(`EXTRACT(YEAR FROM "Operation"."date")`), y)
                );
                dateCondition.push(
                    sequelize.where(sequelize.literal(`EXTRACT(MONTH FROM "Operation"."date")`), m)
                );
                dateCondition.push(
                    sequelize.where(sequelize.literal(`EXTRACT(DAY FROM "Operation"."date")`), d)
                );
                break;

            default:
                return res.status(400).json({
                    success: false,
                    message: 'Invalid type. Use "Annuel", "Mensuel", or "Quotidien".'
                });
        }
    }


    Operation.findAll({
        where: {
            type: ["SOLD"],
            creatorUserId: req.user.id,
            [Op.and]: [
                ...(dateCondition.length > 0 ? dateCondition : []),
                {
                    [Op.or]: [
                        { '$receipt.visible$': true },
                        { receiptId: null } // adjust if your foreign key is different
                    ]
                }
            ]
        },
        include: [
            {
                model: Product,
                as: 'product',
                include: [
                    {
                        model: Category,
                        as: 'category'
                    }
                ]
            },
            {
                model: Receipt,
                as: 'receipt',
                required: false,       // <-- important: allows nulls (LEFT JOIN)
                attributes: []         // <-- no fields selected from receipt
            }
        ]
    })
        .then(operations => {
            // Group by category
            const categoryData = operations.reduce((acc, operation) => {
                const category = operation.product.category ? operation.product.category.name : "Non classé";
                const profit = (operation.price - operation.product.buyingPrice) * operation.amount;

                if (!acc[category]) {
                    acc[category] = { totalProfit: 0 };
                }
                acc[category].totalProfit += profit;

                return acc;
            }, {});

            // Convert to array and sort by profit in descending order
            const sortedCategories = Object.entries(categoryData)
                .sort(([, a], [, b]) => b.totalProfit - a.totalProfit)
                .slice(0, 5);  // Limit to top 5

            // Prepare data for the chart
            const labels = sortedCategories.map(([category]) => category);
            const mostProfitable = sortedCategories.map(([, data]) => data.totalProfit);

            // Define different background colors for each category
            const backgroundColors = ['#1E88E5', '#43A047', '#F4511E', '#FB8C00', '#8E24AA']
                ;  // You can add more or generate dynamically

            const chartData = {
                labels: labels,
                datasets: [
                    {
                        label: 'Profit',
                        backgroundColor: backgroundColors.slice(0, labels.length), // Assign colors to each category
                        data: mostProfitable
                    }
                ]
            };

            res.json(chartData);
        })
        .catch(err => {
            res.status(500).json({
                success: false,
                message: err.toString()
            });
        });
});





router.get('/store/:id/operationStats/product', utility.authenticate, checkSubscription, (req, res, next) => {
    let { type, value, product } = req.query;

    let dateCondition = [];

    if (type && value) {
        switch (type) {
            case 'Annuel':
                if (!/^\d{4}$/.test(value)) {
                    return res.status(400).json({ success: false, message: 'Invalid year format.' });
                }
                dateCondition.push(
                    sequelize.where(sequelize.literal(`EXTRACT(YEAR FROM "Operation"."date")`), parseInt(value))
                );
                break;

            case 'Mensuel':
                console.log("Received Mensuel value:", value); // Debugging log

                if (typeof value !== 'string') {
                    return res.status(400).json({ success: false, message: 'Invalid month format. Expected a string in "YYYY-MM" format.' });
                }

                value = value.trim(); // Remove extra spaces

                // Ensure the month is always two digits (e.g., "2026-02" instead of "2026-2")
                let [year, month] = value.split('-');

                if (!year || !month) {
                    return res.status(400).json({ success: false, message: `Invalid month format. Received "${value}". Use "YYYY-MM".` });
                }

                month = month.padStart(2, '0'); // Convert "2" to "02" if needed

                if (!/^\d{4}-\d{2}$/.test(`${year}-${month}`)) {
                    return res.status(400).json({ success: false, message: `Invalid month format. Expected "YYYY-MM", but received "${year}-${month}".` });
                }

                year = parseInt(year);
                month = parseInt(month);

                if (month < 1 || month > 12) {
                    return res.status(400).json({ success: false, message: `Invalid month "${month}". Must be between 01 and 12.` });
                }

                dateCondition.push(
                    sequelize.where(sequelize.literal(`EXTRACT(YEAR FROM "Operation"."date")`), year)
                );
                dateCondition.push(
                    sequelize.where(sequelize.literal(`EXTRACT(MONTH FROM "Operation"."date")`), month)
                );
                break;

            case 'Quotidien':
                if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
                    return res.status(400).json({ success: false, message: 'Invalid date format. Use "YYYY-MM-DD".' });
                }
                const [y, m, d] = value.split('-').map(Number);
                dateCondition.push(
                    sequelize.where(sequelize.literal(`EXTRACT(YEAR FROM "Operation"."date")`), y)
                );
                dateCondition.push(
                    sequelize.where(sequelize.literal(`EXTRACT(MONTH FROM "Operation"."date")`), m)
                );
                dateCondition.push(
                    sequelize.where(sequelize.literal(`EXTRACT(DAY FROM "Operation"."date")`), d)
                );
                break;

            default:
                return res.status(400).json({
                    success: false,
                    message: 'Invalid type. Use "Annuel", "Mensuel", or "Quotidien".'
                });
        }
    }

    Operation.findAll({
        where: {
            type: ["SOLD", "LOADED"],
            creatorUserId: req.user.id,
            product_id: product,
            [Op.and]: [
                ...(dateCondition.length > 0 ? dateCondition : []),
                {
                    [Op.or]: [
                        { '$receipt.visible$': true },
                        { receiptId: null } // adjust this if the foreign key is named differently
                    ]
                }
            ]
        },
        include: [
            {
                model: Receipt,
                as: 'receipt',
                required: false, // LEFT JOIN to allow nulls
                attributes: []
            }
        ]
    })
        .then(operations => {
            res.json(operations);
        })
        .catch(err => {
            res.status(500).json({
                success: false,
                message: err.toString()
            });
        });
});

router.get('/:id', utility.authenticate, checkSubscription, (req, res, next) => {
    const id = req.params.id;
    Product.findOne({
        where: {
            id,
            creatorUserId: req.user.id
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

router.get('/store/:id/generate-report', utility.authenticate, checkSubscription, async (req, res) => {
    try {
        const { from, to, reportType, includeDeleted } = req.query;

        // Validate date inputs
        if (!from || !to) {
            return res.status(400).json({ message: "Please provide 'from' and 'to' date parameters." });
        }

        // Determine operation types based on reportType
        const type = reportType === 'load' ? 'LOADED'
                   : reportType === 'both' ? ['SOLD', 'LOADED']
                   : 'SOLD'; // default: sales

        // Fetch operations within date range
        const operations = await Operation.findAll({
            where: {
                date: {
                    [Op.between]: [new Date(from), new Date(to)]
                },
                creatorUserId: req.user.id,
                type,
                [Op.or]: [
                    { '$receipt.visible$': true },
                    { receiptId: null }
                ]
            },
            include: [
                {
                    model: Product,
                    as: 'product',
                    attributes: ['name', 'buyingPrice', 'sellingPrice'],
                    where: includeDeleted === 'true' ? {} : { isVisible: true }
                },
                {
                    model: Receipt,
                    as: 'receipt',
                    required: false,
                    attributes: []
                }
            ]
        });


        if (operations.length === 0) {
            return res.status(404).json({ message: "Aucune opération trouvée dans la plage de dates donnée." });
        }

        // Calculate report data
        let totalEarnings = 0;
        let totalCost = 0;
        let totalReceipts = new Set();
        let totalProductsSold = 0;
        let totalProductsLoaded = 0;

        const groupedOperations = {};

        operations.forEach(op => {
            const { productId, amount, price, receiptId, product, type: opType } = op;
            if (product) {
                if (opType === 'SOLD') {
                    const revenue = amount * (product.sellingPrice || 0);
                    const cost = amount * (product.buyingPrice || 0);
                    const earnings = revenue - cost;

                    totalEarnings += earnings;
                    totalProductsSold += amount;
                } else if (opType === 'LOADED') {
                    const loadCost = amount * (price || product.buyingPrice || 0);
                    totalCost += loadCost;
                    totalProductsLoaded += amount;
                }

                totalReceipts.add(receiptId);

                // Group operations by product
                if (!groupedOperations[productId]) {
                    groupedOperations[productId] = {
                        productName: product.name,
                        buyingPrice: product.buyingPrice || 0,
                        sellingPrice: product.sellingPrice || 0,
                        quantitySold: 0,
                        quantityLoaded: 0,
                        earnings: 0,
                        loadCost: 0
                    };
                }

                if (opType === 'SOLD') {
                    groupedOperations[productId].quantitySold += amount;
                    groupedOperations[productId].earnings += (amount * (product.sellingPrice || 0)) - (amount * (product.buyingPrice || 0));
                } else if (opType === 'LOADED') {
                    groupedOperations[productId].quantityLoaded += amount;
                    groupedOperations[productId].loadCost += amount * (price || product.buyingPrice || 0);
                }
            }
        });

        // Format final response
        const report = {
            from,
            to,
            reportType: reportType || 'sales',
            totalEarnings,
            totalCost,
            numberOfReceipts: totalReceipts.size,
            numberOfProductsSold: totalProductsSold,
            numberOfProductsLoaded: totalProductsLoaded,
            products: Object.values(groupedOperations)
        };

        res.json(report);
    } catch (error) {
        console.error("Error generating report:", error);
        res.status(500).json({ message: "Server error" });
    }
});


router.get('/store/:id/export-stock', utility.authenticate, checkSubscription, async (req, res) => {
    try {
        const { includeDeleted } = req.query;

        const whereClause = {
            creatorUserId: req.user.id,
        };

        if (includeDeleted !== 'true') {
            whereClause.isVisible = true;
        }

        const products = await Product.findAll({
            where: whereClause,
            attributes: ['id', 'name', 'code', 'buyingPrice', 'sellingPrice', 'quantity', 'isVisible'],
            include: [
                {
                    model: Category,
                    as: 'category',
                    attributes: ['name'],
                    required: false
                }
            ],
            order: [['name', 'ASC']]
        });

        let totalBuyingValue = 0;
        let totalSellingValue = 0;
        let totalProducts = 0;
        let totalQuantity = 0;

        const formattedProducts = products.map(p => {
            const qty = p.quantity || 0;
            const bp = p.buyingPrice || 0;
            const sp = p.sellingPrice || 0;
            const totalBuying = qty * bp;
            const totalSelling = qty * sp;

            totalBuyingValue += totalBuying;
            totalSellingValue += totalSelling;
            totalProducts++;
            totalQuantity += qty;

            return {
                productName: p.name,
                code: p.code || '',
                category: p.category ? p.category.name : 'Non classé',
                buyingPrice: bp,
                sellingPrice: sp,
                quantity: qty,
                totalBuying,
                totalSelling,
                isVisible: p.isVisible
            };
        });

        res.json({
            totalProducts,
            totalQuantity,
            totalBuyingValue,
            totalSellingValue,
            netStockValue: totalSellingValue - totalBuyingValue,
            products: formattedProducts
        });
    } catch (error) {
        console.error("Error exporting stock:", error);
        res.status(500).json({ message: "Server error" });
    }
});


router.get('/store/:id/parentCategoriesStats', utility.authenticate, checkSubscription, async (req, res, next) => {
    try {
        const allCategories = await Category.findAll({
            attributes: ['id', 'name', 'parentCategoryId']
        });

        // Build map: parentId -> [children...]
        const categoryMap = new Map();
        allCategories.forEach(cat => {
            const parentId = cat.parentCategoryId || null;
            if (!categoryMap.has(parentId)) categoryMap.set(parentId, []);
            categoryMap.get(parentId).push(cat);
        });

        // Get only top-level categories
        const parentCategories = categoryMap.get(null) || [];

        const results = [];

        for (const parentCategory of parentCategories) {
            const categoryIds = collectDescendantCategoryIds(parentCategory.id, categoryMap);

            const products = await Product.findAll({
                where: {
                    categoryId: { [Op.in]: categoryIds },
                    creatorUserId: req.user.id,
                    isVisible: true
                },
                attributes: ['id', 'quantity', 'buyingPrice', 'sellingPrice']
            });

            const productIds = products.map(p => p.id);

            const stockValue = products.reduce((sum, p) => sum + (p.quantity * p.buyingPrice), 0);
            const stockNetValue = products.reduce((sum, p) => sum + (p.quantity * (p.sellingPrice - p.buyingPrice)), 0);
            const stockSellingValue = products.reduce((sum, p) => sum + (p.quantity * p.sellingPrice), 0);

            let totalSold = 0;
            let totalSoldNet = 0;

            if (productIds.length > 0) {
                const soldOperations = await Operation.findAll({
                    where: {
                        productId: { [Op.in]: productIds },
                        type: 'SOLD'
                    },
                    include: [
                        {
                            model: Product,
                            as: 'product',
                            attributes: ['buyingPrice']
                        }
                    ]
                });

                for (const op of soldOperations) {
                    const price = op.price;
                    const amount = op.amount;
                    const buyingPrice = op.product?.buyingPrice;

                    if (amount != null && price != null && buyingPrice != null) {
                        totalSold += amount * price;
                        totalSoldNet += amount * (price - buyingPrice);
                    }
                }
            }

            results.push({
                categoryId: parentCategory.id,
                categoryName: parentCategory.name,
                stockValue,
                stockSellingValue,
                stockNetValue,
                totalSold,
                totalSoldNet
            });
        }

        // ⬇️ Extra Row: Products with no category
        const uncategorizedProducts = await Product.findAll({
            where: {
                categoryId: null,
                creatorUserId: req.user.id,
                isVisible: true
            },
            attributes: ['id', 'quantity', 'buyingPrice', 'sellingPrice']
        });

        console.log(uncategorizedProducts.length)

        if (uncategorizedProducts.length > 0) {
            const productIds = uncategorizedProducts.map(p => p.id);

            const stockValue = uncategorizedProducts.reduce((sum, p) => sum + (p.quantity * p.buyingPrice), 0);
            const stockNetValue = uncategorizedProducts.reduce((sum, p) => sum + (p.quantity * (p.sellingPrice - p.buyingPrice)), 0);
            const stockSellingValue = uncategorizedProducts.reduce((sum, p) => sum + (p.quantity * p.sellingPrice), 0);

            let totalSold = 0;
            let totalSoldNet = 0;

            const soldOperations = await Operation.findAll({
                where: {
                    productId: { [Op.in]: productIds },
                    type: 'SOLD'
                },
                include: [
                    {
                        model: Product,
                        as: 'product',
                        attributes: ['buyingPrice']
                    }
                ]
            });

            for (const op of soldOperations) {
                const price = op.price;
                const amount = op.amount;
                const buyingPrice = op.product?.buyingPrice;

                if (amount != null && price != null && buyingPrice != null) {
                    totalSold += amount * price;
                    totalSoldNet += amount * (price - buyingPrice);
                }
            }

            results.push({
                categoryId: null,
                categoryName: 'Sans catégorie',
                stockValue,
                stockSellingValue,
                stockNetValue,
                totalSold,
                totalSoldNet
            });
        }

        res.json(results);
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: err.message });
    }
});

router.get('/store/:id/total-sold-pie', utility.authenticate, async (req, res) => {
    try {
        const { type, value } = req.query;
        const creatorUserId = req.user.id;

        const categories = await Category.findAll({ raw: true });
        const parentCategories = categories.filter(c => !c.parentCategoryId);
        const result = [];

        // Date filter
        const dateFilter = {};
        if (type === 'Quotidien') {
            dateFilter[Op.gte] = new Date(value + ' 00:00:00');
            dateFilter[Op.lte] = new Date(value + ' 23:59:59');
        } else if (type === 'Mensuel') {
            const [year, month] = value.split('-');
            dateFilter[Op.gte] = new Date(`${year}-${month}-01`);

            let nextMonth = parseInt(month) + 1;
            let nextYear = parseInt(year);

            if (nextMonth > 12) {
                nextMonth = 1;
                nextYear += 1;
            }

            dateFilter[Op.lt] = new Date(`${nextYear}-${nextMonth.toString().padStart(2, '0')}-01`);
        } else if (type === 'Annuel') {
            dateFilter[Op.gte] = new Date(`${value}-01-01`);
            dateFilter[Op.lt] = new Date(`${parseInt(value) + 1}-01-01`);
        }

        // Handle parent categories
        for (const parent of parentCategories) {
            const descendantIds = await getAllDescendantCategoryIds(parent.id, categories);
            const categoryIds = [parent.id, ...descendantIds];

            const products = await Product.findAll({
                where: {
                    categoryId: { [Op.in]: categoryIds },
                    creatorUserId,
                    isVisible: true
                },
                attributes: ['id'],
                raw: true
            });

            const productIds = products.map(p => p.id);
            if (productIds.length === 0) continue;

            const operations = await Operation.findAll({
                where: {
                    productId: { [Op.in]: productIds },
                    type: 'SOLD',
                    date: dateFilter
                },
                attributes: [
                    [utility.Sequelize.fn('SUM', utility.Sequelize.literal('amount * price')), 'total']
                ],
                raw: true
            });

            const total = parseFloat(operations[0].total || 0);
            result.push({
                label: parent.name,
                value: total
            });
        }

        // Handle uncategorized products ONCE
        const uncategorizedProducts = await Product.findAll({
            where: {
                categoryId: null,
                creatorUserId,
                isVisible: true
            },
            attributes: ['id'],
            raw: true
        });

        const uncategorizedProductIds = uncategorizedProducts.map(p => p.id);
        if (uncategorizedProductIds.length > 0) {
            const uncategorizedOperations = await Operation.findAll({
                where: {
                    productId: { [Op.in]: uncategorizedProductIds },
                    type: 'SOLD',
                    date: dateFilter
                },
                attributes: [
                    [utility.Sequelize.fn('SUM', utility.Sequelize.literal('amount * price')), 'total']
                ],
                raw: true
            });

            const totalUncategorized = parseFloat(uncategorizedOperations[0].total || 0);
            result.push({
                label: 'Non catégorisé',
                value: totalUncategorized
            });
        }

        res.json({
            labels: result.map(r => r.label),
            datasets: [{
                data: result.map(r => r.value),
                backgroundColor: ['#ff0000', '#FFBB00', '#0099ff', '#00cc66', '#cc33ff', '#ff66cc']
            }]
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: err.message });
    }
});


router.get('/store/:id/net-sold-pie', utility.authenticate, async (req, res) => {
    try {
        const { type, value } = req.query;
        const creatorUserId = req.user.id;

        const categories = await Category.findAll({ raw: true });
        const parentCategories = categories.filter(c => !c.parentCategoryId);
        const result = [];

        // Build date filter
        const dateFilter = {};
        if (type === 'Quotidien') {
            dateFilter[Op.gte] = new Date(value + ' 00:00:00');
            dateFilter[Op.lte] = new Date(value + ' 23:59:59');
        } else if (type === 'Mensuel') {
            const [year, month] = value.split('-');
            dateFilter[Op.gte] = new Date(`${year}-${month}-01`);

            let nextMonth = parseInt(month) + 1;
            let nextYear = parseInt(year);

            if (nextMonth > 12) {
                nextMonth = 1;
                nextYear += 1;
            }

            dateFilter[Op.lt] = new Date(`${nextYear}-${nextMonth.toString().padStart(2, '0')}-01`);
        } else if (type === 'Annuel') {
            dateFilter[Op.gte] = new Date(`${value}-01-01`);
            dateFilter[Op.lt] = new Date(`${parseInt(value) + 1}-01-01`);
        }

        // 👇 Loop for each parent category
        for (const parent of parentCategories) {
            const descendantIds = await getAllDescendantCategoryIds(parent.id, categories);
            const categoryIds = [parent.id, ...descendantIds];

            const products = await Product.findAll({
                where: {
                    categoryId: { [Op.in]: categoryIds },
                    creatorUserId,
                    isVisible: true
                },
                attributes: ['id'],
                raw: true
            });

            const productIds = products.map(p => p.id);
            if (productIds.length === 0) continue;

            const operations = await Operation.findAll({
                where: {
                    productId: { [Op.in]: productIds },
                    type: 'SOLD',
                    date: dateFilter
                },
                include: [{
                    model: Product,
                    as: 'product',
                    required: true,
                    attributes: []
                }],
                attributes: [
                    [utility.Sequelize.literal('SUM("Operation"."amount" * ("Operation"."price" - "product"."buying_price"))'), 'total']
                ],
                raw: true
            });

            const total = parseFloat(operations[0].total || 0);
            result.push({
                label: parent.name,
                value: total
            });
        }

        // ✅ Handle uncategorized products separately (only once)
        const uncategorizedProducts = await Product.findAll({
            where: {
                categoryId: null,
                creatorUserId,
                isVisible: true
            },
            attributes: ['id'],
            raw: true
        });

        const uncategorizedProductIds = uncategorizedProducts.map(p => p.id);
        if (uncategorizedProductIds.length > 0) {
            const uncategorizedOperations = await Operation.findAll({
                where: {
                    productId: { [Op.in]: uncategorizedProductIds },
                    type: 'SOLD',
                    date: dateFilter
                },
                include: [{
                    model: Product,
                    as: 'product',
                    required: true,
                    attributes: []
                }],
                attributes: [
                    [utility.Sequelize.literal('SUM("Operation"."amount" * ("Operation"."price" - "product"."buying_price"))'), 'total']
                ],
                raw: true
            });

            const totalUncategorized = parseFloat(uncategorizedOperations[0].total || 0);
            result.push({
                label: 'Non catégorisé',
                value: totalUncategorized
            });
        }

        res.json({
            labels: result.map(r => r.label),
            datasets: [{
                data: result.map(r => r.value),
                backgroundColor: ['#ff0000', '#FFBB00', '#0099ff', '#00cc66', '#cc33ff', '#ff66cc']
            }]
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: err.message });
    }
});





function collectDescendantCategoryIds(categoryId, allCategoriesMap) {
    const result = [categoryId];

    const children = allCategoriesMap.get(categoryId) || [];

    for (const child of children) {
        result.push(...collectDescendantCategoryIds(child.id, allCategoriesMap));
    }

    return result;
}

async function getAllDescendantCategoryIds(categoryId, allCategories) {
    const descendants = [];

    function recurse(id) {
        const children = allCategories.filter(c => c.parentCategoryId === id);
        for (const child of children) {
            descendants.push(child.id);
            recurse(child.id);
        }
    }

    recurse(categoryId);
    return descendants;
}

// ============================================
// SERVICE REQUESTS STATS
// ============================================

// Helper function to build date filter for service requests
function buildServiceRequestDateFilter(type, value) {
    if (!type || !value) return {};

    let startDate, endDate;

    switch (type) {
        case 'Quotidien':
            startDate = new Date(value);
            startDate.setHours(0, 0, 0, 0);
            endDate = new Date(value);
            endDate.setHours(23, 59, 59, 999);
            break;
        case 'Mensuel':
            const [year, month] = value.split('-').map(Number);
            startDate = new Date(year, month - 1, 1);
            endDate = new Date(year, month, 0, 23, 59, 59, 999);
            break;
        case 'Annuel':
            const yearNum = parseInt(value);
            startDate = new Date(yearNum, 0, 1);
            endDate = new Date(yearNum, 11, 31, 23, 59, 59, 999);
            break;
        default:
            return {};
    }

    return {
        createdAt: {
            [Op.between]: [startDate, endDate]
        }
    };
}

// Pie chart: Sum of prices for completed requests, grouped by service
router.get('/store/:id/service-requests/completed-revenue-pie', utility.authenticate, async (req, res) => {
    try {
        const storeId = req.params.id;
        const { type, value } = req.query;

        // Build where clause with date filter
        const whereClause = {
            storeId: storeId,
            status: 'COMPLETED',
            ...buildServiceRequestDateFilter(type, value)
        };

        // Get all completed requests for this store, grouped by service
        const requests = await ServiceRequest.findAll({
            where: whereClause,
            include: [{
                model: StoreService,
                as: 'service',
                attributes: ['id', 'name']
            }],
            attributes: [
                'storeServiceId',
                [utility.Sequelize.fn('SUM', utility.Sequelize.col('ServiceRequest.price')), 'totalPrice']
            ],
            group: ['storeServiceId', 'service.id', 'service.name'],
            raw: true,
            nest: true
        });

        const result = requests.map(r => ({
            label: r.service?.name || 'Service inconnu',
            value: parseFloat(r.totalPrice) || 0
        })).filter(r => r.value > 0);

        const backgroundColors = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#0ea5e9', '#8b5cf6', '#ec4899', '#14b8a6'];

        res.json({
            labels: result.map(r => r.label),
            datasets: [{
                data: result.map(r => r.value),
                backgroundColor: backgroundColors.slice(0, result.length)
            }]
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: err.message });
    }
});

// Pie chart: Count of requests by status
router.get('/store/:id/service-requests/requests-by-status-pie', utility.authenticate, async (req, res) => {
    try {
        const storeId = req.params.id;
        const { type, value } = req.query;

        // Build where clause with date filter
        const whereClause = {
            storeId: storeId,
            ...buildServiceRequestDateFilter(type, value)
        };

        const statusCounts = await ServiceRequest.findAll({
            where: whereClause,
            attributes: [
                'status',
                [utility.Sequelize.fn('COUNT', utility.Sequelize.col('id')), 'count']
            ],
            group: ['status'],
            raw: true
        });

        const statusLabels = {
            'PENDING': 'En attente',
            'IN_PROGRESS': 'En cours',
            'COMPLETED': 'Terminé',
            'CANCELLED': 'Annulé'
        };

        const statusColors = {
            'PENDING': '#f59e0b',
            'IN_PROGRESS': '#0ea5e9',
            'COMPLETED': '#10b981',
            'CANCELLED': '#ef4444'
        };

        const result = statusCounts.map(s => ({
            status: s.status,
            label: statusLabels[s.status] || s.status,
            value: parseInt(s.count) || 0,
            color: statusColors[s.status] || '#64748b'
        }));

        res.json({
            labels: result.map(r => r.label),
            datasets: [{
                data: result.map(r => r.value),
                backgroundColor: result.map(r => r.color)
            }]
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;