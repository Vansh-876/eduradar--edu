const User = require("../models/user");
const { isValidEmail } = require("../utils/validators");

// Render Signup Form
module.exports.renderSignupForm = (req, res) => {
  res.render("users/register", { activePage: "register" });
};

module.exports.signup = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    // email format check
    if (!isValidEmail(email)) {
      req.flash("error", "Please enter a valid email address.");
      return res.redirect("/register");
    }

    const user = new User({ username, email, role: ["user"] });
    const registeredUser = await User.register(user, password);

    req.login(registeredUser, (err) => {
      if (err) return next(err);
      req.flash("success", "Welcome to EduRadar!");
      res.redirect("/listings");
    });
  } catch (e) {
    req.flash("error", e.message);
    res.redirect("/register");
  }
};

// Render Login Form
module.exports.renderLoginForm = (req, res) => {
  res.render("users/login", { activePage: "login" });
};

// Handle Login
module.exports.Login = (req, res) => {
  const redirectUrl = res.locals.returnTo || "/listings";
  req.flash("success", "Welcome back!");

  if (req.user.role.includes('vendor')) {
    return res.redirect('/vendor/dashboard');
  }
  res.redirect(redirectUrl);
};

// Handle Logout
module.exports.Logout = (req, res, next) => {
  req.logout(err => {
    if (err) return next(err);
    req.flash("success", "Logged out successfully!");
    res.redirect("/listings");
  });
};

// Render Profile Settings Form
module.exports.renderProfileSettingsForm = (req, res) => {
  res.render("users/settings", { user: req.user, activePage: "settings" });
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

// Render Change Password Form
module.exports.renderChangePasswordForm = (req, res) => {
  res.render('users/changePassword', { activePage: "changePassword" });
};

// Handle Change Password
module.exports.changePassword = async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id);

  if (currentPassword === newPassword) {
    req.flash('error', 'New password cannot be the same as current password!');
    return res.redirect('/changePassword');
  }

  user.changePassword(currentPassword, newPassword, (err) => {
    if (err) {
      req.flash('error', err.message);
      return res.redirect('/changePassword');
    }
    req.flash('success', 'Password updated successfully!');
    res.redirect('/listings');
  });
};

// Render User Dashboard
module.exports.renderDashboard = async (req, res) => {
  const user = await User.findById(req.user._id);
  res.render('users/dashboard', { user, activePage: "dashboard" });
};

// Render Vendor Register Form
module.exports.renderVendorRegisterForm = (req, res) => {
  res.render('vendor/register', { activePage: "vendorRegister" });
};

module.exports.vendorRegister = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    if (!isValidEmail(email)) {
      req.flash("error", "Please enter a valid email address.");
      return res.redirect("/vendor/register");
    }

    const user = new User({ username, email, role: ["vendor"] });

    if (req.file) {
      user.profileImage = { url: req.file.path, filename: req.file.filename };
    }

    const registeredUser = await User.register(user, password);

    req.login(registeredUser, (err) => {
      if (err) return next(err);
      req.flash("success", "Welcome Vendor!");
      res.redirect("/vendor/dashboard");
    });
  } catch (e) {
    req.flash("error", e.message);
    res.redirect("/vendor/register");
  }
};

// Render Vendor Login Form
module.exports.renderVendorLoginForm = (req, res) => {
  res.render('vendor/login', { activePage: "vendorLogin" });
};

// Handle Vendor Login
module.exports.vendorLogin = (req, res) => {
  req.flash('success', 'Welcome back Vendor!');
  res.redirect('/vendor/dashboard');
};

// Handle Vendor Logout
module.exports.vendorLogout = (req, res, next) => {
  req.logout(err => {
    if (err) return next(err);
    req.flash('success', 'Vendor logged out successfully!');
    res.redirect('/');
  });
};
