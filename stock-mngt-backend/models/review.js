'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Review extends Model {
    static associate({ User, Product, StoreCustomer }) {
      this.belongsTo(User, { foreignKey: 'userId', as: 'user' })
      this.belongsTo(Product, { foreignKey: 'productId', as: 'product' })
      this.belongsTo(StoreCustomer, { foreignKey: 'storeCustomerId', as: 'storeCustomer' })
    }
    toJSON() {
      return { ...this.get(), userId: undefined, productId: undefined, user_id: undefined, product_id: undefined }
    }
  }
  Review.init({
    rating: DataTypes.INTEGER,
    comment: DataTypes.TEXT,
    status: {
      type: DataTypes.STRING,
      defaultValue: 'pending' // pending, approved, rejected
    },
    userId: {
      type: DataTypes.INTEGER,
      field: 'user_id',
      allowNull: true
    },
    storeCustomerId: {
      type: DataTypes.INTEGER,
      field: 'store_customer_id',
      allowNull: true
    },
    productId: {
      type: DataTypes.INTEGER,
      field: 'product_id'
    }
  }, {
    sequelize,
    tableName: 'reviews',
    modelName: 'Review',
  });
  return Review;
};