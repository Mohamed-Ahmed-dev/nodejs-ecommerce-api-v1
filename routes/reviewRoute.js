const express = require("express");

const {
  getAllReviews,
  getReview,
  createReview,
  updateReview,
  deleteReview,
  createNestedObject,
  setproductIdToBody,
} = require("../services/reviewService");

const {
  getReviewValidator,
  createReviewValidator,
  updateReviewValidator,
  deleteReviewValidator,
} = require("../utils/validators/reviewValidator");

const router = express.Router({ mergeParams: true });

const Authentication = require("../services/authService");

router
  .route("/")
  .get(createNestedObject, getAllReviews)
  .post(
    Authentication.protect,
    Authentication.allowedTo("user"),
    setproductIdToBody,
    createReviewValidator,
    createReview
  );

router
  .route("/:id")
  .get(getReviewValidator, getReview)
  .put(
    Authentication.protect,
    Authentication.allowedTo("user"),
    updateReviewValidator,
    updateReview
  )
  .delete(
    Authentication.protect,
    Authentication.allowedTo("user", "admin", "manager"),
    deleteReviewValidator,
    deleteReview
  );

module.exports = router;
