'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('suppliers', {
        supplierId: {
            type: Sequelize.STRING,
            primaryKey: true,
            allowNull: false
        },
        supplierName: {
            type: Sequelize.STRING,
            allowNull: false
        },
        address: {
            type: Sequelize.STRING,
            allowNull: false
        },
        phoneNumber: {
            type: Sequelize.STRING,
            allowNull: false
        },
        email: {
            type: Sequelize.STRING,
            allowNull: false,
            unique: true
        }
    })
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('suppliers');
  }
};
