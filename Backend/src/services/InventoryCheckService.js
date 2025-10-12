const { Op, where, fn, col, Sequelize } = require('sequelize');
const db = require('../../models');
const InventoryCheck = db.InventoryCheck;
const InventoryCheckDetail = db.InventoryCheckDetail;
const Product = db.Product;
const Employee = db.Employee;
const BatchBox = db.BatchBox;
const Batch = db.Batch;
const Box = db.Box;
const Unit = db.Unit;
const Floor = db.Floor;
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
                    message: err,
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
                reject({
                    status: 'ERR',
                    statusHttp: HTTP_INTERNAL_SERVER_ERROR,
                    message: err,
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

                const inventoryCheckDetails = details.map((detail) => ({
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
                    message: err,
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

                        await BatchBox.update(
                            { quantity: batchBox.quantity + discrepancyQuantity },
                            { where: { batchID: batchBox.batch.batchID, boxID: batchBox.box.boxID }, transaction },
                        );

                        await Batch.update(
                            { remainAmount: batchBox.batch.remainAmount + discrepancyQuantity },
                            { where: { batchID: batchBox.batch.batchID }, transaction },
                        );

                        const amountChange = discrepancyQuantity * batchBox.batch.unit.conversionQuantity;
                        await Product.update(
                            { amount: batchBox.batch.product.amount + amountChange },
                            { where: { productID: batchBox.batch.product.productID }, transaction },
                        );
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
                    message: err,
                });
            }
        });
    }
}

module.exports = new InventoryCheckService();
