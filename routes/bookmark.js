// routes/bookmark.js
const express = require("express");
const router = express.Router();
const { isLoggedIn } = require("../middleware.js");
const User = require("../models/user");

// View Bookmarks
router.get("/bookmark", isLoggedIn, async (req, res) => {
  const user = await User.findById(req.user._id).populate("bookmarks");
  res.render("users/bookmark", { bookmarks: user.bookmarks });
});

router.post("/listings/:id/bookmark", isLoggedIn, async (req, res) => {
  try {
    const listingId = req.params.id;
    const user = await User.findById(req.user._id);

    if (!user.bookmarks.includes(listingId)) {
      user.bookmarks.push(listingId);
      await user.save();
    }

  if (req.xhr) { // AJAX request
    return res.json({ success: true });
  }
    req.flash("success", "Listing saved to bookmarks!");
    res.redirect("/listings");
  } catch (err) {
    console.error(err);
    req.flash("error", "Something went wrong.");
    res.redirect("/listings");
  }
});

router.post("/listings/:id/bookmark/delete", isLoggedIn, async (req, res) => {
  const { id } = req.params;
  await User.findByIdAndUpdate(req.user._id, {
    $pull: { bookmarks: id }
  });
  res.redirect("/bookmark");
});


module.exports = router;
