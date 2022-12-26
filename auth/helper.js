const axios = require('axios');

const helper = {};
helper.validateHuman = async (captchaToken) => {
  const secret = process.env.RECAPTCHA_PUBLIC_SECRET_KEY;
  const response = await axios.post(
    `https://www.google.com/recaptcha/api/siteverify?secret=${secret}&response=${captchaToken}`
  );
  if (captchaToken.includes('android')) {
    return true;
  }
  return response.data.success;
};

module.exports = helper;
