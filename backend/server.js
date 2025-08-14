import dotenv from "dotenv";
dotenv.config();

// Verify environment variables immediately
console.log("Env Verification:", {
  CLOUDINARY: !!process.env.CLOUDINARY_CLOUD_NAME,
  MONGO: !!process.env.MONGODB_URI,
});

import express from "express";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";
import connectDB from "./config/db.js";
import { initCloudinary } from "./config/cloudinary.js";
import authRoutes from "./routes/auth.routes.js";
import listingRoutes from "./routes/listing.routes.js";
import claimRoutes from "./routes/claim.routes.js";
import admin from "./config/firebase.js";
import messageRoutes from "./routes/messages.js";
import userRoutes from "./routes/users.routes.js";
import Message from "./models/Message.js";
import Conversation from "./models/Conversation.js";

const app = express();

// Configure allowed origins
const allowedOrigins = [
  process.env.CLIENT_URL || "http://localhost:3000",
  "http://localhost:5173", // Vite dev server
  "https://your-production-domain.com", // Add your production URL
];

// Create HTTP server
const httpServer = createServer(app);

// Configure CORS for Express
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

// Configure Socket.io
const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
    transports: ["websocket", "polling"],
  },
  allowEIO3: true, // For older Socket.io clients
  pingTimeout: 60000, // 60 seconds
  pingInterval: 25000, // 25 seconds
});

// Handle connection errors
io.engine.on("connection_error", (err) => {
  console.log(err.req); // The request object
  console.log(err.code); // The error code, for example 1
  console.log(err.message); // The error message
  console.log(err.context); // Some additional error context
});

// Middleware
app.use(express.json({ limit: "10mb" })); // Increased payload limit for image uploads
app.use(express.urlencoded({ extended: true }));

// Database connection
connectDB();
const cloudinary = initCloudinary();

// Request logging middleware
app.use((req, res, next) => {
  console.log(`Incoming ${req.method} ${req.url}`);
  next();
});

// Routes
app.use("/auth/", authRoutes);
app.use("/api/listings", listingRoutes);
app.use("/api/claims", claimRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/users", userRoutes); // Added user routes

// Socket.io connection handler
io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Join conversation room
  socket.on("joinConversation", async (conversationId) => {
    socket.join(conversationId);
    console.log(`User joined conversation: ${conversationId}`);
  });

  // Handle sending messages
  socket.on("sendMessage", async (messageData) => {
    try {
      const { conversationId, senderId, receiverId, text } = messageData;

      // Verify the sender is authenticated
      const token = socket.handshake.auth.token;
      if (!token) {
        throw new Error("Authentication required");
      }

      const decodedToken = await admin.auth().verifyIdToken(token);
      if (decodedToken.uid !== senderId) {
        throw new Error("Unauthorized sender");
      }

      // Create new message in database
      const message = new Message({
        conversationId,
        senderId,
        receiverId,
        text,
      });

      await message.save();

      // Update conversation's last message
      await Conversation.findByIdAndUpdate(conversationId, {
        lastMessage: message._id,
      });

      // Emit to all in the conversation room except sender
      socket.to(conversationId).emit("newMessage", message);

      // Also emit to sender for confirmation
      socket.emit("messageDelivered", message);

      console.log(`Message sent in conversation: ${conversationId}`);
    } catch (error) {
      console.error("Error handling message:", error);
      socket.emit("messageError", {
        error: error.message,
        originalMessage: messageData,
      });
    }
  });

  // Handle disconnection
  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
  });

  // Error handling
  socket.on("error", (error) => {
    console.error("Socket error:", error);
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

// Start server
const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Socket.io listening on port ${PORT}`);
});
