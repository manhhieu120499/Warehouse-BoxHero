const express = require('express');
const router = express.Router();
const OrderPurchaseController = require('../controllers/OrderPurchaseController');
const { checkCreateOrderPurchase } = require('../validates/orderPurchase.validation');
const validate = require('../validates/validate');
const { authUserIsManager, authUser } = require('../middleware/AuthMiddleware');

router.post(
    '/create-order-purchase',
    authUserIsManager,
    checkCreateOrderPurchase,
    validate,
    OrderPurchaseController.createOrderPurchase,
);

module.exports = router;
