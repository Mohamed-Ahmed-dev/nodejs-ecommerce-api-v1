const { check } = require("express-validator");

const validatorMiddleware = require("../../middlewares/validatorMiddleware");
const ReviewModel = require("../../models/reviewModel");

exports.getReviewValidator = [
  check("id").isMongoId().withMessage("Invalid Id format"),
  validatorMiddleware,
];

exports.createReviewValidator = [
  check("review").optional(),

  check("ratings")
    .notEmpty()
    .withMessage("Rating is required")
    .isFloat({ min: 1, max: 5 })
    .withMessage("Rating must be between 1 and 5"),

  check("user").isMongoId().withMessage("Invalid Id format"),

  check("product")
    .isMongoId()
    .withMessage("Invalid Id format")
    .custom((val, { req }) =>
      // check if logged usre create review for product
      ReviewModel.findOne({ user: req.user._id, product: val }).then(
        (review) => {
          if (review) {
            return Promise.reject(new Error("You already review this product"));
          }
        }
      )
    ),
  validatorMiddleware,
];

exports.updateReviewValidator = [
  check("id")
    .isMongoId()
    .withMessage("Invalid Id format")
    .custom((val, { req }) =>
      // check if logged user create review for product
      ReviewModel.findById(val).then((review) => {
        if (!review) {
          return Promise.reject(new Error("No review found with this id"));
        }
        if (review.user._id.toString() !== req.user._id.toString()) {
          return Promise.reject(new Error("You can't update this review"));
        }
      })
    ),
  validatorMiddleware,
];

exports.deleteReviewValidator = [
  check("id")
    .isMongoId()
    .withMessage("Invalid Id format")
    .custom((val, { req }) => {
      if (req.user.role === "user") {
        // check if logged user create review for product
        return ReviewModel.findById(val).then((review) => {
          if (!review) {
            return Promise.reject(new Error("No review for this id"));
          }
          if (review.user._id.toString() !== req.user._id.toString()) {
            return Promise.reject(new Error("You can't delete this review"));
          }
        });
      }
      return true;
    }),
  validatorMiddleware,
];
