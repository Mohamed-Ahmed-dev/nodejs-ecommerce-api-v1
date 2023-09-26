const sharp = require("sharp");
const asyncHandler = require("express-async-handler");
const { v4: uuidv4 } = require("uuid");
const ProductModel = require("../models/productModel");
const factory = require("./handlersFactory");
const { uploadMixOfImage } = require("../middlewares/uploadImageMiddleware");


exports.uploadProductsImages = uploadMixOfImage([
  { name: "imageCover", maxCount: 1 },
  { name: "images", maxCount: 6 },
]);

exports.resizeImages = asyncHandler(async (req, res, next) => {
  // processing for imageCover
  if (req.files.imageCover) {
    const imageCoverFileName = `product-${uuidv4()}-${Date.now()}-cover.jpeg`;
    await sharp(req.files.imageCover[0].buffer)
      .resize(2000, 1333)
      .toFormat("jpeg")
      .jpeg({ quality: 90 })
      .toFile(`uploads/products/${imageCoverFileName}`);
    // save image in db
    req.body.imageCover = imageCoverFileName;
  }
  // processing for images
  if (req.files.images) {
    req.body.images = [];
    await Promise.all(
      req.files.images.map(async (img, index) => {
        const imageName = `product-${uuidv4()}-${Date.now()}-${index + 1}.jpeg`;
        await sharp(img.buffer)
          .resize(2000, 1333)
          .toFormat("jpeg")
          .jpeg({ quality: 90 })
          .toFile(`uploads/products/${imageName}`);
        // save image in db
        req.body.images.push(imageName);
      })
    );
  }
  next();
});

// @desc    get list of products
// @route   GET /api/v1/products
// @access  public
exports.getProducts = factory.getAll(ProductModel);

// @desc    get specific product
// @route   GET /api/v1/products/:id
// @access  public
exports.getProduct = factory.getOne(ProductModel);

// @desc    create product
// @route   POST /api/v1/products
// @access  private
exports.createProduct = factory.createOne(ProductModel);

// @desc    update specific product
// @route   PUT /api/v1/products/:id
// @access  Private

exports.updateProduct = factory.updateOne(ProductModel);

// @desc    Delete specific product
// @route   DELETE /api/v1/products/:id
// @access  Private

exports.deleteProduct = factory.deleteOne(ProductModel);
