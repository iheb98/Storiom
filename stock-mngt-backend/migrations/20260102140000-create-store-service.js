'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('store_services', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            name: {
                type: Sequelize.STRING,
                allowNull: false
            },
            description: {
                type: Sequelize.TEXT
            },
            price: {
                type: Sequelize.FLOAT,
                defaultValue: 0
            },
            estimated_duration: {
                type: Sequelize.STRING
            },
            category: {
                type: Sequelize.STRING,
                defaultValue: 'general'
            },
            image: {
                type: Sequelize.STRING
            },
            is_active: {
                type: Sequelize.BOOLEAN,
                defaultValue: true
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
            isPriceVariable: {
                type: DataTypes.BOOLEAN,
                defaultValue: false,
                field: 'is_price_variable'
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
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('store_services');
    }
};
