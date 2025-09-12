const express = require('express');
const { authUserIsManager } = require('../middleware/AuthMiddleware');
const { suggestBoxes, updateLocationBatch } = require('../validates/batchBox.validation');
const validate = require('../validates/validate');
const BatchBoxController = require('../controllers/BatchBoxController');
const router = express.Router();

router.get('/suggest-boxes', authUserIsManager, suggestBoxes, validate, BatchBoxController.suggestBoxes);
router.post(
    '/update-location-batch',
    authUserIsManager,
    updateLocationBatch,
    validate,
    BatchBoxController.updateLocationBatch,
);
module.exports = router;
