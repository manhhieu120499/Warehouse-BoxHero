const db = require('../../models');
const { Op } = require('sequelize');
const Warehouse = db.Warehouse;
const Product = db.Product;
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

class BatchBoxService {
    suggestBoxes(data) {
        return new Promise(async (resolve, reject) => {
            try {
                const { warehouseID, productID } = data;
                const warehouseExist = await Warehouse.findOne({ where: { warehouseID } });
                if (!warehouseExist) {
                    return reject({
                        status: 'ERR',
                        statusHttp: HTTP_NOT_FOUND,
                        message: 'Kho không tồn tại',
                    });
                }

                // 2. Kiểm tra sản phẩm tồn tại
                const productExist = await Product.findOne({ where: { productID } });
                if (!productExist) {
                    return reject({
                        status: 'ERR',
                        statusHttp: HTTP_NOT_FOUND,
                        message: 'Sản phẩm không tồn tại',
                    });
                }
                // 3. Lấy danh sách box khả dụng
                const candidateBoxes = await Box.findAll({
                    where: {
                        status: { [Op.in]: ['AVAILABLE', 'RESERVED'] },
                    },
                    include: [
                        {
                            model: Floor,
                            as: 'floor',
                            include: [
                                {
                                    model: Shelf,
                                    as: 'shelf',
                                    include: [
                                        {
                                            model: Zone,
                                            as: 'zone',
                                            where: { warehouseID },
                                        },
                                    ],
                                },
                            ],
                        },
                    ],
                });

                if (!candidateBoxes.length) {
                    return resolve({
                        status: 'OK',
                        statusHttp: HTTP_OK,
                        message: 'Không tìm thấy box nào phù hợp',
                        boxes: [],
                    });
                }
                resolve({
                    status: 'OK',
                    statusHttp: HTTP_OK,
                    message: 'Gợi ý vị trí box thành công',
                    boxes: candidateBoxes,
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

module.exports = new BatchBoxService();
