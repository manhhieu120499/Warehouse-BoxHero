const BatchService = require('../services/BatchService')

class BatchController{
    async getListBatchUnitOfProduct(req, res) {
        try{
            const {warehouseID, productID} = req.query
            const {statusHttp, ...response} = await BatchService.findAllBatchUnit(warehouseID, productID)
            return res.status(statusHttp).json(response)
        }catch(err) {
            return res.status(err.statusHttp).json(err)
        }
    }

}

module.exports = new BatchController();