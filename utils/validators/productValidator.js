const { check } = require("express-validator");
const slugify = require("slugify");
const validatorMiddleware = require("../../middlewares/validatorMiddleware");
const CategoryModel = require("../../models/categoryModel");
const subCategoryModel = require("../../models/subCategoryModel");
const brandModel = require("../../models/brandModel");

exports.getProductValidator = [
  check("id").isMongoId().withMessage("Invalid Product id format"),
  validatorMiddleware,
];

exports.createProductValidator = [
  check("name")
    .notEmpty()
    .withMessage("Product required")
    .isLength({ min: 3 })
    .withMessage("Too short Product name")
    .isLength({ max: 80 })
    .withMessage("Too long Product name")
    .custom((val, { req }) => {
      req.body.slug = slugify(val);
      return true;
    }),
  check("description")
    .notEmpty()
    .withMessage("Product description required")
    .isLength({ max: 2000 })
    .withMessage("Too long Product description"),

  check("quantity")
    .notEmpty()
    .withMessage("Product quantity is required")
    .isNumeric()
    .withMessage("Product quantity must be a number"),

  check("sold")
    .optional()
    .isNumeric()
    .withMessage("Product sold must be a number"),

  check("price")
    .notEmpty()
    .withMessage("Product price is required")
    .isNumeric()
    .withMessage("Product price must be a number")
    .isLength({ max: 15 })
    .withMessage("Too long Product price"),

  check("priceAfterDiscount")
    .optional()
    .isNumeric()
    .withMessage("Product priceAfterDiscount must be a number")
    .toFloat()
    .custom((value, { req }) => {
      if (value > req.body.price) {
        throw new Error(
          "Product priceAfterDiscount must be less than product price"
        );
      }
      return true;
    }),

  check("colors")
    .optional()
    .isArray()
    .withMessage("Product colors should be array of string"),

  check("imageCover").notEmpty().withMessage("Product imageCover is require"),

  check("images")
    .optional()
    .isArray()
    .withMessage("Product images should be array of string"),
    
  check("category")
    .notEmpty()
    .withMessage("Product should be belong to category")
    .isMongoId()
    .withMessage("Invalid Id formate")
    .custom((value) =>
      CategoryModel.findById(value).then((category) => {
        if (!category) {
          return Promise.reject(
            new Error(`No Category for this id : ${value}`)
          );
        }
      })
    ),
  check("subCategories")
    .optional()
    .isArray()
    .withMessage("Product subCategories should be array of string")
    .isMongoId()
    .withMessage("Invalid Id formate")

    // to check if subCategoriesId Existing in DB.
    .custom((subCategoriesId) =>
      subCategoryModel
        .find({ _id: { $exists: true, $in: subCategoriesId } })
        .then((result) => {
          if (result.length < 1 || result.length !== subCategoriesId.length) {
            return Promise.reject(new Error(`Invalid subCategories Ids`));
          }
        })
    )
    // to check if subCategories belong to our category that coming in body.
    .custom((value, { req }) =>
      subCategoryModel
        .find({ category: req.body.category })
        .then((subCategories) => {
          const SubCategoriesIdsInDB = [];
          subCategories.forEach((subCategory) => {
            SubCategoriesIdsInDB.push(subCategory._id.toString());
          });
          const checker = (target, arr) => target.every((v) => arr.includes(v));
          if (!checker(value, SubCategoriesIdsInDB)) {
            return Promise.reject(
              new Error(`subCategories not belong to category`)
            );
          }
        })
    ),
  check("brand")
    .optional()
    .isMongoId()
    .withMessage("Invalid Id formate")
    .custom((value) =>
      brandModel.findById(value).then((brand) => {
        if (!brand) {
          return Promise.reject(new Error(`No brand for this id : ${value}`));
        }
      })
    ),
  check("ratingsAverage")
    .optional()
    .isNumeric()
    .withMessage("RatingsAverage must be a number")
    .isLength({ min: 1 })
    .withMessage("Rating must be a above or equal 1")
    .isLength({ max: 5 })
    .withMessage("Rating must be a below or equal 5"),
  check("ratingsQuantity")
    .optional()
    .isNumeric()
    .withMessage("RatingsQuantity must be a number"),

  validatorMiddleware,
];

exports.updateProductValidator = [
  check("id").isMongoId().withMessage("Invalid Product id format"),
  check("name").custom((val, { req }) => {
    req.body.slug = slugify(val);
    return true;
  }),
  validatorMiddleware,
];

exports.deleteProductValidator = [
  check("id").isMongoId().withMessage("Invalid Product id format"),
  validatorMiddleware,
];
