const express = require('express');
const { authUserIsManager } = require('../middleware/AuthMiddleware');
const { suggestBoxes } = require('../validates/batchBox.validation');
const validate = require('../validates/validate');
const BatchBoxController = require('../controllers/BatchBoxController');
const router = express.Router();

router.get('/suggest-boxes', authUserIsManager, suggestBoxes, validate, BatchBoxController.suggestBoxes);
module.exports = router;
