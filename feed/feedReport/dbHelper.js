const feedReport = require('./model');
const authservice = require('../../helper/auth');

const feedReportDbHelper = {};

feedReportDbHelper.create = async (feedReportInput) => {
  try {
    const obj = new feedReport(feedReportInput);
    return await obj.save();
  } catch (err) {
    return Promise.reject(err);
  }
};

feedReportDbHelper.countReportGivenTofeedByUserId = async (uId, pId) => {
  try {
    return await feedReport.countDocuments({ userId: uId, postId: pId });
  } catch (err) {
    return Promise.reject(err);
  }
};

feedReportDbHelper.updateUser = async (userDetail) => {
  feedReport.updateMany(
    { userId: userDetail._id },
    {
      $set: {
        userName: `${userDetail.firstName} ${userDetail.lastName}`,
        userProfilePhoto: userDetail.profilePhoto,
        modifiedDate: Date.now(),
      },
    }
  );
};

feedReportDbHelper.getAllReportedfeed = async (userId) => {
  try {
    return await feedReport.find({ userId })
      .select({ postId: 1, _id: 0 })
      .lean();
  } catch (error) {
    return Promise.reject(error);
  }
};

feedReportDbHelper.updateUndefinedUsername = async () => {
  try {
    const userNameList = await feedReport.find({
      userName: 'undefined undefined',
    });

    if (userNameList.length > 0) {
      for (let i = 0; i < userNameList.length; i += 1) {
        const userIdL = userNameList[i].userId;
        const userdetails = await authservice.getUserDetail(userIdL);
        if (userdetails) {
          const userNameL = `${userdetails.firstName} ${userdetails.lastName}`;
          await feedReport.updateMany(
            { userId: userIdL },
            { $set: { userName: userNameL } }
          );
        }
      }
      return 'updated';
    }

    return 'no userName found as undefined';
  } catch (error) {
    return Promise.reject(error);
  }
};

feedReportDbHelper.getCountByFeedId = async (feedId) => {
  try {
    return await feedReport.countDocuments({
      postId: feedId,
    });
  } catch (error) {
    return Promise.reject(error);
  }
};

module.exports = feedReportDbHelper;
