const Listing = require("../models/listing");
const Review = require("../models/review.js");
const Notification = require('../models/Notification');
const notificationService = require('../services/notificationService');

module.exports.createReview = async (req, res) => {
  const listing = await Listing.findById(req.params.id);
  const newReview = new Review(req.body.review);
  newReview.author = req.user._id;

  listing.reviews.push(newReview);
  await newReview.save();
  await listing.save();

  // 🔔 Notification create
  const notification = new Notification({
    user: listing.owner, // jisne listing banayi
    message: `${req.user.username} reviewed your listing "${listing.title}"`
  });
  await notification.save();

  // 🔴 Emit notification to owner in real-time
  const io = req.app.get('io');
  io.to(listing.owner.toString()).emit('newNotification', notification);

  req.flash("success", "New review added successfully!");
  res.redirect(`/listings/${listing._id}`);
};

module.exports.deleteReview = async (req, res) => {
  const { id, reviewId } = req.params;
  await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
  await Review.findByIdAndDelete(reviewId);
  req.flash("success", "Review deleted successfully!");
  res.redirect(`/listings/${id}`);
};