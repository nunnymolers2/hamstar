import { useState, useEffect, useContext } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../context/AuthProvider";

import Button from "../components/Button.jsx";
import UserIcon from "../assets/images/user.svg";

export default function Listing() {
  const { id } = useParams();
  const { user: currentUser, claimedIds, setClaimedIds } = useContext(AuthContext);
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentImage, setCurrentImage] = useState(0);
  const [claimStatus, setClaimStatus] = useState(null);
  const navigate = useNavigate();

  // Debug: route id
  useEffect(() => {
    console.log("DEBUG: route id =", id);
  }, [id]);

  // Fetch listing
  useEffect(() => {
    if (!id) return;

    const fetchListing = async () => {
      try {
        const response = await fetch(`http://localhost:3001/api/listings/${id}`);
        if (!response.ok) throw new Error("Listing not found");

        const data = await response.json();
        console.log("DEBUG: listing data from API =", data);

        if (!data.owner) {
          console.warn("DEBUG: listing.owner is missing in API response");
        }

        setListing(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchListing();
  }, [id]);

  // Log currentUser
  useEffect(() => {
    console.log("DEBUG: currentUser =", currentUser);
  }, [currentUser]);

  // Log listing updates
  useEffect(() => {
    if (listing) {
      console.log("DEBUG: listing updated =", listing);
      console.log("DEBUG: listing.owner.firebaseUID =", listing.owner?.firebaseUID);
    }
  }, [listing]);

  // Compute ownership safely
  const isOwner =
    !!listing?.owner?.firebaseUID &&
    !!currentUser?.uid &&
    listing.owner.firebaseUID === currentUser.uid;

  console.log("DEBUG: isOwner result =", isOwner);

  const isClaimed = claimedIds.includes(id);

  useEffect(() => {
  if (!listing || !currentUser) return;

  const userClaim = listing.claims?.find((claim) => {
    const claimerId =
      claim.claimer?._id?.toString() || claim.claimer?.firebaseUID || claim.claimer;
    // fallback: if currentUser._id exists, compare that too
    return claimerId === currentUser.uid || claimerId === currentUser._id;
  });

  setClaimStatus(userClaim?.status || "pending"); // default to pending if just claimed
}, [listing, currentUser]);


  // Carousel
  const nextSlide = () => setCurrentImage((prev) => (prev + 1) % listing.images.length);
  const prevSlide = () =>
    setCurrentImage((prev) => (prev - 1 + listing.images.length) % listing.images.length);

  // Claim
  const handleClaim = async () => {
  if (!currentUser) {
    navigate("/login");
    return;
  }

  try {
    const response = await fetch("http://localhost:3001/api/claims", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${await currentUser.getIdToken()}`,
      },
      body: JSON.stringify({ listingId: id }),
    });

    const data = await response.json();

    if (!response.ok) {
      // show backend error message
      alert(data.error || "Failed to claim item");
      return;
    }

    // Success → update local & global state
    setClaimedIds((prev) => [...prev, id]);
    setClaimStatus("pending");
    setListing((prev) => ({
    ...prev,
    claims: [
    ...(prev.claims || []),
    { 
      _id: data.claim._id,            // from backend response
      claimer: { 
        _id: currentUser.uid,         // match backend
        firebaseUID: currentUser.uid,
      },
      status: "pending",
    },
  ],
  }));
  } catch (error) {
    console.error("Claim error:", error);
    alert("Failed to claim item");
  }
};

  // Delete
  const handleDelete = async () => {
    if (!currentUser) return;
    if (!window.confirm("Are you sure you want to delete this listing?")) return;

    try {
      const response = await fetch(`http://localhost:3001/api/listings/${listing._id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${await currentUser.getIdToken()}` },
      });
      if (!response.ok) throw new Error("Failed to delete listing");
      navigate("/");
    } catch (err) {
      console.error(err);
      alert("Delete failed");
    }
  };

  // Loading / error / not found
  if (loading) return <div className="text-center py-8">Loading...</div>;
  if (error) return <div className="text-center py-8 text-red-500">Error: {error}</div>;
  if (!listing) return <div className="text-center py-8">Listing not found</div>;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
      {/* LEFT: Image Carousel */}
      <div className="relative w-full max-w-lg mx-auto">
        {listing.images.length > 0 ? (
          <>
            <img
              src={listing.images[currentImage].url}
              alt={listing.title}
              className="w-full h-full object-cover rounded"
            />
            {listing.images.length > 1 && (
              <>
                <Button
                onClick={prevSlide}
                variant="light"
                className="absolute top-1/2 left-0 -translate-y-1/2 -ml-4 w-10 h-12 flex items-center justify-center text-xl p-0 rounded-full"
                style={{ padding: 0 }} // ensures no extra padding
                >
                ◀
                </Button>

                <Button
                onClick={nextSlide}
                variant="light"
                className="absolute top-1/2 right-0 -translate-y-1/2 -mr-4 w-10 h-12 flex items-center justify-center text-xl p-0 rounded-full"
                style={{ padding: 0 }}
                >
                ▶
                </Button>
              </>
            )}
          </>
        ) : (
          <div className="bg-gray-200 w-full h-64 flex items-center justify-center rounded">
            <span>No images available</span>
          </div>
        )}
      </div>

      {/* RIGHT: Item details */}
      <div className="px-4 lg:px-0">
        <h1 className="text-2xl font-bold mb-4">{listing.title}</h1>
        <Link 
          to={`/profile/${listing.owner?.firebaseUID}`}
          className="inline-flex items-center gap-2 px-2 py-1 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
        >
          <span className="inline-flex items-baseline">
            <img
              src={UserIcon}
              alt="Seller Profile Icon"
              className="self-center w-5 h-5 rounded-full mx-1"
            />
            <span>{listing.owner?.username || listing.owner?.email || "Unknown seller"}</span>
          </span>
        </Link>
        <p className="text-lg font-semibold mt-2">${listing.price}</p>
        <p className="mt-2 text-gray-700">
          Condition: {listing.condition.charAt(0).toUpperCase() + listing.condition.slice(1)}
        </p>
        <p className="mt-4 text-gray-700">{listing.description}</p>
        <p className="mt-4 text-gray-700">
          {listing.trading ? "This seller is open to trading." : "This seller is not open to trading."}
        </p>
        <p className="mt-4 text-gray-700">
          {listing.negotiable ? "This seller is open to negotiating the price." : "Fixed price - not negotiable."}
        </p>
        
        <div className="flex flex-wrap gap-4 mt-6">
        {isOwner ? (
          <>
            {/* Navigate to Edit Listing page */}
            <Button onClick={() => navigate(`/edit-listing/${listing._id}`)}>
            Edit Listing
            </Button>

            {/* Navigate to Manage Claims page */}
            <Button onClick={() => navigate(`/manage-claims/${listing._id}`)}>
            Manage Claims
            </Button>

            {/* Delete listing */}
            <Button variant="danger" onClick={handleDelete}>
            Delete Listing
            </Button>
          </>
        ) : (
          <Button
            variant={isClaimed ? "outline" : "default"}
            onClick={handleClaim}
            disabled={isClaimed}
          >
            {isClaimed
              ? claimStatus === "pending"
                ? "Claim Pending"
                : claimStatus === "accepted"
                ? "Claim Accepted"
                : "Claim Rejected"
              : "Claim"}
          </Button>
        )}
        </div>
      </div>
    </div>
  );
}
