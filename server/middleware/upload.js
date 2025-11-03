import multer from "multer";
import path from "path";
import fs from "fs";

// Base upload folder in project root
const baseUploadPath = path.join(process.cwd(), "uploads");

// Ensure base upload directory exists
if (!fs.existsSync(baseUploadPath)) {
  fs.mkdirSync(baseUploadPath, { recursive: true });
}

// Create dynamic storage based on folder type
const createStorage = (folder) => {
  return multer.diskStorage({
    destination: (req, file, cb) => {
      const folderPath = path.join(baseUploadPath, folder);

      // Create folder if it doesn't exist
      if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, { recursive: true });
      }

      cb(null, folderPath);
    },
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname);
      const name = path.parse(file.originalname).name;
      const filename = `${name}-${Date.now()}${ext}`;
      cb(null, filename);
    },
  });
};

// Only allow images
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed!"), false);
  }
};

// Create separate multer instances for different folders
export const blogUpload = multer({
  storage: createStorage("blogs"),
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
});

export const projectUpload = multer({
  storage: createStorage("projects"),
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
});

// Generic upload for other purposes
export const generalUpload = multer({
  storage: createStorage("general"),
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

// Middleware helpers for specific use cases
export const uploadBlogImage = blogUpload.single("coverImage");
export const uploadBlogImages = blogUpload.array("images", 5);

export const uploadProjectImage = projectUpload.single("coverImage");
export const uploadProjectImages = projectUpload.array("images", 10);

export const uploadUserAvatar = generalUpload.single("avatar");

// Legacy middleware (keep for backward compatibility)
export const uploadSingle = (fieldName) => generalUpload.single(fieldName);
export const uploadMultiple = (fieldName, maxCount = 5) =>
  generalUpload.array(fieldName, maxCount);

export default generalUpload;
