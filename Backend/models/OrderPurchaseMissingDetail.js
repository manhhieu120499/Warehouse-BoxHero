// models/OrderPurchaseMissingDetail.js
module.exports = (sequelize, Sequelize) => {
    const OrderPurchaseMissingDetail = sequelize.define(
        'OrderPurchaseMissingDetail',
        {
            orderPurchaseMissingDetailID: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            orderPurchaseMissingID: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            orderPurchaseDetailID: {
                type: Sequelize.INTEGER,
                allowNull: false,
            },
            missingQuantity: {
                type: Sequelize.INTEGER,
                allowNull: false,
            },
            status: {
                type: Sequelize.ENUM('open', 'closed'),
                allowNull: false,
                defaultValue: 'open',
            },
        },
        {
            tableName: 'order_purchase_missing_detail',
            timestamps: true,
        },
    );

    OrderPurchaseMissingDetail.associate = (models) => {
        OrderPurchaseMissingDetail.belongsTo(models.OrderPurchaseMissing, { foreignKey: 'orderPurchaseMissingID' });
        OrderPurchaseMissingDetail.belongsTo(models.OrderPurchaseDetail, {
            foreignKey: 'orderPurchaseDetailID',
            as: 'orderPurchaseDetail',
        });
    };

    return OrderPurchaseMissingDetail;
};
