const sharp = require("sharp");
const { v4: uuidv4 } = require("uuid");
const asyncHandler = require("express-async-handler");
const CategoryModel = require("../models/categoryModel");
const factory = require("./handlersFactory");
const { uploadSingleImage } = require("../middlewares/uploadImageMiddleware");

// =============================================================

// Upload Image Middleware
exports.uploadCategoryImage = uploadSingleImage("image");

//to make some proccessing on images
exports.resizeImage = asyncHandler(async (req, res, next) => {
  const uniqueFileName = `category-${uuidv4()}-${Date.now()}.jpeg`;
  if (req.file) {
    await sharp(req.file.buffer)
      .resize(600, 600)
      .toFormat("jpeg")
      .jpeg({ quality: 93 })
      .toFile(`uploads/categories/${uniqueFileName}`);
  }
  // save image in db
  req.body.image = uniqueFileName;
  next();
});

// @desc    get list of categories
// @route   GET /api/v1/categories
// @access  public
exports.getCategories = factory.getAll(CategoryModel);

// @desc    get specific category
// @route   GET /api/v1/categories/:id
// @access  public
exports.getCategory = factory.getOne(CategoryModel);

// @desc    create category
// @route   POST /api/v1/categories
// @access  private
exports.createCategory = factory.createOne(CategoryModel);

// @desc    update specific category
// @route   PUT /api/v1/categories/:id
// @access  Private

exports.updateCategory = factory.updateOne(CategoryModel);

// @desc    Delete specific category
// @route   DELETE /api/v1/categories/:id
// @access  Private

exports.deleteCategory = factory.deleteOne(CategoryModel);
