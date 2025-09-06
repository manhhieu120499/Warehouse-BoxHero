const { query, body } = require('express-validator');

const suggestBoxes = [
    query('warehouseID').notEmpty().withMessage('Mã kho là bắt buộc').bail(),
    query('productID').notEmpty().withMessage('Mã sản phẩm là bắt buộc').bail(),
];

module.exports = {
    suggestBoxes,
};
