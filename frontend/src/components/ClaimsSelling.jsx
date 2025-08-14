import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthProvider";
import ListingCard from "../components/ListingCard";
import { useNavigate } from "react-router-dom";

export default function Selling() {
  const { user: currentUser } = useContext(AuthContext);
  const [myListings, setMyListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchMyListings = async () => {
    if (!currentUser) return;

    try {
      const token = await currentUser.getIdToken();
      const res = await fetch("http://localhost:3001/api/listings/user", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Failed to fetch your listings");

      const data = await res.json();
      setMyListings(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyListings();
  }, [currentUser]);

  if (loading) return <div className="text-center py-8">Loading your listings...</div>;
  if (error) return <div className="text-center py-8 text-red-500">Error: {error}</div>;
  if (!currentUser) return <div className="text-center py-8">Please login to view your listings</div>;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Your Listings</h1>
      {myListings.length === 0 ? (
        <p className="text-gray-500">You haven’t uploaded any listings yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {myListings.map((listing) => (
            <ListingCard
              key={listing._id}
              listing={listing}
              variant="self"
              onClaim={() => navigate(`/manage-claims/${listing._id}`)} // placeholder page
            />
          ))}
        </div>
      )}
    </div>
  );
}

