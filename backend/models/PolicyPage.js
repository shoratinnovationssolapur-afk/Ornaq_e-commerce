import mongoose from "mongoose";

const toSlug = (value = "") =>
  String(value)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const policyPageSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true, lowercase: true },
    footerLabel: { type: String, trim: true },
    eyebrow: { type: String, trim: true, default: "Policy" },
    summary: { type: String, trim: true, default: "" },
    body: { type: String, required: true, trim: true },
    showInFooter: { type: Boolean, default: false },
    showOnHome: { type: Boolean, default: false },
    isPublished: { type: Boolean, default: true },
    isSystem: { type: Boolean, default: false },
    sortOrder: { type: Number, default: 100 }
  },
  { timestamps: true }
);

policyPageSchema.pre("validate", function normalizePolicyPage(next) {
  if (this.slug) {
    this.slug = toSlug(this.slug);
  } else if (this.title) {
    this.slug = toSlug(this.title);
  }

  if (!this.footerLabel && this.title) {
    this.footerLabel = this.title;
  }

  next();
});

export default mongoose.model("PolicyPage", policyPageSchema);
