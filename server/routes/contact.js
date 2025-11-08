import express from "express";
import { sendContactEmail } from "../controllers/contactController.js";

const router = express.Router();

router.post("/contact/send", sendContactEmail);

export default router;
