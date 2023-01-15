const dbClient = require('mongoose');

const inviteSchema = new dbClient.Schema({
  userId: {
    type: String,
    required: true,
  },
  userFirstName: {
    type: String,
    required: true,
  },
  userLastName: {
    type: String,
    required: true,
  },
  userEmail: {
    type: String,
    required: true,
  },
  userProfilePhoto: {
    type: String,
    default:''
  },
  secretCode: {
    type: String,
  },
  referralUserId: {
    type: String,
    default:''
  },
  referralUserFirstName: {
    type: String,
    default:''
  },
  referralUserLastName: {
    type: String,
    default:''
  },
  referralUserEmail: {
    type: String,
    default:''
  },
  referralUserProfilePhoto: {
    type: String,
    default:''
  },
  referralUserCreatedDate: {
    type: String,
    default:''
  },
  shareMode: {
    type: String,
    default: 'Email',
  },
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
});

module.exports = dbClient.model('invite', inviteSchema);
