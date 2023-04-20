'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Product extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate({ Category,Brand,Store }) {
      // define association here
      this.belongsTo(Category, { foreignKey: 'category_id', as: 'category' })
      this.belongsTo(Brand, { foreignKey: 'brand_id', as: 'brand' })
      this.belongsTo(Store, { foreignKey: 'store_id', as: 'store' })
    }

    toJSON() {
      return { ...this.get(), storeId: undefined, images: JSON.parse(this.images), brandId: undefined, brand_id: undefined, store_id: undefined, supplierId: undefined, supplier_id: undefined, categoryId: undefined, category_id: undefined, createdAt: undefined, updatedAt: undefined }
    }
  }
  Product.init({
    name: DataTypes.STRING,
    code: DataTypes.STRING,
    buyingPrice: {
      type: DataTypes.FLOAT,
      field: 'buying_price'
    },
    sellingPrice: {
      type: DataTypes.FLOAT,
      field: 'selling_price'
    },
    description: DataTypes.TEXT,
    currency: DataTypes.STRING,
    sizeType: {
      type: DataTypes.ENUM('SHIRT', 'SHOES'),
      field: 'size_type'
    },
    color: DataTypes.STRING,
    size: DataTypes.ENUM('XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'),
    images: DataTypes.STRING(5000),
    quantity: DataTypes.INTEGER,
    storeId: {
      type: DataTypes.INTEGER,
      field: 'store_id'
    },
    supplierId: {
      type: DataTypes.INTEGER,
      field: 'supplier_id'
    },
    brandId: {
      type: DataTypes.INTEGER,
      field: 'brand_id'
    },
    categoryId: {
      type: DataTypes.INTEGER,
      field: 'category_id'
    },
    creatorUserId: {
      type: DataTypes.INTEGER
    },
  }, {
    sequelize,
    tableName: 'products',
    modelName: 'Product',
  });
  return Product;
};