'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        // Create user_interactions table
        await queryInterface.createTable('user_interactions', {
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            user_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'users',
                    key: 'id'
                },
                onDelete: 'CASCADE',
                onUpdate: 'CASCADE'
            },
            product_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'products',
                    key: 'id'
                },
                onDelete: 'CASCADE',
                onUpdate: 'CASCADE'
            },
            store_id: {
                type: Sequelize.INTEGER,
                allowNull: true,
                references: {
                    model: 'stores',
                    key: 'id'
                },
                onDelete: 'SET NULL',
                onUpdate: 'CASCADE'
            },
            category_id: {
                type: Sequelize.INTEGER,
                allowNull: true,
                references: {
                    model: 'categories',
                    key: 'id'
                },
                onDelete: 'SET NULL',
                onUpdate: 'CASCADE'
            },
            interaction_type: {
                type: Sequelize.ENUM('view', 'click', 'cart_add', 'cart_remove', 'order', 'wishlist_add', 'wishlist_remove', 'search'),
                allowNull: false
            },
            quantity: {
                type: Sequelize.INTEGER,
                defaultValue: 1
            },
            search_term: {
                type: Sequelize.STRING,
                allowNull: true
            },
            weight: {
                type: Sequelize.DECIMAL(3, 2),
                defaultValue: 1.0
            },
            session_id: {
                type: Sequelize.STRING,
                allowNull: true
            },
            created_at: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
            }
        });

        // Add indexes for efficient queries
        await queryInterface.addIndex('user_interactions', ['user_id']);
        await queryInterface.addIndex('user_interactions', ['product_id']);
        await queryInterface.addIndex('user_interactions', ['interaction_type']);
        await queryInterface.addIndex('user_interactions', ['created_at']);
        await queryInterface.addIndex('user_interactions', ['user_id', 'product_id']);
        await queryInterface.addIndex('user_interactions', ['user_id', 'category_id']);
        await queryInterface.addIndex('user_interactions', ['store_id']);
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('user_interactions');
    }
};
