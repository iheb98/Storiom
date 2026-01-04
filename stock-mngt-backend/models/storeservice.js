'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class StoreService extends Model {
        static associate({ Store, ServiceRequest }) {
            this.belongsTo(Store, { foreignKey: 'store_id', as: 'store' });
            this.hasMany(ServiceRequest, { foreignKey: 'store_service_id', as: 'requests' });
        }

        toJSON() {
            return {
                ...this.get(),
                storeId: undefined,
                store_id: undefined,
                createdAt: undefined,
                updatedAt: undefined
            };
        }
    }

    StoreService.init({
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        description: DataTypes.TEXT,
        price: {
            type: DataTypes.FLOAT,
            defaultValue: 0
        },
        estimatedDuration: {
            type: DataTypes.STRING,
            field: 'estimated_duration'
        },
        category: {
            type: DataTypes.STRING,
            defaultValue: 'general'
        },
        image: DataTypes.STRING,
        isActive: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
            field: 'is_active'
        },
        isPriceVariable: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            field: 'is_price_variable'
        },
        storeId: {
            type: DataTypes.INTEGER,
            field: 'store_id',
            allowNull: false
        }
    }, {
        sequelize,
        tableName: 'store_services',
        modelName: 'StoreService',
    });

    return StoreService;
};
