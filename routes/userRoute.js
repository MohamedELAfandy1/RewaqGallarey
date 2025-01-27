const express = require("express");
const {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  changeUserPassword,
  deleteUser,
  uploadUserImage,
  resizeUserImage,
  getLoggedUserData,
  updateLoggedUserPassword,
  updateLoggedUserData,
} = require("../controllers/user");

const {
  createUserValidator,
  updateUserValidator,
  getUserValidator,
  deleteUserValidator,
  changeUserPasswordValidator,
  changeLoggedUserPasswordValidator,
  updateLoggedUserValidator,
} = require("../Utils/Validators/usersValidator");

const { auth, allowedTo } = require("../controllers/auth.js");

const router = express.Router();

router.get("/getMe", auth, getLoggedUserData, getUserById);

router.put(
  "/updateMe",
  auth,
  uploadUserImage,
  resizeUserImage,
  updateLoggedUserValidator,
  updateLoggedUserData
);

router.put(
  "/changeMyPassword",
  auth,
  changeLoggedUserPasswordValidator,
  updateLoggedUserPassword
);


////////////////////////////////////////////////////////////////////////////////////////////

router
  .route("/")
  .get(auth, allowedTo("admin", "manager"), getAllUsers)
  .post(
    auth,
    allowedTo("admin"),
    uploadUserImage,
    resizeUserImage,
    createUserValidator,
    createUser
  );

router
  .route("/:id")
  .get(auth, allowedTo("admin"), getUserValidator, getUserById)
  .put(
    auth,
    allowedTo("admin"),
    uploadUserImage,
    resizeUserImage,
    updateUserValidator,
    updateUser
  )
  .delete(auth, allowedTo("admin"), deleteUserValidator, deleteUser);

router.put(
  "/changePassword/:id",
  auth,
  allowedTo("admin", "manager"),
  changeUserPasswordValidator,
  changeUserPassword
);

module.exports = router;
