const { query } = require('express-validator');

const getStatisticalInventoryValidation = [
    query('type')
        .notEmpty()
        .withMessage('Loại là bắt buộc')
        .bail()
        .isIn(['MONTH', 'YEAR'])
        .withMessage('Loại không hợp lệ'),
];

module.exports = {
    getStatisticalInventoryValidation,
};
