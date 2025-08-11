import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Button from "../components/Button";

const TAGS = ["electronics", "furniture", "clothing", "books", "other"];
const CONDITIONS = ["new", "used", "refurbished", "for parts"];

export default function Home() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dropdownOpen1, setDropdownOpen1] = useState(false);
  const [dropdownOpen2, setDropdownOpen2] = useState(false);
  const [selectedTags, setSelectedTags] = useState([]);
  const [selectedConditions, setSelectedConditions] = useState([]);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchListings = async () => {
      try {
        const response = await fetch("http://localhost:3001/api/listings");
        if (!response.ok) {
          throw new Error("Failed to fetch listings");
        }
        const data = await response.json();
        setListings(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, []);

  const handleCheckbox = (tag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleConditionCheckbox = (condition) => {
    setSelectedConditions((prev) =>
      prev.includes(condition)
        ? prev.filter((c) => c !== condition)
        : [...prev, condition]
    );
  };

  const filteredListings = listings.filter((listing) => {
    const matchesCategory =
      selectedTags.length === 0 || selectedTags.includes(listing.category);

    const matchesCondition =
      selectedConditions.length === 0 ||
      selectedConditions.includes(listing.condition);

    return matchesCategory && matchesCondition;
  });

  if (loading)
    return <div className="text-center py-8">Loading listings...</div>;
  if (error)
    return <div className="text-center py-8 text-red-500">Error: {error}</div>;

  return (
    <div className="flex">
      <aside
        className={`bg-gray-50 border-r border-gray-200 w-64 min-h-screen px-3 py-4 transition-all
           ${sidebarOpen ? "block" : "hidden"} sm:block`}
      >
        <ul className="space-y-2 font-medium">
          <li>
            <button
              type="button"
              onClick={() => setDropdownOpen1(!dropdownOpen1)}
              className="flex items-center w-full p-2 text-base text-gray-900 transition duration-75 rounded-lg hover:bg-gray-100"
            >
              <span className="flex-1 ms-3 text-left whitespace-nowrap">
                Categories
              </span>
              <span>{dropdownOpen1 ? "▲" : "▼"}</span>
            </button>
            {dropdownOpen1 && (
              <ul className="py-2 space-y-2">
                {TAGS.map((tag) => (
                  <li key={tag} className="px-4">
                    <label className="inline-flex items-center">
                      <input
                        type="checkbox"
                        className="form-checkbox h-5 w-5 text-blue-600"
                        checked={selectedTags.includes(tag)}
                        onChange={() => handleCheckbox(tag)}
                      />
                      <span className="ms-2 text-gray-700 capitalize">
                        {tag}
                      </span>
                    </label>
                  </li>
                ))}
              </ul>
            )}
          </li>
          <li>
            <button
              type="button"
              onClick={() => setDropdownOpen2(!dropdownOpen2)}
              className="flex items-center w-full p-2 text-base text-gray-900 transition duration-75 rounded-lg hover:bg-gray-100"
            >
              <span className="flex-1 ms-3 text-left whitespace-nowrap">
                Condition
              </span>
              <span>{dropdownOpen2 ? "▲" : "▼"}</span>
            </button>
            {dropdownOpen2 && (
              <ul className="py-2 space-y-2">
                {CONDITIONS.map((condition) => (
                  <li key={condition} className="px-4">
                    <label className="inline-flex items-center">
                      <input
                        type="checkbox"
                        className="form-checkbox h-5 w-5 text-blue-600"
                        checked={selectedConditions.includes(condition)}
                        onChange={() => handleConditionCheckbox(condition)}
                      />
                      <span className="ms-2 text-gray-700 capitalize">
                        {condition.replace(/-/g, " ")}
                      </span>
                    </label>
                  </li>
                ))}
              </ul>
            )}
          </li>
        </ul>
      </aside>
      <main className="flex-1 p-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {filteredListings.length === 0 && (
            <div className="col-span-full text-gray-400">
              {listings.length === 0
                ? "No listings available"
                : "No listings match your filters"}
            </div>
          )}
          {filteredListings.map((listing) => (
            <div
              key={listing._id}
              className="bg-white border rounded-lg shadow p-4 flex flex-col justify-between items-center"
            >
              {listing.images?.length > 0 ? (
                <img
                  src={listing.images[0].url}
                  alt={listing.title}
                  className="w-full h-48 lg:size-1/2 object-cover mb-4 rounded"
                />
              ) : (
                <div className="w-full h-48 bg-gray-200 mb-4 rounded flex items-center justify-center">
                  <span className="text-gray-500">No image</span>
                </div>
              )}
              <div className="flex-1 w-full">
                <h3 className="font-bold text-lg mb-2">{listing.title}</h3>
                <p className="text-blue-600 font-semibold mb-2">
                  ${listing.price}
                </p>
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
              <Link to={`/listings/${listing._id}`} className="mt-auto w-full">
                <Button variant="default" className="w-full">
                  View Details
                </Button>
              </Link>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
