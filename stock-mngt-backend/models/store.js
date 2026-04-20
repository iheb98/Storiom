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
    static associate({ Category, Brand, Supplier, Address, Order, StoreCustomer }) {
      // define association here
      this.hasMany(Category, { foreignKey: 'store_id', as: 'categories' })
      this.hasOne(Address, { foreignKey: 'store_id', as: 'address' })
      this.hasMany(Brand, { foreignKey: 'store_id', as: 'brands' })
      this.hasMany(Supplier, { foreignKey: 'store_id', as: 'suppliers' })
      this.hasMany(Order, { foreignKey: 'store_id', as: 'orders' })
      this.hasMany(StoreCustomer, { foreignKey: 'store_id', as: 'customers' })
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
    },
    customDomain: {
      type: DataTypes.STRING(255),
      allowNull: true,
      unique: true,
      field: 'custom_domain'
    },
    domainVerified: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: 'domain_verified'
    },
    theme: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: {
        primaryColor: '#4f46e5',
        accentColor: '#f59e0b',
        mode: 'light',
        fontFamily: 'Inter',
        hero: {
          style: 'fullImage',
          title: '',
          subtitle: '',
          ctaText: 'Découvrir nos produits',
          backgroundImage: '',
          images: [],
          overlayOpacity: 0.5,
          autoScrollSpeed: 5
        },
        announcement: {
          enabled: false,
          text: '',
          bgColor: '#4f46e5',
          link: ''
        },
        usps: {
          enabled: true,
          items: [
            { icon: 'truck', title: 'Livraison rapide', subtitle: 'En 24-48h' },
            { icon: 'shield', title: 'Paiement sécurisé', subtitle: '100% sécurisé' },
            { icon: 'refresh', title: 'Retours faciles', subtitle: 'Sous 14 jours' },
            { icon: 'headset', title: 'Support client', subtitle: 'À votre écoute' }
          ]
        },
        about: {
          enabled: false,
          title: 'Notre histoire',
          content: '',
          image: ''
        },
        social: {
          facebook: '',
          instagram: '',
          tiktok: ''
        },
        footer: {
          text: '',
          bgColor: '#0f172a',
          textColor: '#94a3b8',
          showContact: true,
          showSocial: true,
          showQuickLinks: true,
          quickLinks: []
        },
        header: {
          bgColor: '#ffffff',
          textColor: '#0f172a',
          sticky: true,
          showSearch: true,
          logoPosition: 'left'
        },
        productsPage: {
          gridColumns: 4,
          defaultSort: '',
          showFilters: true,
          productsPerPage: 24,
          headerGradient: true
        },
        cartPage: {
          checkoutText: 'Commander',
          showContinueShopping: true,
          showFreeShipping: true
        },
        productCard: {
          showCartButton: true,
          showDiscountBadge: true,
          imageRatio: 'square',
          borderRadius: 14,
          hoverEffect: 'lift'
        },
        sections: {
          hero: true,
          products: true,
          categories: true,
          usps: true,
          about: false,
          info: true,
          footer: true
        }
      }
    }
  }, {
    sequelize,
    tableName: 'stores',
    modelName: 'Store',
  });
  return Store;
};