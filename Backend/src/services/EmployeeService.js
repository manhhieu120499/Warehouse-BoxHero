const { Op } = require('sequelize');
const db = require('../../models');
const dotenv = require('dotenv');
const Employee = db.Employee;
const Account = db.Account;
const Role = db.Role;

dotenv.config();

const HTTP_OK = process.env.HTTP_OK;
const HTTP_NOT_FOUND = process.env.HTTP_NOT_FOUND;
const HTTP_INTERNAL_SERVER_ERROR = process.env.HTTP_INTERNAL_SERVER_ERROR;
const HTTP_BAD_REQUEST = process.env.HTTP_BAD_REQUEST

class EmployeeService {
    findEmployee(employeeID) {
        return new Promise(async (resolve, reject) => {
            try {
                const employee = await Employee.findOne({
                    where: { employeeID },
                    include: [
                        {
                            model: Account,
                            as: 'account',
                            include: {
                                model: Role,
                                as: 'roles',
                                through: {attributes: []}
                            }
                        },
                    ],
                });

                const { account, ...response } = employee.toJSON();

                if (employee)
                    resolve({
                        status: 'OK',
                        statusHttp: HTTP_OK,
                        message: 'Lấy nhân viên thành công',
                        employee: {
                            ...response,
                            statusWork: account.statusWork,
                        },
                    });
                else {
                    reject({
                        status: 'OK',
                        statusHttp: HTTP_NOT_FOUND,
                        message: 'Nhân viên không tồn tại',
                    });
                }
            } catch (err) {
                reject({
                    status: 'ERR',
                    statusHttp: HTTP_INTERNAL_SERVER_ERROR,
                    message: err,
                });
            }
        });
    }
    findAllEmployee(adminId) {
        return new Promise(async (resolve, reject) => {
            try {
                const employees = await Employee.findAll({
                    where: {
                        employeeID: {[Op.ne]: adminId}
                    },
                    include: [
                        {
                            model: Account,
                            as: 'account',
                            include: [
                                {
                                    model: Role,
                                    as: 'roles',
                                    through: {attributes: []}
                                },
                            ],
                        },
                    ],
                });
                const responseEmployee = []
                employees.forEach(emp => {
                     const {account, ...response} = emp.toJSON()
                     const {roles, ...restAccount} = account
                     responseEmployee.push({...response, statusWork: account.statusWork, roles})
                })

                resolve({
                    status: 'OK',
                    statusHttp: HTTP_OK,
                    message: 'Lấy danh sách nhân viên thành công',
                    employees: responseEmployee,
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
    updateEmployee(employee) {
        return new Promise(async (resolve, reject) => {
            const transaction = await sequelize.transaction()
            try{
                const {employeeID,
                        employeeName,
                        image,
                        cccd,
                        dob,
                        phoneNumber,
                        gender,
                        address,
                        startDate,
                        endDate,
                        statusWork,
                        warehouseID} = employee
                let updateEmployee = {
                        employeeID,
                        employeeName,
                        image,
                        cccd,
                        dob,
                        phoneNumber,
                        gender,
                        address,
                        startDate,
                        statusWork,
                        warehouseID
                }
                const checkExist = await Employee.findOne({
                    where: {employeeID}
                })
                if(!checkExist) {
                    resolve({
                        status: 'ERR',
                        statusHttp: HTTP_NOT_FOUND,
                        message: 'Nhân viên không tồn tại'
                    })
                }
                if(statusWork == 'inactive') {
                    if(!endDate) {
                        resolve({
                        status: 'ERR',
                        statusHttp: HTTP_BAD_REQUEST,
                        message: 'Ngày kết thúc bắt buộc khi nhân viên nghỉ việc'
                    }) }else {
                        updateEmployee.endDate = endDate
                        // update account
                    }
                }
                const updateResponse = await Employee.update({
                        employeeID,
                        employeeName,
                        image,
                        cccd,
                        dob,
                        phoneNumber,
                        gender,
                        address,
                        startDate,
                        warehouseID
                })
                await transaction.commit()
            }catch(err) {
                await transaction.rollback()
                reject({
                    status: 'ERR',
                    statusHttp: HTTP_INTERNAL_SERVER_ERROR,
                    message: err,
                })
                
            }
        })
    }
}

module.exports = new EmployeeService();
