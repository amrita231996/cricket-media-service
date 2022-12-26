const dbHelper = require('./dbHelper');
const feedDbHelper = require('../dbHelper');
const viewModel = require('./viewModel');

const feedReport = {};

feedReport.report = async (req) => {
  try {
    if (!(req.body.reportText && req.body.feedId)) return 'Field Required';
    if (
      (await dbHelper.countReportGivenTofeedByUserId(
        req.decoded.id,
        req.body.feedId
      )) > 0
    )
      return 'Already Reported!';

    const vModel = viewModel.createViewModel(req);
    await dbHelper.create(vModel);
    // ... update run by feedId
    feedDbHelper
      .updateReportByfeedId(req.body.feedId, req.body.reportText)
      .then(() => {
        feedDbHelper.getOnefeedDetail2(req.body.feedId).then((p) => {
        });
      });
    return 'reported';
  } catch (err) {
    return Promise.reject(err);
  }
};

feedReport.updateUndefinedUsername= async () => {
  try {
    const result = await dbHelper.updateUndefinedUsername();
    return result;
  } catch (error) {
    return Promise.reject(error);
  }
};

module.exports = feedReport;
