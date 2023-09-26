const mongoose = require("mongoose");

const barndSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Barnd Name is required."],
      unique: [true, "Barnd Name must be unique."],
      trim: true,
      minlength: [3, "Barnd Name must be at least 3 characters long."],
      maxlength: [30, "Barnd Name cannot be more than 30 characters long."],
    },
    slug: {
      type: String,
      lowercase: true,
    },
    image: {
      type: String,
    },
  },
  { timestamps: true }
);
const setImageURL = (doc) => {
  if (doc.image) {
    const imageUrl = `${process.env.BASE_URL}/brands/${doc.image}`;
    doc.image = imageUrl;
  }
};
// this mongoose middleware working on getAll-getOne-update not working on create
barndSchema.post("init", (doc) => {
  setImageURL(doc);
});
// this mongoose middleware working on craete
barndSchema.post("save", (doc) => {
  setImageURL(doc);
});

const barndModel = mongoose.model("Barnd", barndSchema);

module.exports = barndModel;
