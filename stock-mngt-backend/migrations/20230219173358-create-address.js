'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, DataTypes) {
    await queryInterface.createTable('addresses', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER
      },
      street: {
        type: DataTypes.STRING
      },
      postalCode: {
        type: DataTypes.STRING,
        field: 'postal_code'
      },
      country: {
        type: DataTypes.STRING
      },
      state: {
        type: DataTypes.STRING
      },
      city: {
        type: DataTypes.STRING
      },
      user_id: {
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
    await queryInterface.dropTable('addresses');
  }
};