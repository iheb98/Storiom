'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class ServiceRequest extends Model {
        static associate({ User, Store, StoreService }) {
            this.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
            this.belongsTo(Store, { foreignKey: 'store_id', as: 'store' });
            this.belongsTo(StoreService, { foreignKey: 'store_service_id', as: 'service' });
        }

        toJSON() {
            return {
                ...this.get(),
                userId: undefined,
                user_id: undefined,
                store_id: undefined,
                // Hide trackingCode in normal serialization for security
                trackingCode: undefined
            };
        }
    }

    ServiceRequest.init({
        status: {
            type: DataTypes.ENUM('PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'),
            defaultValue: 'PENDING'
        },
        customerNote: {
            type: DataTypes.TEXT,
            field: 'customer_note'
        },
        adminNote: {
            type: DataTypes.TEXT,
            field: 'admin_note'
        },
        price: {
            type: DataTypes.FLOAT,
            defaultValue: 0
        },
        startedAt: {
            type: DataTypes.DATE,
            field: 'started_at'
        },
        completedAt: {
            type: DataTypes.DATE,
            field: 'completed_at'
        },
        userId: {
            type: DataTypes.INTEGER,
            field: 'user_id',
            allowNull: true // Now nullable for guest requests
        },
        storeId: {
            type: DataTypes.INTEGER,
            field: 'store_id',
            allowNull: false
        },
        storeServiceId: {
            type: DataTypes.INTEGER,
            field: 'store_service_id',
            allowNull: false
        },
        // Guest customer fields (for non-registered users)
        guestName: {
            type: DataTypes.STRING,
            field: 'guest_name',
            allowNull: true
        },
        guestPhone: {
            type: DataTypes.STRING,
            field: 'guest_phone',
            allowNull: true
        },
        guestEmail: {
            type: DataTypes.STRING,
            field: 'guest_email',
            allowNull: true
        },
        trackingCode: {
            type: DataTypes.STRING(8),
            field: 'tracking_code',
            allowNull: true
        }
    }, {
        sequelize,
        tableName: 'service_requests',
        modelName: 'ServiceRequest',
    });

    return ServiceRequest;
};

