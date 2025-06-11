'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Operation extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate({ Product, Receipt }) {
      // define association here
      this.belongsTo(Product, { foreignKey: 'product_id', as: 'product' })
      this.belongsTo(Receipt, { foreignKey: 'receipt_id', as: 'receipt' });
    }
    toJSON() {
      return { ...this.get(), receiptId: undefined, receipt_id: undefined, creatorUserId: undefined, createdAt: undefined, updatedAt: undefined }
    }
  }
  Operation.init({
    type: DataTypes.STRING,
    amount: DataTypes.INTEGER,
    price: DataTypes.FLOAT,
    date: DataTypes.DATE,
    receiptId: {
      type: DataTypes.INTEGER,
      field: 'receipt_id'
    },
    productId: {
      type: DataTypes.INTEGER,
      field: 'product_id'
    },
    creatorUserId: {
      type: DataTypes.INTEGER
    }
  }, {
    sequelize,
    tableName: 'operations',
    modelName: 'Operation',
  });
  return Operation;
};