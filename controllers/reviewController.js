// Get all review, create new review
const Review = require("../models/reviewModel")

const factory = require("./handlerFactory");
const catchAsync = require("../utils/catchAsync");


exports.getAllReviews = catchAsync(async (request, response, next) => {
  let filter = {}
  if(request.params.tourId) filter = {tour: request.params.tourId}

  const reviews = await Review.find(filter)

  response.status(200).json({
    status: "success",
    results: reviews.length,
    data: {
      reviews
    }
  })
});

exports.setTourUserIds = (request, response, next) => {
  if(!request.body.tour) request.body.tour = request.params.tourId
  if(!request.body.user) request.body.user = request.user.id
  next()
}

exports.createReview = factory.createOne(Review);
exports.updateReview = factory.updateOne(Review);
exports.deleteReview = factory.deleteOne(Review);

