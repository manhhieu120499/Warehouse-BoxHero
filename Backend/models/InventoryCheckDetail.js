// models/InventoryCheckDetail.js
module.exports = (sequelize, Sequelize) => {
    const InventoryCheckDetail = sequelize.define(
        'InventoryCheckDetail',
        {
            inventoryCheckDetailID: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            inventoryCheckID: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            productID: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            systemQuantity: {
                type: Sequelize.INTEGER,
                allowNull: false,
            },
            actualQuantity: {
                type: Sequelize.INTEGER,
                allowNull: false,
            },
            discrepancyQuantity: {
                type: Sequelize.INTEGER,
                allowNull: false,
                defaultValue: 0,
            },
            reason: {
                type: Sequelize.TEXT,
                allowNull: true,
            },
        },
        {
            tableName: 'inventory_check_detail',
            timestamps: true,
        },
    );

    InventoryCheckDetail.associate = (models) => {
        InventoryCheckDetail.belongsTo(models.InventoryCheck, { foreignKey: 'inventoryCheckID' });
        InventoryCheckDetail.belongsTo(models.Product, { foreignKey: 'productID', as: 'product' });
    };

    return InventoryCheckDetail;
};
