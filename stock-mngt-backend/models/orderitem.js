'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class OrderItem extends Model {
        /**
         * Helper method for defining associations.
         */
        static associate({ Order, Product }) {
            this.belongsTo(Order, { foreignKey: 'order_id', as: 'order' });
            this.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });
        }
    }
    OrderItem.init({
        quantity: {
            type: DataTypes.INTEGER,
            defaultValue: 1
        },
        price: DataTypes.FLOAT,
        orderId: {
            type: DataTypes.INTEGER,
            field: 'order_id'
        },
        productId: {
            type: DataTypes.INTEGER,
            field: 'product_id'
        }
    }, {
        sequelize,
        tableName: 'order_items',
        modelName: 'OrderItem',
    });
    return OrderItem;
};
