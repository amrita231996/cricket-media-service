const dbClient = require('mongoose');

const feedReportSchema = new dbClient.Schema({
  userId: {
    type: String,
    required: true,
  },
  userName: {
    type: String,
    required: true,
  },
  userProfilePhoto: {
    type: String,
  },
  postId: {
    type: String,
  },
  reportText: {
    type: String,
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

module.exports = dbClient.model('feedReport', feedReportSchema);
