const WarehouseService = require('../services/WarehouseService')

class WarehouseController {
    async getListWarehouse(req, res) {
        try{
            const {statusHttp, ...response} = await WarehouseService.findAll();
            return res.status(statusHttp).json(response)
        }catch(err) {
            return res.status(err.statusHttp).json(err.message)
        }   
    }
}

module.exports = new WarehouseController();