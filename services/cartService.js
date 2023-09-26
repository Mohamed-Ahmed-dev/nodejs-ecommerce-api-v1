const asyncHandler = require("express-async-handler");

const ApiError = require("../utils/apiError");
const CartModel = require("../models/cartModel");
const ProductModel = require("../models/productModel");
const CouponModel = require("../models/couponModel");

// Calc
const calcTotalCartProduct = (cart) => {
  let tatalPrice = 0;
  cart.cartProducts.forEach((item) => {
    tatalPrice += item.price * item.quantity;
  });
  cart.totalPrice = tatalPrice;
  cart.totalPriceAfterDiscount = undefined;
  return tatalPrice;
};

// @desc      Add product to cart
// @route     POST /api/v1/cart
// @access    Private/protected/user

exports.addProductToCart = asyncHandler(async (req, res, next) => {
  const { productId, color } = req.body;
  const product = await ProductModel.findById(productId);
  // get cart for logged user
  let cart = await CartModel.findOne({ user: req.user._id });
  if (!cart) {
    // if cart not exist create new cart with product
    cart = await CartModel.create({
      user: req.user._id,
      cartProducts: [
        {
          product: productId,
          color: color,
          price: product.price,
        },
      ],
    });
  } else {
    // if product exist in cart increase quantity
    const productIndex = cart.cartProducts.findIndex(
      (item) => item.product.toString() === productId && item.color === color
    );
    if (productIndex > -1) {
      const cartItem = cart.cartProducts[productIndex];
      cartItem.quantity += 1;
      cart.cartProducts[productIndex] = cartItem;
    }
    // if product not exist in cart push it to cart
    if (productIndex === -1) {
      cart.cartProducts.push({
        product: productId,
        color: color,
        price: product.price,
      });
    }
  }

  // calculate total price
  calcTotalCartProduct(cart);
  // save
  await cart.save();

  res.status(200).json({
    status: "success",
    msg: "product added to cart successfully",
    numberOfCartItems: cart.cartProducts.length,
    data: cart,
  });
});

// @desc      get logged user shopping cart
// @route     Get /api/v1/cart
// @access    Private/protected/user

exports.getLoggedUsreCart = asyncHandler(async (req, res, next) => {
  const cart = await CartModel.findOne({ user: req.user._id });

  if (!cart) {
    return next(
      new ApiError(`No cart found for this user id ${req.user._id}`, 404)
    );
  }

  res.status(200).json({
    status: "success",
    numberOfCartItems: cart.cartProducts.length,
    data: cart,
  });
});

// @desc      delete Product from cart
// @route     DELETE /api/v1/cart/:itemId
// @access    Private/protected/user

exports.deleteProductFromCart = asyncHandler(async (req, res, next) => {
  const cart = await CartModel.findOneAndUpdate(
    { user: req.user._id },
    {
      $pull: { cartProducts: { _id: req.params.itemId } },
    },
    { new: true }
  );

  calcTotalCartProduct(cart);
  await cart.save();

  res.status(200).json({
    status: "success",
    numberOfCartItems: cart.cartProducts.length,
    data: cart,
  });
});

// @desc      clear logged user cart
// @route     DELETE /api/v1/cart
// @access    Private/protected/user

exports.clearLoggedUserCart = asyncHandler(async (req, res, next) => {
  await CartModel.findOneAndDelete({ user: req.user._id });

  res.status(204).send();
});

// @desc      update specific cart item quantity
// @route     PUT /api/v1/cart
// @access    Private/protected/user

exports.updateCartItemQuantity = asyncHandler(async (req, res, next) => {
  const { quantity } = req.body;

  const cart = await CartModel.findOne({ user: req.user._id });

  if (!cart) {
    return next(
      new ApiError(`No cart found for this user id ${req.user._id}`, 404)
    );
  }

  const itemIndex = cart.cartProducts.findIndex(
    (item) => item._id.toString() === req.params.itemId
  );

  if (itemIndex > -1) {
    const cartItem = cart.cartProducts[itemIndex];
    cartItem.quantity = quantity;
    cart.cartProducts[itemIndex] = cartItem;
  } else {
    return next(
      new ApiError(
        `No cart item found for this item id ${req.params.itemId}`,
        404
      )
    );
  }
  calcTotalCartProduct(cart);
  await cart.save();

  res.status(200).json({
    status: "success",
    numberOfCartItems: cart.cartProducts.length,
    data: cart,
  });
});

// @desc      apply coupon on logged user cart
// @route     PUT /api/v1/cart/applyCoupon
// @access    Private/protected/user

exports.applyCoupon = asyncHandler(async (req, res, next) => {
  // 1- get Coupon based on coupon name
  const coupon = await CouponModel.findOne({
    name: req.body.couponName,
    expire: { $gt: Date.now() },
  });

  if (!coupon) {
    return next(new ApiError("Coupon is not valid or expired", 400));
  }
  // 2- get logged user cart to get total cart price
  const cart = await CartModel.findOne({ user: req.user._id });
  const totalCartPrice = cart.totalPrice;
  // 3- calculate total price after discount
  const totalPriceAfterDiscount = (
    totalCartPrice -
    (totalCartPrice * coupon.discount) / 100
  ).toFixed(2);

  cart.totalPriceAfterDiscount = totalPriceAfterDiscount;

  await cart.save();

  res.status(200).json({
    status: "success",
    numberOfCartItems: cart.cartProducts.length,
    data: cart,
  });
});
