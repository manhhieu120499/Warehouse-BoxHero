const { query, body } = require('express-validator');

const getAllInventoryChecks = [query('warehouseID').notEmpty().withMessage('Mã kho là bắt buộc').bail()];

const createInventoryCheck = [
    body('inventoryCheckID').notEmpty().withMessage('Mã kiểm kê là bắt buộc').bail(),
    body('employeeID').notEmpty().withMessage('Mã nhân viên là bắt buộc').bail(),
    body('warehouseID').notEmpty().withMessage('Mã kho là bắt buộc').bail(),
    body('status')
        .notEmpty()
        .isString()
        .withMessage('Trạng thái phải là một chuỗi')
        .bail()
        .isIn(['MATCHED', 'SHORTAGE', 'SURPLUS'])
        .withMessage('Trạng thái không hợp lệ'),
    body('details')
        .isArray()
        .withMessage('Chi tiết kiểm kê là bắt buộc')
        .bail()
        .custom((value) => {
            if (value.length === 0) {
                throw new Error('Chi tiết kiểm kê không được để trống');
            }
            return true;
        }),
    body('details.*.productID').notEmpty().withMessage('Mã sản phẩm là bắt buộc').bail(),
    body('details.*.systemQuantity').isInt({ gt: 0 }).withMessage('Số lượng hệ thống phải lớn hơn 0').bail(),
    body('details.*.actualQuantity').isInt({ gt: 0 }).withMessage('Số lượng thực tế phải lớn hơn 0').bail(),
    body('details.*.discrepancyQuantity')
        .notEmpty()
        .withMessage('Số lượng chênh lệch là bắt buộc')
        .isInt()
        .withMessage('Số lượng chênh lệch phải là một số nguyên')
        .bail(),
];

const filterInventoryCheck = [
    query('status')
        .optional()
        .isIn(['MATCHED', 'SHORTAGE', 'SURPLUS', ''])
        .withMessage('Trạng thái không hợp lệ')
        .bail(),
    query('warehouseID').notEmpty().withMessage('Mã kho là bắt buộc').bail(),
];

module.exports = {
    getAllInventoryChecks,
    createInventoryCheck,
    filterInventoryCheck,
};
