const Invite = require('./model');

const inviteDbHelper = {};

inviteDbHelper.save = async (inviteInput) => {
  try {
    const obj = new Invite(inviteInput);
    return obj.save().then(() => obj);
  } catch (err) {
    return Promise.reject(err);
  }
};

inviteDbHelper.getByUserAndSecretCode = async (userId, secretCode) => {
  try {
    return await Invite.findOne({ userId, secretCode, active: true });
  } catch (error) {
    return Promise.reject(error);
  }
};

inviteDbHelper.updateInactiveByUserAndSecretCode = async (
  userId,
  secretCode
) => {
  try {
    await Invite.updateOne(
      { userId, secretCode },
      {
        $set: {
          active: false,
          modifiedDate: Date.now(),
        },
      }
    );
    return null;
  } catch (error) {
    return Promise.reject(error);
  }
};

inviteDbHelper.updateRefferalUserByUserIdAndSecretCode = async(uId,sCode,refferalUser)=>{
  await Invite.updateOne(
    {userId:uId,secretCode:sCode},
    {$set:{
      referralUserId:refferalUser._id,
      referralUserFirstName:refferalUser.firstName,
      referralUserLastName:refferalUser.lastName,
      referralUserEmail:refferalUser.email,
      referralUserProfilePhoto:refferalUser.profilePhoto,
      referralUserCreatedDate:refferalUser.createdDate,
      modifiedDate: Date.now(),
    }});
}

inviteDbHelper.updateRefferalUserNameByUserId = async(uId,sCode,refferalUser)=>{
  await Invite.updateOne(
    {userId:uId,secretCode:sCode},
    {$set:{
      referralUserFirstName:refferalUser.firstName,
      referralUserLastName:refferalUser.lastName,
      modifiedDate: Date.now(),
    }});
}

module.exports = inviteDbHelper;
