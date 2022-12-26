const dbClient = require('mongoose');

const otpSchema = new dbClient.Schema({
  email: {
    type: String,
    required: true,
  },
  otp: {
    type: Number,
    required: true,
  },
  createdDate: {
    type: Date,
    default: Date.now,
  },

  modifiedDate: {
    type: Date,
    default: Date.now,
  },
});

module.exports = dbClient.model('OTP', otpSchema);
