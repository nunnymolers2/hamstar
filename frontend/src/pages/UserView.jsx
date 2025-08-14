import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ListingCard from "../components/ListingCard.jsx";
import UserIcon from "../assets/images/user.svg";
import { auth } from "../firebase"; // Import your Firebase auth

export default function UserView() {
  const { id } = useParams(); // id = Firebase UID of the user being viewed
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [messageLoading, setMessageLoading] = useState(false);
  const [messageError, setMessageError] = useState(null);
  const navigate = useNavigate();

  // Function to start a conversation
  const startConversation = async () => {
    try {
      setMessageLoading(true);
      setMessageError(null);

      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error("You need to be logged in to message");
      }

      // Check if trying to message yourself
      if (currentUser.uid === id) {
        throw new Error("You can't message yourself");
      }

      const token = await currentUser.getIdToken();
      const response = await fetch(
        `http://localhost:3001/api/messages/start-conversation`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ otherUserId: id }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to start conversation");
      }

      const data = await response.json();
      navigate(`/messages/${data.conversationId}`);
    } catch (err) {
      setMessageError(err.message);
    } finally {
      setMessageLoading(false);
    }
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch(`http://localhost:3001/api/users/${id}`);
        if (!response.ok) throw new Error("User not found");
        const data = await response.json();
        setUser(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [id]);

  if (loading) return <div className="text-center py-8">Loading...</div>;
  if (error)
    return <div className="text-center py-8 text-red-500">Error: {error}</div>;
  if (!user) return <div className="text-center py-8">User not found</div>;

  return (
    <div className="max-w-4xl mx-auto p-4">
      {/* Profile Header with Message Button */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center">
          <img
            src={user.pfp || UserIcon}
            alt="User profile icon"
            className="w-12 h-12 rounded-full mr-4"
          />
          <h1 className="text-2xl font-bold">
            {user.username || user.name || user.email}
          </h1>
        </div>

        {/* Message Button */}
        <button
          onClick={startConversation}
          disabled={messageLoading}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center"
        >
          {messageLoading ? (
            <>
              <svg
                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Starting...
            </>
          ) : (
            "Message"
          )}
        </button>
      </div>

      {messageError && <div className="text-red-500 mb-4">{messageError}</div>}

      {user.bio && <p className="text-gray-700 mb-6">{user.bio}</p>}

      {/* Listings */}
      <h2 className="text-xl font-semibold mb-4">Listings</h2>
      {user.listings && user.listings.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2">
          {user.listings.map((listing) => (
            <ListingCard
              key={listing._id}
              listing={listing}
              variant="default"
            />
          ))}
        </div>
      ) : (
        <p className="text-gray-500">This user has no listings.</p>
      )}
    </div>
  );
}
