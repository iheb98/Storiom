'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Order extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate({ User, Store, OrderItem }) {
            this.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
            this.belongsTo(Store, { foreignKey: 'store_id', as: 'store' });
            this.hasMany(OrderItem, { foreignKey: 'order_id', as: 'items' });
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
            field: 'user_id'
        },
        storeId: {
            type: DataTypes.INTEGER,
            field: 'store_id'
        }
    }, {
        sequelize,
        tableName: 'orders',
        modelName: 'Order',
    });
    return Order;
};
