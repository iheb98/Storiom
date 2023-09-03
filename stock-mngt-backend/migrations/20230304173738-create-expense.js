'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, DataTypes) {
    await queryInterface.createTable('expenses', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER
      },
      title: {
        type: DataTypes.STRING
      },
      amount: {
        type: DataTypes.FLOAT
      },
      comment: {
        type: DataTypes.TEXT
      },
      date: {
        type: DataTypes.DATE
      },
      storeId: {
        type: DataTypes.INTEGER,
        field: 'store_id'
      },
      creatorUserId: {
        type: DataTypes.INTEGER
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
    await queryInterface.dropTable('expenses');
  }
};