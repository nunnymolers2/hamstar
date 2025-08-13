import { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getAuth } from "firebase/auth";
import { AuthContext } from "../context/AuthProvider";
import Button from "../components/Button.jsx";

export default function EditListing() {
  const { id } = useParams(); // listing id
  const navigate = useNavigate();
  const { user: currentUser } = useContext(AuthContext);
  const auth = getAuth();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: 0,
    condition: "",
    category: "",
    negotiable: true,
    trading: false,
  });
  const [existingImages, setExistingImages] = useState([]); // already uploaded images
  const [files, setFiles] = useState([]); // new images to upload
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Fetch listing on mount
  useEffect(() => {
    const fetchListing = async () => {
      try {
        const res = await fetch(`http://localhost:3001/api/listings/${id}`);
        if (!res.ok) throw new Error("Listing not found");
        const data = await res.json();

        // Only owner can edit
        if (data.owner.firebaseUID !== currentUser?.uid) {
          throw new Error("Unauthorized");
        }

        setFormData({
          title: data.title,
          description: data.description,
          price: data.price,
          condition: data.condition,
          category: data.category,
          negotiable: data.negotiable,
          trading: data.trading,
        });

        setExistingImages(data.images || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchListing();
  }, [id, currentUser]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleImageChange = (e) => {
    setFiles(Array.from(e.target.files));
  };

  const handleRemoveExistingImage = (index) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");
    setSuccess(false);

    try {
      const user = auth.currentUser;
      if (!user) throw new Error("You must be logged in");

      const formDataToSend = new FormData();
      formDataToSend.append("title", formData.title);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("price", formData.price);
      formDataToSend.append("condition", formData.condition);
      formDataToSend.append("category", formData.category);
      formDataToSend.append("negotiable", formData.negotiable);
      formDataToSend.append("trading", formData.trading);

      // Append new files
      files.forEach((file) => formDataToSend.append("images", file));

      // Include existing images info (if backend requires it)
      formDataToSend.append("existingImages", JSON.stringify(existingImages));

      const response = await fetch(`http://localhost:3001/api/listings/${id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${await user.getIdToken()}`,
        },
        body: formDataToSend,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to update listing");
      }

      setSuccess(true);
      setFiles([]);
      navigate(`/listing/${id}`); // go back to listing page
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className="text-center py-8">Loading...</div>;
  if (error) return <div className="text-center py-8 text-red-500">{error}</div>;

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-center">Edit Listing</h1>
      {success && (
        <div className="mb-4 p-2 bg-green-100 text-green-700 rounded">
          Listing updated successfully!
        </div>
      )}

      <form className="space-y-4" onSubmit={handleSubmit}>
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Title*</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            className="mt-1 block w-full px-3 py-2 border rounded-md"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Description*</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={3}
            required
            className="mt-1 block w-full px-3 py-2 border rounded-md"
          />
        </div>

        {/* Price */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Price (USD)*
          </label>
          <input
            type="number"
            name="price"
            value={formData.price}
            onChange={handleChange}
            required
            className="mt-1 block w-full px-3 py-2 border rounded-md"
          />
        </div>

        {/* Condition */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Condition*</label>
          <div className="mt-1 space-y-2">
            {["new", "used", "refurbished"].map((condition) => (
              <div key={condition} className="flex items-center">
                <input
                  type="radio"
                  name="condition"
                  value={condition}
                  checked={formData.condition === condition}
                  onChange={handleChange}
                  required
                  className="h-4 w-4 border-gray-300"
                />
                <label className="ml-2 text-sm text-gray-700 capitalize">{condition}</label>
              </div>
            ))}
          </div>
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Category*</label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            required
            className="mt-1 block w-full px-3 py-2 border rounded-md"
          >
            <option value="">Select a category</option>
            {["electronics", "furniture", "clothing", "books", "other"].map((c) => (
              <option key={c} value={c} className="capitalize">{c}</option>
            ))}
          </select>
        </div>

        {/* Negotiable */}
        <div className="flex items-center">
          <input
            type="checkbox"
            name="negotiable"
            checked={formData.negotiable}
            onChange={handleChange}
          />
          <label className="ml-2 text-sm text-gray-700">Price is negotiable</label>
        </div>

        {/* Trading */}
        <div className="flex items-center">
          <input
            type="checkbox"
            name="trading"
            checked={formData.trading}
            onChange={handleChange}
          />
          <label className="ml-2 text-sm text-gray-700">Open to trades</label>
        </div>

        {/* Existing Images */}
        {existingImages.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700">Existing Images</label>
            <div className="flex flex-wrap gap-2 mt-1">
              {existingImages.map((img, idx) => (
                <div key={idx} className="relative">
                  <img src={img.url} alt="Existing" className="w-20 h-20 object-cover rounded" />
                  <button
                    type="button"
                    onClick={() => handleRemoveExistingImage(idx)}
                    className="absolute top-0 right-0 bg-red-600 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* New Images */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Upload New Images</label>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleImageChange}
            className="mt-1 block w-full"
          />
          {files.length > 0 && (
            <p className="text-xs text-gray-500 mt-1">{files.length} file(s) selected</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-2 px-4 bg-indigo-600 text-white rounded-md"
        >
          {isSubmitting ? "Updating..." : "Update Listing"}
        </button>
      </form>
    </div>
  );
}
