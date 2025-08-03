const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const { isLoggedIn, isListingOwner, validateListing,  isVendor } = require("../middleware.js");
const listingController = require("../controllers/listing.js");

const multer = require('multer');
const { storage } = require("../cloudConfig.js");
const upload = multer({ storage });


router.route("/listings")
  .get(wrapAsync(listingController.index))
  .post(
    isLoggedIn,
    isVendor,
    upload.single('listing[image]'),

    // ✅ Debug middleware
    (req, res, next) => {
      console.log("REQ.BODY:", req.body);
      console.log("🟡 Category received from form:", `"${req.body.listing.category}"`);
      // Optional: Clean the value
      req.body.listing.category = req.body.listing.category.trim();
      next();
    },

    validateListing, // schema validation yahan hoti hai
    wrapAsync(listingController.createListing)
  );


// ✅ New Listing Form
router.get("/listings/new", isLoggedIn,isVendor, wrapAsync(listingController.renderNewForm));

// ✅ Show, Update, Delete for individual listings
router.route("/listings/:id")
  .get(wrapAsync(listingController.showListing))
  .put(
    isLoggedIn,
    isListingOwner,
    isVendor,
    upload.single('listing[image]'),
    (req, res, next) => {
    console.log("▶️ Before validateListing — req.body:", req.body);
    next();
  },
    validateListing,
    wrapAsync(listingController.updateListing)
  )
  .delete(isLoggedIn, isListingOwner,isVendor, wrapAsync(listingController.deleteListing));

// ✅ Edit Form
router.get("/listings/:id/edit", isLoggedIn, isListingOwner,isVendor, wrapAsync(listingController.renderEditForm));

// ✅ Explore Route
router.get("/explore", wrapAsync(listingController.explore));


module.exports = router;