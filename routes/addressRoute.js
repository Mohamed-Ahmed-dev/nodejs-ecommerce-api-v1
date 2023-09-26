const express = require("express");

const {
  getAddresses,
  getAddress,
  createAdress,
  updateAdress,
  deleteAddress,
  setUserId,
  createNestedObject,
} = require("../services/adressesService");

const {
  createAddressValidator,
  updateAddressValidator,
  getSpecificAddressValidator,
  deleteAddressValidator,
} = require("../utils/validators/addressValidator");

const Authentication = require("../services/authService");

const router = express.Router({ mergeParams: true });

router.use(Authentication.protect, Authentication.allowedTo("user"));

router
  .route("/")
  .post(setUserId, createAddressValidator, createAdress)
  .get(createNestedObject, getAddresses);

router
  .route("/:id")
  .get(getSpecificAddressValidator, getAddress)
  .put(updateAddressValidator, updateAdress)
  .delete(deleteAddressValidator, deleteAddress);

module.exports = router;
