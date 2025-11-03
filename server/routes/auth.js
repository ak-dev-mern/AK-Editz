import express from "express";
import {
  register,
  login,
  getCurrentUser,
  updateProfile,
  changePassword,
  forgotPassword,
  resetPassword,
  validateResetToken,
} from "../controllers/authController.js";
import auth from "../middleware/auth.js";

const router = express.Router();

// Public routes
router.post("/register", register);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);
router.get("/validate-reset-token/:token", validateResetToken);

// Protected routes
router.get("/me", auth, getCurrentUser);
router.put("/profile", auth, updateProfile);
router.put("/change-password", auth, changePassword);

export default router;
