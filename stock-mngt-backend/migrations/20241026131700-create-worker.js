'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, DataTypes) {
    await queryInterface.createTable('Workers', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER
      },
      firstName: {
        type: DataTypes.STRING
      },
      lastName: {
        type: DataTypes.STRING
      },
      email: {
        type: DataTypes.STRING
      },
      password: {
        type: DataTypes.STRING
      },
      username: {
        type: DataTypes.STRING
      },
      salary: {
        type: DataTypes.FLOAT
      },
      entryDate: {
        type: DataTypes.DATE
      },
      function: {
        type: DataTypes.STRING
      },
      role: {
        type: DataTypes.STRING
      },
      profileImage: {
        type: DataTypes.STRING
      },
      phone: {
        type: DataTypes.STRING
      },
      superiorId: {
        type: DataTypes.INTEGER
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
    await queryInterface.dropTable('Workers');
  }
};