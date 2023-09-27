const asyncHandler = require("express-async-handler");
const stripe = require("stripe")(
  "sk_test_51NtsiiEQBsCBtwyvxPuqJ3l1gqOpizN7X8kTUBE2xslw0g8CVd1WrM5kC7Xcu5dGRrGZJ6exGpQRxra2VVD5ZomR00aVEbO4Zr"
);

const ApiError = require("../utils/apiError");
const Factory = require("./handlersFactory");
const CartModel = require("../models/cartModel");
const OrderModel = require("../models/orderModel");
const ProductModel = require("../models/productModel");
const userModel = require("../models/userModel");

// @desc    Create cash order
// @route   POST /api/orders/:cartId
// @access  Private/protected/user

exports.createCashOrder = asyncHandler(async (req, res, next) => {
  const taxPrice = 0;
  const shippingPrice = 0;
  // 1-get cart using cart Id
  const cart = await CartModel.findById(req.params.cartId);
  if (!cart) {
    next(new ApiError(`No cart for this id:${req.params.cartId}`, 404));
  }
  // 2-get order price depend on cart price "check if coupon applying"
  const cartPrice = cart.totalPriceAfterDiscount
    ? cart.totalPriceAfterDiscount
    : cart.totalPrice;

  const orderPrice = cartPrice + taxPrice + shippingPrice;
  // 3-create order with defult payment Method "cash"
  let order;
  if (cart.cartProducts.length > 0) {
    order = await OrderModel.create({
      user: req.user._id,
      cartProducts: cart.cartProducts,
      shippingAddress: req.body.addressId,
      totalOrderPrice: orderPrice,
    });
  } else {
    next(new ApiError(`No products in this cart`, 404));
  }

  // 4-after creating order , decrement quantity and increment sold
  if (order) {
    const bulkOption = cart.cartProducts.map((item) => ({
      updateOne: {
        filter: { _id: item.product },
        update: { $inc: { quantity: -item.quantity, sold: +item.quantity } },
      },
    }));
    await ProductModel.bulkWrite(bulkOption, {});
  }
  // 5-clear user cart
  await CartModel.findByIdAndDelete(req.params.cartId);
  // 6-res
  res.status(201).json({ status: "success", data: order });
});

//! @desc Middleware to get logged user cart only depend on role === "user"
exports.filterOrderForLoggedUser = asyncHandler(async (req, res, next) => {
  if (req.user.role === "user") {
    req.nestedObject = { user: req.user._id };
  }
  next();
});

// @desc    Get All Orders
// @route   POST /api/orders
// @access  Private/protected/user-admin-manager

exports.findAllOrders = Factory.getAll(OrderModel);

// @desc    Get specific Order
// @route   POST /api/orders/:orderId
// @access  Private/protected

exports.findOrder = Factory.getOne(OrderModel);

// @desc    update order status
// @route   PUT /api/orders/:orderId/status
// @access  Private/protected/admin
exports.updateOrderStatus = asyncHandler(async (req, res, next) => {
  const order = await OrderModel.findById(req.params.orderId);
  if (!order) {
    next(new ApiError(`No order for this id:${req.params.orderId}`, 404));
  }
  order.orderStatus = req.body.orderStatus;

  const updatedOrder = await order.save();
  res.status(200).json({ status: "success", data: updatedOrder });
});

// @desc    update order paid status paid
// @route   PUT /api/orders/:orderId/pay
// @access  Private/protected/admin

exports.updateOrderToPay = asyncHandler(async (req, res, next) => {
  const order = await OrderModel.findById(req.params.orderId);
  if (!order) {
    next(new ApiError(`No order for this id:${req.params.orderId}`, 404));
  }
  order.isPaid = true;
  order.paidAt = Date.now();

  const updatedOrder = await order.save();
  res.status(200).json({ status: "success", data: updatedOrder });
});

// @desc    update order delivered status
// @route   PUT /api/orders/:orderId/deliver
// @access  Private/protected/admin

exports.updateOrderToDelivered = asyncHandler(async (req, res, next) => {
  const order = await OrderModel.findById(req.params.orderId);
  if (!order) {
    next(new ApiError(`No order for this id:${req.params.orderId}`, 404));
  }
  order.isDelivered = true;
  order.deliveredAt = Date.now();

  const updatedOrder = await order.save();
  res.status(200).json({ status: "success", data: updatedOrder });
});

// !=============================================================================================

// @desc    Create online order
// @route   PUT /api/orders/checkout-session/cartId
// @access  Private/protected/user

exports.checkoutSession = asyncHandler(async (req, res, next) => {
  const taxPrice = 0;
  const shippingPrice = 0;
  // 1-get cart using cart Id
  const cart = await CartModel.findById(req.params.cartId);
  if (!cart) {
    next(new ApiError(`No cart for this id:${req.params.cartId}`, 404));
  }
  // 2-get order price depend on cart price "check if coupon applying"
  const cartPrice = cart.totalPriceAfterDiscount
    ? cart.totalPriceAfterDiscount
    : cart.totalPrice;

  const orderPrice = cartPrice + taxPrice + shippingPrice;
  // 3) Create stripe checkout session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "egp",
          product_data: {
            name: req.user.name,
          },
          unit_amount: orderPrice * 100,
        },
        quantity: 1,
      },
    ],
    mode: "payment",
    success_url: `${req.protocol}://${req.get("host")}/orders`,
    cancel_url: `${req.protocol}://${req.get("host")}/cart`,
    customer_email: req.user.email,
    client_reference_id: req.params.cartId,
    metadata: req.body.shippingAddress,
  });

  // 4) send session to response
  res.status(200).json({ status: "success", session });
});

// @desc    Create online order function
const createOrder = async (session) => {
  const cartId = session.client_reference_id;
  const shippingAddress = session.metadata;
  const oderPrice = session.amount_total / 100;

  const cart = await CartModel.findById(cartId);
  const user = await userModel.findOne({ email: session.customer_email });

  // 3) Create order with default paymentMethodType card
  const order = await OrderModel.create({
    user: user._id,
    cartProducts: cart.cartProducts,
    shippingAddress,
    totalOrderPrice: oderPrice,
    isPaid: true,
    paidAt: Date.now(),
    paymentMethodType: "card",
  });

  // 4) After creating order, decrement product quantity, increment product sold
  if (order) {
    const bulkOption = cart.cartItems.map((item) => ({
      updateOne: {
        filter: { _id: item.product },
        update: { $inc: { quantity: -item.quantity, sold: +item.quantity } },
      },
    }));
    await ProductModel.bulkWrite(bulkOption, {});

    // 5) Clear cart depend on cartId
    await CartModel.findByIdAndDelete(cartId);
  }
};

// @desc    this webhook will run when payment completed
// @route   POST checkout-webhook
// @access  Private/protected/user

exports.webhookCheckout = asyncHandler(async (req, res, next) => {
  const sig = req.headers["stripe-signature"];

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      "whsec_tnyG9jScEcUkR1Ogm2dbLP7VlWVUHA1d"
    );
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    // create order after payment
    createOrder(event.data.object);
  }

  res.status(200).json({ received: true });
});
