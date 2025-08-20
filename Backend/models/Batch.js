module.exports = (sequelize, Sequelize) => {
    const Batch = sequelize.define(
        'Batch',
        {
            batchID: {
                type: Sequelize.STRING,
                primaryKey: true,
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
            },
            supplierID: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            unitID: {
                type: Sequelize.INTEGER,
                allowNull: false,
            },
            warehouseID: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            status: {
                type: Sequelize.ENUM('ERROR', 'AVAILABLE', 'EXPIRED'),
                allowNull: false,
                defaultValue: 'AVAILABLE',
            },
        },
        {
            tableName: 'batches',
            timestamps: true,
        },
    );

    Batch.associate = (models) => {
        Batch.belongsTo(models.Product, { foreignKey: 'productID', as: 'product' });
        Batch.belongsTo(models.Supplier, { foreignKey: 'supplierID', as: 'supplier' });
        Batch.belongsTo(models.Unit, { foreignKey: 'unitID', as: 'unit' });
        Batch.belongsTo(models.Warehouse, { foreignKey: 'warehouseID', as: 'warehouse' });

        // Quan hệ với Box
        Batch.belongsToMany(models.Box, {
            through: 'batch_boxes',
            foreignKey: 'batchID',
            otherKey: 'boxID',
            as: 'boxes',
        });
    };

    return Batch;
};
