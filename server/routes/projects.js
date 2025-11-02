import express from "express";
import {
  getAllProjects,
  getProjectById,
  getFeaturedProjects,
  getProjectsByCategory,
  createProject,
  updateProject,
  deleteProject,
  toggleProjectActive,
  toggleProjectFeatured,
  getProjectStats,
  getSimilarProjects,
  upload,
  handleMulterError,
} from "../controllers/projectsController.js";
import adminAuth from "../middleware/adminAuth.js";

const router = express.Router();

// Public routes
router.get("/", getAllProjects);
router.get("/featured", getFeaturedProjects);
router.get("/category/:category", getProjectsByCategory);
router.get("/similar/:id", getSimilarProjects);
router.get("/:id", getProjectById);

// Admin only routes
router.post("/", adminAuth, upload.array("images", 5), createProject);
router.put("/:id", adminAuth, upload.array("images", 5), updateProject);
router.delete("/:id", adminAuth, deleteProject);
router.patch("/:id/toggle-active", adminAuth, toggleProjectActive);
router.patch("/:id/toggle-featured", adminAuth, toggleProjectFeatured);
router.get("/admin/stats", adminAuth, getProjectStats);

// Multer error handling
router.use(handleMulterError);

export default router;
