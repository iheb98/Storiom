'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, DataTypes) {
        await queryInterface.createTable('orders', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: DataTypes.INTEGER
            },
            status: {
                type: DataTypes.ENUM('PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED'),
                defaultValue: 'PENDING'
            },
            totalAmount: {
                type: DataTypes.FLOAT,
                field: 'total_amount',
                allowNull: false,
                defaultValue: 0
            },
            userId: {
                type: DataTypes.INTEGER,
                allowNull: false,
                field: 'user_id',
                references: { model: "users", key: "id" },
                onDelete: "CASCADE"
            },
            storeId: {
                type: DataTypes.INTEGER,
                allowNull: false,
                field: 'store_id',
                references: { model: "stores", key: "id" },
                onDelete: "CASCADE"
            },
            deliveryWorkerId: {
                type: DataTypes.INTEGER,
                field: 'delivery_worker_id',
                allowNull: true
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
        await queryInterface.dropTable('orders');
    }
};
