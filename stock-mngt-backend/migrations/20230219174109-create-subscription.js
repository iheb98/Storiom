'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, DataTypes) {
    await queryInterface.createTable('subscriptions', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER
      },
      paymentDate: {
        type: DataTypes.DATE,
        field: 'payment_date'
      },
      activationDate: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        field: 'activation_date'
      },
      expirationDate: {
        type: DataTypes.DATE,
        field: 'expiration_date'
      },
      duration: {
        type: DataTypes.ENUM('TRIAL', '1M', '3M', '6M', '12M', 'INFINITE'),
        defaultValue: 'TRIAL'
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
    await queryInterface.dropTable('subscriptions');
  }
};