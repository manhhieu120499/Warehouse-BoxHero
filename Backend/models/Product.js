module.exports = (sequelize, Sequelize) => {
    const Product = sequelize.define(
        'Product',
        {
            productID: {
                type: Sequelize.STRING,
                primaryKey: true,
            },
            productName: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            description: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            image: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            price: {
                type: Sequelize.DOUBLE,
                allowNull: false,
            },
            minStock: {
                type: Sequelize.INTEGER,
                allowNull: false,
            },
            amount: {
                type: Sequelize.INTEGER,
                allowNull: false,
            },
            status: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            qrCode: {
                type: Sequelize.STRING,
                allowNull: false,
            },
        },
        {
            tableName: 'products',
            timestamps: false,
        },
    );

    Product.associate = (models) => {
        Product.belongsToMany(models.Supplier, {
            through: 'ProductSuppliers', // bảng trung gian
            foreignKey: 'productID',
            otherKey: 'supplierID',
            as: 'suppliers',
        });
    };

    return Product;
};
