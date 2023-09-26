const CouponModel = require("../models/couponModel");
const factory = require("./handlersFactory");

// @desc    get all coupons
// @route   GET  /api/v1/coupons
// @access  private/protected

exports.getCoupons = factory.getAll(CouponModel);

// @desc    get specific Coupon
// @route   GET  /api/v1/coupons/:id
// @access  private/protected
exports.getCoupon = factory.getOne(CouponModel);

// @desc    create Coupon
// @route   POST  /api/v1/coupons
// @access  private/protected

exports.createCoupon = factory.createOne(CouponModel);

// @desc    update Coupon
// @route   PUT  /api/v1/coupons/:id
// @access  private/protected

exports.updateCoupon = factory.updateOne(CouponModel);

// @desc    delete Coupon
// @route   DELETE  /api/v1/coupons/:id
// @access  private/protected

exports.deleteCoupon = factory.deleteOne(CouponModel);
