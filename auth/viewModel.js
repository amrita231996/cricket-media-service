const authViewModel = {};

/*
*createViewModel() creates the model for the kyc details and sets documents url as well along 
with their path.
*/
authViewModel.createViewModel = (body, files) => {
  const viewModel = {};
  if (body.firstName) {
    viewModel.firstName = body.firstName;
  }
  if (body.lastName) {
    viewModel.lastName = body.lastName;
  }
  if (body.state) {
    viewModel.state = body.state;
  }
  if (body.address_1) {
    viewModel.address_1 = body.address_1;
  }
  if (body.address_2) {
    viewModel.address_2 = body.address_2;
  }
  if (body.zipCode) {
    viewModel.zipCode = body.zipCode;
  }
  if (body.aboutMe) {
    viewModel.aboutMe = body.aboutMe;
  }
  if (files && files[0]) {
    viewModel.profilePhoto = files[0].location;
  }
  viewModel.usedDeals = [];
  return viewModel;
};
module.exports = authViewModel;
