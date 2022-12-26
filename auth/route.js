const express = require('express');
const upload = require('../helper/upload');
const authHelper = require('../helper/auth');
const authService = require('../helper/auth');
const controller = require('./controller');
const OTPController = require('./OTP/OTPController');

const router = express.Router();

router.post('/sign-up', (req, res, next) =>
  OTPController.verifyOTPByEmail(req).then(() =>
    controller.add(req).then((result) => {
      OTPController.deleteOTPByEmail(req.body.email, req.body.otp);
      return res.status(200).json({ data: result, otpRes: {} });
    })
  )
);

router.post('/login', (req, res, next) =>
  controller
    .validate(req.body)
    .then((response) => res.status(200).json({ data: response }))
    .catch((err) => {
      next(err);
    })
);

router.post('/logout', (req, res, next) =>
  controller
    .logOutUser(req.body.id)
    .then(() => res.status(200).json({ message: 'logout succesfully' }))
    .catch((err) => {
      next(err);
    })
);

router.post(
  '/update',
  authHelper.validateToken,
  upload.saveImage,
  (req, res, next) =>
    controller
      .update(req)
      .then((data) => res.status(200).json(data))
      .catch((err) => next(err))
);

router.post('/name-search', authHelper.validateToken, (req, res, next) =>
  controller
    .nameSearch(req)
    .then((data) => res.status(200).json(data))
    .catch((err) => next(err))
);

router.post('/userSearch', authHelper.validateToken, (req, res, next) =>
  authService
    .getUserDetailByName(req.body.firstName, req.body.lastName)
    .then((data) => res.status(200).json(data))
    .catch((err) => next(err))
);

router.post('/profile', authHelper.validateToken, (req, res, next) =>
  authService
    .getUserDetail(req.body.userId)
    .then((data) => res.status(200).json(data))
    .catch((err) => next(err))
);

router.post('/verify', (req, res, next) =>
  controller
    .verify(req)
    .then((data) => res.status(200).json(data))
    .catch((err) => next(err))
);

router.post('/passwordReset', (req, res, next) =>
  controller
    .passwordReset(req.body)
    .then((data) => res.status(200).json(data))
    .catch((err) => next(err))
);

router.post('/passwordUpdate', (req, res, next) =>
  controller
    .passwordUpdate(req)
    .then((data) => res.status(200).json(data))
    .catch((err) => next(err))
);

router.get(
  '/following-suggestion-users',
  authHelper.validateToken,
  (req, res, next) =>
    controller
      .followingSuggestion(req)
      .then((data) => res.status(200).json(data))
      .catch((err) => {
        next(err);
      })
);

router.get('/validateToken', (req, res, next) =>
  controller
    .tokenValidation(req)
    .then((data) => res.status(200).json({ status: data }))
    .catch((err) => {
      next(err);
    })
);

router.post('/add-following-user', authHelper.validateToken, (req, res, next) =>
  controller
    .addFollowing(req)
    .then((data) => res.status(200).json({ message: data }))
    .catch((err) => next(err))
);

router.get('/get-following-user', authHelper.validateToken, (req, res, next) =>
  controller
    .getFollowing(req)
    .then((data) => res.status(200).json(data))
    .catch((err) => next(err))
);

router.post(
  '/remove-following-user',
  authHelper.validateToken,
  (req, res, next) =>
    controller
      .removeFollowing(req)
      .then(() => res.status(200).json({ message: 'UnFollowing successfully' }))
      .catch((err) => next(err))
);

router.get(
  '/get-followers-user/:pageNumber/:pagePerSize',
  authHelper.validateToken,
  (req, res, next) =>
    controller
      .getFollowers(req)
      .then((data) => res.status(200).json(data))
      .catch((err) => next(err))
);

router.get(
  '/get-following-byuserid/:id/:pageNumber/:pagePerSize',
  authHelper.validateToken,
  (req, res, next) =>
    controller
      .getFollowingByUserId(req)
      .then((data) => res.status(200).json(data))
      .catch((err) => next(err))
);

router.get(
  '/get-all-following-byuserid/:id',
  authHelper.validateToken,
  (req, res, next) =>
    controller
      .getAllFollowingByUserId(req)
      .then((data) => res.status(200).json(data))
      .catch((err) => next(err))
);

router.get(
  '/get-followers-byuserid/:id/:pageNumber/:pagePerSize',
  authHelper.validateToken,
  (req, res, next) =>
    controller
      .getFollowersByUserId(req)
      .then((data) => res.status(200).json(data))
      .catch((err) => next(err))
);

router.get('/get-all-user', authHelper.validateToken, (req, res, next) =>
  controller
    .usedList()
    .then((data) => res.status(200).json(data))
    .catch((err) => {
      next(err);
    })
);

router.get('/get-all-user-count', (req, res, next) =>
  controller
    .userListCount()
    .then((data) => res.status(200).json(data))
    .catch((err) => {
      next(err);
    })
);

router.get(
  '/get-all-suggestion-users/:pageNumber/:pagePerSize',
  authHelper.validateToken,
  (req, res, next) =>
    controller
      .getSuggestion(req)
      .then((data) => res.status(200).json(data))
      .catch((err) => {
        next(err);
      })
);

router.get(
  '/get-followers-by-visitingUserId/:visitingUserId/:pageNumber/:pagePerSize',
  authHelper.validateToken,
  (req, res, next) =>
    controller
      .getFollowersByVistingUserId(req)
      .then((data) => res.status(200).json(data))
      .catch((err) => next(err))
);

router.get(
  '/get-following-by-visitingUserId/:visitingUserId/:pageNumber/:pagePerSize',
  authHelper.validateToken,
  (req, res, next) =>
    controller
      .getFollowingByVisitingUserId(req)
      .then((data) => res.status(200).json(data))
      .catch((err) => next(err))
);

router.post('/check-email-exist', (req, res, next) =>
  controller
    .isEmailExist(req)
    .then((data) => res.status(200).json(data))
    .catch((err) => next(err))
);

router.post('/sendOTP', (req, res, next) =>
  OTPController.sendOTP(req)
    .then((messageText) => res.status(200).json({ message: messageText }))
    .catch((err) => {
      next(err);
    })
);

router.post('/verifyOTP', (req, res, next) =>
  OTPController.verifyOTPByEmail(req)
    .then((response) => res.status(200).json(response))
    .catch((err) => {
      next(err);
    })
);

router.post('/reSendOTP', (req, res, next) =>
  OTPController.reSendOTP(req)
    .then(() => res.status(200).json({ message: 'OTP resent successfully' }))
    .catch((err) => {
      next(err);
    })
);

router.post(
  '/getUserDetailsByUserId',
  authHelper.validateToken,
  (req, res, next) =>
    controller
      .getUserDetailsByUserId(req.body.userId)
      .then((data) => res.status(200).json(data))
      .catch((err) => next(err))
);

module.exports = router;
