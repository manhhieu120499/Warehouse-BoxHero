const db = require('../../models/index');
const bcrypt = require('bcrypt');
const { generateAccessToken, generateRefreshToken } = require('./JwtService');
const CategoryProduct = db.Category;
const dotenv = require('dotenv');

dotenv.config();

const HTTP_OK = process.env.HTTP_OK;
const HTTP_NOT_FOUND = process.env.HTTP_NOT_FOUND;
const HTTP_BAD_REQUEST = process.env.HTTP_BAD_REQUEST;
const HTTP_UNAUTHORIZED = process.env.HTTP_UNAUTHORIZED;

class CategoryProductService {
    createCategory(newCategory) {
        return new Promise(async (resolve, reject) => {
            const transaction = await db.sequelize.transaction();
            try {
                const { categoryID, categoryName } = newCategory;

                // Check email tồn tại
                const categoryFind = await CategoryProduct.findOne({ where: { categoryID } });
                if (categoryFind) {
                    resolve({
                        statusHttp: HTTP_BAD_REQUEST,
                        status: 'ERR',
                        message: 'Mã loại sản phẩm đã tồn tại',
                    });
                }

                await CategoryProduct.create(
                    {
                        categoryID,
                        categoryName,
                    },
                    { transaction },
                );

                await transaction.commit();
                resolve({
                    statusHttp: HTTP_OK,
                    status: 'OK',
                    message: 'Tạo danh mục sản phẩm thành công',
                });
            } catch (e) {
                await transaction.rollback();
                console.log(e);
                reject(e);
            }
        });
    }
    getAllCategories() {
        return new Promise(async (resolve, reject) => {
            try {
                const categories = await CategoryProduct.findAll();
                resolve({
                    statusHttp: HTTP_OK,
                    status: 'OK',
                    data: categories,
                });
            } catch (e) {
                console.log(e);
                reject(e);
            }
        });
    }
}

module.exports = new CategoryProductService();
