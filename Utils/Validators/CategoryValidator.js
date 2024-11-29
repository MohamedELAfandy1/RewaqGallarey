const { check } = require("express-validator");
const validatorMiddleware = require("../../middleware/validatorMiddleware.js");
const CategoryModel = require("../../models/categoryModel.js");

exports.getCategoryValidator = [
  check("id").isMongoId().withMessage("Invalid Category ID Format"),
  validatorMiddleware,
];

exports.createCategoryValidator = [
  check("name")
    .notEmpty()
    .withMessage("Category Name Required")
    .custom((value) =>
      CategoryModel.findOne({ name: value }).then((category) => {
        if (category) {
          return Promise.reject(new Error("Category Name Is Already Used"));
        }
      })
    ),
  check("price").notEmpty().withMessage("Category Price Is Required"),
  validatorMiddleware,
];

exports.updateCategoryValidator = [
  check("id").isMongoId().withMessage("Invalid Category ID Format"),
  validatorMiddleware,
];

exports.deleteCategoryValidator = [
  check("id").isMongoId().withMessage("Invalid Category ID Format"),
  validatorMiddleware,
];

