import { StatusCodes } from "http-status-codes";
import PolicyPage from "../models/PolicyPage.js";
import { defaultPolicies } from "../data/defaultPolicies.js";

const normalizeSlug = (value = "") =>
  String(value)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const serializePolicy = (policy) => ({
  _id: policy._id,
  title: policy.title,
  slug: policy.slug,
  footerLabel: policy.footerLabel,
  eyebrow: policy.eyebrow,
  summary: policy.summary,
  body: policy.body,
  showInFooter: policy.showInFooter,
  showOnHome: policy.showOnHome,
  isPublished: policy.isPublished,
  isSystem: policy.isSystem,
  sortOrder: policy.sortOrder,
  createdAt: policy.createdAt,
  updatedAt: policy.updatedAt
});

export const ensureDefaultPolicies = async () => {
  if (!defaultPolicies.length) return;

  await PolicyPage.bulkWrite(
    defaultPolicies.map((policy) => ({
      updateOne: {
        filter: { slug: policy.slug },
        update: { $setOnInsert: policy },
        upsert: true
      }
    }))
  );
};

const getPolicySort = () => ({ sortOrder: 1, title: 1, createdAt: 1 });

export const listPublishedPolicies = async (_req, res) => {
  await ensureDefaultPolicies();

  const policies = await PolicyPage.find({ isPublished: true })
    .sort(getPolicySort())
    .lean();

  return res.status(StatusCodes.OK).json(policies.map(serializePolicy));
};

export const getPublishedPolicyBySlug = async (req, res) => {
  await ensureDefaultPolicies();

  const slug = normalizeSlug(req.params.slug);
  const policy = await PolicyPage.findOne({ slug, isPublished: true }).lean();

  if (!policy) {
    return res.status(StatusCodes.NOT_FOUND).json({ message: "Policy page not found" });
  }

  return res.status(StatusCodes.OK).json(serializePolicy(policy));
};

export const listPoliciesForAdmin = async (_req, res) => {
  await ensureDefaultPolicies();

  const policies = await PolicyPage.find().sort(getPolicySort()).lean();
  return res.status(StatusCodes.OK).json(policies.map(serializePolicy));
};

export const createPolicy = async (req, res) => {
  const policy = await PolicyPage.create({
    title: req.body.title,
    slug: req.body.slug,
    footerLabel: req.body.footerLabel,
    eyebrow: req.body.eyebrow,
    summary: req.body.summary,
    body: req.body.body,
    showInFooter: req.body.showInFooter,
    showOnHome: req.body.showOnHome,
    isPublished: req.body.isPublished,
    sortOrder: req.body.sortOrder
  });

  return res.status(StatusCodes.CREATED).json(serializePolicy(policy));
};

export const updatePolicy = async (req, res) => {
  const policy = await PolicyPage.findById(req.params.id);

  if (!policy) {
    return res.status(StatusCodes.NOT_FOUND).json({ message: "Policy page not found" });
  }

  policy.title = req.body.title;
  policy.slug = req.body.slug;
  policy.footerLabel = req.body.footerLabel;
  policy.eyebrow = req.body.eyebrow;
  policy.summary = req.body.summary;
  policy.body = req.body.body;
  policy.showInFooter = req.body.showInFooter;
  policy.showOnHome = req.body.showOnHome;
  policy.isPublished = req.body.isPublished;
  policy.sortOrder = req.body.sortOrder;

  await policy.save();

  return res.status(StatusCodes.OK).json(serializePolicy(policy));
};

export const deletePolicy = async (req, res) => {
  const policy = await PolicyPage.findById(req.params.id);

  if (!policy) {
    return res.status(StatusCodes.NOT_FOUND).json({ message: "Policy page not found" });
  }

  if (policy.isSystem) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      message: "Default policy pages cannot be deleted. Edit or unpublish them instead."
    });
  }

  await policy.deleteOne();

  return res.status(StatusCodes.OK).json({ message: "Policy page deleted" });
};
