const { check } = require("express-validator");
const validatorMiddleware = require("../../middleware/validatorMiddleware");
const userModel = require("../../models/userModel");

const bcrypt = require("bcryptjs");

exports.signUpValidator = [
  check("name").notEmpty().withMessage("User Name Required"),

  check("email")
    .notEmpty()
    .withMessage("Email Is Required")
    .isEmail()
    .withMessage("Invalid Email Address")
    .custom((value) =>
      userModel.findOne({ email: value }).then((user) => {
        if (user) {
          return Promise.reject(new Error("Email Already Used"));
        }
      })
    ),

  check("password").notEmpty().withMessage("Password Is Required"),

  check("passwordConfirm")
    .notEmpty()
    .withMessage("Password Confirm Is Required")
    .custom((passwordConfirm, { req }) => {
      if (passwordConfirm != req.body.password) {
        throw new Error("Password Confirm InCorrect");
      }
      return true;
    }),

  validatorMiddleware,
];
exports.verifyUserValidator = [
  check("otp").notEmpty().withMessage("OTP Is Required"),
  validatorMiddleware
]
exports.loginValidator = [
  check("email")
    .notEmpty()
    .withMessage("Email Is Required")
    .isEmail()
    .withMessage("Invalid Email Address"),

  check("password").notEmpty().withMessage("Password Is Required"),

  validatorMiddleware,
];

exports.forgetPasswordValidator = [
  check("email")
    .notEmpty()
    .withMessage("Email Is Required")
    .isEmail()
    .withMessage("Not A Valid Email ")
    .custom((value) =>
      userModel.findOne({ email: value }).then((user) => {
        if (!user) {
          return Promise.reject(new Error("No User For This Email"));
        }
      })
    ),
  validatorMiddleware,
];

exports.verifyPasswordResetCodeValidator = [
  check("passwordResetCode")
    .notEmpty()
    .withMessage("Password Reset Code Is Required"),
  validatorMiddleware,
];

exports.resetPasswordValidator = [
  check("email")
    .notEmpty()
    .withMessage("Email Is Required")
    .isEmail()
    .withMessage("Not A Valid Email "),
  check("newPassword").notEmpty().withMessage("New Password Is Required"),

  check("newPasswordConfirm")
    .notEmpty()
    .withMessage("Password Confirm Is Required")
    .custom((passwordConfirm, { req }) => {
      if (passwordConfirm != req.body.newPassword) {
        throw new Error("Password Confirm InCorrect");
      }
      return true;
    }),
  validatorMiddleware,
];
