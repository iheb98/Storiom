'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('payment_orders', {
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            order_number: {
                type: Sequelize.STRING,
                allowNull: false,
                unique: true
            },
            user_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'users',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },
            payment_type: {
                type: Sequelize.ENUM('SUBSCRIPTION', 'STORAGE_EXTENSION'),
                allowNull: false,
                defaultValue: 'SUBSCRIPTION'
            },
            subscription_plan: {
                type: Sequelize.ENUM('1M', '3M', '6M', '12M'),
                allowNull: true
            },
            storage_gb: {
                type: Sequelize.INTEGER,
                allowNull: true,
                defaultValue: 50
            },
            amount: {
                type: Sequelize.DECIMAL(10, 2),
                allowNull: false
            },
            currency: {
                type: Sequelize.STRING,
                allowNull: false,
                defaultValue: 'TND'
            },
            status: {
                type: Sequelize.ENUM('PENDING', 'USER_CONFIRMED', 'PAID', 'CANCELLED'),
                allowNull: false,
                defaultValue: 'PENDING'
            },
            user_confirmed_at: {
                type: Sequelize.DATE,
                allowNull: true
            },
            bank_reference: {
                type: Sequelize.STRING,
                allowNull: true
            },
            validated_at: {
                type: Sequelize.DATE,
                allowNull: true
            },
            validated_by: {
                type: Sequelize.INTEGER,
                allowNull: true
            },
            notes: {
                type: Sequelize.TEXT,
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
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('payment_orders');
    }
};
