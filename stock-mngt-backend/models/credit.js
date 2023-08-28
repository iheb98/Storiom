'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Credit extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }

    toJSON() {
      return { ...this.get(), storeId: undefined, store_id: undefined, creatorUserId: undefined, createdAt: undefined, updatedAt: undefined }
    }
  }
  Credit.init({
    firstName: {
      type: DataTypes.STRING,
      field: 'first_name'
    },
    lastName: {
      type: DataTypes.STRING,
      field: 'last_name'
    },
    phone: DataTypes.STRING,
    email: DataTypes.STRING,
    comment: DataTypes.TEXT,
    amount: DataTypes.FLOAT,
    givenDate: {
      type: DataTypes.DATE,
      field: 'given_date'
    },
    returnDate: {
      type: DataTypes.DATE,
      field: 'return_date'
    },
    storeId: {
      type: DataTypes.INTEGER,
      field: 'store_id'
    },
    creatorUserId: {
      type: DataTypes.INTEGER
    }
  }, {
    sequelize,
    tableName: 'credits',
    modelName: 'Credit',
  });
  return Credit;
};