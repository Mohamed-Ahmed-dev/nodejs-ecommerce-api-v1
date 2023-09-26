const { check } = require("express-validator");

const validatorMiddleware = require("../../middlewares/validatorMiddleware");
const ProductModel = require("../../models/productModel");

exports.addToWishlistValidator = [
  check("productId")
    .notEmpty()
    .withMessage("productId is required")
    .isMongoId()
    .withMessage("Invalid productId format")
    .custom(
      async (val, { req }) =>
        await ProductModel.findById(val).then((product) => {
          if (!product) {
            return Promise.reject(new Error("Product not found"));
          }
          return true;
        })
    ),
  validatorMiddleware,
];

exports.deleteFromWishlistValidator = [
  check("productId")
    .notEmpty()
    .withMessage("productId is required")
    .isMongoId()
    .withMessage("Invalid productId format")
    .custom(
      async (val, { req }) =>
        await ProductModel.findById(val).then((product) => {
          if (!product) {
            return Promise.reject(new Error("Product not found"));
          }
          return true;
        })
    ),
  validatorMiddleware,
];
