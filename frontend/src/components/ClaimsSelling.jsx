import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthProvider";
import ListingCard from "../components/ListingCard";

export default function Selling() {
  const { user: currentUser } = useContext(AuthContext);
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSellingClaims = async () => {
    if (!currentUser) return;

    try {
      const token = await currentUser.getIdToken();
      const response = await fetch("http://localhost:3001/api/claims/selling", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch selling claims");
      }

      const data = await response.json();
      setClaims(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (claimId) => {
  try {
    const token = await currentUser.getIdToken();
    const res = await fetch(`http://localhost:3001/api/claims/${claimId}/accept`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Failed to accept claim");
    fetchSellingClaims(); // refresh claims
  } catch (err) {
    console.error(err);
    alert(err.message);
  }
};

const handleReject = async (claimId) => {
  try {
    const token = await currentUser.getIdToken();
    const res = await fetch(`http://localhost:3001/api/claims/${claimId}/reject`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Failed to reject claim");
    fetchSellingClaims(); // refresh claims
  } catch (err) {
    console.error(err);
    alert(err.message);
  }
};

  useEffect(() => {
    fetchSellingClaims();
  }, [currentUser]);

  if (loading) return <div className="text-center py-8">Loading...</div>;
  if (error) return <div className="text-center py-8 text-red-500">Error: {error}</div>;
  if (!currentUser) return <div className="text-center py-8">Please login to view your claims</div>;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Claims on Your Listings</h1>
      {claims.length === 0 ? (
        <p className="text-gray-500">No one has claimed your listings yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {claims.map((claim) => (
            <ListingCard
              key={claim._id}
              listing={claim.listing}
              claimStatus={claim.status}
              claimerName={claim.claimer?.username || claim.claimer?.email}
              variant="self"
              onClaimAccept={() => handleAccept(claim._id)}
              onClaimReject={() => handleReject(claim._id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
