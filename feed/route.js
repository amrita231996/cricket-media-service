const express = require('express');
const authHelper = require('../helper/auth');
const controller = require('./controller');

const commentRouter = require('./feedComment/route');
const reportRouter = require('./feedReport/route');

const router = express.Router();

router.use('/comment', commentRouter);
router.use('/report', reportRouter);

router.post('/create', authHelper.validateToken, (req, res, next) =>
  controller
    .create(req)
    .then((success) => res.status(200).json(success))
    .catch((err) => next(err))
);

router.post('/update', authHelper.validateToken, (req, res, next) =>
  controller
    .update(req)
    .then((success) => res.status(200).json(success))
    .catch((err) => next(err))
);

router.post('/delete', authHelper.validateToken, (req, res, next) =>
  controller
    .delete(req)
    .then((success) => res.status(200).json(success))
    .catch((err) => next(err))
);

router.post('/shared', authHelper.validateToken, (req, res, next) =>
  controller
    .shared(req)
    .then((success) => res.status(200).json(success))
    .catch((err) => next(err))
);

router.get(
  '/getAll/:pageNumber/:pagePerSize/:dateTime',
  authHelper.validateToken,
  (req, res, next) =>
    controller
      .getAllbyUserId(req)
      .then((data) => res.status(200).json(data))
      .catch((err) => next(err))
);

router.get(
  '/getMyfeed/:pageNumber/:pagePerSize',
  authHelper.validateToken,
  (req, res, next) =>
    controller
      .getMyfeed(req.decoded.id, req.params.pageNumber, req.params.pagePerSize)
      .then((data) => res.status(200).json(data))
      .catch((err) => next(err))
);

router.get('/getTotalRun', authHelper.validateToken, (req, res, next) =>
  controller
    .getTotalRunbyUserId(req)
    .then((data) => res.status(200).json(data))
    .catch((err) => next(err))
);

router.post('/search-feed-by-text', (req, res, next) =>
  controller
    .feedSearch(req)
    .then((data) => res.status(200).json(data))
    .catch((err) => next(err))
);

router.get(
  '/get-following-feed/:pageNumber/:pagePerSize',
  authHelper.validateToken,
  (req, res, next) =>
    controller
      .getFollowingUserfeed(req)
      .then((data) => res.status(200).json(data))
      .catch((err) => next(err))
);

router.get('/feedById/:id', authHelper.validateToken, (req, res, next) =>
  controller
    .getFeedById(req)
    .then((data) => res.status(200).json(data))
    .catch((err) => next(err))
);

router.post('/multiplefeedByIds', authHelper.validateToken, (req, res, next) =>
  controller
    .getMultiplefeedById(req)
    .then((data) => res.status(200).json(data))
    .catch((err) => next(err))
);

router.post(
  '/update-shared-feed',
  authHelper.validateToken,
  (req, res, next) =>
    controller
      .updateSharedFeed(req)
      .then(() => res.status(200).json('shared feed updated!'))
      .catch((err) => next(err))
);

router.get(
  '/feedByUserId/:id/:pageNumber/:pagePerSize',
  authHelper.validateToken,
  (req, res, next) =>
    controller
      .getMyFeed(req.params.id, req.params.pageNumber, req.params.pagePerSize)
      .then((data) => res.status(200).json(data))
      .catch((err) => next(err))
);

router.post(
  '/getSharedfeedDetails',
  authHelper.validateToken,
  (req, res, next) =>
    controller
      .getSharedfeedDetails(req.body)
      .then((results) => res.status(200).json(results))
      .catch((err) => next(err))
);

router.get('/runScript', (req, res, next) =>
  script()
    .then(() => res.status(200).json('done'))
    .catch((err) => next(err))
);

router.get(
  '/update-undefined-username-run',
  authHelper.validateToken,
  (req, res, next) =>
    controller
      .updateUndefinedUsername()
      .then((success) => res.status(200).json(success))
      .catch((err) => next(err))
);

module.exports = router;
