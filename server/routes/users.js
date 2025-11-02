import express from "express";
import {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  getUserStats,
} from "../controllers/userController.js";
import adminAuth from "../middleware/adminAuth.js";

const router = express.Router();

// All routes require admin privileges
router.get("/", adminAuth, getAllUsers);
router.get("/stats", adminAuth, getUserStats);
router.get("/:id", adminAuth, getUserById);
router.put("/:id", adminAuth, updateUser);
router.delete("/:id", adminAuth, deleteUser);

export default router;
