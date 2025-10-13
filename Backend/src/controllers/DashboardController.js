const DashboardService = require('../services/DashboardService');
const dotenv = require('dotenv');

dotenv.config();

const HTTP_INTERNAL_SERVER_ERROR = process.env.HTTP_INTERNAL_SERVER_ERROR;
const HTTP_OK = process.env.HTTP_OK;

class DashboardController {
    async getStatisticalInventory(req, res) {
        try {
            const { statusHttp, ...response } = await DashboardService.getStatisticalInventory(req.query);
            return res.status(statusHttp).json(response);
        } catch (e) {
            return res.status(e.statusHttp).json(e);
        }
    }
}

module.exports = new DashboardController();
