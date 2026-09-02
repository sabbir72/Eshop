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
  doc.rect(0, 0, 210, 38, "F");

  // Top Accent Line (Royal Blue)
  doc.setFillColor(37, 99, 235);
  doc.rect(0, 0, 210, 3, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text("SMART E-COMMERCE", 15, 18);

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text("Official Invoice & Receipt | চালান ও রসিদ", 15, 25);
  doc.text("Level 12, Corporate Tower, Banani, Dhaka-1213 | BIN: 001928374-0101", 15, 31);

  // Document Metadata (Right aligned)
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text(`INVOICE #: ${order.orderNumber}`, 135, 16);
  
  doc.setFontSize(8.5);
  doc.setFont("helvetica", "normal");
  doc.text(`Date: ${order.createdAt}`, 135, 22);
  doc.text(`Status: ${order.orderStatus.toUpperCase()}`, 135, 27);
  doc.text(`Payment: ${order.paymentMethod} (${order.paymentStatus})`, 135, 32);

  // Customer & Shipping Info Grid
  let y = 48;

  // Customer Box
  doc.setFillColor(248, 250, 252); // Slate-50
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(15, y, 88, 38, 2, 2, "FD");

  doc.setTextColor(15, 23, 42);
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text("BILLED TO (CUSTOMER):", 19, y + 7);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.text(`Name: ${order.customerName}`, 19, y + 14);
  doc.text(`Phone: ${order.customerPhone}`, 19, y + 20);
  doc.text(`Email: ${order.customerEmail}`, 19, y + 26);

  // Shipping Box
  doc.roundedRect(107, y, 88, 38, 2, 2, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text("DELIVERY ADDRESS:", 111, y + 7);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  const fullAddress = `${order.shippingAddress.street}, ${order.shippingAddress.city} ${order.shippingAddress.postalCode}`;
  doc.text(`Address: ${fullAddress.substring(0, 38)}`, 111, y + 14);
  if (fullAddress.length > 38) {
    doc.text(fullAddress.substring(38, 76), 111, y + 19);
  }
  doc.text(`Tracking #: ${order.trackingNumber || order.orderNumber}`, 111, y + 26);
  doc.text(`Country: Bangladesh`, 111, y + 32);

  y += 46;

  // Items Table Header
  doc.setFillColor(15, 23, 42);
  doc.rect(15, y, 180, 8, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8.5);
  doc.setFont("helvetica", "bold");
  doc.text("Item / Description", 19, y + 5.5);
  doc.text("Qty", 115, y + 5.5);
  doc.text("Unit Price", 140, y + 5.5);
  doc.text("Total Amount", 170, y + 5.5);

  y += 10;

  // Table Body Rows
  doc.setTextColor(15, 23, 42);
  doc.setFont("helvetica", "normal");

  order.items.forEach((item, index) => {
    if (y > 250) {
      doc.addPage();
      y = 20;
    }

    // Alternating background
    if (index % 2 === 1) {
      doc.setFillColor(248, 250, 252);
      doc.rect(15, y - 4, 180, item.variantSummary ? 11 : 8, "F");
    }

    doc.setFont("helvetica", "bold");
    doc.text(item.productName.substring(0, 48), 19, y);
    
    if (item.variantSummary) {
      doc.setFontSize(7.5);
      doc.setTextColor(100, 116, 139);
      doc.setFont("helvetica", "normal");
      doc.text(`Variant: ${item.variantSummary}`, 19, y + 4);
      doc.setFontSize(8.5);
      doc.setTextColor(15, 23, 42);
    }

    doc.setFont("helvetica", "normal");
    doc.text(`${item.quantity}`, 117, y);
    doc.text(formatPdfCurrency(item.price, currencySymbol), 140, y);
    doc.setFont("helvetica", "bold");
    doc.text(formatPdfCurrency(item.total, currencySymbol), 170, y);

    y += item.variantSummary ? 12 : 8;
  });

  // Table Bottom Divider
  doc.setDrawColor(203, 213, 225);
  doc.line(15, y, 195, y);
  y += 6;

  // Summary & Breakdown Section
  doc.setFontSize(8.5);
  doc.setFont("helvetica", "normal");

  doc.text("Subtotal:", 135, y);
  doc.text(formatPdfCurrency(order.subtotal, currencySymbol), 170, y);
  y += 5.5;

  if (order.discount > 0) {
    doc.setTextColor(16, 185, 129); // Green
    doc.text(`Discount (${order.couponCode || "Promo"}):`, 135, y);
    doc.text(`-${formatPdfCurrency(order.discount, currencySymbol)}`, 170, y);
    doc.setTextColor(15, 23, 42);
    y += 5.5;
  }

  doc.text("Shipping Charge:", 135, y);
  doc.text(formatPdfCurrency(order.shippingCharge, currencySymbol), 170, y);
  y += 5.5;

  doc.text(`Tax / VAT (${order.tax ? "5%" : "0%"}):`, 135, y);
  doc.text(formatPdfCurrency(order.tax, currencySymbol), 170, y);
  y += 7;

  // Grand Total Box
  doc.setFillColor(239, 246, 255); // Light Blue
  doc.setDrawColor(59, 130, 246);
  doc.roundedRect(128, y - 4, 67, 10, 1, 1, "FD");

  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(29, 78, 216);
  doc.text("Grand Total:", 132, y + 2);
  doc.text(formatPdfCurrency(order.total, currencySymbol), 168, y + 2);

  y += 22;

  // Signatures Section
  if (y < 260) {
    doc.setDrawColor(203, 213, 225);
    doc.line(20, y, 70, y);
    doc.line(140, y, 190, y);

    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 116, 139);
    doc.text("Prepared / Customer Signature", 20, y + 4);
    doc.text("Authorized Representative Seal", 140, y + 4);
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

