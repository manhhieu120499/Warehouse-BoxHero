const express = require('express');
const router = express.Router();
const OrderPurchaseController = require('../controllers/OrderPurchaseController');
const { checkCreateOrderPurchase, checkCompleteOrderPurchase } = require('../validates/orderPurchase.validation');
const validate = require('../validates/validate');
const { authUserIsManager, authUser } = require('../middleware/AuthMiddleware');

router.post(
    '/create-order-purchase',
    authUserIsManager,
    checkCreateOrderPurchase,
    validate,
    OrderPurchaseController.createOrderPurchase,
);

router.post(
    '/complete-order-purchase',
    authUserIsManager,
    checkCompleteOrderPurchase,
    validate,
    OrderPurchaseController.completeOrderPurchase,
);

module.exports = router;
