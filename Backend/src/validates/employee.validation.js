const { query, body } = require('express-validator');

const checkEmail = [
    body('email').notEmpty().withMessage('Email là bắt buộc').bail().isEmail().withMessage('Email không hợp lệ'),
];

module.exports = {
    checkEmail,
};
