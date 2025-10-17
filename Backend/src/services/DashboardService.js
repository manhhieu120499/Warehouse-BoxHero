const { fn, col, literal, Op } = require('sequelize');
const db = require('../../models/index');
const ProductBaseline = db.ProductBaseline;
const Warehouse = db.Warehouse;
const Box = db.Box;
const Product = db.Product;
const Category = db.Category;
const Batch = db.Batch;
const dotenv = require('dotenv');

dotenv.config();

const HTTP_OK = process.env.HTTP_OK;
const HTTP_NOT_FOUND = process.env.HTTP_NOT_FOUND;
const HTTP_BAD_REQUEST = process.env.HTTP_BAD_REQUEST;
const HTTP_UNAUTHORIZED = process.env.HTTP_UNAUTHORIZED;
const HTTP_INTERNAL_SERVER_ERROR = process.env.HTTP_INTERNAL_SERVER_ERROR;

const LIMIT_TOP_PRODUCT = 5;

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
    async getStatisticalPercentUsedWarehouse(data) {
        return new Promise(async (resolve, reject) => {
            try {
                const { warehouseID } = data;
                const existWarehouse = await Warehouse.findOne({ where: { warehouseID } });
                if (!existWarehouse) {
                    return reject({
                        statusHttp: HTTP_NOT_FOUND,
                        status: 'ERR',
                        message: 'Kho hàng không tồn tại',
                    });
                }

                const result = await Box.findAll({
                    attributes: [
                        [fn('SUM', col('remainingAcreage')), 'totalRemaining'],
                        [fn('SUM', col('maxAcreage')), 'totalMax'],
                    ],
                    raw: true,
                });
                const { totalRemaining, totalMax } = result[0];

                resolve({
                    statusHttp: HTTP_OK,
                    status: 'OK',
                    message: 'Thống kê kho hàng',
                    data: {
                        totalRemain: { name: 'Còn trống', percent: (totalRemaining / totalMax) * 100 },
                        percentUsed: {
                            name: 'Đã sử dụng',
                            percent: totalMax ? ((totalMax - totalRemaining) / totalMax) * 100 : 0,
                        },
                    },
                });
            } catch (err) {
                console.log(err);
                return reject({
                    statusHttp: HTTP_INTERNAL_SERVER_ERROR,
                    status: 'ERR',
                    message: 'Lỗi hệ thống',
                });
            }
        });
    }
    // Thống kê sản phẩm xuất kho nhiều nhất (top 5)
    async getStaticTopProductExportInWarehouse() {
        return new Promise(async (resolve, reject) => {
            try {
                const result = await ExportDetail.findAll({
                    include: [
                        {
                            model: Batch,
                            attributes: ['batchID', 'productID'],
                            include: [
                                {
                                    model: Product,
                                    attributes: ['productID', 'productName'],
                                },
                            ],
                        },
                    ],
                    attributes: [
                        [Sequelize.col('Batch.Product.productID'), 'productID'],
                        [Sequelize.fn('SUM', Sequelize.col('exportQty')), 'totalExportQty'],
                    ],
                    group: ['Batch.Product.productID', 'Batch.Product.productName'],
                    order: [[Sequelize.literal('totalExportQty'), 'DESC']],
                    limit: 1,
                    //raw: true,
                });
            } catch (err) {
                console.log(err);
                return reject({
                    statusHttp: HTTP_INTERNAL_SERVER_ERROR,
                    status: 'ERR',
                    message: 'Lỗi hệ thống',
                });
            }
        });
    }
    async getStaticProductHasLowStock(data) {
        return new Promise(async (resolve, reject) => {
            try {
                const { page = 1 } = data;
                const result = await Product.findAll({
                    where: {
                        amount: {
                            [Op.lte]: col('minStock'),
                        },
                    },
                    include: [
                        {
                            model: Category,
                            as: 'category',
                            attributes: ['categoryID', 'categoryName'],
                        },
                    ],

                    order: [['amount', 'ASC']],
                    // limit: 5,
                    // offset: (page - 1) * LIMIT_TOP_PRODUCT,
                    //raw: true, // trải phẳng object
                });
                resolve({
                    statusHttp: HTTP_OK,
                    status: 'OK',
                    message: 'Thống kê sản phẩm sắp hết hàng',
                    data: result,
                });
            } catch (err) {
                console.log(err);
                return reject({
                    statusHttp: HTTP_INTERNAL_SERVER_ERROR,
                    status: 'ERR',
                    message: 'Lỗi hệ thống',
                });
            }
        });
    }
    async getAllProductOld() {
        return new Promise(async (resolve, reject) => {
            try {
                const leastExportedProducts = await Product.findAll({
                    attributes: [
                        'productID',
                        'productName',
                        [fn('SUM', col('Batch.OrderReleaseDetails.quantityExported')), 'totalExported'],
                    ],
                    include: [
                        {
                            model: Batch,
                            as: 'Batches',
                            attributes: [],
                            include: [
                                {
                                    model: OrderReleaseDetail,
                                    as: 'OrderReleaseDetails',
                                    attributes: [],
                                },
                            ],
                        },
                    ],
                    group: ['Product.productID'],
                    order: [[literal('totalExported'), 'ASC']], // xuất ít nhất → sắp xếp tăng
                    limit: 5, // lấy 10 sản phẩm xuất ít nhất
                });
            } catch (err) {
                console.log(err);
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
