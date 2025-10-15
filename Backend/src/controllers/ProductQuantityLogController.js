const ProductQuantityLogService = require('../services/ProductQuantityLogService');
const dotenv = require('dotenv');

dotenv.config();

const HTTP_INTERNAL_SERVER_ERROR = process.env.HTTP_INTERNAL_SERVER_ERROR;
const HTTP_OK = process.env.HTTP_OK;

class ProductQuantityLogController {
    // get /get-all
    async getLogByProductID(req, res) {
        try {
            const { statusHttp, ...response } = await ProductQuantityLogService.getLogByProductID({
                productID: req.params.productID,
            });
            return res.status(statusHttp).json(response);
        } catch (e) {
            console.log(e);
            return res.status(HTTP_INTERNAL_SERVER_ERROR).json({
                status: 'ERR',
                message: [e.message],
            });
        }
    }
}

module.exports = new ProductQuantityLogController();
