const mongoose = require("mongoose");

const addressSchema = new mongoose.Schema(
  {
    alias: String,
    address: String,
    city: String,
    state: String,
    phone: String,
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

const AddressModel = mongoose.model("Address", addressSchema);

module.exports = AddressModel;
