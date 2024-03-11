const Tour = require("../models/tourModel");
const User = require("../models/userModel");
const Booking = require("../models/bookingModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

exports.alert = (request, response, next) => {
  const { alert } = request.query;
  if (alert === "booking") {
    response.locals.alert = "Your booking was successfull. Please check your email for a confirmation. If your booking doesn't show up here immediately, please come back later."
    next();
  }
}

exports.getOverview = catchAsync(async (request, response, next) => {
  const tours = await Tour.find();

  response.status(200).render("overview", {
    title: "All tours",
    tours
  });
});

exports.getTour = catchAsync(async (request, response, next) => {
  const tour = await Tour.findOne({ slug: request.params.slug }).populate({
    path: "reviews",
    fields: "review rating user"
  });

  if (!tour) {
    return next(new AppError("There is no tour with that name", 404))
  }

  response.status(200).render("tour", {
    title: `${tour.name} Tour`,
    tour
  });
});

exports.getLogin = (request, response) => {
  response.status(200).set(
    'Content-Security-Policy',
    "connect-src 'self' https://cdnjs.cloudflare.com"
  )
    .render('login', {
      title: 'Log into your account',
    });
}

exports.getAccount = (request, response) => {
  response.status(200).render("account", {
    title: "Your account"
  });
}

exports.getMyTours = catchAsync(async (request, response, next) => {
  const bookings = await Booking.find({ user: request.user.id });

  const tourIDs = bookings.map(el => el.tour);
  const tours = await Tour.find({ _id: { $in: tourIDs } });

  response.status(200).render("overview", {
    title: "My Tours",
    tours
  })
});

exports.updateUserData = catchAsync(async (request, response, next) => {
  const updatedUser = await User.findByIdAndUpdate(request.user.id, {
    name: request.body.name,
    email: request.body.email
  },
    {
      new: true,
      runValidators: true
    });

  response.status(200).render("account", {
    title: "Your account",
    user: updatedUser
  });
});