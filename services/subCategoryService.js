const SubCategoryModel = require("../models/subCategoryModel");
const factory = require("./handlersFactory");

// nested route == I need to reach to getSubCategories Handler from categories
// GET /api/v1/categories/:categoryId/subcategories

//! (=> Middleware <=) to get categoryId And add it to req;
exports.createNestedObject = (req, res, next) => {
  let nestedObject = {};
  if (req.params.categoryId) {
    nestedObject = { category: req.params.categoryId };
  }
  req.nestedObject = nestedObject;
  next();
};

// @desc    get all subcategories
// @route   GET /api/v1/subCategories
// @access  public
exports.getSubCategories = factory.getAll(SubCategoryModel);

// @desc    get specific subcategory
// @route   GET /api/v1/subCategories/:id
// @access  public

exports.getSubCategory = factory.getOne(SubCategoryModel);

//! (=> Middleware <=) to set body before validation
exports.setCategoryIdToBody = (req, res, next) => {
  // create sub category using nested route
  if (!req.body.category) {
    req.body.category = req.params.categoryId;
  }
  next();
};
// @desc    create subcategory
// @route   POST /api/v1/subCategories
// @access  private
exports.createSubCategory = factory.createOne(SubCategoryModel);

// @desc    update subcategory
// @route   PUT /api/v1/subCategories
// @access  private

exports.updateSubCategory = factory.updateOne(SubCategoryModel);

// @desc    delete subcategory
// @route   DELETE /api/v1/subCategories
// @access  private

exports.deleteSubCategory = factory.deleteOne(SubCategoryModel);
