module.exports = (sequelize, Sequelize) => {
    const ProductSupplier = sequelize.define(
        'ProductSupplier',
        {
            productID: {
                type: Sequelize.STRING,
                primaryKey: true,
            },
            supplierID: {
                type: Sequelize.STRING,
                primaryKey: true,
            },
            importPrice: {
                type: Sequelize.DOUBLE,
                allowNull: true,
            },
            importDate: {
                type: Sequelize.DATE,
                allowNull: true,
            },
        },
        {
            tableName: 'product_suppliers',
            timestamps: false,
        },
    );

    return ProductSupplier;
};
