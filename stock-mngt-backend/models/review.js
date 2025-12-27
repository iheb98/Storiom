'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Review extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate({ User, Product }) {
      // define association here
      this.belongsTo(User, { foreignKey: 'userId', as: 'user' })
      this.belongsTo(Product, { foreignKey: 'productId', as: 'product' })
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
      field: 'user_id'
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