// models/ProductQuantityLog.js
module.exports = (sequelize, Sequelize) => {
    const ProductQuantityLog = sequelize.define(
        'ProductQuantityLog',
        {
            logID: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            productID: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            actionType: {
                type: Sequelize.ENUM('PURCHASE', 'RELEASE', 'INVENTORY_CHECK', 'ADJUSTMENT'),
                allowNull: false,
            },
            quantityChange: {
                type: Sequelize.INTEGER,
                allowNull: false,
                comment: 'Giá trị dương khi nhập, âm khi xuất',
            },
            previousAmount: {
                type: Sequelize.INTEGER,
                allowNull: false,
            },
            newAmount: {
                type: Sequelize.INTEGER,
                allowNull: false,
            },
            referenceID: {
                type: Sequelize.STRING,
                allowNull: true,
                comment: 'ID tham chiếu đến đơn hàng hoặc phiếu kiểm kê',
            },
            note: {
                type: Sequelize.STRING,
                allowNull: true,
            },
        },
        {
            tableName: 'product_quantity_logs',
            timestamps: true,
        },
    );

    ProductQuantityLog.associate = (models) => {
        ProductQuantityLog.belongsTo(models.Product, {
            foreignKey: 'productID',
            as: 'product',
        });
    };

    return ProductQuantityLog;
};
