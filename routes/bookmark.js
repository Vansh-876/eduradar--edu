const Listing = require('../models/listing');

const notificationService = require('../services/notificationService');
const express = require("express");
const router = express.Router();
const { isLoggedIn } = require("../middleware.js");
const User = require("../models/user");

// View Bookmarks
router.get("/bookmark", isLoggedIn, async (req, res) => {
  const user = await User.findById(req.user._id).populate("bookmarks");
  res.render("users/bookmark", { bookmarks: user.bookmarks });
});


router.post('/listings/:id/bookmark', isLoggedIn, async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id).populate('owner');
    const user = await User.findById(req.user._id);

    if (!user.bookmarks.includes(listing._id)) {
      user.bookmarks.push(listing._id);
      await user.save();
console.log('Notification params:', {
  recipientId: listing.owner?._id,
  actorId: req.user._id,
  type: 'bookmark',
  message: `${req.user.username} bookmarked your listing "${listing.name || listing.title}"`,
  link: `/listings/${listing._id}`
});

      // Notify listing owner (if not self)
      if (listing.owner && listing.owner._id.toString() !== req.user._id.toString()) {
        await notificationService.createNotification({
           userID: listing.owner._id,
          actorId: req.user._id,
          type: 'bookmark',
          message: `${req.user.username} bookmarked your listing "${listing.name || listing.title}"`,
          link: `/listings/${listing._id}`
        });
      }
    }

    if (req.xhr) return res.json({ success: true });
    req.flash('success', 'Listing saved to bookmarks!');
    res.redirect('/listings');
  } catch (err) {
    console.error(err);
    req.flash('error', 'Something went wrong.');
    res.redirect('/listings');
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
