'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('delivery_workers', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            first_name: {
                type: Sequelize.STRING
            },
            last_name: {
                type: Sequelize.STRING
            },
            email: {
                type: Sequelize.STRING
            },
            phone: {
                type: Sequelize.STRING
            },
            whatsapp: {
                type: Sequelize.STRING
            },
            description: {
                type: Sequelize.TEXT
            },
            supported_states: {
                type: Sequelize.JSONB,
                defaultValue: []
            },
            store_id: {
                type: Sequelize.INTEGER,
                references: {
                    model: 'stores',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },
            sendEmail: {
                type: DataTypes.BOOLEAN,
                field: 'send_email',
                defaultValue: false
            },
            sendWhatsApp: {
                type: DataTypes.BOOLEAN,
                field: 'send_whatsapp',
                defaultValue: false
            },
            sendSMS: {
                type: DataTypes.BOOLEAN,
                field: 'send_sms',
                defaultValue: false
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
        await queryInterface.dropTable('delivery_workers');
    }
};
