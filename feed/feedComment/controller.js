const dbHelper = require('./dbHelper');
const feeddDbHelper = require('../dbHelper');
const userDbHelper = require('../../auth/dbHelper');
const viewModel = require('./viewModel');
const common = require('../../common');
const authService = require('../../helper/auth');

const comment = {};

comment.create = async (req) => {
  try {
    if (
      !req.body.commentText ||
      common.isStringEmpty(req.body.commentText) ||
      !req.body.feedId ||
      common.isStringEmpty(req.body.feedId)
    )
      return 'Field Required';

    const vModel = viewModel.createViewModel(req);
    await dbHelper.create(vModel);
    return 'comment created!';
  } catch (err) {
    return Promise.reject(err);
  }
};

comment.delete = async (req) => {
  try {
    if (!req.body.commentId) return 'input required!';
    await dbHelper.delete(req);
    return 'comment deleted!';
  } catch (err) {
    return Promise.reject(err);
  }
};

comment.getByfeedId = async (feedId, pageNumber, pagePerSize) => {
  try {
    const skipNumber =
      (parseInt(pageNumber, 10) - 1) * parseInt(pagePerSize, 10);
    const pageSize = parseInt(pagePerSize, 10);
    const y = await dbHelper.getByfeedId(feedId, skipNumber, pageSize);
    return y;
  } catch (error) {
    return Promise.reject(error);
  }
};

comment.updateUndefinedUsername = async () => {
  try {
    const result = await dbHelper.updateUndefinedUsername();
    return result;
  } catch (error) {
    return Promise.reject(error);
  }
};

module.exports = comment;
