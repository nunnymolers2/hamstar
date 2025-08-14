import express from "express";
import Listing from "../models/Listing.js";
import Claim from "../models/Claim.js";
import User from "../models/User.js";
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

// ✅ Create new claim with limit check
router.post("/", verifyUser, async (req, res) => {
  try {
    const { listingId } = req.body;
    const user = await User.findOne({ firebaseUID: req.user.uid });
    if (!user) return res.status(404).json({ error: "User not found" });

    const existingClaim = await Claim.findOne({ listing: listingId, claimer: user._id });
    if (existingClaim) {
      return res.status(400).json({ error: "Already claimed", status: "claimed" });
    }

    const activeClaimsCount = await Claim.countDocuments({
      claimer: user._id,
      status: { $in: ["pending", "accepted"] }, // keep consistent with frontend
    });
    if (activeClaimsCount >= 5) {
      return res.status(400).json({ error: "Claim limit reached", limit: 5 });
    }

    const newClaim = new Claim({ listing: listingId, claimer: user._id, status: "pending" });
    const savedClaim = await newClaim.save();

    await Listing.findByIdAndUpdate(listingId, { $push: { claims: savedClaim._id } });
    await User.findByIdAndUpdate(user._id, { $push: { claims: savedClaim._id } });

    res.status(201).json({ success: true, claim: savedClaim, status: savedClaim.status });
  } catch (error) {
    console.error("Claim error:", error);
    res.status(500).json({ error: "Failed to create claim" });
  }
});

// ✅ Claims where user is buyer
router.get("/user", verifyUser, async (req, res) => {
  try {
    const user = await User.findOne({ firebaseUID: req.user.uid });
    if (!user) return res.status(404).json({ error: "User not found" });

    const claims = await Claim.find({ claimer: user._id })
    .populate("listing", "title price images")
    .populate("claimer", "_id firebaseUID username email"); // include _id & firebaseUID

    res.json(claims);
  } catch (error) {
    console.error("Get claims error:", error);
    res.status(500).json({ error: "Failed to get claims" });
  }
});

// ✅ Claims where user is seller
router.get("/selling", verifyUser, async (req, res) => {
  try {
    const user = await User.findOne({ firebaseUID: req.user.uid });
    if (!user) return res.status(404).json({ error: "User not found" });

    // Find listings by current user
    const listings = await Listing.find({ seller: user._id }).select("_id");
    const listingIds = listings.map(l => l._id);

    // Find claims on those listings
    const claims = await Claim.find({ listing: { $in: listingIds } })
      .populate("listing", "title price images")
      .populate("claimer", "username email");

    res.json(claims);
  } catch (error) {
    console.error("Get selling claims error:", error);
    res.status(500).json({ error: "Failed to get selling claims" });
  }
});

// Accept a claim
router.post("/:claimId/accept", verifyUser, async (req, res) => {
  try {
    const { claimId } = req.params;

    const claim = await Claim.findById(claimId).populate("listing");
    if (!claim) return res.status(404).json({ error: "Claim not found" });

    // Check if current user is the seller of this listing
    const seller = await User.findOne({ firebaseUID: req.user.uid });
    if (!seller || claim.listing.seller.toString() !== seller._id.toString()) {
      return res.status(403).json({ error: "Not authorized" });
    }

    claim.status = "accepted";
    await claim.save();

    res.json({ success: true, claim });
  } catch (err) {
    console.error("Accept claim error:", err);
    res.status(500).json({ error: "Failed to accept claim" });
  }
});

// Reject a claim
router.post("/:claimId/reject", verifyUser, async (req, res) => {
  try {
    const { claimId } = req.params;

    const claim = await Claim.findById(claimId).populate("listing");
    if (!claim) return res.status(404).json({ error: "Claim not found" });

    const seller = await User.findOne({ firebaseUID: req.user.uid });
    if (!seller || claim.listing.seller.toString() !== seller._id.toString()) {
      return res.status(403).json({ error: "Not authorized" });
    }

    claim.status = "rejected";
    await claim.save();

    res.json({ success: true, claim });
  } catch (err) {
    console.error("Reject claim error:", err);
    res.status(500).json({ error: "Failed to reject claim" });
  }
});


export default router;
