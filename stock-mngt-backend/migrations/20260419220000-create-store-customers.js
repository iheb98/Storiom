'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('store_customers', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            first_name: {
                type: Sequelize.STRING,
                allowNull: true
            },
            last_name: {
                type: Sequelize.STRING,
                allowNull: true
            },
            email: {
                type: Sequelize.STRING,
                allowNull: false
            },
            phone: {
                type: Sequelize.STRING,
                allowNull: true
            },
            password: {
                type: Sequelize.STRING,
                allowNull: false
            },
            store_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'stores',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },
            is_confirmed: {
                type: Sequelize.BOOLEAN,
                defaultValue: false
            },
            confirmation_token: {
                type: Sequelize.STRING,
                allowNull: true
            },
            token_expires_at: {
                type: Sequelize.DATE,
                allowNull: true
            },
            reset_password_token: {
                type: Sequelize.STRING,
                allowNull: true
            },
            reset_password_expires: {
                type: Sequelize.DATE,
                allowNull: true
            },
            createdAt: {
                allowNull: false,
                type: Sequelize.DATE,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
            },
            updatedAt: {
                allowNull: false,
                type: Sequelize.DATE,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
            }
        });

        // Unique constraint: one email per store
        await queryInterface.addIndex('store_customers', ['email', 'store_id'], {
            name: 'idx_store_customers_email_store',
            unique: true
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable('store_customers');
    }
};
