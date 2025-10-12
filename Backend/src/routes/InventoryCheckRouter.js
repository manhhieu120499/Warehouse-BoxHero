const express = require('express');
const router = express.Router();
const InventoryCheckController = require('../controllers/InventoryCheckController');
const { authUserIsManager } = require('../middleware/AuthMiddleware');
const validate = require('../validates/validate');
const {
    getAllInventoryChecks,
    createInventoryCheck,
    filterInventoryCheck,
    updateInventoryCheck,
} = require('../validates/inventoryCheck.validation');
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

router.post(
    '/create-inventory-checks',
    createInventoryCheck,
    validate,
    authUserIsManager,
    InventoryCheckController.createInventoryCheck,
);

router.post(
    '/update-inventory-checks',
    updateInventoryCheck,
    validate,
    authUserIsManager,
    InventoryCheckController.updateInventoryCheck,
);

router.get(
    '/filter-inventory-checks',
    filterInventoryCheck,
    validate,
    authUserIsManager,
    InventoryCheckController.filterInventoryCheck,
);

module.exports = router;
