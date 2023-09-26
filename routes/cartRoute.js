const express = require("express");

const {
  addProductToCart,
  getLoggedUsreCart,
  deleteProductFromCart,
  clearLoggedUserCart,
  updateCartItemQuantity,
  applyCoupon,
} = require("../services/cartService");

const AuthService = require("../services/authService");

const router = express.Router();

// protected
router.use(AuthService.protect, AuthService.allowedTo("user"));

router.put("/applyCoupon", applyCoupon);

router
  .route("/")
  .post(addProductToCart)
  .get(getLoggedUsreCart)
  .delete(clearLoggedUserCart);

router
  .route("/:itemId")
  .put(updateCartItemQuantity)
  .delete(deleteProductFromCart);

module.exports = router;
