'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('service_requests', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            status: {
                type: Sequelize.ENUM('PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'),
                defaultValue: 'PENDING'
            },
            customer_note: {
                type: Sequelize.TEXT
            },
            admin_note: {
                type: Sequelize.TEXT
            },
            price: {
                type: Sequelize.FLOAT,
                defaultValue: 0
            },
            started_at: {
                type: Sequelize.DATE
            },
            completed_at: {
                type: Sequelize.DATE
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
            store_service_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'store_services',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },
            guestName: {
                type: DataTypes.STRING,
                field: 'guest_name',
                allowNull: true
            },
            guestPhone: {
                type: DataTypes.STRING,
                field: 'guest_phone',
                allowNull: true
            },
            guestEmail: {
                type: DataTypes.STRING,
                field: 'guest_email',
                allowNull: true
            },
            trackingCode: {
                type: DataTypes.STRING(8),
                field: 'tracking_code',
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
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('service_requests');
    }
};
