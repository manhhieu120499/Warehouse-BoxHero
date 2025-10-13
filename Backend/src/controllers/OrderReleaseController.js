const OrderReleaseService = require('../services/OrderReleaseService');

class OrderReleaseController {
    async createOrderRelease(req, res) {
        try {
            const { statusHttp, ...response } = await OrderReleaseService.createOrderRelease(req.body);
            return res.status(statusHttp).json(response);
        } catch (err) {
            console.error(err);
            return res.status(err.statusHttp || 500).json(err.message);
        }
    }
    async getAllOrderRelease(req, res) {
        try {
            const { warehouseID, page } = req.query;
            const { statusHttp, ...response } = await OrderReleaseService.getAllOrderRelease(warehouseID, page);
            return res.status(statusHttp).json(response);
        } catch (err) {
            console.error(err);
            return res.status(err.statusHttp || 500).json(err.message);
        }
    }
    async filterOrderRelease(req, res) {
        try {
            const { statusHttp, ...response } = await OrderReleaseService.filterOrderRelease(req.body);
            return res.status(statusHttp).json(response);
        } catch (err) {
            console.error(err);
            return res.status(err.statusHttp || 500).json(err.message);
        }
    }
}

module.exports = new OrderReleaseController();
