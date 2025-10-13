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

module.exports = router;
