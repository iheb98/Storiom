'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Order extends Model {
        static associate({ User, Store, OrderItem, DeliveryWorker, StoreCustomer }) {
            this.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
            this.belongsTo(Store, { foreignKey: 'store_id', as: 'store' });
            this.hasMany(OrderItem, { foreignKey: 'order_id', as: 'items' });
            this.belongsTo(DeliveryWorker, { foreignKey: 'delivery_worker_id', as: 'deliveryWorker' });
            this.belongsTo(StoreCustomer, { foreignKey: 'store_customer_id', as: 'storeCustomer' });
        }
    }
    Order.init({
        status: {
            type: DataTypes.ENUM('PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED'),
            defaultValue: 'PENDING'
        },
        totalAmount: {
            type: DataTypes.FLOAT,
            field: 'total_amount'
        },
        userId: {
            type: DataTypes.INTEGER,
            field: 'user_id',
            allowNull: true
        },
        storeId: {
            type: DataTypes.INTEGER,
            field: 'store_id'
        },
        storeCustomerId: {
            type: DataTypes.INTEGER,
            field: 'store_customer_id',
            allowNull: true
        },
        deliveryWorkerId: {
            type: DataTypes.INTEGER,
            field: 'delivery_worker_id',
            allowNull: true
        },
        customerName: {
            type: DataTypes.STRING,
            field: 'customer_name',
            allowNull: true
        },
        customerPhone: {
            type: DataTypes.STRING,
            field: 'customer_phone',
            allowNull: true
        },
        customerAddress: {
            type: DataTypes.TEXT,
            field: 'customer_address',
            allowNull: true
        },
        notes: {
            type: DataTypes.TEXT,
            allowNull: true
        }
    }, {
        sequelize,
        tableName: 'orders',
        modelName: 'Order',
    });
    return Order;
};
