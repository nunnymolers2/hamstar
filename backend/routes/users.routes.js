// routes/users.routes.js
import express from "express";
import User from "../models/User.js";
import Listing from "../models/Listing.js";
import { authenticate } from "../middlewares/auth.js";

const router = express.Router();

// Existing route
router.get("/:firebaseUID", async (req, res) => {
  try {
    const { firebaseUID } = req.params;
    const user = await User.findOne({ firebaseUID }).lean();
    if (!user) return res.status(404).json({ message: "User not found" });

    const listings = await Listing.find({ owner: user._id }).lean();
    user.listings = listings;
    res.json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// New route for messaging - get all users except current user
router.get("/", authenticate, async (req, res) => {
  try {
    const currentUserId = req.user.uid; // From Firebase auth

    const users = await User.find({
      firebaseUID: { $ne: currentUserId },
    })
      .select("-__v -createdAt -updatedAt")
      .lean();

    res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
