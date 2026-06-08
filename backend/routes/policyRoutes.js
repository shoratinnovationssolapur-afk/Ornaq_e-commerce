import express from "express";
import { body, param } from "express-validator";
import {
  createPolicy,
  deletePolicy,
  getPublishedPolicyBySlug,
  listPoliciesForAdmin,
  listPublishedPolicies,
  updatePolicy
} from "../controllers/policyController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";
import { validateRequest } from "../middleware/validateRequest.js";

const router = express.Router();

const policyValidators = [
  body("title").trim().isLength({ min: 3, max: 160 }),
  body("slug").trim().isLength({ min: 3, max: 160 }),
  body("footerLabel").optional({ values: "falsy" }).trim().isLength({ min: 3, max: 160 }),
  body("eyebrow").optional({ values: "falsy" }).trim().isLength({ max: 40 }),
  body("summary").optional({ values: "falsy" }).trim().isLength({ max: 500 }),
  body("body").trim().isLength({ min: 20, max: 20000 }),
  body("sortOrder").optional().isInt({ min: 0, max: 9999 }),
  body("showInFooter").optional().isBoolean(),
  body("showOnHome").optional().isBoolean(),
  body("isPublished").optional().isBoolean()
];

router.get("/", listPublishedPolicies);
router.get("/admin/list", protect, authorize("admin"), listPoliciesForAdmin);
router.get(
  "/:slug",
  [param("slug").trim().isLength({ min: 3, max: 160 })],
  validateRequest,
  getPublishedPolicyBySlug
);
router.post("/", protect, authorize("admin"), policyValidators, validateRequest, createPolicy);
router.put(
  "/:id",
  protect,
  authorize("admin"),
  [param("id").isMongoId(), ...policyValidators],
  validateRequest,
  updatePolicy
);
router.delete(
  "/:id",
  protect,
  authorize("admin"),
  [param("id").isMongoId()],
  validateRequest,
  deletePolicy
);

export default router;
