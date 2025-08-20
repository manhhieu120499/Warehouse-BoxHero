module.exports = (sequelize, Sequelize) => {
    const Warehouse = sequelize.define(
        'Warehouse',
        {
            warehouseID: {
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
        },
        {
            tableName: 'warehouses',
            timestamps: true,
        },
    );

    Warehouse.associate = (models) => {
        Warehouse.hasMany(models.Zone, { foreignKey: 'warehouseID' });
        Warehouse.hasMany(models.Batch, { foreignKey: 'warehouseID', as: 'batches' });
    };

    return Warehouse;
};
