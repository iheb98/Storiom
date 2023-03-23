'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Store extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate({ Category, Brand, Supplier }) {
      // define association here
      this.hasMany(Category, { foreignKey: 'store_id', as: 'categories' })
      this.hasMany(Brand, { foreignKey: 'store_id', as: 'brands' })
      this.hasMany(Supplier, { foreignKey: 'store_id', as: 'suppliers' })
    }
    toJSON() {
      return { ...this.get(), images: JSON.parse(this.images), userId: undefined, user_id: undefined, createdAt: undefined, updatedAt: undefined }
    }
  }
  Store.init({
    name: DataTypes.STRING,
    description: DataTypes.TEXT,
    logo: DataTypes.STRING,
    images: DataTypes.STRING,
    active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    userId: {
      type: DataTypes.INTEGER,
      field: 'user_id'
    }
  }, {
    sequelize,
    tableName: 'stores',
    modelName: 'Store',
  });
  return Store;
};