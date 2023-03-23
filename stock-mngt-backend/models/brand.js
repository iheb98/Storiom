'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Brand extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
    toJSON() {
      return { ...this.get(), storeId: undefined, store_id: undefined, createdAt: undefined, updatedAt: undefined }
    }
  }
  Brand.init({
    name: DataTypes.STRING,
    storeId: {
      type: DataTypes.INTEGER,
      field: 'store_id'
    }
  }, {
    sequelize,
    tableName: 'brands',
    modelName: 'Brand',
  });
  return Brand;
};