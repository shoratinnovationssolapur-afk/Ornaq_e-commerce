import express from "express";
import {
  createRazorpayOrder,
  createStripeIntent,
  verifyRazorpayPayment
} from "../controllers/paymentController.js";
import { optionalProtect, protect } from "../middleware/authMiddleware.js";

const router = express.Router();


router.post("/razorpay/order", protect, createRazorpayOrder);
router.post("/razorpay/verify", optionalProtect, verifyRazorpayPayment);

export default router;
