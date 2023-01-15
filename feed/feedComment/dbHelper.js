const Comment = require('./model');
const authservice = require('../../helper/auth');

const CommentModelDbHelper = {};

CommentModelDbHelper.create = async (vModel) => {
  try {
    const obj = new Comment(vModel);
    return await obj.save();
  } catch (err) {
    return Promise.reject(err);
  }
};

CommentModelDbHelper.updatedIsChildCommentTrue = async (parentId) => {
  try {
    await Comment.updateOne(
      { parentCommentId: parentId },
      {
        $set: {
          isChildComment: true,
          modifiedDate: Date.now(),
        },
      }
    );
    return '';
  } catch (error) {
    return Promise.reject(error);
  }
};

CommentModelDbHelper.delete = async (req) => {
  try {
    const { body, decoded } = req;
    await Comment.updateOne(
      { userId: decoded.id, _id: body.commentId },
      {
        $set: {
          active: false,
          modifiedDate: Date.now(),
        },
      }
    );
    return '';
  } catch (err) {
    return Promise.reject(err);
  }
};

CommentModelDbHelper.getCommentsCountByTodayDateAndUserId = async (userId) => {
  const today = new Date();
  const todayDateWithoutTime = `${
    today.toISOString().split('T')[0]
  }T00:00:00.000Z`;

  return Comment.countDocuments({
    userId,
    createdDate: { $gte: new Date(todayDateWithoutTime) },
  });
};

CommentModelDbHelper.getByfeedId = async (
  feedId,
  skipNumber,
  numberPerPage
) => {
  try {
    return await Comment.find({
      active: true,
      postId: feedId,
    })
      .sort({ createdDate: -1 })
      .skip(skipNumber)
      .limit(numberPerPage)
      .select({
        _id: 1,
        userId: 1,
        userName: 1,
        userProfilePhoto: 1,
        postId: 1,
        text: 1,
        parentCommentId: 1,
        isChildComment: 1,
        createdDate: 1,
      })
      .lean();
  } catch (error) {
    return Promise.reject(error);
  }
};

CommentModelDbHelper.updateUser = async (userDetail) => {
  Comment.updateMany(
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

CommentModelDbHelper.updateUndefinedUsername = async () => {
  try {
    const userNameList = await Comment.find({
      userName: 'undefined undefined',
    });
    if (userNameList.length > 0) {
      for (let i = 0; i < userNameList.length; i += 1) {
        const userIdL = userNameList[i].userId;
        const userdetails = await authservice.getUserDetail(userIdL);
        if (userdetails) {
          const userNameL = `${userdetails.firstName} ${userdetails.lastName}`;
          await Comment.updateMany(
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


CommentModelDbHelper.getCountByFeedId = async (feedId) => {
  try {
    return await Comment.countDocuments({
      postId: feedId,
    });
  } catch (error) {
    return Promise.reject(error);
  }
};

module.exports = CommentModelDbHelper;
