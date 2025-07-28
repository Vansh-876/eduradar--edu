const Listing = require("./models/listing");
const Review = require("./models/review.js");
const ExpressError = require("./utils/ExpressError.js");
const { listingSchema, reviewSchema } = require("./schema.js");


module.exports.isLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    req.session.returnTo = req.originalUrl; // save original URL
    req.flash("error", "You must be logged in to do that");
    return res.redirect("/login");
  }
  next();
};

module.exports.storeReturnTo = (req, res, next) => {
  if (req.session.returnTo) {
    res.locals.returnTo = req.session.returnTo;
  }
  next();
};

module.exports.isListingOwner = async (req, res, next) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);
  if (!listing.owner || !listing.owner.equals(req.user._id)) {
    req.flash("error", "You don't have permission to do that");
    return res.redirect(`/listings/${id}`);
  }
  next();
};

module.exports.isReviewAuthor = async (req, res, next) => {
  const {id,  reviewId } = req.params;
  const review = await Review.findById(reviewId);
  if (!review.author || !review.author.equals(req.user._id)) {
    req.flash("error", "You don't have permission to do that");
    return res.redirect(`/listings/${id}`);
  }
  next();
};

module.exports.validateListing = async (req, res, next) => {
    let {error} =  listingSchema.validate(req.body);
if (error) {
  let errMsg = error.details.map((el) => el.message).join(", ");
    throw new ExpressError(400, errMsg);
  }else { 
next();
} 
};

module.exports.validateReview = async (req, res, next) => {
  let {error} = reviewSchema.validateAsync(req.body);
  if (error) {
    let errMsg = error.details.map((el) => el.message).join(", ");
    throw new ExpressError(400, errMsg);
  } else {
    next();
  }
};

module.exports.isVendor = (req, res, next) => {
  if (!req.isAuthenticated() || !req.user.role.includes('vendor')) {
    req.flash('error', 'You must be logged in as Vendor');
    return res.redirect('/vendor/login');
  }
  next();
};
