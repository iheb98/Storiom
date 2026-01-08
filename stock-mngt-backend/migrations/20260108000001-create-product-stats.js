'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        // Create product_stats table
        await queryInterface.createTable('product_stats', {
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            product_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                unique: true,
                references: {
                    model: 'products',
                    key: 'id'
                },
                onDelete: 'CASCADE',
                onUpdate: 'CASCADE'
            },
            // Engagement Metrics
            view_count: {
                type: Sequelize.INTEGER,
                defaultValue: 0
            },
            click_count: {
                type: Sequelize.INTEGER,
                defaultValue: 0
            },
            // Cart & Purchase Metrics
            cart_add_count: {
                type: Sequelize.INTEGER,
                defaultValue: 0
            },
            order_count: {
                type: Sequelize.INTEGER,
                defaultValue: 0
            },
            total_quantity_sold: {
                type: Sequelize.INTEGER,
                defaultValue: 0
            },
            total_revenue: {
                type: Sequelize.DECIMAL(10, 3),
                defaultValue: 0
            },
            // Wishlist/Favorites
            wishlist_count: {
                type: Sequelize.INTEGER,
                defaultValue: 0
            },
            // Search & Discovery
            search_impressions: {
                type: Sequelize.INTEGER,
                defaultValue: 0
            },
            // Popularity Score
            popularity_score: {
                type: Sequelize.DECIMAL(10, 2),
                defaultValue: 0
            },
            // Timestamps for trending analysis
            last_viewed_at: {
                type: Sequelize.DATE,
                allowNull: true
            },
            last_ordered_at: {
                type: Sequelize.DATE,
                allowNull: true
            },
            last_cart_add_at: {
                type: Sequelize.DATE,
                allowNull: true
            },
            created_at: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
            },
            updated_at: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
            }
        });

        // Add indexes for common queries
        await queryInterface.addIndex('product_stats', ['view_count']);
        await queryInterface.addIndex('product_stats', ['order_count']);
        await queryInterface.addIndex('product_stats', ['popularity_score']);
        await queryInterface.addIndex('product_stats', ['last_viewed_at']);
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('product_stats');
    }
};
