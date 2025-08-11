import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import path from "path";

// Export initialization function
export function initCloudinary() {
  if (!process.env.CLOUDINARY_CLOUD_NAME) {
    throw new Error("❌ Missing CLOUDINARY_CLOUD_NAME in environment variables");
  }

  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true
  });

  console.log("✅ Cloudinary initialized successfully");
  return cloudinary;
}

// Storage configuration (will use the initialized cloudinary)
export const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    if (!process.env.CLOUDINARY_CLOUD_NAME) {
      throw new Error("Cloudinary not initialized before storage creation");
    }

    return {
      folder: "marketplace",
      allowed_formats: ["jpg", "jpeg", "png", "webp"],
      public_id: `${Date.now()}-${path.parse(file.originalname).name}`,
      transformation: [
        { width: 800, height: 800, crop: "limit", quality: "auto" }
      ]
    };
  }
});