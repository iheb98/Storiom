'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, DataTypes) {
    await queryInterface.createTable('stores', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER
      },
      name: {
        type: DataTypes.STRING
      },
      description: {
        type: DataTypes.TEXT
      },
      logo: {
        type: DataTypes.STRING
      },
      images: {
        type: DataTypes.STRING
      },
      phone: {
        type: DataTypes.STRING
      },
      email: {
        type: DataTypes.STRING
      },
      site: {
        type: DataTypes.STRING
      },
      active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
      },
      userId: {
        type: DataTypes.INTEGER,
        field: 'user_id'
      },
      type: {
        type: DataTypes.STRING
      },
      selectedCategories: {
        type: DataTypes.STRING
      },
      creatorUserId: {
        type: DataTypes.INTEGER
      },
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
      createdAt: {
        allowNull: false,
        type: DataTypes.DATE
      },
      updatedAt: {
        allowNull: false,
        type: DataTypes.DATE
      }
    });
  },
  async down(queryInterface, DataTypes) {
    await queryInterface.dropTable('stores');
  }
};