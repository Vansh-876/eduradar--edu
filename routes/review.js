const express = require("express");
const router = express.Router({ mergeParams: true });
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const { listingSchema, reviewSchema } = require("../schema.js");
const ReviewController = require("../controllers/reviews.js");
const Listing = require("../models/listing.js");
const { isLoggedIn, isReviewAuthor, validateReview} = require("../middleware.js");


//post review Routes
router.post("/", isLoggedIn, validateReview, wrapAsync(ReviewController.createReview));

// Delete Review Routes
router.delete("/:reviewId",
   isLoggedIn,
   isReviewAuthor,
  wrapAsync(ReviewController.deleteReview));

module.exports = router;