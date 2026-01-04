'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class DeliveryWorker extends Model {
        static associate({ Store }) {
            this.belongsTo(Store, { foreignKey: 'store_id', as: 'store' });
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

    DeliveryWorker.init({
        firstName: {
            type: DataTypes.STRING,
            field: 'first_name'
        },
        lastName: {
            type: DataTypes.STRING,
            field: 'last_name'
        },
        email: DataTypes.STRING,
        phone: DataTypes.STRING,
        whatsapp: DataTypes.STRING,
        description: DataTypes.TEXT,
        supportedStates: {
            type: DataTypes.JSONB,
            field: 'supported_states',
            defaultValue: []
        },
        storeId: {
            type: DataTypes.INTEGER,
            field: 'store_id'
        },
        sendEmail: {
            type: DataTypes.BOOLEAN,
            field: 'send_email',
            defaultValue: false
        },
        sendWhatsApp: {
            type: DataTypes.BOOLEAN,
            field: 'send_whatsapp',
            defaultValue: false
        },
        sendSMS: {
            type: DataTypes.BOOLEAN,
            field: 'send_sms',
            defaultValue: false
        }
    }, {
        sequelize,
        tableName: 'delivery_workers',
        modelName: 'DeliveryWorker',
    });

    return DeliveryWorker;
};
