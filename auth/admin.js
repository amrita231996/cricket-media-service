const createAdmin = require('./dbHelper');
const roles = require('./roles');

const admin = {
  email: process.env.ADMINEMAIL,
  password: process.env.ADMINPASSWORD,
  role: roles[1],
  mobileNo: process.env.ADMINMOBILENUM,
};
// createAdmin.save(admin);
