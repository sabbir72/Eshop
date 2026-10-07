import React, { useState } from "react";
import { useStore } from "../../context/StoreContext";
import { Order, OrderStatus } from "../../types";
import { PrintableDocumentData } from "../../types/print";
import { buildOrderInvoiceData, buildPackingSlipData, buildShippingLabelData } from "../../utils/printDocumentBuilder";
import { EnterprisePrintModal } from "../common/EnterprisePrintModal";
import { formatNumber } from "../../utils/numberUtils";
import { exportToCSV, exportToExcel } from "../../utils/exportUtils";
import {
  ShoppingBag,
  Search,
  Download,
  Printer,
  Tag,
  PackageCheck,
  Truck,
  Gift,
  MessageSquare,
  Building,
  FileText,
  FileSpreadsheet,
  Layers,
} from "lucide-react";

export const OrderManagement: React.FC = () => {
  const { orders, updateOrderStatus, settings, addToast } = useStore();
  const [activeTab, setActiveTab] = useState<string>("All");
  const [search, setSearch] = useState<string>("");

  const [activePrintData, setActivePrintData] = useState<PrintableDocumentData | null>(null);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState<boolean>(false);

  const openPrintModal = (data: PrintableDocumentData) => {
    setActivePrintData(data);
    setIsPrintModalOpen(true);
  };

  const filteredOrders = orders.filter((o) => {
    if (activeTab !== "All" && o.orderStatus !== activeTab) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchNum = o.orderNumber.toLowerCase().includes(q);
      const matchName = o.customerName.toLowerCase().includes(q);
      if (!matchNum && !matchName) return false;
    }
    return true;
  });

  const getExportRows = () => {
    return filteredOrders.map((o) => ({
      "Order Number": o.orderNumber,
      "Order Date": o.createdAt,
      "Customer Name": o.customerName,
      "Customer Phone": o.customerPhone,
      "Customer Email": o.customerEmail || "N/A",
      "Shipping Address": `${o.shippingAddress.street}, ${o.shippingAddress.city} ${o.shippingAddress.postalCode}`,
      "Items Count": o.items.length,
      "Subtotal": o.subtotal,
      "Discount": o.discount,
      "Shipping Charge": o.shippingCharge,
      "Tax (5%)": o.tax,
      "Gift Wrap Charge": o.isGiftWrapped ? (o.giftWrappingCharge || 50) : 0,
      "Grand Total": o.total,
      "Payment Method": o.paymentMethod,
      "Payment Status": o.paymentStatus,
      "Order Status": o.orderStatus,
      "Tracking Number": o.trackingNumber || "N/A",
    }));
  };

  const handleExportCSV = () => {
    const rows = getExportRows();
    if (rows.length === 0) {
      addToast("No orders available to export.", "warning");
      return;
    }
    exportToCSV(`orders_export_${Date.now()}`, rows);
    addToast(`Exported ${rows.length} orders to CSV`, "success");
  };

  const handleExportExcel = () => {
    const rows = getExportRows();
    if (rows.length === 0) {
      addToast("No orders available to export.", "warning");
      return;
    }
    exportToExcel(`orders_export_${Date.now()}.xlsx`, "Orders", rows);
    addToast(`Exported ${rows.length} orders to Excel (.xlsx)`, "success");
  };

  return (
    <div className="space-y-6 pb-16">
      <div className="bg-slate-900 text-white p-5 sm:p-6 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight">Order Processing & Enterprise Fulfillment</h1>
          <p className="text-xs text-slate-300">Manage pipeline order states, dispatch tracking & print invoices, packing slips, shipping labels</p>
        </div>

        {/* Export Data Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleExportCSV}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold px-3.5 py-2 rounded-xl border border-slate-700 inline-flex items-center gap-2 text-xs transition-colors shadow-xs"
            title="Export Orders with Comma & Decimal Numbers to CSV"
          >
            <Download className="w-3.5 h-3.5 text-indigo-400" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={handleExportExcel}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3.5 py-2 rounded-xl inline-flex items-center gap-2 text-xs transition-colors shadow-xs"
            title="Export Orders to Microsoft Excel (.xlsx) with Formatted Currency"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Export Excel (.xlsx)</span>
          </button>
        </div>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-3">
        <div className="flex items-center gap-1.5 text-xs font-bold overflow-x-auto pb-1 no-scrollbar">
          {["All", "Pending", "Processing", "Packed", "Shipped", "Delivered", "Cancelled"].map((st) => (
            <button
              key={st}
              onClick={() => setActiveTab(st)}
              className={`px-3 py-1.5 rounded-xl transition-colors whitespace-nowrap ${
                activeTab === st ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        <div className="relative max-w-md">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search Order Number or Customer Name..."
            className="w-full bg-slate-50 text-xs pl-8 pr-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-x-auto custom-scrollbar shadow-xs">
        <table className="w-full text-xs text-left min-w-[850px]">
          <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-bold uppercase tracking-wider">
            <tr>
              <th className="p-3">Order #</th>
              <th className="p-3">Customer & Gift</th>
              <th className="p-3">Date</th>
              <th className="p-3">Total Amount</th>
              <th className="p-3">Payment</th>
              <th className="p-3">Order Status</th>
              <th className="p-3 text-right">Print Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 text-slate-800">
            {filteredOrders.map((o) => (
              <tr key={o.id} className="hover:bg-slate-50">
                <td className="p-3">
                  <span className="font-extrabold text-slate-900 block">{o.orderNumber}</span>
                  {o.isGiftWrapped && (
                    <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-pink-50 text-pink-700 border border-pink-200">
                      <Gift className="w-3 h-3 text-pink-500" /> Gift Wrapped (+{settings.currencySymbol}{o.giftWrappingCharge || 50})
                    </span>
                  )}
                </td>
                <td className="p-3 space-y-1">
                  <div>
                    <span className="font-bold text-slate-900 block">{o.customerName}</span>
                    <span className="text-[10px] text-slate-400">{o.customerPhone}</span>
                  </div>
                  {o.giftSmsEnabled && (
                    <div className="text-[10px] text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-100 flex items-center gap-1 w-fit">
                      <MessageSquare className="w-2.5 h-2.5" />
                      <span>SMS to: {o.giftRecipientPhone} ({o.giftSmsStatus || "Sent"})</span>
                    </div>
                  )}
                  {o.giftMessage && (
                    <div className="text-[10px] italic text-slate-500 max-w-[200px] truncate" title={o.giftMessage}>
                      "{o.giftMessage}"
                    </div>
                  )}
                </td>
                <td className="p-3 font-mono">{o.createdAt}</td>
                <td className="p-3 font-black text-slate-900 font-mono">
                  {settings.currencySymbol}{formatNumber(o.total, 2)}
                </td>
                <td className="p-3">
                  <span className="bg-slate-100 text-slate-800 font-bold px-2 py-0.5 rounded-md text-[10px]">
                    {o.paymentMethod} ({o.paymentStatus})
                  </span>
                </td>
                <td className="p-3">
                  <select
                    value={o.orderStatus}
                    onChange={(e) => updateOrderStatus(o.id, e.target.value as OrderStatus)}
                    className="bg-slate-100 border border-slate-200 rounded-lg px-2 py-1 font-bold text-[11px]"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Processing">Processing</option>
                    <option value="Packed">Packed</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </td>
                <td className="p-3 text-right">
                  <div className="flex items-center justify-end gap-1.5 flex-wrap">
                    <button
                      onClick={() => openPrintModal({ ...buildOrderInvoiceData(o, settings.currencySymbol, "customer"), copyType: "all" })}
                      className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold rounded-lg border border-emerald-300 inline-flex items-center gap-1 text-[11px]"
                      title="Print All 3 Copies (Customer + Office + Shipment Triplicate Set with Page Breaks)"
                    >
                      <Layers className="w-3.5 h-3.5 text-emerald-600" /> 3 Copies Set
                    </button>

                    <button
                      onClick={() => openPrintModal(buildOrderInvoiceData(o, settings.currencySymbol, "customer"))}
                      className="p-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-lg border border-indigo-200 inline-flex items-center gap-1 text-[11px]"
                      title="Print Customer Copy Invoice (গ্রাহক কপি)"
                    >
                      <Printer className="w-3.5 h-3.5" /> Customer Copy
                    </button>

                    <button
                      onClick={() => openPrintModal(buildOrderInvoiceData(o, settings.currencySymbol, "office"))}
                      className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-lg border border-slate-300 inline-flex items-center gap-1 text-[11px]"
                      title="Print Office / Accounts Copy Invoice (অফিস কপি)"
                    >
                      <Building className="w-3.5 h-3.5 text-slate-700" /> Office Copy
                    </button>

                    <button
                      onClick={() => openPrintModal(buildOrderInvoiceData(o, settings.currencySymbol, "shipment"))}
                      className="p-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold rounded-lg border border-amber-300 inline-flex items-center gap-1 text-[11px]"
                      title="Print Shipment / Delivery Challan Copy (শিপমেন্ট কপি)"
                    >
                      <Truck className="w-3.5 h-3.5 text-amber-600" /> Shipment Copy
                    </button>

                    <button
                      onClick={() => openPrintModal(buildPackingSlipData(o))}
                      className="p-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold rounded-lg border border-slate-200 inline-flex items-center gap-1 text-[11px]"
                      title="Print Packing Slip"
                    >
                      <PackageCheck className="w-3.5 h-3.5 text-amber-600" /> Slip
                    </button>

                    <button
                      onClick={() => openPrintModal(buildShippingLabelData(o))}
                      className="p-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold rounded-lg border border-slate-200 inline-flex items-center gap-1 text-[11px]"
                      title="Print Courier Shipping Label"
                    >
                      <Tag className="w-3.5 h-3.5 text-emerald-600" /> Label
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {activePrintData && (
        <EnterprisePrintModal
          data={activePrintData}
          isOpen={isPrintModalOpen}
          onClose={() => setIsPrintModalOpen(false)}
        />
      )}
    </div>
  );
};

