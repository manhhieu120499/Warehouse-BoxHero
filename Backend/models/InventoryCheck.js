module.exports = (sequelize, Sequelize) => {
    const InventoryCheck = sequelize.define(
        'InventoryCheck',
        {
            inventoryCheckID: {
                type: Sequelize.STRING,
                primaryKey: true,
                allowNull: false,
            },
            employeeID: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            note: {
                type: Sequelize.TEXT,
                allowNull: true,
            },
            warehouseID: {
                type: Sequelize.STRING,
                allowNull: false,
            },

            status: {
                type: Sequelize.ENUM('PENDING', 'COMPLETED', 'REFUSE'),
                allowNull: false,
                defaultValue: 'PENDING',
            },

            checkStatus: {
                type: Sequelize.ENUM('BALANCED', 'DISCREPANCY'),
                allowNull: false,
                defaultValue: 'BALANCED',
            },
        },
        {
            tableName: 'inventory_check',
            timestamps: true, // createdAt & updatedAt
            charset: 'utf8mb4',
            collate: 'utf8mb4_unicode_ci',
        },
    );

    InventoryCheck.associate = (models) => {
        InventoryCheck.belongsTo(models.Employee, { foreignKey: 'employeeID', as: 'employee' });
        InventoryCheck.belongsTo(models.Warehouse, { foreignKey: 'warehouseID' });

        // 🔥 Liên kết với chi tiết kiểm kê
        InventoryCheck.hasMany(models.InventoryCheckDetail, {
            foreignKey: 'inventoryCheckID',
            as: 'details',
        });
    };

    return InventoryCheck;
};
