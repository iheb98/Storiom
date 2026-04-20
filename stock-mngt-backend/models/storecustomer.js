'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class StoreCustomer extends Model {
    static associate({ Store }) {
      this.belongsTo(Store, { foreignKey: 'store_id', as: 'store' });
    }
    toJSON() {
      return { ...this.get(), password: undefined };
    }
  }

  StoreCustomer.init({
    firstName: {
      type: DataTypes.STRING,
      field: 'first_name'
    },
    lastName: {
      type: DataTypes.STRING,
      field: 'last_name'
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false
    },
    phone: DataTypes.STRING,
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    storeId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'store_id'
    },
    isConfirmed: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'is_confirmed'
    },
    confirmationToken: {
      type: DataTypes.STRING,
      field: 'confirmation_token'
    },
    tokenExpiresAt: {
      type: DataTypes.DATE,
      field: 'token_expires_at'
    },
    resetPasswordToken: {
      type: DataTypes.STRING,
      field: 'reset_password_token'
    },
    resetPasswordExpires: {
      type: DataTypes.DATE,
      field: 'reset_password_expires'
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'store_customers',
    modelName: 'StoreCustomer',
    indexes: [
      {
        unique: true,
        fields: ['email', 'store_id']
      }
    ]
  });

  return StoreCustomer;
};
