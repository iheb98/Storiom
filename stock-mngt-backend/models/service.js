'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Service extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Service.init({
    name: DataTypes.STRING,
    client: DataTypes.STRING,
    price: DataTypes.FLOAT,
    comment: DataTypes.TEXT,
    status: DataTypes.STRING
  }, {
    sequelize,
    tableName:'services',
    modelName: 'Service',
  });
  return Service;
};