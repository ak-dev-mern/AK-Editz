import express from "express";
import {
  createOrder,
  verifyPayment,
  getPurchasedProjects,
  getAllPayments,
  getUserPayments,
  getPaymentById,
  getPaymentStats,
  refundPayment,
  downloadInvoice,
} from "../controllers/paymentsController.js";
import auth from "../middleware/auth.js";
import adminAuth from "../middleware/adminAuth.js";

const router = express.Router();

// Payment processing routes
router.post("/create-order", auth, createOrder);
router.post("/verify", auth, verifyPayment);

// User payment routes
router.get("/my-projects", auth, getPurchasedProjects);
router.get("/user-payments", auth, getUserPayments);
router.get("/invoice/:id", auth, downloadInvoice);

// Payment access routes
router.get("/:id", auth, getPaymentById);

// Admin only routes
router.get("/admin/all", adminAuth, getAllPayments);
router.get("/admin/stats/overview", adminAuth, getPaymentStats);
router.post("/admin/refund/:id", adminAuth, refundPayment);

export default router;
