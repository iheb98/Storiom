'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Subscription extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }

    toJSON() {
      return { ...this.get(), id: undefined, userId: undefined, user_id: undefined, updatedAt: undefined }
    }
  }
  Subscription.init({
    paymentDate: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
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
      type: DataTypes.ENUM('TRIAL', '1M', '3M', '6M', '12M', 'PERMANENT'),
      defaultValue: 'TRIAL'
    },
    userId: {
      type: DataTypes.INTEGER,
      field: 'user_id'
    },
    plan: {
      type: DataTypes.ENUM('STOCK', 'STOCK_WEBSITE'),
      allowNull: false,
      defaultValue: 'STOCK'
    },
    // Queued next plan (activates when current plan expires)
    nextPlan: {
      type: DataTypes.ENUM('STOCK', 'STOCK_WEBSITE'),
      allowNull: true,
      defaultValue: null,
      field: 'next_plan'
    },
    nextDuration: {
      type: DataTypes.ENUM('1M', '3M', '6M', '12M'),
      allowNull: true,
      defaultValue: null,
      field: 'next_duration'
    },
    nextActivationDate: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: null,
      field: 'next_activation_date'
    },
    nextExpirationDate: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: null,
      field: 'next_expiration_date'
    },
    nextPaymentOrderId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: null,
      field: 'next_payment_order_id'
    },
  }, {
    sequelize,
    tableName: 'subscriptions',
    modelName: 'Subscription',
  });
  return Subscription;
};