'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Category extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate({ Category, Store }) {
      // define association here
      this.hasMany(Category, { foreignKey: 'parent_categorie_id', as: 'subCategories' })
      this.belongsTo(Category, { foreignKey: 'parent_categorie_id', as: 'parentCategory' })
      //this.belongsTo(Category, { foreignKey: 'parent_categorie_id', as: 'parentCategory' })
      //this.belongsTo(Store, { foreignKey: 'store_id', as: 'store' })
    }
    toJSON() {
      return { ...this.get(), storeId: undefined, store_id: undefined, parentCategoryId: undefined, parent_categorie_id: undefined, creatorUserId: undefined, createdAt: undefined, updatedAt: undefined }
    }
  }
  Category.init({
    name: DataTypes.STRING,
    parentCategoryId: {
      type: DataTypes.INTEGER,
      field: 'parent_categorie_id'
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
    tableName: 'categories',
    modelName: 'Category',
  });
  return Category;
};