const express = require('express');
const { authUserIsManager } = require('../middleware/AuthMiddleware');
const ProductController = require('../controllers/ProductController');
const router = express.Router();
// router.get("/", (req, res) => {
//     return res.send("ProductRouter Router is working!");
// });

router.get("/list", authUserIsManager, ProductController.getAllProduct)
router.get("/", authUserIsManager, ProductController.getProductById)
router.get("/filter", authUserIsManager, ProductController.searchProduct)
router.put('/update/:id', authUserIsManager, ProductController.updateProduct)

module.exports = router;