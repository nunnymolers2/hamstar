import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import ListingCard from "../components/ListingCard.jsx";
import UserIcon from "../assets/images/user.svg";

export default function UserView() {
  const { id } = useParams(); // id = Firebase UID of the user
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  if (loading)
    return <div className="text-center py-8">Loading...</div>;
  if (error)
    return <div className="text-center py-8 text-red-500">Error: {error}</div>;
  if (!user)
    return <div className="text-center py-8">User not found</div>;

  return (
    <div className="max-w-4xl mx-auto p-4">
      {/* Profile Icon and User Info */}
      <div className="flex items-center mb-4">
        <img
          src={user.pfp || UserIcon}
          alt="User profile icon"
          className="w-12 h-12 rounded-full mr-4"
        />
        <h1 className="text-2xl font-bold">
          {user.username || user.name || user.email}
        </h1>
      </div>

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
