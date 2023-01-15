const inviteViewModel = {};

inviteViewModel.createViewModel = (req) => {
  const { decoded } = req;
  const viewModel = {};
  viewModel.userId = decoded.id;
  viewModel.secretCode = Math.floor(1000 + Math.random() * 9000);
  viewModel.userFirstName = decoded.firstName;
  viewModel.userLastName = decoded.lastName;
  viewModel.userEmail = decoded.email;
  viewModel.userProfilePhoto = decoded.profilePhoto;
  return viewModel;
};

module.exports = inviteViewModel;
