const BatchService = require('../services/BatchService');

class BatchController {
    async getListBatchUnitOfProduct(req, res) {
        try {
            const { warehouseID, productID } = req.query;
            const { statusHttp, ...response } = await BatchService.findAllBatchUnit(warehouseID, productID);
            return res.status(statusHttp).json(response);
        } catch (err) {
            return res.status(err.statusHttp).json(err);
        }
    }

    async getBatchesWithoutLocation(req, res) {
        try {
            const { warehouseID } = req.query;
            const { statusHttp, ...response } = await BatchService.getBatchesWithoutLocation(warehouseID);
            return res.status(statusHttp).json(response);
        } catch (err) {
            return res.status(err.statusHttp).json(err);
        }
    }

    async countBatchesWithoutLocation(req, res) {
        try {
            const { statusHttp, ...response } = await BatchService.countBatchesWithoutLocation();
            return res.status(statusHttp).json(response);
        } catch (err) {
            return res.status(err.statusHttp).json(err);
        }
    }

    async getAvailableBoxes(req, res) {
        try {
            const { warehouseID } = req.query;
            const { statusHttp, ...response } = await BatchService.getAvailableBoxes(warehouseID);
            return res.status(statusHttp).json(response);
        } catch (err) {
            return res.status(err.statusHttp).json(err);
        }
    }

    async getBoxesContainingProduct(req, res) {
        try {
            const { productID, warehouseID } = req.query;
            const { statusHttp, ...response } = await BatchService.getBoxesContainingProduct(productID, warehouseID);
            return res.status(statusHttp).json(response);
        } catch (err) {
            return res.status(err.statusHttp).json(err);
        }
    }

    async getBoxesContainingBatch(req, res) {
        try {
            const { batchID, warehouseID } = req.query;
            const { statusHttp, ...response } = await BatchService.getBoxesContainingBatch(batchID, warehouseID);
            return res.status(statusHttp).json(response);
        } catch (err) {
            return res.status(err.statusHttp).json(err);
        }
    }

    async getBoxDetails(req, res) {
        try {
            const { boxID } = req.query;
            const { statusHttp, ...response } = await BatchService.getBoxDetails(boxID);
            return res.status(statusHttp).json(response);
        } catch (err) {
            return res.status(err.statusHttp).json(err);
        }
    }
    async getAllBatchByProductID(req, res) {
        try {
            const { productID, warehouseID } = req.query;
            const { statusHttp, ...response } = await BatchService.getAllBatchByProductID(productID, warehouseID);
            return res.status(statusHttp).json(response);
        } catch (err) {
            return res.status(err.statusHttp).json(err);
        }
    }
    async suggestBatchForExport(req, res) {
        try {
            const { statusHttp, ...response } = await BatchService.suggestBatchBForExport(req.body);
            return res.status(statusHttp).json(response);
        } catch (err) {
            return res.status(err.statusHttp).json(err);
        }
    }
}

module.exports = new BatchController();
