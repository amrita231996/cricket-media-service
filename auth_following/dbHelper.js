// 'use strict';

// const _ = require('lodash');
// const jwt = require('jsonwebtoken');
// const bcrypt = require('bcryptjs');
// const saltRounds = 10;

const model = require('./model');
// const authService = require('../helper/auth');

const dbHelper = {};

dbHelper.save = async (input) => {
  try {
    // ...add in auth_following collection
    const addInFollowing = model.save(input);

    // ...add in auth_follower collection

    return Promise.all([addInFollowing]);
  } catch (err) {
    return Promise.reject(err);
  }
};

module.exports = dbHelper;
