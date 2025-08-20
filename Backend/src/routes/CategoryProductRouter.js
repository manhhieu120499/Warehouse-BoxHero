const express = require('express');
const router = express.Router();
const CategoryProductController = require('../controllers/CategoryProductController');
const { checkCreateCategoryProductValidate } = require('../validates/categoryProduct.validation');
const { authUserIsManagerWithoutWarehouse } = require('../middleware/AuthMiddleware');
const validate = require('../validates/validate');

router.post(
    '/create-category',
    authUserIsManagerWithoutWarehouse,
    checkCreateCategoryProductValidate,
    validate,
    CategoryProductController.createCategory,
);

router.get('/get-all-categories', authUserIsManagerWithoutWarehouse, CategoryProductController.getAllCategories);

module.exports = router;
