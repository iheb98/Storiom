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
    static associate({ Category, Brand, Store, Supplier, OrderItem, Review }) {
      // define association here
      this.belongsTo(Category, { foreignKey: 'category_id', as: 'category' })
      //this.belongsTo(Category, { foreignKey: 'sub_category_id', as: 'subcategory' })
      this.belongsTo(Supplier, { foreignKey: 'supplier_id', as: 'supplier' })
      this.belongsTo(Brand, { foreignKey: 'brand_id', as: 'brand' })
      this.belongsTo(Store, { foreignKey: 'store_id', as: 'store' })
      this.hasMany(OrderItem, { foreignKey: 'product_id', as: 'orderItems' })
      this.hasMany(Review, { foreignKey: 'product_id', as: 'reviews' })
    }

    toJSON() {
      return {
        ...this.get(),
        images: this.images ? JSON.parse(this.images) : [],
        thumbnails: this.thumbnails ? JSON.parse(this.thumbnails) : [],
        brandId: undefined,
        brand_id: undefined,
        store_id: undefined,
        supplierId: undefined,
        supplier_id: undefined,
        categoryId: undefined,
        category_id: undefined
      }
    }
  }
  Product.init({
    name: DataTypes.STRING,
    code: {
      type: DataTypes.STRING
    },
    buyingPrice: {
      type: DataTypes.FLOAT,
      field: 'buying_price'
    },
    sellingPrice: {
      type: DataTypes.FLOAT,
      field: 'selling_price'
    },
    description: {
      type: DataTypes.STRING(3000),
      defaultValue: ''
    },
    currency: DataTypes.STRING,
    color: {
      type: DataTypes.STRING,
      defaultValue: ''
    },
    size: DataTypes.STRING,
    images: DataTypes.STRING(5000),
    thumbnails: DataTypes.STRING(5000),
    quantity: DataTypes.FLOAT,
    unit: {
      type: DataTypes.STRING,
      defaultValue: 'PIECE'
    },
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
    isVisible: {
      type: DataTypes.BOOLEAN
    },
    criticalStockIndicator: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
      field: 'critical_stock_indicator'
    },
    toDisplay: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    discount: {
      type: DataTypes.FLOAT
    },
    activateCriticalStockIndicator: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: 'activate_critical_stock_indicator'
    },
  }, {
    sequelize,
    tableName: 'products',
    modelName: 'Product',
  });
  return Product;
};