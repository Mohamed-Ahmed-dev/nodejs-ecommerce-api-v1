const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      trim: true,
    },

    ratings: {
      type: Number,
      min: [1, "Rating must be above 1"],
      max: [5, "Rating must be below 5"],
      required: [true, "Review must have a rating"],
    },

    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "Review must belong to user"],
    },
    // parent reference ==> in big data
    product: {
      type: mongoose.Schema.ObjectId,
      ref: "Product",
      required: [true, "Review must belong to product"],
    },
  },
  { timestamps: true }
);

//? Makking popultate to user field
reviewSchema.pre(/^find/, function (next) {
  this.populate({
    path: "user",
    select: "name",
  });
  next();
});

//? Makking aggrigation to calculate Average Ratings And Quantity of ratings
reviewSchema.statics.calcAverageRatingsAndQuantity = async function (
  productId
) {
  const results = await this.aggregate([
    // 1)stage: get all reviews for specific product
    {
      $match: { product: productId },
    },
    // 2)stage: calculate average ratings and quantity of ratings
    {
      $group: {
        _id: "$product",
        ratingsQuantity: { $sum: 1 },
        avgRating: { $avg: "$ratings" },
      },
    },
  ]);

  // 3)stage: update product document
  if (results.length > 0) {
    await this.model("Product").findByIdAndUpdate(productId, {
      ratingsQuantity: results[0].ratingsQuantity,
      ratingsAverage: results[0].avgRating,
    });
  } else {
    await this.model("Product").findByIdAndUpdate(productId, {
      ratingsQuantity: 0,
      ratingsAverage: 0,
    });
  }
};

//? call calcAverageRatingsAndQuantity after save
reviewSchema.post("save", async function () {
  // this points to current review
  await this.constructor.calcAverageRatingsAndQuantity(this.product);
});
//? call calcAverageRatingsAndQuantity after remove
reviewSchema.post("deleteOne", { document: true }, async function () {
  // this points to current review
  await this.constructor.calcAverageRatingsAndQuantity(this.product);
});
//==> after that do trigger in update one (document.save()) to make the calculation after updating
//==> after that do trigger in delete one (document.deleteOne()) to make the calculation after removing

const ReviewModel = mongoose.model("Review", reviewSchema);

module.exports = ReviewModel;
