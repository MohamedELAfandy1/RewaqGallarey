const { check } = require("express-validator");
const validatorMiddleware = require("../../middleware/validatorMiddleware");
const Category = require("../../models/categoryModel");
const subCategory = require("../../models/subCategoryModel");
const apiError = require("../apiError");
const ProductModel = require("../../models/productModel");

exports.createProductValidator = [
  check("code")
    .notEmpty()
    .withMessage("Code Is Required")
    .custom(async (val, { req }) => {
      await ProductModel.findOne({
        code: val,
        category: req.body.category,
      }).then((product) => {
        if (product) {
          return Promise.reject(
            new Error("Code is already used in this category")
          );
        }
      });
    }),
  check("quantity")
    .notEmpty()
    .withMessage("Quantity Is Rquired")
    .isNumeric()
    .withMessage("Quantity Must Be A Number"),
  check("sold").optional().isNumeric().withMessage("Sold Must Be Number"),
  check("price")
    .optional()
    .isNumeric()
    .withMessage("Price Must Be A Number")
    .isLength({ max: 20 })
    .withMessage("Not Valid Too Long Price "),
  check("priceAfterDiscount")
    .optional()
    .toFloat()
    .isNumeric()
    .withMessage("PriceAfterDiscount Must Be A Number")
    .isLength({ max: 20 })
    .withMessage("Too Long Price")
    .custom(async (value, { req }) => {
      await Category.findById(req.body.category).then((category) => {
        if (category.price <= value) {
          return Promise.reject(
            new apiError("Price After Discount Greater Than Main Price", 401)
          );
        }
      });
    }),
  check("imageCover").notEmpty().withMessage("Image Cover Is Required"),
  check("images")
    .optional()
    .isArray()
    .withMessage("Images Should Be Array Of Strings"),
  check("category")
    .notEmpty()
    .withMessage("Category Is Required")
    .isMongoId()
    .withMessage("Invalid ID Format")
    .custom(
      async (value) =>
        await Category.findById(value).then((category) => {
          if (!category) {
            return Promise.reject(new Error("No Category For This ID"));
          }
        })
    ),
  check("subcategory")
    .optional()
    .isMongoId()
    .withMessage("Invalid ID Format")
    .custom(
      async (subcategoriesIDS) =>
        await subCategory
          .find({ _id: { $exists: true, $in: subcategoriesIDS } })
          .then((result) => {
            if (!Array.isArray(subcategoriesIDS)) {
              temb = subcategoriesIDS;
              subcategoriesIDS = [];
              subcategoriesIDS.push(temb);
            }
            if (
              result.length < 1 ||
              result.length !== subcategoriesIDS.length
            ) {
              return Promise.reject(new Error(`Invalid Subcategories Ids`));
            }
          })
    )
    .custom(
      async (value, { req }) =>
        await subCategory
          .find({ category: req.body.category })
          .then((subcategories) => {
            let ids = [];
            if (!Array.isArray(value)) {
              temb = value;
              value = [];
              value.push(temb);
            }
            subcategories.forEach((subcategory) => {
              ids.push(subcategory._id.toString());
            });

            const checker = (target, arr) =>
              target.every((v) => arr.includes(v));
            if (!checker(value, ids)) {
              return Promise.reject(
                new Error(`Subcategories Not Belong To This Category`)
              );
            }
          })
    ),
  validatorMiddleware,
];

exports.getProductValidator = [
  check("id").isMongoId().withMessage("InValid Product ID Format"),
  validatorMiddleware,
];
exports.updateProductValidator = [
  check("id").isMongoId().withMessage("InValid Product ID Format"),
  check("code")
    .optional()
    .custom(async (val, { req }) => {
      let currentProduct = await ProductModel.findById(req.params.id);
      await ProductModel.findOne({
        _id: { $ne: currentProduct._id }, // Exclude the current product by using $ne
        code: val,
        category: req.body.category || currentProduct.category._id,
      }).then((product) => {
        if (product) {
          return Promise.reject(
            new Error("Code Is Already Used In This Category")
          );
        }
      });
    }),
  check("quantity")
    .optional()
    .isNumeric()
    .withMessage("Quantity Mu st Be A Number"),
  check("sold").optional().isNumeric().withMessage("Sold Must Be Number"),
  check("price")
    .optional()
    .isNumeric()
    .withMessage("Price Must Be A Number")
    .isLength({ max: 20 })
    .withMessage("Not Valid Too Long Price "),
  check("priceAfterDiscount")
    .optional()
    .toFloat()
    .isNumeric()
    .withMessage("PriceAfterDiscount Must Be A Number")
    .isLength({ max: 20 })
    .withMessage("Too Long Price")
    .custom((value, { req }) => {
      if (req.body.price <= value) {
        throw new Error("priceAfterDiscount Must Be Lower Than Price");
      }
      return true;
    }),
  check("imageCover").optional(),
  check("images")
    .optional()
    .isArray()
    .withMessage("Images Should Be Array Of Strings"),
  check("category")
    .optional()
    .isMongoId()
    .withMessage("Invalid ID Format")
    .custom(
      async (value) =>
        await Category.findById(value).then((category) => {
          if (!category) {
            return Promise.reject(new Error("No Category For This ID"));
          }
        })
    ),
  check("subcategory")
    .optional()
    .isMongoId()
    .withMessage("Invalid ID Format")
    .custom(
      async (subcategoriesIDS) =>
        await subCategory
          .find({ _id: { $exists: true, $in: subcategoriesIDS } })
          .then((result) => {
            if (!Array.isArray(subcategoriesIDS)) {
              temb = subcategoriesIDS;
              subcategoriesIDS = [];
              subcategoriesIDS.push(temb);
            }
            if (
              result.length < 1 ||
              result.length !== subcategoriesIDS.length
            ) {
              return Promise.reject(new Error(`Invalid Subcategories Ids`));
            }
          })
    )
    .custom(
      async (value, { req }) =>
        await subCategory
          .find({ category: req.body.category })
          .then((subcategories) => {
            let ids = [];
            if (!Array.isArray(value)) {
              temb = value;
              value = [];
              value.push(temb);
            }
            subcategories.forEach((subcategory) => {
              ids.push(subcategory._id.toString());
            });

            const checker = (target, arr) =>
              target.every((v) => arr.includes(v));
            if (!checker(value, ids)) {
              return Promise.reject(
                new Error(`Subcategories Not Belong To This Category`)
              );
            }
          })
    ),
  validatorMiddleware,

  validatorMiddleware,
];
exports.deleteProductsValidator = [
  check("id").isMongoId().withMessage("InValid Product ID Format"),
  validatorMiddleware,
];
