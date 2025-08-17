'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable(
            'categories',
            {
                categoryID: {
                    type: Sequelize.STRING,
                    primaryKey: true,
                    allowNull: false,
                },
                categoryName: {
                    type: Sequelize.STRING,
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
        await queryInterface.dropTable('categories');
    },
};
