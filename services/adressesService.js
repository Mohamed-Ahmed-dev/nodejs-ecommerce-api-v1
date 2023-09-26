const AddressModel = require("../models/addressModel");
const factory = require("./handlersFactory");

//! (=> Middleware <=) to get userId And add it to req;
exports.createNestedObject = (req, res, next) => {
  let nestedObject = {};
  if (req.params.userId) {
    nestedObject = { user: req.params.userId };
  }
  req.nestedObject = nestedObject;
  next();
};

// @desc      Get all Addresses
// @route     GET /api/v1/adresses
// @access    public/protected

exports.getAddresses = factory.getAll(AddressModel);

// @desc      Get specific Address
// @route     GET /api/v1/adresses/:addressId
// @access    public/protected

exports.getAddress = factory.getOne(AddressModel);

//! (=> Middleware <=) to set user Id to body before validation
exports.setUserId = (req, res, next) => {
  if (!req.body.user) {
    req.body.user = req.user._id;
  }
  next();
};

// @desc      Add adress to user Adresses
// @route     POST /api/v1/adresses
// @access    public/protected
exports.createAdress = factory.createOne(AddressModel);

// @desc      update adress
// @route     POST /api/v1/adresses/:addressId
// @access    public/protected
exports.updateAdress = factory.updateOne(AddressModel);

// @desc      delete Address
// @route     Delete /api/v1/adresses/:addressId
// @access    public/protected

exports.deleteAddress = factory.deleteOne(AddressModel);
