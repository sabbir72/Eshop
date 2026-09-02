import React, { useState } from "react";
import { useStore } from "../../context/StoreContext";
import { PrintableDocumentData } from "../../types/print";
import { buildReportPrintData } from "../../utils/printDocumentBuilder";
import { EnterprisePrintModal } from "../common/EnterprisePrintModal";
import {
  Headphones,
  RotateCcw,
  MessageSquare,
  AlertTriangle,
  Send,
  Eye,
  CheckCircle2,
  XCircle,
  Clock,
  Filter,
  ShieldAlert,
  User,
  Paperclip,
  Trash2,
  Printer,
} from "lucide-react";
import { SupportTicket, ReturnRequest, TicketMessage } from "../../types";

export const CustomerSupportManagement: React.FC = () => {
  const {
    supportTickets,
    updateSupportTicket,
    addTicketMessage,
    escalateTicket,
    deleteSupportTicket,
    returnRequests,
    updateReturnRequest,
    deleteReturnRequest,
    hasPermission,
    currentUser,
  } = useStore();

  const [activeTab, setActiveTab] = useState<"tickets" | "returns">("tickets");

  const [activePrintData, setActivePrintData] = useState<PrintableDocumentData | null>(null);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState<boolean>(false);

  const openPrintModal = (data: PrintableDocumentData) => {
    setActivePrintData(data);
    setIsPrintModalOpen(true);
  };

  // Ticket Filters
  const [ticketStatusFilter, setTicketStatusFilter] = useState<string>("all");
  const [ticketPriorityFilter, setTicketPriorityFilter] = useState<string>("all");

  // Selected Ticket State
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [replyMessage, setReplyMessage] = useState("");
  const [escalateNote, setEscalateNote] = useState("");
  const [showEscalateBox, setShowEscalateBox] = useState(false);

  // Return Requests Filters
  const [returnStatusFilter, setReturnStatusFilter] = useState<string>("all");
  const [selectedReturn, setSelectedReturn] = useState<ReturnRequest | null>(null);

  const canEdit = hasPermission("Support", "edit");
  const canDelete = hasPermission("Support", "delete");

  // Ticket Handlers
  const handleSendTicketReply = () => {
    if (!selectedTicket || !replyMessage.trim()) return;
    addTicketMessage(
      selectedTicket.id,
      "Support Agent",
      `${currentUser.name} (Support)`,
      replyMessage
    );
    setReplyMessage("");
    // Refresh selected ticket reference
    const refreshed = supportTickets.find((t) => t.id === selectedTicket.id);
    if (refreshed) setSelectedTicket(refreshed);
  };

  const handleEscalatePriority = (p: "Low" | "Medium" | "High" | "Urgent") => {
    if (!selectedTicket) return;
    escalateTicket(selectedTicket.id, p, escalateNote);
    setShowEscalateBox(false);
    setEscalateNote("");
  };

  const filteredTickets = supportTickets.filter((t) => {
    if (ticketStatusFilter !== "all" && t.status.toLowerCase() !== ticketStatusFilter.toLowerCase()) return false;
    if (ticketPriorityFilter !== "all" && t.priority.toLowerCase() !== ticketPriorityFilter.toLowerCase()) return false;
    return true;
  });

  const filteredReturns = returnRequests.filter((r) => {
    if (returnStatusFilter !== "all" && r.status.toLowerCase() !== returnStatusFilter.toLowerCase()) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Headphones className="w-7 h-7 text-indigo-600" />
            Customer Care & Ticketing Center
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Resolve customer inquiries, handle priority ticket escalations, and audit return/refund requests.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              if (activeTab === "tickets") {
                const headers = ["Ticket ID", "Customer Name", "Subject", "Priority", "Status", "Last Response"];
                const rawRows = filteredTickets.map((t) => [
                  t.id,
                  t.customerName,
                  t.subject,
                  t.priority,
                  t.status,
                  t.lastResponseAt,
                ]);
                openPrintModal(buildReportPrintData("CUSTOMER SUPPORT TICKETS AUDIT REPORT", headers, rawRows, "support_tickets"));
              } else {
                const headers = ["RMA #", "Order Number", "Customer", "Reason", "Status", "Submitted Date"];
                const rawRows = filteredReturns.map((r) => [
                  r.id,
                  r.orderNumber,
                  r.customerName,
                  r.reason,
                  r.status,
                  r.createdAt,
                ]);
                openPrintModal(buildReportPrintData("CUSTOMER RETURN & REFUND REQUESTS REPORT", headers, rawRows, "rma_report"));
              }
            }}
            className="px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs rounded-xl border border-indigo-200 transition-colors flex items-center gap-1.5"
          >
            <Printer className="w-4 h-4 text-indigo-600" /> Print Report
          </button>

          <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl">

          <button
            onClick={() => setActiveTab("tickets")}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${
              activeTab === "tickets"
                ? "bg-white text-indigo-600 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Support Tickets
            {supportTickets.filter((t) => t.status === "Open").length > 0 && (
              <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                {supportTickets.filter((t) => t.status === "Open").length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("returns")}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${
              activeTab === "returns"
                ? "bg-white text-indigo-600 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Return Requests
            {returnRequests.filter((r) => r.status === "Requested").length > 0 && (
              <span className="bg-amber-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                {returnRequests.filter((r) => r.status === "Requested").length}
              </span>
            )}
          </button>
        </div>
      </div>
    </div>

      {/* TAB 1: SUPPORT TICKETS */}
      {activeTab === "tickets" && (
        <div className="space-y-6">
          {/* Filters Bar */}
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-slate-400" />
                <span className="font-semibold text-slate-700">Status:</span>
                <select
                  value={ticketStatusFilter}
                  onChange={(e) => setTicketStatusFilter(e.target.value)}
                  className="border border-slate-200 rounded-lg px-3 py-1.5 bg-slate-50 outline-none"
                >
                  <option value="all">All Statuses</option>
                  <option value="open">Open</option>
                  <option value="in progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-700">Priority:</span>
                <select
                  value={ticketPriorityFilter}
                  onChange={(e) => setTicketPriorityFilter(e.target.value)}
                  className="border border-slate-200 rounded-lg px-3 py-1.5 bg-slate-50 outline-none"
                >
                  <option value="all">All Priorities</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
            </div>

            <div className="text-xs text-slate-500 font-medium">
              Showing {filteredTickets.length} of {supportTickets.length} tickets
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500 font-bold">
                    <th className="p-4">Ticket No</th>
                    <th className="p-4">Customer</th>
                    <th className="p-4">Subject & Category</th>
                    <th className="p-4">Priority</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {filteredTickets.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-400">
                        No support tickets found matching criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredTickets.map((ticket) => (
                      <tr key={ticket.id} className="hover:bg-slate-50/80 transition">
                        <td className="p-4 font-mono text-xs font-bold text-indigo-700">
                          {ticket.ticketNumber}
                        </td>

                        <td className="p-4">
                          <div className="font-bold text-slate-900">{ticket.customerName}</div>
                          <div className="text-xs text-slate-500">{ticket.customerEmail}</div>
                        </td>

                        <td className="p-4 max-w-xs">
                          <div className="font-semibold text-slate-800">{ticket.subject}</div>
                          <span className="inline-block mt-1 text-[10px] font-bold uppercase px-2 py-0.5 bg-slate-100 text-slate-600 rounded">
                            {ticket.category}
                          </span>
                        </td>

                        <td className="p-4 whitespace-nowrap">
                          <span
                            className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                              ticket.priority === "Urgent"
                                ? "bg-red-100 text-red-800 border border-red-300 animate-pulse"
                                : ticket.priority === "High"
                                ? "bg-orange-100 text-orange-800"
                                : ticket.priority === "Medium"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-slate-100 text-slate-700"
                            }`}
                          >
                            {ticket.priority}
                          </span>
                        </td>

                        <td className="p-4 whitespace-nowrap">
                          <select
                            value={ticket.status}
                            onChange={(e) =>
                              updateSupportTicket(ticket.id, {
                                status: e.target.value as SupportTicket["status"],
                              })
                            }
                            className={`px-2.5 py-1 rounded-full text-xs font-bold outline-none border cursor-pointer ${
                              ticket.status === "Open"
                                ? "bg-red-50 text-red-700 border-red-200"
                                : ticket.status === "In Progress"
                                ? "bg-amber-50 text-amber-700 border-amber-200"
                                : ticket.status === "Resolved"
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : "bg-slate-50 text-slate-700 border-slate-200"
                            }`}
                          >
                            <option value="Open">Open</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Resolved">Resolved</option>
                            <option value="Closed">Closed</option>
                          </select>
                        </td>

                        <td className="p-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => setSelectedTicket(ticket)}
                              className="px-3 py-1.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-lg text-xs font-semibold flex items-center gap-1"
                            >
                              <Eye className="w-3.5 h-3.5" /> View Ticket
                            </button>
                            {canDelete && (
                              <button
                                onClick={() => deleteSupportTicket(ticket.id)}
                                className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: RETURN REQUESTS */}
      {activeTab === "returns" && (
        <div className="space-y-6">
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm">
              <Filter className="w-4 h-4 text-slate-400" />
              <span className="font-semibold text-slate-700">Filter Status:</span>
              <select
                value={returnStatusFilter}
                onChange={(e) => setReturnStatusFilter(e.target.value)}
                className="border border-slate-200 rounded-lg px-3 py-1.5 bg-slate-50 outline-none"
              >
                <option value="all">All Returns</option>
                <option value="requested">Requested</option>
                <option value="approved">Approved</option>
                <option value="refund processed">Refund Processed</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500 font-bold">
                    <th className="p-4">Return No & Order</th>
                    <th className="p-4">Customer Details</th>
                    <th className="p-4">Product & Reason</th>
                    <th className="p-4">Refund Amount</th>
                    <th className="p-4">Status Workflow</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {filteredReturns.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-400">
                        No return requests found.
                      </td>
                    </tr>
                  ) : (
                    filteredReturns.map((ret) => (
                      <tr key={ret.id} className="hover:bg-slate-50/80 transition">
                        <td className="p-4">
                          <div className="font-mono text-xs font-bold text-indigo-700">{ret.requestNumber}</div>
                          <div className="text-xs text-slate-500 font-mono">Order: {ret.orderNumber}</div>
                          <div className="text-[10px] text-slate-400">{ret.createdAt}</div>
                        </td>

                        <td className="p-4">
                          <div className="font-bold text-slate-900">{ret.customerName}</div>
                          <div className="text-xs text-slate-500">{ret.customerPhone}</div>
                        </td>

                        <td className="p-4 max-w-xs">
                          <div className="flex items-center gap-3">
                            <img src={ret.productImage} alt={ret.productName} className="w-10 h-10 object-cover rounded-lg border" />
                            <div>
                              <div className="font-semibold text-slate-800 text-xs truncate">{ret.productName}</div>
                              <span className="text-[10px] font-bold text-red-600 bg-red-50 px-1.5 py-0.5 rounded">
                                Reason: {ret.reason}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="p-4 whitespace-nowrap font-bold text-slate-900">
                          ৳{ret.refundAmount.toLocaleString()}
                        </td>

                        <td className="p-4 whitespace-nowrap">
                          <select
                            value={ret.status}
                            onChange={(e) =>
                              updateReturnRequest(ret.id, {
                                status: e.target.value as ReturnRequest["status"],
                              })
                            }
                            className={`px-2.5 py-1 rounded-full text-xs font-bold outline-none border cursor-pointer ${
                              ret.status === "Refund Processed"
                                ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                                : ret.status === "Approved"
                                ? "bg-blue-100 text-blue-800 border-blue-300"
                                : ret.status === "Requested"
                                ? "bg-amber-100 text-amber-800 border-amber-300"
                                : ret.status === "Rejected"
                                ? "bg-red-100 text-red-800 border-red-300"
                                : "bg-slate-100 text-slate-800 border-slate-300"
                            }`}
                          >
                            <option value="Requested">Requested</option>
                            <option value="Approved">Approved</option>
                            <option value="Product Received">Product Received</option>
                            <option value="Refund Processed">Refund Processed</option>
                            <option value="Rejected">Rejected</option>
                          </select>
                        </td>

                        <td className="p-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => setSelectedReturn(ret)}
                              className="px-3 py-1.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-lg text-xs font-semibold flex items-center gap-1"
                            >
                              <Eye className="w-3.5 h-3.5" /> View Photos
                            </button>
                            {canDelete && (
                              <button
                                onClick={() => deleteReturnRequest(ret.id)}
                                className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TICKET CONVERSATION MODAL */}
      {selectedTicket && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-indigo-600">
                    {selectedTicket.ticketNumber}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      selectedTicket.priority === "Urgent"
                        ? "bg-red-600 text-white"
                        : "bg-slate-100 text-slate-700"
                    }`}
                  >
                    {selectedTicket.priority} Priority
                  </span>
                </div>
                <h3 className="font-bold text-slate-900 text-lg mt-1">{selectedTicket.subject}</h3>
                <p className="text-xs text-slate-500">
                  Customer: {selectedTicket.customerName} ({selectedTicket.customerEmail})
                </p>
              </div>
              <button
                onClick={() => setSelectedTicket(null)}
                className="text-slate-400 hover:text-slate-600 text-xl font-bold"
              >
                &times;
              </button>
            </div>

            {/* Conversation Log */}
            <div className="flex-1 overflow-y-auto space-y-3 p-3 bg-slate-50 rounded-xl border border-slate-200 min-h-[250px]">
              {selectedTicket.messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`p-3 rounded-xl max-w-md text-xs space-y-1 ${
                    msg.sender === "Customer"
                      ? "bg-white border border-slate-200 ml-0 mr-auto"
                      : msg.sender === "Support Agent"
                      ? "bg-indigo-600 text-white ml-auto mr-0"
                      : "bg-amber-100 border border-amber-200 text-amber-900 mx-auto text-center"
                  }`}
                >
                  <div className="flex items-center justify-between gap-4 text-[10px] opacity-80">
                    <span className="font-bold">{msg.senderName}</span>
                    <span>{msg.createdAt}</span>
                  </div>
                  <p className="leading-relaxed whitespace-pre-line text-sm">{msg.message}</p>
                </div>
              ))}
            </div>

            {/* Reply Input Box */}
            <div className="space-y-3 pt-2 border-t">
              <textarea
                rows={3}
                placeholder="Type response to customer..."
                value={replyMessage}
                onChange={(e) => setReplyMessage(e.target.value)}
                className="w-full border border-slate-200 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
              />

              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setShowEscalateBox(!showEscalateBox)}
                  className="text-xs text-orange-600 hover:text-orange-800 font-bold flex items-center gap-1"
                >
                  <AlertTriangle className="w-3.5 h-3.5" /> Escalate Ticket Priority
                </button>

                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedTicket(null)}
                    className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-semibold hover:bg-slate-50"
                  >
                    Close
                  </button>
                  <button
                    onClick={handleSendTicketReply}
                    disabled={!replyMessage.trim()}
                    className="px-5 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" /> Send Response
                  </button>
                </div>
              </div>

              {showEscalateBox && (
                <div className="p-3 bg-orange-50 border border-orange-200 rounded-xl space-y-2">
                  <span className="text-xs font-bold text-orange-900 block">
                    Escalate Priority Level
                  </span>
                  <div className="flex gap-2">
                    {(["Low", "Medium", "High", "Urgent"] as const).map((p) => (
                      <button
                        key={p}
                        onClick={() => handleEscalatePriority(p)}
                        className="px-3 py-1 bg-white border border-orange-300 rounded-lg text-xs font-bold text-orange-800 hover:bg-orange-100"
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* RETURN DETAILS MODAL */}
      {selectedReturn && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-lg">Return Request #{selectedReturn.requestNumber}</h3>
                <p className="text-xs text-slate-500">Order: {selectedReturn.orderNumber}</p>
              </div>
              <button
                onClick={() => setSelectedReturn(null)}
                className="text-slate-400 hover:text-slate-600 text-xl font-bold"
              >
                &times;
              </button>
            </div>

            <div className="space-y-3 text-sm">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div className="font-bold text-slate-900">{selectedReturn.productName}</div>
                <div className="text-xs text-red-600 font-bold mt-1">Reason: {selectedReturn.reason}</div>
                <p className="text-xs text-slate-700 mt-2 bg-white p-2.5 rounded-lg border border-slate-200">
                  "{selectedReturn.details}"
                </p>
              </div>

              <div>
                <h4 className="font-bold text-slate-800 text-xs uppercase mb-2">Submitted Damage / Defect Proof Photos</h4>
                <div className="flex gap-2">
                  {selectedReturn.images.map((img, i) => (
                    <img key={i} src={img} alt="Return proof" className="w-20 h-20 object-cover rounded-xl border" />
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t">
              <button
                onClick={() => setSelectedReturn(null)}
                className="px-5 py-2 bg-slate-900 text-white rounded-xl text-sm font-semibold hover:bg-slate-800"
              >
                Close Audit
              </button>
            </div>
          </div>
        </div>
      )}

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

