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
                type: Sequelize.ENUM('AVAILABLE', 'OUT_OF_STOCK', 'DISCONTINUED'),
                allowNull: false,
                defaultValue: 'AVAILABLE',
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
        Product.hasMany(models.Batch, { foreignKey: 'productID', as: 'batches' });
    };

    return Product;
};
