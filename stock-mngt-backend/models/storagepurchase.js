'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class StoragePurchase extends Model {
        static associate(models) {
            StoragePurchase.belongsTo(models.Store, { foreignKey: 'storeId', as: 'store' });
            StoragePurchase.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
            StoragePurchase.belongsTo(models.PaymentOrder, { foreignKey: 'paymentOrderId', as: 'paymentOrder' });
        }
    }

    StoragePurchase.init({
        storeId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: 'store_id'
        },
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: 'user_id'
        },
        paymentOrderId: {
            type: DataTypes.INTEGER,
            allowNull: true,
            field: 'payment_order_id'
        },
        sizeGB: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: 'size_gb'
        },
        duration: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: '1M'
        },
        purchasedAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
            field: 'purchased_at'
        },
        expiresAt: {
            type: DataTypes.DATE,
            allowNull: false,
            field: 'expires_at'
        },
        amount: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false
        },
        currency: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: 'TND'
        }
    }, {
        sequelize,
        tableName: 'storage_purchases',
        modelName: 'StoragePurchase',
    });

    return StoragePurchase;
};
