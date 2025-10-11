const db = require('../../models');
const dotenv = require('dotenv');
const Customer = db.Customer;
dotenv.config();

const HTTP_OK = process.env.HTTP_OK;
const HTTP_NOT_FOUND = process.env.HTTP_NOT_FOUND;
const HTTP_INTERNAL_SERVER_ERROR = process.env.HTTP_INTERNAL_SERVER_ERROR;
const HTTP_BAD_REQUEST = process.env.HTTP_BAD_REQUEST;

class CustomerService {
    async getAllCustomers() {
        return new Promise(async (resolve, reject) => {
            try {
                const customers = await Customer.findAll();
                resolve({
                    status: 'OK',
                    statusHttp: HTTP_OK,
                    data: customers,
                });
            } catch (error) {
                console.error(error);
                reject({
                    status: 'ERR',
                    statusHttp: HTTP_INTERNAL_SERVER_ERROR,
                    message: 'Không thể lấy danh sách khách hàng',
                });
            }
        });
    }
    async findCustomerById(customerID) {
        return await new Promise(async (resolve, reject) => {
            try {
                const customer = await Customer.findByPk(customerID);
                if (!customer) {
                    reject({
                        status: 'ERR',
                        statusHttp: HTTP_NOT_FOUND,
                        message: 'Khách hàng không tồn tại',
                    });
                    return; 
                }
                resolve({
                    status: 'OK',
                    statusHttp: HTTP_OK,
                    data: customer,
                });
            } catch (error) {
                console.error(error);
                reject({
                    status: 'ERR',
                    statusHttp: HTTP_INTERNAL_SERVER_ERROR,
                    message: 'Lỗi khi lấy thông tin khách hàng',
                });
            }
        });
    }
}

module.exports = new CustomerService();
