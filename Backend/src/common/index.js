const md5 = require('md5');

const generateCode = (prefix) => {
    const randomChar = md5(Date.now().toString()).slice(-5);
    return `${prefix}${randomChar}`;
};

module.exports = {
    generateCode,
};
