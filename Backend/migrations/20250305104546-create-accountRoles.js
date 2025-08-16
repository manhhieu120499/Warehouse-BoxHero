'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('account_roles', {
            accountID: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'accounts',
                    key: 'accountID',
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE',
            },
            roleID: {
                type: Sequelize.STRING,
                allowNull: false,
                references: {
                    model: 'roles',
                    key: 'roleID',
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE',
            },
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable('account_roles');
    },
};
