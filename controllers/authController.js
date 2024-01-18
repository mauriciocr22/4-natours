const { promisify } = require("util")
const jwt = require("jsonwebtoken")
const User = require("../models/userModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError")

const signToken = id => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
}

exports.signup = catchAsync(async (request, response, next) => {
  const newUser = await User.create({
    name: request.body.name,
    email: request.body.email,
    password: request.body.password,
    passwordConfirm: request.body.passwordConfirm,
    passwordChangedAt: request.body.passwordChangedAt,
    role: request.body.role
  });

  const token = signToken(newUser._id)

  response.status(201).json({
    status: "success",
    token,
    data: {
      user: newUser,
    },
  });
});

exports.login = catchAsync(async (request, response, next) => {
  const { email, password } = request.body;

  if(!email || !password) {
    return next(new AppError("Please provide email and password!", 400))
  }

  const user = await User.findOne({ email }).select("+password");

  if(!user || !await user.correctPassword(password, user.password)) {
    return next(new AppError("Incorrect email or password.", 401))
  }


  const token = signToken(user._id);
  response.status(200).json({
    status:  "success",
    token
  })
});

exports.protect = catchAsync(async (request, response, next) => {
  let token;

  if(request.headers.authorization && request.headers.authorization.startsWith("Bearer")) {
    token = request.headers.authorization.split(" ")[1]
  }

  if(!token) {
    return next(new AppError("You are not logged in! Please log in to get access", 401));
  }
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  
  const freshUser = await User.findById(decoded.id);
  if(!freshUser) {
    return next(new AppError("The user belonging to this token does no longer exist", 401));
  }

  if(freshUser.changePasswordAfter(decoded.iat)) {
    return next(new AppError("User recently changed password! Please log in again", 401));
  }

  request.user = freshUser;
  next()
})

exports.restrictTo = (...roles) => {
  return (request, response, next) => {
    if (!roles.includes(request.user.role))
    return next(new AppError("You do not have permission to perform this action", 403));

  next();
  }
}