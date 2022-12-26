const dbClient = require('mongoose');
const roles = require('./roles');

const userSchema = new dbClient.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  mobileNo: {
    type: String,
    trim: true,
    index: {
      unique: true,
      partialFilterExpression: {
        mobileNo: { $type: 'string' },
      },
    },
  },

  password: {
    type: String,
    required: true,
  },
  firstName: {
    type: String,
  },
  lastName: {
    type: String,
  },

  address_1: {
    type: String,
  },
  address_2: {
    type: String,
  },
  zipCode: {
    type: String,
  },

  state: {
    type: String,
  },

  profilePhoto: {
    type: String,
  },

  aboutMe: {
    type: String,
  },
  token: {
    type: String,
  },
  // [{dealId:"",createdDate:date,name:"",email:"",mobile:""}]
  usedDeals: [],
  // [{followingUserId:"",createdDate:date}]
  following: [],
  // [{followerUserId:"",createdDate:date}]
  followers: [],
  // {givenRun: parseInt(process.env.REFERRAL_RUN),createdDate: new Date(),type: 'referred',runGivenByUserId: dbUser._id}
  defaultRun: [],
  active: {
    type: Boolean,
    default: true,
  },
  createdDate: {
    type: Date,
    default: Date.now,
  },

  modifiedDate: {
    type: Date,
    default: Date.now,
  },
  role: {
    type: String,
    enum: roles,
    default: roles[2],
  },
});

module.exports = dbClient.model('user', userSchema);
