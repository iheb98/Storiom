'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, DataTypes) {
    await queryInterface.createTable('receipts', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER
      },
      code: {
        type: DataTypes.STRING
      },
      total: {
        type: DataTypes.FLOAT
      },
      tax: {
        type: DataTypes.FLOAT
      },
      name: {
        type: DataTypes.STRING
      },
      type: {
        type: DataTypes.ENUM('SELL', 'LOAD')
      },
      date: {
        type: DataTypes.DATE
      },
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
      },
      createdAt: {
        allowNull: false,
        type: DataTypes.DATE
      },
      updatedAt: {
        allowNull: false,
        type: DataTypes.DATE
      }
    });
  },
  async down(queryInterface, DataTypes) {
    await queryInterface.dropTable('receipts');
  }
};