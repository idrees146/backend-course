// src/middlewares/multer.middleware.js
// Multer middleware for handling file uploads (temporary storage)
// Professional, production-ready, and well-commented for learning

import multer from "multer";
import path from "path";

// Configure multer storage to save files temporarily in the 'temp' directory
const storage = multer.diskStorage({
  // Set the destination folder for uploaded files
  destination: function (req, file, cb) {
    // Files will be saved in the 'temp' folder at the project root
    cb(null, path.join(process.cwd(), "public", "temp"));
  },
  // Set the filename for uploaded files to avoid collisions
  filename: function (req, file, cb) {
    // Example: avatar-1689876543210-123456789.png
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname); // preserve original extension
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  },
});

// Create the multer upload middleware
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB file size limit (customize as needed)
  },
});

// Usage:
// In your route: router.post('/upload', upload.single('avatar'), controllerFn)
// For multiple files: upload.array('photos', 5)

export { upload };
