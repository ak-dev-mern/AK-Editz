// routes/newsletterRoutes.js
import express from "express";
import {
  subscribeToNewsletter,
  unsubscribeFromNewsletter,
  getSubscribers,
  getNewsletterStats,
  getSubscriberByEmail,
} from "../controllers/newsletterController.js";

const router = express.Router();

router.post("/subscribe", subscribeToNewsletter);
router.post("/unsubscribe", unsubscribeFromNewsletter);
router.get("/subscribers", getSubscribers);
router.get("/stats", getNewsletterStats);
router.get("/subscriber/:email", getSubscriberByEmail);

export default router;
