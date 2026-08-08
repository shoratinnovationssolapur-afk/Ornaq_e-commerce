import express from "express";
import { body } from "express-validator";
import {
  forgotPassword,
  getProfile,
  googleLogin,
  login,
  register,
  requestOtp,
  resetPassword,
  updateProfile,
  verifyOtp
} from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";
import { validateRequest } from "../middleware/validateRequest.js";

const router = express.Router();

router.post(
  "/register",
  [
    body("name").optional().trim(),
    body("email").isEmail().normalizeEmail(),
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
    body("phone").optional().trim()
  ],
  validateRequest,
  register
);

router.post(
  "/login",
  [body("email").isEmail().normalizeEmail(), body("password").isLength({ min: 6 })],
  validateRequest,
  login
);

router.post(
  "/request-otp",
  [
    body("email").optional({ checkFalsy: true }).isEmail().normalizeEmail(),
    body("phone").optional({ checkFalsy: true }).trim(),
    body("phoneNumber").optional({ checkFalsy: true }).trim(),
    body("name").optional({ checkFalsy: true }).trim()
  ],
  validateRequest,
  requestOtp
);

router.post(
  "/verify-otp",
  [
    body("email").optional({ checkFalsy: true }).isEmail().normalizeEmail(),
    body("phone").optional({ checkFalsy: true }).trim(),
    body("phoneNumber").optional({ checkFalsy: true }).trim(),
    body("otp").trim().isLength({ min: 4, max: 8 }).withMessage("Enter a valid OTP")
  ],
  validateRequest,
  verifyOtp
);

router.post("/google", googleLogin);
router.post("/forgot-password", [body("email").isEmail().normalizeEmail()], validateRequest, forgotPassword);
router.post(
  "/reset-password",
  [
    body("token").trim().notEmpty().withMessage("Reset token is required"),
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters")
  ],
  validateRequest,
  resetPassword
);

router.get("/profile", protect, getProfile);
router.get("/me", protect, getProfile);
router.put(
  "/profile",
  protect,
  [
    body("name").optional().trim().notEmpty().withMessage("Name cannot be empty"),
    body("phone").optional().trim().isString()
  ],
  validateRequest,
  updateProfile
);

export default router;
