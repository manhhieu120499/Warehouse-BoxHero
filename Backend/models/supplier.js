module.exports = (sequelize, Sequelize) => {
    const Supplier = sequelize.define(
        'Supplier',
        {
            supplierId: {
                type: Sequelize.STRING,
                primaryKey: true,
                allowNull: false,
            },
            supplierName: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            address: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            phoneNumber: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            email: {
                type: Sequelize.STRING,
                allowNull: false,
                unique: true,
            },
        },
        { tableName: 'suppliers', timestamps: false },
    );

    Supplier.associate = (models) => {};

    return Supplier;
};
