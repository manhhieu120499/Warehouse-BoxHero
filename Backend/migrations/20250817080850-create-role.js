'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable(
            'roles',
            {
                roleID: {
                    type: Sequelize.STRING,
                    primaryKey: true,
                    allowNull: false,
                },
                roleName: {
                    type: Sequelize.ENUM(
                        'SYSTEM_ADMIN',
                        'WARE_MANAGER',
                        'STOCK_RECEIVER',
                        'STOCK_DISPATCHER',
                        'ACCOUNTANT',
                    ),
                    allowNull: false,
                },
            },
            {
                charset: 'utf8mb4',
                collate: 'utf8mb4_unicode_ci',
            },
        );
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('roles');
    },
};
