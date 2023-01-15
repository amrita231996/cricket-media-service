const dbHelper = require('./dbHelper');
const authService = require('../helper/auth');
const viewModel = require('./viewModel');
const emailObj = require('../helper/mail');

const invite = {};

invite.getInviteLink = async (req) => {
  try {
    const createViewModel = viewModel.createViewModel(req);
    await dbHelper.save(createViewModel);
    return ` ${process.env.ROOTUIADDRESS}/invite/${createViewModel.userId}/${createViewModel.secretCode}`;
  } catch (err) {
    return Promise.reject(err);
  }
};

invite.sendEmail = async (req) => {
  try {
    const inviteLink = await invite.getInviteLink(req);
    const userDetail = await authService.getUserDetail(req.decoded.id);
    const name = `${userDetail.firstName} ${userDetail.lastName}`;
    const mail = {
      to: req.body.email,
      subject: `Invitation from ${name}`,
      html: `<p>Hi there!</p>
            <p>Your friend ${name} has invited you to check out Champhunt -
            the first of its kind Cricket-only networking platform where you can interact
            with fellow Cricket lovers and win exciting gifts in the process</p>
            <p>Please join by clicking here<a href="${inviteLink}"> ${inviteLink}<a>.</p>
            <p>Looking forward to hosting you! </p>
            <p>- Team Champhunt</p>`,
    };
    await emailObj.send(mail);
    return 'Mail Sent';
  } catch (err) {
    return Promise.reject(err);
  }
};

invite.validate = async (params) => {
  try {
    const obj = await dbHelper.getByUserAndSecretCode(
      params.userId,
      params.secretCode
    );
    const userDetail = await authService.getUserDetail(params.userId);
    const message = obj ? 'success' : 'fail';
    return { userDetail, message };
  } catch (err) {
    return Promise.reject(err);
  }
};

module.exports = invite;
