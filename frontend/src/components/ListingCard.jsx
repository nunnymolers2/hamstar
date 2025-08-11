import { Link } from "react-router-dom";
import Button from "../components/Button.jsx";

export default function ListingCard({ listing }) {
  return (
    <Link
      to={`/listings/${listing._id}`}
      className="block bg-white border rounded-lg shadow p-4 flex flex-col justify-between items-center hover:shadow-lg transition-shadow"
    >
        {/* Styling Listing Image */}
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
         
    {/* Styling Information on Card */}
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

        {/* Claim Button */}
        <Button variant="default" className="w-full">
        Claim
        </Button>
    </div>

    </Link>
  );
}
