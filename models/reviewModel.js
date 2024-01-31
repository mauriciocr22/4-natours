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

  if(stats.length > 0) {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: stats[0].nRating,
      ratingsAverage: stats[0].avgRating
    });
  } else {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: 0,
      ratingsAverage: 4.5
    });
  }
}

reviewSchema.post("save", function() {        // Doesn't have next since it is a post middleware
  this.constructor.calcAverageRatings(this.tour)
});

reviewSchema.pre(/^findOneAnd/, async function(next) {
  this.r = await this.findOne()

  next();
});

reviewSchema.post(/^findOneAnd/, async function() {
  await this.r.constructor.calcAverageRatings(this.r.tour);
});

// reviewSchema.post(/^findOneAnd/, async function(doc) {
//   await doc.constructor.calcAverageRatings(doc.tour);      Could also be done like this instead of creating the two middlewares above
// });

const Review = mongoose.model("Review", reviewSchema);

module.exports = Review;