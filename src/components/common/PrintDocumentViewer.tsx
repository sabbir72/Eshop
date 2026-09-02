import React from "react";
import { PrintableDocumentData, PrintSettings } from "../../types/print";
import { BarcodeSVG, QRCodeSVG } from "../../utils/codeGenerators";
import { numberToWords } from "../../utils/numberToWords";
import { CheckCircle2, Clock, ShieldCheck, Truck, Building2, Phone, Mail, Globe, FileText, AlertCircle } from "lucide-react";

interface PrintDocumentViewerProps {
  data: PrintableDocumentData;
  settings: PrintSettings;
  printCount?: number;
}

export const PrintDocumentViewer: React.FC<PrintDocumentViewerProps> = ({
  data,
  settings,
  printCount = 1,
}) => {
  const company = data.companyInfo || {
    name: "SMART E-COMMERCE ENTERPRISE",
    address: "Level 12, Corporate Tower, 100 Commercial Avenue, Tech District",
    phone: "+880 1700-000000 / +1 (800) 555-0199",
    email: "support@smartecom.com / billing@smartecom.com",
    website: "www.smartecom.com",
    tradeLicense: "TRAD/DNCC/019283/2024",
    binVat: "BIN-001928374-0101",
    tin: "TIN-987654321012",
  };

  const currencySymbol = data.currencySymbol || "৳";

  // Calculate paper dimension class & orientation
  const getPageStyle = () => {
    if (settings.paperSize === "Thermal-80mm") {
      return "w-[80mm] min-h-[120mm] p-3 text-[10px]";
    }
    if (settings.paperSize === "Thermal-4x6") {
      return "w-[4in] h-[6in] p-4 text-[11px]";
    }
    if (settings.paperSize === "A5") {
      return settings.orientation === "landscape"
        ? "w-[210mm] min-h-[148mm] p-6 text-xs"
        : "w-[148mm] min-h-[210mm] p-6 text-xs";
    }
    // Default A4 / Letter
    return settings.orientation === "landscape"
      ? "w-[297mm] min-h-[210mm] p-8 text-xs"
      : "w-[210mm] min-h-[297mm] p-8 text-xs";
  };

  const getMarginClass = () => {
    if (settings.margin === "borderless") return "p-2 sm:p-3";
    if (settings.margin === "compact") return "p-4 sm:p-5";
    return "p-6 sm:p-8";
  };

  // Status Watermark Color
  const getWatermarkColor = (wm: string) => {
    switch (wm.toUpperCase()) {
      case "PAID":
      case "APPROVED":
        return "text-emerald-500/15 border-emerald-500/20";
      case "UNPAID":
      case "DRAFT":
        return "text-amber-500/15 border-amber-500/20";
      case "CANCELLED":
        return "text-rose-500/15 border-rose-500/20";
      default:
        return "text-slate-500/10 border-slate-500/15";
    }
  };

  const watermarkText = settings.showWatermark
    ? settings.watermarkText || data.watermark || data.status || "ORIGINAL"
    : null;

  // Render Barcode Labels Special Mode
  if (data.documentType === "barcode_labels" || data.documentType === "qr_labels" || data.documentType === "product_labels") {
    return (
      <div className={`bg-white text-slate-900 mx-auto shadow-sm print:shadow-none border border-slate-200 print:border-none relative ${getPageStyle()}`}>
        <div className="border-b-2 border-slate-900 pb-3 mb-4 flex justify-between items-center">
          <div>
            <h1 className="text-base font-black uppercase tracking-tight">{data.documentTitle}</h1>
            <p className="text-[10px] text-slate-500">Doc #: {data.documentNumber} | Date: {data.generatedDate}</p>
          </div>
          <div className="text-right">
            <span className="text-[10px] font-bold bg-slate-900 text-white px-2 py-0.5 rounded-sm">
              {company.name}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {(data.items || []).map((item, idx) => (
            <div key={idx} className="border border-slate-300 p-2 rounded-lg text-center flex flex-col items-center justify-between bg-slate-50/50">
              <span className="text-[9px] font-bold text-slate-500 truncate max-w-full">{company.name}</span>
              <p className="text-[11px] font-extrabold text-slate-900 line-clamp-2 my-1">{item.name}</p>
              {item.sku && <p className="text-[9px] font-mono text-slate-600">SKU: {item.sku}</p>}
              
              <div className="my-1.5 w-full flex justify-center">
                {data.documentType === "qr_labels" ? (
                  <QRCodeSVG value={item.barcode || item.sku || item.id} size={54} />
                ) : (
                  <BarcodeSVG value={item.barcode || item.sku || item.id} width={120} height={32} />
                )}
              </div>

              <div className="w-full pt-1 border-t border-slate-200 flex justify-between items-center text-[10px]">
                <span className="font-mono text-slate-500">QTY: {item.quantity}</span>
                <span className="font-black text-indigo-700">{currencySymbol}{item.unitPrice.toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Render Courier / Shipping Label Special Mode
  if (data.documentType === "shipping_label" || data.documentType === "courier_label") {
    return (
      <div className={`bg-white text-slate-900 mx-auto shadow-sm print:shadow-none border border-slate-300 print:border-none relative font-sans ${getPageStyle()}`}>
        {/* Top Header */}
        <div className="border-b-2 border-slate-900 pb-2 mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Truck className="w-6 h-6 text-indigo-600" />
            <div>
              <h1 className="text-lg font-black uppercase tracking-tight">EXPRESS SHIPPING LABEL</h1>
              <p className="text-[10px] font-mono text-slate-500">COURIER DISPATCH SLIP</p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-xs font-black uppercase bg-slate-900 text-white px-2.5 py-1 rounded-md tracking-wider">
              {data.shippingInfo?.courierName || "STANDARD DELIVERY"}
            </span>
          </div>
        </div>

        {/* Tracking Barcode */}
        <div className="bg-slate-50 border border-slate-300 rounded-xl p-3 text-center my-3">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">TRACKING BARCODE / ORDER QR</p>
          <div className="flex justify-center items-center gap-6 my-1">
            <BarcodeSVG value={data.shippingInfo?.trackingNumber || data.documentNumber} width={180} height={42} />
            <QRCodeSVG value={data.shippingInfo?.trackingNumber || data.documentNumber} size={60} />
          </div>
          <p className="text-[11px] font-mono font-black text-slate-900">
            TRACKING #: {data.shippingInfo?.trackingNumber || data.documentNumber}
          </p>
        </div>

        {/* To / From Grid */}
        <div className="grid grid-cols-2 gap-3 my-3">
          <div className="border-2 border-slate-900 p-3 rounded-xl bg-slate-50">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">DELIVER TO (RECIPIENT)</p>
            <p className="text-sm font-black text-slate-900">{data.shippingInfo?.recipientName || data.customerInfo?.name}</p>
            <p className="text-xs font-bold text-slate-800 mt-1">{data.shippingInfo?.phone || data.customerInfo?.phone}</p>
            <p className="text-xs text-slate-700 mt-1 font-medium">{data.shippingInfo?.address}</p>
            <p className="text-xs font-bold text-indigo-700 mt-1 uppercase">{data.shippingInfo?.city} - {data.shippingInfo?.postalCode}</p>
          </div>

          <div className="border border-slate-300 p-3 rounded-xl bg-white">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">SHIPPER / RETURN ADDRESS</p>
            <p className="text-xs font-black text-slate-900">{company.name}</p>
            <p className="text-[11px] font-semibold text-slate-700 mt-1">{company.address}</p>
            <p className="text-[11px] font-mono text-slate-600 mt-1">TEL: {company.phone}</p>
            <p className="text-[10px] text-slate-500 mt-1">ORDER REF: {data.documentNumber}</p>
          </div>
        </div>

        {/* Contents Checklist */}
        <div className="border border-slate-300 rounded-xl p-3 my-3">
          <p className="text-[10px] font-black uppercase text-slate-500 mb-2">PACKAGE CONTENTS ({data.items?.length || 0} ITEMS)</p>
          <table className="w-full text-[11px] text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase">
                <th className="pb-1">Item Description</th>
                <th className="pb-1 text-center">Qty</th>
                <th className="pb-1 text-right">Checked</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(data.items || []).map((item, idx) => (
                <tr key={idx}>
                  <td className="py-1 font-semibold">{item.name} {item.notes && `(${item.notes})`}</td>
                  <td className="py-1 text-center font-bold">{item.quantity}</td>
                  <td className="py-1 text-right font-mono">[  ]</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="border-t-2 border-slate-900 pt-2 mt-4 flex justify-between items-center text-[10px]">
          <div>
            <span className="font-bold">COD AMOUNT: </span>
            <span className="font-black text-xs text-rose-600">
              {data.paymentStatus === "Paid" ? "NO COD (PAID ONLINE)" : `${currencySymbol}${(data.grandTotal || 0).toLocaleString()}`}
            </span>
          </div>
          <div className="text-right text-slate-500 font-mono">
            PRINTED: {data.generatedDate} {data.generatedTime} | COUNT: #{printCount}
          </div>
        </div>
      </div>
    );
  }

  // STANDARD ENTERPRISE DOCUMENT TEMPLATE (Invoices, Receipts, Purchase Orders, Reports, etc.)
  return (
    <div
      className={`bg-white text-slate-900 mx-auto shadow-sm print:shadow-none border border-slate-200 print:border-none relative transition-all ${getPageStyle()} ${getMarginClass()}`}
    >
      {/* Watermark Overlay */}
      {watermarkText && (
        <div
          className={`absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden z-0 select-none`}
        >
          <div
            className={`transform -rotate-30 text-5xl sm:text-7xl md:text-8xl font-black tracking-widest uppercase border-8 px-8 py-4 rounded-3xl ${getWatermarkColor(
              watermarkText
            )}`}
          >
            {watermarkText}
          </div>
        </div>
      )}

      {/* Main Container Z-Index Wrapper */}
      <div className="relative z-10 flex flex-col justify-between h-full space-y-6">
        <div>
          {/* Header Section */}
          {settings.showHeader && (
            <header className="border-b-2 border-slate-900 pb-5 mb-5">
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                {/* Company Logo & Details */}
                <div className="space-y-1.5 max-w-md">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black text-lg shadow-xs">
                      {company.name[0]}
                    </div>
                    <div>
                      <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight leading-tight">
                        {company.name}
                      </h2>
                      <p className="text-[10px] font-bold text-indigo-600 tracking-wider uppercase">
                        Enterprise Solutions
                      </p>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-600 leading-normal font-medium">{company.address}</p>

                  <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-[10px] text-slate-600 font-medium">
                    <span><strong className="text-slate-800">Phone:</strong> {company.phone}</span>
                    <span><strong className="text-slate-800">Email:</strong> {company.email}</span>
                    <span><strong className="text-slate-800">Web:</strong> {company.website}</span>
                  </div>

                  {/* Legal Tax Registrations */}
                  <div className="flex flex-wrap gap-2 text-[9.5px] font-mono text-slate-500 pt-1">
                    {company.tradeLicense && <span>Trade Lic: {company.tradeLicense}</span>}
                    {company.binVat && <span>• BIN/VAT: {company.binVat}</span>}
                    {company.tin && <span>• TIN: {company.tin}</span>}
                  </div>
                </div>

                {/* Document Metadata Block */}
                <div className="text-left sm:text-right space-y-2 bg-slate-50 p-3 sm:p-4 rounded-2xl border border-slate-200 min-w-[220px]">
                  <div>
                    <h1 className="text-base sm:text-xl font-black text-slate-900 uppercase tracking-tight">
                      {data.documentTitle}
                    </h1>
                    <p className="text-[11px] font-mono font-extrabold text-indigo-700 mt-0.5">
                      #{data.documentNumber}
                    </p>
                    {data.referenceNumber && (
                      <p className="text-[10px] font-mono text-slate-500">Ref: {data.referenceNumber}</p>
                    )}
                  </div>

                  {/* Status Badge */}
                  <div>
                    <span
                      className={`inline-block text-[10px] font-black uppercase px-2.5 py-1 rounded-md tracking-wider border ${
                        data.status.toLowerCase() === "paid" || data.status.toLowerCase() === "delivered"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : data.status.toLowerCase() === "pending" || data.status.toLowerCase() === "unpaid"
                          ? "bg-amber-50 text-amber-700 border-amber-200"
                          : "bg-slate-100 text-slate-800 border-slate-300"
                      }`}
                    >
                      STATUS: {data.status}
                    </span>
                  </div>

                  {/* Barcode & QR Code */}
                  <div className="pt-2 flex items-center justify-start sm:justify-end gap-3">
                    <BarcodeSVG value={data.documentNumber} width={110} height={30} />
                    <QRCodeSVG value={`${data.documentNumber}|${data.grandTotal || 0}`} size={42} />
                  </div>

                  {/* Generated Timestamp */}
                  <div className="text-[9.5px] font-mono text-slate-500 pt-1 border-t border-slate-200">
                    <p>Date: {data.generatedDate} {data.generatedTime}</p>
                    <p>By: {data.generatedBy}</p>
                  </div>
                </div>
              </div>
            </header>
          )}

          {/* Party Details Grid (Billed To, Shipping To, Supplier) */}
          {(data.customerInfo || data.shippingInfo || data.supplierInfo) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 my-4">
              {data.customerInfo && (
                <div className="bg-slate-50/80 p-3 rounded-xl border border-slate-200 text-left">
                  <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">BILLED TO (CUSTOMER)</p>
                  <p className="text-xs font-black text-slate-900">{data.customerInfo.name}</p>
                  <p className="text-[11px] font-bold text-slate-700 mt-0.5">{data.customerInfo.phone}</p>
                  {data.customerInfo.email && <p className="text-[10px] text-slate-600">{data.customerInfo.email}</p>}
                  {data.customerInfo.address && <p className="text-[10px] text-slate-600 mt-1">{data.customerInfo.address}</p>}
                </div>
              )}

              {data.shippingInfo && (
                <div className="bg-slate-50/80 p-3 rounded-xl border border-slate-200 text-left">
                  <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">SHIPPING ADDRESS</p>
                  <p className="text-xs font-black text-slate-900">{data.shippingInfo.recipientName}</p>
                  <p className="text-[11px] font-bold text-slate-700 mt-0.5">{data.shippingInfo.phone}</p>
                  <p className="text-[10px] text-slate-600 mt-1">{data.shippingInfo.address}</p>
                  {data.shippingInfo.courierName && (
                    <p className="text-[10px] font-bold text-indigo-700 mt-1">Courier: {data.shippingInfo.courierName}</p>
                  )}
                </div>
              )}

              {data.supplierInfo && (
                <div className="bg-slate-50/80 p-3 rounded-xl border border-slate-200 text-left">
                  <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">SUPPLIER / VENDOR</p>
                  <p className="text-xs font-black text-slate-900">{data.supplierInfo.company || data.supplierInfo.name}</p>
                  <p className="text-[11px] font-bold text-slate-700 mt-0.5">Contact: {data.supplierInfo.contactPerson}</p>
                  <p className="text-[10px] text-slate-600">{data.supplierInfo.phone} | {data.supplierInfo.email}</p>
                </div>
              )}
            </div>
          )}

          {/* Itemized Table OR Raw Reports Table */}
          {data.items && data.items.length > 0 ? (
            <div className="my-5 overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-900 text-white font-bold uppercase text-[10.5px] tracking-wider">
                    <th className="p-2.5">#</th>
                    <th className="p-2.5">Item Description</th>
                    <th className="p-2.5 text-center">Qty</th>
                    <th className="p-2.5 text-right">Unit Price</th>
                    {data.items.some((i) => i.discount && i.discount > 0) && (
                      <th className="p-2.5 text-right">Discount</th>
                    )}
                    <th className="p-2.5 text-right">Total ({currencySymbol})</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-slate-800">
                  {data.items.map((item, idx) => (
                    <tr key={idx} className={idx % 2 === 0 ? "bg-white" : "bg-slate-50/50"}>
                      <td className="p-2.5 font-mono text-[11px] text-slate-400">{idx + 1}</td>
                      <td className="p-2.5">
                        <span className="font-extrabold text-slate-900 block">{item.name}</span>
                        {(item.sku || item.notes) && (
                          <span className="text-[10px] text-slate-500 font-mono block">
                            {item.sku && `SKU: ${item.sku}`} {item.notes && `(${item.notes})`}
                          </span>
                        )}
                      </td>
                      <td className="p-2.5 text-center font-bold">{item.quantity}</td>
                      <td className="p-2.5 text-right font-mono">{currencySymbol}{item.unitPrice.toLocaleString()}</td>
                      {data.items?.some((i) => i.discount && i.discount > 0) && (
                        <td className="p-2.5 text-right font-mono text-emerald-600">
                          {item.discount ? `-${currencySymbol}${item.discount.toLocaleString()}` : "-"}
                        </td>
                      )}
                      <td className="p-2.5 text-right font-mono font-black text-slate-900">
                        {currencySymbol}{item.total.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : data.headers && data.rawRows ? (
            /* Raw Reports Table */
            <div className="my-5 overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-[11px] border-collapse">
                <thead>
                  <tr className="bg-slate-900 text-white font-bold uppercase text-[10px] tracking-wider">
                    {data.headers.map((h, i) => (
                      <th key={i} className="p-2">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-slate-800">
                  {data.rawRows.map((row, rIdx) => (
                    <tr key={rIdx} className={rIdx % 2 === 0 ? "bg-white" : "bg-slate-50/50"}>
                      {row.map((cell, cIdx) => (
                        <td key={cIdx} className="p-2 font-medium">{String(cell)}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}

          {/* Financial Breakdown Summary & Amount in Words */}
          {data.grandTotal !== undefined && (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 my-4 items-start">
              <div className="md:col-span-7 bg-slate-50 p-3 sm:p-4 rounded-xl border border-slate-200 space-y-2">
                <div>
                  <p className="text-[10px] font-black uppercase text-slate-400">AMOUNT IN WORDS</p>
                  <p className="text-xs font-extrabold text-slate-900 capitalize italic mt-0.5">
                    {numberToWords(data.grandTotal, currencySymbol === "৳" ? "BDT" : "USD")}
                  </p>
                </div>

                {data.paymentMethod && (
                  <div className="pt-2 border-t border-slate-200 flex justify-between items-center text-[11px]">
                    <span className="text-slate-500 font-bold">Payment Method:</span>
                    <span className="font-extrabold text-slate-800 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                      {data.paymentMethod} ({data.paymentStatus || "Completed"})
                    </span>
                  </div>
                )}
              </div>

              <div className="md:col-span-5 bg-white p-3 sm:p-4 rounded-xl border-2 border-slate-900 space-y-1.5 text-xs text-right">
                {data.subtotal !== undefined && (
                  <div className="flex justify-between font-medium text-slate-600">
                    <span>Subtotal:</span>
                    <span className="font-mono font-bold text-slate-800">{currencySymbol}{data.subtotal.toLocaleString()}</span>
                  </div>
                )}

                {data.discountTotal !== undefined && data.discountTotal > 0 && (
                  <div className="flex justify-between text-emerald-600 font-bold">
                    <span>Discount:</span>
                    <span className="font-mono">-{currencySymbol}{data.discountTotal.toLocaleString()}</span>
                  </div>
                )}

                {data.shippingCharge !== undefined && (
                  <div className="flex justify-between font-medium text-slate-600">
                    <span>Shipping Charge:</span>
                    <span className="font-mono font-bold text-slate-800">{currencySymbol}{data.shippingCharge.toLocaleString()}</span>
                  </div>
                )}

                {data.taxTotal !== undefined && (
                  <div className="flex justify-between font-medium text-slate-600">
                    <span>Tax (5%):</span>
                    <span className="font-mono font-bold text-slate-800">{currencySymbol}{data.taxTotal.toLocaleString()}</span>
                  </div>
                )}

                {data.isGiftWrapped && (
                  <div className="flex justify-between font-bold text-pink-700 bg-pink-50/80 px-2 py-1 rounded-md border border-pink-200">
                    <span>🎁 Gift Wrapping:</span>
                    <span className="font-mono">+{currencySymbol}{(data.giftWrappingCharge ?? 50).toLocaleString()}</span>
                  </div>
                )}

                <div className="flex justify-between items-center pt-2 border-t-2 border-slate-900 text-sm font-black text-slate-900">
                  <span>GRAND TOTAL:</span>
                  <span className="font-mono text-base text-indigo-700">{currencySymbol}{data.grandTotal.toLocaleString()}</span>
                </div>
              </div>
            </div>
          )}

          {/* Personal Gift Greeting Card (When gift message is attached) */}
          {data.giftMessage && (
            <div className="my-4 p-4 rounded-2xl bg-gradient-to-r from-pink-50 via-rose-50 to-purple-50 border-2 border-pink-200 text-slate-800 space-y-1.5 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase text-pink-700 tracking-wider flex items-center gap-1.5">
                  🎁 PERSONAL GIFT MESSAGE FOR RECIPIENT
                </span>
                {data.giftRecipientPhone && (
                  <span className="text-[10px] font-mono text-purple-700 bg-white/80 px-2 py-0.5 rounded-full border border-purple-200">
                    SMS Sent to: {data.giftRecipientPhone}
                  </span>
                )}
              </div>
              <p className="text-xs italic font-serif text-slate-900 bg-white/70 p-3 rounded-xl border border-pink-100/80 leading-relaxed">
                "{data.giftMessage}"
              </p>
              {data.giftSenderName && (
                <p className="text-[11px] font-bold text-slate-700 text-right">
                  — With love from: <span className="text-pink-700 font-extrabold">{data.giftSenderName}</span>
                </p>
              )}
            </div>
          )}

          {/* Terms & Conditions / Notes */}
          <div className="my-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-[10.5px]">
            {data.notes && (
              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                <span className="font-bold text-slate-800 block">Notes:</span>
                <p className="text-slate-600 mt-0.5">{data.notes}</p>
              </div>
            )}
            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
              <span className="font-bold text-slate-800 block">Terms & Conditions:</span>
              <p className="text-slate-600 mt-0.5">
                1. Computer generated document. Valid without physical rubber stamp.<br />
                2. Goods once sold are subject to company warranty & return policies.
              </p>
            </div>
          </div>
        </div>

        {/* Footer & Signatures Section */}
        <div>
          {settings.showSignatures && (
            <div className="pt-8 pb-4 grid grid-cols-3 gap-4 text-center text-[10.5px] border-t border-slate-200 my-4">
              <div>
                <div className="h-10 border-b border-dashed border-slate-400 mx-auto w-32"></div>
                <p className="font-bold text-slate-700 mt-1">Prepared By</p>
                <p className="text-[9px] text-slate-400 font-mono">{data.generatedBy}</p>
              </div>

              <div>
                <div className="h-10 border-b border-dashed border-slate-400 mx-auto w-32"></div>
                <p className="font-bold text-slate-700 mt-1">Received By / Customer</p>
                <p className="text-[9px] text-slate-400 font-mono">Sign & Date</p>
              </div>

              <div>
                <div className="h-10 border-b border-dashed border-slate-400 mx-auto w-32"></div>
                <p className="font-bold text-slate-700 mt-1">Authorized Signature</p>
                <p className="text-[9px] text-slate-400 font-mono">Company Stamp</p>
              </div>
            </div>
          )}

          {settings.showFooter && (
            <footer className="pt-3 border-t-2 border-slate-900 flex flex-col sm:flex-row justify-between items-center text-[9.5px] font-mono text-slate-500 gap-1">
              <div>
                {company.name} • {company.website} • Support: {company.phone}
              </div>
              <div className="flex items-center gap-3">
                <span>Print Count: #{printCount}</span>
                <span>Page 1 of 1</span>
                <span>Confidential</span>
              </div>
            </footer>
          )}
        </div>
      </div>
    </div>
  );
};
