const express = require('express');
const { authUser } = require('../middleware/AuthMiddleware');
const {
    checkGetListBatchUnit,
    checkGetBatchNotWithLocation,
    checkGetAvailableBoxes,
    checkGetBoxesContainingProduct,
    checkGetBoxDetails,
} = require('../validates/batch.validation');
const validate = require('../validates/validate');
const BatchController = require('../controllers/BatchController');
const router = express.Router();
router.get('/', (req, res) => {
    return res.send('BatchRouter Router is working!');
});

router.get('/list-units', authUser, checkGetListBatchUnit, validate, BatchController.getListBatchUnitOfProduct);
router.get(
    '/batches-without-location',
    authUser,
    checkGetBatchNotWithLocation,
    validate,
    BatchController.getBatchesWithoutLocation,
);
router.get('/available-boxes', authUser, checkGetAvailableBoxes, validate, BatchController.getAvailableBoxes);
router.get(
    '/boxes-containing-product',
    authUser,
    checkGetBoxesContainingProduct,
    validate,
    BatchController.getBoxesContainingProduct,
);
router.get('/box-details', authUser, checkGetBoxDetails, validate, BatchController.getBoxDetails);
router.get('/all-batch-by-product', authUser, BatchController.getAllBatchByProductID);
module.exports = router;
