import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import ExcelJS from "exceljs";
import {
  buildOrderSections,
  buildSectionInvoiceNumber,
  formatCompactDate
} from "../utils/orderDocumentUtils.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const TEMPLATE_PATH = path.join(__dirname, "..", "templates", "invoice-two-template.xlsx");
const OUTPUT_DIR = path.join(__dirname, "..", "generated");
export const REGISTER_FILE_NAME = "order-sales-register.xlsx";
const REGISTER_PATH = path.join(OUTPUT_DIR, REGISTER_FILE_NAME);
const GSTIN_RATE = 0.08;
const PREVIEW_SHEETS = [
  {
    key: "overall",
    name: "SALE SHEET",
    totalColumns: 11,
    columns: [
      "Sr. No.",
      "Date",
      "Invoice No.",
      "Party Name",
      "HSN Code",
      "Pcs",
      "GSTIN 8%",
      "Basic Amount",
      "Tax 5% Amount",
      "Tax 3% Amount",
      "Total Amount"
    ]
  },
  {
    key: "saree",
    name: "SAREE SALE ",
    totalColumns: 10,
    columns: ["Sr. No.", "Date", "Invoice No.", "Party Name", "HSN Code", "Pcs", "GSTIN 8%", "Basic Amount", "Tax Amount", "Total Amount"]
  },
  {
    key: "jewellery",
    name: "JWELLARY SALE",
    totalColumns: 10,
    columns: ["Sr. No.", "Date", "Invoice No.", "Party Name", "HSN Code", "Pcs", "GSTIN 8%", "Basic Amount", "Tax Amount", "Total Amount"]
  }
];
const CATEGORY_SHEET_SETTINGS = [
  {
    name: "SAREE SALE ",
    hsnCode: "5407",
    taxRate: 0.05
  },
  {
    name: "JWELLARY SALE",
    hsnCode: "7117",
    taxRate: 0.03
  }
];

const clone = (value) => (value == null ? value : structuredClone(value));

const normalizeCellValue = (value) => {
  if (value == null) {
    return "";
  }

  if (value instanceof Date) {
    return formatCompactDate(value, ".");
  }

  if (typeof value === "object") {
    if ("result" in value && value.result != null) {
      return value.result;
    }

    if ("text" in value && value.text) {
      return value.text;
    }

    if (Array.isArray(value.richText)) {
      return value.richText.map((entry) => entry.text || "").join("");
    }

    return "";
  }

  return value;
};

const calculateRegisterAmounts = (basicAmount, taxRate) => {
  const basic = Number(basicAmount || 0);
  const gstinAmount = basic * GSTIN_RATE;
  const taxAmount = basic * Number(taxRate || 0);
  const totalAmount = basic + gstinAmount + taxAmount;

  return {
    basic,
    gstinAmount,
    taxAmount,
    totalAmount
  };
};

const applyAmountFormat = (cell) => {
  cell.numFmt = "0.00";
};

const copyCellFormatting = (sourceCell, targetCell) => {
  targetCell.style = clone(sourceCell.style) || {};
  targetCell.numFmt = sourceCell.numFmt;
  targetCell.alignment = clone(sourceCell.alignment);
  targetCell.border = clone(sourceCell.border);
  targetCell.fill = clone(sourceCell.fill);
  targetCell.font = clone(sourceCell.font);
  targetCell.protection = clone(sourceCell.protection);
};

const copySheetLayout = (sourceSheet, targetSheet, startRow = 2, endRow = 19, maxCol = 10) => {
  for (let rowNumber = startRow; rowNumber <= endRow; rowNumber += 1) {
    const sourceRow = sourceSheet.getRow(rowNumber);
    const targetRow = targetSheet.getRow(rowNumber);
    targetRow.height = sourceRow.height;

    for (let colNumber = 1; colNumber <= maxCol; colNumber += 1) {
      copyCellFormatting(sourceRow.getCell(colNumber), targetRow.getCell(colNumber));
      targetRow.getCell(colNumber).value = sourceRow.getCell(colNumber).value;
    }
  }
};

const clearSaleRows = (sheet, startRow, endRow, totalColumns) => {
  for (let rowNumber = startRow; rowNumber <= endRow; rowNumber += 1) {
    const row = sheet.getRow(rowNumber);
    for (let colNumber = 1; colNumber <= totalColumns; colNumber += 1) {
      row.getCell(colNumber).value = null;
    }
  }
};

const initializeJewellerySaleSheet = (workbook) => {
  const sareeSheet = workbook.getWorksheet("SAREE SALE ");
  const jewellerySheet = workbook.getWorksheet("JWELLARY SALE");
  if (!sareeSheet || !jewellerySheet || jewellerySheet.rowCount > 1) {
    return;
  }

  copySheetLayout(sareeSheet, jewellerySheet);
  jewellerySheet.mergeCells("A2:J3");
  jewellerySheet.getCell("A2").value = "JWELLARY SALE ";
  jewellerySheet.getCell("I4").value = "Tax 3%";
};

const ensureSheetRowFormatting = (sheet, sourceRowNumber, targetRowNumber, totalColumns) => {
  const sourceRow = sheet.getRow(sourceRowNumber);
  const targetRow = sheet.getRow(targetRowNumber);
  targetRow.height = sourceRow.height;

  for (let colNumber = 1; colNumber <= totalColumns; colNumber += 1) {
    copyCellFormatting(sourceRow.getCell(colNumber), targetRow.getCell(colNumber));
  }
};

const findNextRow = (sheet, invoiceColumn = "C", startRow = 5) => {
  let rowNumber = startRow;
  while (sheet.getCell(`${invoiceColumn}${rowNumber}`).value) {
    rowNumber += 1;
  }
  return rowNumber;
};

const ensureRegisterWorkbook = async () => {
  await fs.mkdir(OUTPUT_DIR, { recursive: true });

  try {
    await fs.access(REGISTER_PATH);
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(REGISTER_PATH);
    if (normalizeRegisterWorkbook(workbook)) {
      await workbook.xlsx.writeFile(REGISTER_PATH);
    }
    return REGISTER_PATH;
  } catch {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(TEMPLATE_PATH);

    initializeJewellerySaleSheet(workbook);
    clearSaleRows(workbook.getWorksheet("SALE SHEET"), 5, 50, 11);
    clearSaleRows(workbook.getWorksheet("SAREE SALE "), 5, 50, 10);
    clearSaleRows(workbook.getWorksheet("JWELLARY SALE"), 5, 50, 10);
    normalizeRegisterWorkbook(workbook);

    await workbook.xlsx.writeFile(REGISTER_PATH);
    return REGISTER_PATH;
  }
};

const getPreviewRows = (sheet, definition) => {
  const rows = [];
  let rowNumber = 5;

  while (normalizeCellValue(sheet.getCell(`C${rowNumber}`).value)) {
    const row = sheet.getRow(rowNumber);
    rows.push({
      id: `${definition.key}-${rowNumber}`,
      values: Array.from({ length: definition.totalColumns }, (_entry, index) =>
        normalizeCellValue(row.getCell(index + 1).value)
      )
    });
    rowNumber += 1;
  }

  return rows;
};

const normalizeOverallSheet = (sheet) => {
  if (!sheet) {
    return false;
  }

  let changed = false;

  for (let rowNumber = 5; rowNumber <= sheet.rowCount; rowNumber += 1) {
    const invoiceNumber = normalizeCellValue(sheet.getCell(`C${rowNumber}`).value);
    if (!invoiceNumber) {
      continue;
    }

    const row = sheet.getRow(rowNumber);
    const hsnCode = String(normalizeCellValue(row.getCell("E").value) || "");
    const settings = CATEGORY_SHEET_SETTINGS.find((entry) => entry.hsnCode === hsnCode) || CATEGORY_SHEET_SETTINGS[0];
    const { basic, gstinAmount, taxAmount, totalAmount } = calculateRegisterAmounts(
      normalizeCellValue(row.getCell("H").value),
      settings.taxRate
    );

    if (Number(normalizeCellValue(row.getCell("H").value) || 0) !== basic) {
      row.getCell("H").value = basic;
      changed = true;
    }
    applyAmountFormat(row.getCell("H"));

    if (String(normalizeCellValue(row.getCell("G").value) || "") !== String(gstinAmount)) {
      row.getCell("G").value = gstinAmount;
      changed = true;
    }
    applyAmountFormat(row.getCell("G"));

    const taxFiveAmount = settings.taxRate === 0.05 ? taxAmount : 0;
    const taxThreeAmount = settings.taxRate === 0.03 ? taxAmount : 0;

    if (Number(normalizeCellValue(row.getCell("I").value) || 0) !== taxFiveAmount) {
      row.getCell("I").value = taxFiveAmount;
      changed = true;
    }
    applyAmountFormat(row.getCell("I"));

    if (Number(normalizeCellValue(row.getCell("J").value) || 0) !== taxThreeAmount) {
      row.getCell("J").value = taxThreeAmount;
      changed = true;
    }
    applyAmountFormat(row.getCell("J"));

    if (Number(normalizeCellValue(row.getCell("K").value) || 0) !== totalAmount) {
      row.getCell("K").value = totalAmount;
      changed = true;
    }
    applyAmountFormat(row.getCell("K"));

    if (String(normalizeCellValue(row.getCell("E").value) || "") !== settings.hsnCode) {
      row.getCell("E").value = settings.hsnCode;
      changed = true;
    }
  }

  return changed;
};

const normalizeCategorySheet = (sheet, { hsnCode, taxRate }) => {
  if (!sheet) {
    return false;
  }

  let changed = false;

  for (let rowNumber = 5; rowNumber <= sheet.rowCount; rowNumber += 1) {
    const invoiceNumber = normalizeCellValue(sheet.getCell(`C${rowNumber}`).value);
    if (!invoiceNumber) {
      continue;
    }

    const row = sheet.getRow(rowNumber);
    const { basic, gstinAmount, taxAmount, totalAmount } = calculateRegisterAmounts(
      normalizeCellValue(row.getCell("H").value),
      taxRate
    );

    if (String(normalizeCellValue(row.getCell("E").value) || "") !== hsnCode) {
      row.getCell("E").value = hsnCode;
      changed = true;
    }

    if (Number(normalizeCellValue(row.getCell("G").value) || 0) !== gstinAmount) {
      row.getCell("G").value = gstinAmount;
      changed = true;
    }

    if (Number(normalizeCellValue(row.getCell("H").value) || 0) !== basic) {
      row.getCell("H").value = basic;
      changed = true;
    }
    applyAmountFormat(row.getCell("H"));

    if (Number(normalizeCellValue(row.getCell("I").value) || 0) !== taxAmount) {
      row.getCell("I").value = taxAmount;
      changed = true;
    }
    applyAmountFormat(row.getCell("G"));
    applyAmountFormat(row.getCell("I"));

    if (Number(normalizeCellValue(row.getCell("J").value) || 0) !== totalAmount) {
      row.getCell("J").value = totalAmount;
      changed = true;
    }
    applyAmountFormat(row.getCell("J"));
  }

  return changed;
};

const normalizeRegisterWorkbook = (workbook) =>
  CATEGORY_SHEET_SETTINGS.reduce((changed, settings) => {
    const sheet = workbook.getWorksheet(settings.name);
    return normalizeCategorySheet(sheet, settings) || changed;
  }, normalizeOverallSheet(workbook.getWorksheet("SALE SHEET")));

const appendToOverallSaleSheet = (sheet, order, section, totalSections) => {
  const rowNumber = findNextRow(sheet);
  if (rowNumber > 19) {
    ensureSheetRowFormatting(sheet, 5, rowNumber, 11);
  }

  const { basic, gstinAmount, taxAmount, totalAmount } = calculateRegisterAmounts(
    section.subtotal,
    section.config.taxRate
  );
  const row = sheet.getRow(rowNumber);
  row.getCell("A").value = rowNumber - 4;
  row.getCell("B").value = formatCompactDate(order.createdAt, ".");
  row.getCell("C").value = buildSectionInvoiceNumber(order, section.key, totalSections);
  row.getCell("D").value = order.shippingAddress?.name || order.userId?.name || "Customer";
  row.getCell("E").value = String(section.config.hsnCode);
  row.getCell("F").value = section.quantity;
  row.getCell("G").value = gstinAmount;
  row.getCell("H").value = basic;
  row.getCell("I").value = section.key === "SAREE" ? taxAmount : 0;
  row.getCell("J").value = section.key === "JEWELLERY" ? taxAmount : 0;
  row.getCell("K").value = totalAmount;
  applyAmountFormat(row.getCell("G"));
  applyAmountFormat(row.getCell("H"));
  applyAmountFormat(row.getCell("I"));
  applyAmountFormat(row.getCell("J"));
  applyAmountFormat(row.getCell("K"));
};

const appendToCategorySaleSheet = (sheet, order, section, totalSections) => {
  const rowNumber = findNextRow(sheet);
  if (rowNumber > 19) {
    ensureSheetRowFormatting(sheet, 5, rowNumber, 10);
  }

  const { basic, gstinAmount, taxAmount, totalAmount } = calculateRegisterAmounts(
    section.subtotal,
    section.config.taxRate
  );
  const row = sheet.getRow(rowNumber);
  row.getCell("A").value = rowNumber - 4;
  row.getCell("B").value = formatCompactDate(order.createdAt, ".");
  row.getCell("C").value = buildSectionInvoiceNumber(order, section.key, totalSections);
  row.getCell("D").value = order.shippingAddress?.name || order.userId?.name || "Customer";
  row.getCell("E").value = String(section.config.hsnCode);
  row.getCell("F").value = section.quantity;
  row.getCell("G").value = gstinAmount;
  row.getCell("H").value = basic;
  row.getCell("I").value = taxAmount;
  row.getCell("J").value = totalAmount;
  applyAmountFormat(row.getCell("G"));
  applyAmountFormat(row.getCell("H"));
  applyAmountFormat(row.getCell("I"));
  applyAmountFormat(row.getCell("J"));
};

export const appendOrderToSalesRegister = async (order) => {
  const sections = buildOrderSections(order);
  if (!sections.length) {
    return;
  }

  const registerPath = await ensureRegisterWorkbook();
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(registerPath);
  normalizeRegisterWorkbook(workbook);

  const overallSheet = workbook.getWorksheet("SALE SHEET");
  for (const section of sections) {
    appendToOverallSaleSheet(overallSheet, order, section, sections.length);
    appendToCategorySaleSheet(workbook.getWorksheet(section.config.saleSheetName), order, section, sections.length);
  }

  await workbook.xlsx.writeFile(registerPath);
};

export const shouldSyncOrderToSalesRegister = (order) => {
  if (!order || order.salesRegisterSyncedAt) {
    return false;
  }

  if (order.orderStatus === "PAYMENT_FAILED" || order.orderStatus === "CANCELLED") {
    return false;
  }

  return order.paymentMethod === "COD" || order.paymentStatus === "PAID";
};

export const syncOrderToSalesRegister = async (order) => {
  if (!shouldSyncOrderToSalesRegister(order)) {
    return false;
  }

  const payload = typeof order.toObject === "function" ? order.toObject() : order;
  await appendOrderToSalesRegister(payload);

  if (typeof order.save === "function") {
    order.salesRegisterSyncedAt = new Date();
    await order.save();
  }

  return true;
};

export const getSalesRegisterPath = async () => ensureRegisterWorkbook();

export const getSalesRegisterPreview = async () => {
  const registerPath = await ensureRegisterWorkbook();
  const [stats, workbook] = await Promise.all([fs.stat(registerPath), (async () => {
    const nextWorkbook = new ExcelJS.Workbook();
    await nextWorkbook.xlsx.readFile(registerPath);
    return nextWorkbook;
  })()]);

  const sheets = PREVIEW_SHEETS.map((definition) => {
    const sheet = workbook.getWorksheet(definition.name);
    const rows = sheet ? getPreviewRows(sheet, definition) : [];

    return {
      key: definition.key,
      name: definition.name.trim(),
      columns: definition.columns,
      rows,
      rowCount: rows.length
    };
  });

  return {
    fileName: REGISTER_FILE_NAME,
    updatedAt: stats.mtime.toISOString(),
    sheets
  };
};
