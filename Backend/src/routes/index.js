const AccountRouter = require('./AccountRouter');
const BatchRouter = require('./BatchRouter');
const ZoneRouter = require('./ZoneRouter');
const ProductRouter = require('./ProductRouter');
const SupplierRouter = require('./SupplierRouter');
const CustomerRouter = require('./CustomerRouter');
const NotificationRouter = require('./NotificationRouter');
const WareHouseRouter = require('./WareHouseRouter');
const InventoryCheckRouter = require('./InventoryCheckRouter');
const OrderErrorRouter = require('./OrderErrorRouter');
const OrderReturnRouter = require('./OrderReturnRouter');
const OrderReleaseRouter = require('./OrderReleaseRouter');
const OrderPurchaseRouter = require('./OrderPurchaseRouter');
const OrderTransferRouter = require('./OrderTransferRouter');
const EmployeeRouter = require('./EmployeeRouter');
const UploadRouter = require('./UploadRouter')

const router = (app) => {
    app.use("/api/account", AccountRouter);
    app.use("/api/batch", BatchRouter);
    app.use("/api/zone", ZoneRouter);
    app.use("/api/product", ProductRouter);
    app.use("/api/supplier", SupplierRouter);
    app.use("/api/customer", CustomerRouter);
    app.use("/api/notification", NotificationRouter);
    app.use("/api/warehouse", WareHouseRouter);
    app.use("/api/inventory-check", InventoryCheckRouter);
    app.use("/api/order-error", OrderErrorRouter);
    app.use("/api/order-return", OrderReturnRouter);
    app.use("/api/order-release", OrderReleaseRouter);
    app.use("/api/order-purchase", OrderPurchaseRouter);
    app.use("/api/order-transfer", OrderTransferRouter);
    app.use("/api/employee", EmployeeRouter);
    app.use("/api/image", UploadRouter);
}

module.exports = router;