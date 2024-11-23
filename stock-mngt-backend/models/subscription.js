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

    toJSON(){
      return {...this.get(),id:undefined,userId:undefined,user_id:undefined,createdAt:undefined,updatedAt:undefined}
    }
  }
  Subscription.init({
    paymentDate: {
      type: DataTypes.DATE,
      defaultValue:DataTypes.NOW,
      field: 'payment_date'
    },
    activationDate: {
      type: DataTypes.DATE,
      defaultValue:DataTypes.NOW,
      field: 'activation_date'
    },
    duration: {
      type: DataTypes.ENUM('TRIAL', '1M', '3M', '6M', '12M', 'PERMANENT'),
      defaultValue: 'TRIAL'
    },
    userId: {
      type: DataTypes.INTEGER,
      field:'user_id'
    },
  }, {
    sequelize,
    tableName: 'subscriptions',
    modelName: 'Subscription',
  });
  return Subscription;
};