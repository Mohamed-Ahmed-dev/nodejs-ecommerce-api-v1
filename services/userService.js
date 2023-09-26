const asyncHandler = require("express-async-handler");
const { v4: uuidv4 } = require("uuid");
const sharp = require("sharp");
const bcrypt = require("bcryptjs");

const userModel = require("../models/userModel");
const factory = require("./handlersFactory");
const { uploadSingleImage } = require("../middlewares/uploadImageMiddleware");
const ApiError = require("../utils/apiError");
const genrateToken = require("../utils/generateToken");

// Upload Image Middleware
exports.uploadUserImage = uploadSingleImage("profileImage");

//to make some proccessing on images
exports.resizeImage = asyncHandler(async (req, res, next) => {
  const uniqueFileName = `user-${uuidv4()}-${Date.now()}.jpeg`;
  if (req.file) {
    await sharp(req.file.buffer)
      .resize(600, 600)
      .toFormat("jpeg")
      .jpeg({ quality: 90 })
      .toFile(`uploads/users/${uniqueFileName}`);
  }
  // save image in db
  req.body.profileImage = uniqueFileName;
  next();
});

//?============================================================= Admins Only

// @desc    get all users
// @route   GET  /api/v1/users
// @access  private

exports.getUsers = factory.getAll(userModel);

// @desc    get specific User
// @route   GET  /api/v1/users/:id
// @access  private
exports.getUser = factory.getOne(userModel);

// @desc    create User
// @route   POST  /api/v1/users
// @access  private

exports.createUser = factory.createOne(userModel);

// @desc    update User
// @route   PUT  /api/v1/users/:id
// @access  private

exports.updateUserData = asyncHandler(async (req, res, next) => {
  const User = await userModel.findByIdAndUpdate(
    req.params.id,
    {
      name: req.body.name,
      slug: req.body.slug,
      phone: req.body.phone,
      email: req.body.email,
      profileImage: req.body.profileImage,
      role: req.body.role,
    },
    {
      new: true,
    }
  );

  if (!User) {
    next(new ApiError(`No User for this id : ${req.params.id}`, 404));
  } else {
    res.status(200).json({ data: User });
  }
});

exports.updateUserPassword = asyncHandler(async (req, res, next) => {
  const User = await userModel.findByIdAndUpdate(
    req.params.id,
    {
      password: await bcrypt.hash(req.body.password, 12),
      passwordUpdatedAt: Date.now(),
    },
    {
      new: true,
    }
  );

  if (!User) {
    next(new ApiError(`No User for this id : ${req.params.id}`, 404));
  } else {
    res.status(200).json({ data: User });
  }
});

// @desc    delete User
// @route   DELETE  /api/v1/users/:id
// @access  private

exports.deleteUser = factory.deleteOne(userModel);

//?=============================================================  user Only

// @desc    Get Logged User data
// @route   DELETE  /api/v1/users/getMe
// @access  public/proteced

exports.getLoggedUserData = asyncHandler(async (req, res, next) => {
  req.params.id = req.user._id;
  next();
});

// @desc    Update Logged User Password
// @route   DELETE  /api/v1/users/updateMyPassword
// @access  public/proteced

exports.updateLoggedUserPassword = asyncHandler(async (req, res, next) => {
  const User = await userModel.findByIdAndUpdate(
    req.user._id,
    {
      password: await bcrypt.hash(req.body.password, 12),
      passwordUpdatedAt: Date.now(),
    },
    {
      new: true,
    }
  );
  // 2) generate token
  const token = genrateToken(User._id);

  if (!User) {
    next(new ApiError(`No User for this id : ${req.params.id}`, 404));
  } else {
    res.status(200).json({ data: User, token });
  }
});

// @desc    Update Logged User Data
// @route   PUT  /api/v1/users/updateMyData
// @access  public/proteced

exports.updateLoggedUserData = asyncHandler(async (req, res, next) => {
  const User = await userModel.findByIdAndUpdate(
    req.user._id,
    {
      name: req.body.name,
      phone: req.body.phone,
      email: req.body.email,
      profileImage: req.body.profileImage,
    },
    {
      new: true,
    }
  );

  res.status(200).json({ data: User });
});

// @desc    Delete Logged User Data
// @route   DELETE  /api/v1/users/deleteMe
// @access  public/proteced

exports.deleteLoggedUserData = asyncHandler(async (req, res, next) => {
  await userModel.findByIdAndDelete(req.user._id);

  res.status(204).send();
});
