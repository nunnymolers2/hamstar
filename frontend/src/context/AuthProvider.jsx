import { createContext, useEffect, useState } from "react";
import { auth } from "../firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
// import api from '../services/api'; // Uncomment if you have an api instance

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user && user.email.endsWith("@hamilton.edu")) {
        setUser(user);
        // Optional: Sync with backend
        // const token = await user.getIdToken();
        // await api.post('/auth/sync-user', { idToken: token });
      } else {
        if (user) await signOut(auth); // Auto-logout if wrong domain
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

