import express from "express";
import { body } from "express-validator";
import { getProfile, updateProfile } from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";
import { validateRequest } from "../middleware/validateRequest.js";

const router = express.Router();

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
