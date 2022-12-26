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
    const newComment = await dbHelper.create(vModel);

    // ...find the parentCommentId and update isChildComment is true
    // if (req.body.parentCommentId) {
    //   await dbHelper.updatedIsChildCommentTrue(req.body.parentCommentId);
    // }

    // ...emit to following that new feed
    // userDbHelper.getFollowersbyUserId(req.decoded.id).then((followerLocal) => {
    //   if (followerLocal && followerLocal.followers) {
    //     const followersId = followerLocal.followers.map(
    //       (foll) => foll.followerUserId
    //     );
    //     // console.log(followersId);
    //     publishToQueue('EMITNEWfeed', followersId);
    //   }
    // });

    const feedLocal = await feeddDbHelper.getOnefeedDetail2(
      req.body.feedId
    );
    if (!feedLocal) return [];

    // ...update feedCount in feed collection
    feeddDbHelper
      .updateCommentCountWith1ByfeedId(req.body.feedId)
      .then(() => {
        feeddDbHelper.getOnefeedDetail2(req.body.feedId).then((p) => {
         
        });
      });
    // ...comment notification
    if (!(feedLocal.userId && feedLocal.userId !== req.decoded.id))
      return 'both users are same';
    const data = {
      firstName: req.decoded.firstName,
      lastName: req.decoded.lastName,
      createdUserId: feedLocal.userId,
      createdUserProfilePhoto: req.decoded.profilePhoto,
      idForUI: req.decoded.id,
      userNameForUI: null,
      userProfilePhotoForUI: null,
    };
    // ...find all created comment by today date
    const todayCreatedCommentCount =
      await dbHelper.getCommentsCountByTodayDateAndUserId(req.decoded.id);
    // ...if count is less to MAX_CREATE_COMMNET_COUNT_PERDAY then
    if (
      todayCreatedCommentCount <
      parseInt(process.env.MAX_CREATE_COMMNET_COUNT_PERDAY, 10)
    ) {
      // ...allow to add in user default run
      await userDbHelper.updateDefaultRun(req.decoded.id, {
        givenRun: parseInt(process.env.CREATE_COMMENT_RUN, 10),
        createdDate: new Date(),
        type: 'createdcommentperday',
        runGivenByUserId: 'system',
      });
      // ...emit total run
      const totalRun = await authService.getTotalRunByUserId(req.decoded.id);
      const run = { totalRun, userId: req.decoded.id };
      // ..save and emit notification
      const data1 = {
        givenRun: process.env.CREATE_COMMENT_RUN,
        createdUserId: req.decoded.id,
        createdUserProfilePhoto: req.decoded.profilePhoto,
        idForUI: req.body.feedId,
        userNameForUI: null,
        userProfilePhotoForUI: null,
      };
    }
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
