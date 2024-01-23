const mongoose = require("mongoose")

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
    reviewAuthor: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
        required: [true, "A review must belong to an user."]
    },
    tourReview: {
      type: mongoose.Schema.ObjectId,
      ref: "Tour",
      required: [true, "A review must belong to a tour."]
    }
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
)

const Review = mongoose.model("Review", reviewSchema);

module.exports = Review;