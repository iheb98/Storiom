'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Notification extends Model {
        static associate({ Store, Order }) {
            this.belongsTo(Store, { foreignKey: 'store_id', as: 'store' });
            this.belongsTo(Order, { foreignKey: 'order_id', as: 'order' });
        }
    }
    Notification.init({
        storeId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: 'store_id',
        },
        type: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: 'NEW_ORDER',
        },
        title: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        message: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        orderId: {
            type: DataTypes.INTEGER,
            allowNull: true,
            field: 'order_id',
        },
        isRead: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            field: 'is_read',
        },
        metadata: {
            type: DataTypes.JSONB,
            allowNull: true,
        },
    }, {
        sequelize,
        tableName: 'notifications',
        modelName: 'Notification',
    });
    return Notification;
};
