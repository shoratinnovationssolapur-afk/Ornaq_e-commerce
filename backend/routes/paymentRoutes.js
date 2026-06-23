import express from "express";
import {
  createRazorpayOrder,
  createStripeIntent,
  stripeWebhook,
  verifyRazorpayPayment
} from "../controllers/paymentController.js";
import { optionalProtect, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/stripe/create-intent", createStripeIntent);
router.post("/stripe/webhook", stripeWebhook);
router.post("/razorpay/order", protect, createRazorpayOrder);
router.post("/razorpay/verify", optionalProtect, verifyRazorpayPayment);

export default router;
