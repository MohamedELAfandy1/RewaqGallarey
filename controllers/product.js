const multer = require("multer");
const sharp = require("sharp");
const { v4: uuidv4 } = require("uuid");
const asyncHandler = require("express-async-handler");

const ProductModel = require("../models/productModel");
const factory = require("./handlersFactory");
const apiError = require("../Utils/apiError");
const { uploadMixOfImages } = require("../middleware/imageUpload");
const CategoryModel = require("../models/categoryModel");

exports.uploadProductImages = uploadMixOfImages([
  { name: "imageCover", maxCount: 1 },
  { name: "images", maxCount: 10 },
]);

exports.resizeProductImages = asyncHandler(async (req, res, next) => {
  if (req.files) {
    if (req.files.imageCover) {
      const imageCoverfilename = `product-${uuidv4()}-${Date.now()}-cover.jpeg`;
      await sharp(req.files.imageCover[0].buffer).toFile(
        `uploads/product/${imageCoverfilename}`
      );
      req.body.imageCover = imageCoverfilename;
    }
    if (req.files.images) {
      req.body.images = [];
      await Promise.all(
        req.files.images.map(async (image, index) => {
          const imageName = `product-${uuidv4()}-${Date.now()}-${
            index + 1
          }.jpeg`;
          await sharp(image.buffer).toFile(`uploads/product/${imageName}`);

          req.body.images.push(imageName);
        })
      );
    }
  }
  next();
});
exports.createProduct = asyncHandler(async (req, res, next) => {
  const category = await CategoryModel.findById(req.body.category);
  req.body.price = category.price;
  req.body.priceAfterDiscount = category.priceAfterDiscount;
  const product = await ProductModel.create(req.body);
  res.status(201).json({ data: product });
});

exports.getProducts = factory.getAll(ProductModel);

exports.getProduct = factory.getOne(ProductModel);

exports.updateProduct = asyncHandler(async (req, res, next) => {
  const category = await CategoryModel.findById(req.body.category);
  req.body.price = category.price;
  req.body.priceAfterDiscount = category.priceAfterDiscount;
  const product = await ProductModel.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
    }
  );
  if (!product) return next(new apiError("No Document For This Id", 404));

  await product.save();

  res.status(201).json({ data: product });
});
exports.deleteProduct = factory.deleteOne(ProductModel);
