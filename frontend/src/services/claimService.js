// src/services/claimService.js
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const claimService = {
  // Create a new claim
  createClaim: async (listingId, token) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/claims`,
        { listingId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error creating claim:", error);
      throw error;
    }
  },

  // Get user's claims
  getUserClaims: async (token) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/claims/user`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching user claims:", error);
      throw error;
    }
  },
};

export default claimService;
