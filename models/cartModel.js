const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema(
  {
    cartProducts: [
      {
        product: {
          type: mongoose.Schema.ObjectId,
          ref: "Product",
          required: [true, "cart must belong to a product"],
        },
        quantity: {
          type: Number,
          default: 1,
        },
        color: String,
        price: Number,
      },
    ],
    totalPrice: {
      type: Number,
      default: 0,
    },
    totalPriceAfterDiscount: Number,
    totalQuantity: Number,
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "cart must belong to a user"],
    },
  },
  { timestamps: true }
);

const CartModel = mongoose.model("Cart", cartSchema);

module.exports = CartModel;
