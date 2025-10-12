const express = require('express');
const router = express.Router();
const OrderReleaseController = require('../controllers/OrderReleaseController');
const { checkCreateOrderRelease } = require('../validates/orderRelease.validation');
const validate = require('../validates/validate');
const { authUser } = require('../middleware/AuthMiddleware');
router.get('/', (req, res) => {
    return res.send('OrderReleaseRouter Router is working!');
});

router.post('/create', authUser, checkCreateOrderRelease, validate, OrderReleaseController.createOrderRelease);
router.get('/get-all-order-release', authUser, OrderReleaseController.getAllOrderRelease);
router.post('/filter-order-release', authUser, OrderReleaseController.filterOrderRelease);

module.exports = router;
