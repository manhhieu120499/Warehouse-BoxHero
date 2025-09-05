const db = require('../../models/index');
const OrderPurchaseMissing = db.OrderPurchaseMissing;
const OrderPurchaseMissingDetail = db.OrderPurchaseMissingDetail;
const Batch = db.Batch;
const OrderPurchaseDetail = db.OrderPurchaseDetail;
const OrderPurchase = db.OrderPurchase;
const Product = db.Product;
const Employee = db.Employee;
const Unit = db.Unit;
const dotenv = require('dotenv');

dotenv.config();

const HTTP_OK = process.env.HTTP_OK;
const HTTP_NOT_FOUND = process.env.HTTP_NOT_FOUND;
const HTTP_BAD_REQUEST = process.env.HTTP_BAD_REQUEST;
const HTTP_UNAUTHORIZED = process.env.HTTP_UNAUTHORIZED;

class OrderPurchaseMissingService {
    getAllOrderPurchaseMissing() {
        return new Promise(async (resolve, reject) => {
            try {
                const orderPurchaseMissingFind = await OrderPurchaseMissing.findAll({
                    include: [
                        {
                            model: OrderPurchaseMissingDetail,
                            as: 'orderPurchaseMissingDetails',
                            include: [
                                {
                                    model: OrderPurchaseDetail,
                                    as: 'orderPurchaseDetail',
                                    include: [
                                        {
                                            model: Batch,
                                            as: 'batch',
                                            include: [
                                                {
                                                    model: Product,
                                                    as: 'product',
                                                },
                                            ],
                                        },
                                    ],
                                },
                            ],
                        },
                    ],
                });
                resolve({
                    status: 'OK',
                    statusHttp: HTTP_OK,
                    data: orderPurchaseMissingFind,
                });
            } catch (e) {
                console.log(e);
                reject(e);
            }
        });
    }

    filterOrderPurchaseMissing(query) {
        return new Promise(async (resolve, reject) => {
            try {
                const { warehouseID, employeeID, ...rest } = query;
                const queryEmployee = {};
                if (employeeID) {
                    queryEmployee.employeeID = employeeID;
                }
                const orderPurchaseMissingFind = await OrderPurchaseMissing.findAll({
                    where: {
                        ...rest,
                    },
                    include: [
                        {
                            model: OrderPurchase,
                            attributes: ['orderPurchaseID', 'warehouseID'],
                            as: 'orderPurchase',
                            where: { warehouseID },
                            include: [
                                {
                                    model: Employee,
                                    as: 'employee',
                                    where: queryEmployee,
                                },
                            ],
                        },
                        {
                            model: OrderPurchaseMissingDetail,
                            as: 'orderPurchaseMissingDetails',
                            include: [
                                {
                                    model: OrderPurchaseDetail,
                                    as: 'orderPurchaseDetail',
                                    include: [
                                        {
                                            model: Batch,
                                            as: 'batch',
                                            include: [
                                                {
                                                    model: Product,
                                                    as: 'product',
                                                },
                                                {
                                                    model: Unit,
                                                    as: 'unit',
                                                },
                                            ],
                                        },
                                    ],
                                },
                            ],
                        },
                    ],
                });
                resolve({
                    status: 'OK',
                    statusHttp: HTTP_OK,
                    data: orderPurchaseMissingFind,
                });
            } catch (e) {
                console.log(e);
                reject(e);
            }
        });
    }
}

module.exports = new OrderPurchaseMissingService();
