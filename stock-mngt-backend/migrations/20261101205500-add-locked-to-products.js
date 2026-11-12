'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, DataTypes) {
        await queryInterface.addColumn('products', 'locked', {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        });
    },
    async down(queryInterface) {
        await queryInterface.removeColumn('products', 'locked');
    }
};
