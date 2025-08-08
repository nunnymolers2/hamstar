import express from "express";
import admin from "firebase-admin";
import User from "../models/User.js";

const router = express.Router();

// Sync Firebase user → MongoDB
router.post("/sync-user", async (req, res) => {
  try {
    const { idToken } = req.body;

    // 1. Verify Firebase token
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const { uid, email, name, picture } = decodedToken;

    // 2. Create/update in MongoDB
    const user = await User.findOneAndUpdate(
      { firebaseUID: uid },
      {
        username: name,
      },
      { upsert: true, new: true }
    );

    res.json(user);
  } catch (error) {
    console.error("Sync error:", error);
    res.status(401).json({ error: "Authentication failed" });
  }
});

export default router;
