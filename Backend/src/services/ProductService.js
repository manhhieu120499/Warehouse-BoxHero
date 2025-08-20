const dotenv = require('dotenv');
const db = require('../../models');
const Product = db.Product;
const Batch = db.Batch;
const Box = db.Box;
const Floor = db.Floor;
const Shelf = db.Shelf;
const Zone = db.Zone;
const Category = db.Category;
dotenv.config();

const HTTP_OK = process.env.HTTP_OK;
const HTTP_NOT_FOUND = process.env.HTTP_NOT_FOUND;
const HTTP_BAD_REQUEST = process.env.HTTP_BAD_REQUEST;
const HTTP_UNAUTHORIZED = process.env.HTTP_UNAUTHORIZED;
const HTTP_INTERNAL_SERVER_ERROR = process.env.HTTP_INTERNAL_SERVER_ERROR;

class ProductService {
    findProductById(productID, warehouseID) {
        return new Promise(async (resolve, reject) => {
            console.log('----', warehouseID);
            try {
                // tìm sản phẩm kèm tất cả các lô của sản phẩm
                const product = await Product.findOne({
                    where: { productID },
                    include: [
                        {
                            model: Batch,
                            as: 'batches',
                        },
                    ],
                });

                const { batches, ...restProduct } = product.toJSON();
                const filterBatch = batches.filter((item) => item.warehouseID == warehouseID);

                // tìm tất cả vị trí các lô của sản phẩm trong kho
                const listBatch = await Promise.all(
                    filterBatch.map((item) =>
                        Batch.findOne({
                            where: { batchID: item.batchID },
                            include: [
                                {
                                    model: Box,
                                    as: 'boxes',
                                    attributes: ['boxID', 'boxName'],
                                    through: { attributes: [], as: 'Batch_Boxes' },
                                    include: [
                                        {
                                            model: Floor,
                                            attributes: ['floorID', 'floorName'],
                                            include: [
                                                {
                                                    model: Shelf,
                                                    attributes: ['shelfID', 'shelfName'],
                                                    include: [
                                                        {
                                                            model: Zone,
                                                            attributes: ['zoneID', 'zoneName', 'warehouseID'],
                                                        },
                                                    ],
                                                },
                                            ],
                                        },
                                    ],
                                },
                            ],
                        }),
                    ),
                );

                if (!product)
                    resolve({
                        status: 'OK',
                        statusHttp: HTTP_NOT_FOUND,
                        message: 'Sản phẩm không tồn tại',
                    });
                if (listBatch) {
                    const formatBatchResponse = listBatch.map((item) => {
                        const { boxes, ...restBatch } = item.toJSON();
                        const locationBatch = boxes.map((boxItem) => {
                            const { boxID, boxName } = boxItem;
                            const { floorName } = boxItem.Floor;
                            const { shelfName } = boxItem.Floor.Shelf;
                            const { zoneName } = boxItem.Floor.Shelf.Zone;
                            return {
                                boxID,
                                boxName,
                                location: `${boxName} - ${floorName} - ${shelfName} - ${zoneName}`,
                            };
                        });
                        return {
                            ...restBatch,
                            locationBatch,
                        };
                    });

                    resolve({
                        status: 'OK',
                        statusHttp: HTTP_OK,
                        message: 'Lấy thông tin sản phẩm thành công',
                        product: {
                            ...restProduct,
                            batches: formatBatchResponse,
                        },
                    });
                    console.log('3');
                }
                console.log(4);
            } catch (err) {
                reject({
                    status: 'ERR',
                    statusHttp: HTTP_INTERNAL_SERVER_ERROR,
                    message: err,
                });
            }
        });
    }
    findAllProduct() {
        return new Promise(async (resolve, reject) => {
            try {
                const products = await Product.findAll({
                    include: [
                        {
                            model: Category,
                            as: 'category',
                            attributes: ['categoryID', 'categoryName'],
                        },
                    ],
                });
                resolve({
                    status: 'OK',
                    statusHttp: HTTP_OK,
                    message: 'Lấy danh sách sản phẩm thành công',
                    products,
                });
            } catch (err) {
                reject({
                    status: 'ERR',
                    statusHttp: HTTP_INTERNAL_SERVER_ERROR,
                    message: err,
                });
                console.log(err);
            }
        });
    }
    searchProduct(productID, productName, categoryID, minStock) {
        return new Promise(async (resolve, reject) => {
            try {
                //console.log(minStock)
                let where = {};
                if (productID) where.productID = { [Op.like]: `%${productID}%` };
                if (productName) where.productName = { [Op.like]: `%${productName}%` };
                if (minStock) where.minStock = minStock;
                const resultSearch = await Product.findAll({
                    where,
                });
                resolve({
                    status: 'OK',
                    statusHttp: HTTP_OK,
                    message: 'Tìm kiếm thành công',
                    products: resultSearch,
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
}

module.exports = new ProductService();
