const Tour = require("../models/tourModel");
const catchAsync = require("../utils/catchAsync");

exports.getOverview = catchAsync(async (request, response, next) => {
  const tours = await Tour.find();

  response.status(200).render("overview", {
    title: "All tours",
    tours
  });
});

exports.getTour = catchAsync(async (request, response) => {
  const tour = await Tour.findOne({ slug: request.params.slug }).populate({
    path: "reviews",
    fields: "review rating user"
  })

  response.status(200).render("tour", {
    title: `${tour.name} Tour`,
    tour
  });
});

exports.getLogin = (request, response) => {
  response.status(200).render("login", {
    title: "Login into your account",

  });
}