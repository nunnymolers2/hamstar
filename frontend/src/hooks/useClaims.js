// src/hooks/useClaims.js
import { useState } from "react";
import claimService from "../services/claimService";
import { useAuth } from "../contexts/AuthContext"; // Assuming you have an auth context

export const useClaims = () => {
  const { currentUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const createClaim = async (listingId) => {
    if (!currentUser) {
      setError("You must be logged in to claim an item");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const token = await currentUser.getIdToken();
      const claim = await claimService.createClaim(listingId, token);
      setIsLoading(false);
      return claim;
    } catch (err) {
      setError(err.response?.data?.error || "Failed to create claim");
      setIsLoading(false);
      throw err;
    }
  };

  const fetchUserClaims = async () => {
    if (!currentUser) return [];

    setIsLoading(true);
    setError(null);

    try {
      const token = await currentUser.getIdToken();
      const claims = await claimService.getUserClaims(token);
      setIsLoading(false);
      return claims;
    } catch (err) {
      setError(err.response?.data?.error || "Failed to fetch claims");
      setIsLoading(false);
      throw err;
    }
  };

  return {
    createClaim,
    fetchUserClaims,
    isLoading,
    error,
  };
};
