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
    async getStatisticalImportExport(req, res) {
        try {
            const { statusHttp, ...response } = await DashboardService.getStatisticalImportExport(req.query);
            return res.status(statusHttp).json(response);
        } catch (e) {
            return res.status(e.statusHttp).json(e);
        }
    }
    async getStatisticalPercentUsedWarehouse(req, res) {
        try {
            const { statusHttp, ...response } = await DashboardService.getStatisticalPercentUsedWarehouse(req.query);
            return res.status(statusHttp).json(response);
        } catch (e) {
            return res.status(e.statusHttp).json(e);
        }
    }
    async getStatisticalMinStockProduct(req, res) {
        try {
            const { statusHttp, ...response } = await DashboardService.getStaticProductHasLowStock(req.query);
            return res.status(statusHttp).json(response);
        } catch (err) {
            console.log(err);
            return res.status(err.statusHttp).json(err);
        }
    }
    async getStatisticalProductOld(req, res) {
        try {
            const { statusHttp, ...response } = await DashboardService.getAllProductOld(req.query);
            return res.status(statusHttp).json(response);
        } catch (err) {
            console.log(err);
            return res.status(err.statusHttp).json(err);
        }
    }
}

module.exports = new DashboardController();
