const dbClient = require('mongoose');

const feedCommentSchema = new dbClient.Schema({
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
  text: {
    type: String,
  },
  parentCommentId: {
    type: String,
    default: null,
  },
  isChildComment: {
    type: Boolean,
    default: false,
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

feedCommentSchema.index({ userId: -1 });
feedCommentSchema.index({ active: -1, postId: 1 });

module.exports = dbClient.model('feedComment', feedCommentSchema);
