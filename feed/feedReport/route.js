const express = require('express');
const authHelper = require('../../helper/auth');
const controller = require('./controller');

const router = express.Router();

router.post('/create', authHelper.validateToken, (req, res, next) =>
  controller
    .report(req)
    .then((data) => res.status(200).json(data))
    .catch((err) => next(err))
);

router.get(
  '/update-undefined-username-report',
  authHelper.validateToken,
  (req, res, next) =>
    controller
      .updateUndefinedUsername()
      .then((success) => res.status(200).json(success))
      .catch((err) => next(err))
);

module.exports = router;
