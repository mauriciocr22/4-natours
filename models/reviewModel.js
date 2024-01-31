const mongoose = require("mongoose");
const Tour = require("./tourModel");

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, "A review must have a review text."]
    },
    rating: {
      type: Number,
      default: 4,
      min: [0, "A review's rating must be between 0 and 5"],
      max: [5, "A review's rating must be between 0 and 5"]
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
        required: [true, "A review must belong to an user."]
    },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: "Tour",
      required: [true, "A review must belong to a tour."]
    }
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

reviewSchema.pre(/^find/, function(next) {
  // this.populate({
  //   path: "user",
  //   select: "name photo"
  // }).populate({
  //   path: "tour",
  //   select: "name"
  // })

  this.populate({
    path: "user",
    select: "name photo"
  });

  next();
});

reviewSchema.statics.calcAverageRatings = async function(tourId) {
  const stats = await this.aggregate([
    {
      $match: { tour: tourId }
    },
    {
      $group: {
        _id: "$tour",
        nRating: { $sum: 1 },
        avgRating: { $avg: "$rating" }
      }
    }
  ]);
  console.log(stats);

  await Tour.findByIdAndUpdate(tourId, {
    ratingsQuantity: stats[0].nRating,
    ratingsAverage: stats[0].avgRating
  })
}

reviewSchema.post("save", function() {
  this.constructor.calcAverageRatings(this.tour)
});

const Review = mongoose.model("Review", reviewSchema);

module.exports = Review;