const feedViewModel = {};

feedViewModel.createViewModel = (req) => {
  const { body, decoded } = req;
  const viewModel = {};
  viewModel.userId = decoded.id;
  viewModel.userName = `${decoded.firstName} ${decoded.lastName}`;
  viewModel.userProfilePhoto = decoded.profilePhoto;
  viewModel.postId = body.feedId;
  viewModel.reportText = body.reportText;

  return viewModel;
};

module.exports = feedViewModel;
