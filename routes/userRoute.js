const express = require("express");

const {
  createUserValidator,
  getUserValidator,
  updateUserValidator,
  deleteUserValidator,
  updateUserPasswordValidator,
  updateLoggedUserPasswordValidator,
  updateLoggedUserDataValidator,
} = require("../utils/validators/userValidator");

const {
  getUsers,
  getUser,
  createUser,
  updateUserData,
  deleteUser,
  updateUserPassword,
  getLoggedUserData,
  updateLoggedUserPassword,
  updateLoggedUserData,
  deleteLoggedUserData,
  uploadUserImage,
  resizeImage,
} = require("../services/userService");

const AuthService = require("../services/authService");
const AddressRouter = require("./addressRoute");

const router = express.Router();

//? nested route to get logged user addresses
router.use("/:userId/addresses", AddressRouter);

//! ====================================================================== allowed to logged in user
router.use(AuthService.protect);

router.get("/getMe", getLoggedUserData, getUser);

router.put(
  "/updateMyPassword",
  updateLoggedUserPasswordValidator,
  updateLoggedUserPassword
);

router.put(
  "/updateMyData",
  uploadUserImage,
  resizeImage,
  updateLoggedUserDataValidator,
  updateLoggedUserData
);

router.delete("/deleteMyAccount", deleteLoggedUserData);

//! ====================================================================== allowed to admin only
router.use(AuthService.allowedTo("admin"));

router.put(
  "/changePassword/:id",
  updateUserPasswordValidator,
  updateUserPassword
);

router
  .route("/")
  .post(uploadUserImage, resizeImage, createUserValidator, createUser)
  .get(getUsers);

router
  .route("/:id")
  .get(getUserValidator, getUser)
  .put(uploadUserImage, resizeImage, updateUserValidator, updateUserData)
  .delete(deleteUserValidator, deleteUser);

module.exports = router;
