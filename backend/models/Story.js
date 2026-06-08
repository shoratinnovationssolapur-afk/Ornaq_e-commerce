import mongoose from "mongoose";

const storySchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    excerpt: { type: String, required: true, trim: true },
    imageUrl: { type: String, default: "", trim: true },
    ctaLabel: { type: String, default: "Read Story", trim: true },
    ctaUrl: { type: String, default: "", trim: true },
    author: { type: String, default: "ORNAQ", trim: true },
    published: { type: Boolean, default: true, index: true },
    sortOrder: { type: Number, default: 0, index: true }
  },
  { timestamps: true }
);

export default mongoose.model("Story", storySchema);
