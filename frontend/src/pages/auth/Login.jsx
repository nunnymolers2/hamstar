import { signInWithPopup, signOut } from "firebase/auth";
import { auth, googleProvider } from "../../services/firebase";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

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
        // Delete the user immediately instead of just signing out
        await deleteUser(user);
        throw new Error("Unauthorized domain");
      }
      

      // Successful login
      navigate("/dashboard");
    } catch (error) {
      console.error("Login error:", error);
      setError(error.message.includes("popup") 
        ? "Popup blocked or closed. Please try again."
        : "Login failed. Please try again.");
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
          {loading ? (
            "Processing..."
          ) : (
            <>
              Sign In with Google
            </>
          )}
        </button>

        <p className="mt-4 text-sm text-gray-500">
          You must use your official @hamilton.edu account
        </p>
      </div>
    </div>
  );
}