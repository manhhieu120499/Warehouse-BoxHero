class BatchDTO {
    constructor(data) {
        this.sbu = data.batchID,
        this.macDate = data.manufactureDate.slice(0,10);
        this.expiredDate = data.expiryDate.slice(0,10);
        this.receive = data.importAmount;
        this.available = data.remainAmount;
        this.location = data.locationBatch[0].location;
        this.wareId = data.warehouseID;
    }
}

export default BatchDTO;