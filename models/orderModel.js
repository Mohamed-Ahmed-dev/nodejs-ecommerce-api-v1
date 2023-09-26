const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Order must belong to a user"],
    },
    cartProducts: [
      {
        product: {
          type: mongoose.Schema.ObjectId,
          ref: "Product",
          required: [true, "cart must belong to a product"],
        },
        quantity: Number,
        color: String,
        price: Number,
      },
    ],
    shippingAddress: {
      type: mongoose.Schema.ObjectId,
      ref: "Address",
    },
    taxPrice: {
      type: Number,
      default: 0,
    },
    shippingPrice: {
      type: Number,
      default: 0,
    },
    totalOrderPrice: {
      type: Number,
    },
    paymentMethod: {
      type: String,
      enum: ["cash", "card"],
      default: "cash",
    },
    orderStatus: {
      type: String,
      default: "Preparing Your Order",
    },
    isPaid: {
      type: Boolean,
      default: false,
    },
    paidAt: Date,
    isDelivered: {
      type: Boolean,
      default: false,
    },
    deliveredAt: Date,
  },
  { timestamps: true }
);

orderSchema.pre(/^find/, function (next) {
  this.populate({
    path: "user",
    select: "name profileImage email ",
  })
    .populate({
      path: "cartProducts.product",
      select: "name imageCover",
    })
    .populate("shippingAddress");
  next();
});

const OrderModel = mongoose.model("Order", orderSchema);

module.exports = OrderModel;
