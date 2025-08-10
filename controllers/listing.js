const Listing = require("../models/listing");
const notificationService = require('../services/notificationService');
const User = require('../models/user');
const Notification = require('../models/Notification'); // if you have this model

module.exports.index = async (req, res, next) => {
  const { category, search, location } = req.query;
  let filter = {};

  if (category) {
    filter.category = { $regex: new RegExp(category, 'i') };
  }

  if (location) {
    filter.location = { $regex: new RegExp(location, 'i') };
  }

  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { location: { $regex: search, $options: 'i' } },
      { category: { $regex: search, $options: 'i' } },
      { tags: { $in: [new RegExp(search, 'i')] } }
    ];
  }

  try {
    const allListings = await Listing.find(filter).populate('reviews');

    // Calculate average rating for each listing
    allListings.forEach(listing => {
      if (listing.reviews && listing.reviews.length > 0) {
        const total = listing.reviews.reduce((acc, review) => acc + review.rating, 0);
        listing.avgRating = (total / listing.reviews.length).toFixed(1);
      } else {
        listing.avgRating = 0;
      }
    });

    // Fetch notification count and recent notifications if user is logged in
    let notificationCount = 0;
    let recentNotifications = [];

    if (req.user) {
      notificationCount = await Notification.countDocuments({ recipientId: req.user._id, read: false });
      recentNotifications = await Notification.find({ recipientId: req.user._id }).sort({ createdAt: -1 }).limit(5);
    }

    res.render("listings/index", {
      allListings,
      category,
      search,
      location,
      activePage: "listings",
      currentUser: req.user,
      notificationCount,
      recentNotifications
    });
  } catch (err) {
    next(err);
  }
};


module.exports.renderNewForm = async (req, res) => {
  res.render("listings/new");
};

module.exports.createListing = async (req, res, next) => {
  try {
    if (req.body.listing.tags) {
      if (typeof req.body.listing.tags === "string") {
        req.body.listing.tags = req.body.listing.tags.split(',').map(tag => tag.trim());
      }
    }

    const url = req.file.path;
    const filename = req.file.filename;
    const newListing = new Listing(req.body.listing);
    newListing.image = { url, filename };
    newListing.owner = req.user._id;
    await newListing.save();

    // Send notification to all admins
    const admins = await User.find({ role: 'admin' }); // Change this filter as needed
    for (let admin of admins) {
      await notificationService.createNotification({
        userId: admin._id,              // recipient
        actorId: req.user._id,          // who created the listing
        type: 'listing_created',
        message: `${req.user.username} created a new listing "${newListing.name}"`,
        link: `/listings/${newListing._id}`
      });
    }

    req.flash("success", "New listing created successfully!");
    res.redirect("/listings");
  } catch (err) {
    console.error(err);
    req.flash("error", "Something went wrong while creating the listing.");
    res.redirect("/listings");
  }
};

 module.exports.showListing = async (req, res) => {
  const listing = await Listing.findById(req.params.id)
    .populate("owner")
    .populate({
      path: "reviews",
      populate: {
        path: "author",
      },
    });

  if (!listing) {
    req.flash("error", "Listing not found");
    return res.redirect("/listings");
  }

  res.render("listings/show", { listing });
};

module.exports.renderEditForm=async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);
  if (!listing) {
    req.flash("error", "Listing not found");
    return res.redirect("/listings");
  }
  let originalImageUrl=listing.image.url;
   originalImageUrl= originalImageUrl.replace("/upload", "/upload/w_250");
  res.render("listings/edit", { listing, originalImageUrl });
};

module.exports.updateListing= async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findByIdAndUpdate(id, req.body.listing);
 if (req.body.listing.tags) {
  if (typeof req.body.listing.tags === "string") {
    req.body.listing.tags = req.body.listing.tags.split(',').map(tag => tag.trim());
  }
}
  if(typeof req.file !== "undefined") {
  const url= req.file.path;
  const filename=req.file.filename;
  listing.image = {url, filename};
  await listing.save();
  }
  req.flash("success", "Listing updated successfully!");
  res.redirect(`/listings/${id}`);
};

module.exports.deleteListing=async (req, res) => {
  const { id } = req.params;
  await Listing.findByIdAndDelete(id);
  req.flash("success", "Listing deleted successfully!");
  res.redirect("/listings");
};