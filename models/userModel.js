const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "name required"],
      trim: true,
    },
    slug: {
      type: String,
      lowercase: true,
    },
    email: {
      type: String,
      required: [true, "email required"],
      unique: true,
      trim: true,
      lowercase: true,
    },
    phone: String,
    profileImage: String,
    password: {
      type: String,
      required: [true, "password required"],
      minlength: [6, "too short password"],
    },
    passwordUpdatedAt: Date,
    passwordResetCode: String,
    passwordResetCodeExpiresIn: Date,
    passwordResetVerified: Boolean,
    role: {
      type: String,
      enum: ["user", "admin", "manager"],
      default: "user",
    },
    // child reference ==> in small data
    wishlist: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "Product",
      },
    ],
  },
  { timestamps: true }
);

//! return url of images in response
const setImageURL = (doc) => {
  if (doc.profileImage) {
    const ImgUrl = `${process.env.BASE_URL}/users/${doc.profileImage}`;
    doc.profileImage = ImgUrl;
  }
};

userSchema.post("init", (doc) => setImageURL(doc));

userSchema.post("save", (doc) => setImageURL(doc));

//! Hashing user password
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  // Hashing user password
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

const userModel = mongoose.model("User", userSchema);

module.exports = userModel;
