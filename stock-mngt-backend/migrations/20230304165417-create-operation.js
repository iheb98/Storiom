'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, DataTypes) {
    await queryInterface.createTable('operations', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER
      },
      type: {
        type: DataTypes.ENUM('LOADED', 'SOLD', 'RETURNED')
      },
      amount: {
        type: DataTypes.INTEGER
      },
      price: {
        type: DataTypes.FLOAT
      },
      date: {
        type: DataTypes.DATE
      },
      receiptId: {
        type: DataTypes.INTEGER,
        field: 'receipt_id'
      },
      productId: {
        type: DataTypes.INTEGER,
        field: 'product_id'
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
    await queryInterface.dropTable('operations');
  }
};