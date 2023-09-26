const express = require("express");

const {
  addToWishlist,
  deleteFromWishlist,
  getLoggedUserWishlist,
} = require("../services/wishlistService");
const {
  addToWishlistValidator,
  deleteFromWishlistValidator,
} = require("../utils/validators/wishlistValidator");
const Authentication = require("../services/authService");

const router = express.Router();

router.use(Authentication.protect, Authentication.allowedTo("user"));

router
  .route("/")
  .post(addToWishlistValidator, addToWishlist)
  .get(getLoggedUserWishlist);

router
  .route("/:productId")
  .delete(deleteFromWishlistValidator, deleteFromWishlist);

module.exports = router;
