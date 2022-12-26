const commentViewModel = {};

commentViewModel.createViewModel = (req) => {
  const { body, decoded } = req;
  const viewModel = {};
  viewModel.userId = decoded.id;
  viewModel.userName = `${decoded.firstName} ${decoded.lastName}`;
  viewModel.userProfilePhoto = decoded.profilePhoto;
  viewModel.postId = body.feedId;
  viewModel.text = body.commentText;
  viewModel.parentCommentId = body.parentCommentId;
  viewModel.isChildComment = !!body.parentCommentId;
  return viewModel;
};

commentViewModel.updateViewModel = (req) => {
  const { body, files, decoded } = req;
  const viewModel = {};
  if (body.postMessage) {
    viewModel.postMessage = body.postMessage;
  }
  if (files[0]) {
    viewModel.postImage = files[0].location;
  }
  return { userId: decoded.id, _id: body.id, viewModel };
};
module.exports = commentViewModel;
