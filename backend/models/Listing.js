const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ListingSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  owner: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  negotiable: {
    type: Boolean,
    default: true,
  },
  trading: {
    type: Boolean,
    default: false,
  },
  condition: {
    type: String,
    enum: ["new", "used", "refurbished"],
    required: true,
  },
  images: [
    {
      type: String, // URL or path to the image
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  category: {
    type: String,
    enum: ["electronics", "furniture", "clothing", "books", "other"],
    required: true,
  },
  claims: [
    {
      type: Schema.Types.ObjectId,
      ref: "Claim",
    },
  ],
});

module.exports = mongoose.model("Listing", ListingSchema);
