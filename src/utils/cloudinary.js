// src/utils/cloudinary.js

import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

// Configure cloudinary with environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Uploads a local file to Cloudinary and removes the local file after upload.
 * @param {string} localFilePath - The path to the file on the local filesystem.
 * @returns {object|null} - The Cloudinary upload response, or null if no file was provided.
 */
const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;

    // Upload the file to Cloudinary
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto", // auto-detects file type (image, video, etc.)
    });

    // File uploaded successfully
    console.log("File is uploaded on Cloudinary:", response.url);

    // Remove the locally saved temporary file after upload
    fs.unlinkSync(localFilePath);

    return response;
  } catch (error) {
    // Remove the local file if upload fails (cleanup)
    if (localFilePath && fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath);
    }
    console.error("Cloudinary upload error:", error);
    return null;
  }
};

export { uploadOnCloudinary };