// backend/routes/auth.routes.js
import express from "express";
import admin from "firebase-admin";
import User from "../models/User.js";

const router = express.Router();

// Sync Firebase user → MongoDB
router.post("/sync-user", async (req, res) => {
  try {
    const { idToken } = req.body;
    if (!idToken) return res.status(400).json({ error: "No idToken provided" });

    // 1. Verify Firebase token
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const { uid, email, name } = decodedToken;

    // 2. Create/update in MongoDB
    const user = await User.findOneAndUpdate(
      { firebaseUID: uid },
      {
        username: name || email, // fallback if name is missing
        firebaseUID: uid,
        email: email,
      },
      { upsert: true, new: true }
    );

    res.json(user);
  } catch (error) {
    console.error("Sync error:", error);
    res.status(401).json({ error: "Authentication failed" });
  }
});

// Get user profile
router.get("/me", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const idToken = authHeader?.startsWith("Bearer ")
      ? authHeader.split("Bearer ")[1]
      : null;
    if (!idToken) return res.status(401).json({ error: "No token provided" });

    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const user = await User.findOne({ firebaseUID: decodedToken.uid });
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (error) {
    console.error("Profile error:", error);
    res.status(401).json({ error: "Authentication failed" });
  }
});

export default router;
