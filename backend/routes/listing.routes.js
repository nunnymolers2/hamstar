import express from "express";
import firebaseAdmin from "firebase-admin";
const { auth } = firebaseAdmin;
import mongoose from "mongoose";
import Listing from "../models/Listing.js";
import User from "../models/User.js";
import { storage } from "../config/cloudinary.js"; // Import storage instead of cloudinary
import multer from "multer";

// Initialize multer with Cloudinary storage
const upload = multer({ storage });

const router = express.Router();

// Middleware to verify Firebase token and get MongoDB user
const verifyTokenAndUser = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const token = authHeader.split(" ")[1];
    const decodedToken = await auth().verifyIdToken(token);

    // Find the corresponding MongoDB user
    const user = await User.findOne({ firebaseUID: decodedToken.uid });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    req.user = user; // Now we have the MongoDB user object
    next();
  } catch (error) {
    console.error("Error verifying token:", error);
    res.status(401).json({ error: "Unauthorized" });
  }
};
// Modify your route to properly handle multipart form data
router.post(
  "/",
  verifyTokenAndUser,
  upload.array("images"),
  async (req, res) => {
    console.log("Received files:", req.files);
    try {
      // Access text fields from req.body (multer puts them there)
      const {
        title,
        description,
        price,
        condition,
        category,
        negotiable,
        trading,
      } = req.body;

      // Validation
      if (!title || !description || !price || !condition || !category) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      // Get image URLs from Cloudinary upload
      const images =
        req.files?.map((file) => ({
          url: file.path,
          publicId: file.filename,
        })) || [];

      // Create new listing
      const newListing = new Listing({
        title,
        description,
        price: parseFloat(price),
        owner: req.user._id,
        negotiable: negotiable === "true" || negotiable === true,
        trading: trading === "true" || trading === true,
        condition,
        images,
        category,
        claims: [],
      });

      const savedListing = await newListing.save();

      res.status(201).json({
        message: "Listing created successfully",
        listing: savedListing,
      });
    } catch (error) {
      console.error("Error creating listing:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// Get all listings
router.get("/", async (req, res) => {
  try {
    const listings = await Listing.find()
      .populate("owner", "-password") // Exclude password if your User model has one
      .populate("claims");

    res.json(listings);
  } catch (error) {
    console.error("Error fetching listings:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get single listing
router.get("/:id", async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id)
      .populate("owner", "-password")
      .populate("claims");

    if (!listing) {
      return res.status(404).json({ error: "Listing not found" });
    }

    res.json(listing);
  } catch (error) {
    console.error("Error fetching listing:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Update listing (only by owner)
router.put("/:id", verifyTokenAndUser, async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);

    if (!listing) {
      return res.status(404).json({ error: "Listing not found" });
    }

    // Check if the current user is the owner
    if (listing.owner.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ error: "Unauthorized to update this listing" });
    }

    const {
      title,
      description,
      price,
      condition,
      category,
      negotiable,
      trading,
      images,
    } = req.body;

    // Update fields
    if (title) listing.title = title;
    if (description) listing.description = description;
    if (price) listing.price = parseFloat(price);
    if (condition) listing.condition = condition;
    if (category) listing.category = category;
    if (negotiable !== undefined) listing.negotiable = Boolean(negotiable);
    if (trading !== undefined) listing.trading = Boolean(trading);
    if (images) listing.images = images;

    const updatedListing = await listing.save();

    res.json({
      message: "Listing updated successfully",
      listing: updatedListing,
    });
  } catch (error) {
    console.error("Error updating listing:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Delete listing (only by owner)
router.delete("/:id", verifyTokenAndUser, async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);

    if (!listing) {
      return res.status(404).json({ error: "Listing not found" });
    }

    // Check if the current user is the owner
    if (listing.owner.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ error: "Unauthorized to delete this listing" });
    }

    // Delete images from Cloudinary
    await Promise.all(
      listing.images.map((imageUrl) => {
        const publicId = imageUrl.split("/").pop().split(".")[0];
        return cloudinary.uploader.destroy(`marketplace/${publicId}`);
      })
    );

    await listing.remove();

    res.json({ message: "Listing deleted successfully" });
  } catch (error) {
    console.error("Error deleting listing:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
