'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Worker extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate({ Store, Address }) {
      this.hasOne(Address, { foreignKey: 'user_id', as: 'address' })
      this.belongsTo(Store, { foreignKey: 'store_id', as: 'store' })
      // define association here
    }
  }
  Worker.init({
    firstName: DataTypes.STRING,
    lastName: DataTypes.STRING,
    email: DataTypes.STRING,
    password: DataTypes.STRING,
    username: DataTypes.STRING,
    salary: DataTypes.FLOAT,
    entryDate: DataTypes.DATE,
    function: DataTypes.STRING,
    role: DataTypes.STRING,
    profileImage: DataTypes.STRING,
    phone: DataTypes.STRING,
    superiorId: DataTypes.INTEGER,
    storeId: {
      type: DataTypes.INTEGER,
      field: 'store_id'
    },
    creatorUserId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Worker',
  });
  return Worker;
};