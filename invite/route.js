const express = require('express');
const authHelper = require('../helper/auth');
const controller = require('./controller');
const logger = require('../config/logger');

const router = express.Router();

router.get('/inviteLink', authHelper.validateToken, (req, res, next) => {
  return controller
    .getInviteLink(req)
    .then((data) => {
      res.status(200).json({ inviteLink: data });
    })
    .catch((err) => next(err));
});

router.post('/sendEmail', authHelper.validateToken, (req, res, next) => {
  return controller
    .sendEmail(req)
    .then(() => {
      res.status(200).json('invite sent!');
    })
    .catch((err) => next(err));
});

router.get('/validate/:userId/:secretCode', (req, res, next) => {
  return controller
    .validate(req.params)
    .then((data) => {
      return res.status(200).json(data);
    })
    .catch((err) => next(err));
});

module.exports = router;
