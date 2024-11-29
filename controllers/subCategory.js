const sharp = require("sharp");
const { v4: uuidv4 } = require("uuid");
const asyncHandler = require("express-async-handler");

const subCategoryModel = require("../models/subCategoryModel");
const factory = require("./handlersFactory");
const { uploadSingleImage } = require("../middleware/imageUpload");

exports.uploadCategoryimage = uploadSingleImage("image");

exports.resizeCategoryImage = asyncHandler(async (req, res, next) => {
  if (req.file) {
    const filename = `subCategory-${uuidv4()}-${Date.now()}.jpeg`;
    await sharp(req.file.buffer)
      .resize(600, 600)
      .toFormat("jpeg")
      .jpeg({ quality: 90 })
      .toFile(`uploads/subCategory/${filename}`);

    req.body.image = filename;
  }

  next();
});

exports.checkCategoryIdInBody = (req, res, next) => {
  if (req.params.categoryId) req.body.category = req.params.categoryId;
  next();
};

exports.createSubCategory = factory.createOne(subCategoryModel);

exports.createFilterObject = (req, res, next) => {
  let filterObject = {};
  if (req.params.categoryId) filterObject = { category: req.params.categoryId };
  req.filterObject = filterObject;
  next();
};

exports.getSubCategories = factory.getAll(subCategoryModel);

exports.getSubCategory = factory.getOne(subCategoryModel);

exports.updateSubCategory = factory.updateOne(subCategoryModel);

exports.deleteSubCategory = factory.deleteOne(subCategoryModel);
