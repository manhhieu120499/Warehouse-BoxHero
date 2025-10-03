const db = require('../../models');
const dotenv = require('dotenv');
dotenv.config();
const HTTP_OK = process.env.HTTP_OK;
const HTTP_INTERNAL_SERVER_ERROR = process.env.HTTP_INTERNAL_SERVER_ERROR;
const HTTP_BAD_REQUEST = process.env.HTTP_BAD_REQUEST;
const OrderRelease = db.OrderRelease;
const OrderReleaseDetail = db.OrderReleaseDetail;
const Customer = db.Customer;
const Batch = db.Batch;
const Box = db.Box;
const OrderReleaseBatchBoxDetail = db.OrderReleaseBatchBoxDetail;
const BatchBox = db.BatchBox;
const Product = db.Product;
const Unit = db.Unit;
const Warehouse = db.Warehouse;
const Employee = db.Employee;

class OrderReleaseService {
    // post /create
    async createOrderRelease(data) {
        return new Promise(async (resolve, reject) => {
            const transaction = await db.sequelize.transaction();
            try {
                const { orderReleaseID, customerID, employeeID, warehouseID, note, orderReleaseDetails } = data;

                console.log(1);

                // check customer
                const customer = await Customer.findOne({ where: { customerID } });
                const orderRelease = await OrderRelease.findOne({ where: { orderReleaseID } });

                if (orderRelease) {
                    return reject({
                        status: 'ERROR',
                        statusHttp: HTTP_BAD_REQUEST,
                        message: 'Hóa đơn xuất kho đã tồn tại',
                    });
                }

                if (!customer) {
                    return reject({
                        status: 'ERROR',
                        statusHttp: HTTP_BAD_REQUEST,
                        message: 'Khách hàng không tồn tại',
                    });
                }

                if (Array.isArray(orderReleaseDetails) && orderReleaseDetails.length === 0) {
                    return reject({
                        status: 'ERROR',
                        statusHttp: HTTP_BAD_REQUEST,
                        message: 'Chi tiết đơn xuất kho không được để trống',
                    });
                }
                // Create the main order release record
                const newOrderRelease = await OrderRelease.create(
                    {
                        orderReleaseID,
                        customerID,
                        employeeID,
                        warehouseID,
                        note,
                    },
                    { transaction },
                );

                const listResponseOrderReleaseDetails = [];
                for (const element of orderReleaseDetails) {
                    const batch = await Batch.findOne({ where: { batchID: element.batchID } });
                    const product = await Product.findOne({ where: { productID: element.productID } });
                    const unit = await Unit.findOne({ where: { unitID: element.unitID } });

                    if (!product) {
                        return reject({
                            status: 'ERROR',
                            statusHttp: HTTP_BAD_REQUEST,
                            message: `Sản phẩm không tồn tại ${element.productID}`,
                        });
                    }

                    if (!batch) {
                        return reject({
                            status: 'ERROR',
                            statusHttp: HTTP_BAD_REQUEST,
                            message: `Lô hàng không tồn tại ${element.batchID}`,
                        });
                    }

                    const respOrderReleaseDetail = await OrderReleaseDetail.create(
                        {
                            orderReleaseID: newOrderRelease.orderReleaseID,
                            batchID: element.batchID,
                            quantityExported: element.quantityExported,
                        },
                        { transaction },
                    );

                    const listResponseBoxDetails = [];
                    for (const boxDetail of element.batchBoxes) {
                        const box = await Box.findOne({ where: { boxID: boxDetail.boxID } });
                        const batchBox = await BatchBox.findOne({
                            where: { boxID: boxDetail.boxID, batchID: element.batchID },
                        });

                        if (!box) {
                            return reject({
                                status: 'ERROR',
                                statusHttp: HTTP_BAD_REQUEST,
                                message: `Ô chứa lô hàng không tồn tại ${boxDetail.boxID}`,
                            });
                        }

                        const resp = await OrderReleaseBatchBoxDetail.create(
                            {
                                orderReleaseDetailID: respOrderReleaseDetail.orderReleaseDetailID,
                                batchID: element.batchID,
                                boxID: boxDetail.boxID,
                                quantityExported: boxDetail.quantityExported,
                            },
                            { transaction },
                        );

                        // update lại số lượng
                        const updateQuantityBatchBox = await BatchBox.update(
                            {
                                quantity: batchBox.quantity - boxDetail.quantityExported,
                            },
                            {
                                where: { boxID: boxDetail.boxID, batchID: element.batchID },
                                transaction,
                            },
                        );
                        listResponseBoxDetails.push(resp);
                    }
                    listResponseOrderReleaseDetails.push({
                        orderReleaseDetailID: respOrderReleaseDetail.orderReleaseDetailID,
                        batchID: element.batchID,
                        quantityExported: element.quantityExported,
                        boxDetails: listResponseBoxDetails,
                    });

                    // update số lượng của sản phẩm
                    const updateAmountProduct = await Product.update(
                        {
                            amount:
                                product.amount - Number.parseInt(element.quantityExported) * unit.conversionQuantity,
                        },
                        {
                            where: { productID: element.productID },
                            transaction,
                        },
                    );
                }

                await transaction.commit();
                resolve({
                    status: 'OK',
                    statusHttp: HTTP_OK,
                    data: { ...newOrderRelease, orderReleaseDetails: listResponseOrderReleaseDetails },
                    message: 'Tạo đơn xuất kho thành công',
                });
            } catch (error) {
                await transaction.rollback();
                console.error('Tạo đơn xuất kho lỗi:', error);
                reject({
                    status: 'ERROR',
                    statusHttp: HTTP_INTERNAL_SERVER_ERROR,
                    message: error.message,
                });
            }
        });
    }
    async getAllOrderRelease(warehouseID) {
        return new Promise(async (resolve, reject) => {
            try {
                const warehouse = await Warehouse.findOne({ where: { warehouseID } });
                if (!warehouse)
                    return reject({
                        status: 'ERROR',
                        statusHttp: HTTP_BAD_REQUEST,
                        message: 'Kho không tồn tại',
                    });
                const orderReleases = await OrderRelease.findAll({
                    where: { warehouseID },
                    include: [
                        {
                            model: Employee,
                            as: 'employees',
                            attributes: ['employeeID', 'employeeName'],
                        },
                        {
                            model: Customer,
                            as: 'customers',
                            attributes: ['customerID', 'customerName'],
                        },
                        {
                            model: OrderReleaseDetail,
                            as: 'orderReleaseDetails',
                            include: [
                                {
                                    model: OrderReleaseBatchBoxDetail,
                                    as: 'orderReleaseBatchBoxDetails',
                                },
                            ],
                        },
                    ],
                });
                resolve({
                    status: 'OK',
                    statusHttp: HTTP_OK,
                    data: orderReleases,
                    message: 'Lấy danh sách đơn xuất kho thành công',
                });
            } catch (err) {
                console.error('Lấy danh sách đơn xuất kho lỗi:', err);
                reject({
                    status: 'ERROR',
                    statusHttp: HTTP_INTERNAL_SERVER_ERROR,
                    message: err.message,
                });
            }
        });
    }
}

module.exports = new OrderReleaseService();
