class ProductDTO {
    constructor(data) {
        this.skgu = data.category.categoryName;
        this.sku = data.productID;
        this.productName = data.productName;
        this.minStock = data.minStock;
        this.status = data.status;
    }
}

export default ProductDTO;
