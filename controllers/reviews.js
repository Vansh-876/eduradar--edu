const Listing = require("../models/listing");
const Review = require("../models/review.js");

module.exports.createReview=async (req, res) => {
    console.log(req.params.id);
  const listing = await Listing.findById(req.params.id);
  const newReview = new Review(req.body.review);
  newReview.author=req.user._id;
  console.log(newReview);
  listing.reviews.push(newReview);
  await newReview.save();
  await listing.save();
req.flash("success", "New review added successfully!");
  res.redirect(`/listings/${listing._id}`);
};

module.exports.deleteReview=async (req, res) => {
  const { id, reviewId } = req.params;
  await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
  await Review.findByIdAndDelete(reviewId);
  req.flash("success", "Review deleted successfully!");
  res.redirect(`/listings/${id}`);
};