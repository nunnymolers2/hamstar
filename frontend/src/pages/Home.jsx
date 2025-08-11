import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Button from "../components/Button";
import ListingCard from "../components/ListingCard";

// Filter options for categories and conditions
const TAGS = ["electronics", "furniture", "clothing", "books", "other"];
const CONDITIONS = ["new", "used", "refurbished", "for parts"];

export default function Home() {
  // Sidebar and dropdown open states
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dropdownOpen1, setDropdownOpen1] = useState(false);
  const [dropdownOpen2, setDropdownOpen2] = useState(false);

  // Selected filter values
  const [selectedTags, setSelectedTags] = useState([]);
  const [selectedConditions, setSelectedConditions] = useState([]);
  
  // Listings Data
  const [listings, setListings] = useState([]);

  // Fetch Status
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch listings from backend
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

  // Toggle category tag selection when checkbox is clicked
  const handleCheckbox = (tag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  // Toggle condition selection when checkbox is clicked
  const handleConditionCheckbox = (condition) => {
    setSelectedConditions((prev) =>
      prev.includes(condition)
        ? prev.filter((c) => c !== condition)
        : [...prev, condition]
    );
  };

  // Filter listings based on selected categories and conditions
  const filteredListings = listings.filter((listing) => {
    const matchesCategory =
      selectedTags.length === 0 || selectedTags.includes(listing.category);

    const matchesCondition =
      selectedConditions.length === 0 ||
      selectedConditions.includes(listing.condition);

    return matchesCategory && matchesCondition;
  });

  // Show loading or error messages
  if (loading)
    return <div className="text-center py-8">Loading listings...</div>;
  if (error)
    return <div className="text-center py-8 text-red-500">Error: {error}</div>;

  return (
    <div className="flex">
      {/* Sidebar with filters */}
      <aside
        className={`bg-gray-50 border-r border-gray-200 w-64 min-h-screen px-3 py-4 transition-all
           ${sidebarOpen ? "block" : "hidden"} sm:block`}
      >
        <ul className="space-y-2 font-medium">
          {/* Categories filter dropdown */}
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

          {/* Condition filter dropdown */}
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
      
      {/* Main content: filtered listings grid */}  
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
          {/* Render filtered listing cards */}
          {filteredListings.map((listing) => (
            <ListingCard key={listing._id} listing={listing} />
          ))}
        </div>
      </main>
    </div>
  );
}
