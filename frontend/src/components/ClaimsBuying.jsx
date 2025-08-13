import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthProvider";
import ListingCard from "../components/ListingCard";

export default function Buying() {
  const { currentUser } = useContext(AuthContext);
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchClaims = async () => {
      if (!currentUser) return;

      try {
        const token = await currentUser.getIdToken();
        const response = await fetch("http://localhost:3001/api/claims/user", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch claims");
        }

        const data = await response.json();
        // Get only claims where status is "accepted" or "pending"
        const activeClaims = data.filter(
          (claim) => claim.status === "accepted" || claim.status === "pending"
        );
        setClaims(activeClaims.slice(0, 5)); // Limit to 5 claims
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchClaims();
  }, [currentUser]);

  if (loading) return <div className="text-center py-8">Loading...</div>;
  if (error)
    return <div className="text-center py-8 text-red-500">Error: {error}</div>;
  if (!currentUser)
    return (
      <div className="text-center py-8">Please login to view your claims</div>
    );

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Your Claimed Purchases</h1>
      {claims.length === 0 ? (
        <p className="text-gray-500">You have no active claims.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {claims.map((claim) => (
            <ListingCard
              key={claim._id}
              listing={claim.listing}
              claimStatus={claim.status}
            />
          ))}
        </div>
      )}
    </div>
  );
}
