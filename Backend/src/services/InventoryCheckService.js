const { Op, where, fn, col } = require('sequelize');
const db = require('../../models');
const InventoryCheck = db.InventoryCheck;
const InventoryCheckDetail = db.InventoryCheckDetail;
const Product = db.Product;
const Employee = db.Employee;
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
                    where: {
                        warehouseID,
                    },
                    include: [
                        {
                            model: Employee,
                            as: 'employee',
                        },
                        {
                            model: InventoryCheckDetail,
                            as: 'details',
                            include: [
                                {
                                    model: Product,
                                    as: 'product',
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
    filterInventoryCheck({ warehouseID, inventoryCheckID, status, createdAt, employeeName, page = 1 }) {
        return new Promise(async (resolve, reject) => {
            const queryEmployee = {};
            const filterOptions = {};
            if (status) {
                filterOptions.status = status;
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
                                    model: Product,
                                    as: 'product',
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
                const { inventoryCheckID, employeeID, warehouseID, status, details } = data;
                const newInventoryCheck = await InventoryCheck.create(
                    {
                        inventoryCheckID,
                        employeeID,
                        warehouseID,
                        status,
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
                        {
                            model: Employee,
                            as: 'employee',
                        },
                        {
                            model: InventoryCheckDetail,
                            as: 'details',
                            include: [
                                {
                                    model: Product,
                                    as: 'product',
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
