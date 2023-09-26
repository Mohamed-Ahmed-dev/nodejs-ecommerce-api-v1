const crypto = require("crypto");
const asyncHandler = require("express-async-handler");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const userModel = require("../models/userModel");
const ApiError = require("../utils/apiError");
const sendEmail = require("../utils/sendEmail");
const genrateToken = require("../utils/generateToken");

// @desc    sign up
// @route   POST  /api/v1/auth/signup
// @access  public
exports.signup = asyncHandler(async (req, res, next) => {
  // 1) create User
  const user = await userModel.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
  });
  // 1) generate token
  const token = genrateToken(user._id);

  res.status(201).json({ data: user, token });
});

// @desc    log in
// @route   POST  /api/v1/auth/login
// @access  public
exports.login = asyncHandler(async (req, res, next) => {
  // 1)check if the password and email in the body (validation layer)
  // 2)check if user exist & password is correct
  const user = await userModel.findOne({ email: req.body.email });

  if (!user || !(await bcrypt.compare(req.body.password, user.password))) {
    return next(new ApiError("Incorrect email or password", 401));
  }
  // 3) generate token
  const token = genrateToken(user._id);

  // 3) send res to client side
  res.status(200).json({ data: user, token });
});

// @desc    make sure that user is logged in
exports.protect = asyncHandler(async (req, res, next) => {
  // 1) check if the token exist
  let token;
  if (req.headers.authorization) {
    token = req.headers.authorization.split(" ")[1];
  }
  if (!token) {
    return next(
      new ApiError(
        "You are not login, please login to get access this route",
        401
      )
    );
  }
  // 2) verify token (no changes happens, not expired token)
  const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
  // 3) check if the user exist
  const currentUser = await userModel.findById(decoded.userId);
  if (!currentUser) {
    return next(new ApiError("No exist user for this token", 401));
  }
  // 4) check if user change his password after token created
  if (currentUser.passwordUpdatedAt) {
    const passwordUpdatedTimeStamp = parseInt(
      currentUser.passwordUpdatedAt.getTime() / 1000,
      10
    );

    if (passwordUpdatedTimeStamp > decoded.iat) {
      return next(
        new ApiError(
          "User recently changed his password. please login again",
          401
        )
      );
    }
  }
  req.user = currentUser;
  next();
});

// @desc    make permitions
//(...role) as a prop ===> ["admin" ,"manager"]
exports.allowedTo = (...roles) =>
  asyncHandler(async (req, res, next) => {
    // 1)access roles
    // 2)access regestered user (req.user.role)
    if (!roles.includes(req.user.role)) {
      return next(
        new ApiError("You are not allowed to access this route", 403)
      );
    }
    next();
  });

// @desc   forget password
exports.forgetPassword = asyncHandler(async (req, res, next) => {
  //! 1)  Get user based on POSTed email
  const user = await userModel.findOne({ email: req.body.email });
  if (!user) {
    return next(new ApiError("There is no user for this email", 404));
  }
  //! 2)  If the user exist Generate hash random 6 digits and save it in db
  const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
  const resetCodeHash = crypto
    .createHash("sha256")
    .update(resetCode)
    .digest("hex");
  // save resetCodeHash in db
  user.passwordResetCode = resetCodeHash;
  // add expiration time for resetCodeHash
  user.passwordResetCodeExpiresIn = Date.now() + 10 * 60 * 1000;
  user.passwordResetVerified = false;
  await user.save();
  //! 3)  Send it to user's email
  const message = `Hi ${user.name},\n Your reset code is:\n ${resetCode}`;
  try {
    await sendEmail({
      email: user.email,
      subject: "Reset Password Code (valid for 10 min)",
      message: message,
    });
  } catch (error) {
    user.passwordResetCode = undefined;
    user.passwordResetCodeExpiresIn = undefined;
    user.passwordResetVerified = undefined;

    await user.save();
    return next(new ApiError("Error in sending email", 500));
  }

  res
    .status(200)
    .json({ status: "success", message: "Reset code sent to your email" });
});

// @desc   verify password reset code
exports.verifyResetPasswordCode = asyncHandler(async (req, res, next) => {
  // 1) get user based on resetCode
  const code = req.body.resetCode;
  const hashRestCode = crypto.createHash("sha256").update(code).digest("hex");
  const user = await userModel.findOne({
    passwordResetCode: hashRestCode,
    passwordResetCodeExpiresIn: { $gt: Date.now() },
  });
  if (!user) {
    return next(new ApiError("Reset code Invalid or expired", 400));
  }
  // 2) if code valid or not expired
  user.passwordResetVerified = true;
  await user.save();
  res.status(200).json({ status: "success", message: "Code verified" });
});

// @desc   reset password
exports.resetPassword = asyncHandler(async (req, res, next) => {
  // 1) get user based on email
  const user = await userModel.findOne({ email: req.body.email });
  if (!user) {
    return next(new ApiError("There is no user for this email", 404));
  }
  // 2) check if the code is verified
  if (!user.passwordResetVerified) {
    return next(new ApiError("Please verify your code first", 400));
  }
  user.password = req.body.newPassword;
  user.passwordResetCode = undefined;
  user.passwordResetCodeExpiresIn = undefined;
  user.passwordResetVerified = undefined;
  await user.save();
  // generate token
  const token = genrateToken(user._id);

  res.status(200).json({ token });
});
