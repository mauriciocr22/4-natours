const User = require("../models/userModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

const filterObj = (obj, ...alowedFields) => {
  const newObj = {};

  Object.keys(obj).forEach(el => {
    if(alowedFields.includes(el)) newObj[el] = obj[el]
  })
return newObj;
}

exports.getAllUsers = catchAsync(async (request, response, next) => {
  const users = await User.find()

  response.status(200).json({
    status: "success",
    results: users.length,
    data: {
      users,
    },
  });
});

exports.updateMe = catchAsync(async (request, response, next) => {
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

exports.getUser = (request, response) => {
  response.status(500).json({
    status: "error",
    message: "This route is not yet defined!",
  });
};

exports.createUser = (request, response) => {
  response.status(500).json({
    status: "error",
    message: "This route is not yet defined!",
  });
};

exports.updateUser = (request, response) => {
  response.status(500).json({
    status: "error",
    message: "This route is not yet defined!",
  });
};

exports.deleteUser = (request, response) => {
  response.status(500).json({
    status: "error",
    message: "This route is not yet defined!",
  });
};
