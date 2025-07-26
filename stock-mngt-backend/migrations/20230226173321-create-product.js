'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, DataTypes) {
    await queryInterface.createTable('products', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER
      },
      name: {
        type: DataTypes.STRING
      },
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
      currency: {
        type: DataTypes.STRING
      },
      color: {
        type: DataTypes.STRING
      },
      size: {
        type: DataTypes.STRING
      },
      images: {
        type: DataTypes.STRING(5000)
      },
      quantity: {
        type: DataTypes.FLOAT
      },
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
      isVisible: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
      },
      toDisplay: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
      },
      creatorUserId: {
        type: DataTypes.INTEGER
      },
      createdAt: {
        allowNull: false,
        type: DataTypes.DATE
      },
      criticalStockIndicator: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0,
        field: 'critical_stock_indicator'
      },
      updatedAt: {
        allowNull: false,
        type: DataTypes.DATE
      }
    });
  },
  async down(queryInterface, DataTypes) {
    await queryInterface.dropTable('products');
  }
};