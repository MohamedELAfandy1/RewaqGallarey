const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: [true, "Product Code Is Required"],
    },
    descreption: {
      type: String,
      required: [true, "Product Descreption Is Requird"],
    },

    quantity: {
      type: Number,
      required: [true, "Product Quantity Is Required"],
    },
    sold: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
    },
    priceAfterDiscount: {
      type: Number,
    },
    imageCover: {
      type: String,
      required: [true, "Product Image Is Cover Is Required"],
    },
    images: [String],
    category: {
      type: mongoose.Schema.ObjectId,
      ref: "category",
      required: [true, "Product Must Be Blong To Category"],
    },
    subcategory: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "subCategory",
      },
    ],
    tags: [{ type: String }],
  },
  {
    timestamps: true,
  }
);

ProductSchema.pre(/^find/, function (next) {
  this.populate([
    { path: "category"},
    { path: "subcategory", select: "name" },
  ]);
  next();
});

ProductSchema.pre("save", function (next) {
  this.populate([
    { path: "category", select: "name -_id" },
    { path: "subcategory", select: "name -_id" },
  ]);
  next();
});

const setImageUrl = (doc) => {
  if (doc.imageCover && !doc.imageCover.startsWith(process.env.BASE_URL)) {
    doc.imageCover = `${process.env.BASE_URL}/product/${doc.imageCover}`;
  }
  if (doc.images) {
    const imagesList = [];
    doc.images.forEach((img) => {
      if (!img.startsWith(process.env.BASE_URL)) {
        const image = `${process.env.BASE_URL}/product/${img}`;
        imagesList.push(image);
      }
    });
    doc.images = imagesList;
  }
};
ProductSchema.post("save", (doc) => {
  setImageUrl(doc);
});
ProductSchema.post("init", (doc) => {
  setImageUrl(doc);
});
const ProductModel = mongoose.model("product", ProductSchema);
module.exports = ProductModel;
