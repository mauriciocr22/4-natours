// Get all review, create new review
const Review = require("../models/reviewModel")
const factory = require("./handlerFactory");

exports.setTourUserIds = (request, response, next) => {
  if(!request.body.tour) request.body.tour = request.params.tourId
  if(!request.body.user) request.body.user = request.user.id
  next()
}

exports.getAllReviews = factory.getAll(Review);
exports.getReview = factory.getOne(Review)
exports.createReview = factory.createOne(Review);
exports.updateReview = factory.updateOne(Review);
exports.deleteReview = factory.deleteOne(Review);

