import PDFDocument from "pdfkit";
import {
  addBrandHeader,
  addFooter,
  colors,
  drawKeyValueGrid,
  drawStatusBadge,
  formatCurrency,
  formatDate
} from "./pdfTheme.js";

export const createPolicyPdf = (policy) =>
  new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 48, size: "A4" });
    const chunks = [];

    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    addBrandHeader(doc, {
      title: "Policy Certificate",
      subtitle: "Official car insurance coverage document with customer, vehicle, premium, and policy lifecycle details.",
      badge: policy.status || "policy"
    });

    drawStatusBadge(
      doc,
      policy.status,
      doc.page.width - 148,
      doc.y - 4,
      ["active", "approved"].includes(policy.status) ? "success" : policy.status === "pending" ? "warning" : "danger"
    );

    doc.fontSize(14).fillColor(colors.ink).text("Policy Summary", 48, doc.y);
    doc.moveDown(0.8);

    drawKeyValueGrid(doc, [
      { label: "Policy Number", value: policy.policyNumber },
      { label: "Policy Type", value: policy.type },
      { label: "Customer", value: policy.customer?.fullName || "N/A" },
      { label: "Vehicle", value: `${policy.vehicle?.make || ""} ${policy.vehicle?.model || ""}`.trim() || "N/A" },
      { label: "Registration", value: policy.vehicle?.registrationNumber || "N/A" },
      { label: "Premium Amount", value: formatCurrency(policy.premiumAmount) },
      { label: "Coverage Amount", value: formatCurrency(policy.coverageAmount) },
      { label: "Validity", value: `${formatDate(policy.startDate)} to ${formatDate(policy.endDate)}` }
    ]);

    doc.moveDown(0.6);
    doc.roundedRect(48, doc.y, doc.page.width - 96, 82, 10).fillAndStroke("#f5f3ff", "#ddd6fe");
    doc
      .fontSize(11)
      .fillColor(colors.primary)
      .text("Important Note", 64, doc.y + 16);
    doc
      .fontSize(10)
      .fillColor(colors.muted)
      .text(
        "This certificate is system-generated and should be verified against the policy records before claim settlement or renewal processing.",
        64,
        doc.y + 34,
        { width: doc.page.width - 128, lineGap: 3 }
      );

    addFooter(doc);

    doc.end();
  });

export const createQuotationPdf = (quote) =>
  new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 48, size: "A4" });
    const chunks = [];

    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    addBrandHeader(doc, {
      title: "Insurance Quotation",
      subtitle: "Estimated premium quotation before policy creation.",
      badge: "quote"
    });

    doc.fontSize(14).fillColor(colors.ink).text("Quotation Summary", 48, doc.y);
    doc.moveDown(0.8);

    drawKeyValueGrid(doc, [
      { label: "Customer", value: quote.customer?.fullName || quote.customerName || "Prospect" },
      { label: "Vehicle Type", value: quote.vehicleType },
      { label: "Vehicle Value", value: formatCurrency(quote.vehicleValue) },
      { label: "Vehicle Age", value: `${quote.vehicleAge || 0} years` },
      { label: "Coverage Type", value: quote.coverageType },
      { label: "Claim History", value: quote.claimHistory || 0 },
      { label: "Estimated Premium", value: formatCurrency(quote.premiumAmount) },
      { label: "Estimated Coverage", value: formatCurrency(quote.coverageAmount) }
    ]);

    doc.moveDown(0.6);
    doc.fontSize(10).fillColor(colors.muted).text(
      "This quotation is indicative and subject to underwriting approval, vehicle inspection, document verification, and policy terms.",
      { lineGap: 3 }
    );

    addFooter(doc);
    doc.end();
  });
