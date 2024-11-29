const { check } = require("express-validator");
const validatorMiddleware = require("../../Middleware/validatorMiddleware");
const ProductModel = require("../../models/productModel");
const cartModel = require("../../models/cartModel");
const couponModel = require("../../models/couponModel");

exports.addProductToCartValidator = [
  check("productId")
    .notEmpty()
    .withMessage("Product ID Required")
    .custom(async (value, { req }) => {
      const cart = await cartModel.findOne({ user: req.user._id });
      if (!cart) {
        quantityInCard = 0;
      } else {
        const itemIndex = cart.cartItems.findIndex(
          (item) => item.product.toString() == value
        );

        if (itemIndex === -1) {
          quantityInCard = 0;
        } else {
          quantityInCard = cart.cartItems[itemIndex].quantity;
        }
      }

      const product = await ProductModel.findOne({
        _id: value,
        quantity: { $gt: quantityInCard },
      });
      if (!product) {
        return Promise.reject(
          new Error(
            "No Product For This ID Or There Is No Enogh Quantity In Stoke"
          )
        );
      }
    }),
  check("quantity")
    .optional()
    .isNumeric()
    .withMessage("Must Be A Number")
    .custom(async (value, { req }) => {
      const product = await ProductModel.findOne({ _id: req.body.productId });
      if (!product) {
        return Promise.reject(new Error("Product not found"));
      }
      const productQuantity = product.quantity;
      const cart = await cartModel.findOne({ user: req.user._id });
      if (!cart) {
        if (productQuantity < value) {
          return Promise.reject(
            new Error(`There is Only ${productQuantity} Items In Stock `)
          );
        }
      } else {
        const itemIndex = cart.cartItems.findIndex(
          (item) => item.product.toString() == req.body.productId
        );
        if (itemIndex === -1) {
          if (productQuantity < value) {
            return Promise.reject(
              new Error(`There is Only ${productQuantity} Items In Stock `)
            );
          }
        } else {
          const allItemsInCart = cart.cartItems[itemIndex].quantity + value;
          if (productQuantity < allItemsInCart) {
            return Promise.reject(
              new Error(`There is Only ${productQuantity} Items In Stock `)
            );
          }
        }
      }
    }),

  validatorMiddleware,
];

exports.updateCartItemQuantityValidator = [
  check("id").isMongoId().withMessage("Invalid Product ID Format"),
  check("quantity")
    .notEmpty()
    .withMessage("Quantity Is Required")
    .isNumeric()
    .withMessage("Must Be A Number")
    .custom(async (value, { req }) => {
      const cart = await cartModel.findOne({ user: req.user._id });

      const itemIndex = cart.cartItems.findIndex(
        (item) => item._id.toString() == req.params.id
      );
let productId ;
      if (itemIndex != -1) {
        productId = cart.cartItems[itemIndex].product;
      } else {
        return Promise.reject(
          new Error("There Is No Product For This ID In Your Cart")
        );
      }

      const product = await ProductModel.findOne({
        _id: productId,
        quantity: { $gt: value },
      });
      if (!product) {
        return Promise.reject(
          new Error(
            "No Product For This ID Or There Is No Enogh Quantity In Stoke"
          )
        );
      }
    }),
  validatorMiddleware,
];

exports.deleteProductFromCartValidator = [
  check("id").isMongoId().withMessage("Invalid Product ID Format"),
  validatorMiddleware,
];

exports.applyCouponValidator = [
  check("coupon")
    .notEmpty()
    .withMessage("Coupon Is Required")
    .custom((value) =>
      couponModel
        .findOne({ name: value, expire: { $gt: Date.now() } })
        .then((coupon) => {
          if (!coupon) {
            return Promise.reject(new Error("Coupon Is Invalid Or Expired"));
          }
        })
    ),
  validatorMiddleware,
];
