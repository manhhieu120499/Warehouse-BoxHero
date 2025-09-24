const db = require('../../models');
const Batch = db.Batch;
const Unit = db.Unit;
const Warehouse = db.Warehouse;
const Product = db.Product;
const BatchBox = db.BatchBox;
const Box = db.Box;
const Floor = db.Floor;
const Shelf = db.Shelf;
const Zone = db.Zone;
const dotenv = require('dotenv');

dotenv.config();

const HTTP_OK = process.env.HTTP_OK;
const HTTP_NOT_FOUND = process.env.HTTP_NOT_FOUND;
const HTTP_BAD_REQUEST = process.env.HTTP_BAD_REQUEST;
const HTTP_UNAUTHORIZED = process.env.HTTP_UNAUTHORIZED;
const HTTP_INTERNAL_SERVER_ERROR = process.env.HTTP_INTERNAL_SERVER_ERROR;

class BatchService {
    findAllBatchUnit(warehouseID, productID) {
        return new Promise(async (resolve, reject) => {
            try {
                const warehouseExist = await Warehouse.findOne({
                    where: { warehouseID },
                });

                if (!warehouseExist)
                    reject({
                        status: 'ERR',
                        statusHttp: HTTP_NOT_FOUND,
                        message: 'Kho không tồn tại',
                    });

                const productExist = await Product.findOne({
                    where: { productID },
                });
                if (!productExist)
                    reject({
                        status: 'ERR',
                        statusHttp: HTTP_NOT_FOUND,
                        message: 'Sản phẩm không tồn tại',
                    });

                const listUnit = await Batch.findAll({
                    where: { productID, warehouseID },
                    include: [
                        {
                            model: Unit,
                            as: 'unit',
                            attributes: ['unitID', 'unitName'],
                        },
                    ],
                });

                const formatListUnit = listUnit.map((item) => {
                    const { unit, ...rest } = item.toJSON();
                    return unit;
                });

                resolve({
                    status: 'OK',
                    statusHttp: HTTP_OK,
                    message: 'Lấy danh sách đơn vị tính theo lô của sản phẩm thành công',
                    units: formatListUnit,
                });
            } catch (err) {
                console.error(err);
                reject({
                    status: 'ERR',
                    statusHttp: HTTP_INTERNAL_SERVER_ERROR,
                    message: err,
                });
            }
        });
    }

    getBatchesWithoutLocation(warehouseID) {
        return new Promise(async (resolve, reject) => {
            try {
                // Kiểm tra warehouse có tồn tại không
                if (warehouseID) {
                    const warehouseExist = await Warehouse.findOne({
                        where: { warehouseID },
                    });

                    if (!warehouseExist) {
                        return reject({
                            status: 'ERR',
                            statusHttp: HTTP_NOT_FOUND,
                            message: 'Kho không tồn tại',
                        });
                    }
                }

                // Lấy danh sách các batch chưa có location (chưa có batch_box)
                const whereCondition = warehouseID ? { warehouseID } : {};

                const batchesWithoutLocation = await Batch.findAll({
                    where: whereCondition,
                    include: [
                        {
                            model: Product,
                            as: 'product',
                            attributes: ['productID', 'productName'],
                        },
                        {
                            model: Unit,
                            as: 'unit',
                            attributes: ['unitID', 'unitName'],
                        },
                        {
                            model: Warehouse,
                            as: 'warehouse',
                            attributes: ['warehouseID', 'warehouseName'],
                        },
                    ],
                    where: {
                        ...whereCondition,
                        batchID: {
                            [db.Sequelize.Op.notIn]: db.sequelize.literal(
                                '(SELECT DISTINCT batchID FROM batch_boxes WHERE batchID IS NOT NULL)',
                            ),
                        },
                    },
                });

                resolve({
                    status: 'OK',
                    statusHttp: HTTP_OK,
                    message: 'Lấy danh sách các batch chưa có location thành công',
                    data: batchesWithoutLocation,
                });
            } catch (err) {
                console.error(err);
                reject({
                    status: 'ERR',
                    statusHttp: HTTP_INTERNAL_SERVER_ERROR,
                    message: err,
                });
            }
        });
    }

    getAvailableBoxes(warehouseID) {
        return new Promise(async (resolve, reject) => {
            try {
                // Kiểm tra warehouse có tồn tại không (nếu có truyền warehouseID)
                if (warehouseID) {
                    const warehouseExist = await Warehouse.findOne({
                        where: { warehouseID },
                    });

                    if (!warehouseExist) {
                        return reject({
                            status: 'ERR',
                            statusHttp: HTTP_NOT_FOUND,
                            message: 'Kho không tồn tại',
                        });
                    }
                }
                let whereCondition = {
                    status: {
                        [db.Sequelize.Op.ne]: 'FULL', // Lấy box có status khác FULL
                    },
                };
                let includeCondition = [
                    {
                        model: Floor,
                        as: 'floor',
                        attributes: ['floorID', 'floorName'],
                        include: [
                            {
                                model: Shelf,
                                as: 'shelf',
                                attributes: ['shelfID', 'shelfName'],
                                include: [
                                    {
                                        model: Zone,
                                        as: 'zone',
                                        attributes: ['zoneID', 'zoneName', 'warehouseID'],
                                        ...(warehouseID && {
                                            where: { warehouseID },
                                        }),
                                    },
                                ],
                            },
                        ],
                    },
                ];

                const availableBoxes = await Box.findAll({
                    where: whereCondition,
                    include: includeCondition,
                    order: [
                        ['remainingAcreage', 'DESC'], // Sắp xếp theo diện tích còn lại giảm dần
                        ['boxName', 'ASC'],
                    ],
                });

                resolve({
                    status: 'OK',
                    statusHttp: HTTP_OK,
                    message: 'Lấy danh sách các box còn chỗ chứa thành công',
                    data: availableBoxes,
                });
            } catch (err) {
                console.error(err);
                reject({
                    status: 'ERR',
                    statusHttp: HTTP_INTERNAL_SERVER_ERROR,
                    message: err,
                });
            }
        });
    }

    getBoxesContainingProduct(productID, warehouseID) {
        return new Promise(async (resolve, reject) => {
            try {
                // Kiểm tra warehouse có tồn tại không
                const warehouseExist = await Warehouse.findOne({
                    where: { warehouseID },
                });

                if (!warehouseExist) {
                    return reject({
                        status: 'ERR',
                        statusHttp: HTTP_NOT_FOUND,
                        message: 'Kho không tồn tại',
                    });
                }

                // Kiểm tra product có tồn tại không
                const productExist = await Product.findOne({
                    where: { productID },
                });

                if (!productExist) {
                    return reject({
                        status: 'ERR',
                        statusHttp: HTTP_NOT_FOUND,
                        message: 'Sản phẩm không tồn tại',
                    });
                }

                // Lấy danh sách box có chứa sản phẩm cụ thể
                const boxesWithProduct = await Box.findAll({
                    include: [
                        {
                            model: Floor,
                            as: 'floor',
                            attributes: ['floorID', 'floorName'],
                            include: [
                                {
                                    model: Shelf,
                                    as: 'shelf',
                                    attributes: ['shelfID', 'shelfName'],
                                    include: [
                                        {
                                            model: Zone,
                                            as: 'zone',
                                            attributes: ['zoneID', 'zoneName', 'warehouseID'],
                                            where: { warehouseID },
                                        },
                                    ],
                                },
                            ],
                        },
                        {
                            model: Batch,
                            as: 'batches',
                            attributes: ['batchID', 'manufactureDate', 'expiryDate', 'remainAmount'],
                            where: {
                                productID,
                                warehouseID,
                            },
                            through: {
                                model: BatchBox,
                                attributes: ['quantity'],
                            },
                            include: [
                                {
                                    model: Product,
                                    as: 'product',
                                    attributes: ['productID', 'productName'],
                                },
                                {
                                    model: Unit,
                                    as: 'unit',
                                    attributes: ['unitID', 'unitName'],
                                },
                            ],
                        },
                    ],
                    order: [
                        // Sắp xếp box theo số trong tên box (ví dụ: "Ô 10" -> lấy số 10)
                        [db.sequelize.literal('CAST(SUBSTRING(boxName, 3) AS UNSIGNED)'), 'ASC'],
                    ],
                });

                resolve({
                    status: 'OK',
                    statusHttp: HTTP_OK,
                    message: 'Lấy danh sách các box có chứa sản phẩm thành công',
                    data: boxesWithProduct,
                });
            } catch (err) {
                console.error(err);
                reject({
                    status: 'ERR',
                    statusHttp: HTTP_INTERNAL_SERVER_ERROR,
                    message: err,
                });
            }
        });
    }

    getBoxDetails(boxID) {
        return new Promise(async (resolve, reject) => {
            try {
                // Lấy thông tin chi tiết của box bao gồm batch và product
                const boxDetails = await Box.findOne({
                    where: { boxID },
                    include: [
                        {
                            model: Floor,
                            as: 'floor',
                            attributes: ['floorID', 'floorName'],
                            include: [
                                {
                                    model: Shelf,
                                    as: 'shelf',
                                    attributes: ['shelfID', 'shelfName'],
                                    include: [
                                        {
                                            model: Zone,
                                            as: 'zone',
                                            attributes: ['zoneID', 'zoneName', 'warehouseID'],
                                            include: [
                                                {
                                                    model: Warehouse,
                                                    as: 'warehouse',
                                                    attributes: ['warehouseID', 'warehouseName'],
                                                },
                                            ],
                                        },
                                    ],
                                },
                            ],
                        },
                        {
                            model: Batch,
                            as: 'batches',
                            attributes: [
                                'batchID',
                                'manufactureDate',
                                'expiryDate',
                                'importAmount',
                                'remainAmount',
                                'status',
                            ],
                            through: {
                                model: BatchBox,
                                attributes: ['quantity'],
                            },
                            include: [
                                {
                                    model: Product,
                                    as: 'product',
                                    attributes: ['productID', 'productName', 'description'],
                                    include: [
                                        {
                                            model: db.Category,
                                            as: 'category',
                                            attributes: ['categoryID', 'categoryName'],
                                        },
                                    ],
                                },
                                {
                                    model: Unit,
                                    as: 'unit',
                                    attributes: ['unitID', 'unitName'],
                                },
                                {
                                    model: db.Supplier,
                                    as: 'supplier',
                                    attributes: ['supplierID', 'supplierName', 'phoneNumber', 'email'],
                                },
                            ],
                        },
                    ],
                });

                if (!boxDetails) {
                    return reject({
                        status: 'ERR',
                        statusHttp: HTTP_NOT_FOUND,
                        message: 'Box không tồn tại',
                    });
                }

                resolve({
                    status: 'OK',
                    statusHttp: HTTP_OK,
                    message: 'Lấy thông tin box thành công',
                    data: boxDetails,
                });
            } catch (err) {
                console.error(err);
                reject({
                    status: 'ERR',
                    statusHttp: HTTP_INTERNAL_SERVER_ERROR,
                    message: err,
                });
            }
        });
    }
}

module.exports = new BatchService();
