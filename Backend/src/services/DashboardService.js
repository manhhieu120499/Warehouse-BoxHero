const { fn, col, literal, Op } = require('sequelize');
const db = require('../../models/index');
const ProductBaseline = db.ProductBaseline;
const dotenv = require('dotenv');

dotenv.config();

const HTTP_OK = process.env.HTTP_OK;
const HTTP_NOT_FOUND = process.env.HTTP_NOT_FOUND;
const HTTP_BAD_REQUEST = process.env.HTTP_BAD_REQUEST;
const HTTP_UNAUTHORIZED = process.env.HTTP_UNAUTHORIZED;
const HTTP_INTERNAL_SERVER_ERROR = process.env.HTTP_INTERNAL_SERVER_ERROR;

class DashboardService {
    async getStatisticalInventory({ type, year }) {
        return new Promise(async (resolve, reject) => {
            try {
                let data;
                if (type === 'MONTH') {
                    data = await ProductBaseline.findAll({
                        attributes: ['month', [db.sequelize.fn('SUM', db.sequelize.col('quantity')), 'totalQuantity']],
                        where: { year },
                        group: ['month'],
                        order: [['month', 'ASC']],
                        raw: true,
                    });
                    return resolve({
                        statusHttp: HTTP_OK,
                        status: 'OK',
                        message: `Thống kê tổng số lượng tồn theo tháng trong năm ${year}`,
                        data,
                    });
                } else if (type === 'YEAR') {
                    // Lấy 5 năm gần nhất
                    const currentYear = new Date().getFullYear();
                    const startYear = currentYear - 4;
                    data = await ProductBaseline.findAll({
                        attributes: ['year', [db.Sequelize.fn('SUM', db.Sequelize.col('quantity')), 'totalQuantity']],
                        where: {
                            year: { [db.Sequelize.Op.between]: [startYear, currentYear] },
                        },
                        group: ['year'],
                        order: [['year', 'ASC']],
                        raw: true,
                    });
                    return resolve({
                        statusHttp: HTTP_OK,
                        status: 'OK',
                        message: `Thống kê tổng số lượng tồn trong 5 năm gần nhất (${startYear}-${currentYear})`,
                        data,
                    });
                }
            } catch (e) {
                console.log(e);
                return reject({
                    statusHttp: HTTP_INTERNAL_SERVER_ERROR,
                    status: 'ERR',
                    message: 'Lỗi hệ thống',
                });
            }
        });
    }
    async getStatisticalImportExport({ type, year }) {
        return new Promise(async (resolve, reject) => {
            try {
                let importData, exportData, data;
                if (type === 'MONTH') {
                    // --- Nhập (OrderPurchaseDetail) ---
                    importData = await db.OrderPurchaseDetail.findAll({
                        attributes: [
                            [fn('MONTH', col('OrderPurchaseDetail.createdAt')), 'month'],
                            [fn('SUM', literal('actualQuantity * `batch->unit`.`conversionQuantity`')), 'totalImport'],
                        ],
                        include: [
                            {
                                model: db.OrderPurchase,
                                attributes: [],
                                where: { status: 'COMPLETED' },
                            },
                            {
                                model: db.Batch,
                                as: 'batch',
                                attributes: [],
                                include: [
                                    {
                                        model: db.Unit,
                                        as: 'unit',
                                        attributes: [],
                                        required: false,
                                    },
                                ],
                            },
                        ],
                        where: literal(`YEAR(OrderPurchaseDetail.createdAt) = ${year}`),
                        group: ['month'],
                        order: [[literal('month'), 'ASC']],
                        raw: true,
                    });

                    // --- Xuất (OrderReleaseDetail) ---
                    exportData = await db.OrderReleaseDetail.findAll({
                        attributes: [
                            [fn('MONTH', col('OrderReleaseDetail.createdAt')), 'month'],
                            [
                                fn('SUM', literal('quantityExported * `batch->unit`.`conversionQuantity`')),
                                'totalExport',
                            ],
                        ],
                        include: [
                            {
                                model: db.OrderRelease,
                                as: 'orderRelease',
                                attributes: [],
                            },
                            {
                                model: db.Batch,
                                as: 'batch',
                                attributes: [],
                                include: [
                                    {
                                        model: db.Unit,
                                        as: 'unit',
                                        attributes: [],
                                        required: false,
                                    },
                                ],
                            },
                        ],
                        where: literal(`YEAR(OrderReleaseDetail.createdAt) = ${year}`),
                        group: ['month'],
                        order: [[literal('month'), 'ASC']],
                        raw: true,
                    });
                    // Gộp dữ liệu
                    data = Array.from({ length: 12 }, (_, i) => {
                        const month = i + 1;
                        const importItem = importData.find((item) => item.month == month);
                        const exportItem = exportData.find((item) => item.month == month);
                        return {
                            date: month,
                            import: importItem ? Number(importItem.totalImport) : 0,
                            export: exportItem ? Number(exportItem.totalExport) : 0,
                        };
                    });
                    return resolve({
                        statusHttp: HTTP_OK,
                        status: 'OK',
                        message: `Thống kê số lượng nhập - xuất theo tháng trong năm ${year}`,
                        data,
                    });
                } else if (type === 'YEAR') {
                    const currentYear = new Date().getFullYear();
                    const startYear = currentYear - 4;

                    // --- Nhập ---
                    importData = await db.OrderPurchaseDetail.findAll({
                        attributes: [
                            [fn('YEAR', col('OrderPurchaseDetail.createdAt')), 'year'],
                            [fn('SUM', literal('actualQuantity * `batch->unit`.`conversionQuantity`')), 'totalImport'],
                        ],
                        include: [
                            {
                                model: db.OrderPurchase,
                                attributes: [],
                                where: { status: 'COMPLETED' },
                            },
                            {
                                model: db.Batch,
                                as: 'batch',
                                attributes: [],
                                include: [
                                    {
                                        model: db.Unit,
                                        as: 'unit',
                                        attributes: [],
                                        required: false,
                                    },
                                ],
                            },
                        ],
                        where: {
                            createdAt: {
                                [Op.between]: [new Date(`${startYear}-01-01`), new Date(`${currentYear}-12-31`)],
                            },
                        },
                        group: ['year'],
                        order: [[literal('year'), 'ASC']],
                        raw: true,
                    });

                    // --- Xuất ---
                    exportData = await db.OrderReleaseDetail.findAll({
                        attributes: [
                            [fn('YEAR', col('OrderReleaseDetail.createdAt')), 'year'],
                            [
                                fn('SUM', literal('quantityExported * `batch->unit`.`conversionQuantity`')),
                                'totalExport',
                            ],
                        ],
                        include: [
                            {
                                model: db.OrderRelease,
                                as: 'orderRelease',
                                attributes: [],
                            },
                            {
                                model: db.Batch,
                                as: 'batch',
                                attributes: [],
                                include: [
                                    {
                                        model: db.Unit,
                                        as: 'unit',
                                        attributes: [],
                                        required: false,
                                    },
                                ],
                            },
                        ],
                        where: {
                            createdAt: {
                                [Op.between]: [new Date(`${startYear}-01-01`), new Date(`${currentYear}-12-31`)],
                            },
                        },
                        group: ['year'],
                        order: [[literal('year'), 'ASC']],
                        raw: true,
                    });

                    // Gộp dữ liệu
                    data = Array.from({ length: 5 }, (_, i) => {
                        const y = startYear + i;
                        const importItem = importData.find((item) => item.year == y);
                        const exportItem = exportData.find((item) => item.year == y);
                        return {
                            date: y,
                            import: importItem ? Number(importItem.totalImport) : 0,
                            export: exportItem ? Number(exportItem.totalExport) : 0,
                        };
                    });

                    return resolve({
                        statusHttp: HTTP_OK,
                        status: 'OK',
                        message: `Thống kê số lượng nhập - xuất trong 5 năm gần nhất (${startYear}-${currentYear})`,
                        data,
                    });
                }
            } catch (e) {
                console.log(e);
                return reject({
                    statusHttp: HTTP_INTERNAL_SERVER_ERROR,
                    status: 'ERR',
                    message: 'Lỗi hệ thống',
                });
            }
        });
    }
}

module.exports = new DashboardService();
