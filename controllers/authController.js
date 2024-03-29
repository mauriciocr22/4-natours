const crypto = require('crypto');
const { promisify } = require("util")
const jwt = require("jsonwebtoken")
const User = require("../models/userModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError")
const Email = require("../utils/email")

const signToken = id => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
}

const createSendToken = (user, statusCode, response) => {
  const token = signToken(user._id)
  const cookieOptions = {
    expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
    httpOnly: true
  }

  if(process.env.NODE_ENV === "production") cookieOptions.secure = true;

  response.cookie("jwt", token, cookieOptions);

  user.password = undefined;
  
  response.status(statusCode).json({
    status: "success",
    token,
    data: {
      user,
    },
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

  const url = `${request.protocol}://${request.get("host")}/me`;
  console.log(url);
  await new Email(newUser, url).sendWelcome();

  createSendToken(newUser, 201, response);
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

  createSendToken(user, 200, response);
});

exports.logout = (request, response) => {
  response.cookie("jwt", "loggedout", {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });

  response.status(200).json({ status: "success" });
}

exports.protect = catchAsync(async (request, response, next) => {
  let token;

  if(request.headers.authorization && request.headers.authorization.startsWith("Bearer")) {
    token = request.headers.authorization.split(" ")[1]
  } else if (request.cookies.jwt) {
    token = request.cookies.jwt;
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
  response.locals.user = freshUser;
  next()
});

exports.isLoggedIn = async (request, response, next) => {
  if(request.cookies.jwt) {
    try {
      const decoded = await promisify(jwt.verify)(request.cookies.jwt, process.env.JWT_SECRET);
      const freshUser = await User.findById(decoded.id);
      if(!freshUser) {
        return next();
      }
      if(freshUser.changePasswordAfter(decoded.iat)) {
        return next();
      }
      response.locals.user = freshUser;
      return next()
    } catch(err) {
      return next();
    }
  }
  next();
}


exports.restrictTo = (...roles) => {
  return (request, response, next) => {
    if (!roles.includes(request.user.role))
    return next(new AppError("You do not have permission to perform this action", 403));

  next();
  }
}

exports.forgotPassword = catchAsync(async (request, response, next) => {
  const user = await User.findOne({ email: request.body.email })

  if(!user) {
    next(new AppError("There is no user with that email address.", 404));
  }

  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false })

  try {
    const resetURL = `${request.protocol}://${request.get("host")}/api/v1/users/resetPassword/${resetToken}`;
    await new Email(user, resetURL).sendPasswordReset()
    response.status(200).json({
      status: "success",
      message:"Token sent to email!"
    })
  } catch(err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(new AppError("There was an error sending the email. Try again later.", 500))
  }
  
});

exports.resetPassword = catchAsync(async (request, response, next) => {
  const hashedToken = crypto.createHash("sha256").update(request.params.token).digest("hex");
  const user = await User.findOne({passwordResetToken: hashedToken, passwordResetExpires: {$gt: Date.now()}});

  if(!user) {
    return next(new AppError("Token is invalid or has expired.", 400))
  }

  user.password = request.body.password;
  user.passwordConfirm = request.body.passwordConfirm;
  user.passwordResetExpires = undefined;
  user.passwordResetToken = undefined;

  await user.save();

  createSendToken(user, 200, response);
})

exports.updatePassword = catchAsync(async (request, response, next) => {
  const user = await User.findById(request.user.id).select("+password")

  if(!(user.correctPassword(request.body.passwordCurrent, user.password))) {
    return next(new AppError("Your current password is incorrect.", 401))
  }

  user.password = request.body.password;
  user.passwordConfirm = request.body.passwordConfirm;
  await user.save();

  createSendToken(user, 200, response);
})