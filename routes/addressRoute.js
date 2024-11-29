const express = require("express");
const { auth, allowedTo } = require("../controllers/auth");
const {
  GetLoggedUserAddresses,
  addAddress,
  removeAddress,
} = require("../controllers/address");
const {
  removeAddressValidator,
} = require("../Utils/Validators/addressValidator");
const router = express.Router();

router
  .route("/")
  .get(auth, allowedTo("user"), GetLoggedUserAddresses)
  .post(auth, allowedTo("user"), addAddress);
router
  .route("/:id")
  .delete(auth, allowedTo("user"), removeAddressValidator, removeAddress);
module.exports = router;
