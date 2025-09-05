const express = require('express');
const router = express.Router();
const OrderPurchaseMissingController = require('../controllers/OrderPurchaseMissingController');
const { checkFilter } = require('../validates/orderPurchaseMissing.validation');
const validate = require('../validates/validate');
const { authUserIsManager, authUser } = require('../middleware/AuthMiddleware');

router.get('/get-all', authUserIsManager, OrderPurchaseMissingController.getAllOrderPurchaseMissing);
router.get(
    '/filter',
    authUserIsManager,
    checkFilter,
    validate,
    OrderPurchaseMissingController.filterOrderPurchaseMissing,
);

module.exports = router;
