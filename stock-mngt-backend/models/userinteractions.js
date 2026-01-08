'use strict';
const { Model } = require('sequelize');

/**
 * UserInteractions Model
 * Tracks individual user interactions with products for personalized recommendations
 * Stores recent interactions to understand user preferences
 */
module.exports = (sequelize, DataTypes) => {
    class UserInteractions extends Model {
        static associate({ User, Product, Store, Category }) {
            this.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
            this.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });
            this.belongsTo(Store, { foreignKey: 'store_id', as: 'store' });
            this.belongsTo(Category, { foreignKey: 'category_id', as: 'category' });
        }
    }

    UserInteractions.init({
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: 'user_id'
        },
        productId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: 'product_id'
        },
        storeId: {
            type: DataTypes.INTEGER,
            allowNull: true,
            field: 'store_id'
        },
        categoryId: {
            type: DataTypes.INTEGER,
            allowNull: true,
            field: 'category_id'
        },
        // Interaction type: view, click, cart_add, order, wishlist, search
        interactionType: {
            type: DataTypes.ENUM('view', 'click', 'cart_add', 'cart_remove', 'order', 'wishlist_add', 'wishlist_remove', 'search'),
            allowNull: false,
            field: 'interaction_type'
        },
        // For orders - include the quantity
        quantity: {
            type: DataTypes.INTEGER,
            defaultValue: 1
        },
        // For search - include the search term
        searchTerm: {
            type: DataTypes.STRING,
            allowNull: true,
            field: 'search_term'
        },
        // Interaction weight (higher for purchases, lower for views)
        weight: {
            type: DataTypes.DECIMAL(3, 2),
            defaultValue: 1.0
        },
        // Session ID for grouping interactions
        sessionId: {
            type: DataTypes.STRING,
            allowNull: true,
            field: 'session_id'
        }
    }, {
        sequelize,
        tableName: 'user_interactions',
        modelName: 'UserInteractions',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: false,
        indexes: [
            { fields: ['user_id'] },
            { fields: ['product_id'] },
            { fields: ['interaction_type'] },
            { fields: ['created_at'] }
        ]
    });

    return UserInteractions;
};
