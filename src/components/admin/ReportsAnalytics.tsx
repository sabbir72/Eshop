import React, { useState } from "react";
import { useStore } from "../../context/StoreContext";
import { PrintableDocumentData } from "../../types/print";
import { buildReportPrintData } from "../../utils/printDocumentBuilder";
import { EnterprisePrintModal } from "../common/EnterprisePrintModal";
import { exportToCSV, exportToPDFReport } from "../../utils/exportUtils";
import { FileText, Download, FileSpreadsheet, TrendingUp, DollarSign, Package, Users, Printer } from "lucide-react";

export const ReportsAnalytics: React.FC = () => {
  const { orders, products, users, settings, hasPermission } = useStore();

  const [activePrintData, setActivePrintData] = useState<PrintableDocumentData | null>(null);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState<boolean>(false);

  const openPrintModal = (data: PrintableDocumentData) => {
    setActivePrintData(data);
    setIsPrintModalOpen(true);
  };

  const totalRevenue = orders.reduce((acc, o) => acc + o.total, 0);
  const totalCost = products.reduce((acc, p) => acc + p.costPrice * p.totalStock, 0);
  const estimatedProfit = Math.max(0, totalRevenue - totalCost * 0.1);

  const handleExportCSV = () => {
    const reportData = orders.map((o) => ({
      OrderNumber: o.orderNumber,
      Customer: o.customerName,
      Date: o.createdAt,
      TotalAmount: o.total,
      PaymentMethod: o.paymentMethod,
      Status: o.orderStatus,
    }));
    exportToCSV("Sales_Performance_Report", reportData);
  };

  const handlePrintReport = () => {
    const headers = ["Order Number", "Customer Name", "Date", "Payment Method", "Status", "Revenue Amount"];
    const rawRows = orders.map((o) => [
      o.orderNumber,
      o.customerName,
      o.createdAt,
      o.paymentMethod,
      o.orderStatus,
      `${settings.currencySymbol}${o.total.toLocaleString()}`,
    ]);

    openPrintModal(buildReportPrintData("EXECUTIVE SALES & REVENUE REPORT", headers, rawRows, "sales_report"));
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header Banner */}
      <div className="bg-slate-900 text-white p-6 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight">Executive Reports & Intelligence</h1>
          <p className="text-xs text-slate-300">Sales performance, inventory valuation & profit analytics</p>
        </div>

        <div className="flex items-center gap-2">
          {hasPermission("Reports", "export") && (
            <>
              <button
                onClick={handleExportCSV}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3 py-2 rounded-xl flex items-center gap-1.5 shadow-xs"
              >
                <FileSpreadsheet className="w-4 h-4" /> Export CSV
              </button>

              <button
                onClick={handlePrintReport}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-3 py-2 rounded-xl flex items-center gap-1.5 shadow-xs"
              >
                <Printer className="w-4 h-4" /> Print Report
              </button>
            </>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-slate-500 font-semibold block">Gross Sales Revenue</span>
          <div className="text-2xl font-black text-slate-900">
            {settings.currencySymbol}{totalRevenue.toLocaleString()}
          </div>
          <p className="text-emerald-600 font-bold flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" /> +24% YoY growth
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-slate-500 font-semibold block">Total Inventory Valuation</span>
          <div className="text-2xl font-black text-slate-900">
            {settings.currencySymbol}{totalCost.toLocaleString()}
          </div>
          <p className="text-slate-500">Asset value across all warehouses</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-slate-500 font-semibold block">Estimated Net Profit Margin</span>
          <div className="text-2xl font-black text-blue-600">
            {settings.currencySymbol}{estimatedProfit.toLocaleString()}
          </div>
          <p className="text-blue-600 font-bold">28.5% net margin</p>
        </div>
      </div>

      {/* Sales Report Table */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <h3 className="font-bold text-slate-900 text-sm border-b border-slate-200 pb-3">Sales Breakdown Log</h3>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-bold uppercase tracking-wider">
              <tr>
                <th className="p-3">Order Number</th>
                <th className="p-3">Customer</th>
                <th className="p-3">Date</th>
                <th className="p-3">Payment Method</th>
                <th className="p-3">Revenue Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-slate-800">
              {orders.map((o) => (
                <tr key={o.id} className="hover:bg-slate-50">
                  <td className="p-3 font-extrabold text-slate-900">{o.orderNumber}</td>
                  <td className="p-3 font-semibold">{o.customerName}</td>
                  <td className="p-3 font-mono">{o.createdAt}</td>
                  <td className="p-3">{o.paymentMethod}</td>
                  <td className="p-3 font-black text-slate-900">
                    {settings.currencySymbol}{o.total.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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

