'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, DataTypes) {
    await queryInterface.createTable('users', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER
      },
      firstName: {
        type: DataTypes.STRING,
        field: 'first_name'
      },
      lastName: {
        type: DataTypes.STRING,
        field: 'last_name'
      },
      profileImage: {
        type: DataTypes.STRING,
        field: 'profile_image'
      },
      phone: {
        type: DataTypes.STRING
      },
      email: {
        type: DataTypes.STRING
      },
      password: {
        type: DataTypes.STRING
      },
      language: {
        type: DataTypes.STRING
      },
      role: {
        type: DataTypes.ENUM('Owner', 'Admin', 'Worker'),
        defaultValue: 'Owner'
      },
      functionInStore: {
        type: DataTypes.STRING,
        field: 'function_in_store'
      },
      superiorId:{
        type: DataTypes.INTEGER,
      },
      worksInStore: {
        type: DataTypes.STRING,
        field: 'works_in_store'
      },
      salary: DataTypes.FLOAT,
      entryDate: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        field: 'entry_date'
      },
      leaveDate: {
        type: DataTypes.DATE,
        field: 'leave_date'
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
    await queryInterface.dropTable('users');
  }
};