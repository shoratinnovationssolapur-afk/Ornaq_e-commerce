import { StatusCodes } from "http-status-codes";
import Story from "../models/Story.js";

const normalizeStoryPayload = (body = {}) => ({
  title: String(body.title || "").trim(),
  excerpt: String(body.excerpt || "").trim(),
  imageUrl: String(body.imageUrl || "").trim(),
  ctaLabel: String(body.ctaLabel || "Read Story").trim(),
  ctaUrl: String(body.ctaUrl || "").trim(),
  author: String(body.author || "ORNAQ").trim(),
  published: body.published === undefined ? true : Boolean(body.published),
  sortOrder: Number(body.sortOrder || 0)
});

export const getPublishedStories = async (_req, res) => {
  const stories = await Story.find({ published: true }).sort({ sortOrder: 1, createdAt: -1 }).limit(8).lean();
  res.json(stories);
};

export const getAdminStories = async (_req, res) => {
  const stories = await Story.find().sort({ sortOrder: 1, createdAt: -1 }).lean();
  res.json(stories);
};

export const createStory = async (req, res) => {
  const payload = normalizeStoryPayload(req.body);
  if (!payload.title || !payload.excerpt) {
    return res.status(StatusCodes.BAD_REQUEST).json({ message: "Story title and excerpt are required." });
  }

  const story = await Story.create(payload);
  req.io.emit("stories:updated");
  res.status(StatusCodes.CREATED).json(story);
};

export const updateStory = async (req, res) => {
  const payload = normalizeStoryPayload(req.body);
  if (!payload.title || !payload.excerpt) {
    return res.status(StatusCodes.BAD_REQUEST).json({ message: "Story title and excerpt are required." });
  }

  const story = await Story.findByIdAndUpdate(req.params.id, payload, { new: true, runValidators: true });
  if (!story) return res.status(StatusCodes.NOT_FOUND).json({ message: "Story not found." });

  req.io.emit("stories:updated");
  res.json(story);
};

export const deleteStory = async (req, res) => {
  const story = await Story.findByIdAndDelete(req.params.id);
  if (!story) return res.status(StatusCodes.NOT_FOUND).json({ message: "Story not found." });

  req.io.emit("stories:updated");
  res.status(StatusCodes.NO_CONTENT).send();
};
