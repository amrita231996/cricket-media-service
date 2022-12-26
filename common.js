const common = {};

common.isStringEmpty = (str) => typeof str === 'string' && str.length === 0;

module.exports = common;
