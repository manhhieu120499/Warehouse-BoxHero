const { query, body } = require('express-validator');

const suggestBoxes = [
    body('warehouseID').notEmpty().withMessage('Mã kho là bắt buộc').bail(),
    body('batchIDs')
        .isArray()
        .withMessage('Danh sách batchIDs không hợp lệ')
        .bail()
        .custom((value) => {
            if (value.length === 0) {
                throw new Error('Danh sách batchIDs không được để trống');
            }
            return true;
        }),
];

module.exports = {
    suggestBoxes,
};
