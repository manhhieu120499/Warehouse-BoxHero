const express = require('express');
const router = express.Router();
const InventoryCheckController = require('../controllers/InventoryCheckController');
const { authUserIsManager } = require('../middleware/AuthMiddleware');
const validate = require('../validates/validate');
const { getAllInventoryChecks } = require('../validates/inventoryCheck.validation');
router.get('/', (req, res) => {
    return res.send('InventoryCheckRouter Router is working!');
});

router.get(
    '/get-all-inventory-checks',
    getAllInventoryChecks,
    validate,
    authUserIsManager,
    InventoryCheckController.getListInventoryCheck,
);

module.exports = router;
