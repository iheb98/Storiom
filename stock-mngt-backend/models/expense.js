'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Expense extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }

    toJSON() {
      return { ...this.get(), storeId: undefined, store_id: undefined, creatorUserId: undefined, createdAt: undefined, updatedAt: undefined }
    }
  }
  Expense.init({
    title:DataTypes.STRING,
    amount: DataTypes.FLOAT,
    comment: DataTypes.TEXT,
    date: DataTypes.DATE,
    storeId: {
      type: DataTypes.INTEGER,
      field: 'store_id'
    },
    creatorUserId: {
      type: DataTypes.INTEGER
    }
  }, {
    sequelize,
    tableName: 'expenses',
    modelName: 'Expense',
  });
  return Expense;
};