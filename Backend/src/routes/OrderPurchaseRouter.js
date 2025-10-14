const express = require('express');
const router = express.Router();
const OrderPurchaseController = require('../controllers/OrderPurchaseController');
const { checkCreateOrderPurchase, checkUpdateStatusOrderPurchase } = require('../validates/orderPurchase.validation');
const validate = require('../validates/validate');
const { authUserIsManager, authUser } = require('../middleware/AuthMiddleware');

router.get('/get-all-order-purchase', authUserIsManager, OrderPurchaseController.getAllOrderPurchase);
router.get('/filter-order-purchase', authUserIsManager, OrderPurchaseController.filterOrderPurchase);

router.post(
    '/create-order-purchase',
    authUserIsManager,
    checkCreateOrderPurchase,
    validate,
    OrderPurchaseController.createOrderPurchase,
);

router.post(
    '/update-status-order-purchase',
    authUserIsManager,
    checkUpdateStatusOrderPurchase,
    validate,
    OrderPurchaseController.updateStatusOrderPurchase,
);

module.exports = router;
