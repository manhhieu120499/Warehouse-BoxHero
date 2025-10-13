const express = require('express');
const router = express.Router();
const DashboardController = require('../controllers/DashboardController');
const { getStatisticalInventoryValidation } = require('../validates/dashboard.validation');
const validate = require('../validates/validate');

router.get(
    '/statistical-inventory',
    getStatisticalInventoryValidation,
    validate,
    DashboardController.getStatisticalInventory,
);

module.exports = router;
