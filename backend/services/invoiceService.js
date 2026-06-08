import PDFDocument from "pdfkit";
import {
  getDocumentSectionConfig,
  formatCompactDate,
  formatInrAmount,
  toUpperSafe
} from "../utils/orderDocumentUtils.js";

const buildAddressLines = (order) => {
  const shipping = order.shippingAddress || {};
  const line1Parts = [shipping.line1, shipping.line2].filter(Boolean).map(toUpperSafe);
  const line2Parts = [shipping.city, shipping.state].filter(Boolean).map(toUpperSafe);
  const pincode = shipping.pincode ? `PINCODE - ${shipping.pincode}` : "";

  return {
    name: shipping.name || order.userId?.name || "Customer",
    addressLine1: line1Parts.join(", ") || "NA",
    addressLine2: [...line2Parts, pincode].filter(Boolean).join(", ") || "NA",
    phone: shipping.phone || order.userId?.phone || "NA",
    email: order.userId?.email || "NA"
  };
};

const buildAwbLabel = (order) => order.awbNumber || order.trackingNumber || order.invoiceNumber || buildOrderIdLabel(order);

const buildOrderIdLabel = (order) => String(order._id || "").slice(-8).toUpperCase();

const buildWeightText = (item) => {
  const config = getDocumentSectionConfig(item.category || item.product?.category);
  return `${(Number(config?.defaultWeightKg || 0) * Math.max(1, Number(item.qty || 1))).toFixed(1)} kg`;
};

const formatDocCurrency = (value) => `Rs.${formatInrAmount(value)}`;

const ORNAQ_DETAILS = {
  title: "ORNAQ",
  addressLine1: "SUDAMA BUILDING, S.R.NO.8, PLOT NO. 58, SHIRKUSHHANAGAR,",
  addressLine2: "AHILYANAGAR - KALYAN ROAD, AHILYANAGAR, PIN-414001",
  contact: "MAHARASHTRA. MOBILE: 9828273195, EMAIL: ornaq@gmail.com",
  gst: "GSTIN/UIN : 27AABPR3020X1ZK",
  website: "WEBSITE : https://ornaq.in",
  state: "STATE NAME : MAHARASTRA, CODE : 27"
};

const drawInvoiceCopy = (doc, order, topY, copyLabel) => {
  const pageWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;
  const left = doc.page.margins.left;
  const right = left + pageWidth;
  const customer = buildAddressLines(order);
  const createdAt = formatCompactDate(order.createdAt, "/");
  const awbNumber = buildAwbLabel(order);
  const orderId = buildOrderIdLabel(order);
  const boxHeight = 108;
  const columnGap = 16;
  const boxWidth = (pageWidth - columnGap) / 2;

  doc.font("Helvetica-Bold").fontSize(10).text(copyLabel.toUpperCase(), right - 140, topY);
  doc.fontSize(10).text("AWB / TRACKING NO. : ", left, topY + 18, { continued: true });
  doc.font("Helvetica").text(awbNumber);
  doc.font("Helvetica-Bold").text("ORDER ID : ", left, topY + 36, { continued: true });
  doc.font("Helvetica").text(orderId);
  doc.font("Helvetica-Bold").text("Date: ", left, topY + 54, { continued: true });
  doc.font("Helvetica").text(createdAt);

  const boxTop = topY + 72;

  doc.lineWidth(0.8).rect(left, boxTop, boxWidth, boxHeight).stroke();
  doc.rect(left + boxWidth + columnGap, boxTop, boxWidth, boxHeight).stroke();

  doc.font("Helvetica-Bold").fontSize(10).text("SHIP TO", left + 6, boxTop + 6);
  doc.font("Helvetica").fontSize(9).text(`NAME - ${customer.name}`, left + 6, boxTop + 20, { width: boxWidth - 12 });
  doc.text(`SHIPPING ADDRESS - ${customer.addressLine1}`, { width: boxWidth - 12 });
  doc.text(`${customer.addressLine2}`, { width: boxWidth - 12 });
  doc.text(`MOBILE NUMBER: ${customer.phone}`, { width: boxWidth - 12 });
  doc.text(`EMAIL ADDRESS : ${customer.email}`, { width: boxWidth - 12 });

  const rightBoxLeft = left + boxWidth + columnGap;
  doc.font("Helvetica-Bold").fontSize(10).text("RETURN / FROM", rightBoxLeft + 6, boxTop + 6);
  doc.font("Helvetica-Bold").fontSize(10).text(ORNAQ_DETAILS.title, rightBoxLeft + 6, boxTop + 20);
  doc.font("Helvetica").fontSize(8).text(ORNAQ_DETAILS.addressLine1, rightBoxLeft + 6, boxTop + 34, { width: boxWidth - 12 });
  doc.text(ORNAQ_DETAILS.addressLine2, { width: boxWidth - 12 });
  doc.text(ORNAQ_DETAILS.contact, { width: boxWidth - 12 });
  doc.text(ORNAQ_DETAILS.gst, { width: boxWidth - 12 });
  doc.text(ORNAQ_DETAILS.website, { width: boxWidth - 12 });
  doc.text(ORNAQ_DETAILS.state, { width: boxWidth - 12 });

  const tableTop = boxTop + boxHeight + 18;
  const headers = ["SKU", "PRODUCT DESCRIPTION", "QTY", "WT.", "PIECES", "VALUE"];
  const columnWidths = [70, 190, 40, 50, 50, 100];
  const headerHeight = 18;

  doc.font("Helvetica-Bold").fontSize(9);
  let x = left;
  headers.forEach((header, index) => {
    doc.text(header, x + 4, tableTop + 4, { width: columnWidths[index] - 8, align: index === 1 ? "left" : "right" });
    x += columnWidths[index];
  });

  doc.lineWidth(0.5).moveTo(left, tableTop).lineTo(right, tableTop).stroke();
  doc.moveTo(left, tableTop + headerHeight).lineTo(right, tableTop + headerHeight).stroke();
  doc.moveTo(left, tableTop).lineTo(left, tableTop + headerHeight).stroke();
  x = left;
  columnWidths.forEach((width) => {
    x += width;
    doc.moveTo(x, tableTop).lineTo(x, tableTop + headerHeight).stroke();
  });

  let rowTop = tableTop + headerHeight;
  doc.font("Helvetica").fontSize(8);
  order.items.forEach((item) => {
    const sku = item.sku || item.product?._id || "NA";
    const name = toUpperSafe(item.name || item.product?.name || "PRODUCT");
    const qty = String(item.qty || 1);
    const weight = buildWeightText(item);
    const pieces = String(item.qty || 1);
    const value = formatDocCurrency(Number(item.price || 0) * Number(item.qty || 0));

    x = left;
    const values = [sku, name, qty, weight, pieces, value];
    values.forEach((valueText, index) => {
      doc.text(valueText, x + 4, rowTop + 4, { width: columnWidths[index] - 8, align: index === 1 ? "left" : "right" });
      x += columnWidths[index];
    });

    rowTop += headerHeight;
    doc.moveTo(left, rowTop).lineTo(right, rowTop).stroke();
  });

  const tableBottom = rowTop;
  doc.moveTo(left, tableTop).lineTo(left, tableBottom).stroke();
  x = left;
  columnWidths.forEach((width) => {
    x += width;
    doc.moveTo(x, tableTop).lineTo(x, tableBottom).stroke();
  });

  const footerTop = tableBottom + 12;
  doc.font("Helvetica-Bold").fontSize(9).text("COURIER PARTNER:", left, footerTop, { continued: true });
  doc.font("Helvetica").text("TRACON", { continued: true });
  doc.font("Helvetica-Bold").text("  SERVICE TYPE:", { continued: true });
  doc.font("Helvetica").text("STANDARD", { continued: true });
  doc.font("Helvetica-Bold").text("  DIMENSIONS:", { continued: true });
  doc.font("Helvetica").text("25x20x10 cm", { continued: true });
  doc.font("Helvetica-Bold").text("  SHIP DATE:", { continued: true });
  doc.font("Helvetica").text(createdAt);

  const totalTop = footerTop + 18;
  doc.font("Helvetica-Bold").fontSize(10).text(`ORDER TOTAL: ${formatDocCurrency(order.totalAmount || 0)}`, right - 180, totalTop, { width: 180, align: "right" });

  return totalTop + 24;
};

export const generateInvoiceBuffer = async (order) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margin: 40 });
    const chunks = [];

    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", (error) => reject(error));

    let nextY = drawInvoiceCopy(doc, order, 40, "Customer Copy");
    doc.moveTo(doc.page.margins.left, nextY).lineTo(doc.page.width - doc.page.margins.right, nextY).dash(3, { space: 2 }).stroke();
    doc.undash();
    nextY += 16;
    drawInvoiceCopy(doc, order, nextY, "Seller / Courier Copy");

    doc.end();
  }).then((buffer) => ({
    buffer,
    fileName: `${order.invoiceNumber || order._id}.pdf`,
    contentType: "application/pdf"
  }));
};
