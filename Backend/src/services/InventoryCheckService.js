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
    findAll({ warehouseID }) {
        return new Promise(async (resolve, reject) => {
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
}

module.exports = new InventoryCheckService();
