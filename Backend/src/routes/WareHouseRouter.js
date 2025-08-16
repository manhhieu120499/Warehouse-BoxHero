const express = require('express');
const { authUserIsManager } = require('../middleware/AuthMiddleware');
const WarehouseController = require('../controllers/WarehouseController');
const router = express.Router();
router.get("/", (req, res) => {
    return res.send("WareHouseRouter Router is working!");
});

router.get('/list', WarehouseController.getListWarehouse)

module.exports = router;