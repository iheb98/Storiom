'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Store extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate({ Category, Brand, Supplier, Address, Order }) {
      // define association here
      this.hasMany(Category, { foreignKey: 'store_id', as: 'categories' })
      this.hasOne(Address, { foreignKey: 'store_id', as: 'address' })
      this.hasMany(Brand, { foreignKey: 'store_id', as: 'brands' })
      this.hasMany(Supplier, { foreignKey: 'store_id', as: 'suppliers' })
      this.hasMany(Order, { foreignKey: 'store_id', as: 'orders' })
    }
    toJSON() {
      return { ...this.get(), images: this.images ? JSON.parse(this.images) : [], userId: undefined, user_id: undefined, creatorUserId: undefined, createdAt: undefined, updatedAt: undefined }
    }
  }
  Store.init({
    name: DataTypes.STRING,
    description: DataTypes.TEXT,
    logo: DataTypes.STRING,
    images: DataTypes.STRING,
    phone: DataTypes.STRING,
    email: DataTypes.STRING,
    taxId: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'tax_id'
    },

    site: DataTypes.STRING,
    active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    userId: {
      type: DataTypes.INTEGER,
      field: 'user_id'
    },
    type: DataTypes.STRING,
    isVisibleToPublic: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      field: 'is_visible_to_public'
    },
    isSupportingDeliveries: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'is_supporting_deliveries'
    },
    selectedCategories: DataTypes.STRING,
    storageUsedBytes: {
      type: DataTypes.BIGINT,
      defaultValue: 0,
      field: 'storage_used_bytes'
    },
    storageLimitBytes: {
      type: DataTypes.BIGINT,
      defaultValue: 53687091200, // 50 GB default (50 * 1024 * 1024 * 1024)
      field: 'storage_limit_bytes'
    },
    purchasedStorageBytes: {
      type: DataTypes.BIGINT,
      defaultValue: 0,
      field: 'purchased_storage_bytes'
    },
    purchasedStorageExpiresAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'purchased_storage_expires_at'
    },
    creatorUserId: {
      type: DataTypes.INTEGER
    },
    verified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'verified'
    }
  }, {
    sequelize,
    tableName: 'stores',
    modelName: 'Store',
  });
  return Store;
};