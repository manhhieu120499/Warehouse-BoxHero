const { Op, where, fn, col, Sequelize } = require('sequelize');
const db = require('../../models');
const InventoryCheck = db.InventoryCheck;
const InventoryCheckDetail = db.InventoryCheckDetail;
const Product = db.Product;
const Employee = db.Employee;
const BatchBox = db.BatchBox;
const ProductQuantityLog = db.ProductQuantityLog;
const Batch = db.Batch;
const Box = db.Box;
const Unit = db.Unit;
const Floor = db.Floor;
const Shelf = db.Shelf;
const dotenv = require('dotenv');

dotenv.config();

const HTTP_OK = process.env.HTTP_OK;
const HTTP_NOT_FOUND = process.env.HTTP_NOT_FOUND;
const HTTP_BAD_REQUEST = process.env.HTTP_BAD_REQUEST;
const HTTP_INTERNAL_SERVER_ERROR = process.env.HTTP_INTERNAL_SERVER_ERROR;

class InventoryCheckService {
    findAll({ warehouseID, page = 1 }) {
        return new Promise(async (resolve, reject) => {
            const LIMIT_PAGE = 5;
            try {
                const response = await InventoryCheck.findAll({
                    where: { warehouseID },
                    include: [
                        { model: Employee, as: 'employee' },
                        {
                            model: InventoryCheckDetail,
                            as: 'details',
                            include: [
                                {
                                    model: BatchBox,
                                    as: 'batchBoxByBatch',
                                    required: false,
                                    on: {
                                        [Op.and]: [
                                            db.sequelize.where(
                                                db.sequelize.col('details.batchID'),
                                                '=',
                                                db.sequelize.col('details->batchBoxByBatch.batchID'),
                                            ),
                                            db.sequelize.where(
                                                db.sequelize.col('details.boxID'),
                                                '=',
                                                db.sequelize.col('details->batchBoxByBatch.boxID'),
                                            ),
                                        ],
                                    },
                                    attribute: ['quantity'],
                                    include: [
                                        {
                                            model: Batch,
                                            as: 'batch',
                                            include: [
                                                { model: Product, as: 'product' },
                                                { model: Unit, as: 'unit' },
                                            ],
                                        },
                                        {
                                            model: Box,
                                            as: 'box',
                                            include: [
                                                { model: Floor, as: 'floor', include: [{ model: Shelf, as: 'shelf' }] },
                                            ],
                                        },
                                    ],
                                },
                            ],
                        },
                    ],
                    order: [['createdAt', 'DESC']],
                    offset: (page - 1) * LIMIT_PAGE,
                    limit: LIMIT_PAGE,
                });

                resolve({
                    status: 'OK',
                    statusHttp: HTTP_OK,
                    message: 'Lấy danh sách kiểm kê thành công',
                    data: response,
                });
            } catch (err) {
                console.log(err);

                reject({
                    status: 'ERR',
                    statusHttp: HTTP_INTERNAL_SERVER_ERROR,
                    message: 'Lỗi hệ thống',
                });
            }
        });
    }
    filterInventoryCheck({ warehouseID, inventoryCheckID, status, checkStatus, createdAt, employeeName, page = 1 }) {
        return new Promise(async (resolve, reject) => {
            const queryEmployee = {};
            const filterOptions = {};
            if (status) {
                filterOptions.status = status;
            }
            if (checkStatus) {
                filterOptions.checkStatus = checkStatus;
            }
            if (inventoryCheckID) {
                filterOptions.inventoryCheckID = inventoryCheckID;
            }
            if (employeeName) {
                queryEmployee.employeeName = { [Op.like]: `%${employeeName}%` };
            }
            const date = {};
            if (createdAt)
                date.createdAt = {
                    [Op.and]: [
                        where(fn('DATE', col('InventoryCheck.createdAt')), {
                            [Op.eq]: createdAt, // ngày bắt đầu
                        }),
                    ],
                };
            const LIMIT_PAGE = 5;
            try {
                const response = await InventoryCheck.findAll({
                    where: {
                        warehouseID,
                        ...date,
                        ...filterOptions,
                    },
                    include: [
                        {
                            model: Employee,
                            as: 'employee',
                            where: queryEmployee,
                        },
                        {
                            model: InventoryCheckDetail,
                            as: 'details',
                            include: [
                                {
                                    model: BatchBox,
                                    as: 'batchBoxByBatch',
                                    required: false,
                                    on: {
                                        [Op.and]: [
                                            db.sequelize.where(
                                                db.sequelize.col('details.batchID'),
                                                '=',
                                                db.sequelize.col('details->batchBoxByBatch.batchID'),
                                            ),
                                            db.sequelize.where(
                                                db.sequelize.col('details.boxID'),
                                                '=',
                                                db.sequelize.col('details->batchBoxByBatch.boxID'),
                                            ),
                                        ],
                                    },
                                    attribute: ['quantity'],
                                    include: [
                                        {
                                            model: Batch,
                                            as: 'batch',
                                            include: [
                                                { model: Product, as: 'product' },
                                                { model: Unit, as: 'unit' },
                                            ],
                                        },
                                        {
                                            model: Box,
                                            as: 'box',
                                            include: [{ model: Floor, as: 'floor' }],
                                        },
                                    ],
                                },
                            ],
                        },
                    ],
                    order: [['createdAt', 'DESC']],
                    offset: (page - 1) * LIMIT_PAGE,
                    limit: LIMIT_PAGE,
                });
                resolve({
                    status: 'OK',
                    statusHttp: HTTP_OK,
                    message: 'Lấy danh sách kiểm kê thành công',
                    data: response,
                });
            } catch (err) {
                console.log(err);

                reject({
                    status: 'ERR',
                    statusHttp: HTTP_INTERNAL_SERVER_ERROR,
                    message: 'Lỗi hệ thống',
                });
            }
        });
    }

    createInventoryCheck(data) {
        return new Promise(async (resolve, reject) => {
            const transaction = await db.sequelize.transaction();
            try {
                const { inventoryCheckID, employeeID, warehouseID, checkStatus, details } = data;
                const newInventoryCheck = await InventoryCheck.create(
                    {
                        inventoryCheckID,
                        employeeID,
                        warehouseID,
                        status: 'PENDING',
                        checkStatus,
                    },
                    { transaction },
                );

                const inventoryDetailConvert = details.map((item) => {
                    let status = 'MATCHED';
                    if (item.discrepancyQuantity > 0) {
                        status = 'SURPLUS';
                    } else if (item.discrepancyQuantity < 0) {
                        status = 'SHORTAGE';
                    }
                    return { ...item, status };
                });

                const inventoryCheckDetails = inventoryDetailConvert.map((detail) => ({
                    ...detail,
                    inventoryCheckID: newInventoryCheck.inventoryCheckID,
                }));
                await InventoryCheckDetail.bulkCreate(inventoryCheckDetails, { transaction });

                const createdInventoryCheck = await InventoryCheck.findOne({
                    where: { inventoryCheckID: newInventoryCheck.inventoryCheckID },
                    include: [
                        { model: Employee, as: 'employee' },
                        {
                            model: InventoryCheckDetail,
                            as: 'details',
                            include: [
                                {
                                    model: BatchBox,
                                    as: 'batchBoxByBatch',
                                    attribute: ['quantity'],
                                    include: [
                                        {
                                            model: Batch,
                                            as: 'batch',
                                            include: [
                                                { model: Product, as: 'product' },
                                                { model: Unit, as: 'unit' },
                                            ],
                                        },
                                        {
                                            model: Box,
                                            as: 'box',
                                            include: [{ model: Floor, as: 'floor' }],
                                        },
                                    ],
                                },
                            ],
                        },
                    ],
                });
                await transaction.commit();
                resolve({
                    status: 'OK',
                    statusHttp: HTTP_OK,
                    message: 'Tạo phiếu kiểm kê thành công',
                    data: createdInventoryCheck,
                });
            } catch (err) {
                await transaction.rollback();
                console.log(err);

                reject({
                    status: 'ERR',
                    statusHttp: HTTP_INTERNAL_SERVER_ERROR,
                    message: 'Lỗi hệ thống',
                });
            }
        });
    }

    updateInventoryCheck(data) {
        return new Promise(async (resolve, reject) => {
            const transaction = await db.sequelize.transaction();
            try {
                const { inventoryCheckID, status } = data;
                await InventoryCheck.update({ status }, { where: { inventoryCheckID }, transaction });

                if (status === 'COMPLETED') {
                    const details = await InventoryCheckDetail.findAll({
                        where: { inventoryCheckID },
                        include: [
                            {
                                model: BatchBox,
                                as: 'batchBoxByBatch',
                                required: false,
                                on: {
                                    [Op.and]: [
                                        db.sequelize.where(
                                            db.sequelize.col('InventoryCheckDetail.batchID'),
                                            '=',
                                            db.sequelize.col('batchBoxByBatch.batchID'),
                                        ),
                                        db.sequelize.where(
                                            db.sequelize.col('InventoryCheckDetail.boxID'),
                                            '=',
                                            db.sequelize.col('batchBoxByBatch.boxID'),
                                        ),
                                    ],
                                },
                                attributes: ['quantity'],
                                include: [
                                    {
                                        model: Batch,
                                        as: 'batch',
                                        include: [
                                            { model: Product, as: 'product' },
                                            { model: Unit, as: 'unit' },
                                        ],
                                    },
                                    {
                                        model: Box,
                                        as: 'box',
                                        include: [{ model: Floor, as: 'floor' }],
                                    },
                                ],
                            },
                        ],
                    });

                    for (const detail of details) {
                        const discrepancyQuantity = detail.discrepancyQuantity;
                        const batchBox = detail.batchBoxByBatch;

                        await BatchBox.increment(
                            { quantity: discrepancyQuantity },
                            { where: { batchID: batchBox.batch.batchID, boxID: batchBox.box.boxID }, transaction },
                        );

                        await Batch.increment(
                            { remainAmount: discrepancyQuantity },
                            { where: { batchID: batchBox.batch.batchID }, transaction },
                        );

                        const amountChange = discrepancyQuantity * batchBox.batch.unit.conversionQuantity;
                        await Product.increment(
                            { amount: amountChange },
                            { where: { productID: batchBox.batch.product.productID }, transaction },
                        );
                        const acreage =
                            batchBox.batch.unit.width *
                            batchBox.batch.unit.length *
                            batchBox.batch.unit.height *
                            -discrepancyQuantity;

                        if (amountChange !== 0) {
                            // update product quantity log
                            await ProductQuantityLog.create(
                                {
                                    actionType: 'INVENTORY_CHECK',
                                    quantityChange: Math.abs(amountChange),
                                    previousAmount: batchBox.batch.product.amount,
                                    newAmount: batchBox.batch.product.amount + amountChange,
                                    referenceID: inventoryCheckID,
                                    note: `Điều chỉnh số lượng từ đơn kiểm kê ${inventoryCheckID}`,
                                    productID: batchBox.batch.product.productID,
                                },
                                { transaction },
                            );

                            await Box.increment(
                                { remainingAcreage: acreage },
                                { where: { boxID: batchBox.box.boxID }, transaction },
                            );
                        }
                    }
                }

                await transaction.commit();
                resolve({
                    status: 'OK',
                    statusHttp: HTTP_OK,
                    message: 'Cập nhật phiếu kiểm kê thành công',
                });
            } catch (err) {
                await transaction.rollback();
                console.log(err);

                reject({
                    status: 'ERR',
                    statusHttp: HTTP_INTERNAL_SERVER_ERROR,
                    message: 'Lỗi hệ thống',
                });
            }
        });
    }
}

module.exports = new InventoryCheckService();
