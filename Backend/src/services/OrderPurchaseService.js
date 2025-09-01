const db = require('../../models/index');
const Batch = db.Batch;
const OrderPurchaseDetail = db.OrderPurchaseDetail;
const Product = db.Product;
const BatchBox = db.BatchBox;
const dotenv = require('dotenv');

dotenv.config();

const HTTP_OK = process.env.HTTP_OK;
const HTTP_NOT_FOUND = process.env.HTTP_NOT_FOUND;
const HTTP_BAD_REQUEST = process.env.HTTP_BAD_REQUEST;
const HTTP_UNAUTHORIZED = process.env.HTTP_UNAUTHORIZED;

class OrderPurchaseService {
    createOrderPurchase(newOrder) {
        return new Promise(async (resolve, reject) => {
            const transaction = await db.sequelize.transaction();
            try {
                const {
                    orderPurchaseID,
                    employeeID,
                    note,
                    warehouseID,
                    supplierID,
                    orderReturnID,
                    proposalID,
                    orderPurchaseDetails,
                } = newOrder;

                // Check orderPurchase tồn tại
                const orderPurchaseFind = await db.OrderPurchase.findOne({ where: { orderPurchaseID } });
                if (orderPurchaseFind) {
                    resolve({
                        statusHttp: HTTP_BAD_REQUEST,
                        status: 'ERR',
                        message: 'Đơn nhập hàng đã tồn tại',
                    });
                }

                // check proposal exists
                if (proposalID) {
                    const proposalFind = await db.Proposal.findOne({ where: { proposalID } });
                    if (!proposalFind) {
                        return resolve({
                            statusHttp: HTTP_BAD_REQUEST,
                            status: 'ERR',
                            message: 'Đề xuất không tồn tại',
                        });
                    }
                }

                // save orderPurchase
                const newOrderPurchase = await db.OrderPurchase.create(
                    {
                        orderPurchaseID,
                        employeeID,
                        note,
                        warehouseID,
                        orderReturnID,
                        proposalID,
                    },
                    { transaction },
                );

                // loop orderPurchaseDetails
                for (const orderPurchaseDetail of orderPurchaseDetails) {
                    const batchID = orderPurchaseDetail.batchID;
                    const batchFind = await db.Batch.findOne({ where: { batchID } });

                    if (batchFind) {
                        await transaction.rollback();
                        return resolve({
                            statusHttp: HTTP_BAD_REQUEST,
                            status: 'ERR',
                            message: 'Lô đã tồn tại',
                        });
                    }

                    // check product exists
                    const productID = orderPurchaseDetail.productID;
                    const productFind = await db.Product.findOne({ where: { productID } });

                    if (!productFind) {
                        return resolve({
                            statusHttp: HTTP_BAD_REQUEST,
                            status: 'ERR',
                            message: 'Sản phẩm không tồn tại',
                        });
                    }

                    // check supplier exists
                    const supplierFind = await db.Supplier.findOne({
                        where: { supplierID: orderPurchaseDetail.supplierID },
                    });

                    if (!supplierFind) {
                        return resolve({
                            statusHttp: HTTP_BAD_REQUEST,
                            status: 'ERR',
                            message: 'Nhà cung cấp không tồn tại',
                        });
                    }

                    // check unit exists
                    const unitFind = await db.Unit.findOne({ where: { unitID: orderPurchaseDetail.unitID } });

                    if (!unitFind) {
                        return resolve({
                            statusHttp: HTTP_BAD_REQUEST,
                            status: 'ERR',
                            message: 'Đơn vị không tồn tại',
                        });
                    }

                    // check warehouse exists
                    const warehouseFind = await db.Warehouse.findOne({
                        where: { warehouseID: warehouseID },
                    });

                    if (!warehouseFind) {
                        return resolve({
                            statusHttp: HTTP_BAD_REQUEST,
                            status: 'ERR',
                            message: 'Kho không tồn tại',
                        });
                    }

                    // save batch
                    await Batch.create(
                        {
                            batchID,
                            manufactureDate: orderPurchaseDetail.manufactureDate,
                            expiryDate: orderPurchaseDetail.expiryDate,
                            importAmount: orderPurchaseDetail.actualQuantity,
                            remainAmount: orderPurchaseDetail.actualQuantity,
                            productID: orderPurchaseDetail.productID,
                            supplierID: orderPurchaseDetail.supplierID,
                            unitID: orderPurchaseDetail.unitID,
                            warehouseID: warehouseID,
                        },
                        { transaction },
                    );

                    // save order purchase detail
                    await OrderPurchaseDetail.create(
                        {
                            orderPurchaseID: orderPurchaseID,
                            batchID: batchID,
                            requestedQuantity: orderPurchaseDetail.requestedQuantity,
                            actualQuantity: orderPurchaseDetail.actualQuantity,
                        },
                        { transaction },
                    );

                    // save batch box
                    for (const position of orderPurchaseDetail.positions) {
                        console.log('position', position);

                        await BatchBox.create(
                            {
                                batchID: batchID,
                                boxID: position.boxID,
                            },
                            { transaction },
                        );
                    }

                    // update amount product
                    const amountConvert = unitFind.conversionQuantity * orderPurchaseDetail.actualQuantity;

                    await Product.update(
                        {
                            amount: productFind.amount + amountConvert,
                        },
                        { where: { productID: orderPurchaseDetail.productID }, transaction },
                    );
                }

                await transaction.commit();
                resolve({
                    statusHttp: HTTP_OK,
                    status: 'OK',
                    message: 'Tạo đơn nhập hàng thành công',
                });
            } catch (e) {
                await transaction.rollback();
                console.log(e);
                reject(e);
            }
        });
    }
}

module.exports = new OrderPurchaseService();
