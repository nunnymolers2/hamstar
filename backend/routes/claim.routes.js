import express from "express";
import Listing from "../models/Listing.js";
import Claim from "../models/Claim.js";
import firebaseAdmin from "firebase-admin";
const { auth } = firebaseAdmin;

const router = express.Router();

// Middleware to verify user
const verifyUser = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const token = authHeader.split(" ")[1];
    const decodedToken = await auth().verifyIdToken(token);
    req.user = { uid: decodedToken.uid };
    next();
  } catch (error) {
    console.error("Auth error:", error);
    res.status(401).json({ error: "Invalid token" });
  }
};

// Create a new claim
router.post("/", verifyUser, async (req, res) => {
  try {
    const { listingId } = req.body;

    // Create new claim
    const newClaim = new Claim({
      listing: listingId,
      claimer: req.user.uid,
      status: "pending",
    });

    const savedClaim = await newClaim.save();

    // Add claim to listing
    await Listing.findByIdAndUpdate(
      listingId,
      { $push: { claims: savedClaim._id } },
      { new: true }
    );

    // After saving the claim
    await User.findByIdAndUpdate(
      req.user.uid,
      { $push: { claims: savedClaim._id } },
      { new: true }
    );

    res.status(201).json(savedClaim);
  } catch (error) {
    console.error("Claim error:", error);
    res.status(500).json({ error: "Failed to create claim" });
  }
});

// routes/claim.routes.js
router.get("/user", verifyUser, async (req, res) => {
  try {
    // Find user in MongoDB by Firebase UID
    const user = await User.findOne({ firebaseUid: req.user.uid });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const claims = await Claim.find({ claimer: user._id })
      .populate("listing", "title price images")
      .populate("claimer", "username email");

    res.json(claims);
  } catch (error) {
    console.error("Get claims error:", error);
    res.status(500).json({ error: "Failed to get claims" });
  }
});

export default router;
