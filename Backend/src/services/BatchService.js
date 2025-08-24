const db = require('../../models')
const Batch = db.Batch;
const Unit = db.Unit;
const Warehouse = db.Warehouse;
const Product = db.Product;
const dotenv = require('dotenv')

dotenv.config();

const HTTP_OK = process.env.HTTP_OK;
const HTTP_NOT_FOUND = process.env.HTTP_NOT_FOUND;
const HTTP_BAD_REQUEST = process.env.HTTP_BAD_REQUEST;
const HTTP_UNAUTHORIZED = process.env.HTTP_UNAUTHORIZED;
const HTTP_INTERNAL_SERVER_ERROR = process.env.HTTP_INTERNAL_SERVER_ERROR

class BatchService {
    findAllBatchUnit(warehouseID, productID) {
        return new Promise(async (resolve, reject) => {
            try {
                const warehouseExist = await Warehouse.findOne({
                    where: {warehouseID}
                })

                if(!warehouseExist) reject({
                    status: 'ERR',
                    statusHttp: HTTP_NOT_FOUND,
                    message: 'Kho không tồn tại'
                })

                const productExist = await Product.findOne({
                    where: {productID}
                })
                if(!productExist) reject({
                    status: 'ERR',
                    statusHttp: HTTP_NOT_FOUND,
                    message: 'Sản phẩm không tồn tại'
                })

                const listUnit = await Batch.findAll({
                    where: {productID, warehouseID},
                    include: [
                        {
                            model: Unit,
                            as: 'unit',
                            attributes: ['unitID', 'unitName']
                        }
                    ]
                })
                
                const formatListUnit = listUnit.map(item => {
                    const {unit, ...rest} = item.toJSON()
                    return unit
                })
                
                resolve({
                    status: 'OK',
                     statusHttp: HTTP_OK,
                     message: 'Lấy danh sách đơn vị tính theo lô của sản phẩm thành công',
                    units: formatListUnit

                })
            }catch(err) {
                console.error(err)
                reject({
                    status: 'ERR',
                    statusHttp: HTTP_INTERNAL_SERVER_ERROR,
                    message: err
                })
            }

        })
    }
}

module.exports = new BatchService();