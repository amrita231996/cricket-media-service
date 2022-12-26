const emailObj = require('../../helper/mail');
const dbHelper = require('./OTPDbHelper');
// const authHelper = require('../helper');

const otpController = {};
otpController.sendOTP = async (req) => {
  try {
    // const human = await authHelper.validateHuman(req.body.captchaToken);
    // if (!human) {
    //   return 'you are bot!';
    // }
    if (!req.body.email) return 'Field Required!';
    if (
      req.headers.origin === process.env.ROOTUIADDRESS ||
      (req.body.captchaToken && req.body.captchaToken.includes('android'))
    ) {
      const otp = Math.floor(1000 + Math.random() * 9000);
      dbHelper.upsertOTP(req.body.email, otp).then(() => {
        const mail = {
          to: req.body.email,
          subject: 'Cricket Media Signup Verification',
          html: `Hi,
        <br/>
                Thank you for signing up to Cricket Media. <br/>
                <strong>${otp}</strong> is the OTP required to complete your registration.
                <br/>
                Regards,<br/>
                Team Cricket Media
               `,
        };
        emailObj.send(mail);
      });

      return 'OTP send successfully';
    }
    return 'you are bot!';
  } catch (err) {
    return Promise.reject(err);
  }
};

otpController.reSendOTP = async (req) => {
  try {
    if (!req.body.email) return 'Field Required!';
    const otp = Math.floor(1000 + Math.random() * 9000);
    dbHelper.update(req.body.email, otp).then(() => {
      const mail = {
        to: req.body.email,
        subject: 'Cricket Media Signup Verification',
        html: `Hi,
        <br/>
                Thank you for signing up to Cricket Media. <br/>
                <strong>${otp}</strong> is the OTP required to complete your registration.
                <br/>
                <br/>
                Regards,<br/>
                Team Cricket Media
               `,
      };
      emailObj.send(mail);
    });

    return 'Mail sent!';
  } catch (err) {
    return Promise.reject(err);
  }
};

otpController.verifyOTPByEmail = async (req) => {
  try {
    if (!req.body.email) return 'Field Required!';
    const obj = await dbHelper.getByEmail(req.body.email, req.body.otp);
    return !!obj;
  } catch (err) {
    return Promise.reject(err);
  }
};

otpController.deleteOTPByEmail = async (email, otp) => {
  try {
    if (!(email && otp)) return 'Field Required!';
    return dbHelper.delete(email, otp);
  } catch (err) {
    return Promise.reject(err);
  }
};
module.exports = otpController;
