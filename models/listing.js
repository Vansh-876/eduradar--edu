const mongoose = require("mongoose");
const Review = require("./review.js");
const Schema = mongoose.Schema;

const listingSchema = new Schema({
  title: { type: String, required: true },
  name: { type: String, required: true },
  category: { type: String, required: true }, // e.g., institution, coaching, library
  subcategory: {
    type: String,
    enum: ["school", "college", "university"],
    required: function () {
      return this.category === "institution";
    },
  },
  description: { type: String, required: true },
  location: { type: String, required: true },
  contact: { type: String, required: true },
  openHours: { type: String },
  whatsappNumber: { type: String, default: "" },
  email: { type: String, required: true },
  website: String,
  googleMapLink: String,
  facebookPage: String,
  instagramPage: String,
  tags: [String],

  // Media
  image: {
    url: String,
    filename: String,
  },

  // Ownership
  owner: {
    type: Schema.Types.ObjectId,
  },

  // Subcategory Specific Fields
  board: { type: String },
  classes_from: { type: String },
  classes_to: { type: String },
  affiliation: { type: String },
  courses_offered: [{ type: String }],


  // Reviews
  reviews: [{ type: Schema.Types.ObjectId, ref: "Review" }],
});

// Cascade delete reviews
listingSchema.post("findOneAndDelete", async (listing) => {
  if (listing) {
    await Review.deleteMany({ _id: { $in: listing.reviews } });
  }
});

const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;
