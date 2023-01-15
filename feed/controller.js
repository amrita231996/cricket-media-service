const _ = require('lodash');
const dbHelper = require('./dbHelper');
const userDbHelper = require('../auth/dbHelper');
// const pollDbHelper = require('../poll/dbHelper');
const viewModel = require('./viewModel');
const authService = require('../helper/auth');
const { asyncSeries } = require('../helper/async');
const feedDbHelper = require('./feedReport/dbHelper');
const { getUserDetailsByUserId } = require('../auth/controller');

const feed = {};

feed.create = async (req) => {
  try {
    console.log('req.body',req.body);
    if (
      !(
        req.body &&
        ((req.body.postMessage && req.body.postMessage.trim().length > 0) ||
          req.body.postImageURL)
      )
    )
      return 'Field required!';

    const createViewModel = viewModel.createViewModel(req);

    const newFeed = await dbHelper.save(createViewModel);
    
    return newFeed;
  } catch (err) {
    return Promise.reject(err);
  }
};

feed.update = async (req) => {
  try {
    if (
      !(
        req.body &&
        req.body.id &&
        ((req.body.postMessage && req.body.postMessage.trim().length > 0) ||
          (req.body.postImageURL && req.body.postImageURL.trim().length > 0))
      )
    )
      return 'Field required!';

    const updateViewModel = viewModel.updateViewModel(req);
    await dbHelper.update(updateViewModel);
    return 'feed updated!';
  } catch (err) {
    return Promise.reject(err);
  }
};

feed.delete = async (req) => {
  try {
    if (req.body.id) {
      await dbHelper.delete(req);
      return 'feed deleted!';
    }
    return 'input required!';
  } catch (err) {
    return Promise.reject(err);
  }
};

feed.shared = async (req) => {
  try {
    if (req.body && req.body.feedId) {
      const res = await dbHelper.shared(req);
      const { decoded } = req;
      const { firstName, lastName, profilePhoto } = decoded;
      const { sharedDetail } = res;
      const { userId, originalFeedId } = sharedDetail;
      if (req.decoded.id !== userId) {
        const data = {
          firstName,
          lastName,
          createdUserId: userId,
          createdUserProfilePhoto: profilePhoto,
          idForUI: originalFeedId,
          userNameForUI: null,
          userProfilePhotoForUI: null,
        };

        // ...find all shared feed by today date
        const todayCreatedHaredFeed =
          await dbHelper.getShareFeedByTodayDateAndUserId(req.decoded.id);
        // ...if count is less to MAX_CREATE_COMMNET_COUNT_PERDAY then
        if (
          todayCreatedHaredFeed.length <
          parseInt(process.env.MAX_SHARE_FEED_COUNT_PERDAY, 10)
        ) {
          // ...allow to add in user default run
          await userDbHelper.updateDefaultRun(req.decoded.id, {
            givenRun: parseInt(process.env.SHARE_FEED_RUN, 10),
            createdDate: new Date(),
            type: 'sharedfeedperday',
            runGivenByUserId: 'system',
          });
          // ...emit total run

          const totalRun = await authService.getTotalRunByUserId(
            req.decoded.id
          );
          const run = { totalRun, userId: req.decoded.id };
          // ..save nad emit notification
          // if (req.decoded.id != userId) {
          // eslint-disable-next-line no-shadow
          const data1 = {
            givenRun: process.env.SHARE_FEED_RUN,
            createdUserId: req.decoded.id,
            createdUserProfilePhoto: req.decoded.profilePhoto,
            idForUI: originalFeedId,
          };
        }
      }
    }
    return 'feed shared!';
  } catch (err) {
    return Promise.reject(err);
  }
};

feed.addComment = async (req) => {
  try {
    if (req.body.commentText && req.body.id) {
      await dbHelper.addComment(req);
      // ...emit to following that new feed
      const followerLocal = await userDbHelper.getFollowersbyUserId(
        req.decoded.id
      );
      if (followerLocal && followerLocal.followers) {
        const followersId = followerLocal.followers.map(
          (foll) => foll.followerUserId
        );
        // console.log(followersId);
      }

      // ...comment notification
      const feedLocal = await dbHelper.getFeedById(req.body.id);
      if (
        feedLocal &&
        feedLocal.userId &&
        feedLocal.userId !== req.decoded.id
      ) {
        const { firstName, lastName, profilePhoto } =
          await authService.getUserDetail(req.decoded.id);
        const data = {
          firstName,
          lastName,
          givenRun: null,
          createdUserId: feedLocal.userId,
          createdUserProfilePhoto: profilePhoto,
          idForUI: req.body.id,
          userNameForUI: null,
          userProfilePhotoForUI: null,
        };
      }

      // ...find all created comment by today date
      const todayCreatedComment =
        await dbHelper.getCommentsByTodayDateAndUserId(req.decoded.id);
      // ...if count is less to MAX_CREATE_COMMNET_COUNT_PERDAY then
      if (
        todayCreatedComment.length <
        parseInt(process.env.MAX_CREATE_COMMNET_COUNT_PERDAY, 10)
      ) {
        // ...allow to add in user default run
        if (feedLocal.userId !== req.decoded.id) {
          await userDbHelper.updateDefaultRun(req.decoded.id, {
            givenRun: parseInt(process.env.CREATE_COMMENT_RUN, 10),
            createdDate: new Date(),
            type: 'createdcommentperday',
            runGivenByUserId: 'system',
          });
        }
        // ...emit total run
        const totalRun = await authService.getTotalRunByUserId(req.decoded.id);
        const run = { totalRun, userId: req.decoded.id };
        // ..save nad emit notification
        if (
          feedLocal &&
          feedLocal.userId &&
          feedLocal.userId !== req.decoded.id
        ) {
          const data1 = {
            givenRun: process.env.CREATE_COMMENT_RUN,
            firstName: null,
            lastName: null,
            createdUserId: req.decoded.id,
            createdUserProfilePhoto: req.decoded.profilePhoto,
            idForUI: req.body.id,
            userNameForUI: null,
            userProfilePhotoForUI: null,
          };
        }
      }

      return 'comment created!';
    }
    return 'input required!';
  } catch (err) {
    return Promise.reject(err);
  }
};

feed.report = async (req) => {
  try {
    const res = await dbHelper.report(req);
    return res;
  } catch (err) {
    return Promise.reject(err);
  }
};

feed.addRun = async (req) => {
  try {
    // console.log('req.body', req.body);
    if (req.body.givenRun && req.body.id) {
      await dbHelper.addRun(req);
      const [feedDetail] = await dbHelper.getOneFeedDetail1(req.body.id);
      const totalRun = await authService.getTotalRunByUserId(
        feedDetail.userId
      );
      const run = { totalRun, userId: feedDetail.userId };
 
      // ...send notification
      const { decoded, body } = req;
      const data = {
        firstName: decoded.firstName,
        lastName: decoded.lastName,
        givenRun: body.givenRun,
        postMessage: feedDetail.postMessage,
        createdUserProfilePhoto: decoded.profilePhoto,
        createdUserId: feedDetail.userId,
        idForUI: req.body.id,
        userNameForUI: null,
        userProfilePhotoForUI: null,
      };
      return 'run given!';
    }
    return 'input required!';
  } catch (err) {
    return Promise.reject(err);
  }
};

feed.getAllbyUserId = async (req) => {
  try {
    if (
      !(
        req.params.pageNumber &&
        req.params.pagePerSize &&
        req.decoded.id &&
        req.params.dateTime
      )
    )
      return [];

    const followingFeedArry = [];

    const skipNumber =
      (parseInt(req.params.pageNumber, 10) - 1) *
      parseInt(req.params.pagePerSize, 10);
    const pagePerSize = parseInt(req.params.pagePerSize, 10);

    const userFollowingIds = await userDbHelper.getOnlyFollowingIdsByUserId(
      req.decoded.id
    );
    const userIds = [req.decoded.id];
    userIds.push(...userFollowingIds);
    const reportedFeedID = await feedDbHelper.getAllReportedfeed(
      req.decoded.id
    );
    
    const reportedFeedIDArray = [];
    reportedFeedIDArray.push(...reportedFeedID.map((id) => id.postId));
    const defaultGroupNo = parseInt(process.env.ASYNC_GROUP, 10);
    let chunk = [];
    while (userIds.length > 0) {
      chunk = userIds.splice(0, defaultGroupNo);
      followingFeedArry.push(
        await dbHelper.getMyFeedsbyUserIdInSortAndPagination(
          chunk,
          skipNumber,
          pagePerSize,
          req.params.dateTime.toString(),
          reportedFeedIDArray
        )
      );
    }

    return await asyncSeries(followingFeedArry);
  } catch (err) {
    return Promise.reject(err);
  }
};

feed.getMyFeed = async (userId, pageNumber, nPerPage) => {
  try {
    if (!(userId && pageNumber && nPerPage)) return [];

    const skipNumber = (parseInt(pageNumber, 10) - 1) * parseInt(nPerPage, 10);
    const pagePerSize = parseInt(nPerPage, 10);
    const results = await dbHelper.getMyFeeds(userId, skipNumber, pagePerSize);
    return results;
  } catch (err) {
    return Promise.reject(err);
  }
};

feed.getTotalRunbyUserId = async (req) => {
  try {
    if (req.decoded.id) {
      return await authService.getTotalRunByUserId(req.decoded.id);
    }
    return 0;
  } catch (err) {
    return Promise.reject(err);
  }
};

feed.feedSearch = async (req) => {
  try {
    if (!req.body.searchText && req.body.searchText.trim() === '') return [];
    const skipNumber =
      (parseInt(req.body.pageNumber, 10) - 1) *
      parseInt(req.body.pagePerSize, 10);
    const pagePerSize = parseInt(req.body.pagePerSize, 10);
    const searchMes = req.body.searchText.trim();
    return await dbHelper.feedSearch(searchMes, skipNumber, pagePerSize);
  } catch (err) {
    return Promise.reject(err);
  }
};

feed.getFollowingUserFeed = async (req) => {
  try {
    if (!(req.decoded && req.decoded.id)) return [];
    const skipNumber =
      (parseInt(req.params.pageNumber, 10) - 1) *
      parseInt(req.params.pagePerSize, 10);
    const pagePerSize = parseInt(req.params.pagePerSize, 10);
    return await dbHelper.getFollowingUserFeed(
      req.decoded.id,
      skipNumber,
      pagePerSize
    );
  } catch (err) {
    return Promise.reject(err);
  }
};

feed.getFeedById = async (req) => {
  try {
    if (req.params && req.params.id) {
      return await dbHelper.getOneFeedDetail2(req.params.id);
    }
    return {};
  } catch (err) {
    return Promise.reject(err);
  }
};

feed.getMultipleFeedById = async (req) => {
  try {
    if (req.body.feedIds) {
      const posts = await dbHelper.getMultipleFeedDetail(req.body.feedIds);
      return posts;
    }
    return {};
  } catch (err) {
    return Promise.reject(err);
  }
};

feed.feedCommnetById = async (req) => {
  try {
    if (
      req.params &&
      req.params.id &&
      req.params.pageNumber &&
      req.params.pagePerSize
    ) {
      const results = await dbHelper.feedCommnetById(req.params.id);

      const count = results.comments.length;

      const skipNumber =
        (parseInt(req.params.pageNumber, 10) - 1) *
        parseInt(req.params.pagePerSize, 10);
      const pagePerSize = parseInt(req.params.pagePerSize, 10);
      const sorted = _.sortBy(results.comments, [
        // eslint-disable-next-line func-names
        function (o) {
          return o.createdDate;
        },
      ]).reverse();
      const end = skipNumber + pagePerSize;
      const slicedList = sorted.slice(skipNumber, end);

      if (!slicedList) return { commnets: [], count: 0 };

      return { commnets: slicedList, count };
    }
    return { comments: [] };
  } catch (err) {
    return Promise.reject(err);
  }
};

feed.updateSharedFeed = async (req) => {
  try {
    if (!(req.body && req.body.updatedSharedText && req.body.feedId))
      return 'Field required';

    const { decoded, body } = req;
    const { updatedSharedText, feedId } = body;
    return await dbHelper.updateSharedFeed(
      decoded.id,
      updatedSharedText,
      feedId
    );
  } catch (err) {
    return Promise.reject(err);
  }
};

feed.getSharedFeedDetails = async (body) => {
  try {
    const sharedPostInfo = await dbHelper.getSharedFeedDetails(
      body.userId,
      body.feedId
    );
    const sharedFeedId =
      sharedPostInfo.length > 0 ? 'Feed already shared.' : 'Feed not shared.';
    return sharedFeedId;
  } catch (err) {
    return Promise.reject(err);
  }
};

feed.updateUndefinedUsername = async () => {
  try {
    const result = await dbHelper.updateUndefinedUsername();
    return result;
  } catch (error) {
    return Promise.reject(error);
  }
};

module.exports = feed;
