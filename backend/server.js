import dotenv from "dotenv";
dotenv.config();

// Verify environment variables immediately
console.log("Env Verification:", {
  CLOUDINARY: !!process.env.CLOUDINARY_CLOUD_NAME,
  MONGO: !!process.env.MONGODB_URI,
});

import express from "express";
import cors from "cors";
import connectDB from "./config/db.js";
import { initCloudinary } from "./config/cloudinary.js"; // Import initialization function
import authRoutes from "./routes/auth.routes.js";
import listingRoutes from "./routes/listing.routes.js"; // New import
import claimRoutes from "./routes/claim.routes.js";
import admin from "./config/firebase.js";

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: "10mb" })); // Increase payload limit for image uploads
app.use(express.urlencoded({ extended: true }));

// Database connection
connectDB();
const cloudinary = initCloudinary(); // Explicit initialization

app.use((req, res, next) => {
  console.log(`Incoming ${req.method} ${req.url}`);
  next();
});

// Routes
app.use("/auth/", authRoutes);
app.use("/api/listings", listingRoutes); // New route for listings
app.use("/api/claims", claimRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
