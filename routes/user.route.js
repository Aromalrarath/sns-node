const express = require('express');

const{registerUser,
    getAllUsers,
    loginUser,
    getUserDetails,
    updateProfile,
    logout,
    forgotpassword,
    updatePassword,
    resetPassword} = require('../controllers/userController');
const { isAuthenticatedUser, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

router.route("/register").post(registerUser);
router.route("/login").post(loginUser);
router.route("/logout").get(logout);
router.route("/user-lists").get(getAllUsers);
router.route("/me").get(isAuthenticatedUser, getUserDetails);
router.route("/me/update").put(isAuthenticatedUser, updateProfile);
router.route("/password/forgot").post(forgotpassword);
router.route("/password/reset/:token").post(resetPassword);
router.route("/password/update").put(isAuthenticatedUser, updatePassword);


router
    .route("/admin/users")
    .get(isAuthenticatedUser, authorizeRoles('admin'), getAllUsers)

module.exports = router;