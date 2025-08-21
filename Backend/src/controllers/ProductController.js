const ProductService = require("../services/ProductService");

class ProductController {
    async getProductById(req, res) {
        try{
            const {productID} = req.query
            const warehouseID = req.headers['warehouseid']
            const {statusHttp, ...response} = await ProductService.findProductById(productID, warehouseID)
            return res.status(statusHttp).json(response)
        }catch(err) {
            return res.status(err.statusHttp).json(err.message)
        }
    }
    async getAllProduct(req, res) {
        try{
            const {statusHttp, ...response} = await ProductService.findAllProduct()
            return res.status(statusHttp).json(response)
        }catch(err) {
            return res.status(err.statusHttp).json(err.message)
        }
    }
    async searchProduct(req, res) {
        try{
            console.log(req.query)
            const {productID, productName, categoryID, minStock} = req.query 
            const {statusHttp, ...response} = await ProductService.searchProduct(
                productID, productName, categoryID, minStock
            )
            return res.status(statusHttp).json(response)
        }catch(err) {
            return res.status(err.statusHttp).json(err.message)
        }
    }
    async updateProduct(req, res) {
        try{
            const productID = req.params.id
            const {statusHttp, ...response} = await ProductService.updateProduct({
                productID, ...req.body
            })
            return res.status(statusHttp).json(response)
        }catch(err) {
            return res.status(err.statusHttp).json(err)
        }
    }
}

module.exports = new ProductController();