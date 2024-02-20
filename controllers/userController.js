const User = require("../models/userModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const factory = require("./handlerFactory");

const filterObj = (obj, ...alowedFields) => {
  const newObj = {};

  Object.keys(obj).forEach(el => {
    if(alowedFields.includes(el)) newObj[el] = obj[el]
  })
return newObj;
}

exports.getMe = (request, response, next) => {
  request.params.id = request.user.id;
  next();
}

exports.updateMe = catchAsync(async (request, response, next) => {
  console.log(request.file);
  console.log(request.body);

  if(request.body.password || request.body.passwordConfirm) {
    return next(new AppError("This route is not for password updates. Please use the /updateMyPassword route.", 400))
  }
  
  const filteredBody = filterObj(request.body, "name", "email");
  const updatedUser = await User.findByIdAndUpdate(request.user.id, filteredBody, {
    new: true,
    runValidators: true
  });
  
  response.status(200).json({
    status: "success",
    user: updatedUser
  });
})

exports.deleteMe = catchAsync(async (request, response, next) => {
  await User.findByIdAndUpdate(request.user.id, { active: false });
  
  response.status(204).json({
    status: "success",
    data: null
  })
})

exports.createUser = (request, response) => {
  response.status(500).json({
    status: "error",
    message: "This route is not yet defined! Please use /signup instead ",
  });
};

exports.getUser = factory.getOne(User);
exports.getAllUsers = factory.getAll(User);
exports.updateUser = factory.updateOne(User);
exports.deleteUser = factory.deleteOne(User);
