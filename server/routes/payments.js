import express from "express";
import {
  createPaymentIntent,
  confirmPayment,
  handleWebhook,
  getPurchasedProjects,
  getUserPayments,
  getPaymentById,
  downloadInvoice,
  // Admin functions
  getAllPayments,
  getPaymentStats,
  refundPayment,
  handleQRWebhook,
  checkQRPaymentStatus,
  createQRPayment,
} from "../controllers/paymentsController.js";
import adminAuth from "../middleware/adminAuth.js";
import auth from "../middleware/auth.js";

const router = express.Router();

// Webhook must come before body parser
router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  handleWebhook
);

router.post("/qr/create", auth, createQRPayment);
router.get("/qr/status/:paymentId", auth, checkQRPaymentStatus);
router.post("/qr/webhook", handleQRWebhook); // No auth for webhooks

// User payment routes - PROTECTED (regular users)
router.post("/create-payment-intent", auth, createPaymentIntent);
router.post("/confirm", auth, confirmPayment);
router.get("/purchased-projects", auth, getPurchasedProjects);
router.get("/user/history", auth, getUserPayments); // Users can see their own payment history
router.get("/:id", auth, getPaymentById); // Users can see their own payments
router.get("/:id/invoice", auth, downloadInvoice); // Users can download their own invoices

// Admin payment routes - PROTECTED + ADMIN ONLY
router.get("/admin/all", auth, adminAuth, getAllPayments); // Both auth AND adminAuth
router.get("/admin/stats", auth, adminAuth, getPaymentStats); // Both auth AND adminAuth
router.post("/admin/:id/refund", auth, adminAuth, refundPayment); // Both auth AND adminAuth

export default router;
