const express = require('express');
const router = express.Router();
const ProductQuantityLogController = require('../controllers/ProductQuantityLogController');
const { authUserIsManager } = require('../middleware/AuthMiddleware');

router.get('/get-log/:productID', authUserIsManager, ProductQuantityLogController.getLogByProductID);
router.get('/filter', authUserIsManager, ProductQuantityLogController.filterLogByProductID);

module.exports = router;
