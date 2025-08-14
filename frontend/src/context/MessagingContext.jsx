// src/context/MessagingContext.js
import { createContext, useContext, useState, useEffect } from "react";
import { auth } from "../firebase";
import axios from "axios";

const MessagingContext = createContext();

export function MessagingProvider({ children }) {
  const [conversations, setConversations] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchUsers = async () => {
    try {
      const token = await auth.currentUser?.getIdToken();
      const response = await axios.get("/api/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(Array.isArray(response?.data) ? response.data : []);
    } catch (error) {
      console.error("Failed to fetch users:", error);
      setUsers([]);
    }
  };

  const fetchConversations = async () => {
    try {
      const token = await auth.currentUser?.getIdToken();
      const response = await axios.get("/api/messages/conversations", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setConversations(Array.isArray(response?.data) ? response.data : []);
    } catch (error) {
      console.error("Failed to fetch conversations:", error);
      setError("Failed to load conversations");
    }
  };

  const startNewConversation = async (otherUserId) => {
    try {
      const token = await auth.currentUser?.getIdToken();
      const response = await axios.post(
        "/api/messages/start-conversation",
        { otherUserId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        const newConversation = {
          ...response.data,
          participants: [auth.currentUser.uid, otherUserId],
        };
        setConversations((prev) => [...prev, newConversation]);
        return newConversation;
      }
    } catch (error) {
      console.error("Error starting conversation:", error);
      throw error;
    }
  };

  // Initial data fetch
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        await Promise.all([fetchUsers(), fetchConversations()]);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (auth.currentUser) {
      fetchData();
    }
  }, []);
  return (
    <MessagingContext.Provider
      value={{
        conversations,
        users,
        loading,
        error,
        startNewConversation,
        refreshConversations: fetchConversations,
      }}
    >
      {children}
    </MessagingContext.Provider>
  );
}

// Make sure this is exported correctly
export const useMessaging = () => {
  const context = useContext(MessagingContext);
  if (context === undefined) {
    throw new Error("useMessaging must be used within a MessagingProvider");
  }
  return context;
};
