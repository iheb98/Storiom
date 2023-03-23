'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Address extends Model {
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
  Address.init({
    street: DataTypes.STRING,
    postalCode: {
      type: DataTypes.STRING,
      field: 'postal_code'
    },
    userId: {
      type: DataTypes.INTEGER,
      field:'user_id'
    },
    country: DataTypes.STRING,
    state: DataTypes.STRING,
    city:DataTypes.STRING
  }, {
    sequelize,
    tableName: 'addresses',
    modelName: 'Address',
  });
  return Address;
};