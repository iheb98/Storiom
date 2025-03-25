'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate({ Address, Subscription, Store, PaymentOrder }) {
      // define association here
      this.hasOne(Address, { foreignKey: 'user_id', as: 'address' })
      this.hasOne(Subscription, { foreignKey: 'user_id', as: 'subscription' })
      this.hasOne(Store, { foreignKey: 'user_id', as: 'store' })
      this.hasMany(PaymentOrder, { foreignKey: 'user_id' })
    }
    toJSON() {
      return { ...this.get(), creatorUserId: undefined, password: undefined }
    }
  }
  User.init({
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
    phone: DataTypes.STRING,
    email: DataTypes.STRING,
    password: DataTypes.STRING,
    language: {
      type: DataTypes.STRING,
      defaultValue: 'FR'
    },
    role: {
      type: DataTypes.ENUM('Owner', 'Admin', 'Worker'),
      defaultValue: 'Owner'
    },
    functionInStore: {
      type: DataTypes.STRING,
      field: 'function_in_store'
    },
    superiorId: {
      type: DataTypes.INTEGER,
    },
    worksInStore: {
      type: DataTypes.INTEGER,
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
    }
  }, {
    sequelize,
    tableName: 'users',
    modelName: 'User',
  });
  return User;
};