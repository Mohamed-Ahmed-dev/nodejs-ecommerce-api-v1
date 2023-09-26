const asyncHandler = require("express-async-handler");

const userModel = require("../models/userModel");

// @desc      Add product to wishlist
// @route     POST /api/v1/wishlist
// @access    public/protected
exports.addToWishlist = asyncHandler(async (req, res, next) => {
  // $addToSet ==> add productId to wishlist array if it's not exist
  const user = await userModel.findByIdAndUpdate(
    req.user._id,
    {
      $addToSet: { wishlist: req.body.productId },
    },
    { new: true }
  );

  res.status(200).json({
    status: "success",
    message: "Product added to your wishlist",
    data: user.wishlist,
  });
});

// @desc      delete product from wishlist
// @route     Delete /api/v1/wishlist/:productId
// @access    public/protected

exports.deleteFromWishlist = asyncHandler(async (req, res, next) => {
  // $pull ==> remove productId from wishlist array if it's exist
  const user = await userModel.findByIdAndUpdate(
    req.user._id,
    {
      $pull: { wishlist: req.params.productId },
    },
    { new: true }
  );

  res.status(200).json({
    status: "success",
    message: "Product removed from your wishlist",
    data: user.wishlist,
  });
});

// @desc      Get logged user wishlist
// @route     GET /api/v1/wishlist
// @access    public/protected

exports.getLoggedUserWishlist = asyncHandler(async (req, res, next) => {
  const user = await userModel.findById(req.user._id).populate("wishlist");

  res.status(200).json({
    status: "success",
    results: user.wishlist.length,
    data: user.wishlist,
  });
});
