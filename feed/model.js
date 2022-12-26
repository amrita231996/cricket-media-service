const dbClient = require('mongoose');

const feedSchema = new dbClient.Schema({
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
  postMessage: {
    type: String,
    default: '',
  },
  postMessageWithHtml: {
    type: String,
    default: '',
  },
  postImageURL: {
    type: String,
  },
  sharedDetail: {},
  postCommentCount: { type: Number, default: 0 },
  postRunCount: { type: Number, default: 0 },
  postReportCount: { type: Number, default: 0 },
  createdDate: {
    type: Date,
    default: Date.now,
  },
  modifiedDate: {
    type: Date,
    default: Date.now,
  },
  active: {
    type: Boolean,
    default: true,
  },
});

feedSchema.index({ userId: 1, createdDate: -1 });
feedSchema.index({ postMessage: 1 });
feedSchema.index({ createdDate: -1 });
feedSchema.index({ active: 1, createdDate: -1 });

module.exports = dbClient.model('feed_d', feedSchema);
