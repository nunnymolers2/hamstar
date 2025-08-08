import { signInWithPopup, signOut } from "firebase/auth";
import { api } from '../../services/api'; 
import { auth, googleProvider } from "../../firebase";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from "axios";

async function deleteUser(user) {
  try {
    await user.delete();
    console.log("Unauthorized user deleted");
  } catch (error) {
    console.error("Failed to delete user:", error);
    // Fallback to sign out if delete fails
    await signOut(auth);
  }
}

async function syncUser(user) {
  const idToken = await user.getIdToken();
  await axios.post("/api/auth/sync-user", { idToken });
}

export default function Login() {
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      // Strict domain check
      if (!user.email.endsWith("@hamilton.edu")) {
        await deleteUser(user);
        throw new Error("Only @hamilton.edu emails allowed");
      }

      // Sync with backend - updated endpoint
      const token = await result.user.getIdToken();
      await api.post('/auth/sync-user', { idToken: token });
      
      // Successful login
      navigate("/dashboard");
    } catch (error) {
      console.error("Login error:", error);
      setError(
        error.message.includes("popup")
          ? "Popup blocked or closed. Please try again."
          : error.message || "Login failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-80 text-center">
        <h1 className="text-2xl font-bold mb-4">Hamilton Login</h1>

        {error && (
          <div className="mb-4 p-2 bg-red-100 text-red-700 rounded text-sm">
            {error}
          </div>
        )}

        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className={`bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg flex items-center justify-center gap-2 w-full ${
            loading ? "opacity-70 cursor-not-allowed" : ""
          }`}
        >
          {loading ? "Processing..." : <>Sign In with Google</>}
        </button>

        <p className="mt-4 text-sm text-gray-500">
          You must use your official @hamilton.edu account
        </p>
      </div>
    </div>
  );
}