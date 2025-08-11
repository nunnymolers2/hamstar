import { useState } from "react";
import { PRODUCTS } from "../data/products";
import Button from "../components/Button";

const TAGS = ["Clothes", "Kitchen Appliances", "Cutlery"];

export default function Home() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selectedTags, setSelectedTags] = useState([]);

  const handleCheckbox = (tag) => {
    setSelectedTags((prev) =>
      prev.includes(tag)
        ? prev.filter((t) => t !== tag)
        : [...prev, tag]
    );
  };

  const filteredProducts =
    selectedTags.length === 0
      ? PRODUCTS
      : PRODUCTS.filter((product) =>
          product.tags.some((tag) => selectedTags.includes(tag))
        );

  return (
    <div className="flex">
      <aside
        className={`bg-gray-50 border-r border-gray-200 w-64 min-h-screen px-3 py-4 transition-all
           ${sidebarOpen ? "block" : "hidden"} sm:block`}>
        <ul className="space-y-2 font-medium">
          <li>
            <button
               type="button"
               onClick={() => setDropdownOpen(!dropdownOpen)}
               className="flex items-center w-full p-2 text-base text-gray-900 transition duration-75 rounded-lg hover:bg-gray-100"
            >
               <span className="flex-1 ms-3 text-left whitespace-nowrap">Categories</span>
               <span>{dropdownOpen ? "▲" : "▼"}</span>
            </button>
             {dropdownOpen && (
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
                      <span className="ms-2 text-gray-700">{tag}</span>
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
          {filteredProducts.length === 0 && (
            <div className="col-span-full text-gray-400">No products found.</div>
          )}
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="bg-white border rounded-lg shadow p-4 flex flex-col items-center"
            >
              <img
                src={product.image}
                alt={product.name}
                className="w-32 h-32 object-cover mb-4 rounded"
              />
              <div className="font-bold text-lg mb-2">{product.name}</div>
              <div className="text-blue-600 font-semibold mb-2">${product.price}</div>
              <Button variant="default" className="mt-auto">
                Claim
              </Button>
            </div>
          ))}
        </div>
      </main>
    </div>
 );
}

