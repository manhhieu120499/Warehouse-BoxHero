const { query, body, param } = require('express-validator');

const checkCreateOrderPurchase = [
    body('orderPurchaseID')
        .notEmpty()
        .withMessage('Mã đơn nhập hàng bắt buộc')
        .bail()
        .isString()
        .withMessage('Mã đơn nhập hàng phải là chuỗi'),
    body('employeeID')
        .notEmpty()
        .withMessage('Mã nhân viên bắt buộc')
        .bail()
        .isString()
        .withMessage('Mã nhân viên phải là chuỗi'),
    body('warehouseID').notEmpty().withMessage('Mã kho bắt buộc').bail().isString().withMessage('Mã kho phải là chuỗi'),
    body('orderReturnID').optional().isString().withMessage('Mã đơn trả phải là chuỗi'),
    body('proposalID').optional().isString().withMessage('Mã đề xuất phải là chuỗi'),
    body('orderPurchaseDetails')
        .isArray()
        .withMessage('Chi tiết đơn nhập hàng phải là một mảng')
        .bail()
        .custom((value) => {
            if (value.length === 0) {
                throw new Error('Chi tiết đơn nhập hàng không được để trống');
            }
            return true;
        }),
    body('orderPurchaseDetails.*.batchID')
        .notEmpty()
        .withMessage('Mã lô hàng là bắt buộc')
        .bail()
        .isString()
        .withMessage('Mã lô hàng không hợp lệ'),
    body('orderPurchaseDetails.*.requestedQuantity')
        .notEmpty()
        .withMessage('Số lượng là bắt buộc')
        .bail()
        .isNumeric()
        .withMessage('Số lượng phải là một số'),
    body('orderPurchaseDetails.*.actualQuantity')
        .notEmpty()
        .withMessage('Số lượng thực tế là bắt buộc')
        .bail()
        .isNumeric()
        .withMessage('Số lượng thực tế phải là một số'),
    body('orderPurchaseDetails.*.unitID')
        .notEmpty()
        .withMessage('Đơn vị là bắt buộc')
        .bail()
        .isString()
        .withMessage('Đơn vị không hợp lệ'),
    body('orderPurchaseDetails.*.manufactureDate')
        .notEmpty()
        .withMessage('Ngày sản xuất là bắt buộc')
        .bail()
        .isDate()
        .withMessage('Ngày sản xuất không hợp lệ'),
    body('orderPurchaseDetails.*.expiryDate')
        .notEmpty()
        .withMessage('Ngày hết hạn là bắt buộc')
        .bail()
        .isDate()
        .withMessage('Ngày hết hạn không hợp lệ'),
    body('orderPurchaseDetails.*.productID')
        .notEmpty()
        .withMessage('Mã sản phẩm là bắt buộc')
        .bail()
        .isString()
        .withMessage('Mã sản phẩm không hợp lệ'),
    body('orderPurchaseDetails.*.supplierID')
        .notEmpty()
        .withMessage('Mã nhà cung cấp là bắt buộc')
        .bail()
        .isString()
        .withMessage('Mã nhà cung cấp không hợp lệ'),
    body('orderPurchaseDetails.*.positions')
        .isArray()
        .withMessage('Danh sách vị trí phải là một mảng')
        .bail()
        .custom((value) => {
            if (value.length === 0) {
                throw new Error('Danh sách vị trí không được để trống');
            }
            return true;
        }),
    body('orderPurchaseDetails.*.positions.*.zoneID')
        .notEmpty()
        .withMessage('Khu vực là bắt buộc')
        .bail()
        .isString()
        .withMessage('Khu vực phải là chuỗi'),
    body('orderPurchaseDetails.*.positions.*.shelfID')
        .notEmpty()
        .withMessage('Kệ là bắt buộc')
        .bail()
        .isString()
        .withMessage('Kệ phải là chuỗi'),
    body('orderPurchaseDetails.*.positions.*.floorID')
        .notEmpty()
        .withMessage('Tầng là bắt buộc')
        .bail()
        .isString()
        .withMessage('Tầng phải là chuỗi'),
    body('orderPurchaseDetails.*.positions.*.boxID')
        .notEmpty()
        .withMessage('Ô là bắt buộc')
        .bail()
        .isString()
        .withMessage('Ô phải là chuỗi'),
];

module.exports = { checkCreateOrderPurchase };
