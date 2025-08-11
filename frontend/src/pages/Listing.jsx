import { useState } from "react";
import Button from "../components/Button.jsx";

import UserIcon from '../assets/images/user.svg';           {/* Seller Profile icon */}

// FIX: Swap out for images of item being sold.
import img1 from "../assets/images/placeholder.png";
import img2 from "../assets/images/placeholder.png";
import img3 from "../assets/images/placeholder.png";

export default function Listing() {
  // --- Image Carousel Data ---
  const images = [img1, img2, img3];
  const [current, setCurrent] = useState(0);

  const nextSlide = () => {
    setCurrent((prev) => (prev + 1) % images.length);
  };

  const prevSlide = () => {
    setCurrent((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">

      {/* LEFT: Image Carousel */}
      <div className="relative w-full max-w-lg mx-auto">
        <img
          src={images[current]}
          alt="Item"
          className="w-full h-full object-cover rounded"
        />
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
      </div>

      {/* RIGHT: Item details */}
      <div className="px-4 lg:px-0">
      {/* Title */}
      <h1 className="text-2xl font-bold mb-4">Product Title</h1>

      {/* Seller Information */}
      <a href="#" className="block">
      <span class="inline-flex items-baseline">
        <img src={UserIcon} alt="Seller Profile Icon" class="self-center w-5 h-5 rounded-full mx-1" />
        <span>John Doe</span>
      </span>
      </a>

      {/* Price */}
      <p className="text-lg font-semibold mt-2">$45</p>

      {/* Open to trading? */}
      <p className="mt-4 text-gray-700">
        This seller is (not) open to trading.
      </p>

      {/* Open to negotiation? */}
      <p className="mt-4 text-gray-700">
        This seller is (not) open to negotiating the price.
      </p>

      {/* Claim Button */}
      <Button variant="default">Claim</Button>
      {/* FIX: variant should be set to "enabled" if the item is already claimed by user. */}
      </div>

    </div>
  );
}