import express from "express";
import {
  createStory,
  deleteStory,
  getAdminStories,
  getPublishedStories,
  updateStory
} from "../controllers/storyController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", getPublishedStories);
router.get("/admin", protect, authorize("admin"), getAdminStories);
router.post("/", protect, authorize("admin"), createStory);
router.patch("/:id", protect, authorize("admin"), updateStory);
router.delete("/:id", protect, authorize("admin"), deleteStory);

export default router;
