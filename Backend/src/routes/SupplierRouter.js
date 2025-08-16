const express = require('express');
const validate = require('../validates/validate');
const SupplierController = require('../controllers/SupplierController');
const { checkEmailExists, checkSupplierValidate } = require('../validates/supplier.validation');
const { authUserIsManager } = require('../middleware/AuthMiddleware');
const router = express.Router();
// router.get("/", (req, res) => {
//     return res.send("SupplierRouter Router is working!");
// });
router.get('/check-email-exists', checkEmailExists, validate, SupplierController.getSupplierById);

// Tạo nhà cung cấp
router.post('/', authUserIsManager, checkSupplierValidate, validate, SupplierController.createSupplier);

// Sửa nhà cung cấp
router.put('/:supplierId', authUserIsManager, checkSupplierValidate, validate, SupplierController.updateSupplier);

// Xóa nhà cung cấp
router.delete('/:supplierId', authUserIsManager, SupplierController.deleteSupplier);

// Lấy thông tin một nhà cung cấp
router.get('/:supplierId', SupplierController.getSupplierById);

// Lấy danh sách tất cả nhà cung cấp
router.get('/', SupplierController.getAllSuppliers);

module.exports = router;
