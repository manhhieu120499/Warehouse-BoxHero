const BatchBoxService = require('../services/BatchBoxService');

class BatchBoxController {
    async suggestBoxes(req, res) {
        try {
            const { statusHttp, ...response } = await BatchBoxService.suggestBoxes(req.query);
            return res.status(statusHttp).json(response);
        } catch (err) {
            return res.status(err.statusHttp).json(err);
        }
    }
}

module.exports = new BatchBoxController();
