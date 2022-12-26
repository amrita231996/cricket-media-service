// const _ = require('lodash');
const dbHelper = require('./dbHelper');

const controller = {};

controller.add = async (req) => {
  try {
    const { followingUserId } = req.body;
    const { id } = req.decoded;
    if (id === followingUserId) return 'Can not follow to self';
    if (!followingUserId) return 'Field is required!';
    dbHelper.save();
    return 'Following added successfully';
  } catch (err) {
    return Promise.reject(err);
  }
};

module.exports = controller;
