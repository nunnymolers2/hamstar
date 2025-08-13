import express from "express";
import User from "../models/User.js";
import Listing from "../models/Listing.js";

const router = express.Router();

/**
 * GET /api/users/:firebaseUID
 * Public route to fetch a user by Firebase UID
 * Returns user info + listings
 */
router.get("/:firebaseUID", async (req, res) => {
  try {
    const { firebaseUID } = req.params;

    // Find user document in MongoDB
    const user = await User.findOne({ firebaseUID }).lean();
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Fetch all listings owned by this user
    const listings = await Listing.find({ owner: user._id }).lean();

    // Attach listings to user object
    user.listings = listings;

    // Return JSON
    res.json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
