import React, { useState } from "react";
import { useStore } from "../../context/StoreContext";
import { PrintableDocumentData } from "../../types/print";
import { buildReportPrintData } from "../../utils/printDocumentBuilder";
import { EnterprisePrintModal } from "../common/EnterprisePrintModal";
import { exportToCSV } from "../../utils/exportUtils";
import { Shield, Search, Download, FileSpreadsheet, Lock, Printer } from "lucide-react";

export const AuditLogView: React.FC = () => {
  const { auditLogs } = useStore();
  const [search, setSearch] = useState("");

  const [activePrintData, setActivePrintData] = useState<PrintableDocumentData | null>(null);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState<boolean>(false);

  const openPrintModal = (data: PrintableDocumentData) => {
    setActivePrintData(data);
    setIsPrintModalOpen(true);
  };

  const filteredLogs = auditLogs.filter((log) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      log.userName.toLowerCase().includes(q) ||
      log.action.toLowerCase().includes(q) ||
      log.module.toLowerCase().includes(q) ||
      log.ipAddress.includes(q)
    );
  });

  const handleExportAuditCSV = () => {
    exportToCSV("Security_Audit_Logs", filteredLogs);
  };

  const handlePrintAuditReport = () => {
    const headers = ["Timestamp", "User & Role", "Action Performed", "Module", "IP Address", "User Agent"];
    const rawRows = filteredLogs.map((log) => [
      log.timestamp,
      `${log.userName} (${log.userRole})`,
      log.action,
      log.module,
      log.ipAddress,
      log.userAgent,
    ]);

    openPrintModal(buildReportPrintData("SECURITY AUDIT TRAIL LOG REPORT", headers, rawRows, "audit_log"));
  };

  return (
    <div className="space-y-6 pb-16">
      <div className="bg-slate-900 text-white p-6 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black tracking-tight">System Security Audit Logs</h1>
          <p className="text-xs text-slate-300">Immutable record of administrative actions, edits, IP & device timestamps</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportAuditCSV}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5"
          >
            <FileSpreadsheet className="w-4 h-4" /> Export CSV
          </button>

          <button
            onClick={handlePrintAuditReport}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5"
          >
            <Printer className="w-4 h-4" /> Print Audit Log
          </button>
        </div>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-slate-200">
        <div className="relative max-w-md">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search Action, User, Module or IP..."
            className="w-full bg-slate-50 text-xs pl-8 pr-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-x-auto shadow-xs">
        <table className="w-full text-xs text-left">
          <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-bold uppercase tracking-wider">
            <tr>
              <th className="p-3">Timestamp</th>
              <th className="p-3">User & Role</th>
              <th className="p-3">Action Performed</th>
              <th className="p-3">Module</th>
              <th className="p-3">IP Address</th>
              <th className="p-3">Device / Browser</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 text-slate-800">
            {filteredLogs.map((log) => (
              <tr key={log.id} className="hover:bg-slate-50">
                <td className="p-3 font-mono text-slate-500">{log.timestamp}</td>
                <td className="p-3 font-bold text-slate-900">
                  {log.userName} ({log.userRole})
                </td>
                <td className="p-3 font-medium text-blue-700">{log.action}</td>
                <td className="p-3 font-bold">{log.module}</td>
                <td className="p-3 font-mono text-slate-500">{log.ipAddress}</td>
                <td className="p-3 text-slate-400 max-w-xs truncate">{log.userAgent}</td>
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

