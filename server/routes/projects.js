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
} from "../controllers/projectsController.js";
import adminAuth from "../middleware/adminAuth.js";
import { uploadProjectImages } from "../middleware/upload.js";

const router = express.Router();

// Public routes
router.get("/", getAllProjects);
router.get("/featured", getFeaturedProjects);
router.get("/category/:category", getProjectsByCategory);
router.get("/similar/:id", getSimilarProjects);
router.get("/:id", getProjectById);

// Admin only routes
router.post("/", adminAuth, uploadProjectImages, createProject);
router.put("/:id", adminAuth, uploadProjectImages, updateProject);
router.delete("/:id", adminAuth, deleteProject);
router.patch("/:id/toggle-active", adminAuth, toggleProjectActive);
router.patch("/:id/toggle-featured", adminAuth, toggleProjectFeatured);
router.get("/admin/stats", adminAuth, getProjectStats);

export default router;
