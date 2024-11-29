const express = require("express");
const { auth, allowedTo } = require("../controllers/auth");
const {
  addProductToWishList,
  removeProductFromWishList,
  GetLoggedUserWishList,
} = require("../controllers/wishlist");
const {
  addProductToWishListVaidator,
  removeProductFromWishListVaidator,
} = require("../Utils/Validators/wishlistValidator");
const router = express.Router();

router.route("/").get(auth, allowedTo("user"), GetLoggedUserWishList);
router
  .route("/:productId")
  .post(
    auth,
    allowedTo("user"),
    addProductToWishListVaidator,
    addProductToWishList
  )
  .delete(
    auth,
    allowedTo("user"),
    removeProductFromWishListVaidator,
    removeProductFromWishList
  );
module.exports = router;
