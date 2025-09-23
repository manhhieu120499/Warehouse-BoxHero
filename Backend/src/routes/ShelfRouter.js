const express = require('express');
const router = express.Router();
const ShelfController = require('../controllers/ShelfController');
const { authUserIsManager } = require('../middleware/AuthMiddleware');
const { checkGetAllShelfOfWarehouse } = require('../validates/shelf.validation');
const validate = require('../validates/validate');

router.get(
    '/get-shelf-of-warehouse/:warehouseID',
    checkGetAllShelfOfWarehouse,
    validate,
    authUserIsManager,
    ShelfController.getAllShelfOfWarehouse,
);

module.exports = router;
