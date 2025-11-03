import express from "express";
import {
  getAllBlogs,
  getBlogById,
  createBlog,
  updateBlog,
  deleteBlog,
  getBlogsByCategory,
  incrementBlogViews,
  getFeaturedBlogs,
  getBlogStats,
  togglePublishStatus,
  getAllBlogsByAdmin,
} from "../controllers/BlogController.js";
import adminAuth from "../middleware/adminAuth.js";
import { uploadBlogImage } from "../middleware/upload.js";

const router = express.Router();

// Public routes
router.get("/", getAllBlogs);
router.get("/featured", getFeaturedBlogs);
router.get("/category/:category", getBlogsByCategory);
router.get("/:id", getBlogById);
router.patch("/:id/views", incrementBlogViews);

// Protected routes (admin only)
// Admin routes
router.get("/admin/all", adminAuth, getAllBlogsByAdmin);
router.post("/", adminAuth, uploadBlogImage, createBlog);
router.put("/:id", adminAuth, uploadBlogImage, updateBlog);
router.delete("/:id", adminAuth, deleteBlog);
router.get("/admin/stats", adminAuth, getBlogStats);
router.patch("/:id/toggle-publish", adminAuth, togglePublishStatus);

export default router;
