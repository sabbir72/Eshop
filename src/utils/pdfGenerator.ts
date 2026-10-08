import jsPDF from "jspdf";
import { Order, Product, SalesReportData } from "../types";

// Helper to ensure currency symbol doesn't corrupt into 'ó' in jsPDF standard fonts
const formatPdfCurrency = (amount: number, symbol: string = "৳"): string => {
  const cleanSymbol = (!symbol || symbol === "৳" || symbol.includes("৳")) ? "Tk " : `${symbol} `;
  return `${cleanSymbol}${amount.toLocaleString()}`;
};

export function generateInvoicePDF(order: Order, currencySymbol: string = "৳") {
  const doc = new jsPDF();

  // Premium Header Banner (Deep Slate Navy)
  doc.setFillColor(15, 23, 42); // Slate-900
  doc.rect(0, 0, 210, 36, "F");

  // Top Accent Line (Royal Blue)
  doc.setFillColor(37, 99, 235);
  doc.rect(0, 0, 210, 3, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("SMART E-COMMERCE", 15, 17);

  doc.setFontSize(8.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(203, 213, 225);
  doc.text("Official Invoice & Cash Memo | Customer Tax Invoice", 15, 23.5);
  doc.text("Level 12, Corporate Tower, Banani, Dhaka-1213 | BIN: 001928374-0101", 15, 29.5);

  // Document Metadata (Right aligned)
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text(`INVOICE #: ${order.orderNumber}`, 135, 15);

  doc.setFontSize(8.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(203, 213, 225);
  doc.text(`Date: ${order.createdAt}`, 135, 21);
  doc.text(`Status: ${order.orderStatus.toUpperCase()}`, 135, 26);
  doc.text(`Payment: ${order.paymentMethod} (${order.paymentStatus})`, 135, 31);

  // Customer & Shipping Info Grid
  const cardY = 44;
  const cardHeight = 34;

  // Customer Box
  doc.setFillColor(248, 250, 252); // Slate-50
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(15, cardY, 88, cardHeight, 2, 2, "FD");

  doc.setTextColor(15, 23, 42);
  doc.setFontSize(8.5);
  doc.setFont("helvetica", "bold");
  doc.text("BILLED TO (CUSTOMER):", 19, cardY + 6.5);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(51, 65, 85);
  doc.text(`Name: ${order.customerName}`, 19, cardY + 13);
  doc.text(`Phone: ${order.customerPhone}`, 19, cardY + 19);
  doc.text(`Email: ${order.customerEmail}`, 19, cardY + 25);

  // Shipping Box
  doc.setFillColor(248, 250, 252); // Slate-50
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(107, cardY, 88, cardHeight, 2, 2, "FD");

  doc.setTextColor(15, 23, 42);
  doc.setFontSize(8.5);
  doc.setFont("helvetica", "bold");
  doc.text("DELIVERY ADDRESS:", 111, cardY + 6.5);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(51, 65, 85);
  const fullAddress = `${order.shippingAddress.street}, ${order.shippingAddress.city} ${order.shippingAddress.postalCode}`;
  doc.text(`Address: ${fullAddress.substring(0, 36)}`, 111, cardY + 13);
  if (fullAddress.length > 36) {
    doc.text(fullAddress.substring(36, 72), 111, cardY + 18);
  }
  doc.text(`Tracking #: ${order.trackingNumber || order.orderNumber}`, 111, cardY + 25);

  // Items Table Header
  const tableHeaderY = cardY + cardHeight + 8; // 44 + 34 + 8 = 86
  const headerHeight = 9;

  doc.setFillColor(15, 23, 42);
  doc.rect(15, tableHeaderY, 180, headerHeight, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8.5);
  doc.setFont("helvetica", "bold");
  doc.text("Item / Description", 19, tableHeaderY + 6.2);
  doc.text("Qty", 115, tableHeaderY + 6.2);
  doc.text("Unit Price", 142, tableHeaderY + 6.2);
  doc.text("Total Amount", 170, tableHeaderY + 6.2);

  // Table Body Rows (Strict non-overlapping row-by-row layout)
  let currentY = tableHeaderY + headerHeight;

  order.items.forEach((item, index) => {
    const rowHeight = item.variantSummary ? 14 : 9.5;

    if (currentY + rowHeight > 250) {
      doc.addPage();
      currentY = 20;
    }

    // Row Background (Zebra Striping)
    if (index % 2 === 1) {
      doc.setFillColor(248, 250, 252);
    } else {
      doc.setFillColor(255, 255, 255);
    }
    doc.rect(15, currentY, 180, rowHeight, "F");

    // Row subtle divider line
    doc.setDrawColor(241, 245, 249);
    doc.line(15, currentY + rowHeight, 195, currentY + rowHeight);

    // Text Baseline: placed comfortably inside row (with ~6mm top padding)
    const textBaseline = currentY + 6.2;

    doc.setTextColor(15, 23, 42);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.text(item.productName.substring(0, 48), 19, textBaseline);

    if (item.variantSummary) {
      doc.setFontSize(7.5);
      doc.setTextColor(100, 116, 139);
      doc.setFont("helvetica", "normal");
      doc.text(`Variant: ${item.variantSummary}`, 19, textBaseline + 4.8);
      doc.setFontSize(8.5);
      doc.setTextColor(15, 23, 42);
    }

    doc.setFont("helvetica", "normal");
    doc.text(`${item.quantity}`, 117, textBaseline);
    doc.text(formatPdfCurrency(item.price, currencySymbol), 142, textBaseline);
    doc.setFont("helvetica", "bold");
    doc.text(formatPdfCurrency(item.total, currencySymbol), 170, textBaseline);

    currentY += rowHeight;
  });

  // Table Bottom Closing Line
  doc.setDrawColor(203, 213, 225);
  doc.line(15, currentY, 195, currentY);

  // Summary & Breakdown Section
  let sumY = currentY + 7;

  doc.setFontSize(8.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(51, 65, 85);

  doc.text("Subtotal:", 135, sumY);
  doc.text(formatPdfCurrency(order.subtotal, currencySymbol), 170, sumY);
  sumY += 5.5;

  if (order.discount > 0) {
    doc.setTextColor(16, 185, 129); // Green
    doc.text(`Discount (${order.couponCode || "Promo"}):`, 135, sumY);
    doc.text(`-${formatPdfCurrency(order.discount, currencySymbol)}`, 170, sumY);
    doc.setTextColor(51, 65, 85);
    sumY += 5.5;
  }

  doc.text("Shipping Charge:", 135, sumY);
  doc.text(formatPdfCurrency(order.shippingCharge, currencySymbol), 170, sumY);
  sumY += 5.5;

  doc.text(`Tax / VAT (${order.tax ? "5%" : "0%"}):`, 135, sumY);
  doc.text(formatPdfCurrency(order.tax, currencySymbol), 170, sumY);
  sumY += 6.5;

  // Grand Total Box
  doc.setFillColor(239, 246, 255); // Light Blue
  doc.setDrawColor(59, 130, 246);
  doc.roundedRect(128, sumY - 4, 67, 10, 1.5, 1.5, "FD");

  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(29, 78, 216);
  doc.text("Grand Total:", 132, sumY + 2.5);
  doc.text(formatPdfCurrency(order.total, currencySymbol), 168, sumY + 2.5);

  sumY += 20;

  // Signatures Section
  if (sumY < 265) {
    doc.setDrawColor(203, 213, 225);
    doc.line(20, sumY, 75, sumY);
    doc.line(135, sumY, 190, sumY);

    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 116, 139);
    doc.text("Prepared / Customer Signature", 20, sumY + 4.5);
    doc.text("Authorized Representative Seal", 135, sumY + 4.5);
  }

  // Footer Note
  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184);
  doc.text("Thank you for shopping with Smart E-Commerce! | Customer Care: +880 1700-000000 | www.smartecom.com", 15, 282);
  doc.text("7-Day Return Policy Applicable. Computer generated official receipt requires no wet stamp.", 15, 286);

  doc.save(`Invoice_${order.orderNumber}.pdf`);
}

export function generateReportPDF(
  title: string,
  headers: string[],
  rows: string[][],
  summaryText?: string
) {
  const doc = new jsPDF();

  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, 210, 25, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text(`SMART E-COMMERCE - ${title.toUpperCase()}`, 15, 16);

  doc.setTextColor(15, 23, 42);
  doc.setFontSize(8.5);
  doc.setFont("helvetica", "normal");
  doc.text(`Generated on: ${new Date().toLocaleString()}`, 15, 31);

  if (summaryText) {
    doc.setFontSize(9);
    doc.text(summaryText, 15, 37);
  }

  let y = summaryText ? 46 : 38;

  // Headers
  doc.setFillColor(241, 245, 249);
  doc.rect(15, y, 180, 8, "F");
  doc.setFontSize(8.5);
  doc.setFont("helvetica", "bold");

  const colWidth = 180 / Math.max(headers.length, 1);
  headers.forEach((h, idx) => {
    doc.text(h, 17 + idx * colWidth, y + 5.5);
  });

  y += 12;

  doc.setFont("helvetica", "normal");
  rows.forEach((row, rIdx) => {
    if (y > 270) {
      doc.addPage();
      y = 20;
    }
    row.forEach((cell, idx) => {
      // Clean any raw ৳ in report output as well
      const cleanCell = String(cell).replace(/৳/g, "Tk ");
      doc.text(cleanCell.substring(0, 25), 17 + idx * colWidth, y);
    });
    y += 7;
  });

  doc.save(`${title.toLowerCase().replace(/\s+/g, "_")}_report.pdf`);
}

