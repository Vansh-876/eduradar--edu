const express = require("express");
const router = express.Router();
const passport = require("passport");
const User = require("../models/user");
const wrapAsync = require("../utils/wrapAsync");
const { storeReturnTo ,isLoggedIn, isVendor } = require("../middleware.js");
const userController = require("../controllers/user.js");
const upload = require('../multer');

// Show SignUp form
router.route("/register")
.get( userController.renderSignupForm)
.post(userController.signup);

router.route("/login")
.get( userController.renderLoginForm)
.post( storeReturnTo, passport.authenticate("local", {
  failureFlash: true,
  failureRedirect: "/login"
}), userController.Login);

 router.get("/logout", userController.Logout);

router.route("/profile/settings")
  .get(isLoggedIn, userController.renderProfileSettingsForm)
  .post(isLoggedIn, upload.single('profileImage'), userController.updateProfile);

  router
  .route('/profile/change-password')
  .get(isLoggedIn, userController.renderChangePasswordForm)
  .post(isLoggedIn, userController.changePassword);

  router.get('/dashboard', isLoggedIn, userController.renderDashboard);

router.get('/add-business', isVendor, (req, res) => {
  res.redirect('/listings/new');
});

module.exports = router;
