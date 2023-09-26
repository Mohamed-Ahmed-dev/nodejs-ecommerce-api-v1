const asyncHandler = require("express-async-handler");
const { v4: uuidv4 } = require("uuid");
const sharp = require("sharp");
const barndModel = require("../models/brandModel");
const factory = require("./handlersFactory");
const { uploadSingleImage } = require("../middlewares/uploadImageMiddleware");

// Upload Image Middleware
exports.uploadBrandImage = uploadSingleImage("image");

//to make some proccessing on images
exports.resizeImage = asyncHandler(async (req, res, next) => {
  const uniqueFileName = `brand-${uuidv4()}-${Date.now()}.jpeg`;
  await sharp(req.file.buffer)
    .resize(600, 600)
    .toFormat("jpeg")
    .jpeg({ quality: 90 })
    .toFile(`uploads/brands/${uniqueFileName}`);
  // save image in db
  req.body.image = uniqueFileName;
  next();
});

// @desc    get all brands
// @route   GET  /api/v1/brands
// @access  public

exports.getBrands = factory.getAll(barndModel);

// @desc    get specific brand
// @route   GET  /api/v1/brands/:id
// @access  public
exports.getBrand = factory.getOne(barndModel);

// @desc    create brand
// @route   POST  /api/v1/brands
// @access  private

exports.createBrand = factory.createOne(barndModel);

// @desc    update brand
// @route   PUT  /api/v1/brands/:id
// @access  private

exports.updateBrand = factory.updateOne(barndModel);

// @desc    delete brand
// @route   DELETE  /api/v1/brands/:id
// @access  private

exports.deleteBrand = factory.deleteOne(barndModel);
