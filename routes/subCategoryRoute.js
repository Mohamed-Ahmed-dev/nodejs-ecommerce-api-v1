const express = require("express");
const {
  getSubCategories,
  getSubCategory,
  createSubCategory,
  updateSubCategory,
  deleteSubCategory,
  setCategoryIdToBody,
  createNestedObject,
} = require("../services/subCategoryService");

const {
  getsubCategoryValidator,
  createSubCatValidator,
  updateSubCategoryValidator,
  deleteSubCategoryValidator,
} = require("../utils/validators/subCategoryValidator");

const AuthService = require("../services/authService");

// mergeParams: allow us to access parameters on other routes.
// ex: we need to access categoryId from category route.
const router = express.Router({ mergeParams: true });

router
  .route("/")
  .get(createNestedObject, getSubCategories)
  .post(
    AuthService.protect,
    AuthService.allowedTo("admin", "manager"),
    setCategoryIdToBody,
    createSubCatValidator,
    createSubCategory
  );

router
  .route("/:id")
  .get(getsubCategoryValidator, getSubCategory)
  .put(
    AuthService.protect,
    AuthService.allowedTo("admin", "manager"),
    updateSubCategoryValidator,
    updateSubCategory
  )
  .delete(
    AuthService.protect,
    AuthService.allowedTo("admin"),
    deleteSubCategoryValidator,
    deleteSubCategory
  );

module.exports = router;
