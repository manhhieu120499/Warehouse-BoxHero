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
            timestamps: false,
        },
    );

    Warehouse.associate = (models) => {};

    return Warehouse;
};
