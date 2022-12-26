// 'use strict';

const _ = require('lodash');
const { Types } = require('mongoose');
// const { getTotalRunByUserId } = require('../helper/auth');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const saltRounds = 10;

const Users = require('./model');
const authService = require('../helper/auth');

const usersDbHelper = {};
const defaultPassword = 'cricketmedia123#';

usersDbHelper.tokenValidation = async (token) => {
  try {
    return Users.findOne({ token })
      .exec()
      .then((u) => !!u);
  } catch (error) {
    return Promise.reject(error);
  }
};

usersDbHelper.save = async (usersInp) => {
  try {
    const usersInput = usersInp;
    return Users.countDocuments({ email: usersInput.email }).then((count) => {
      if (count === 0) {
        usersInput.password = usersInput.password || defaultPassword;
        return bcrypt
          .hash(usersInput.password, saltRounds)
          .then((encryptedPassword) => {
            const newUser = JSON.parse(JSON.stringify(usersInput));
            newUser.password = encryptedPassword;
            newUser.defaultRun = [
              {
                givenRun: 1000,
                createdDate: new Date(),
                runGivenByUserId: 'system',
              },
            ];
            const obj = new Users(newUser);
            return obj.save().then(() => obj);
          });
      }
      return 'email exist';
    });
  } catch (err) {
    return Promise.reject(err);
  }
};

usersDbHelper.validate = async (model) => {
  try {
    return Users.findOne({ email: model.email })
      .exec()
      .then((u) => {
        if (u) {
          const payload = {
            id: u._id,
            userStatus: u.userStatus,
            email: u.email,
            mobileNo: u.mobileNo,
            firstName: u.firstName,
            lastName: u.lastName,
            address_1: u.address_1,
            address_2: u.address_2,
            zipCode: u.zipCode,
            state: u.state,
            profilePhoto: u.profilePhoto,
            aboutMe: u.aboutMe,
            active: u.active,
            role: u.role,
          };
          const options = { expiresIn: '1d' };

          const secret = process.env.JWT_SECRET;
          const token = jwt.sign(payload, secret, options);

          const match = bcrypt.compareSync(model.password, u.password);
          if (match) {
            return u
              .updateOne({ token })
              .then(() => ({ match, token, payload }));
          }
          return { match };
        }

        return { message: 'User not exist' };
      });
  } catch (err) {
    return Promise.reject(err);
  }
};

usersDbHelper.getbyId = async (userId) => {
  try {
    return await Users.findOne({ _id: userId });
  } catch (error) {
    return Promise.reject(error);
  }
};

usersDbHelper.update = async (id, authInput) => {
  try {
    await Users.updateOne(
      { _id: id },
      {
        $set: {
          ...authInput,
          modifiedDate: Date.now(),
        },
      }
    );
    return usersDbHelper.getbyId(id);
  } catch (err) {
    return Promise.reject(err);
  }
};

usersDbHelper.logOut = async (id) => {
  try {
    return await Users.updateOne({ _id: id }, { $set: { token: null } });
  } catch (err) {
    return Promise.reject(err);
  }
};

usersDbHelper.nameSearch = async (userId, searchText) => {
  try {
    return await Users.aggregate([
      { $match: { _id: { $ne: Types.ObjectId(userId) } } },
      {
        $project: {
          userIdString: { $toString: '$_id' },
          usedDeals: 1,
          following: 1,
          followers: 1,
          defaultRun: 1,
          email: 1,
          createdDate: 1,
          modifiedDate: 1,
          profilePhoto: 1,
          aboutMe: 1,
          state: 1,
          followingCount: { $size: '$following' },
          followersCount: { $size: '$followers' },
          firstName: 1,
          lastName: 1,
          name: { $concat: ['$firstName', '$lastName'] },
        },
      },
      {
        $project: {
          userIdString: 1,
          usedDeals: 1,
          following: 1,
          followers: 1,
          defaultRun: 1,
          email: 1,
          createdDate: 1,
          modifiedDate: 1,
          profilePhoto: 1,
          aboutMe: 1,
          state: 1,
          followingCount: 1,
          followersCount: 1,
          firstName: 1,
          lastName: 1,
          splitArrayname: { $split: ['$name', ' '] },
        },
      },
      {
        $project: {
          userIdString: 1,
          usedDeals: 1,
          following: 1,
          followers: 1,
          defaultRun: 1,
          email: 1,
          createdDate: 1,
          modifiedDate: 1,
          profilePhoto: 1,
          aboutMe: 1,
          state: 1,
          followingCount: 1,
          followersCount: 1,
          firstName: 1,
          lastName: 1,
          namewithoutspace: {
            $toLower: {
              $reduce: {
                input: '$splitArrayname',
                initialValue: '',
                in: { $concat: ['$$value', '$$this'] },
              },
            },
          },
        },
      },
      {
        $match: {
          namewithoutspace: { $regex: searchText.toLowerCase() },
        },
      },
      {
        $project: {
          userIdString: 1,
          usedDeals: 1,
          following: 1,
          followers: 1,
          defaultRun: 1,
          email: 1,
          createdDate: 1,
          modifiedDate: 1,
          profilePhoto: 1,
          aboutMe: 1,
          state: 1,
          followingCount: 1,
          followersCount: 1,
          firstName: 1,
          lastName: 1,
        },
      },
    ]);
  } catch (err) {
    return Promise.reject(err);
  }
};

usersDbHelper.redeemDeal = async (userId, dealId, name, email, mobile) => {
  try {
    const usedDeal = { dealId, createdDate: new Date(), name, email, mobile };
    return await Users.updateOne(
      { _id: userId },
      {
        $push: { usedDeals: usedDeal },
      }
    );
  } catch (err) {
    return Promise.reject(err);
  }
};
usersDbHelper.emailVerify = async (id) => {
  try {
    const userId = await Users.findOne({ _id: id });
    if (userId.active === false) {
      await Users.updateOne({ _id: id }, { $set: { active: true } });
      return { message: 'Your account has been activated!' };
    }
    return { message: 'Email already verify' };
  } catch (err) {
    return { message: 'user not exist' };
  }
};
usersDbHelper.passwordReset = async (Email) => {
  try {
    return await Users.findOne({ email: Email });
  } catch (error) {
    return Promise.reject(error);
  }
};
usersDbHelper.passwordUpdate = async (Body) => {
  try {
    const body = Body;
    if (body._id && body.password) {
      const user = await Users.findOne({ _id: body._id });
      if (user._id) {
        body.password = body.password || defaultPassword;
        return bcrypt
          .hash(body.password, saltRounds)
          .then((encryptedPassword) => {
            Users.updateOne(
              { _id: body._id },
              { $set: { password: encryptedPassword } }
            ).then(() => {});
            return { message: ' Password update succesfully ' };
          });
      }
    }
    return { message: ' input needed ' };
  } catch (err) {
    return Promise.reject(new Error({ message: 'User not exist' }));
  }
};

usersDbHelper.followingSuggestion = async (userId) => {
  try {
    const existingUserIds = [Types.ObjectId(userId)];
    const userFollowingUserIds =
      await usersDbHelper.getOnlyFollowingIdsByUserId(userId);
  
    const notFollowingUsers =
      await usersDbHelper.getFollowingSuggestionQueryWithDefaultPageNo1(
        existingUserIds,
        0,
        parseInt(process.env.followingSuggestionCount, 10)
      );
    if (!notFollowingUsers) return [];
    for (let index = 0; index < notFollowingUsers.length; index += 1) {
      const element = notFollowingUsers[index];

      notFollowingUsers[index].totalRun = await authService.getTotalRunByUserId(
        element.userIdString
      );
    }
    // console.log('followingSuggestion  end date', new Date());
    // return notFollowingUsersData;
    return notFollowingUsers;
  } catch (error) {
    // console.log('error', error);
    return Promise.reject(error);
  }
};
usersDbHelper.getFollowingSuggestionQuery = async (
  ignoreUserIds,
  userId,
  skipNumber,
  numberPerPage
) =>
  Users.aggregate([
    {
      $match: {
        $and: [
          { _id: { $ne: Types.ObjectId(userId) } },
          { firstName: { $ne: null } },
        ],
      },
    },
    {
      $project: {
        userIdString: { $toString: '$_id' },
        usedDeals: 1,
        following: 1,
        followers: 1,
        defaultRun: 1,
        email: 1,
        createdDate: 1,
        modifiedDate: 1,
        firstName: 1,
        lastName: 1,
        profilePhoto: 1,
        aboutMe: 1,
        state: 1,
      },
    },
    {
      $match: { userIdString: { $nin: ignoreUserIds } },
    },
    {
      $lookup: {
        from: 'feeds',
        let: { userSchemaUserId: '$userIdString' },
        pipeline: [
          { $addFields: { actualUserId: { $toString: '$userId' } } },
          {
            $match: { $expr: { $eq: ['$actualUserId', '$$userSchemaUserId'] } },
          },
        ],
        as: 'feed',
      },
    },
    {
      $project: {
        userIdString: 1,
        usedDeals: 1,
        following: 1,
        followers: 1,
        defaultRun: 1,
        email: 1,
        createdDate: 1,
        modifiedDate: 1,
        firstName: 1,
        lastName: 1,
        profilePhoto: 1,
        aboutMe: 1,
        state: 1,
        followingCount: { $size: '$following' },
        followersCount: { $size: '$followers' },
        feedCount: { $size: '$feed' },
      },
    },
    {
      $sort: {
        createdDate: 1,
      },
    },
    {
      $facet: {
        data: [{ $skip: skipNumber }, { $limit: numberPerPage }],
      },
    },
  ]);

usersDbHelper.getFollowingSuggestionQueryWithDefaultPageNo1 = async (
  ignoreUserIds,
  skipNumber,
  numberPerPage
) =>
  Users.aggregate([
    {
      $match: {
        firstName: { $ne: null },
        _id: { $nin: ignoreUserIds },
      },
    },
    {
      $sort: {
        createdDate: -1,
      },
    },
    {
      $skip: skipNumber,
    },
    {
      $limit: numberPerPage,
    },
    {
      $project: {
        userIdString: { $toString: '$_id' },
        // following: 1,
        createdDate: 1,
        modifiedDate: 1,
        firstName: 1,
        lastName: 1,
        profilePhoto: 1,
        followersCount: { $size: '$followers' },
      },
    },
  ]);

usersDbHelper.getFollowingSuggestionQueryWithDefaultPageNo = async (
  ignoreUserIds,
  userId,
  skipNumber,
  numberPerPage
) =>
  Users.aggregate([
    {
      $match: {
        $and: [
          { _id: { $ne: Types.ObjectId(userId) } },
          { firstName: { $ne: null } },
        ],
      },
    },
    {
      $project: {
        userIdString: { $toString: '$_id' },
        usedDeals: 1,
        following: 1,
        followers: 1,
        defaultRun: 1,
        email: 1,
        createdDate: 1,
        modifiedDate: 1,
        firstName: 1,
        lastName: 1,
        profilePhoto: 1,
        aboutMe: 1,
        state: 1,
      },
    },
    {
      $match: { userIdString: { $nin: ignoreUserIds } },
    },
    {
      $sort: {
        createdDate: 1,
      },
    },
    {
      $facet: {
        data: [{ $skip: skipNumber }, { $limit: numberPerPage }],
      },
    },
  ]);

usersDbHelper.addFollowing = async (userId, followingUserId) => {
  try {
    if (userId && followingUserId) {
      const followingUser = { followingUserId, createdDate: new Date() };
      await Users.updateOne(
        { _id: userId },
        {
          $push: { following: followingUser },
        }
      );
      const followerUser = { followerUserId: userId, createdDate: new Date() };
      await Users.updateOne(
        { _id: followingUserId },
        {
          $push: { followers: followerUser },
        }
      );
    }
    return 'addFollowing not valid input';
  } catch (err) {
    return Promise.reject(err);
  }
};
usersDbHelper.removeFollowing = async (userId, _followingUserId) => {
  try {
    if (userId && _followingUserId) {
      await Users.updateOne(
        { _id: userId },
        {
          $pull: { following: { followingUserId: _followingUserId } },
        }
      );
      await Users.updateOne(
        { _id: _followingUserId },
        {
          $pull: { followers: { followerUserId: userId } },
        }
      );
    }
    return 'removeFollowing not valid input';
  } catch (err) {
    return Promise.reject(err);
  }
};

usersDbHelper.getFollowingbyUserId = async (userId) =>
  Users.findOne({ _id: userId, firstName: { $ne: null } });

usersDbHelper.getOnlyFollowingIdsByUserId = async (userId) => {
  const followingsColumns = await Users.findOne({
    _id: userId,
    firstName: { $ne: null },
  });
  return followingsColumns.following.map(
    (following) => following.followingUserId
  );
};

usersDbHelper.getFollowersbyUserId = async (userId) =>
  Users.findOne(
    { _id: userId, firstName: { $ne: null } },
    { followers: 1 }
  ).lean();

usersDbHelper.getFollowersbyUserIdWithPagination = async (
  userId,
  pagePerSize,
  skipNumber
) =>
  Users.find(
    { _id: userId, firstName: { $ne: null } },
    { followers: { $slice: [skipNumber, pagePerSize] } }
  );

usersDbHelper.usedDealsByUserId = async (userId) =>
  Users.findOne({ _id: userId, firstName: { $ne: null } }, { usedDeals: 1 });

usersDbHelper.getFollowingbyUserIdWithPagination = async (
  userId,
  pagePerSize,
  skipNumber
) =>
  Users.find(
    { _id: userId, firstName: { $ne: null } },
    { following: { $slice: [skipNumber, pagePerSize] } }
  );

usersDbHelper.getFollowingByUserId = async (
  userId,
  pagePerSize,
  skipNumber
) => {
  try {
    const booleanValue = { isFollowing: false };
    const followerIds = [];
    const usersArray = await usersDbHelper.getFollowingbyUserIdWithPagination(
      userId,
      pagePerSize,
      skipNumber
    );
    if (!usersArray) return [];

    const userOne = usersArray[0];
    if (!userOne || !userOne.following) return [];

    const updatedUsers = [];
    const followerList = await usersDbHelper.getFollowersbyUserId(userId);
    for (let i = 0; i < followerList.followers.length; i += 1) {
      followerIds.push(followerList.followers[i].followerUserId);
    }
    for (let index = 0; index < userOne.following.length; index += 1) {
      const { followingUserId } = userOne.following[index];

      if (followerIds.includes(followingUserId)) {
        booleanValue.isFollowing = true;
      } else {
        booleanValue.isFollowing = false;
      }
      const userDetails = await authService.getUserDetail(followingUserId);
      const finalResults = {
        ...userDetails,
        ...booleanValue,
      };
      updatedUsers.push(finalResults);
    }
    const result = await Promise.all(updatedUsers);
    return result;
  } catch (error) {
    return Promise.reject(error);
  }
};

usersDbHelper.getFollowing = async (userId, pageNumber, nPerPage) => {
  try {
    const followingUsers = await usersDbHelper.getFollowingbyUserId(userId);
    if (followingUsers && followingUsers.following) {
      const updatedUsers = [];
      for (let index = 0; index < followingUsers.following.length; index += 1) {
        const { followingUserId } = followingUsers.following[index];

        updatedUsers.push(await authService.getUserDetail(followingUserId));
      }
      if (pageNumber && nPerPage) {
        const offset = pageNumber > 0 ? (pageNumber - 1) * nPerPage : 0;
        return _.drop(updatedUsers, offset).slice(0, nPerPage);
      }
      return updatedUsers;
    }
    return [];
  } catch (error) {
    return Promise.reject(error);
  }
};

usersDbHelper.getAllFollowingByUserId = async (userId) => {
  try {
    // const startDate = new Date();
    // console.log(`-------Start`);
    const followingUsers = await usersDbHelper.getFollowingbyUserId(userId);
    if (followingUsers && followingUsers.following) {
      const updatedUsers = [];
      for (let index = 0; index < followingUsers.following.length; index += 1) {
        const { followingUserId } = followingUsers.following[index];

        updatedUsers.push(await authService.getUserDetail(followingUserId));
      }
      // const endDate = new Date();
      // const seconds = (endDate.getTime() - startDate.getTime()) / 1000;

      // console.log(
      //   `-------Total time taken to execute in minute ${seconds / 60}`
      // );
      return updatedUsers;
    }
    return [];
  } catch (error) {
    return Promise.reject(error);
  }
};

usersDbHelper.getFollowers = async (userId, pagePerSize, skipNumber) => {
  try {
    const booleanValue = { isFollowing: false };
    const usersArray = await usersDbHelper.getFollowersbyUserIdWithPagination(
      userId,
      pagePerSize,
      skipNumber
    );
    if (!usersArray) return [];
    const userOne = usersArray[0];

    if (!userOne || !userOne.followers) return [];

    const updatedUsers = [];
    const followingIds = [];
    // getFollowingbyUserIdWithPagination
    const followingList =
      await usersDbHelper.getFollowingbyUserIdWithPagination(
        userId,
        pagePerSize,
        skipNumber
      );
    for (let i = 0; i < followingList[0].following.length; i += 1) {
      followingIds.push(followingList[0].following[i].followingUserId);
    }
    for (let index = 0; index < userOne.followers.length; index += 1) {
      const { followerUserId } = userOne.followers[index];
      booleanValue.isFollowing = false;
      if (followingIds.includes(followerUserId)) {
        booleanValue.isFollowing = true;
      }
      // else{
      //   booleanValue.isFollowing = false;
      // }
      const userDetails = await authService.getUserDetail(followerUserId);
      const finalResults = {
        ...userDetails,
        ...booleanValue,
      };
      updatedUsers.push(finalResults);
    }
    const result = await Promise.all(updatedUsers);
    return result;
  } catch (error) {
    return Promise.reject(error);
  }
};

usersDbHelper.usedDealsByToken = async (userId) => {
  try {
    const deals = await usersDbHelper.usedDealsByUserId(userId);
    if (deals && deals.usedDeals) {
      return deals.usedDeals;
    }
    return [];
  } catch (error) {
    return Promise.reject(error);
  }
};

usersDbHelper.userList = async () => {
  try {
    const usersList = await Users.find({}).sort({ createdDate: -1 });
    const totalCount = usersList ? usersList.length : 0;
    return { usersList, totalCount };
  } catch (error) {
    return Promise.reject(error);
  }
};

usersDbHelper.userListCount = async () => {
  try {
    const totalCount = await Users.countDocuments();
    return { totalCount };
  } catch (error) {
    return Promise.reject(error);
  }
};

usersDbHelper.getSuggestion = async (userId, pageNumber, nPerPage) => {
  try {
    const userLocal = await usersDbHelper.getFollowingbyUserId(userId);
    if (userLocal && userLocal.following) {
      const followingUserIds = userLocal.following.map(
        (f) => f.followingUserId
      );

      const offset =
        parseInt(pageNumber, 10) > 0
          ? (parseInt(pageNumber, 10) - 1) * parseInt(nPerPage, 10)
          : 0;
      const updatedUsers =
        await usersDbHelper.getFollowingSuggestionQueryWithDefaultPageNo1(
          followingUserIds,
          offset,
          parseInt(nPerPage, 10)
        );

      if (!updatedUsers) return [];
      const updatedUsersData = updatedUsers;

      for (let index = 0; index < updatedUsersData.length; index += 1) {
        const element = updatedUsersData[index];
        updatedUsersData[index].totalRun =
          await authService.getTotalRunByUserId(element.userIdString);
      }
      return updatedUsersData;
    }
    return [];
  } catch (error) {
    return Promise.reject(error);
  }
};

usersDbHelper.updateDefaultRun = async (userId, updatedRunObj) => {
  try {
    await Users.updateOne(
      { _id: userId },
      {
        $push: { defaultRun: updatedRunObj },
      }
    );
    return null;
  } catch (err) {
    return Promise.reject(err);
  }
};

usersDbHelper.giveRun = async (userId, updatedRunObj) => {
  try {
    await Users.updateOne(
      { _id: userId },
      {
        $push: { defaultRun: updatedRunObj },
      }
    );
    return [];
  } catch (err) {
    return Promise.reject(err);
  }
};

usersDbHelper.getFollowersByVistingUserId = async (
  userId,
  visitingUserId,
  pagePerSize,
  skipNumber
) => {
  try {
    const booleanValue = { isFollowing: false };
    const usersArray = await usersDbHelper.getFollowersbyUserIdWithPagination(
      visitingUserId,
      pagePerSize,
      skipNumber
    );
    if (!usersArray) return [];
    const userOne = usersArray[0];
    if (!userOne || !userOne.followers) return [];
    const updatedUsers = [];
    const followingIds = [];
    const followingList =
      await usersDbHelper.getFollowingbyUserIdWithPagination(
        userId,
        pagePerSize,
        skipNumber
      );
    for (let i = 0; i < followingList[0].following.length; i += 1) {
      followingIds.push(followingList[0].following[i].followingUserId);
    }
    for (let index = 0; index < userOne.followers.length; index += 1) {
      booleanValue.isFollowing = false;
      const { followerUserId } = userOne.followers[index];
      if (followingIds.includes(followerUserId)) {
        booleanValue.isFollowing = true;
      } else {
        booleanValue.isFollowing = false;
      }
      const userDetails = await authService.getUserDetail(followerUserId);
      const finalResults = {
        ...userDetails,
        ...booleanValue,
      };
      updatedUsers.push(finalResults);
    }
    const result = await Promise.all(updatedUsers);
    return result;
  } catch (error) {
    return Promise.reject(error);
  }
};

usersDbHelper.getFollowingByVisitingUserId = async (
  userId,
  visitingUserId,
  pagePerSize,
  skipNumber
) => {
  try {
    const booleanValue = { isFollowing: false };
    const followingIds = [];
    const usersArray = await usersDbHelper.getFollowingbyUserIdWithPagination(
      visitingUserId,
      pagePerSize,
      skipNumber
    );
    if (!usersArray) return [];

    const userOne = usersArray[0];
    if (!userOne || !userOne.following) return [];

    const updatedUsers = [];
    const followingList =
      await usersDbHelper.getFollowingbyUserIdWithPagination(
        userId,
        pagePerSize,
        skipNumber
      );
    for (let i = 0; i < followingList[0].following.length; i += 1) {
      followingIds.push(followingList[0].following[i].followingUserId);
    }
    for (let index = 0; index < userOne.followers.length; index += 1) {
      booleanValue.isFollowing = false;
      const { followerUserId } = userOne.followers[index];
      if (followingIds.includes(followerUserId)) {
        booleanValue.isFollowing = true;
      } else {
        booleanValue.isFollowing = false;
      }
      const userDetails = await authService.getUserDetail(followerUserId);
      const finalResults = {
        ...userDetails,
        ...booleanValue,
      };
      updatedUsers.push(finalResults);
    }
    const result = await Promise.all(updatedUsers);
    return result;
  } catch (error) {
    return Promise.reject(error);
  }
};

usersDbHelper.updateOTP = async (id, authInput) => {
  try {
    await Users.updateOne(
      { _id: id },
      {
        $set: {
          ...authInput,
          modifiedDate: Date.now(),
        },
      }
    );
    return usersDbHelper.getbyId(id);
  } catch (err) {
    return Promise.reject(err);
  }
};
usersDbHelper.nameSearchOptimized = async (userId, searchText) => {
  try {
    return await Users.aggregate([
      // pipeline array
      { $match: { _id: { $ne: Types.ObjectId(userId) } } },
      {
        $project: {
          userIdString: { $toString: '$_id' },
          usedDeals: 1,
          following: 1,
          followers: 1,
          defaultRun: 1,
          email: 1,
          createdDate: 1,
          modifiedDate: 1,
          profilePhoto: 1,
          aboutMe: 1,
          state: 1,
          followingCount: { $size: '$following' },
          followersCount: { $size: '$followers' },
          firstName: 1,
          lastName: 1,
          name: { $concat: ['$firstName', ' ', '$lastName'] },
        },
      },
      { $match: { name: { $regex: searchText, $options: 'i' } } },
    ]);
  } catch (err) {
    return Promise.reject(err);
  }
};
usersDbHelper.mentionNameSearch = async (userId, searchText) => {
  try {
    return await Users.aggregate([
      // pipeline array
      { $match: { _id: { $ne: Types.ObjectId(userId) } } },
      {
        $project: {
          _id: 1,
          userIdString: '$_id',
          // usedDeals: 1,
          // following: 1,
          // followers: 1,
          // defaultRun: 1,
          email: 1,
          // createdDate: 1,
          // modifiedDate: 1,
          profilePhoto: 1,
          aboutMe: 1,
          // state: 1,
          // followingCount: { $size: '$following' },
          followersCount: { $size: '$followers' },
          firstName: 1,
          lastName: 1,
          youFollow: {
            $cond: {
              if: {
                $size: {
                  $filter: {
                    input: '$followers',
                    as: 'item',
                    cond: { $eq: ['$$item.followerUserId', userId] },
                  },
                },
              },
              then: true,
              else: false,
            },
          },
          name: { $concat: ['$firstName', ' ', '$lastName'] },
        },
      },
      { $match: { name: { $regex: searchText, $options: 'i' } } },
      { $sort: { youFollow: -1, followersCount: -1 } },
    ]).limit(5);
  } catch (err) {
    return Promise.reject(err);
  }
};

usersDbHelper.isEmailExist = async (mail) =>
  (await Users.countDocuments({ email: mail })) > 0;

usersDbHelper.getUserDetailsByUserId = async (userId) =>
  Users.findOne(
    { _id: userId },
    { firstName: 1, lastName: 1, profilePhoto: 1 }
  );

module.exports = usersDbHelper;
