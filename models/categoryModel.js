const mongoose = require("mongoose");
const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Category Name Is Required"],
      unique: [true, "Category Must Be Unique"],
    },
    price: {
      type: Number,
      required: true,
    },
    priceAfterDiscount: Number,
    image: String,
  },
  { timestamps: true }
);

const setImageURL = (doc) => {
  if (doc.image && !doc.image.startsWith(process.env.BASE_URL)) {
    const imageUrl = `${process.env.BASE_URL}/category/${doc.image}`;
    doc.image = imageUrl;
  }
};
categorySchema.post("init", function (doc) {
  setImageURL(doc);
});
categorySchema.post("save", function (doc) {
  setImageURL(doc);
});

const CategoryModel = mongoose.model("category", categorySchema);

module.exports = CategoryModel;
