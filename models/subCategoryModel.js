const mongoose = require("mongoose");

const SubCategoryShema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true, // " hp" ==> "hp"
      required: [true, "SubCategory name required"],
      unique: [true, "SubCategory must be unique"],
      minlength: [3, "Too short subCategory name"],
      maxlength: [32, "Too long subCategory name"],
    },
    slug: {
      type: String,
      lowercase: true,
    },
    category:{
      type:mongoose.Schema.ObjectId,
      ref:"Category",
      required: [true, "SubCategory must be belong to parent category"],
    }
  },
  { timestamps: true }
);

const SubCategoryModel = mongoose.model("SubCategory", SubCategoryShema);

module.exports = SubCategoryModel;
