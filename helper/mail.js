const Promise = require('bluebird');
const nodemailer = require('nodemailer');

// eslint-disable-next-line func-names
const email = function () {};

email.send = (mail) => {
  const smtp = {
    host: process.env.EMAILSMTP,
    secure: false,
    port: parseInt(process.env.EMAILPORT, 10),
    auth: {
      user: process.env.SENDNOREPLYTUSER,
      pass: process.env.SENDNOREPLYPASS,
    },
  };

  const mailOption = {
    from: process.env.SENDNOREPLYTUSER,
    to: mail.to,
    subject: mail.subject,
    html: mail.html,
    bcc: mail.bcc,
  };

  const transporter = nodemailer.createTransport(smtp);

  return new Promise((resolve, reject) => {
    transporter.sendMail(mailOption, (error) => {
      if (error) {
        reject(error);
      } else {
        // console.log('Email sent');
        resolve();
      }
    });
  });
};

module.exports = email;
