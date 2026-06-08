const defaultProductImage = "https://placehold.co/900x1200/f2e8dc/6f4b3e?text=Ornac";

export const JEWELLERY_CATEGORY = "Imitation Jewellery";

export const categoryOptions = ["Silk", "Paithani", "Cotton", "Wedding Sarees", JEWELLERY_CATEGORY];

export const sortOptions = [
  { label: "Newest first", value: "newest" },
  { label: "Price: Low to High", value: "priceAsc" },
  { label: "Price: High to Low", value: "priceDesc" },
  { label: "Trending", value: "trending" },
  { label: "Bestselling", value: "bestselling" }
];

export const defaultShopFilters = {
  searchQuery: "",
  category: "",
  fabric: "",
  color: "",
  minPrice: "",
  maxPrice: "",
  sort: "newest",
  isNewArrival: ""
};

export const cleanFilters = (filters) =>
  Object.fromEntries(
    Object.entries(filters).filter(([, value]) => value !== "" && value !== null && value !== undefined)
  );

export const mergeCategories = (categories = []) =>
  Array.from(new Set([...categoryOptions, ...categories.filter(Boolean)])).sort((left, right) =>
    categoryOptions.indexOf(left) !== -1 && categoryOptions.indexOf(right) !== -1
      ? categoryOptions.indexOf(left) - categoryOptions.indexOf(right)
      : left.localeCompare(right)
  );

export const formatCurrency = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(Number(value || 0));

export const getProductImage = (product, selectedColor = "") => {
  const selectedVariant = Array.isArray(product?.variants)
    ? product.variants.find(
        (variant) => String(variant.color || "").toLowerCase() === String(selectedColor || "").toLowerCase()
      )
    : null;

  return selectedVariant?.images?.[0]?.url || product?.images?.[0]?.url || defaultProductImage;
};

export const getProductColors = (product) => {
  const colors = Array.isArray(product?.colors) ? product.colors.filter(Boolean) : [];
  if (colors.length) return colors;
  return product?.color ? [product.color] : [];
};

export const isJewelleryCategory = (category = "") =>
  String(category).trim().toLowerCase() === JEWELLERY_CATEGORY.toLowerCase();

export const getProductTypeLabel = (productOrCategory) =>
  isJewelleryCategory(typeof productOrCategory === "string" ? productOrCategory : productOrCategory?.category)
    ? "Jewellery"
    : "Saree";
