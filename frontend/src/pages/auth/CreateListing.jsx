import { useState } from "react";
import { getAuth } from "firebase/auth";

export default function CreateListing() {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: 0,
    condition: "",
    category: "",
    negotiable: true,
    trading: false,
  });
  const [files, setFiles] = useState([]); // Separate state for files
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const auth = getAuth();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleImageChange = (e) => {
    setFiles(Array.from(e.target.files)); // Store files separately
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error("You must be logged in to create a listing");
      }

      const formDataToSend = new FormData();

      // Append all form fields
      formDataToSend.append("title", formData.title);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("price", formData.price);
      formDataToSend.append("condition", formData.condition);
      formDataToSend.append("category", formData.category);
      formDataToSend.append("negotiable", formData.negotiable);
      formDataToSend.append("trading", formData.trading);

      // Append files
      files.forEach((file) => {
        formDataToSend.append("images", file);
      });

      const response = await fetch("http://localhost:3001/api/listings", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${await user.getIdToken()}`,
        },
        body: formDataToSend, // Don't set Content-Type header - the browser will do it
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to create listing");
      }

      const responseData = await response.json();
      setSuccess(true);
      // Reset form
      setFormData({
        title: "",
        description: "",
        price: 0,
        condition: "",
        category: "",
        negotiable: true,
        trading: false,
      });
      setFiles([]);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-center">Create Listing</h1>
      {error && (
        <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">{error}</div>
      )}
      {success && (
        <div className="mb-4 p-2 bg-green-100 text-green-700 rounded">
          Listing created successfully!
        </div>
      )}

      <form className="space-y-4" onSubmit={handleSubmit}>
        {/* Title */}
        <div>
          <label
            htmlFor="title"
            className="block text-sm font-medium text-gray-700"
          >
            Title*
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        {/* Description */}
        <div>
          <label
            htmlFor="description"
            className="block text-sm font-medium text-gray-700"
          >
            Description*
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={3}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        {/* Price */}
        <div>
          <label
            htmlFor="price"
            className="block text-sm font-medium text-gray-700"
          >
            Price <span className="text-xs text-gray-500">(in USD)</span>*
          </label>
          <input
            type="number"
            id="price"
            name="price"
            value={formData.price}
            onChange={handleChange}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        {/* Condition */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Condition*
          </label>
          <div className="mt-1 space-y-2">
            {["new", "used", "refurbished"].map((condition) => (
              <div key={condition} className="flex items-center">
                <input
                  id={condition}
                  name="condition"
                  type="radio"
                  value={condition}
                  checked={formData.condition === condition}
                  onChange={handleChange}
                  required
                  className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300"
                />
                <label
                  htmlFor={condition}
                  className="ml-2 block text-sm text-gray-700 capitalize"
                >
                  {condition}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Category */}
        <div>
          <label
            htmlFor="category"
            className="block text-sm font-medium text-gray-700"
          >
            Category*
          </label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            required
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-md"
          >
            <option value="">Select a category</option>
            {["electronics", "furniture", "clothing", "books", "other"].map(
              (category) => (
                <option key={category} value={category} className="capitalize">
                  {category}
                </option>
              )
            )}
          </select>
        </div>

        {/* Negotiable */}
        <div className="flex items-center">
          <input
            id="negotiable"
            name="negotiable"
            type="checkbox"
            checked={formData.negotiable}
            onChange={handleChange}
            className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
          />
          <label
            htmlFor="negotiable"
            className="ml-2 block text-sm text-gray-700"
          >
            Price is negotiable
          </label>
        </div>

        {/* Trading */}
        <div className="flex items-center">
          <input
            id="trading"
            name="trading"
            type="checkbox"
            checked={formData.trading}
            onChange={handleChange}
            className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
          />
          <label htmlFor="trading" className="ml-2 block text-sm text-gray-700">
            Open to trades
          </label>
        </div>

        {/* Images */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Images
          </label>
          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
            <div className="space-y-1 text-center">
              <div className="flex text-sm text-gray-600">
                <label
                  htmlFor="file-upload"
                  className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none"
                >
                  <span>Upload files</span>
                  <input
                    id="file-upload"
                    name="images"
                    type="file"
                    className="sr-only"
                    multiple
                    onChange={handleImageChange}
                    accept="image/*"
                  />
                </label>
                <p className="pl-1">or drag and drop</p>
              </div>
              <p className="text-xs text-gray-500">PNG, JPG up to 10MB</p>
              {files.length > 0 && (
                <div className="text-xs text-gray-500">
                  {files.length} file(s) selected
                  <ul className="mt-1">
                    {files.map((file, index) => (
                      <li key={index}>{file.name}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {isSubmitting ? "Creating..." : "Create Listing"}
        </button>
      </form>
    </div>
  );
}
