const { query } = require('express-validator');

const getAllInventoryChecks = [query('warehouseID').notEmpty().withMessage('Mã kho là bắt buộc').bail()];

module.exports = {
    getAllInventoryChecks,
};
