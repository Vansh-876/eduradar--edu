const Listing = require("../models/listing");

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

  const allListings = await Listing.find(filter);
  res.render("listings/index", { allListings, category, search, location, activePage: "listings" });
};


module.exports.renderNewForm = async (req, res) => {
  res.render("listings/new");
};

module.exports.createListing = async (req, res, next) => {
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
  req.flash("success", "New listing created successfully!");
  res.redirect("/listings");
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
