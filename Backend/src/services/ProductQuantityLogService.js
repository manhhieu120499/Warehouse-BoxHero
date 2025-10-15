const db = require('../../models/index');
const ProductQuantityLog = db.ProductQuantityLog;
const OrderPurchase = db.OrderPurchase;
const OrderRelease = db.OrderRelease;
const Employee = db.Employee;
const dotenv = require('dotenv');

dotenv.config();

const HTTP_OK = process.env.HTTP_OK;
const HTTP_NOT_FOUND = process.env.HTTP_NOT_FOUND;
const HTTP_BAD_REQUEST = process.env.HTTP_BAD_REQUEST;
const HTTP_UNAUTHORIZED = process.env.HTTP_UNAUTHORIZED;

class ProductQuantityLogService {
    // get all unit
    getLogByProductID({ productID }) {
        return new Promise(async (resolve, reject) => {
            try {
                const productQuantityLog = await ProductQuantityLog.findAll({
                    where: { productID },
                    order: [['createdAt', 'DESC']],
                });

                for (const log of productQuantityLog) {
                    let employeeName = 'N/A';

                    if (log.actionType === 'PURCHASE') {
                        const order = await OrderPurchase.findOne({
                            where: { orderPurchaseID: log.referenceID },
                            include: [
                                {
                                    model: Employee,
                                    as: 'employee',
                                    attributes: ['employeeName'],
                                },
                            ],
                        });
                        employeeName = order?.employee?.employeeName || 'N/A';
                    } else if (log.actionType === 'RELEASE') {
                        const order = await OrderRelease.findOne({
                            where: { orderReleaseID: log.referenceID },
                            include: [
                                {
                                    model: Employee,
                                    as: 'employees',
                                    attributes: ['employeeName'],
                                },
                            ],
                        });
                        employeeName = order?.employees?.employeeName || 'N/A';
                    } else if (log.actionType === 'INVENTORY_CHECK') {
                        const inventoryCheck = await db.InventoryCheck.findOne({
                            where: { inventoryCheckID: log.referenceID },
                            include: [
                                {
                                    model: Employee,
                                    as: 'employee',
                                    attributes: ['employeeName'],
                                },
                            ],
                        });
                        employeeName = inventoryCheck?.employee?.employeeName || 'N/A';
                    }

                    log.dataValues.employeeName = employeeName;
                }

                resolve({
                    status: 'OK',
                    statusHttp: HTTP_OK,
                    data: productQuantityLog,
                });
            } catch (e) {
                console.error(e);
                reject(e);
            }
        });
    }
}

module.exports = new ProductQuantityLogService();
