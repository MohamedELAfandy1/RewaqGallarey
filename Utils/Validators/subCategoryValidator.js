const { check } = require("express-validator");
const validatorMiddleware = require("../../middleware/validatorMiddleware.js");
const subCategoryModel = require("../../models/subCategoryModel.js");

exports.getsubCategoryValidator = [
  check("id").isMongoId().withMessage("Invalid subCategory ID Format"),
  validatorMiddleware,
];

exports.createsubCategoryValidator = [
  check("name")
    .notEmpty()
    .withMessage("subCategory Name Required")
    .custom((value) =>
      subCategoryModel.findOne({ name: value }).then((category) => {
        if (category) {
          return Promise.reject(new Error("SubCategory Name Is Already Used"));
        }
      })
    ),
  check("category")
    .notEmpty()
    .withMessage("Category Name Required")
    .isMongoId()
    .withMessage("Invalid Category Id Format"),
  validatorMiddleware,
];

exports.updatesubCategoryValidator = [
  check("id").isMongoId().withMessage("Invalid subCategory ID Format"),
  validatorMiddleware,
];

exports.deletesubCategoryValidator = [
  check("id").isMongoId().withMessage("Invalid subCategory ID Format"),
  validatorMiddleware,
];
