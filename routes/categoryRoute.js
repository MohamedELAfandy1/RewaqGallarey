const express = require("express");
const {
  getCategoryValidator,
  updateCategoryValidator,
  deleteCategoryValidator,
  createCategoryValidator,
} = require("../Utils/Validators/CategoryValidator.js");

const {
  createCategory,
  getCategories,
  getCategory,
  updateCategory,
  deleteCategory,
  uploadCategoryimage,
  resizeCategoryImage,
} = require("../controllers/category.js");

const { auth, allowedTo } = require("../controllers/auth.js");

const router = express.Router();

router
  .route("/")
  .post(
    auth,
    allowedTo("admin", "manager"),
    uploadCategoryimage,
    resizeCategoryImage,
    createCategoryValidator,
    createCategory
  )
  .get(getCategories);

router
  .route("/:id")
  .get(getCategoryValidator, getCategory)
  .put(
    auth,
    allowedTo("admin", "manager"),
    uploadCategoryimage,
    resizeCategoryImage,
    updateCategoryValidator,
    updateCategory
  )
  .delete(auth, allowedTo("admin"), deleteCategoryValidator, deleteCategory);

const subCategoryRoute = require("./subCategoryRoute.js");
router.use("/:categoryId/subcategory", subCategoryRoute);

module.exports = router;
