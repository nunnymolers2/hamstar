import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Button from "../components/Button.jsx";
import UserIcon from "../assets/images/user.svg";

export default function Listing() {
  const { id } = useParams();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentImage, setCurrentImage] = useState(0);

  useEffect(() => {
    const fetchListing = async () => {
      try {
        const response = await fetch(
          `http://localhost:3001/api/listings/${id}`
        );
        if (!response.ok) {
          throw new Error("Listing not found");
        }
        const data = await response.json();
        setListing(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchListing();
  }, [id]);

  const nextSlide = () => {
    setCurrentImage((prev) => (prev + 1) % listing.images.length);
  };

  const prevSlide = () => {
    setCurrentImage(
      (prev) => (prev - 1 + listing.images.length) % listing.images.length
    );
  };

  if (loading) return <div className="text-center py-8">Loading...</div>;
  if (error)
    return <div className="text-center py-8 text-red-500">Error: {error}</div>;
  if (!listing)
    return <div className="text-center py-8">Listing not found</div>;

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
                <button
                  onClick={prevSlide}
                  className="absolute top-1/2 left-0 bg-gray-700 text-white px-2 py-1 rounded"
                >
                  ◀
                </button>
                <button
                  onClick={nextSlide}
                  className="absolute top-1/2 right-0 bg-gray-700 text-white px-2 py-1 rounded"
                >
                  ▶
                </button>
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

        {/* Seller Information */}
        <div className="block">
          <span className="inline-flex items-baseline">
            <img
              src={UserIcon}
              alt="Seller Profile Icon"
              className="self-center w-5 h-5 rounded-full mx-1"
            />
            <span>
              {listing.owner?.username ||
                listing.owner?.email ||
                "Unknown seller"}
            </span>
          </span>
        </div>

        {/* Price */}
        <p className="text-lg font-semibold mt-2">${listing.price}</p>

        {/* Condition */}
        <p className="mt-2 text-gray-700">
          Condition:{" "}
          {listing.condition.charAt(0).toUpperCase() +
            listing.condition.slice(1)}
        </p>

        {/* Description */}
        <p className="mt-4 text-gray-700">{listing.description}</p>

        {/* Trading status */}
        <p className="mt-4 text-gray-700">
          {listing.trading
            ? "This seller is open to trading."
            : "This seller is not open to trading."}
        </p>

        {/* Negotiation status */}
        <p className="mt-4 text-gray-700">
          {listing.negotiable
            ? "This seller is open to negotiating the price."
            : "Fixed price - not negotiable."}
        </p>

        {/* Claim Button */}
        <Button
          variant={/* Add your claim logic here */ "default"}
          className="mt-4"
        >
          Claim
        </Button>
      </div>
    </div>
  );
}
