'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class CartItem extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate({ User, Product }) {
      this.belongsTo(User, { foreignKey: "user_id", as: "user" });
      this.belongsTo(Product, { foreignKey: "product_id", as: "product" });
    }

    toJSON() {
      return { ...this.get(), images: this.images ? JSON.parse(this.images) : [], brandId: undefined, brand_id: undefined, store_id: undefined, supplierId: undefined, supplier_id: undefined, categoryId: undefined, category_id: undefined }
    }
  }


  CartItem.init({
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1
    },
    userId: {
      type: DataTypes.INTEGER,
      field: 'user_id'
    },
    productId: {
      type: DataTypes.INTEGER,
      field: 'product_id'
    },
  }, {
    sequelize,
    tableName: 'cart_items',
    modelName: 'CartItem',
  });
  return CartItem;
};