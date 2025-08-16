'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('warehouses', {
            warehouseId: {
                type: Sequelize.STRING,
                primaryKey: true,
                allowNull: false,
            },
            warehouseName: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            faxNumber: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            address: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            status: {
                type: Sequelize.STRING,
                allowNull: false,
            },
    })
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('warehouses')
  }
};
