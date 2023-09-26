const express = require("express");

const {
  signup,
  login,
  forgetPassword,
  verifyResetPasswordCode,
  resetPassword,
} = require("../services/authService");
const {
  signupValidator,
  loginValidator,
  forgetPasswordValidator,
} = require("../utils/validators/authValidator");

const router = express.Router();

router.route("/signup").post(signupValidator, signup);
router.route("/login").post(loginValidator, login);
router.route("/forgotPassword").post(forgetPasswordValidator, forgetPassword);
router.route("/verifyResetCode").post(verifyResetPasswordCode);
router.route("/resetPassword").put(resetPassword);

module.exports = router;
