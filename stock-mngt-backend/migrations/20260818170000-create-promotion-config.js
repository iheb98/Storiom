'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, DataTypes) {
        await queryInterface.createTable('promotion_config', {
            id: {
                allowNull: false,
                primaryKey: true,
                type: DataTypes.INTEGER,
                defaultValue: 1
            },
            is_active: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: false
            },
            discount_percent: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 50
            },
            max_users: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 50
            },
            used_count: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0
            },
            description: {
                type: DataTypes.TEXT,
                allowNull: true
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

        // Insert the singleton row
        await queryInterface.bulkInsert('promotion_config', [{
            id: 1,
            is_active: false,
            discount_percent: 50,
            max_users: 50,
            used_count: 0,
            description: 'Offre early-bird : réduction pour les premiers utilisateurs',
            createdAt: new Date(),
            updatedAt: new Date()
        }]);
    },
    async down(queryInterface) {
        await queryInterface.dropTable('promotion_config');
    }
};
