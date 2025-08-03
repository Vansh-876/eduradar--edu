const express = require('express');
const router = express.Router();
const passport = require('passport');
const wrapAsync = require('../utils/wrapAsync');
const { isVendor } = require('../middleware');
const upload = require('../multer');
const Listing = require("../models/listing.js");
const userController = require('../controllers/user');

// ✅ Vendor Register Routes (Single declaration)
router.route('/vendor/register')
  .get(userController.renderVendorRegisterForm)
  .post(upload.single('profileImage'), wrapAsync(userController.vendorRegister));

// ✅ Vendor Login Routes
router.route('/vendor/login')
  .get(userController.renderVendorLoginForm)
  .post(passport.authenticate('local', {
    failureFlash: true,
    failureRedirect: '/vendor/login'
  }), userController.vendorLogin);

// ✅ Vendor Logout
router.get('/vendor/logout', userController.vendorLogout);

router.get('/vendor/dashboard', isVendor, async (req, res) => {
  try {
    const vendorId = req.user._id;

    // Fetch listings of the logged-in vendor
    const vendorListings = await Listing.find({ owner: vendorId });

    res.render("vendor/dashboard", {
      user: req.user,
      listings: vendorListings
    });

  } catch (err) {
    console.error("Dashboard render error:", err);
    req.flash("error", "Something went wrong loading your dashboard.");
    res.redirect("/vendor/login");
  }
});

module.exports = router;
