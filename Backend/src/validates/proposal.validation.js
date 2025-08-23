const { query, body } = require('express-validator');

const checkCreateProposal = [
    body('proposalID')
        .notEmpty()
        .withMessage('Proposal ID là bắt buộc')
        .bail()
        .isString()
        .withMessage('Proposal ID không hợp lệ'),
    body('employeeIDCreate')
        .notEmpty()
        .withMessage('Employee ID là bắt buộc')
        .bail()
        .isString()
        .withMessage('Employee ID không hợp lệ'),
    body('warehouseID')
        .notEmpty()
        .withMessage('Warehouse ID là bắt buộc')
        .bail()
        .isString()
        .withMessage('Warehouse ID không hợp lệ'),
    body('note').notEmpty().withMessage('Ghi chú là bắt buộc').bail().isString().withMessage('Ghi chú không hợp lệ'),
    body('proposalDetails')
        .isArray()
        .withMessage('Chi tiết đề xuất phải là một mảng')
        .bail()
        .custom((value) => {
            if (value.length === 0) {
                throw new Error('Chi tiết đề xuất không được để trống');
            }
            return true;
        }),
    body('proposalDetails.*.proposalDetailID')
        .notEmpty()
        .withMessage('Mã chi tiết là bắt buộc')
        .bail()
        .isString()
        .withMessage('Mã chi tiết không hợp lệ'),

    body('proposalDetails.*.productID')
        .notEmpty()
        .withMessage('Mã sản phẩm là bắt buộc')
        .bail()
        .isString()
        .withMessage('Mã sản phẩm không hợp lệ'),

    body('proposalDetails.*.unitID')
        .notEmpty()
        .withMessage('Unit ID là bắt buộc')
        .bail()
        .isString()
        .withMessage('Unit ID không hợp lệ'),

    body('proposalDetails.*.quantity')
        .notEmpty()
        .withMessage('Số lượng là bắt buộc')
        .bail()
        .isInt({ min: 1 })
        .withMessage('Số lượng phải là số nguyên tối thiểu là 1'),

    body('proposalDetails.*.note').optional().isString().withMessage('Ghi chú chi tiết không hợp lệ'),
];

module.exports = {
    checkCreateProposal,
};
