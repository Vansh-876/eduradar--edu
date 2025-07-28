const express = require('express');
const router = express.Router();
const passport = require('passport');
const wrapAsync = require('../utils/wrapAsync');
const { isVendor } = require('../middleware');
const upload = require('../multer');
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

// ✅ Vendor Dashboard (Protected)
router.get('/vendor/dashboard', isVendor, (req, res) => {
  res.render('vendor/dashboard', { user: req.user });
});


module.exports = router;
