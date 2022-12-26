const feedViewModel = {};

feedViewModel.createViewModel = (req) => {
  const { body, decoded } = req;
  const viewModel = {};
  viewModel.userId = decoded.id;
  viewModel.userName = `${decoded.firstName} ${decoded.lastName}`;
  viewModel.userProfilePhoto = decoded.profilePhoto;
  viewModel.postMessage = body.postMessage;
  viewModel.postImageURL = body.postImageURL;
  viewModel.sharedDetail = {};

  return viewModel;
};

feedViewModel.updateViewModel = (req) => {
  const { body, decoded } = req;
  const viewModel = {};
  if (body.postMessage) {
    viewModel.postMessage = body.postMessage;
  }
  if (body.postImageURL) {
    viewModel.postImageURL = body.postImageURL;
  }
  return { userId: decoded.id, _id: body.id, viewModel };
};
module.exports = feedViewModel;
