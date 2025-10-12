const InventoryCheckService = require('../services/InventoryCheckService');

class InventoryCheckController {
    async getListInventoryCheck(req, res) {
        try {
            const { statusHttp, ...response } = await InventoryCheckService.findAll(req.query);
            return res.status(statusHttp).json(response);
        } catch (err) {
            return res.status(err.statusHttp).json([err.message]);
        }
    }

    async createInventoryCheck(req, res) {
        try {
            const { statusHttp, ...response } = await InventoryCheckService.createInventoryCheck(req.body);
            return res.status(statusHttp).json(response);
        } catch (err) {
            return res.status(err.statusHttp).json([err.message]);
        }
    }

    async updateInventoryCheck(req, res) {
        try {
            const { statusHttp, ...response } = await InventoryCheckService.updateInventoryCheck(req.body);
            return res.status(statusHttp).json(response);
        } catch (err) {
            return res.status(err.statusHttp).json([err.message]);
        }
    }

    async filterInventoryCheck(req, res) {
        try {
            const { statusHttp, ...response } = await InventoryCheckService.filterInventoryCheck(req.query);
            return res.status(statusHttp).json(response);
        } catch (err) {
            return res.status(err.statusHttp).json([err.message]);
        }
    }
}

module.exports = new InventoryCheckController();
