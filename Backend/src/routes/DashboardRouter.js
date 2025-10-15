const express = require('express');
const router = express.Router();
const DashboardController = require('../controllers/DashboardController');
const { getStatisticalInventoryValidation } = require('../validates/dashboard.validation');
const { authUserIsManager, authUser } = require('../middleware/AuthMiddleware');
const validate = require('../validates/validate');

router.get(
    '/statistical-inventory',
    authUserIsManager,
    getStatisticalInventoryValidation,
    validate,
    DashboardController.getStatisticalInventory,
);

router.get(
    '/statistical-import-export',
    authUserIsManager,
    getStatisticalInventoryValidation,
    validate,
    DashboardController.getStatisticalImportExport,
);

router.get(
    '/statistical-percent-used-warehouse',
    authUserIsManager,
    DashboardController.getStatisticalPercentUsedWarehouse,
);

router.get('/statistical-min-stock-product', authUserIsManager, DashboardController.getStatisticalMinStockProduct);

router.get('/statistical-product-old', authUserIsManager, DashboardController.getStatisticalProductOld);

module.exports = router;
