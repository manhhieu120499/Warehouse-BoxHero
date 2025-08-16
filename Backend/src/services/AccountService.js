const db = require('../../models/index');
const bcrypt = require('bcrypt');
const { generateAccessToken, generateRefreshToken } = require('./JwtService');
const Account = db.Account;
const Employee = db.Employee;
const AccountRoles = db.AccountRoles;
const Role = db.Role;
const dotenv = require('dotenv');

dotenv.config();

const HTTP_OK = process.env.HTTP_OK;
const HTTP_NOT_FOUND = process.env.HTTP_NOT_FOUND;
const HTTP_BAD_REQUEST = process.env.HTTP_BAD_REQUEST;
const HTTP_UNAUTHORIZED = process.env.HTTP_UNAUTHORIZED;

class AccountService {
    checkEmailExists(email) {
        return new Promise(async (resolve, reject) => {
            try {
                const accountFind = await Account.findAll({
                    where: {
                        email,
                    },
                });
                if (accountFind.length !== 0) {
                    resolve({
                        status: 'OK',
                        statusHttp: HTTP_OK,
                        message: 'Email đã tồn tại',
                        isExists: true,
                    });
                } else {
                    resolve({
                        status: 'OK',
                        statusHttp: HTTP_OK,
                        message: 'Email không tồn tại',
                        isExists: false,
                    });
                }
            } catch (e) {
                console.log(e);
                reject(e);
            }
        });
    }
    createAccount(newAccount) {
        return new Promise(async (resolve, reject) => {
            try {
                const {
                    employeeID,
                    email,
                    password,
                    statusWork,
                    employeeName,
                    cccd,
                    dob,
                    phoneNumber,
                    gender,
                    image,
                    address,
                    startDate,
                    endDate,
                    roles,
                    warehouseID,
                } = newAccount;

                const accountFind = await Account.findAll({
                    where: {
                        email,
                    },
                });
                if (accountFind.length !== 0) {
                    resolve({
                        statusHttp: HTTP_BAD_REQUEST,
                        status: 'ERR',
                        message: 'Email đã tồn tại',
                    });
                } else {
                    const hash = bcrypt.hashSync(password, 10);
                    const employee = await Employee.create({
                        employeeID,
                        employeeName,
                        image,
                        cccd,
                        dob,
                        phoneNumber,
                        gender,
                        address,
                        startDate,
                        endDate,
                        warehouseID,
                    });

                    const account = await Account.create({
                        email,
                        password: hash,
                        statusWork,
                        employeeID: employee.employeeID,
                    });

                    roles.forEach(async (role) => {
                        await AccountRoles.create({
                            accountID: account.accountID,
                            roleId: role.roleID,
                        });
                    });

                    const accessToken = await generateAccessToken({
                        employeeID: employee.employeeID,
                        email: account.email,
                        roles,
                        warehouseID,
                    });

                    const refreshToken = await generateRefreshToken({
                        employeeID: employee.employeeID,
                        email: account.email,
                        roles,
                        warehouseID,
                    });
                    resolve({
                        statusHttp: HTTP_OK,
                        status: 'OK',
                        message: 'Tạo tài khoản thành công',
                        accessToken,
                        refreshToken,
                    });
                }
            } catch (e) {
                console.log(e);
                reject(e);
            }
        });
    }
    loginAccount(accountLogin) {
        return new Promise(async (resolve, reject) => {
            try {
                const { email, password } = accountLogin;

                const accountFind = await Account.findAll({
                    where: {
                        email,
                    },
                });
                if (accountFind.length === 0) {
                    resolve({
                        status: 'ERR',
                        message: 'Email không tồn tại',
                        statusHttp: HTTP_NOT_FOUND,
                    });
                } else {
                    const comparePassword = await bcrypt.compare(password, accountFind[0].password);
                    if (!comparePassword) {
                        resolve({
                            status: 'ERR',
                            message: 'Mật khẩu không chính xác',
                            statusHttp: HTTP_UNAUTHORIZED,
                        });
                    } else {
                        const roles = await AccountRoles.findAll({
                            where: {
                                accountID: accountFind[0].accountID,
                            },
                        });
                        console.log(roles);

                        const roleNames = await Promise.all(
                            roles.map((role) => Role.findOne({ where: { roleID: role.roleId } })),
                        );

                        if (!roleNames) {
                            resolve({
                                status: 'ERR',
                                message: 'Không tìm thấy vai trò',
                                statusHttp: HTTP_NOT_FOUND,
                            });
                        }

                        const employee = await Employee.findOne({
                            where: {
                                employeeID: accountFind[0].employeeID,
                            },
                        });

                        if (!employee) {
                            resolve({
                                status: 'ERR',
                                message: 'Không tìm thấy nhân viên',
                                statusHttp: HTTP_NOT_FOUND,
                            });
                        }

                        const accessToken = await generateAccessToken({
                            employeeID: accountFind[0].employeeID,
                            email: accountFind[0].email,
                            roles: roleNames,
                            warehouseID: employee.warehouseID,
                        });

                        const refreshToken = await generateRefreshToken({
                            employeeID: accountFind[0].employeeID,
                            email: accountFind[0].email,
                            roles: roleNames,
                            warehouseID: employee.warehouseID,
                        });
                        resolve({
                            status: 'OK',
                            message: 'Đăng nhập thành công',
                            statusHttp: HTTP_OK,
                            accessToken,
                            refreshToken,
                        });
                    }
                }
            } catch (e) {
                console.log(e);
                reject(e);
            }
        });
    }
}

module.exports = new AccountService();
