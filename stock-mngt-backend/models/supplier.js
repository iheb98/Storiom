'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Supplier extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate({ Receipt }) {
      // define association here
      this.hasMany(Receipt, { foreignKey: 'supplier_id', as: 'receipts' })
    }

    toJSON() {
      return { ...this.get(), storeId: undefined, store_id: undefined, createdAt: undefined, updatedAt: undefined }
    }
  }
  Supplier.init({
    firstName: {
      type: DataTypes.STRING,
      field: 'first_name'
    },
    lastName: {
      type: DataTypes.STRING,
      field: 'last_name'
    },
    storeId: {
      type: DataTypes.INTEGER,
      field: 'store_id'
    },
    phone: DataTypes.STRING,
    email: DataTypes.STRING
  }, {
    sequelize,
    tableName: 'suppliers',
    modelName: 'Supplier',
  });
  return Supplier;
};