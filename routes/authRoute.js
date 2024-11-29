const express = require("express");
const {
  register,
  login,
  forgetPassword,
  verifyPasswordResetCode,
  resetPassword,
  verifyUser,
} = require("../controllers/auth.js");

const {
  signUpValidator,
  loginValidator,
  forgetPasswordValidator,
  verifyPasswordResetCodeValidator,
  resetPasswordValidator,
  verifyUserValidator,
} = require("../Utils/Validators/authValidator");

const router = express.Router();

router.post("/register", signUpValidator, register);
router.post("/verifyUser", verifyUserValidator, verifyUser);
router.post("/login", loginValidator, login);

router.post("/forgetPassword", forgetPasswordValidator, forgetPassword);
router.post(
  "/verifyResetCode",
  verifyPasswordResetCodeValidator,
  verifyPasswordResetCode
);
router.put("/resetPassword", resetPasswordValidator, resetPassword);

module.exports = router;
