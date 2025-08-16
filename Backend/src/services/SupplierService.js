const db = require('../../models/index');
const Supplier = db.Supplier;

class SupplierService {
    async searchSuppliers({ supplierId, phoneNumber, email, address, supplierName }, page = 1, limit = 10) {
        try {
            const { Op } = require('sequelize');
            const where = {};
            if (supplierId) where.supplierId = { [Op.like]: `%${supplierId}%` };
            if (phoneNumber) where.phoneNumber = { [Op.like]: `%${phoneNumber}%` };
            if (email) where.email = { [Op.like]: `%${email}%` };
            if (address) where.address = { [Op.like]: `%${address}%` };
            if (supplierName) where.supplierName = { [Op.like]: `%${supplierName}%` };
            const offset = (page - 1) * limit;
            const { count, rows } = await Supplier.findAndCountAll({
                where,
                offset,
                limit,
                order: [['supplierId', 'ASC']],
            });
            return {
                suppliers: rows,
                total: count,
                page,
                totalPages: Math.ceil(count / limit),
            };
        } catch (e) {
            console.log(e);
            throw e;
        }
    }
    async getSupplierByEmail(email) {
        try {
            return await Supplier.findOne({ where: { email } });
        } catch (e) {
            console.log(e);
            throw e;
        }
    }
    async getSupplierById(supplierId) {
        try {
            return await Supplier.findOne({ where: { supplierId } });
        } catch (e) {
            console.log(e);
            throw e;
        }
    }

    async getAllSuppliers(page = 1, limit = 10) {
        try {
            const offset = (page - 1) * limit;
            const { count, rows } = await Supplier.findAndCountAll({
                offset,
                limit,
                order: [['supplierId', 'ASC']],
            });
            return {
                suppliers: rows,
                total: count,
                page,
                totalPages: Math.ceil(count / limit),
            };
        } catch (e) {
            console.log(e);
            throw e;
        }
    }
    createSupplier(newSupplier) {
        return new Promise(async (resolve, reject) => {
            try {
                const { supplierId, supplierName, address, phoneNumber, email } = newSupplier;
                const supplierFind = await Supplier.findOne({ where: { supplierId } });
                if (supplierFind) {
                    resolve({
                        status: 'ERR',
                        message: 'Mã nhà cung cấp đã tồn tại',
                    });
                } else {
                    const supplier = await Supplier.create({ supplierId, supplierName, address, phoneNumber, email });
                    resolve({
                        status: 'OK',
                        message: 'Tạo nhà cung cấp thành công',
                        supplier,
                    });
                }
            } catch (e) {
                console.log(e);
                reject(e);
            }
        });
    }

    updateSupplier(supplierId, updateData) {
        return new Promise(async (resolve, reject) => {
            try {
                const supplier = await Supplier.findOne({ where: { supplierId } });
                if (!supplier) {
                    resolve({
                        status: 'ERR',
                        message: 'Không tìm thấy nhà cung cấp',
                    });
                } else {
                    await supplier.update(updateData);
                    resolve({
                        status: 'OK',
                        message: 'Cập nhật nhà cung cấp thành công',
                        supplier,
                    });
                }
            } catch (e) {
                console.log(e);
                reject(e);
            }
        });
    }

    deleteSupplier(supplierId) {
        return new Promise(async (resolve, reject) => {
            try {
                const supplier = await Supplier.findOne({ where: { supplierId } });
                if (!supplier) {
                    resolve({
                        status: 'ERR',
                        message: 'Không tìm thấy nhà cung cấp',
                    });
                } else {
                    await supplier.destroy();
                    resolve({
                        status: 'OK',
                        message: 'Xóa nhà cung cấp thành công',
                    });
                }
            } catch (e) {
                console.log(e);
                reject(e);
            }
        });
    }
}

module.exports = new SupplierService();
