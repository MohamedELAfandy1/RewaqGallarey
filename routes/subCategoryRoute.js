const express = require("express");
const {
  createSubCategory,
  getSubCategories,
  getSubCategory,
  updateSubCategory,
  deleteSubCategory,

  uploadCategoryimage,
  resizeCategoryImage,

  checkCategoryIdInBody,
  createFilterObject,
} = require("../controllers/subCategory");

const {
  createsubCategoryValidator,
  getsubCategoryValidator,
  updatesubCategoryValidator,
  deletesubCategoryValidator,
} = require("../Utils/Validators/subCategoryValidator");

const { auth, allowedTo } = require("../controllers/auth.js");

const router = express.Router({ mergeParams: true });

router
  .route("/")
  .post(
    auth,
    allowedTo("manager", "admin"),
    checkCategoryIdInBody,
    uploadCategoryimage,
    resizeCategoryImage,
    createsubCategoryValidator,
    createSubCategory
  )
  .get(createFilterObject, getSubCategories);

router
  .route("/:id")
  .get(
    getsubCategoryValidator,
    getSubCategory
  )
  .put(
    auth,
    allowedTo("manager", "admin"),
    uploadCategoryimage,
    resizeCategoryImage,
    updatesubCategoryValidator,
    updateSubCategory
  )
  .delete(
    auth,
    allowedTo("admin"),
    deletesubCategoryValidator,
    deleteSubCategory
  );

module.exports = router;
