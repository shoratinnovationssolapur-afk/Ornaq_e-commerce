export const PRIMARY_POLICY_SLUGS = [
  "privacy-policy",
  "terms-and-conditions",
  "refund-return-replacement-policy"
];

export const POLICY_ROUTE_ALIASES = {
  "privacy-policy": "/privacy-policy",
  "terms-and-conditions": "/terms-and-conditions",
  "refund-return-replacement-policy": "/refund-return-replacement-policy"
};

export const getPolicyPath = (slug) => POLICY_ROUTE_ALIASES[slug] || `/policies/${slug}`;

export const createPolicySlug = (value = "") =>
  String(value)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
