import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import JSZip from "jszip";
import PizZip from "pizzip";
import {
  buildOrderSections,
  buildSectionInvoiceNumber,
  formatCompactDate,
  formatInrAmount,
  toUpperSafe
} from "../utils/orderDocumentUtils.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DOCX_TEMPLATE_PATH = path.join(__dirname, "..", "templates", "Courier_Slip_ORNAQ.docx");

const escapeXml = (value = "") =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

const replaceAll = (value, search, replacement) => value.split(search).join(replacement);

const formatDocCurrency = (value) => `Rs.${formatInrAmount(value)}`;

const buildAddressLines = (order) => {
  const shipping = order.shippingAddress || {};
  const line1Parts = [shipping.line1, shipping.line2].filter(Boolean).map(toUpperSafe);
  const line2Parts = [shipping.city, shipping.state].filter(Boolean).map(toUpperSafe);
  const pincode = shipping.pincode ? `PINCODE - ${shipping.pincode}` : "";

  return {
    name: `NAME  -   ${toUpperSafe(shipping.name || order.userId?.name || "CUSTOMER")}`,
    addressLine1: `SHIPING ADDRESS -  ${line1Parts.join(", ") || "NA"}  `,
    addressLine2: `${[...line2Parts, pincode].filter(Boolean).join(", ") || "NA"}  `,
    phone: `MOBILE NUMBER: ${shipping.phone || order.userId?.phone || "NA"}`,
    email: `EMAIL ADDRESS : ${order.userId?.email || "NA"}`
  };
};

const buildAwbLabel = (order, sectionInvoiceNumber) =>
  `AWB / TRACKING NO. : ${order.awbNumber || order.trackingNumber || sectionInvoiceNumber}`;

const buildOrderIdLabel = (order) => `ORDER ID : ${String(order._id || "").slice(-8).toUpperCase()}`;

const buildBarcodeLine = (sectionInvoiceNumber) => `                                    | ORNAQ ${sectionInvoiceNumber} |`;

const buildWeightText = (baseWeightKg, qty) => `${(Number(baseWeightKg || 0) * Math.max(1, Number(qty || 1))).toFixed(1)} kg`;

const buildDocItemRowsXml = (xml, section) => {
  const templateRowMatch = xml.match(/<w:tr[\s\S]*?WEP-BLK-01[\s\S]*?Rs\.1,299[\s\S]*?<\/w:tr>/);
  if (!templateRowMatch) {
    return xml;
  }

  const rowTemplate = templateRowMatch[0];
  const rows = section.items.map((item) => {
    let rowXml = rowTemplate;
    rowXml = replaceAll(rowXml, "WEP-BLK-01", escapeXml(item.sku || item.product?._id || "NA"));
    rowXml = replaceAll(rowXml, "FANCY SAREE", escapeXml(toUpperSafe(item.name || "PRODUCT")));
    rowXml = replaceAll(rowXml, ">1</w:t>", `>${escapeXml(String(item.qty || 1))}</w:t>`);
    rowXml = replaceAll(rowXml, "0.3 kg", escapeXml(buildWeightText(section.config.defaultWeightKg, item.qty)));
    rowXml = replaceAll(rowXml, ">1</w:t>", `>${escapeXml(String(item.qty || 1))}</w:t>`);
    rowXml = replaceAll(
      rowXml,
      "Rs.1,299",
      escapeXml(formatDocCurrency(Number(item.price || 0) * Number(item.qty || 0)))
    );
    return rowXml;
  });

  return xml.replace(rowTemplate, rows.join(""));
};

const buildDocXml = (templateXml, order, section, totalSections) => {
  const sectionInvoiceNumber = buildSectionInvoiceNumber(order, section.key, totalSections);
  const address = buildAddressLines(order);
  let xml = templateXml;

  xml = replaceAll(xml, "AWB / TRACKING NO.", escapeXml(buildAwbLabel(order, sectionInvoiceNumber)));
  xml = replaceAll(xml, "ORDER ID", escapeXml(buildOrderIdLabel(order)));
  xml = replaceAll(xml, "Date: ", escapeXml(`Date: ${formatCompactDate(order.createdAt, "/")} `));
  xml = replaceAll(xml, "| ORNAQ 1234567890 |", escapeXml(buildBarcodeLine(sectionInvoiceNumber)));
  xml = replaceAll(xml, "NAME  -   SUDAM TULSHIDAS RAVALE", escapeXml(address.name));
  xml = replaceAll(xml, "SHIPING ADDRESS -  YASHWANT, JIJAUNAGAR,  ", escapeXml(address.addressLine1));
  xml = replaceAll(xml, "NAGAR - KALYAN ROAD, AHILYNAGAR, PINCODE - 414001  ", escapeXml(address.addressLine2));
  xml = replaceAll(xml, "MOBILE NUMBER: 9860536598", escapeXml(address.phone));
  xml = replaceAll(xml, "EMAIL ADDRESS : ravalesudam@gmail.com", escapeXml(address.email));
  xml = replaceAll(xml, "TRACON", escapeXml("TRACON"));
  xml = replaceAll(xml, "STANDARD", escapeXml("STANDARD"));
  xml = replaceAll(xml, "25×20×10 cm", escapeXml(section.config.defaultDimensions));
  xml = replaceAll(xml, "25Ã—20Ã—10 cm", escapeXml(section.config.defaultDimensions));
  xml = replaceAll(xml, "01/06/2026", escapeXml(formatCompactDate(order.createdAt, "/")));
  xml = buildDocItemRowsXml(xml, section);

  return xml;
};

const generateSectionDocxBuffer = async (order, section, totalSections) => {
  const templateBuffer = await fs.readFile(DOCX_TEMPLATE_PATH);
  const zip = new PizZip(templateBuffer);
  const templateXml = zip.file("word/document.xml").asText();
  const xml = buildDocXml(templateXml, order, section, totalSections);
  zip.file("word/document.xml", xml);
  return zip.generate({ type: "nodebuffer" });
};

export const generateInvoiceBuffer = async (order) => {
  const sections = buildOrderSections(order);
  if (!sections.length) {
    return {
      buffer: Buffer.from(""),
      fileName: `${order.invoiceNumber || order._id}.docx`,
      contentType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    };
  }

  if (sections.length === 1) {
    const [section] = sections;
    return {
      buffer: await generateSectionDocxBuffer(order, section, 1),
      fileName: `${buildSectionInvoiceNumber(order, section.key, 1)}.docx`,
      contentType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    };
  }

  const zip = new JSZip();
  for (const section of sections) {
    const fileName = `${buildSectionInvoiceNumber(order, section.key, sections.length)}.docx`;
    zip.file(fileName, await generateSectionDocxBuffer(order, section, sections.length));
  }

  return {
    buffer: await zip.generateAsync({ type: "nodebuffer" }),
    fileName: `${order.invoiceNumber || order._id}-documents.zip`,
    contentType: "application/zip"
  };
};
