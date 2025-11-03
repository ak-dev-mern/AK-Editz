import express from "express";
import {
  subscribeToNewsletter,
  getSubscribers,
  getNewsletterStats,
  unsubscribeFromNewsletter,
} from "../controllers/newsletterController.js";

const router = express.Router();

router.post("/subscribe", subscribeToNewsletter);
router.post("/unsubscribe", unsubscribeFromNewsletter);
router.get("/subscribers", getSubscribers);
router.get("/stats", getNewsletterStats);

export default router;
