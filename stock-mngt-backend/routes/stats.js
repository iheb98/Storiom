const express = require('express');
const router = express.Router();
const { Product, Operation, Credit, Category } = require('../models');
const utility = require('../utility');

const sequelize = require('sequelize');
const { Op } = require('sequelize');

router.get('/store/:id/widgets', utility.authenticate, async (req, res, next) => {
    const id = req.params.id;
    try {
        const products = await Product.findAll({
            where: {
                store_id: id,
                creatorUserId: req.user.id
            }
        })
        const credits = await Credit.findAll({
            where: {
                store_id: id,
                creatorUserId: req.user.id
            }
        })
        const operations = await Operation.findAll({
            where: {
                [utility.Op.and]: [
                    utility.Sequelize.where(utility.Sequelize.fn('date', utility.Sequelize.col('date')), '=', utility.getSimpleDate(new Date()))
                ],
                creatorUserId: req.user.id
            }
        })
        let totalValue = 0;
        let criticalStock = 0;
        let todayRevenue = 0;
        let totalCredits = 0;
        products.forEach(element => {
            totalValue += element.quantity * element.sellingPrice
            criticalStock += element.quantity < 10 ? 1 : 0
        });

        credits.forEach(element => {
            totalCredits += element.amount
        });

        operations.forEach(element => {
            if (element.type == "SOLD") {
                todayRevenue += element.amount * element.price
            }
        })
        res.json({ totalValue, criticalStock, todayRevenue, totalCredits })
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.toString()
        })

    }
});

router.get('/count/store/:id', utility.authenticate, (req, res, next) => {
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


router.delete('/:id', utility.authenticate, (req, res, next) => {
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

router.get('/store/:id/bestSelling', utility.authenticate, (req, res, next) => {
    Operation.findAll({
        where: {
            type: "SOLD",
            creatorUserId: req.user.id
        }, include: ['product'],
        attributes: [
            'product_id',
            [sequelize.fn('SUM', sequelize.col('amount')), 'total_amount']
        ],
        group: ['product_id', 'product.id'],
        order: [[sequelize.literal('total_amount'), 'DESC']],
    }).then(operations => {

        res.json(operations)
    }).catch(err => {
        res.status(500).json({
            success: false,
            message: err.toString()
        })
    })
});

router.get('/store/:id/mostProfitable', utility.authenticate, (req, res, next) => {
    Operation.findAll({
        where: {
            type: "SOLD",
            creatorUserId: req.user.id
        }, include: ['product'],
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

router.get('/store/:id/operationStats', utility.authenticate, (req, res, next) => {
    let { type, value } = req.query;

    let dateCondition = [];

    if (type && value) {
        switch (type) {
            case 'Annuel':
                if (!/^\d{4}$/.test(value)) {
                    return res.status(400).json({ success: false, message: 'Invalid year format.' });
                }
                dateCondition.push(
                    sequelize.where(sequelize.literal(`EXTRACT(YEAR FROM "date")`), parseInt(value))
                );
                break;

            case 'Mensuel':
                console.log("Received Mensuel value:", value); // Debugging log

                if (typeof value !== 'string') {
                    return res.status(400).json({ success: false, message: 'Invalid month format. Expected a string in "YYYY-MM" format.' });
                }

                value = value.trim(); // Remove extra spaces

                // Ensure the month is always two digits (e.g., "2025-02" instead of "2025-2")
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
                    sequelize.where(sequelize.literal(`EXTRACT(YEAR FROM "date")`), year)
                );
                dateCondition.push(
                    sequelize.where(sequelize.literal(`EXTRACT(MONTH FROM "date")`), month)
                );
                break;


            case 'Quotidien':
                if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
                    return res.status(400).json({ success: false, message: 'Invalid date format. Use "YYYY-MM-DD".' });
                }
                const [y, m, d] = value.split('-').map(Number);
                dateCondition.push(
                    sequelize.where(sequelize.literal(`EXTRACT(YEAR FROM "date")`), y)
                );
                dateCondition.push(
                    sequelize.where(sequelize.literal(`EXTRACT(MONTH FROM "date")`), m)
                );
                dateCondition.push(
                    sequelize.where(sequelize.literal(`EXTRACT(DAY FROM "date")`), d)
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
            ...(dateCondition.length > 0 && { [Op.and]: dateCondition })
        },
        include: ['product']
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

router.get('/store/:id/operationStats/categories/items', utility.authenticate, (req, res, next) => {
    let { type, value } = req.query;

    let dateCondition = [];

    if (type && value) {
        switch (type) {
            case 'Annuel':
                if (!/^\d{4}$/.test(value)) {
                    return res.status(400).json({ success: false, message: 'Invalid year format.' });
                }
                dateCondition.push(
                    sequelize.where(sequelize.literal(`EXTRACT(YEAR FROM "date")`), parseInt(value))
                );
                break;

            case 'Mensuel':
                console.log("Received Mensuel value:", value); // Debugging log

                if (typeof value !== 'string') {
                    return res.status(400).json({ success: false, message: 'Invalid month format. Expected a string in "YYYY-MM" format.' });
                }

                value = value.trim(); // Remove extra spaces

                // Ensure the month is always two digits (e.g., "2025-02" instead of "2025-2")
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
                    sequelize.where(sequelize.literal(`EXTRACT(YEAR FROM "date")`), year)
                );
                dateCondition.push(
                    sequelize.where(sequelize.literal(`EXTRACT(MONTH FROM "date")`), month)
                );
                break;


            case 'Quotidien':
                if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
                    return res.status(400).json({ success: false, message: 'Invalid date format. Use "YYYY-MM-DD".' });
                }
                const [y, m, d] = value.split('-').map(Number);
                dateCondition.push(
                    sequelize.where(sequelize.literal(`EXTRACT(YEAR FROM "date")`), y)
                );
                dateCondition.push(
                    sequelize.where(sequelize.literal(`EXTRACT(MONTH FROM "date")`), m)
                );
                dateCondition.push(
                    sequelize.where(sequelize.literal(`EXTRACT(DAY FROM "date")`), d)
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
            ...(dateCondition.length > 0 && { [Op.and]: dateCondition })
        },
        include: [{
            model: Product,
            as: 'product',
            include: [{
                model: Category,
                as: 'category'
            }]
        }]
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
            const backgroundColors = ['#42A5F5', '#ff9f40', '#66BB6A', '#FFA726', '#FF6384'];  // You can add more or generate dynamically

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


router.get('/store/:id/operationStats/categories', utility.authenticate, (req, res, next) => {
    let { type, value } = req.query;

    let dateCondition = [];

    if (type && value) {
        switch (type) {
            case 'Annuel':
                if (!/^\d{4}$/.test(value)) {
                    return res.status(400).json({ success: false, message: 'Invalid year format.' });
                }
                dateCondition.push(
                    sequelize.where(sequelize.literal(`EXTRACT(YEAR FROM "date")`), parseInt(value))
                );
                break;

            case 'Mensuel':
                console.log("Received Mensuel value:", value); // Debugging log

                if (typeof value !== 'string') {
                    return res.status(400).json({ success: false, message: 'Invalid month format. Expected a string in "YYYY-MM" format.' });
                }

                value = value.trim(); // Remove extra spaces

                // Ensure the month is always two digits (e.g., "2025-02" instead of "2025-2")
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
                    sequelize.where(sequelize.literal(`EXTRACT(YEAR FROM "date")`), year)
                );
                dateCondition.push(
                    sequelize.where(sequelize.literal(`EXTRACT(MONTH FROM "date")`), month)
                );
                break;


            case 'Quotidien':
                if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
                    return res.status(400).json({ success: false, message: 'Invalid date format. Use "YYYY-MM-DD".' });
                }
                const [y, m, d] = value.split('-').map(Number);
                dateCondition.push(
                    sequelize.where(sequelize.literal(`EXTRACT(YEAR FROM "date")`), y)
                );
                dateCondition.push(
                    sequelize.where(sequelize.literal(`EXTRACT(MONTH FROM "date")`), m)
                );
                dateCondition.push(
                    sequelize.where(sequelize.literal(`EXTRACT(DAY FROM "date")`), d)
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
            ...(dateCondition.length > 0 && { [Op.and]: dateCondition })
        },
        include: [{
            model: Product,
            as: 'product',
            include: [{
                model: Category,
                as: 'category'
            }]
        }]
    })
        .then(operations => {
            // Group by category
            const categoryData = operations.reduce((acc, operation) => {
                const category = operation.product.category ? operation.product.category.name : "Non classé";
                const profit = operation.price * operation.amount;

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
            const backgroundColors = ['#42A5F5', '#ff9f40', '#66BB6A', '#FFA726', '#FF6384'];  // You can add more or generate dynamically

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





router.get('/store/:id/operationStats/product', utility.authenticate, (req, res, next) => {
    const { type, value, product } = req.query;

    let dateCondition = [];

    if (type && value) {
        switch (type) {
            case 'Annuel':
                if (!/^\d{4}$/.test(value)) {
                    return res.status(400).json({ success: false, message: 'Invalid year format.' });
                }
                dateCondition.push(
                    sequelize.where(sequelize.literal(`EXTRACT(YEAR FROM "date")`), parseInt(value))
                );
                break;

            case 'Mensuel':
                console.log("Received Mensuel value:", value); // Debugging log

                if (typeof value !== 'string') {
                    return res.status(400).json({ success: false, message: 'Invalid month format. Expected a string in "YYYY-MM" format.' });
                }

                value = value.trim(); // Remove extra spaces

                // Ensure the month is always two digits (e.g., "2025-02" instead of "2025-2")
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
                    sequelize.where(sequelize.literal(`EXTRACT(YEAR FROM "date")`), year)
                );
                dateCondition.push(
                    sequelize.where(sequelize.literal(`EXTRACT(MONTH FROM "date")`), month)
                );
                break;

            case 'Quotidien':
                if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
                    return res.status(400).json({ success: false, message: 'Invalid date format. Use "YYYY-MM-DD".' });
                }
                const [y, m, d] = value.split('-').map(Number);
                dateCondition.push(
                    sequelize.where(sequelize.literal(`EXTRACT(YEAR FROM "date")`), y)
                );
                dateCondition.push(
                    sequelize.where(sequelize.literal(`EXTRACT(MONTH FROM "date")`), m)
                );
                dateCondition.push(
                    sequelize.where(sequelize.literal(`EXTRACT(DAY FROM "date")`), d)
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
            ...(dateCondition.length > 0 && { [Op.and]: dateCondition })
        },
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

router.get('/:id', utility.authenticate, (req, res, next) => {
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

router.get('/store/:id/generate-report', utility.authenticate, async (req, res) => {
    try {
        const { from, to } = req.query;

        // Validate date inputs
        if (!from || !to) {
            return res.status(400).json({ message: "Please provide 'from' and 'to' date parameters." });
        }

        // Fetch operations within date range
        const operations = await Operation.findAll({
            where: {
                date: {
                    [Op.between]: [new Date(from), new Date(to)]
                },
                creatorUserId: req.user.id
            },
            include: [{
                model: Product,
                as: 'product', attributes: ['name', 'buyingPrice', 'sellingPrice']
            }]
        });

        if (operations.length === 0) {
            return res.status(404).json({ message: "No operations found in the given date range." });
        }

        // Calculate report data
        let totalEarnings = 0;
        let totalReceipts = new Set();
        let totalProductsSold = 0;

        const groupedOperations = {};

        operations.forEach(op => {
            console.log(op)
            const { productId, amount, price, receiptId, product } = op;
            const revenue = amount * (product.sellingPrice || 0);
            const cost = amount * (product.buyingPrice || 0);
            const earnings = revenue - cost;

            totalEarnings += earnings;
            totalProductsSold += amount;
            totalReceipts.add(receiptId);

            // Group operations by product
            if (!groupedOperations[productId]) {
                groupedOperations[productId] = {
                    productName: product.name,
                    buyingPrice: product.buyingPrice || 0,
                    sellingPrice: product.sellingPrice || 0,
                    quantitySold: 0,
                    earnings: 0
                };
            }

            groupedOperations[productId].quantitySold += amount;
            groupedOperations[productId].earnings += earnings;
        });

        // Format final response
        const report = {
            from,
            to,
            totalEarnings,
            numberOfReceipts: totalReceipts.size,
            numberOfProductsSold: totalProductsSold,
            products: Object.values(groupedOperations)
        };

        res.json(report);
    } catch (error) {
        console.error("Error generating report:", error);
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;