class ProductDTO {
    constructor(data) {
        this.skgu = data.categoryID;
        this.sku = data.productID;
        this.productName = data.productName;
        this.minStock = data.minStock
    }
}

export default ProductDTO;