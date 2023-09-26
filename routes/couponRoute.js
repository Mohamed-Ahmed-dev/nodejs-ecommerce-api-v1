const express = require("express");
const {
  getCoupons,
  getCoupon,
  createCoupon,
  updateCoupon,
  deleteCoupon,
} = require("../services/couponService");

const {
  createCouponValidator,
} = require("../utils/validators/couponValidator");

const AuthService = require("../services/authService");

const router = express.Router();

// protected
router.use(AuthService.protect, AuthService.allowedTo("admin", "manager"));

router.route("/").post(createCouponValidator, createCoupon).get(getCoupons);

router.route("/:id").get(getCoupon).put(updateCoupon).delete(deleteCoupon);

module.exports = router;
