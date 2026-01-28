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
        type: DataTypes.ENUM('SuperAdmin', 'Owner', 'Admin', 'Worker', 'Customer'),
        defaultValue: 'Customer'
      },
      functionInStore: {
        type: DataTypes.STRING,
        field: 'function_in_store'
      },
      superiorId: {
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
      isConfirmed: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        field: 'is_confirmed'
      },
      tokenExpiresAt: {
        type: DataTypes.DATE,
        field: 'token_expires_at'
      },
      confirmationToken: {
        type: DataTypes.STRING,
        field: 'confirmation_token'
      },
      resetPasswordToken: {
        type: DataTypes.STRING,
        field: 'reset_password_token'
      },
      resetPasswordExpires: {
        type: DataTypes.STRING,
        field: 'reset_password_expires'
      },
      termsAccepted: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        field: 'terms_accepted'
      },
      termsAcceptedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'terms_accepted_at'
      },
      settings: {
        type: DataTypes.JSONB,
        allowNull: true,
        defaultValue: {
          theme: {
            primaryColor: '#3f51b5',
            mode: 'light'
          },
          defaults: {
            productVisibleToPublic: false
          },
          navigation: {
            defaultScreen: 'none'
          }
        }
      },
      referredBy: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'referred_by'
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