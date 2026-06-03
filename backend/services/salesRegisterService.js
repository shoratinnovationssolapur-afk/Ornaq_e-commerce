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
const REGISTER_PATH = path.join(OUTPUT_DIR, "order-sales-register.xlsx");

const clone = (value) => (value == null ? value : structuredClone(value));

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
    return REGISTER_PATH;
  } catch {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(TEMPLATE_PATH);

    initializeJewellerySaleSheet(workbook);
    clearSaleRows(workbook.getWorksheet("SALE SHEET"), 5, 50, 11);
    clearSaleRows(workbook.getWorksheet("SAREE SALE "), 5, 50, 10);
    clearSaleRows(workbook.getWorksheet("JWELLARY SALE"), 5, 50, 10);

    await workbook.xlsx.writeFile(REGISTER_PATH);
    return REGISTER_PATH;
  }
};

const appendToOverallSaleSheet = (sheet, order, section, totalSections) => {
  const rowNumber = findNextRow(sheet);
  if (rowNumber > 19) {
    ensureSheetRowFormatting(sheet, 5, rowNumber, 11);
  }

  const taxValue = Number(section.subtotal || 0) * Number(section.config.taxRate || 0);
  const row = sheet.getRow(rowNumber);
  row.getCell("A").value = rowNumber - 4;
  row.getCell("B").value = formatCompactDate(order.createdAt, ".");
  row.getCell("C").value = buildSectionInvoiceNumber(order, section.key, totalSections);
  row.getCell("D").value = order.shippingAddress?.name || order.userId?.name || "Customer";
  row.getCell("E").value = section.config.hsnCode;
  row.getCell("F").value = section.quantity;
  row.getCell("G").value = "NA";
  row.getCell("H").value = Number(section.subtotal || 0);
  row.getCell("I").value = section.key === "SAREE" ? taxValue : 0;
  row.getCell("J").value = section.key === "JEWELLERY" ? taxValue : 0;
  row.getCell("K").value = Number(section.subtotal || 0) + taxValue;
};

const appendToCategorySaleSheet = (sheet, order, section, totalSections) => {
  const rowNumber = findNextRow(sheet);
  if (rowNumber > 19) {
    ensureSheetRowFormatting(sheet, 5, rowNumber, 10);
  }

  const taxValue = Number(section.subtotal || 0) * Number(section.config.taxRate || 0);
  const row = sheet.getRow(rowNumber);
  row.getCell("A").value = rowNumber - 4;
  row.getCell("B").value = formatCompactDate(order.createdAt, ".");
  row.getCell("C").value = buildSectionInvoiceNumber(order, section.key, totalSections);
  row.getCell("D").value = order.shippingAddress?.name || order.userId?.name || "Customer";
  row.getCell("E").value = section.config.hsnCode;
  row.getCell("F").value = section.quantity;
  row.getCell("G").value = "NA";
  row.getCell("H").value = Number(section.subtotal || 0);
  row.getCell("I").value = taxValue;
  row.getCell("J").value = Number(section.subtotal || 0) + taxValue;
};

export const appendOrderToSalesRegister = async (order) => {
  const sections = buildOrderSections(order);
  if (!sections.length) {
    return;
  }

  const registerPath = await ensureRegisterWorkbook();
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(registerPath);

  const overallSheet = workbook.getWorksheet("SALE SHEET");
  for (const section of sections) {
    appendToOverallSaleSheet(overallSheet, order, section, sections.length);
    appendToCategorySaleSheet(workbook.getWorksheet(section.config.saleSheetName), order, section, sections.length);
  }

  await workbook.xlsx.writeFile(registerPath);
};
