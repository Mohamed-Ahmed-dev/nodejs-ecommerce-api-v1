const ReviewModel = require("../models/reviewModel");
const Factory = require("./handlersFactory");

// GET /api/v1/products/:productId/reviews
//! (=> Middleware <=) to get productId And add it to req;
exports.createNestedObject = (req, res, next) => {
  let nestedObject = {};
  if (req.params.productId) {
    nestedObject = { product: req.params.productId };
  }
  req.nestedObject = nestedObject;
  next();
};

// @desc      get all reviews
// @route     GET /api/v1/reviews
// @access    public

exports.getAllReviews = Factory.getAll(ReviewModel);

// @desc      get specific review
// @route     GET /api/v1/reviews/:id
// @access    public

exports.getReview = Factory.getOne(ReviewModel);

// @desc      Create a review
// @route     POST /api/v1/reviews
// @access    public/protected/user

//! (=> Middleware <=) to set body before validation
exports.setproductIdToBody = (req, res, next) => {
  if (!req.body.product) {
    req.body.product = req.params.productId;
  }
  if (!req.body.user) {
    req.body.user = req.user._id;
  }
  next();
};

exports.createReview = Factory.createOne(ReviewModel);

// @desc      update specific review
// @route     PUT /api/v1/reviews/:id
// @access    public/protected/user

exports.updateReview = Factory.updateOne(ReviewModel);

// @desc      delete specific review
// @route     DELETE /api/v1/reviews/:id
// @access    public/protected/user

exports.deleteReview = Factory.deleteOne(ReviewModel);
