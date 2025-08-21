class BatchDTO {
    constructor(data) {
        this.sbu = data.batchID;
        this.macDate = data.manufactureDate.slice(0, 10);
        this.expiredDate = data.expiryDate.slice(0, 10);
        this.receive = data.importAmount;
        this.available = data.remainAmount;
        this.unit = data.unitName;
        this.location = data.locationBatch[0].location;
        this.wareId = data.warehouseID;
        this.totalProductRemain = data.totalProductRemain;
        this.importDate = data.createdAt.slice(0, 10);
    }
}

export default BatchDTO;
