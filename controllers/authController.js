const jwt = require('jsonwebtoken')
const User = require("../models/userModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require('../utils/appError')

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

  console.log(user)

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
  console.log(token)

  if(!token) {
    return next(new AppError("You are not logged in! Please login to get access", 401)) //Unauthorized
  }
  next()
})