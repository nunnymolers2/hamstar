import { Link } from "react-router-dom";
import Button from "../components/Button.jsx";

/**
 * ListingCard
 * Props:
 *  - listing: object (required)
 *  - variant: 'default' | 'claimed' | 'sold' | 'self' (defaults to 'clickable')
 *  - onClaim: function(listingId) optional handler used by 'action' variant
 */
export default function ListingCard({
  listing,
  variant = "default",
  onClaim,
}) {
  // Base card classes
  const base =
    "bg-white border rounded-lg shadow p-4 flex flex-col justify-between items-center hover:shadow-lg transition-shadow";

  // Variant-specific classes (add more variants here)
  const variants = {
    default: "cursor-pointer", // whole card is a link
    claimed: "", // card with a separate action button (no extra classes)
    sold: "p-2 text-sm", // smaller padding + text
    self: "ring-2 ring-yellow-300", // highlight for featured items
  };

  const className = `${base} ${variants[variant] || ""}`;

  // Shared content (image + details)
  const content = (
    <>
      {listing.images?.length > 0 ? (
        <img
          src={listing.images[0].url}
          alt={listing.title}
          className="w-full h-48 object-cover mb-4 rounded"
        />
      ) : (
        <div className="w-full h-48 bg-gray-200 mb-4 rounded flex items-center justify-center">
          <span className="text-gray-500">No image</span>
        </div>
      )}

      <div className="flex-1 w-full">
        <h3 className="font-bold text-lg mb-2">{listing.title}</h3>
        <p className="text-blue-600 font-semibold mb-2">${listing.price}</p>
        <p className="text-sm text-gray-600 mb-2 capitalize">
          Condition: {listing.condition.replace(/-/g, " ")}
        </p>
        <p className="text-sm text-gray-600 mb-2 capitalize">
          Category: {listing.category}
        </p>
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
          {listing.description}
        </p>
      </div>
    </>
  );

  // Default Variant: whole card clickable + Claim button
  if (variant === "default") {
    return (
      <div className={className}>
        {/* Only content is clickable; button is outside the link */}
        <Link to={`/listings/${listing._id}`} className="w-full block">
          {content}
        </Link>

        {/* Action button — calls onClaim passed from parent */}
        <Button
          variant="default"
          className="w-full mt-2"
          onClick={() => onClaim && onClaim(listing._id)}
        >
          Claim
        </Button>
      </div>
    );
  };

  // Claimed Variant: whole card clickable + Claim button 
  if (variant === "claimed") {
    return (
      <div className={className}>
        {/* Only content is clickable; button is outside the link */}
        <Link to={`/listings/${listing._id}`} className="w-full block">
          {content}
        </Link>

        {/* Action button — calls onClaim passed from parent */}
        <Button
          variant="enabled"
          className="w-full mt-2"
          onClick={() => onClaim && onClaim(listing._id)}
        >
          Claim
        </Button>
      </div>
    );
  };

  // Self Variant: whole card clickable + see claims button 
  if (variant === "self") {
    return (
      <div className={className}>
        {/* Only content is clickable; button is outside the link */}
        <Link to={`/listings/${listing._id}`} className="w-full block">
          {content}
        </Link>

        {/* Action button — calls onClaim passed from parent */}
        <Button
          variant="outline"
          className="w-full mt-2"
          onClick={() => onClaim && onClaim(listing._id)}
        >
          Manage Claims
        </Button>
      </div>
    );
  };

  // Sold variant: non-clickable card, no button
  return <div className={className}>{content}</div>;
}
