const _ = require('lodash');
const { Types } = require('mongoose');
const authHelper = require('../auth/dbHelper');
const authService = require('../helper/auth');
const Feed = require('./model');

const feedDbHelper = {};

feedDbHelper.save = async (feedInput) => {
  try {
    const obj = new Feed(feedInput);
    return await obj.save();
  } catch (err) {
    return Promise.reject(err);
  }
};

feedDbHelper.update = async (feedInput) => {
  try {
    const { _id, userId, viewModel } = feedInput;
    await Feed.updateOne(
      { _id, userId },
      {
        $set: {
          ...viewModel,
          modifiedDate: Date.now(),
        },
      }
    );
    return true;
  } catch (err) {
    return Promise.reject(err);
  }
};

feedDbHelper.updateUser = async (userDetail) => {
  Feed.updateMany(
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

feedDbHelper.delete = async (req) => {
  try {
    const { body, decoded } = req;
    await Feed.updateOne(
      { _id: body.id, userId: decoded.id },
      {
        $set: {
          modifiedDate: Date.now(),
          active: false,
        },
      }
    );
    return true;
  } catch (err) {
    return Promise.reject(err);
  }
};

feedDbHelper.getbyId = async (id) => {
  try {
    return await Feed.findOne({ _id: id });
  } catch (error) {
    return Promise.reject(error);
  }
};

feedDbHelper.shared = async (req) => {
  try {
    const { body, decoded } = req;
    const feedDetail = await feedDbHelper.getbyId(body.feedId);
    const userDetails = await authHelper.getbyId(feedDetail.userId);
    const { firstName, lastName, profilePhoto } = userDetails;
    const sharedDetail = {
      sharedText: body.comment,
      createdDate: new Date(),
      originalFeedId: body.feedId,
      firstName,
      lastName,
      profilePhoto,
      userId: feedDetail.userId,
    };
    const { postMessage, postImageURL } = feedDetail;
    const feedObj = {
      userId: decoded.id,
      userName: `${decoded.firstName} ${decoded.lastName}`,
      userProfilePhoto: decoded.profilePhoto,
      postMessage,
      postImageURL,
      sharedDetail,
    };

    await feedDbHelper.save(feedObj);
    return feedObj;
  } catch (err) {
    return Promise.reject(err);
  }
};

feedDbHelper.addComment = async (req) => {
  try {
    const { body, decoded } = req;
    const comment = {
      text: body.commentText,
      createdDate: new Date(),
      commentGivenByUserId: decoded.id,
    };
    await Feed.updateOne(
      { _id: body.id },
      {
        $push: { comments: comment },
        $set: { modifiedDate: new Date() },
      }
    );
    return true;
  } catch (err) {
    return Promise.reject(err);
  }
};

feedDbHelper.report = async (req) => {
  try {
    const { body, decoded } = req;
    const report = {
      text: body.reportText,
      createdDate: new Date(),
      reportedByUserId: decoded.id,
    };
    await Feed.updateOne(
      { _id: body.id },
      {
        $push: { reports: report },
        $set: { modifiedDate: new Date() },
      }
    );
    return true;
  } catch (err) {
    return Promise.reject(err);
  }
};

feedDbHelper.addRun = async (req) => {
  try {
    const { body, decoded } = req;
    const run = {
      givenRun: body.givenRun,
      createdDate: new Date(),
      runGivenByUserId: decoded.id,
    };
    await Feed.updateOne(
      { _id: body.id },
      {
        $push: { runs: run },
        $set: { modifiedDate: new Date() },
      }
    );
    return true;
  } catch (err) {
    return Promise.reject(err);
  }
};

feedDbHelper.getAllbyUserIds = async (userIds, skipNumber, numberPerPage) => {
  try {
    return await Feed.find({
      userId: { $in: userIds },
      active: true,
    })
      .sort({ createdDate: -1 })
      .skip(skipNumber)
      .limit(numberPerPage)
      .select({
        _id: 1,
        postMessage: 1,
        postImageURL: 1,
        sharedDetail: 1,
        postCommentCount: 1,
        postRunCount: 1,
        postReportCount: 1,
        createdDate: 1,
        userId: 1,
        userName: 1,
        userProfilePhoto: 1,
      })
      .lean();
  } catch (error) {
    return Promise.reject(error);
  }
};

feedDbHelper.getMyFeedsbyUserIdInSortAndPagination = async (
  userIds,
  skipNumber,
  numberPerPage,
  browseringStartTime,
  reportedFeedID
) => {
  try {
    return await Feed.find({
      _id: { $nin: reportedFeedID },
      userId: { $in: userIds },
      createdDate: { $lte: new Date(browseringStartTime) },
      active: true,
    })
      .sort({ createdDate: -1 })
      .skip(skipNumber)
      .limit(numberPerPage)
      .select({
        _id: 1,
        postMessage: 1,
        postImageURL: 1,
        sharedDetail: 1,
        postCommentCount: 1,
        postRunCount: 1,
        postReportCount: 1,
        createdDate: 1,
        userId: 1,
        userName: 1,
        userProfilePhoto: 1,
      })
      .lean();
  } catch (error) {
    return Promise.reject(error);
  }
};

feedDbHelper.getMyFeeds = async (uId, skipNumber, numberPerPage) => {
  try {
    return await Feed.find({
      userId: uId,
      active: true,
    })
      .sort({ createdDate: -1 })
      .skip(skipNumber)
      .limit(numberPerPage)
      .select({
        _id: 1,
        postMessage: 1,
        postImageURL: 1,
        sharedDetail: 1,
        postCommentCount: 1,
        postRunCount: 1,
        postReportCount: 1,
        createdDate: 1,
        userId: 1,
        userName: 1,
        userProfilePhoto: 1,
      })
      .lean();
  } catch (error) {
    return Promise.reject(error);
  }
};

feedDbHelper.getTotalRunbyUserId = async (userID) => {
  try {
    const feeds = await Feed.find({ userId: userID });
    let totalRun = 0;
    for (let index = 0; index < feeds.length; index += 1) {
      const element = feeds[index];
      for (let runindex = 0; runindex < element.runs.length; runindex += 1) {
        const run = element.runs[runindex];
        totalRun += run.givenRun;
      }
    }
    return totalRun;
  } catch (error) {
    return Promise.reject(error);
  }
};

feedDbHelper.feedSearch = async (searchText, skipNumber, numberPerPage) => {
  try {
    return await Feed.find({
      postMessage: { $regex: searchText, $options: 'mi' },
      active: true,
    })
      .sort({ createdDate: -1 })
      .skip(skipNumber)
      .limit(numberPerPage)
      .select({
        _id: 1,
        postMessage: 1,
        postImageURL: 1,
        sharedDetail: 1,
        postCommentCount: 1,
        postRunCount: 1,
        postReportCount: 1,
        createdDate: 1,
        userId: 1,
        userName: 1,
        userProfilePhoto: 1,
      })
      .lean();
  } catch (err) {
    return Promise.reject(err);
  }
};

feedDbHelper.getFeedsDetail = async (feeds, feedTag) => {
  const updatedFeed = [];
  for (let index = 0; index < feeds.length; index += 1) {
    const obj = await feedDbHelper.getOneFeedDetail(feeds[index], feedTag);

    updatedFeed.push({ ...obj });
  }
  return updatedFeed;
};

feedDbHelper.getOneFeedDetail = async (element, feedTag) => {
  const {
    _id,
    userId,
    postMessage,
    createdDate,
    modifiedDatepostImage,
    runs,
    sharedDetail,
    comments,
    reports,
    postImage,
  } = element;
  // ...add userdetails with comment
  const commentOrderByLatest = _.sortBy(comments, [
    // eslint-disable-next-line func-names
    function (o) {
      return o.createdDate;
    },
  ]).reverse();
  const updatedComments = await feedDbHelper.getCommentsWithUserDetails(
    commentOrderByLatest
  );
  const userDetail = await authService.getUserDetail(element.userId);
  const feedTotalRunPerFeed = await authService.totalRunInEachFeed(runs);
  return {
    feedId: _id,
    userId,
    postMessage,
    createdDate,
    tag: feedTag,
    modifiedDatepostImage,
    runs,
    sharedDetail,
    feedTotalRunPerFeed,
    reports,
    postImage,
    comments: updatedComments,

    ...userDetail,
  };
};

// ...will rename this change once move all query to mongodb query
feedDbHelper.getOneFeedDetail1 = async (feedId) => {
  try {
    return await Feed.aggregate([
      {
        $match: { _id: Types.ObjectId(feedId) },
      },
      {
        $lookup: {
          from: 'users',
          let: { feedUserId: '$userId' },
          pipeline: [
            { $addFields: { actualUserId: { $toString: '$_id' } } },
            { $match: { $expr: { $eq: ['$actualUserId', '$$feedUserId'] } } },
          ],
          as: 'userDetail',
        },
      },
      {
        $unwind: { path: '$userDetail' },
      },
      {
        $project: {
          feedId: { $toString: '$_id' },
          postMessage: 1,
          createdDate: 1,
          modifiedDateForRunandComment: '$createdDate',
          runs: 1,
          comments: 1,
          postImage: 1,
          feedTotalRunPerFeed: { $sum: '$runs.givenRun' },
          firstName: '$userDetail.firstName',
          lastName: '$userDetail.lastName',
          userId: { $toString: '$userDetail._id' },
          profilePhoto: '$userDetail.profilePhoto',
          sharedDetail: {
            $cond: [{ $eq: ['$sharedDetail', []] }, {}, '$sharedDetail'],
          },
          tag: 'FEED',
        },
      },
    ]);
  } catch (error) {
    return Promise.reject(error);
  }
};

feedDbHelper.getOneFeedDetail2 = async (feedId) => {
  try {
    return await Feed.findOne({
      _id: feedId,
    })
      .select({
        _id: 1,
        postMessage: 1,
        postImageURL: 1,
        sharedDetail: 1,
        postCommentCount: 1,
        postRunCount: 1,
        postReportCount: 1,
        createdDate: 1,
        userId: 1,
        userName: 1,
        userProfilePhoto: 1,
      })
      .lean();
  } catch (error) {
    return Promise.reject(error);
  }
};

feedDbHelper.getMultipleFeedDetail = async (feedIds) => {
  try {
    return await Feed.find({ _id: { $in: feedIds } });
  } catch (error) {
    return Promise.reject(error);
  }
};

feedDbHelper.getFollowingUserFeed = async (
  userId,
  skipNumber,
  numberPerPage
) => {
  try {
    const followingWithId = await authHelper.getFollowingbyUserId(userId);
    const following =
      followingWithId && followingWithId.following
        ? followingWithId.following
        : [];
    const followingUserIds = following.map((foll) => foll.followingUserId);
    return await feedDbHelper.getAllbyUserIds(
      followingUserIds,
      skipNumber,
      numberPerPage
    );
  } catch (error) {
    return Promise.reject(error);
  }
};

feedDbHelper.getCommentsWithUserDetails = async (comments) => {
  const updatedComments = [];
  for (let index = 0; index < comments.length; index += 1) {
    const element = comments[index];
    updatedComments.push(
      await authService.getAttrWithUserDetail(
        element,
        element.commentGivenByUserId
      )
    );
  }
  return updatedComments;
};

feedDbHelper.getFeedById = async (id) => {
  try {
    const feedObj = await Feed.findOne({ _id: id });
    return feedObj ? await feedDbHelper.getOneFeedDetail(feedObj) : null;
  } catch (error) {
    return Promise.reject(error);
  }
};

feedDbHelper.updateSharedFeed = async (userId, sharedText, feedId) => {
  try {
    await Feed.updateOne(
      { _id: Types.ObjectId(feedId), userId },
      {
        $set: {
          'sharedDetail.sharedText': sharedText,
          modifiedDate: Date.now(),
        },
      }
    );
    return true;
  } catch (err) {
    return Promise.reject(err);
  }
};

feedDbHelper.getFeedByTodayDateAndUserId = async (userId) => {
  const result = await Feed.find({ userId });
  const today = new Date();
  return result.filter(
    (p) =>
      new Date(p.createdDate.toISOString().split('T')[0]).getTime() ===
      new Date(today.toISOString().split('T')[0]).getTime()
  );
};

feedDbHelper.getCommentsByTodayDateAndUserId = async (userId) => {
  const result = await Feed.find({ userId }, { comments: 1 });
  const comments = result ? [...result.map((re) => re)] : [];
  const today = new Date();
  return comments.filter(
    (p) =>
      p.createdDate &&
      new Date(p.createdDate.toISOString().split('T')[0]).getTime() ===
        new Date(today.toISOString().split('T')[0]).getTime()
  );
};

feedDbHelper.getShareFeedByTodayDateAndUserId = async (userId) => {
  const result = await Feed.find({ userId }, { sharedDetail: 1 });
  const sharedDetailArry = result || [];
  const today = new Date();
  return sharedDetailArry.filter(
    (p) =>
      p.createdDate &&
      new Date(p.createdDate.toISOString().split('T')[0]).getTime() ===
        new Date(today.toISOString().split('T')[0]).getTime()
  );
};

feedDbHelper.feedCommnetById = async (id) => {
  try {
    const feedObj = await Feed.findOne({ _id: id });
    if (!feedObj)
      return Promise.reject(new Error({ message: 'feed is not available' }));
    if (feedObj.comments.length === 0) return { comments: [] };
    const commentOrderByLatest = _.sortBy(feedObj.comments, [
      // eslint-disable-next-line func-names
      function (o) {
        return o.createdDate;
      },
    ]).reverse();
    const comments = await feedDbHelper.getCommentsWithUserDetails(
      commentOrderByLatest
    );
    return { comments };
  } catch (error) {
    return Promise.reject(error);
  }
};

feedDbHelper.getFeedByCommentedUserIdInDesCreateDate = async (
  userId
  //   ,skipNumber,
  //   numberPerPage
  // eslint-disable-next-line no-return-await
) =>
  // eslint-disable-next-line no-return-await
  await Feed.aggregate([
    {
      $match: {
        $and: [
          { 'comments.commentGivenByUserId': userId },
          { userId: { $ne: userId } },
        ],
      },
    },
    {
      $lookup: {
        from: 'users',
        pipeline: [
          { $addFields: { actualUserId: { $toString: '$_id' } } },
          { $match: { $expr: { $and: [{ $eq: ['$actualUserId', userId] }] } } },
        ],
        as: 'actedUser',
      },
    },
    {
      $unwind: {
        path: '$actedUser',
      },
    },
    {
      $lookup: {
        from: 'users',
        let: { feedUserId: '$userId' },
        pipeline: [
          { $addFields: { actualUserId: { $toString: '$_id' } } },
          { $match: { $expr: { $eq: ['$actualUserId', '$$feedUserId'] } } },
        ],
        as: 'userDetail',
      },
    },
    {
      $unwind: { path: '$userDetail' },
    },
    {
      $project: {
        feedId: { $toString: '$_id' },
        postMessage: 1,
        createdDate: 1,
        modifiedDateForRunandComment: '$modifiedDate',
        runs: 1,
        comments: 1,
        commentsArry: '$comments',
        postImage: 1,
        feedTotalRunPerFeed: { $sum: '$runs.givenRun' },
        firstName: '$userDetail.firstName',
        lastName: '$userDetail.lastName',
        userId: '$userDetail._id',
        profilePhoto: '$userDetail.profilePhoto',
        actedFirstName: '$actedUser.firstName',
        actedLastname: '$actedUser.lastName',
        sharedDetail: 1,
      },
    },
    {
      $unwind: {
        path: '$commentsArry',
      },
    },
    {
      $match: { 'commentsArry.commentGivenByUserId': userId },
    },
    {
      $project: {
        feedId: 1,
        postMessage: 1,
        createdDate: 1,
        modifiedDateForRunandComment: 1,
        runs: 1,
        comments: 1,
        postImage: 1,
        feedTotalRunPerFeed: 1,
        firstName: 1,
        lastName: 1,
        userId: 1,
        profilePhoto: 1,
        tag: 'FEEDCOMMENT',
        actedFirstName: 1,
        actedLastname: 1,
        sharedDetail: {
          $cond: [{ $eq: ['$sharedDetail', []] }, {}, '$sharedDetail'],
        },
      },
    },
    {
      $sort: {
        createdDate: -1,
      },
    },
    // ,
    // {
    //     $facet:{
    //         data: [ { $skip: skipNumber }, { $limit: numberPerPage } ]
    //       }
    // }
  ]);

feedDbHelper.getFeedByRunUserIdInDesCreateDate = async (
  userId
  // ,
  //   skipNumber,
  //   numberPerPage
) =>
  // eslint-disable-next-line no-return-await
  await Feed.aggregate([
    {
      $match: {
        $and: [
          { 'runs.runGivenByUserId': userId },
          { userId: { $ne: userId } },
        ],
      },
    },
    {
      $lookup: {
        from: 'users',
        pipeline: [
          { $addFields: { actualUserId: { $toString: '$_id' } } },
          { $match: { $expr: { $and: [{ $eq: ['$actualUserId', userId] }] } } },
        ],
        as: 'actedUser',
      },
    },
    {
      $unwind: {
        path: '$actedUser',
      },
    },
    {
      $lookup: {
        from: 'users',
        let: { feedUserId: '$userId' },
        pipeline: [
          { $addFields: { actualUserId: { $toString: '$_id' } } },
          { $match: { $expr: { $eq: ['$actualUserId', '$$feedUserId'] } } },
        ],
        as: 'userDetail',
      },
    },
    {
      $unwind: { path: '$userDetail' },
    },
    {
      $project: {
        feedId: { $toString: '$_id' },
        postMessage: 1,
        createdDate: 1,
        modifiedDateForRunandComment: '$modifiedDate',
        runs: 1,
        runsArry: '$runs',
        comments: 1,
        postImage: 1,
        feedTotalRunPerFeed: { $sum: '$runs.givenRun' },
        firstName: '$userDetail.firstName',
        lastName: '$userDetail.lastName',
        userId: '$userDetail._id',
        profilePhoto: '$userDetail.profilePhoto',
        actedFirstName: '$actedUser.firstName',
        actedLastname: '$actedUser.lastName',
        sharedDetail: 1,
      },
    },
    {
      $unwind: { path: '$runsArry' },
    },
    {
      $match: { 'runsArry.runGivenByUserId': userId },
    },
    {
      $project: {
        feedId: 1,
        postMessage: 1,
        createdDate: 1,
        modifiedDateForRunandComment: 1,
        runs: 1,
        comments: 1,
        postImage: 1,
        feedTotalRunPerFeed: 1,
        firstName: 1,
        lastName: 1,
        userId: 1,
        profilePhoto: 1,
        tag: 'FEEDRUN',
        actedFirstName: 1,
        actedLastname: 1,
        actedRun: '$runsArry.givenRun',
        sharedDetail: {
          $cond: [{ $eq: ['$sharedDetail', []] }, {}, '$sharedDetail'],
        },
      },
    },
    {
      $sort: {
        createdDate: -1,
      },
    },
    // ,
    // {
    //     $facet:{
    //         data: [ { $skip: skipNumber }, { $limit: numberPerPage } ]
    //       }
    // }
  ]);

feedDbHelper.getSharedFeedDetails = async (userID, feedId) => {
  try {
    return await Feed.find({
      userId: userID,
      'sharedDetail.originalFeedId': feedId,
    })
      .select({
        _id: 1,
        postMessage: 1,
        postImageURL: 1,
        sharedDetail: 1,
        postCommentCount: 1,
        postRunCount: 1,
        postReportCount: 1,
        createdDate: 1,
        userId: 1,
        userName: 1,
        userProfilePhoto: 1,
      })
      .lean();
  } catch (err) {
    return Promise.reject(err);
  }
};

feedDbHelper.updateCommentCountWith1ByFeedId = async (feedId) => {
  try {
    const feedInfo = await Feed.findOne({ _id: feedId })
      .select({
        postCommentCount: 1,
      })
      .lean();
    return Feed.updateOne(
      { _id: feedId },
      {
        $set: {
          postCommentCount: feedInfo.postCommentCount + 1,
          modifiedDate: Date.now(),
        },
      }
    );
  } catch (error) {
    return Promise.reject(error);
  }
};

feedDbHelper.updateRunByFeedId = async (feedId, run) => {
  try {
    const feedInfo = await Feed.findOne({ _id: feedId })
      .select({
        postRunCount: 1,
      })
      .lean();
    return Feed.updateOne(
      { _id: feedId },
      {
        $set: {
          postRunCount: feedInfo.postRunCount + run,
          modifiedDate: Date.now(),
        },
      }
    );
  } catch (error) {
    return Promise.reject(error);
  }
};

feedDbHelper.updateReportByFeedId = async (feedId) => {
  try {
    const feedInfo = await Feed.findOne({ _id: feedId })
      .select({
        postReportCount: 1,
      })
      .lean();
    return Feed.updateOne(
      { _id: feedId },
      {
        $set: {
          postReportCount: feedInfo.postReportCount + 1,
          modifiedDate: Date.now(),
        },
      }
    );
  } catch (error) {
    return Promise.reject(error);
  }
};

feedDbHelper.updateUndefinedUsername = async () => {
  try {
    const userNameList = await Feed.find({
      userName: 'undefined undefined',
    });
    if (userNameList.length > 0) {
      for (let i = 0; i < userNameList.length; i += 1) {
        const userIdL = userNameList[i].userId;
        const userdetails = await authService.getUserDetail(userIdL);
        if (userdetails) {
          const userNameL = `${userdetails.firstName} ${userdetails.lastName}`;
          await Feed.updateMany(
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

module.exports = feedDbHelper;
