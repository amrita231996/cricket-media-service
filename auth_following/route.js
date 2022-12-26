const express = require('express');
const authHelper = require('../helper/auth');
const controller = require('./controller');

const router = express.Router();

router.post('/add-following-user', authHelper.validateToken, (req, res, next) =>
  controller
    .add(req)
    .then((data) => res.status(200).json({ message: data }))
    .catch((err) => next(err))
);

module.exports = router;
