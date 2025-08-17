'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable(
            'batches',
            {
                batchID: {
                    type: Sequelize.STRING,
                    primaryKey: true,
                    allowNull: false,
                },
                manufactureDate: {
                    type: Sequelize.DATE,
                    allowNull: false,
                },
                expiryDate: {
                    type: Sequelize.DATE,
                    allowNull: false,
                },
                importAmount: {
                    type: Sequelize.INTEGER,
                    allowNull: false,
                },
                remainAmount: {
                    type: Sequelize.INTEGER,
                    allowNull: false,
                },
                productID: {
                    type: Sequelize.STRING,
                    allowNull: false,
                    references: {
                        model: 'products', // bảng products
                        key: 'productID',
                    },
                    onUpdate: 'CASCADE',
                    onDelete: 'CASCADE',
                },
                supplierID: {
                    type: Sequelize.STRING,
                    allowNull: false,
                    references: {
                        model: 'suppliers', // bảng suppliers
                        key: 'supplierID',
                    },
                    onUpdate: 'CASCADE',
                    onDelete: 'CASCADE',
                },
                unitID: {
                    type: Sequelize.STRING, // nên là STRING thay vì INTEGER, vì unit.unitID trong model là STRING
                    allowNull: false,
                    references: {
                        model: 'units', // bảng units
                        key: 'unitID',
                    },
                    onUpdate: 'CASCADE',
                    onDelete: 'CASCADE',
                },
                status: {
                    type: Sequelize.ENUM('ERROR', 'AVAILABLE', 'EXPIRED'),
                    allowNull: false,
                    defaultValue: 'AVAILABLE',
                },
            },
            {
                charset: 'utf8mb4',
                collate: 'utf8mb4_unicode_ci',
            },
        );
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('batches');
    },
};
