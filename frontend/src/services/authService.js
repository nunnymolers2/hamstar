// src/services/authService.js
import { api } from "./api"; // Your axios instance
import { auth } from "../firebase"; // Your Firebase config

export const syncUser = async () => {
  try {
    // 1. Get Firebase token
    const token = await auth.currentUser?.getIdToken();
    if (!token) throw new Error("No user logged in");

    // 2. Send to backend
    const response = await api.post("/api/auth/sync-user", null, {
      headers: { Authorization: `Bearer ${token}` },
    });

    return response.data; // Returns MongoDB user document
  } catch (error) {
    console.error("Sync failed:", error);
    throw error; // Re-throw for component handling
  }
};
