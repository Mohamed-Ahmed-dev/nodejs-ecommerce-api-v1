const { check } = require("express-validator");
const bcrypt = require("bcryptjs");
const slugify = require("slugify");
const validatorMiddleware = require("../../middlewares/validatorMiddleware");
const userModel = require("../../models/userModel");

exports.getUserValidator = [
  check("id").isMongoId().withMessage("Invalid id format"),
  validatorMiddleware,
];

exports.createUserValidator = [
  check("name")
    .notEmpty()
    .withMessage("name required")
    .isLength({ min: 3 })
    .withMessage("too short user name")
    .custom((val, { req }) => {
      req.body.slug = slugify(val);
      return true;
    }),

  check("email")
    .notEmpty()
    .withMessage("email required")
    .isEmail()
    .withMessage("Invalid Email Adress")
    .custom((val) =>
      userModel.findOne({ email: val }).then((user) => {
        if (user) {
          return Promise.reject(new Error("email already exists"));
        }
      })
    ),

  check("password")
    .notEmpty()
    .withMessage("password required")
    .isLength({ min: 6 })
    .withMessage("password must be at least 6 characters long")
    .custom((pass, { req }) => {
      if (pass !== req.body.passwordConfirm) {
        throw new Error("password confirmation incorrect");
      }
      return true;
    }),

  check("passwordConfirm").notEmpty().withMessage("password Confirm required"),

  check("profileImage").optional(),

  check("role").optional(),

  check("phone")
    .optional()
    .isMobilePhone(["ar-EG", "ar-SA"])
    .withMessage("Invalid phone number only accepted EG and SA numbers"),

  validatorMiddleware,
];

exports.updateUserValidator = [
  check("id").isMongoId().withMessage("Invalid id format"),
  check("name")
    .optional()
    .isLength({ min: 3 })
    .withMessage("too short user name")
    .custom((val, { req }) => {
      req.body.slug = slugify(val);
      return true;
    }),

  check("email")
    .optional()
    .isEmail()
    .withMessage("Invalid Email Adress")
    .custom((val) =>
      userModel.findOne({ email: val }).then((user) => {
        if (user) {
          return Promise.reject(new Error("email already exists"));
        }
      })
    ),
  check("profileImage").optional(),

  check("role").optional(),

  check("phone").optional().isMobilePhone(["ar-EG", "ar-SA"]),

  validatorMiddleware,
];

exports.updateUserPasswordValidator = [
  check("id").isMongoId().withMessage("Invalid id format"),
  check("currentPassword")
    .notEmpty()
    .withMessage("You must enter your current Password"),
  check("confirmPassword")
    .notEmpty()
    .withMessage("You must enter confirm Password"),
  check("password")
    .notEmpty()
    .withMessage("You must enter new Password")
    .custom(async (val, { req }) => {
      // 1) verify current password
      const user = await userModel.findById(req.params.id);
      if (!user) {
        throw new Error("There is no user for this id");
      }
      const isCorrectPass = await bcrypt.compare(
        req.body.currentPassword,
        user.password
      );
      if (!isCorrectPass) {
        throw new Error("Your current password is incorrect");
      }
      // 2) verify confirm password
      if (val !== req.body.confirmPassword) {
        throw new Error("Confirm password is incorrect");
      }
    }),
  validatorMiddleware,
];

exports.deleteUserValidator = [
  check("id").isMongoId().withMessage("Invalid id format"),
  validatorMiddleware,
];

//? update logged user password
exports.updateLoggedUserPasswordValidator = [
  check("currentPassword")
    .notEmpty()
    .withMessage("You must enter your current Password"),
  check("confirmPassword")
    .notEmpty()
    .withMessage("You must enter confirm Password"),
  check("password")
    .notEmpty()
    .withMessage("You must enter new Password")
    .custom(async (val, { req }) => {
      // 1) verify current password
      const user = await userModel.findById(req.user._id);
      if (!user) {
        throw new Error("There is no user for this id");
      }
      const isCorrectPass = await bcrypt.compare(
        req.body.currentPassword,
        user.password
      );
      if (!isCorrectPass) {
        throw new Error("Your current password is incorrect");
      }
      // 2) verify confirm password
      if (val !== req.body.confirmPassword) {
        throw new Error("Confirm password is incorrect");
      }
    }),
  validatorMiddleware,
];

//? update logged user Data

exports.updateLoggedUserDataValidator = [
  check("name")
    .optional()
    .isLength({ min: 3 })
    .withMessage("too short user name")
    .custom((val, { req }) => {
      req.body.slug = slugify(val);
      return true;
    }),

  check("email")
    .optional()
    .isEmail()
    .withMessage("Invalid Email Adress")
    .custom((val) =>
      userModel.findOne({ email: val }).then((user) => {
        if (user) {
          return Promise.reject(new Error("email already exists"));
        }
      })
    ),
  check("profileImage").optional(),

  check("phone").optional().isMobilePhone(["ar-EG", "ar-SA"]),

  validatorMiddleware,
];
