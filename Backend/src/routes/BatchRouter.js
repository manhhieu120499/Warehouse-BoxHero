const express = require('express');
const {authUser} = require('../middleware/AuthMiddleware');
const { checkGetListBatchUnit } = require('../validates/batch.validation');
const validate = require('../validates/validate');
const BatchController = require('../controllers/BatchController');
const router = express.Router();
router.get("/", (req, res) => {
    return res.send("BatchRouter Router is working!");
});

router.get('/list-units', authUser, checkGetListBatchUnit, validate, BatchController.getListBatchUnitOfProduct)
module.exports = router;