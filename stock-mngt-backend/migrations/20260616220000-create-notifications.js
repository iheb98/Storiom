'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, DataTypes) {
        await queryInterface.createTable('notifications', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: DataTypes.INTEGER
            },
            store_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: { model: 'stores', key: 'id' },
                onDelete: 'CASCADE'
            },
            type: {
                type: DataTypes.STRING,
                allowNull: false,
                defaultValue: 'NEW_ORDER'
            },
            title: {
                type: DataTypes.STRING,
                allowNull: false
            },
            message: {
                type: DataTypes.TEXT,
                allowNull: true
            },
            order_id: {
                type: DataTypes.INTEGER,
                allowNull: true,
                references: { model: 'orders', key: 'id' },
                onDelete: 'SET NULL'
            },
            is_read: {
                type: DataTypes.BOOLEAN,
                defaultValue: false
            },
            metadata: {
                type: DataTypes.JSONB,
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

        // Index for fast lookups by store + read status
        await queryInterface.addIndex('notifications', ['store_id', 'is_read']);
    },
    async down(queryInterface) {
        await queryInterface.dropTable('notifications');
    }
};
