const mongoose = require("mongoose");
const subCategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Category Name Is Required"],
      unique: [true, "Sub category Must Be Unique"],
    },
    category: {
      type: mongoose.Schema.ObjectId,
      ref: "category",
      required: [true, "SubCategory Must Be Belong To Parent Category"],
    },
    image: String,
  },
  { timestamps: true }
);

subCategorySchema.pre(/^find/, function (next) {
  this.populate([{ path: "category", select: "name" }]);
  next();
});
const setImageURL = (doc) => {
  if (doc.image && !doc.image.startsWith(process.env.BASE_URL)) {
    const imageUrl = `${process.env.BASE_URL}/subCategory/${doc.image}`;
    doc.image = imageUrl;
  }
};
subCategorySchema.post("init", function (doc) {
  setImageURL(doc);
});
subCategorySchema.post("save", function (doc) {
  setImageURL(doc);
});

const subCategoryModel = mongoose.model("subCategory", subCategorySchema);
module.exports = subCategoryModel;
