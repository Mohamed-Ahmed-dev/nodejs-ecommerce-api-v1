const { check } = require("express-validator");

const validatorMiddleware = require("../../middlewares/validatorMiddleware");
const CouponModel = require("../../models/couponModel");

exports.createCouponValidator = [
  check("name")
    .notEmpty()
    .withMessage("Coupon name require")
    .custom(
      async (val, { req }) =>
        await CouponModel.findOne({ name: val }).then((coupon) => {
          if (coupon) {
            return Promise.reject(new Error("Coupon name already exist"));
          }
          return true;
        })
    ),
  check("expire").notEmpty().withMessage("Coupon expire date require"),
  check("discount").notEmpty().withMessage("Coupon discount require"),
  validatorMiddleware,
];
