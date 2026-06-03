const JEWELLERY_CATEGORY = "Imitation Jewellery";

const SECTION_CONFIG = {
  SAREE: {
    key: "SAREE",
    label: "Saree",
    fileSuffix: "saree",
    invoiceSheetName: "SAREE",
    saleSheetName: "SAREE SALE ",
    hsnCode: "5407",
    taxRate: 0.05,
    defaultWeightKg: 0.3,
    defaultDimensions: "25x20x10 cm"
  },
  JEWELLERY: {
    key: "JEWELLERY",
    label: "Jewellery",
    fileSuffix: "jewellery",
    invoiceSheetName: "JWELLERY",
    saleSheetName: "JWELLARY SALE",
    hsnCode: "7117",
    taxRate: 0.03,
    defaultWeightKg: 0.1,
    defaultDimensions: "12x10x4 cm"
  }
};

const normalizeCategory = (value = "") => String(value || "").trim().toLowerCase();

export const resolveDocumentSectionKey = (category = "") =>
  normalizeCategory(category) === normalizeCategory(JEWELLERY_CATEGORY) ? "JEWELLERY" : "SAREE";

export const getDocumentSectionConfig = (category = "") => SECTION_CONFIG[resolveDocumentSectionKey(category)];

export const resolveOrderItemCategory = (item = {}) => item.category || item.product?.category || "";

export const buildOrderSections = (order) => {
  const sections = new Map();

  for (const item of order.items || []) {
    const config = getDocumentSectionConfig(resolveOrderItemCategory(item));
    const existing = sections.get(config.key) || {
      key: config.key,
      config,
      items: [],
      subtotal: 0,
      quantity: 0
    };

    existing.items.push(item);
    existing.subtotal += Number(item.price || 0) * Number(item.qty || 0);
    existing.quantity += Number(item.qty || 0);
    sections.set(config.key, existing);
  }

  return [...sections.values()];
};

export const buildSectionInvoiceNumber = (order, sectionKey, totalSections = 1) => {
  const base = order.invoiceNumber || String(order._id || "");
  if (totalSections <= 1) {
    return base;
  }

  const suffix = SECTION_CONFIG[sectionKey]?.fileSuffix?.toUpperCase() || sectionKey;
  return `${base}-${suffix}`;
};

export const formatCompactDate = (date, separator = ".") => {
  const value = new Date(date);
  const day = String(value.getDate()).padStart(2, "0");
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const year = value.getFullYear();
  return [day, month, year].join(separator);
};

export const formatInrAmount = (value) =>
  new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(Number(value || 0));

export const toUpperSafe = (value = "") => String(value || "").trim().toUpperCase();

export { JEWELLERY_CATEGORY, SECTION_CONFIG };
