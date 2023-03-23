'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Receipt extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate({ User, Operation }) {
      // define association here
      this.belongsTo(User, { foreignKey: 'user_id', as: 'responsible' })
      this.hasMany(Operation, { foreignKey: 'receipt_id', as: 'operations' })
    }

    toJSON() {
      return { ...this.get(), storeId: undefined, store_id: undefined, userId: undefined, user_id: undefined, supplierId: undefined, supplier_id: undefined, createdAt: undefined, updatedAt: undefined }
    }
  }
  Receipt.init({
    code: DataTypes.STRING,
    total: DataTypes.FLOAT,
    tax: DataTypes.FLOAT,
    name: DataTypes.STRING,
    date: DataTypes.DATE,
    type: DataTypes.ENUM('LOADED', 'SOLD', 'RETURNED'),
    storeId: {
      type: DataTypes.INTEGER,
      field: 'store_id'
    },
    userId: {
      type: DataTypes.INTEGER,
      field: 'user_id'
    },
    supplierId: {
      type: DataTypes.INTEGER,
      field: 'supplier_id'
    }
  }, {
    sequelize,
    tableName: 'receipts',
    modelName: 'Receipt',
  });
  return Receipt;
};