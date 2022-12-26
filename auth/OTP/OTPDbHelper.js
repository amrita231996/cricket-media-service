const OTPModel = require('./OTPModel');

const otpDbHelper = {};

otpDbHelper.create = async (mail, ot) => {
  try {
    const input = { email: mail, otp: ot };
    const obj = new OTPModel(input);
    return obj.save(obj);
  } catch (error) {
    return Promise.reject(error);
  }
};

otpDbHelper.upsertOTP = async (mail, ot) => {
  try {
    return OTPModel.updateOne(
      { email: mail },
      { $set: { otp: ot } },
      { upsert: true }
    );
  } catch (error) {
    return Promise.reject(error);
  }
};

otpDbHelper.getByEmail = async (mail, ot) => {
  try {
    return await OTPModel.findOne({ email: mail, otp: ot });
  } catch (error) {
    return Promise.reject(error);
  }
};

otpDbHelper.delete = async (mail, updatedOTP) => {
  try {
    return OTPModel.deleteOne({ email: mail, otp: updatedOTP });
  } catch (error) {
    return Promise.reject(error);
  }
};

otpDbHelper.deleteByMail = async (mail) => {
  try {
    return OTPModel.deleteOne({ email: mail });
  } catch (error) {
    return Promise.reject(error);
  }
};

otpDbHelper.update = async (mail, ot) => {
  try {
    return OTPModel.updateOne({ email: mail }, { $set: { otp: ot } });
  } catch (error) {
    return Promise.reject(error);
  }
};

module.exports = otpDbHelper;
