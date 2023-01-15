const _ = require('lodash');
const emailObj = require('../helper/mail');
const authService = require('../helper/auth');
const dbHelper = require('./dbHelper');
const viewModel = require('./viewModel');
const inviteDbHelper = require('../invite/dbHelper');

const users = {};

users.logOutUser = async (id) => {
  try {
    if (id) {
      return await dbHelper.logOut(id);
    }
    return true;
  } catch (err) {
    return Promise.reject(err);
  }
};

users.add = async (req) => {
  try {
    if (req.body.email && req.body.password) {
      const dbUser = await dbHelper.save(req.body);

      // ..add default following
      const defaultUsers = process.env.DEFAULT_USERS.split(',');
      for (let index = 0; index < defaultUsers.length; index += 1) {
        const element = defaultUsers[index];
        // console.log(element);
        dbHelper.addFollowing(dbUser._id, element);
      }


      const { referredUserId, secretCode } = req.body;
      const inviteObj = await inviteDbHelper.getByUserAndSecretCode(
        referredUserId,
        secretCode
      );

      const refferedUser = await authService.getUserDetail(referredUserId);
      if (inviteObj) {
        // ...refferal Used functions
        // ... update current user defaulr run
        await dbHelper.updateDefaultRun(dbUser._id, {
          givenRun: parseInt(process.env.REFERRAL_USED_RUN, 10),
          createdDate: new Date(),
          type: 'referralUsed',
          runGivenByUserId: referredUserId,
        });

        setTimeout(async () => {
          const data = {
            firstName: refferedUser.firstName,
            lastName: refferedUser.lastName,
            givenRun: process.env.REFERRAL_RUN,
            createdUserProfilePhoto: dbUser.profilePhoto,
            createdUserId: dbUser._id,
            idForUI: refferedUser._id,
            userNameForUI: null,
            userProfilePhotoForUI: refferedUser.profilePhoto,
          };

          const data1 = {
            firstName: refferedUser.firstName,
            lastName: refferedUser.lastName,
            givenRun: process.env.REFERRAL_USED_RUN,
            createdUserProfilePhoto: dbUser.profilePhoto,
            createdUserId: dbUser._id,
            idForUI: refferedUser._id,
            userNameForUI: null,
            userProfilePhotoForUI: refferedUser.profilePhoto,
          };
        }, 30000);
      }

      return dbUser;
    }
    return {};
  } catch (err) {
    return Promise.reject(err);
  }
};

users.tokenValidation = async (req) => {
  try {
    if (req.headers.authorization) {
      const token = req.headers.authorization.split(' ')[1];
      return await dbHelper.tokenValidation(token);
    }
    return null;
  } catch (error) {
    return Promise.reject(error);
  }
};

users.validate = async (model) => {
  try {
    if (model) {
      const user = await dbHelper.validate(model);
      const { match, token, payload } = user;
      if (payload) {
        const userDetail = await authService.getUserDetail(payload.id);
        return { match, token, payload: { ...payload, ...userDetail } };
      }
      return user;
    }
    return null;
  } catch (err) {
    return Promise.reject(err);
  }
};

users.update = async (req) => {
  try {
    if (_.isEmpty(req.body.firstName) || _.isEmpty(req.body.lastName)) {
      return Promise.reject(
        new Error({ message: 'First and Last Name required' })
      );
    }
    const authViewModel = viewModel.createViewModel(req.body, req.files);
    const dbUser = await dbHelper.update(req.decoded.id, authViewModel);

    const { referredUserId, secretCode } = req.body;

    if (
      referredUserId &&
      secretCode &&
      referredUserId !== '0' &&
      secretCode !== '0'
    ) {
      // ...update invite model make active false
      inviteDbHelper.updateInactiveByUserAndSecretCode(
        referredUserId,
        secretCode
      );

      // ...update ferreral run in referredUser
      // { givenRun: 1000, createdDate: new Date(), runGivenByUserId: 'system' }
      await dbHelper.updateDefaultRun(referredUserId, {
        givenRun: parseInt(process.env.REFERRAL_RUN, 10),
        createdDate: new Date(),
        type: 'referred',
        runGivenByUserId: dbUser._id,
      });

      // ...emit Total Run to referredUser
      const data = {
        firstName: dbUser.firstName,
        lastName: dbUser.lastName,
        givenRun: process.env.REFERRAL_RUN,
        createdUserProfilePhoto: dbUser.profilePhoto,
        createdUserId: referredUserId,
        idForUI: dbUser._id,
        userNameForUI: null,
        userProfilePhotoForUI: null,
      };

      const data1 = {
        firstName: dbUser.firstName,
        lastName: dbUser.lastName,
        givenRun: process.env.REFERRAL_RUN,
        createdUserProfilePhoto: dbUser.profilePhoto,
        createdUserId: referredUserId,
        idForUI: dbUser._id,
        userNameForUI: null,
        userProfilePhotoForUI: null,
      };
    }

    return dbUser;
  } catch (err) {
    return Promise.reject(err);
  }
};

users.nameSearch = async (req) => {
  try {
    if (!req.body.searchText && req.body.searchText === '') return [];
    const nameSearchs = await dbHelper.nameSearchOptimized(
      req.decoded.id,
      req.body.searchText
    );

    return nameSearchs;
    console.log('nameSearchs',nameSearchs,req.body);

    const skipNumber =
      (parseInt(req.body.pageNumber, 10) - 1) *
      parseInt(req.body.pagePerSize, 10);
    const pagePerSize = parseInt(req.body.pagePerSize, 10);
    const sorted = _.sortBy(nameSearchs, [
      // eslint-disable-next-line func-names
      function (o) {
        return o.modifiedDate;
      },
    ]).reverse();
    const end = skipNumber + pagePerSize;
    const slicedList = sorted.slice(skipNumber, end);

    if (!slicedList) return [];
    for (let index = 0; index < slicedList.length; index += 1) {
      const element = slicedList[index];

      slicedList[index].totalRun = await authService.getTotalRunByUserId(
        element.userIdString
      );
    }

    // console.log('req.body.searchText', slicedList, skipNumber, end);

    return slicedList;
  } catch (err) {
    return Promise.reject(err);
  }
};


users.verify = async (req) => {
  try {
    if (req.body._id) {
      return await dbHelper.emailVerify(req.body._id);
    }
    return 'verify bodyId required';
  } catch (err) {
    return Promise.reject(err);
  }
};

users.passwordReset = async (body) => {
  try {
    if (body.email) {
      const userEmail = await dbHelper.passwordReset(body.email);
      if (!userEmail.email) return 'User Mail not exist';
      if (userEmail.email) {
        const mail = {
          to: userEmail.email,
          subject: 'Reset Password :',
          html: `Dear user,
                    \t Forget your password ?   we received a request to reset the password for your account,To reset your password please click on the link below
                (or copy and paste it into your browser if you are not able to click it)
               \nThank you!
                -Team Cricket Media
                \t ${process.env.ROOTUIADDRESS}/passwordReset/${userEmail._id}`,
        };
        await emailObj.send(mail);
      }
    }
    return null;
  } catch (err) {
    return Promise.reject(err);
  }
};
users.passwordUpdate = async (req) => {
  try {
    return await dbHelper.passwordUpdate(req.body);
  } catch (err) {
    return Promise.reject(err);
  }
};

users.followingSuggestion = async (req) => {
  try {
    return await dbHelper.followingSuggestion(req.decoded.id);
  } catch (err) {
    return Promise.reject(err);
  }
};

users.addFollowing = async (req) => {
  try {
    if (req.decoded.id === req.body.followingUserId)
      return 'Can not follow to self';
    await dbHelper.addFollowing(req.decoded.id, req.body.followingUserId);
    const userDetail = await dbHelper.getbyId(req.decoded.id);
    const data = {
      firstName: userDetail.firstName,
      lastName: userDetail.lastName,
      createdUserProfilePhoto: null,
      createdUserId: req.body.followingUserId,
      idForUI: req.decoded.id,
      userNameForUI: null,
      userProfilePhotoForUI: userDetail.profilePhoto,
    };
    return 'Following added successfully';
  } catch (err) {
    return Promise.reject(err);
  }
};

users.removeFollowing = async (req) => {
  try {
    return await dbHelper.removeFollowing(
      req.decoded.id,
      req.body.followingUserId
    );
  } catch (err) {
    return Promise.reject(err);
  }
};

users.getFollowing = async (req) => {
  try {
    return await dbHelper.getFollowing(req.decoded.id);
  } catch (err) {
    return Promise.reject(err);
  }
};

users.getFollowers = async (req) => {
  try {
    const skipNumber =
      (parseInt(req.params.pageNumber, 10) - 1) *
      parseInt(req.params.pagePerSize, 10);
    const pagePerSize = parseInt(req.params.pagePerSize, 10);
    return await dbHelper.getFollowers(req.decoded.id, pagePerSize, skipNumber);
  } catch (err) {
    return Promise.reject(err);
  }
};

users.getFollowingByUserId = async (req) => {
  try {
    const skipNumber =
      (parseInt(req.params.pageNumber, 10) - 1) *
      parseInt(req.params.pagePerSize, 10);
    const pagePerSize = parseInt(req.params.pagePerSize, 10);
    return await dbHelper.getFollowingByUserId(
      req.params.id,
      pagePerSize,
      skipNumber
    );
  } catch (err) {
    return Promise.reject(err);
  }
};

users.getAllFollowingByUserId = async (req) => {
  try {
    return await dbHelper.getAllFollowingByUserId(req.params.id);
  } catch (err) {
    return Promise.reject(err);
  }
};

users.getFollowersByUserId = async (req) => {
  try {
    const skipNumber =
      (parseInt(req.params.pageNumber, 10) - 1) *
      parseInt(req.params.pagePerSize, 10);
    const pagePerSize = parseInt(req.params.pagePerSize, 10);
    return await dbHelper.getFollowers(req.params.id, pagePerSize, skipNumber);
  } catch (err) {
    return Promise.reject(err);
  }
};

users.usedList = async () => {
  try {
    return await dbHelper.userList();
  } catch (err) {
    return Promise.reject(err);
  }
};

users.userListCount = async () => {
  try {
    return await dbHelper.userListCount();
  } catch (err) {
    return Promise.reject(err);
  }
};

users.getSuggestion = async (req) => {
  try {
    return await dbHelper.getSuggestion(
      req.decoded.id,
      req.params.pageNumber,
      req.params.pagePerSize
    );
  } catch (err) {
    return Promise.reject(err);
  }
};


users.usedDealsByToken = async (req) => {
  try {
    return await dbHelper.usedDealsByToken(req.decoded.id);
  } catch (err) {
    return Promise.reject(err);
  }
};

users.getFollowersByVistingUserId = async (req) => {
  try {
    const skipNumber =
      (parseInt(req.params.pageNumber, 10) - 1) *
      parseInt(req.params.pagePerSize, 10);
    const pagePerSize = parseInt(req.params.pagePerSize, 10);
    return await dbHelper.getFollowersByVistingUserId(
      req.decoded.id,
      req.params.visitingUserId,
      pagePerSize,
      skipNumber
    );
  } catch (err) {
    return Promise.reject(err);
  }
};

users.getFollowingByVisitingUserId = async (req) => {
  try {
    const skipNumber =
      (parseInt(req.params.pageNumber, 10) - 1) *
      parseInt(req.params.pagePerSize, 10);
    const pagePerSize = parseInt(req.params.pagePerSize, 10);
    return await dbHelper.getFollowingByVisitingUserId(
      req.decoded.id,
      req.params.visitingUserId,
      pagePerSize,
      skipNumber
    );
  } catch (err) {
    return Promise.reject(err);
  }
};

users.isEmailExist = async (req) => {
  try {
    if (!req.body.email) return 'Email required!';
    return dbHelper.isEmailExist(req.body.email);
  } catch (error) {
    return Promise.reject(error);
  }
};

users.getUserDetailsByUserId = async (userId) => {
  try {
    if (!userId) return 'User Id required!';
    return dbHelper.getUserDetailsByUserId(userId);
  } catch (error) {
    return Promise.reject(error);
  }
};

module.exports = users;
