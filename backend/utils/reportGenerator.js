import PDFDocument from "pdfkit";
import { addBrandHeader, addFooter, colors } from "./pdfTheme.js";

export const createReportPdf = ({ title, subtitle, cards = [], rows = [] }) =>
  new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 48, size: "A4" });
    const chunks = [];

    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    addBrandHeader(doc, {
      title,
      subtitle: subtitle || "Operational report generated from AutoSure insurance records.",
      badge: "report"
    });

    const cardWidth = 150;
    const cardGap = 14;
    const startX = 48;
    const startY = doc.y;
    cards.slice(0, 6).forEach((card, index) => {
      const col = index % 3;
      const row = Math.floor(index / 3);
      const x = startX + col * (cardWidth + cardGap);
      const y = startY + row * 66;
      doc.roundedRect(x, y, cardWidth, 50, 8).fillAndStroke(colors.panel, colors.line);
      doc.fontSize(8).fillColor(colors.muted).text(String(card.label).toUpperCase(), x + 12, y + 10, {
        width: cardWidth - 24
      });
      doc.fontSize(17).fillColor(colors.primary).text(String(card.value), x + 12, y + 25, {
        width: cardWidth - 24
      });
    });

    doc.y = startY + Math.ceil(Math.min(cards.length, 6) / 3) * 66 + 12;
    doc.fontSize(14).fillColor(colors.ink).text("Report Records", 48, doc.y);
    doc.moveDown(0.6);

    rows.forEach((row, index) => {
      if (doc.y > 704) {
        addFooter(doc);
        doc.addPage();
      }

      const y = doc.y;
      doc.roundedRect(48, y, doc.page.width - 96, row.description ? 52 : 38, 8).fillAndStroke("#ffffff", colors.line);
      doc.fontSize(8).fillColor(colors.primary).text(`#${index + 1}`, 64, y + 12, { width: 42 });
      doc
        .fontSize(10)
        .fillColor(colors.ink)
        .text(row.title || row.label || "Record", 104, y + 10, { width: doc.page.width - 168 });
      if (row.description) {
        doc.fontSize(9).fillColor(colors.muted).text(row.description, 104, y + 27, {
          width: doc.page.width - 168
        });
      }
      doc.y = y + (row.description ? 62 : 48);
    });

    addFooter(doc);
    doc.end();
  });
