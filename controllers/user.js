const User = require("../models/user");

module.exports.renderSignupForm=async(req, res) => {
  res.render("users/register");
};

module.exports.signup=async (req, res, next) => {
  try {
    const { username, email, password } = req.body;
     const user = new User({ username, email, role: ['user'] }); 
    const registeredUser = await User.register(user, password);
    console.log(registeredUser);
    req.login(registeredUser, (err) => {
      if (err) {
        return next(err); 
    }
    req.flash("success", "Welcome to EduRadar!");
    res.redirect("/listings");
  });

  } catch (e) {
    req.flash("error", e.message);
    res.redirect("/register");
  }
};

module.exports.renderLoginForm=async(req, res) => {
  res.render("users/login");
};

module.exports.Login = async (req, res) => {
  const redirectUrl = res.locals.returnTo || "/listings";
  req.flash("success", "Welcome back!");

  if (req.user.role.includes('vendor')) {   // ✅ Array ke liye includes use karo
    return res.redirect('/vendor/dashboard');
  }
  res.redirect(redirectUrl);
};

module.exports.Logout= async(req, res) => {
  req.logout(err => {
    if (err) {
      return next(err);
    }
    req.flash("success", "Logged out successfully!");
    res.redirect("/listings");
  });
};

// Show Profile Settings Form
module.exports.renderProfileSettingsForm = async (req, res) => {
  res.render("users/settings", { user: req.user });
};

// Handle Profile Update (username, email, profileImage)
module.exports.updateProfile = async (req, res) => {
  const { username, email } = req.body;
  const user = await User.findById(req.user._id);

  user.username = username;
  user.email = email;

  if (req.file) {
    user.profileImage = { url: req.file.path, filename: req.file.filename };
  }

  await user.save();

  req.flash("success", "Profile updated successfully!");
  res.redirect("/");
};

module.exports.renderChangePasswordForm = (req, res) => {
  res.render('users/changePassword'); // You’ll create this EJS file
};

module.exports.changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id);

  const isMatch = await user.authenticate(currentPassword);

  if (!isMatch.user) {
    req.flash('error', 'Incorrect current password!');
    return res.redirect('/profile/change-password');
  }

  if (currentPassword === newPassword) {
    req.flash('error', 'New password cannot be the same as current password!');
    return res.redirect('/profile/change-password');
  }

  await user.setPassword(newPassword);
  await user.save();

  req.flash('success', 'Password updated successfully!');
  res.redirect('/listings');
};

module.exports.renderDashboard = async (req, res) => {
  const user = await User.findById(req.user._id);
  res.render('users/dashboard', { user });
};

// ✅ Render Vendor Register Form
module.exports.renderVendorRegisterForm = (req, res) => {
  res.render('vendor/register');  // Make sure you have this EJS file
};

// ✅ Handle Vendor Registration
module.exports.vendorRegister = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;
    const user = new User({ username, email, role: ['vendor'] });

    if (req.file) {
      user.profileImage = { url: req.file.path, filename: req.file.filename };
    }

    const registeredUser = await User.register(user, password);

    req.login(registeredUser, (err) => {
      if (err) return next(err);
      req.flash('success', 'Welcome Vendor!');
      res.redirect('/vendor/dashboard');
    });

  } catch (e) {
    req.flash('error', e.message);
    res.redirect('/vendor/register');
  }
};

// ✅ Render Vendor Login Form
module.exports.renderVendorLoginForm = (req, res) => {
  res.render('vendor/login');  // Make this EJS file
};

// ✅ Handle Vendor Login (Post Success)
module.exports.vendorLogin = (req, res) => {
  req.flash('success', 'Welcome back Vendor!');
  res.redirect('/vendor/dashboard');
};

// ✅ Vendor Logout
module.exports.vendorLogout = (req, res) => {
  req.logout(err => {
    if (err) return next(err);
    req.flash('success', 'Vendor logged out successfully!');
    res.redirect('/');
  });
};

