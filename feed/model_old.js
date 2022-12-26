const dbClient = require('mongoose');

const feedSchema = new dbClient.Schema({
  userId: {
    type: String,
    required: true,
  },
  postMessage: {
    type: String,
  },
  postImage: {
    type: String,
  },
  isVisible: {
    type: Boolean,
    default: true,
  },
  // report:{text:"",createdDate: Date.now,reportedByUserId:""}
  reports: [],
  // comments:[{text:"",createdDate:date,commentGivenByUserId:""}]
  comments: [],
  // {sharedText:"",createdDate:date,originalfeedId:"",firstName:"",lastName:"",profilePhoto:"",userId:""}
  sharedDetail: {},
  // [{runGivenByUserId:"",createdDate:date,givenRun:integer}]
  runs: [],
  // soft delete
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

module.exports = dbClient.model('feed', feedSchema);
