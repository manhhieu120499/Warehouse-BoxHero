const express = require('express');
const router = express.Router();
const UnitController = require('../controllers/UnitController');

router.get('/get-all', UnitController.getAllUnit);

module.exports = router;
