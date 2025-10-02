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
}

module.exports = new InventoryCheckController();
