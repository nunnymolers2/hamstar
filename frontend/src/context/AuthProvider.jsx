import { createContext, useEffect, useState } from "react";
import { auth } from "../firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
// import api from '../services/api'; // Uncomment if you have an api instance

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const [claimedIds, setClaimedIds] = useState([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user && user.email.endsWith("@hamilton.edu")) {
        setUser(user);

        // NEW: fetch claims from backend when user logs in
        try {
          const token = await user.getIdToken();
          const res = await fetch("http://localhost:3001/api/claims/user", {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (res.ok) {
            const data = await res.json();
            setClaimedIds(data.map((c) => c.listing._id));
          }
        } catch (err) {
          console.error("Failed to fetch user claims:", err);
        }
      } else {
        if (user) await signOut(auth); // Auto-logout if wrong domain
        setUser(null);
        setClaimedIds([]); // reset claims if user logs out
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, claimedIds, setClaimedIds }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

