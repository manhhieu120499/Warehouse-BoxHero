const express = require('express');
const router = express.Router();
const CustomerController = require('../controllers/CustomerController');

router.get("/find/:id", CustomerController.findCustomerById);
router.get("/list", CustomerController.getAllCustomers);

module.exports = router;