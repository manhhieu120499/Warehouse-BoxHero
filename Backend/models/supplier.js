module.exports = (sequelize, Sequelize) => {
    const Supplier = sequelize.define(
        'Supplier',
        {
            supplierID: {
                type: Sequelize.STRING,
                primaryKey: true,
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
                validate: {
                    isEmail: true,
                },
                unique: true,
            },
        },
        {
            tableName: 'suppliers',
            timestamps: false,
        },
    );

    Supplier.associate = (models) => {
        Supplier.belongsToMany(models.Product, {
            through: 'ProductSuppliers', // bảng trung gian
            foreignKey: 'supplierID',
            otherKey: 'productID',
            as: 'products',
        });
    };

    return Supplier;
};
