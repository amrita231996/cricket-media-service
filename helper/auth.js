const jwt = require('jsonwebtoken');
const users = require('../auth/model');
const feed = require('../feed/model');

const authService = {};

authService.createIndex = async (req, res, next) => {
  try {
    users.createIndex({ token: 1 });
    users.createIndex({ email: 1 });
    feed.createIndex({ userId: 1 });
    invite.createIndex({ secretCode: 1, userId: 1, active: 1 }); // compund
    // notification.createIndex({ userId: 1, createdDate: -1 }); // compund index
    // notification.createIndex({ userId: 1, active: 1 }); // compund index
    res.status(401).send(res);
  } catch (error) {
    // console.log('createIndex ', error);
    res.status(500).send({ message: error });
  }
};

authService.validateToken = async (req, res, next) => {
  const authorizationHeaader = req.headers.authorization;

  let result;
  if (authorizationHeaader) {
    const token = req.headers.authorization.split(' ')[1]; // Bearer <token>
    const options = { expiresIn: '1d' };
    try {
      // verify makes sure that the token hasn't expired and has been issued by us
      result = jwt.verify(token, process.env.JWT_SECRET, options);

      users
        .findOne({ token })
        .exec()
        .then((u) => {
          if (u) {
            req.decoded = result;
            next();
          } else {
            // console.log('402 token expire');
            res.status(401).send({ message: 'token expire' });
          }
        });
    } catch (err) {
      // console.log('401 token expire');
      res.status(401).send({ message: 'token expire' });
    }
  } else {
    result = {
      error: `Authentication error. Token required.`,
      status: 401,
    };
    // console.log('401');
    res.status(401).send(result);
  }
};

authService.mergeUserInfoWithRes = (data, req) => {
  if (req.decoded) {
    const { userName, roleId } = req.decoded;
    return { data, userName, roleId };
  }
  return { data };
};

authService.getTotalRunByUserId = async (userId) => {
  const promiseResult = await Promise.all([
    authService.getDefaultRunByUserId(userId),
    authService.getTotalGivenRunByUserId(userId),
    authService.getDealsRunByUserId(userId),
  ]);
  const deafultRun = promiseResult[0];
  const totalRunGiven = promiseResult[1];
  const totalDealRun = promiseResult[2];
  return deafultRun + totalRunGiven - totalDealRun;
};

authService.getDefaultRunByUserId = async (userId) => {
  try {
    let totalRun = 0;
    const runs = await users.findOne({ _id: userId }, { defaultRun: 1 });
    if (!runs) return totalRun;
    const defaultRun = runs && runs.defaultRun ? runs.defaultRun : [];
    for (let index = 0; index < defaultRun.length; index += 1) {
      const runDetail = defaultRun[index];
      totalRun += runDetail.givenRun;
    }
    return totalRun;
  } catch (error) {
    return Promise.reject(error);
  }
};

authService.getDealsRunByUserId = async (userId) => {
  let totalRun = 0;
  const deals = await users.findOne({ _id: userId }, { usedDeals: 1 });
  const usedDeals = deals && deals.usedDeals ? deals.usedDeals : [];
  for (let index = 0; index < usedDeals.length; index += 1) {
    const dealDetail = usedDeals[index];
    const dealObj = await deal.findOne({ _id: dealDetail.dealId });
    totalRun += dealObj.redeemrun;
  }
  return totalRun;
};

authService.getTotalGivenRunByUserId = async (userId) => {
  let totalRun = 0;
  const feedesRunByUserId = await feed
    .find({ userId })
    .select({ postRunCount: 1 })
    .lean();
  for (let index = 0; index < feedesRunByUserId.length; index += 1) {
    const element = feedesRunByUserId[index];
    totalRun += element.postRunCount ? element.postRunCount : 0;
  }
  return totalRun;
};

authService.totalRunInEachfeed = (runs) => {
  let totalRun = 0;
  for (let index = 0; index < runs.length; index += 1) {
    const element = runs[index];
    totalRun += element.givenRun;
  }
  return totalRun;
};

authService.getUserDetailByName = async (f, l) => {
  const first = f.substring(1);
  const second = l;
  const foundUser = await users.findOne({
    $and: [{ firstName: first }, { lastName: second }],
  });
  return foundUser;
};

authService.getUserDetail = async (userId) => {
  const userDetailPromise = users.findOne({ _id: userId });
  const userfeedesPromise = feed.countDocuments({ userId });
  const results = await Promise.all([userDetailPromise, userfeedesPromise]);

  const userDetail = results[0];
  const userfeedCount = results[1];

  if (!userDetail) return null;
  const {
    firstName,
    lastName,
    _id,
    profilePhoto,
    state,
    aboutMe,
    // eslint-disable-next-line camelcase
    address_1,
    // eslint-disable-next-line camelcase
    address_2,
    following,
    followers,
    role,
    email,
  } = userDetail;
  const totalRun = await authService.getTotalRunByUserId(userId);
  const followingCount = following ? following.length : 0;
  const followersCount = followers ? followers.length : 0;
  const feedCount = userfeedCount;
  return {
    firstName,
    lastName,
    _id,
    profilePhoto,
    state,
    aboutMe,
    // eslint-disable-next-line camelcase
    address_1,
    // eslint-disable-next-line camelcase
    address_2,
    totalRun,
    followingCount,
    followersCount,
    feedCount,
    role,
    email,
    // aboutMe,
  };
};

authService.getAttrWithUserDetail = async (attr, userId) => {
  const user = await authService.getUserDetail(userId);
  return {
    ...attr,
    ...user,
  };
};

authService.validateAdminAndSuperAdmin = async (req, res, next) => {
  if (req.decoded.role === 'Admin' || req.decoded.role === 'SuperAdmin') {
    next();
  } else {
    res.status(401).send({ message: 'access denied' });
  }
};

module.exports = authService;
