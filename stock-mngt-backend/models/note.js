'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Note extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }

    toJSON() {
      return { ...this.get(), userId: undefined, images: JSON.parse(this.images), user_id: undefined, creatorUserId: undefined, createdAt: undefined, updatedAt: undefined }
    }
  }
  Note.init({
    comment: DataTypes.TEXT,
    images: DataTypes.STRING,
    userId: {
      type: DataTypes.INTEGER,
      field: 'user_id'
    },
    creatorUserId: {
      type: DataTypes.INTEGER
    }
  }, {
    sequelize,
    tableName: 'notes',
    modelName: 'Note',
  });
  return Note;
};