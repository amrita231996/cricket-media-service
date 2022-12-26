const express = require('express');
const authHelper = require('../../helper/auth');
const controller = require('./controller');

const router = express.Router();

router.post('/create', authHelper.validateToken, (req, res, next) =>
  controller
    .create(req)
    .then((success) => res.status(200).json(success))
    .catch((err) => next(err))
);

router.get(
  '/getByfeedId/:feedId/:pageNumber/:pagePerSize',
  authHelper.validateToken,
  (req, res, next) =>
    controller
      .getByfeedId(
        req.params.feedId,
        req.params.pageNumber,
        req.params.pagePerSize
      )
      .then((data) => res.status(200).json(data))
      .catch((err) => next(err))
);

router.post('/delete', authHelper.validateToken, (req, res, next) =>
  controller
    .delete(req)
    .then((success) => res.status(200).json(success))
    .catch((err) => next(err))
);

router.get(
  '/update-undefined-username-comment',
  authHelper.validateToken,
  (req, res, next) =>
    controller
      .updateUndefinedUsername()
      .then((success) => res.status(200).json(success))
      .catch((err) => next(err))
);

module.exports = router;
