'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, DataTypes) {
        await queryInterface.createTable('order_items', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: DataTypes.INTEGER
            },
            quantity: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 1
            },
            price: {
                type: DataTypes.FLOAT,
                allowNull: false,
                comment: 'Price snapshot at the time of order'
            },
            orderId: {
                type: DataTypes.INTEGER,
                allowNull: false,
                field: 'order_id',
                references: { model: "orders", key: "id" },
                onDelete: "CASCADE"
            },
            productId: {
                type: DataTypes.INTEGER,
                allowNull: false,
                field: 'product_id',
                references: { model: "products", key: "id" },
                onDelete: "CASCADE"
            },
            createdAt: {
                allowNull: false,
                type: DataTypes.DATE
            },
            updatedAt: {
                allowNull: false,
                type: DataTypes.DATE
            }
        });
    },
    async down(queryInterface, DataTypes) {
        await queryInterface.dropTable('order_items');
    }
};
