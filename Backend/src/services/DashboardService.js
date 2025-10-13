const db = require('../../models/index');
const ProductBaseline = db.ProductBaseline;
const dotenv = require('dotenv');

dotenv.config();

const HTTP_OK = process.env.HTTP_OK;
const HTTP_NOT_FOUND = process.env.HTTP_NOT_FOUND;
const HTTP_BAD_REQUEST = process.env.HTTP_BAD_REQUEST;
const HTTP_UNAUTHORIZED = process.env.HTTP_UNAUTHORIZED;
const HTTP_INTERNAL_SERVER_ERROR = process.env.HTTP_INTERNAL_SERVER_ERROR;

class DashboardService {
    async getStatisticalInventory({ type, year }) {
        return new Promise(async (resolve, reject) => {
            try {
                let data;
                if (type === 'MONTH') {
                    data = await ProductBaseline.findAll({
                        attributes: ['month', [db.sequelize.fn('SUM', db.sequelize.col('quantity')), 'totalQuantity']],
                        where: { year },
                        group: ['month'],
                        order: [['month', 'ASC']],
                        raw: true,
                    });
                    return resolve({
                        statusHttp: HTTP_OK,
                        status: 'OK',
                        message: `Thống kê tổng số lượng tồn theo tháng trong năm ${year}`,
                        data,
                    });
                } else if (type === 'YEAR') {
                    // Lấy 5 năm gần nhất
                    const currentYear = new Date().getFullYear();
                    const startYear = currentYear - 4;
                    data = await ProductBaseline.findAll({
                        attributes: ['year', [db.Sequelize.fn('SUM', db.Sequelize.col('quantity')), 'totalQuantity']],
                        where: {
                            year: { [db.Sequelize.Op.between]: [startYear, currentYear] },
                        },
                        group: ['year'],
                        order: [['year', 'ASC']],
                        raw: true,
                    });
                    return resolve({
                        statusHttp: HTTP_OK,
                        status: 'OK',
                        message: `Thống kê tổng số lượng tồn trong 5 năm gần nhất (${startYear}-${currentYear})`,
                        data,
                    });
                }
            } catch (e) {
                console.log(e);
                return reject({
                    statusHttp: HTTP_INTERNAL_SERVER_ERROR,
                    status: 'ERR',
                    message: 'Lỗi hệ thống',
                });
            }
        });
    }
}

module.exports = new DashboardService();
