const { check } = require("express-validator");

const validatorMiddleware = require("../../middlewares/validatorMiddleware");
const AddressModel = require("../../models/addressModel");

exports.getSpecificAddressValidator = [
  check("id").isMongoId().withMessage("Invalid id format"),
  validatorMiddleware,
];

exports.createAddressValidator = [
  check("alias")
    .notEmpty()
    .withMessage("Alias is required")
    .custom(
      async (val, { req }) =>
        await AddressModel.findOne({ alias: val, user: req.user._id }).then(
          (address) => {
            if (address) {
              return Promise.reject(new Error("Alias already exists"));
            }
          }
        )
    ),

  check("address").notEmpty().withMessage("Address is required"),

  check("city").notEmpty().withMessage("City is required"),

  check("state").notEmpty().withMessage("State is required"),

  check("phone")
    .notEmpty()
    .withMessage("Phone is required")
    .isMobilePhone(["ar-EG", "ar-SA"])
    .withMessage("Invalid phone number only accepted EG and SA numbers"),

  check("user")
    .notEmpty()
    .withMessage("User is required")
    .isMongoId()
    .withMessage("Invalid id format")
    .custom((val, { req }) => {
      if (val !== req.user._id) {
        return Promise.reject(new Error("Invalid user id"));
      }
      return true;
    }),
  validatorMiddleware,
];

exports.updateAddressValidator = [
  check("alias")
    .optional()
    .custom(
      async (val, { req }) =>
        await AddressModel.findOne({ alias: val, user: req.user._id }).then(
          (address) => {
            if (address) {
              return Promise.reject(new Error("Alias already exists"));
            }
          }
        )
    ),

  check("address").optional(),

  check("city").optional(),

  check("state").optional(),

  check("phone")
    .optional()
    .isMobilePhone(["ar-EG", "ar-SA"])
    .withMessage("Invalid phone number only accepted EG and SA numbers"),

  validatorMiddleware,
];

exports.deleteAddressValidator = [
  check("id")
    .isMongoId()
    .withMessage("Invalid id format")
    .custom(
      async (val, { req }) =>
        await AddressModel.findOne({ _id: val, user: req.user._id }).then(
          (address) => {
            if (!address) {
              return Promise.reject(
                new Error("You are not allow to delete this address")
              );
            }
            return true;
          }
        )
    ),
  validatorMiddleware,
];
