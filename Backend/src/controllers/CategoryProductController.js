const CategoryProductService = require('../services/CategoryProductService');
const dotenv = require('dotenv');

dotenv.config();

const HTTP_INTERNAL_SERVER_ERROR = process.env.HTTP_INTERNAL_SERVER_ERROR;

class CategoryProductController {
    // post /create-category
    async createCategory(req, res) {
        try {
            const { statusHttp, ...response } = await CategoryProductService.createCategory(req.body);
            return res.status(statusHttp).json(response);
        } catch (e) {
            console.log(e);
            return res.status(HTTP_INTERNAL_SERVER_ERROR).json({
                status: 'ERR',
                message: e.message,
            });
        }
    }

    // get /get-all-categories
    async getAllCategories(req, res) {
        try {
            const { statusHttp, ...response } = await CategoryProductService.getAllCategories();
            return res.status(statusHttp).json(response);
        } catch (e) {
            console.log(e);
            return res.status(HTTP_INTERNAL_SERVER_ERROR).json({
                status: 'ERR',
                message: e.message,
            });
        }
    }
}

module.exports = new CategoryProductController();
