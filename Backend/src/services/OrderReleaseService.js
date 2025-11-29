const db = require('../../models');
const dotenv = require('dotenv');
dotenv.config();
const HTTP_OK = process.env.HTTP_OK;
const HTTP_INTERNAL_SERVER_ERROR = process.env.HTTP_INTERNAL_SERVER_ERROR;
const HTTP_BAD_REQUEST = process.env.HTTP_BAD_REQUEST;
const OrderRelease = db.OrderRelease;
const OrderReleaseDetail = db.OrderReleaseDetail;
const ProductQuantityLog = db.ProductQuantityLog;
const Customer = db.Customer;
const Batch = db.Batch;
const Box = db.Box;
const OrderReleaseBatchBoxDetail = db.OrderReleaseBatchBoxDetail;
const BatchBox = db.BatchBox;
const Product = db.Product;
const Unit = db.Unit;
const Warehouse = db.Warehouse;
const Employee = db.Employee;
const BaseUnitProduct = db.BaseUnitProduct;
const OrderReleaseProposal = db.OrderReleaseProposal;
const { Op, fn, col, where } = require('sequelize');

const LIMIT_PAGE = 5;

class OrderReleaseService {
    // post /create
    async createOrderRelease(data) {
        return new Promise(async (resolve, reject) => {
            const transaction = await db.sequelize.transaction();
            try {
                const {
                    orderReleaseID,
                    customerID,
                    employeeID,
                    warehouseID,
                    note,
                    orderReleaseDetails,
                    orderReleaseProposalID,
                } = data;

                // check customer
                const customer = await Customer.findOne({ where: { customerID } });
                const orderRelease = await OrderRelease.findOne({ where: { orderReleaseID } });
                const orderReleaseProposal = await OrderReleaseProposal.findOne({ where: { orderReleaseProposalID } });

                if (!orderReleaseProposal) {
                    return reject({
                        status: 'ERROR',
                        statusHttp: HTTP_BAD_REQUEST,
                        message: 'Phiếu đề xuất xuất kho không tồn tại',
                    });
                }

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
                        orderReleaseProposalID,
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

                        // update lại số lượng còn lại cùa lô hàng (batch)
                        const updateBatch = await Batch.increment(
                            {
                                validAmount: -boxDetail.quantityExported,
                                pendingOutAmount: boxDetail.quantityExported,
                            },
                            { where: { batchID: element.batchID }, transaction },
                        );

                        // update lại số lượng
                        const updateBatchBox = await BatchBox.update(
                            {
                                validQuantity: batchBox.validQuantity - boxDetail.quantityExported,
                                pendingOutQuantity: batchBox.pendingOutQuantity + boxDetail.quantityExported,
                            },
                            {
                                where: { boxID: boxDetail.boxID, batchID: element.batchID },
                                transaction,
                            },
                        );
                        // update remainingAcreage of box - REMOVED (items still in box)
                        /*
                        const updateRemainingAcreageBox = await Box.update(
                            {
                                remainingAcreage:
                                    box.remainingAcreage +
                                    boxDetail.quantityExported * unit.width * unit.length * unit.height,
                            },
                            { where: { boxID: boxDetail.boxID }, transaction },
                        );
                        */
                        listResponseBoxDetails.push(resp);
                    }
                    listResponseOrderReleaseDetails.push({
                        orderReleaseDetailID: respOrderReleaseDetail.orderReleaseDetailID,
                        batchID: element.batchID,
                        quantityExported: element.quantityExported,
                        boxDetails: listResponseBoxDetails,
                    });

                    // update số lượng của sản phẩm - REMOVED (items still in warehouse)
                    /*
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
                    */

                    // update product quantity log - REMOVED (will be added on completion)
                    /*
                    await ProductQuantityLog.create(
                        {
                            actionType: 'RELEASE',
                            quantityChange: Number.parseInt(element.quantityExported) * unit.conversionQuantity,
                            previousAmount: product.amount,
                            newAmount:
                                product.amount - Number.parseInt(element.quantityExported) * unit.conversionQuantity,
                            referenceID: orderReleaseID,
                            note: `Xuất kho từ đơn ${orderReleaseID}`,
                            productID: product.productID,
                        },
                        { transaction },
                    );
                    */
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
    async getAllOrderRelease(warehouseID, page = 1) {
        return new Promise(async (resolve, reject) => {
            try {
                const currentPage = page || 1;
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
                                {
                                    model: Batch,
                                    as: 'batch',
                                    include: [
                                        {
                                            model: Product,
                                            as: 'product',
                                            attributes: ['productID', 'productName'],
                                            include: [
                                                {
                                                    model: BaseUnitProduct,
                                                    as: 'baseUnitProducts',
                                                    attributes: ['baseUnitProductID', 'baseUnitName'],
                                                },
                                            ],
                                        },
                                        {
                                            model: Unit,
                                            as: 'unit',
                                            attributes: ['unitName', 'conversionQuantity'],
                                        },
                                    ],
                                },
                            ],
                        },
                    ],
                    limit: LIMIT_PAGE,
                    offset: (page - 1) * LIMIT_PAGE,
                    order: [['createdAt', 'DESC']],
                });
                const totalRecord = await OrderRelease.count({ where: { warehouseID } });
                const totalPages = Math.ceil(totalRecord / LIMIT_PAGE);
                resolve({
                    status: 'OK',
                    statusHttp: HTTP_OK,
                    data: orderReleases,
                    pagination: {
                        currentPage,
                        totalPages,
                    },
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
    async filterOrderRelease(data) {
        return new Promise(async (resolve, reject) => {
            const currentPage = data?.page || 1;
            let whereOption = {};
            if (data.orderReleaseID) whereOption.orderReleaseID = data.orderReleaseID;
            if (data.createdAt) {
                whereOption = {
                    ...whereOption,
                    [Op.and]: [
                        ...(whereOption[Op.and] || []),
                        where(fn('DATE', col('OrderRelease.createdAt')), '=', data.createdAt),
                    ],
                };
            }
            try {
                if (!data.warehouseID) {
                    return reject({
                        status: 'ERROR',
                        statusHttp: HTTP_BAD_REQUEST,
                        message: 'Vui lòng đính kèm mã kho',
                    });
                }
                const warehouse = await Warehouse.findOne({ where: { warehouseID: data.warehouseID } });
                if (!warehouse)
                    return reject({
                        status: 'ERROR',
                        statusHttp: HTTP_BAD_REQUEST,
                        message: 'Kho không tồn tại',
                    });
                const { count, rows: orderReleases } = await OrderRelease.findAndCountAll({
                    distinct: true,
                    where: { ...whereOption },
                    include: [
                        {
                            model: Employee,
                            as: 'employees',
                            attributes: ['employeeID', 'employeeName'],
                            where: {
                                ...(data.createdBy ? { employeeName: { [Op.like]: `%${data.createdBy}%` } } : {}),
                            },
                        },
                        {
                            model: Customer,
                            as: 'customers',
                            attributes: ['customerID', 'customerName'],
                            where: {
                                ...(data.customerName ? { customerName: { [Op.like]: `%${data.customerName}%` } } : {}),
                            },
                        },
                        {
                            model: OrderReleaseDetail,
                            as: 'orderReleaseDetails',
                            include: [
                                {
                                    model: OrderReleaseBatchBoxDetail,
                                    as: 'orderReleaseBatchBoxDetails',
                                },
                                {
                                    model: Batch,
                                    as: 'batch',
                                    include: [
                                        {
                                            model: Product,
                                            as: 'product',
                                            attributes: ['productID', 'productName'],
                                            include: [
                                                {
                                                    model: BaseUnitProduct,
                                                    as: 'baseUnitProducts',
                                                    attributes: ['baseUnitProductID', 'baseUnitName'],
                                                },
                                            ],
                                        },
                                        {
                                            model: Unit,
                                            as: 'unit',
                                            attributes: ['unitName', 'conversionQuantity'],
                                        },
                                    ],
                                },
                            ],
                        },
                    ],
                    limit: LIMIT_PAGE,
                    offset: (currentPage - 1) * LIMIT_PAGE,
                    order: [['createdAt', 'DESC']],
                });

                const totalPages = Math.ceil(count / LIMIT_PAGE);
                resolve({
                    status: 'OK',
                    statusHttp: HTTP_OK,
                    data: orderReleases,
                    pagination: {
                        currentPage,
                        totalPages,
                    },
                    message: 'Lấy danh sách đơn xuất kho thành công',
                });
            } catch (err) {
                console.error('Lọc đơn xuất kho lỗi:', err);
                reject({
                    status: 'ERROR',
                    statusHttp: HTTP_INTERNAL_SERVER_ERROR,
                    message: err.message,
                });
            }
        });
    }
    checkOrderReleaseID(orderReleaseID) {
        return new Promise(async (resolve, reject) => {
            try {
                const orderRelease = await OrderRelease.findOne({
                    where: { orderReleaseID },
                });
                if (orderRelease) {
                    resolve({
                        status: 'OK',
                        statusHttp: HTTP_OK,
                        message: 'Mã phiếu xuất kho đã tồn tại',
                        exists: true,
                    });
                } else {
                    resolve({
                        status: 'OK',
                        statusHttp: HTTP_OK,
                        message: 'Mã phiếu xuất kho chưa tồn tại',
                        exists: false,
                    });
                }
            } catch (err) {
                reject({
                    status: 'ERR',
                    statusHttp: HTTP_INTERNAL_SERVER_ERROR,
                    message: err,
                });
            }
        });
    }

    async getSuggestExport(type, items) {
        return new Promise(async (resolve, reject) => {
            try {
                if (!items || !Array.isArray(items) || items.length === 0) {
                    return reject({
                        status: 'ERROR',
                        statusHttp: HTTP_BAD_REQUEST,
                        message: 'Danh sách sản phẩm không hợp lệ',
                    });
                }

                const suggestions = [];

                for (const item of items) {
                    const { productID, unitID, quantity } = item;
                    let remainingQuantity = Number(quantity);
                    const itemSuggestion = {
                        productID,
                        unitID,
                        quantityRequired: Number(quantity),
                        batches: [],
                    };

                    // 1. Get batches with validAmount > 0, sorted based on type
                    let orderOption = [['expiryDate', 'ASC']]; // Default FEFO
                    if (type === 'FIFO') {
                        orderOption = [['createdAt', 'ASC']];
                    }

                    const batches = await Batch.findAll({
                        where: {
                            productID,
                            unitID,
                            status: 'AVAILABLE',
                            validAmount: { [Op.gt]: 0 },
                        },
                        order: orderOption,
                    });

                    for (const batch of batches) {
                        if (remainingQuantity <= 0) break;

                        // Get boxes for this batch
                        let batchBoxes = await BatchBox.findAll({
                            where: {
                                batchID: batch.batchID,
                                validQuantity: { [Op.gt]: 0 },
                            },
                        });

                        // Sort boxes: BX1 -> BX100
                        batchBoxes.sort((a, b) => {
                            const numA = parseInt(a.boxID.replace(/\D/g, '')) || 0;
                            const numB = parseInt(b.boxID.replace(/\D/g, '')) || 0;
                            return numA - numB;
                        });

                        const batchSuggestion = {
                            batchID: batch.batchID,
                            expiryDate: batch.expiryDate,
                            createdAt: batch.createdAt,
                            boxes: [],
                            quantityExport: 0,
                        };

                        let quantityFromBatch = 0;

                        for (const box of batchBoxes) {
                            if (remainingQuantity <= 0) break;

                            let takeAmount = Math.min(remainingQuantity, box.validQuantity);

                            if (takeAmount > 0) {
                                batchSuggestion.boxes.push({
                                    boxID: box.boxID,
                                    quantity: takeAmount,
                                });

                                remainingQuantity -= takeAmount;
                                quantityFromBatch += takeAmount;
                            }
                        }

                        if (quantityFromBatch > 0) {
                            batchSuggestion.quantityExport = quantityFromBatch;
                            itemSuggestion.batches.push(batchSuggestion);
                        }
                    }
                    suggestions.push(itemSuggestion);
                }

                resolve({
                    status: 'OK',
                    statusHttp: HTTP_OK,
                    message: 'Gợi ý xuất hàng thành công',
                    data: suggestions,
                });
            } catch (err) {
                console.error(err);
                reject({
                    status: 'ERROR',
                    statusHttp: HTTP_INTERNAL_SERVER_ERROR,
                    message: err.message || err,
                });
            }
        });
    }
}

module.exports = new OrderReleaseService();
