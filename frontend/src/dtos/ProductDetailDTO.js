class ProductDetailDTO {
    constructor(data) {
        this.skug = data.categoryID;
        this.sku = data.productID;
        this.productName = data.productName;
        this.image = data.image;
        this.des = data.description;
        this.price = new Intl.NumberFormat('vi-VN').format(data.price);
        this.unit = 'Thùng';
        this.minStock = data.minStock;
        this.qrcode = data.qrcode;
        this.listBatch = data.listBatch;
    }
}

export default ProductDetailDTO;
