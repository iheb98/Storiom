'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class PaymentOrder extends Model {
    static associate({ User }) {
      this.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
    }
  }
  PaymentOrder.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    orderNumber: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      field: 'order_number'
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'user_id'
    },
    // Payment type: SUBSCRIPTION or STORAGE_EXTENSION
    paymentType: {
      type: DataTypes.ENUM('SUBSCRIPTION', 'STORAGE_EXTENSION'),
      allowNull: false,
      defaultValue: 'SUBSCRIPTION',
      field: 'payment_type'
    },
    // Subscription plan (1M, 3M, 6M, 12M) - for SUBSCRIPTION type
    subscriptionPlan: {
      type: DataTypes.ENUM('1M', '3M', '6M', '12M'),
      allowNull: true,
      field: 'subscription_plan'
    },
    // Storage amount in GB - for STORAGE_EXTENSION type
    storageGB: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 50,
      field: 'storage_gb'
    },
    // Storage duration - for STORAGE_EXTENSION type
    storageDuration: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'storage_duration'
    },
    // Amount to pay
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    // Currency
    currency: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'TND'
    },
    // Status: PENDING, USER_CONFIRMED, PAID, CANCELLED
    status: {
      type: DataTypes.ENUM('PENDING', 'USER_CONFIRMED', 'PAID', 'CANCELLED'),
      allowNull: false,
      defaultValue: 'PENDING'
    },
    // User confirms they made the bank transfer
    userConfirmedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'user_confirmed_at'
    },
    // Admin enters bank transfer reference when validating
    bankReference: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'bank_reference'
    },
    // Admin validation
    validatedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'validated_at'
    },
    validatedBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'validated_by'
    },
    // Admin notes
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'payment_orders',
    modelName: 'PaymentOrder',
  });
  return PaymentOrder;
};