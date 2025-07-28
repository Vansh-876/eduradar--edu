const mongoose = require("mongoose");
const Review = require("./review.js");
const { required } = require("joi");
const Schema = mongoose.Schema;

const listingSchema = new Schema({
  title: { type: String, required: true },
  name: { type: String, required: true },
  category: { type: String, required: true },
  description: { type: String, required: true },
  location: { type: String, required: true },
  contact: { type: String, required: true },
  openHours: {type: String,  required: false }, 
  whatsappNumber: { type: String, required: false, default: "" },
  email: { type: String, required: true },
  website: String,
  googleMapLink: String,
  facebookPage: String,
  instagramPage: String,
  tags: [String],
  image: {
    url: String,
    filename: String,
  },
  owner: {
    type: Schema.Types.ObjectId,
  },

  reviews: [
    {
      type: Schema.Types.ObjectId,
      ref: "Review",
    }
  ]
});

listingSchema.post("findOneAndDelete", async (listing) => {
  if (listing) {
    await Review.deleteMany({ _id: { $in: listing.reviews } });
  }
});

const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;
