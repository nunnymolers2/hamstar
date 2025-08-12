import { useState, useEffect } from "react";
import ListingCard from "../components/ListingCard";

export default function Buying() {
  const [buyingListings, setBuyingListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBuyingListings = async () => {
      try {
        // Replace with "listings by user"
        const response = await fetch("http://localhost:3001/api/listings");
        if (!response.ok) {
          throw new Error("Failed to fetch buying listings");
        }
        const data = await response.json();

      setBuyingListings(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBuyingListings();
  }, []);

  if (loading) return <div className="text-center py-8">Loading...</div>;
  if (error) return <div className="text-center py-8 text-red-500">Error: {error}</div>;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Your Listings</h1>
      {buyingListings.length === 0 ? (
        <p className="text-gray-500">You have not yet posted any listings.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {buyingListings.map((listing) => (
            <ListingCard key={listing._id} listing={listing} variant="self"/>
          ))}
        </div>
      )}
    </div>
  );
}
