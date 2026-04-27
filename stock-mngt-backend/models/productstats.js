'use strict';
const { Model } = require('sequelize');

/**
 * ProductStats Model
 * Tracks aggregate statistics for each product (Option A: Single Stats Table)
 * Used for product popularity, recommendations, and analytics
 */
module.exports = (sequelize, DataTypes) => {
    class ProductStats extends Model {
        static associate({ Product }) {
            this.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });
        }
    }

    ProductStats.init({
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        productId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: 'product_id'
        },
        source: {
            type: DataTypes.ENUM('marketplace', 'private_store'),
            allowNull: false,
            defaultValue: 'marketplace'
        },
        // Engagement Metrics
        viewCount: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            field: 'view_count'
        },
        clickCount: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            field: 'click_count'
        },
        // Cart & Purchase Metrics
        cartAddCount: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            field: 'cart_add_count'
        },
        orderCount: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            field: 'order_count'
        },
        totalQuantitySold: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            field: 'total_quantity_sold'
        },
        totalRevenue: {
            type: DataTypes.DECIMAL(10, 3),
            defaultValue: 0,
            field: 'total_revenue'
        },
        // Wishlist/Favorites
        wishlistCount: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            field: 'wishlist_count'
        },
        // Search & Discovery
        searchImpressions: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            field: 'search_impressions'
        },
        // Popularity Score (calculated, updated periodically)
        popularityScore: {
            type: DataTypes.DECIMAL(10, 2),
            defaultValue: 0,
            field: 'popularity_score'
        },
        // Timestamps for trending analysis
        lastViewedAt: {
            type: DataTypes.DATE,
            field: 'last_viewed_at'
        },
        lastOrderedAt: {
            type: DataTypes.DATE,
            field: 'last_ordered_at'
        },
        lastCartAddAt: {
            type: DataTypes.DATE,
            field: 'last_cart_add_at'
        }
    }, {
        sequelize,
        tableName: 'product_stats',
        modelName: 'ProductStats',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        indexes: [
            {
                unique: true,
                fields: ['product_id', 'source']
            }
        ]
    });

    return ProductStats;
};
