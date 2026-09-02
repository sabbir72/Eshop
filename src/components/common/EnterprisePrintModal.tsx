import React, { useState } from "react";
import { PrintableDocumentData, PrintSettings, PaperSize, PageOrientation, PrintMargin, DocumentWatermark } from "../../types/print";
import { PrintDocumentViewer } from "./PrintDocumentViewer";
import { useStore } from "../../context/StoreContext";
import {
  Printer,
  Download,
  FileSpreadsheet,
  Mail,
  Share2,
  X,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Sun,
  Moon,
  Settings,
  Check,
  History,
  FileText,
} from "lucide-react";
import jsPDF from "jspdf";

interface EnterprisePrintModalProps {
  data: PrintableDocumentData;
  isOpen: boolean;
  onClose: () => void;
}

export const EnterprisePrintModal: React.FC<EnterprisePrintModalProps> = ({
  data,
  isOpen,
  onClose,
}) => {
  const { currentUser, activeRole, addAuditLog } = useStore();

  const [printSettings, setPrintSettings] = useState<PrintSettings>({
    paperSize: "A4",
    orientation: "portrait",
    margin: "normal",
    showHeader: true,
    showFooter: true,
    showWatermark: true,
    showSignatures: true,
    watermarkText: data.watermark || data.status || "ORIGINAL",
    logoSize: "medium",
    copies: 1,
  });

  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [previewTheme, setPreviewTheme] = useState<"dark" | "light">("dark");
  const [printCount, setPrintCount] = useState<number>(1);
  const [reprintReason, setReprintReason] = useState<string>("");
  const [showReprintModal, setShowReprintModal] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handlePrint = () => {
    if (printCount > 1 && !reprintReason.trim()) {
      setShowReprintModal(true);
      return;
    }

    // Add Audit Log Entry
    addAuditLog(
      `Printed Document: ${data.documentTitle} (#${data.documentNumber})`,
      "Order",
      `Paper: ${printSettings.paperSize}, Count: ${printCount}, Reason: ${reprintReason || "Initial Print"}`
    );

    setPrintCount((prev) => prev + 1);

    // Trigger standard browser print window
    window.print();
    triggerToast("Print job dispatched to printer queue!");
  };

  // Download PDF
  const handleDownloadPDF = () => {
    const doc = new jsPDF({
      orientation: printSettings.orientation,
      unit: "mm",
      format: printSettings.paperSize === "A5" ? "a5" : "a4",
    });

    const title = data.documentTitle.toUpperCase();
    const rawCurrency = data.currencySymbol || "৳";
    const currency = (!rawCurrency || rawCurrency === "৳" || rawCurrency.includes("৳")) ? "Tk " : `${rawCurrency} `;

    // Header Background
    doc.setFillColor(15, 23, 42); // Slate-900
    doc.rect(0, 0, 210, 32, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text(title, 15, 18);

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text(`DOC #: ${data.documentNumber}`, 15, 25);
    doc.text(`Date: ${data.generatedDate} ${data.generatedTime}`, 140, 18);
    doc.text(`Status: ${data.status.toUpperCase()}`, 140, 25);

    // Billed To / Shipping Address
    let y = 42;
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");

    if (data.customerInfo) {
      doc.text("CUSTOMER DETAILS:", 15, y);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.text(`Name: ${data.customerInfo.name}`, 15, y + 6);
      doc.text(`Phone: ${data.customerInfo.phone}`, 15, y + 12);
      if (data.customerInfo.address) {
        doc.text(`Address: ${data.customerInfo.address}`, 15, y + 18);
      }
    }

    if (data.shippingInfo) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.text("SHIPPING DETAILS:", 110, y);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.text(`Recipient: ${data.shippingInfo.recipientName}`, 110, y + 6);
      doc.text(`Address: ${data.shippingInfo.address}`, 110, y + 12);
      if (data.shippingInfo.trackingNumber) {
        doc.text(`Tracking #: ${data.shippingInfo.trackingNumber}`, 110, y + 18);
      }
    }

    y += 28;

    // Table Header
    doc.setFillColor(241, 245, 249);
    doc.rect(15, y, 180, 8, "F");
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text("Item / Description", 18, y + 6);
    doc.text("Qty", 120, y + 6);
    doc.text("Unit Price", 145, y + 6);
    doc.text("Total", 175, y + 6);

    y += 12;

    doc.setFont("helvetica", "normal");

    if (data.items) {
      data.items.forEach((item) => {
        if (y > 260) {
          doc.addPage();
          y = 20;
        }
        doc.text(item.name.substring(0, 45), 18, y);
        doc.text(`${item.quantity}`, 122, y);
        doc.text(`${currency}${item.unitPrice.toLocaleString()}`, 145, y);
        doc.text(`${currency}${item.total.toLocaleString()}`, 175, y);
        y += 8;
      });
    } else if (data.rawRows) {
      data.rawRows.forEach((row) => {
        if (y > 260) {
          doc.addPage();
          y = 20;
        }
        row.forEach((cell, idx) => {
          doc.text(String(cell).substring(0, 20), 18 + idx * 35, y);
        });
        y += 7;
      });
    }

    // Totals
    if (data.grandTotal !== undefined) {
      y += 6;
      doc.setDrawColor(226, 232, 240);
      doc.line(15, y, 195, y);
      y += 8;

      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.text(`GRAND TOTAL:`, 110, y);
      doc.text(`${currency}${data.grandTotal.toLocaleString()}`, 175, y);
    }

    // Footer
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text("Generated by Smart E-Commerce Enterprise Printing System", 15, 285);

    doc.save(`${data.documentTitle.toLowerCase().replace(/\s+/g, "_")}_${data.documentNumber}.pdf`);

    addAuditLog(
      `Downloaded PDF: ${data.documentTitle} (#${data.documentNumber})`,
      "Order",
      `PDF Exported by ${currentUser.name}`
    );

    triggerToast("PDF Downloaded successfully!");
  };

  // Download CSV
  const handleDownloadCSV = () => {
    let csvContent = `data:text/csv;charset=utf-8,`;
    csvContent += `Document,${data.documentTitle}\n`;
    csvContent += `Document Number,${data.documentNumber}\n`;
    csvContent += `Generated Date,${data.generatedDate} ${data.generatedTime}\n`;
    csvContent += `Status,${data.status}\n\n`;

    if (data.items) {
      csvContent += `Item Name,SKU,Quantity,Unit Price,Total\n`;
      data.items.forEach((item) => {
        csvContent += `"${item.name}","${item.sku || ""}","${item.quantity}","${item.unitPrice}","${item.total}"\n`;
      });
      if (data.grandTotal !== undefined) {
        csvContent += `\nGrand Total,,,,${data.grandTotal}\n`;
      }
    } else if (data.headers && data.rawRows) {
      csvContent += `${data.headers.join(",")}\n`;
      data.rawRows.forEach((row) => {
        csvContent += `${row.join(",")}\n`;
      });
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${data.documentTitle.toLowerCase().replace(/\s+/g, "_")}_${data.documentNumber}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    addAuditLog(
      `Exported CSV: ${data.documentTitle} (#${data.documentNumber})`,
      "Report",
      `CSV Exported by ${currentUser.name}`
    );

    triggerToast("CSV File Exported!");
  };

  const handleEmailPDF = () => {
    addAuditLog(
      `Emailed PDF: ${data.documentTitle} (#${data.documentNumber})`,
      "Order",
      `Sent to ${data.customerInfo?.email || currentUser.email}`
    );
    triggerToast(`Document emailed to ${data.customerInfo?.email || currentUser.email}`);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex flex-col justify-between overflow-hidden animate-in fade-in duration-200">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-emerald-600 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-2xl flex items-center gap-2 animate-in slide-in-from-top duration-300">
          <Check className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Modal Navbar */}
      <div className="bg-[#0F172A] border-b border-slate-800 text-white px-4 py-3 flex items-center justify-between shrink-0 shadow-md">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-600/30 text-indigo-400 rounded-xl border border-indigo-500/30">
            <Printer className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-black tracking-tight text-white uppercase">{data.documentTitle}</h2>
              <span className="text-[10px] font-bold bg-slate-800 text-indigo-300 px-2 py-0.5 rounded-md font-mono">
                #{data.documentNumber}
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Enterprise Print & Export Engine</p>
          </div>
        </div>

        {/* Toolbar Quick Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPreviewTheme(previewTheme === "dark" ? "light" : "dark")}
            className="p-2 text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
            title="Toggle Preview Canvas Background"
          >
            {previewTheme === "dark" ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-300" />}
            <span className="hidden sm:inline">{previewTheme === "dark" ? "Light BG" : "Dark BG"}</span>
          </button>

          <div className="hidden md:flex items-center bg-slate-800 rounded-xl p-0.5 border border-slate-700 text-xs">
            <button
              onClick={() => setZoomLevel(Math.max(50, zoomLevel - 10))}
              className="p-1.5 hover:bg-slate-700 rounded-lg text-slate-300"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="px-2 font-mono font-bold text-[11px] text-indigo-300">{zoomLevel}%</span>
            <button
              onClick={() => setZoomLevel(Math.min(150, zoomLevel + 10))}
              className="p-1.5 hover:bg-slate-700 rounded-lg text-slate-300"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={() => setZoomLevel(100)}
              className="p-1.5 hover:bg-slate-700 rounded-lg text-slate-300"
              title="Fit Page"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Center Body Grid: Sidebar Config + Scrollable Document Canvas */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
        {/* Left Control Sidebar */}
        <div className="lg:col-span-4 xl:col-span-3 bg-[#0F172A] border-r border-slate-800 p-4 overflow-y-auto custom-scrollbar text-white space-y-5 shrink-0">
          <div>
            <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
              <Settings className="w-3.5 h-3.5 text-indigo-400" />
              <span>Document Formatting & Layout</span>
            </p>

            <div className="space-y-3 bg-slate-900/90 p-3.5 rounded-2xl border border-slate-800 text-xs">
              {/* Paper Size */}
              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">Paper Size Format</label>
                <select
                  value={printSettings.paperSize}
                  onChange={(e) => setPrintSettings({ ...printSettings, paperSize: e.target.value as PaperSize })}
                  className="w-full bg-slate-800 text-white font-bold px-3 py-2 rounded-xl border border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs"
                >
                  <option value="A4">A4 Standard Document (210 x 297 mm)</option>
                  <option value="A5">A5 Compact Document (148 x 210 mm)</option>
                  <option value="Letter">US Letter (8.5 x 11 in)</option>
                  <option value="Thermal-4x6">Thermal Shipping Label (4 x 6 in)</option>
                  <option value="Thermal-80mm">Thermal Receipt Roll (80mm Width)</option>
                </select>
              </div>

              {/* Orientation */}
              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">Page Orientation</label>
                <div className="grid grid-cols-2 gap-2 font-bold text-xs">
                  <button
                    onClick={() => setPrintSettings({ ...printSettings, orientation: "portrait" })}
                    className={`py-1.5 rounded-xl border ${
                      printSettings.orientation === "portrait"
                        ? "bg-indigo-600 text-white border-indigo-500 font-black"
                        : "bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700"
                    }`}
                  >
                    Portrait
                  </button>
                  <button
                    onClick={() => setPrintSettings({ ...printSettings, orientation: "landscape" })}
                    className={`py-1.5 rounded-xl border ${
                      printSettings.orientation === "landscape"
                        ? "bg-indigo-600 text-white border-indigo-500 font-black"
                        : "bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700"
                    }`}
                  >
                    Landscape
                  </button>
                </div>
              </div>

              {/* Margins */}
              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">Margins</label>
                <select
                  value={printSettings.margin}
                  onChange={(e) => setPrintSettings({ ...printSettings, margin: e.target.value as PrintMargin })}
                  className="w-full bg-slate-800 text-white font-bold px-3 py-2 rounded-xl border border-slate-700 text-xs"
                >
                  <option value="normal">Normal Margins (Spacious)</option>
                  <option value="compact">Compact Margins (Tight)</option>
                  <option value="borderless">Borderless (Full Bleed)</option>
                </select>
              </div>

              {/* Watermark Selector */}
              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">Watermark Overlay</label>
                <select
                  value={String(printSettings.watermarkText)}
                  onChange={(e) =>
                    setPrintSettings({ ...printSettings, watermarkText: e.target.value as DocumentWatermark })
                  }
                  className="w-full bg-slate-800 text-white font-bold px-3 py-2 rounded-xl border border-slate-700 text-xs"
                >
                  <option value="ORIGINAL">ORIGINAL</option>
                  <option value="COPY">COPY</option>
                  <option value="REPRINT">REPRINT</option>
                  <option value="DRAFT">DRAFT</option>
                  <option value="PAID">PAID</option>
                  <option value="UNPAID">UNPAID</option>
                  <option value="CANCELLED">CANCELLED</option>
                  <option value="CONFIDENTIAL">CONFIDENTIAL</option>
                  <option value="APPROVED">APPROVED</option>
                </select>
              </div>

              {/* Copies */}
              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">Number of Copies</label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={printSettings.copies}
                  onChange={(e) => setPrintSettings({ ...printSettings, copies: Math.max(1, parseInt(e.target.value) || 1) })}
                  className="w-full bg-slate-800 text-white font-bold px-3 py-2 rounded-xl border border-slate-700 text-xs"
                />
              </div>
            </div>
          </div>

          {/* Visibility Toggles */}
          <div>
            <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-2">Visibility Options</p>
            <div className="space-y-2 bg-slate-900/90 p-3.5 rounded-2xl border border-slate-800 text-xs font-semibold">
              <label className="flex items-center justify-between cursor-pointer">
                <span>Company Header & Logo</span>
                <input
                  type="checkbox"
                  checked={printSettings.showHeader}
                  onChange={(e) => setPrintSettings({ ...printSettings, showHeader: e.target.checked })}
                  className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <span>Footer & Page Numbers</span>
                <input
                  type="checkbox"
                  checked={printSettings.showFooter}
                  onChange={(e) => setPrintSettings({ ...printSettings, showFooter: e.target.checked })}
                  className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <span>Watermark Stamp</span>
                <input
                  type="checkbox"
                  checked={printSettings.showWatermark}
                  onChange={(e) => setPrintSettings({ ...printSettings, showWatermark: e.target.checked })}
                  className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <span>Signature Lines</span>
                <input
                  type="checkbox"
                  checked={printSettings.showSignatures}
                  onChange={(e) => setPrintSettings({ ...printSettings, showSignatures: e.target.checked })}
                  className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                />
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2 pt-2">
            <button
              onClick={handlePrint}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs py-3 px-4 rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all active:scale-98"
            >
              <Printer className="w-4 h-4" />
              <span>Print Document ({printSettings.copies} {printSettings.copies > 1 ? "Copies" : "Copy"})</span>
            </button>

            <div className="grid grid-cols-2 gap-2 text-xs font-bold">
              <button
                onClick={handleDownloadPDF}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 py-2.5 px-3 rounded-xl border border-slate-700 flex items-center justify-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5 text-indigo-400" />
                <span>Download PDF</span>
              </button>

              <button
                onClick={handleDownloadCSV}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 py-2.5 px-3 rounded-xl border border-slate-700 flex items-center justify-center gap-1.5"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                <span>Export CSV</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs font-bold">
              <button
                onClick={handleEmailPDF}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 py-2 px-3 rounded-xl border border-slate-700 flex items-center justify-center gap-1.5"
              >
                <Mail className="w-3.5 h-3.5 text-sky-400" />
                <span>Email PDF</span>
              </button>

              <button
                onClick={() => triggerToast("Direct document share link copied!")}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 py-2 px-3 rounded-xl border border-slate-700 flex items-center justify-center gap-1.5"
              >
                <Share2 className="w-3.5 h-3.5 text-amber-400" />
                <span>Share Link</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Scrollable Document Canvas */}
        <div
          className={`lg:col-span-8 xl:col-span-9 p-4 sm:p-8 overflow-y-auto custom-scrollbar flex items-start justify-center transition-colors ${
            previewTheme === "dark" ? "bg-slate-950" : "bg-slate-200"
          }`}
        >
          <div
            style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: "top center" }}
            className="transition-transform duration-200 my-4"
          >
            <PrintDocumentViewer data={data} settings={printSettings} printCount={printCount} />
          </div>
        </div>
      </div>

      {/* Reprint Reason Modal Prompt if printCount > 1 */}
      {showReprintModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 text-white max-w-sm w-full p-5 rounded-2xl shadow-2xl space-y-4">
            <div className="flex items-center gap-2 text-amber-400">
              <History className="w-5 h-5" />
              <h3 className="text-sm font-black uppercase">Reprint Audit Reason</h3>
            </div>
            <p className="text-xs text-slate-300">
              This document has already been printed. Please specify a reason for re-printing for security audit logs.
            </p>
            <input
              type="text"
              value={reprintReason}
              onChange={(e) => setReprintReason(e.target.value)}
              placeholder="e.g., Customer copy request, Printer paper jam..."
              className="w-full bg-slate-800 text-xs px-3 py-2 rounded-xl border border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white"
            />
            <div className="flex justify-end gap-2 text-xs font-bold pt-2">
              <button
                onClick={() => setShowReprintModal(false)}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowReprintModal(false);
                  handlePrint();
                }}
                className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl"
              >
                Confirm & Print
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
