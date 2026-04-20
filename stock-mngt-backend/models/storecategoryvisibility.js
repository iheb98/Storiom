'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class StoreCategoryVisibility extends Model {
    static associate({ Store, Category }) {
      this.belongsTo(Store, { foreignKey: 'store_id', as: 'store' });
      this.belongsTo(Category, { foreignKey: 'category_id', as: 'category' });
    }
  }

  StoreCategoryVisibility.init({
    storeId: {
      type: DataTypes.INTEGER,
      field: 'store_id',
      allowNull: false
    },
    categoryId: {
      type: DataTypes.INTEGER,
      field: 'category_id',
      allowNull: false
    },
    visible: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    sequelize,
    tableName: 'store_category_visibility',
    modelName: 'StoreCategoryVisibility',
    indexes: [
      {
        unique: true,
        fields: ['store_id', 'category_id']
      }
    ]
  });
  return StoreCategoryVisibility;
};
