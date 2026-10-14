import React, { useState, useMemo } from "react";
import { useStore } from "../../context/StoreContext";
import { PrintableDocumentData } from "../../types/print";
import { buildReportPrintData } from "../../utils/printDocumentBuilder";
import { EnterprisePrintModal } from "../common/EnterprisePrintModal";
import {
  exportToCSV,
  exportToExcel,
} from "../../utils/exportUtils";
import {
  generateRealisticCustomerReply,
  generateRealisticServiceResolution,
} from "../../services/aiRealisticReplyService";
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
  Sparkles,
  PhoneCall,
  Search,
  Check,
  TrendingUp,
  FileSpreadsheet,
  Download,
  Plus,
  RefreshCw,
  ExternalLink,
  Bot,
  Zap,
  Tag,
  ThumbsUp,
  Copy,
  Users,
  Shield,
  LifeBuoy,
  MessageCircle,
  BarChart3,
  Calendar,
  Flame,
  Star,
} from "lucide-react";
import { SupportTicket, ReturnRequest, TicketMessage } from "../../types";

type ServiceSubTab = "tickets" | "quick-handler" | "live-console" | "returns" | "faq-sync" | "analytics";

export const CustomerSupportManagement: React.FC = () => {
  const {
    supportTickets,
    addSupportTicket,
    updateSupportTicket,
    addTicketMessage,
    escalateTicket,
    deleteSupportTicket,
    returnRequests,
    updateReturnRequest,
    deleteReturnRequest,
    hasPermission,
    currentUser,
    orders,
    products,
    faqs,
    addToast,
  } = useStore();

  const [activeTab, setActiveTab] = useState<ServiceSubTab>("tickets");

  const [activePrintData, setActivePrintData] = useState<PrintableDocumentData | null>(null);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState<boolean>(false);

  const openPrintModal = (data: PrintableDocumentData) => {
    setActivePrintData(data);
    setIsPrintModalOpen(true);
  };

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [ticketStatusFilter, setTicketStatusFilter] = useState<string>("all");
  const [ticketPriorityFilter, setTicketPriorityFilter] = useState<string>("all");
  const [ticketCategoryFilter, setTicketCategoryFilter] = useState<string>("all");
  const [ticketChannelFilter, setTicketChannelFilter] = useState<string>("all");

  // Selected Ticket State
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [replyMessage, setReplyMessage] = useState("");
  const [escalateNote, setEscalateNote] = useState("");
  const [showEscalateBox, setShowEscalateBox] = useState(false);
  const [internalNoteInput, setInternalNoteInput] = useState("");
  const [isAiDrafting, setIsAiDrafting] = useState(false);
  const [aiDraftResolution, setAiDraftResolution] = useState<{
    bengali: string;
    english: string;
    suggestedAction: string;
    suggestedVoucher?: string;
  } | null>(null);

  // Return Requests Filters & State
  const [returnStatusFilter, setReturnStatusFilter] = useState<string>("all");
  const [selectedReturn, setSelectedReturn] = useState<ReturnRequest | null>(null);

  // New Ticket Creation Modal State
  const [isCreateTicketOpen, setIsCreateTicketOpen] = useState(false);
  const [newCustomerName, setNewCustomerName] = useState("");
  const [newCustomerEmail, setNewCustomerEmail] = useState("");
  const [newCustomerPhone, setNewCustomerPhone] = useState("+8801");
  const [newSubject, setNewSubject] = useState("");
  const [newCategory, setNewCategory] = useState<SupportTicket["category"]>("Order");
  const [newPriority, setNewPriority] = useState<SupportTicket["priority"]>("Medium");
  const [newChannel, setNewChannel] = useState<NonNullable<SupportTicket["channel"]>>("Web Ticket");
  const [newOrderNumber, setNewOrderNumber] = useState("");
  const [newInitialMsg, setNewInitialMsg] = useState("");

  // Customer Objection Handler Simulator State
  const [handlerCustomerQuery, setHandlerCustomerQuery] = useState("");
  const [handlerTone, setHandlerTone] = useState<"Empathetic" | "Firm" | "Conciliatory" | "Commercial">("Empathetic");
  const [handlerChannel, setHandlerChannel] = useState<"Live Chat" | "WhatsApp" | "Phone Call" | "Email">("WhatsApp");
  const [isHandlerProcessing, setIsHandlerProcessing] = useState(false);
  const [handlerResult, setHandlerResult] = useState<{
    bengaliReply: string;
    englishReply: string;
    psychologicalTactic: string;
    recommendedPerk: string;
    suggestedCoupon?: string;
  } | null>(null);

  const canEdit = hasPermission("Support", "edit");
  const canDelete = hasPermission("Support", "delete");

  // Filtered Tickets
  const filteredTickets = useMemo(() => {
    return supportTickets.filter((t) => {
      if (ticketStatusFilter !== "all" && t.status.toLowerCase() !== ticketStatusFilter.toLowerCase()) return false;
      if (ticketPriorityFilter !== "all" && t.priority.toLowerCase() !== ticketPriorityFilter.toLowerCase()) return false;
      if (ticketCategoryFilter !== "all" && t.category.toLowerCase() !== ticketCategoryFilter.toLowerCase()) return false;
      if (ticketChannelFilter !== "all" && (t.channel || "Web Ticket").toLowerCase() !== ticketChannelFilter.toLowerCase()) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesNo = t.ticketNumber.toLowerCase().includes(q);
        const matchesName = t.customerName.toLowerCase().includes(q);
        const matchesEmail = t.customerEmail.toLowerCase().includes(q);
        const matchesSubject = t.subject.toLowerCase().includes(q);
        const matchesOrder = t.orderNumber ? t.orderNumber.toLowerCase().includes(q) : false;
        if (!matchesNo && !matchesName && !matchesEmail && !matchesSubject && !matchesOrder) {
          return false;
        }
      }
      return true;
    });
  }, [supportTickets, ticketStatusFilter, ticketPriorityFilter, ticketCategoryFilter, ticketChannelFilter, searchQuery]);

  // Filtered Returns
  const filteredReturns = useMemo(() => {
    return returnRequests.filter((r) => {
      if (returnStatusFilter !== "all" && r.status.toLowerCase() !== returnStatusFilter.toLowerCase()) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesReq = r.requestNumber.toLowerCase().includes(q);
        const matchesOrder = r.orderNumber.toLowerCase().includes(q);
        const matchesCust = r.customerName.toLowerCase().includes(q);
        const matchesProd = r.productName.toLowerCase().includes(q);
        if (!matchesReq && !matchesOrder && !matchesCust && !matchesProd) return false;
      }
      return true;
    });
  }, [returnRequests, returnStatusFilter, searchQuery]);

  // Support Executive / Agent Stats
  const metrics = useMemo(() => {
    const total = supportTickets.length;
    const open = supportTickets.filter((t) => t.status === "Open").length;
    const inProgress = supportTickets.filter((t) => t.status === "In Progress").length;
    const resolved = supportTickets.filter((t) => t.status === "Resolved").length;
    const urgent = supportTickets.filter((t) => t.priority === "Urgent" && t.status !== "Resolved" && t.status !== "Closed").length;
    const pendingRma = returnRequests.filter((r) => r.status === "Requested").length;
    const avgCsat = (
      supportTickets.filter((t) => t.csatRating).reduce((acc, curr) => acc + (curr.csatRating || 0), 0) /
      Math.max(1, supportTickets.filter((t) => t.csatRating).length)
    ).toFixed(1);

    return { total, open, inProgress, resolved, urgent, pendingRma, avgCsat };
  }, [supportTickets, returnRequests]);

  // Send Ticket Reply
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
    addToast("Response sent to customer!", "success");
  };

  // Add Internal Note to Ticket
  const handleAddInternalNote = () => {
    if (!selectedTicket || !internalNoteInput.trim()) return;
    const updatedNotes = [...(selectedTicket.internalNotes || []), `${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} - ${currentUser.name}: ${internalNoteInput.trim()}`];
    updateSupportTicket(selectedTicket.id, { internalNotes: updatedNotes });
    setSelectedTicket({ ...selectedTicket, internalNotes: updatedNotes });
    setInternalNoteInput("");
    addToast("Internal staff note logged", "info");
  };

  // Escalate Priority
  const handleEscalatePriority = (p: "Low" | "Medium" | "High" | "Urgent") => {
    if (!selectedTicket) return;
    escalateTicket(selectedTicket.id, p, escalateNote);
    setShowEscalateBox(false);
    setEscalateNote("");
    const refreshed = supportTickets.find((t) => t.id === selectedTicket.id);
    if (refreshed) setSelectedTicket({ ...refreshed, priority: p });
    addToast(`Ticket #${selectedTicket.ticketNumber} escalated to ${p} priority!`, "warning");
  };

  // Quick One-Click Status Change
  const handleQuickStatusChange = (ticketId: string, newStatus: SupportTicket["status"]) => {
    updateSupportTicket(ticketId, {
      status: newStatus,
      resolvedAt: newStatus === "Resolved" ? new Date().toISOString().replace("T", " ").substring(0, 16) : undefined,
    });
    if (selectedTicket && selectedTicket.id === ticketId) {
      setSelectedTicket((prev) => (prev ? { ...prev, status: newStatus } : null));
    }
  };

  // AI-Powered Ticket Resolution Generator
  const handleGenerateAiResolution = async () => {
    if (!selectedTicket) return;
    setIsAiDrafting(true);

    const firstMsg = selectedTicket.messages[0]?.message || selectedTicket.subject;
    const cat = selectedTicket.category;

    try {
      const res = await fetch("/api/ai/agent/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          task: "customer_service",
          payload: {
            ticketId: selectedTicket.ticketNumber,
            customerName: selectedTicket.customerName,
            orderId: selectedTicket.orderNumber || "General Account",
            category: cat,
            complaintDetails: `${selectedTicket.subject} - ${firstMsg}`,
          },
          storeContext: {
            productsCount: products.length,
            faqCategoriesCount: faqs.length,
            returnPolicyDays: 7,
          },
        }),
      });
      const data = await res.json();
      if (data && (data.officialReplyBengali || data.officialReplyEnglish)) {
        setAiDraftResolution({
          bengali: data.officialReplyBengali || "",
          english: data.officialReplyEnglish || "",
          suggestedAction: data.policyCheck || "Approved per store guarantee",
          suggestedVoucher: data.suggestedCompensation || "CARE50",
        });
        setIsAiDrafting(false);
        addToast("AI Service resolution prepared with Bengali & English drafts!", "success");
        return;
      }
    } catch (e) {
      // offline rule-based fallback
    }

    // Dynamic, realistic service resolution generator
    setTimeout(() => {
      const realisticRes = generateRealisticServiceResolution({
        ticketId: selectedTicket.ticketNumber || selectedTicket.id,
        issueType: selectedTicket.category || "General Support",
        customerName: selectedTicket.customerName,
        orderId: selectedTicket.orderNumber || "ORD-RECENT",
        complaintDetails: `${selectedTicket.subject} - ${firstMsg}`,
        storeContext: {
          productsCount: products.length,
          returnDays: 7,
        },
      });

      setAiDraftResolution({
        bengali: realisticRes.officialReplyBengali,
        english: realisticRes.officialReplyEnglish,
        suggestedAction: realisticRes.policyCheck,
        suggestedVoucher: realisticRes.suggestedCompensation,
      });
      setIsAiDrafting(false);
      addToast("Dynamic Realistic AI Resolution generated!", "success");
    }, 600);
  };

  // Run Customer Objection Simulator
  const handleSimulateCustomerHandling = async (presetText?: string) => {
    const textToProcess = presetText || handlerCustomerQuery;
    if (!textToProcess.trim()) {
      addToast("Please enter customer query or objection", "warning");
      return;
    }

    setIsHandlerProcessing(true);

    try {
      const res = await fetch("/api/ai/agent/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          task: "customer_handling",
          payload: {
            customerMessage: textToProcess,
            tone: handlerTone,
            channel: handlerChannel,
          },
          storeContext: {
            totalProducts: products.length,
            deliveryChargeDhaka: 60,
            deliveryChargeOutside: 120,
            returnDays: 7,
          },
        }),
      });
      const data = await res.json();
      if (data && (data.suggestedResponseBengali || data.suggestedResponseEnglish)) {
        setHandlerResult({
          bengaliReply: data.suggestedResponseBengali,
          englishReply: data.suggestedResponseEnglish,
          psychologicalTactic: data.negotiationTactic || "Value Guarantee over Price Discount",
          recommendedPerk: data.recommendedAction || "Offer free delivery on order over ৳1,500",
          suggestedCoupon: "WELCOME5",
        });
        setIsHandlerProcessing(false);
        addToast("Customer handling response formulated!", "success");
        return;
      }
    } catch (e) {
      // offline heuristic
    }

    // Dynamic realistic customer handling simulation
    setTimeout(() => {
      const dynamicCust = generateRealisticCustomerReply({
        customerMessage: textToProcess,
        storeContext: {
          productsCount: products.length,
          sampleProducts: products.slice(0, 5).map((p) => ({
            name: p.name,
            price: p.price,
            category: p.categoryName,
          })),
          deliveryChargeDhaka: 60,
          deliveryChargeOutside: 120,
          returnDays: 7,
        },
      });

      setHandlerResult({
        bengaliReply: dynamicCust.suggestedResponseBengali,
        englishReply: dynamicCust.suggestedResponseEnglish,
        psychologicalTactic: dynamicCust.negotiationTactic,
        recommendedPerk: dynamicCust.recommendedAction,
        suggestedCoupon: dynamicCust.quickAction?.type === "coupon" ? dynamicCust.quickAction.value : "WELCOME5",
      });
      setIsHandlerProcessing(false);
      addToast("Dynamic realistic response formulated!", "success");
    }, 600);
  };

  // Copy helper
  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    addToast(`${label} copied to clipboard!`, "success");
  };

  // Submit New Ticket
  const handleCreateNewTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustomerName.trim() || !newSubject.trim() || !newInitialMsg.trim()) {
      addToast("Please fill in customer name, subject, and message", "error");
      return;
    }

    addSupportTicket(
      {
        customerId: `usr-${Date.now()}`,
        customerName: newCustomerName.trim(),
        customerEmail: newCustomerEmail.trim() || "customer@example.com",
        customerPhone: newCustomerPhone.trim(),
        subject: newSubject.trim(),
        category: newCategory,
        priority: newPriority,
        channel: newChannel,
        orderNumber: newOrderNumber.trim() || undefined,
        assignedAgent: currentUser.name,
        slaStatus: "On Time",
        slaDueHours: newPriority === "Urgent" ? 2 : newPriority === "High" ? 6 : 12,
        tags: [newCategory, newChannel],
      },
      newInitialMsg.trim()
    );

    setIsCreateTicketOpen(false);
    setNewCustomerName("");
    setNewCustomerEmail("");
    setNewCustomerPhone("+8801");
    setNewSubject("");
    setNewOrderNumber("");
    setNewInitialMsg("");
    addToast("New Support Ticket created and assigned!", "success");
  };

  // Export Tickets to Excel / CSV
  const handleExportTickets = (format: "excel" | "csv") => {
    const rows = filteredTickets.map((t) => ({
      "Ticket Number": t.ticketNumber,
      "Customer Name": t.customerName,
      "Customer Email": t.customerEmail,
      "Customer Phone": t.customerPhone || "N/A",
      "Subject": t.subject,
      "Category": t.category,
      "Priority": t.priority,
      "Status": t.status,
      "Channel": t.channel || "Web Ticket",
      "Order Number": t.orderNumber || "N/A",
      "Assigned Agent": t.assignedAgent || "Unassigned",
      "SLA Status": t.slaStatus || "On Time",
      "CSAT Rating": t.csatRating ? `${t.csatRating} / 5` : "Unrated",
      "Total Messages": t.messages.length,
      "Created At": t.createdAt,
      "Updated At": t.updatedAt,
      "Resolved At": t.resolvedAt || "N/A",
    }));

    if (format === "excel") {
      exportToExcel("Service_Desk_Tickets_Report", "Support Tickets", rows);
      addToast("Exported support tickets to Excel (.xlsx)", "success");
    } else {
      exportToCSV("Service_Desk_Tickets_Report", rows);
      addToast("Exported support tickets to CSV", "success");
    }
  };

  // Export Returns to Excel / CSV
  const handleExportReturns = (format: "excel" | "csv") => {
    const rows = filteredReturns.map((r) => ({
      "RMA Request #": r.requestNumber,
      "Order Number": r.orderNumber,
      "Customer Name": r.customerName,
      "Customer Phone": r.customerPhone,
      "Product Name": r.productName,
      "Return Reason": r.reason,
      "Details": r.details,
      "Refund Amount (BDT)": r.refundAmount,
      "Status": r.status,
      "Created Date": r.createdAt,
      "Updated Date": r.updatedAt,
    }));

    if (format === "excel") {
      exportToExcel("RMA_Return_Audit_Report", "Return Requests", rows);
      addToast("Exported RMA return requests to Excel (.xlsx)", "success");
    } else {
      exportToCSV("RMA_Return_Audit_Report", rows);
      addToast("Exported RMA return requests to CSV", "success");
    }
  };

  return (
    <div className="space-y-6 pb-20">
      {/* ======================================================== */}
      {/* EXECUTIVE SERVICE DESK & CUSTOMER HANDLER HERO COMMAND   */}
      {/* ======================================================== */}
      <div className="bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 text-white p-6 sm:p-7 rounded-3xl shadow-xl border border-indigo-900/40 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-2xs">
                <LifeBuoy className="w-3.5 h-3.5 text-indigo-400" />
                Omnichannel Service Desk
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-black uppercase flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live Telemetry Active
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[10px] font-bold">
                AI Agent Integrated
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-3">
              <Headphones className="w-8 h-8 text-indigo-400 shrink-0" />
              <span>Customer Handler & Service Desk Hub</span>
            </h1>

            <p className="text-slate-300 text-xs sm:text-sm max-w-3xl leading-relaxed">
              সেন্ট্রালাইজড গ্রাহক সেবা, লাইভ চ্যাট ট্র্যাকিং, টিকিটিং SLA পর্যবেক্ষণ, এআই অবজেকশন হ্যান্ডলার এবং আরএমএ (RMA) রিটার্ন অডিট সমন্বিত বিশ্বমানের সাপোর্ট কমান্ড সেন্টার।
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={() => setIsCreateTicketOpen(true)}
              className="px-4 py-2.5 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white font-black text-xs rounded-xl shadow-lg shadow-indigo-600/30 transition flex items-center gap-2 active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Ticket</span>
            </button>

            <button
              onClick={() => {
                if (activeTab === "returns") {
                  handleExportReturns("excel");
                } else {
                  handleExportTickets("excel");
                }
              }}
              className="px-3.5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl border border-emerald-500/50 shadow-xs transition flex items-center gap-1.5 cursor-pointer"
              title="Download Excel Spreadsheet"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-200" />
              <span>Excel Export</span>
            </button>

            <button
              onClick={() => {
                if (activeTab === "returns") {
                  const headers = ["RMA #", "Order Number", "Customer", "Product", "Refund (৳)", "Status", "Date"];
                  const rawRows = filteredReturns.map((r) => [
                    r.requestNumber,
                    r.orderNumber,
                    r.customerName,
                    r.productName,
                    `৳${r.refundAmount}`,
                    r.status,
                    r.createdAt,
                  ]);
                  openPrintModal(buildReportPrintData("CUSTOMER RMA & REFUND AUDIT SLIP", headers, rawRows, "rma_report"));
                } else {
                  const headers = ["Ticket No", "Customer", "Subject", "Category", "Priority", "Status", "Agent", "Created"];
                  const rawRows = filteredTickets.map((t) => [
                    t.ticketNumber,
                    t.customerName,
                    t.subject,
                    t.category,
                    t.priority,
                    t.status,
                    t.assignedAgent || "Unassigned",
                    t.createdAt,
                  ]);
                  openPrintModal(buildReportPrintData("SERVICE DESK OMNICHANNEL TICKETS AUDIT", headers, rawRows, "support_tickets"));
                }
              }}
              className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl border border-slate-700 shadow-xs transition flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-4 h-4 text-slate-300" />
              <span>Print Slip</span>
            </button>
          </div>
        </div>

        {/* Real-Time Telemetry KPI Tiles */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-6 mt-6 border-t border-white/10">
          <div className="bg-white/5 backdrop-blur-md p-3.5 rounded-2xl border border-white/10 space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Total Tickets
            </span>
            <p className="text-2xl font-black text-white">{metrics.total}</p>
            <span className="text-[10px] text-slate-400">All channels logged</span>
          </div>

          <div className="bg-white/5 backdrop-blur-md p-3.5 rounded-2xl border border-white/10 space-y-1">
            <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider block">
              Open / Unresolved
            </span>
            <p className="text-2xl font-black text-rose-400">{metrics.open}</p>
            <span className="text-[10px] text-rose-300 font-semibold">Immediate attention</span>
          </div>

          <div className="bg-white/5 backdrop-blur-md p-3.5 rounded-2xl border border-white/10 space-y-1">
            <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">
              In Progress
            </span>
            <p className="text-2xl font-black text-amber-400">{metrics.inProgress}</p>
            <span className="text-[10px] text-amber-300">Agents working</span>
          </div>

          <div className="bg-white/5 backdrop-blur-md p-3.5 rounded-2xl border border-white/10 space-y-1">
            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">
              Resolved & Closed
            </span>
            <p className="text-2xl font-black text-emerald-400">{metrics.resolved}</p>
            <span className="text-[10px] text-emerald-300 font-semibold">
              {metrics.total > 0 ? `${Math.round((metrics.resolved / metrics.total) * 100)}% Success` : "100%"}
            </span>
          </div>

          <div className="bg-white/5 backdrop-blur-md p-3.5 rounded-2xl border border-white/10 space-y-1">
            <span className="text-[10px] font-bold text-purple-300 uppercase tracking-wider block">
              Pending Returns
            </span>
            <p className="text-2xl font-black text-purple-300">{metrics.pendingRma}</p>
            <span className="text-[10px] text-purple-300">RMA Requests</span>
          </div>

          <div className="bg-white/5 backdrop-blur-md p-3.5 rounded-2xl border border-white/10 space-y-1">
            <span className="text-[10px] font-bold text-amber-300 uppercase tracking-wider block flex items-center gap-1">
              <Star className="w-3 h-3 text-amber-400 fill-amber-400" /> CSAT Score
            </span>
            <p className="text-2xl font-black text-amber-300">{metrics.avgCsat} <span className="text-xs text-slate-400 font-normal">/ 5.0</span></p>
            <span className="text-[10px] text-amber-300">Customer Satisfaction</span>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 6-PILLAR SERVICE DESK NAVIGATION TABS                    */}
      {/* ======================================================== */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => setActiveTab("tickets")}
          className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-extrabold flex items-center gap-2 whitespace-nowrap transition-all shadow-xs ${
            activeTab === "tickets"
              ? "bg-indigo-600 text-white shadow-indigo-600/20 shadow-md"
              : "bg-white text-slate-700 hover:bg-slate-50 border border-slate-200"
          }`}
        >
          <Headphones className="w-4 h-4" />
          <span>Tickets & Helpdesk</span>
          {metrics.open > 0 && (
            <span className="bg-rose-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-black">
              {metrics.open}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab("quick-handler")}
          className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-extrabold flex items-center gap-2 whitespace-nowrap transition-all shadow-xs ${
            activeTab === "quick-handler"
              ? "bg-cyan-600 text-white shadow-cyan-600/20 shadow-md"
              : "bg-white text-slate-700 hover:bg-slate-50 border border-slate-200"
          }`}
        >
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>Customer Objection Handler (AI)</span>
          <span className="bg-cyan-100 text-cyan-800 text-[9px] px-2 py-0.5 rounded-full font-bold">
            Interactive
          </span>
        </button>

        <button
          onClick={() => setActiveTab("returns")}
          className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-extrabold flex items-center gap-2 whitespace-nowrap transition-all shadow-xs ${
            activeTab === "returns"
              ? "bg-amber-600 text-white shadow-amber-600/20 shadow-md"
              : "bg-white text-slate-700 hover:bg-slate-50 border border-slate-200"
          }`}
        >
          <RotateCcw className="w-4 h-4" />
          <span>RMA & Return Requests</span>
          {metrics.pendingRma > 0 && (
            <span className="bg-amber-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-black">
              {metrics.pendingRma}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab("live-console")}
          className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-extrabold flex items-center gap-2 whitespace-nowrap transition-all shadow-xs ${
            activeTab === "live-console"
              ? "bg-purple-600 text-white shadow-purple-600/20 shadow-md"
              : "bg-white text-slate-700 hover:bg-slate-50 border border-slate-200"
          }`}
        >
          <MessageCircle className="w-4 h-4 text-emerald-400" />
          <span>Omnichannel Live Queue</span>
        </button>

        <button
          onClick={() => setActiveTab("faq-sync")}
          className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-extrabold flex items-center gap-2 whitespace-nowrap transition-all shadow-xs ${
            activeTab === "faq-sync"
              ? "bg-teal-600 text-white shadow-teal-600/20 shadow-md"
              : "bg-white text-slate-700 hover:bg-slate-50 border border-slate-200"
          }`}
        >
          <LifeBuoy className="w-4 h-4" />
          <span>Macro & FAQ Sync ({faqs.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("analytics")}
          className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-extrabold flex items-center gap-2 whitespace-nowrap transition-all shadow-xs ${
            activeTab === "analytics"
              ? "bg-slate-900 text-white shadow-slate-900/20 shadow-md"
              : "bg-white text-slate-700 hover:bg-slate-50 border border-slate-200"
          }`}
        >
          <BarChart3 className="w-4 h-4 text-indigo-400" />
          <span>SLA & CSAT Metrics</span>
        </button>
      </div>

      {/* ======================================================== */}
      {/* TAB 1: TICKETS & HELPDESK MANAGEMENT                     */}
      {/* ======================================================== */}
      {activeTab === "tickets" && (
        <div className="space-y-6">
          {/* Universal Search & Multi-Filter Toolbar */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl shadow-xs border border-slate-200 flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[280px]">
              {/* Search Bar */}
              <div className="relative flex-1 min-w-[200px]">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search ticket #, customer name, phone, order # or subject..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Status Filter */}
              <select
                value={ticketStatusFilter}
                onChange={(e) => setTicketStatusFilter(e.target.value)}
                className="border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 text-xs font-bold text-slate-700 outline-none cursor-pointer"
              >
                <option value="all">All Statuses</option>
                <option value="open">Open (Unresolved)</option>
                <option value="in progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>

              {/* Priority Filter */}
              <select
                value={ticketPriorityFilter}
                onChange={(e) => setTicketPriorityFilter(e.target.value)}
                className="border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 text-xs font-bold text-slate-700 outline-none cursor-pointer"
              >
                <option value="all">All Priorities</option>
                <option value="urgent">Urgent</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>

              {/* Category Filter */}
              <select
                value={ticketCategoryFilter}
                onChange={(e) => setTicketCategoryFilter(e.target.value)}
                className="border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 text-xs font-bold text-slate-700 outline-none cursor-pointer"
              >
                <option value="all">All Categories</option>
                <option value="order">Order Issues</option>
                <option value="shipping">Shipping & Courier</option>
                <option value="payment">Payment & bKash</option>
                <option value="coupons">Coupons & Vouchers</option>
                <option value="returns">Returns & RMA</option>
                <option value="general">General Support</option>
              </select>

              {/* Channel Filter */}
              <select
                value={ticketChannelFilter}
                onChange={(e) => setTicketChannelFilter(e.target.value)}
                className="border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 text-xs font-bold text-slate-700 outline-none cursor-pointer"
              >
                <option value="all">All Channels</option>
                <option value="web ticket">Web Ticket</option>
                <option value="live chat">Live Chat</option>
                <option value="whatsapp">WhatsApp</option>
                <option value="phone">Phone Call</option>
                <option value="email">Email</option>
              </select>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-500 font-bold shrink-0">
              <span>Showing {filteredTickets.length} of {supportTickets.length} tickets</span>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setTicketStatusFilter("all");
                  setTicketPriorityFilter("all");
                  setTicketCategoryFilter("all");
                  setTicketChannelFilter("all");
                }}
                className="p-1.5 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-lg transition"
                title="Reset Filters"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Tickets Table */}
          <div className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 uppercase text-[10px] text-slate-500 font-black tracking-wider">
                    <th className="p-3.5">Ticket & SLA</th>
                    <th className="p-3.5">Customer Profile</th>
                    <th className="p-3.5">Subject & Channel</th>
                    <th className="p-3.5">Category</th>
                    <th className="p-3.5">Priority</th>
                    <th className="p-3.5">Assigned Agent</th>
                    <th className="p-3.5">Workflow Status</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredTickets.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-12 text-center text-slate-400">
                        <Headphones className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                        <p className="font-bold text-sm text-slate-600">No support tickets found</p>
                        <p className="text-xs text-slate-400 mt-1">Try resetting the filters or create a new ticket.</p>
                      </td>
                    </tr>
                  ) : (
                    filteredTickets.map((ticket) => (
                      <tr key={ticket.id} className="hover:bg-slate-50/80 transition">
                        {/* Ticket No & SLA */}
                        <td className="p-3.5">
                          <div className="font-mono font-black text-indigo-700">{ticket.ticketNumber}</div>
                          <div className="text-[10px] text-slate-400 mt-0.5">{ticket.createdAt}</div>
                          {ticket.slaStatus && (
                            <span
                              className={`inline-block mt-1 px-1.5 py-0.5 rounded text-[9px] font-black uppercase ${
                                ticket.slaStatus === "Breached"
                                  ? "bg-red-100 text-red-700 border border-red-200"
                                  : ticket.slaStatus === "Warning"
                                  ? "bg-amber-100 text-amber-700 border border-amber-200"
                                  : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              }`}
                            >
                              SLA: {ticket.slaStatus}
                            </span>
                          )}
                        </td>

                        {/* Customer */}
                        <td className="p-3.5">
                          <div className="font-bold text-slate-900">{ticket.customerName}</div>
                          <div className="text-[11px] text-slate-500">{ticket.customerEmail}</div>
                          {ticket.customerPhone && (
                            <div className="text-[10px] font-mono text-slate-400">📞 {ticket.customerPhone}</div>
                          )}
                        </td>

                        {/* Subject & Channel */}
                        <td className="p-3.5 max-w-xs">
                          <div className="font-semibold text-slate-800 line-clamp-1">{ticket.subject}</div>
                          <div className="flex items-center gap-1.5 mt-1">
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-100">
                              {ticket.channel || "Web Ticket"}
                            </span>
                            {ticket.orderNumber && (
                              <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                                #{ticket.orderNumber}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Category */}
                        <td className="p-3.5 whitespace-nowrap">
                          <span className="text-[10px] font-black uppercase px-2 py-1 bg-slate-100 text-slate-700 rounded-lg">
                            {ticket.category}
                          </span>
                        </td>

                        {/* Priority */}
                        <td className="p-3.5 whitespace-nowrap">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-black ${
                              ticket.priority === "Urgent"
                                ? "bg-red-100 text-red-800 border border-red-300 animate-pulse"
                                : ticket.priority === "High"
                                ? "bg-orange-100 text-orange-800 border border-orange-200"
                                : ticket.priority === "Medium"
                                ? "bg-blue-100 text-blue-800 border border-blue-200"
                                : "bg-slate-100 text-slate-700"
                            }`}
                          >
                            {ticket.priority}
                          </span>
                        </td>

                        {/* Assigned Agent */}
                        <td className="p-3.5 whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <div className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 font-black text-[10px] flex items-center justify-center">
                              {ticket.assignedAgent ? ticket.assignedAgent.charAt(0) : "A"}
                            </div>
                            <span className="text-xs font-semibold text-slate-700">
                              {ticket.assignedAgent || "Unassigned"}
                            </span>
                          </div>
                        </td>

                        {/* Workflow Status Dropdown */}
                        <td className="p-3.5 whitespace-nowrap">
                          <select
                            value={ticket.status}
                            onChange={(e) => handleQuickStatusChange(ticket.id, e.target.value as SupportTicket["status"])}
                            className={`px-2.5 py-1 rounded-full text-[10px] font-black outline-none border cursor-pointer ${
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

                        {/* Actions */}
                        <td className="p-3.5 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => {
                                setSelectedTicket(ticket);
                                setAiDraftResolution(null);
                              }}
                              className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl font-bold text-xs flex items-center gap-1 transition"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>View & Reply</span>
                            </button>

                            {canDelete && (
                              <button
                                onClick={() => {
                                  if (confirm(`Delete support ticket #${ticket.ticketNumber}?`)) {
                                    deleteSupportTicket(ticket.id);
                                  }
                                }}
                                className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition"
                                title="Delete Ticket"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
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

      {/* ======================================================== */}
      {/* TAB 2: AI CUSTOMER OBJECTION HANDLER SIMULATOR           */}
      {/* ======================================================== */}
      {activeTab === "quick-handler" && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-cyan-900 via-slate-900 to-indigo-950 text-white p-6 rounded-3xl border border-cyan-800/40 shadow-xl space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-cyan-400 animate-pulse" />
              <h2 className="text-xl font-black">AI Customer Objection & Query Simulator</h2>
            </div>
            <p className="text-xs sm:text-sm text-cyan-100/80 max-w-3xl leading-relaxed">
              গ্রাহকের যেকোনো আপত্তি, দরকষাকষি বা জিজ্ঞাসা প্রবেশ করান। এআই এজেন্ট বাংলা ও ইংরেজিতে প্ররোচনামূলক ও পেশাদার উত্তর, ছাড় কুপন এবং সাইকোলজিক্যাল ট্যাকটিক তৈরি করে দেবে।
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Input Simulator Panel */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <MessageSquare className="w-5 h-5 text-cyan-600" />
                <h3 className="font-black text-slate-900 text-sm">Customer Objection Input</h3>
              </div>

              <div>
                <label className="font-bold text-xs text-slate-700 block mb-1">
                  Customer Message / Objection (গ্রাহকের কথা)
                </label>
                <textarea
                  rows={4}
                  value={handlerCustomerQuery}
                  onChange={(e) => setHandlerCustomerQuery(e.target.value)}
                  placeholder="e.g. দাম বেশি মনে হচ্ছে, অন্য দোকানে কম পাওয়া যাচ্ছে / পণ্য কি অরিজিনাল? / ডেলিভারি কখন পাবো?"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 font-medium focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <label className="font-bold text-slate-600 block mb-1">Tone Strategy</label>
                  <select
                    value={handlerTone}
                    onChange={(e) => setHandlerTone(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-bold text-slate-700 text-xs"
                  >
                    <option value="Empathetic">Empathetic (সহানুভূতিশীল)</option>
                    <option value="Firm">Firm / Assured (দৃঢ় ও নিশ্চিত)</option>
                    <option value="Conciliatory">Conciliatory (আপসপন্থী)</option>
                    <option value="Commercial">Commercial / Deal-Closer</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-600 block mb-1">Channel Medium</label>
                  <select
                    value={handlerChannel}
                    onChange={(e) => setHandlerChannel(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-bold text-slate-700 text-xs"
                  >
                    <option value="WhatsApp">WhatsApp Message</option>
                    <option value="Live Chat">Store Live Chat</option>
                    <option value="Phone Call">Phone Script</option>
                    <option value="Email">Formal Email</option>
                  </select>
                </div>
              </div>

              {/* Instant Bengali Presets */}
              <div className="space-y-1.5 pt-2 border-t border-slate-100">
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">
                  Quick Bengali Scenario Presets (১-ক্লিকে টেস্ট)
                </span>
                <div className="flex flex-col gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setHandlerCustomerQuery("দাম একটু কমানো যাবে কি? অন্য পেজে তো আরও ২০০ টাকা কমে দেখলাম।");
                      handleSimulateCustomerHandling("দাম একটু কমানো যাবে কি? অন্য পেজে তো আরও ২০০ টাকা কমে দেখলাম।");
                    }}
                    className="text-left p-2 bg-slate-50 hover:bg-cyan-50 hover:border-cyan-200 border border-slate-200 rounded-xl text-[11px] font-medium text-slate-700 transition"
                  >
                    💵 "দাম একটু কমানো যাবে? অন্য পেজে কমে পাচ্ছি।"
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setHandlerCustomerQuery("পণ্যটি কি ১০০% আসল ব্র্যান্ডের? কপি দিলে কিন্তু রিটার্ন করে দিবো!");
                      handleSimulateCustomerHandling("পণ্যটি কি ১০০% আসল ব্র্যান্ডের? কপি দিলে কিন্তু রিটার্ন করে দিবো!");
                    }}
                    className="text-left p-2 bg-slate-50 hover:bg-cyan-50 hover:border-cyan-200 border border-slate-200 rounded-xl text-[11px] font-medium text-slate-700 transition"
                  >
                    🛡️ "পণ্য আসল তো? কপি হলে রিটার্ন করবো কিন্তু!"
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setHandlerCustomerQuery("আমার পার্সেলটি কি আগামীকাল বিকালের মধ্যে ধানমন্ডিতে দেওয়া সম্ভব?");
                      handleSimulateCustomerHandling("আমার পার্সেলটি কি আগামীকাল বিকালের মধ্যে ধানমন্ডিতে দেওয়া সম্ভব?");
                    }}
                    className="text-left p-2 bg-slate-50 hover:bg-cyan-50 hover:border-cyan-200 border border-slate-200 rounded-xl text-[11px] font-medium text-slate-700 transition"
                  >
                    ⚡ "আগামীকাল সন্ধ্যার মধ্যে ধানমন্ডিতে পাবো কি?"
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleSimulateCustomerHandling()}
                disabled={isHandlerProcessing}
                className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-black py-3 rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm transition disabled:opacity-50 cursor-pointer"
              >
                <Sparkles className={`w-4 h-4 ${isHandlerProcessing ? "animate-spin" : ""}`} />
                <span>{isHandlerProcessing ? "Formulating Resolution..." : "Generate Winning Response"}</span>
              </button>
            </div>

            {/* AI Generated Strategy Output */}
            <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="font-black text-slate-900 text-sm">Winning Response & Strategy Breakdown</h3>
                  <p className="text-[11px] text-slate-400">Optimized for Conversion, Customer Retention & Trust</p>
                </div>
                {handlerResult && (
                  <span className="px-2.5 py-1 bg-cyan-50 text-cyan-700 border border-cyan-200 text-[10px] font-bold rounded-lg">
                    Channel: {handlerChannel}
                  </span>
                )}
              </div>

              {handlerResult ? (
                <div className="space-y-4">
                  {/* Bengali Response Card */}
                  <div className="p-4 bg-gradient-to-r from-cyan-50/80 to-blue-50/60 border border-cyan-200 rounded-2xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase text-cyan-900 tracking-wider flex items-center gap-1.5">
                        <MessageSquare className="w-3.5 h-3.5 text-cyan-700" />
                        Official Response Script (বাংলা)
                      </span>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => copyToClipboard(handlerResult.bengaliReply, "Bengali response")}
                          className="px-2.5 py-1 bg-white border border-cyan-200 text-cyan-700 font-bold rounded-lg text-xs hover:bg-cyan-50 transition flex items-center gap-1 shadow-2xs"
                        >
                          <Copy className="w-3 h-3" /> Copy
                        </button>
                        <a
                          href={`https://wa.me/?text=${encodeURIComponent(handlerResult.bengaliReply)}`}
                          target="_blank"
                          rel="noreferrer"
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs transition flex items-center gap-1 shadow-2xs"
                        >
                          <Send className="w-3 h-3" /> WhatsApp
                        </a>
                      </div>
                    </div>
                    <p className="text-slate-800 text-xs sm:text-sm font-medium leading-relaxed whitespace-pre-line">
                      {handlerResult.bengaliReply}
                    </p>
                  </div>

                  {/* English Response Card */}
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase text-slate-600 tracking-wider flex items-center gap-1.5">
                        <MessageSquare className="w-3.5 h-3.5 text-slate-500" />
                        English Alternative Script
                      </span>
                      <button
                        onClick={() => copyToClipboard(handlerResult.englishReply, "English response")}
                        className="px-2.5 py-1 bg-white border border-slate-200 text-slate-700 font-bold rounded-lg text-xs hover:bg-slate-100 transition flex items-center gap-1 shadow-2xs"
                      >
                        <Copy className="w-3 h-3" /> Copy
                      </button>
                    </div>
                    <p className="text-slate-700 text-xs leading-relaxed">
                      {handlerResult.englishReply}
                    </p>
                  </div>

                  {/* Tactical Meta Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">Psychological Tactic</span>
                      <p className="text-xs font-bold text-slate-800">{handlerResult.psychologicalTactic}</p>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">Recommended Perk</span>
                      <p className="text-xs font-bold text-indigo-700">{handlerResult.recommendedPerk}</p>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">Suggested Voucher</span>
                      <p className="text-xs font-black text-amber-600 font-mono">{handlerResult.suggestedCoupon || "WELCOME10"}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-20 text-center text-slate-400 space-y-2">
                  <Bot className="w-12 h-12 mx-auto text-slate-300" />
                  <p className="font-bold text-sm text-slate-600">No resolution simulated yet</p>
                  <p className="text-xs text-slate-400">Type an objection or click one of the presets on the left.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 3: RMA & RETURN MERCHANDISE AUTHORIZATION            */}
      {/* ======================================================== */}
      {activeTab === "returns" && (
        <div className="space-y-6">
          <div className="bg-white p-4 rounded-2xl shadow-xs border border-slate-200 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Filter className="w-4 h-4 text-slate-400" />
              <span className="text-xs font-bold text-slate-700">Filter RMA Status:</span>
              <select
                value={returnStatusFilter}
                onChange={(e) => setReturnStatusFilter(e.target.value)}
                className="border border-slate-200 rounded-xl px-3 py-1.5 bg-slate-50 text-xs font-bold text-slate-800 outline-none cursor-pointer"
              >
                <option value="all">All Returns ({returnRequests.length})</option>
                <option value="requested">Requested (Pending Audit)</option>
                <option value="approved">Approved</option>
                <option value="product received">Product Received</option>
                <option value="refund processed">Refund Processed</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleExportReturns("excel")}
                className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold transition flex items-center gap-1"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>Export RMA (.xlsx)</span>
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 uppercase text-[10px] text-slate-500 font-black tracking-wider">
                    <th className="p-3.5">RMA # & Order</th>
                    <th className="p-3.5">Customer</th>
                    <th className="p-3.5">Product & Defect Reason</th>
                    <th className="p-3.5">Refund Value</th>
                    <th className="p-3.5">Workflow Status</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredReturns.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-12 text-center text-slate-400">
                        <RotateCcw className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                        <p className="font-bold text-sm text-slate-600">No return requests found</p>
                      </td>
                    </tr>
                  ) : (
                    filteredReturns.map((ret) => (
                      <tr key={ret.id} className="hover:bg-slate-50/80 transition">
                        <td className="p-3.5">
                          <div className="font-mono font-black text-indigo-700">{ret.requestNumber}</div>
                          <div className="text-[11px] font-mono text-slate-500">Order: #{ret.orderNumber}</div>
                          <div className="text-[10px] text-slate-400">{ret.createdAt}</div>
                        </td>

                        <td className="p-3.5">
                          <div className="font-bold text-slate-900">{ret.customerName}</div>
                          <div className="text-[11px] text-slate-500">📞 {ret.customerPhone}</div>
                        </td>

                        <td className="p-3.5 max-w-xs">
                          <div className="flex items-center gap-2.5">
                            <img
                              src={ret.productImage}
                              alt={ret.productName}
                              className="w-10 h-10 object-cover rounded-xl border border-slate-200 shrink-0"
                            />
                            <div>
                              <div className="font-bold text-slate-900 line-clamp-1">{ret.productName}</div>
                              <span className="inline-block mt-0.5 text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-100">
                                Reason: {ret.reason}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="p-3.5 whitespace-nowrap font-black text-slate-900 text-sm">
                          ৳{ret.refundAmount.toLocaleString()}
                        </td>

                        <td className="p-3.5 whitespace-nowrap">
                          <select
                            value={ret.status}
                            onChange={(e) =>
                              updateReturnRequest(ret.id, {
                                status: e.target.value as ReturnRequest["status"],
                              })
                            }
                            className={`px-3 py-1 rounded-full text-[10px] font-black outline-none border cursor-pointer ${
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
                            <option value="Requested">Requested (Pending)</option>
                            <option value="Approved">Approved for Return</option>
                            <option value="Product Received">Product Received</option>
                            <option value="Refund Processed">Refund Processed</option>
                            <option value="Rejected">Rejected</option>
                          </select>
                        </td>

                        <td className="p-3.5 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setSelectedReturn(ret)}
                              className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl font-bold text-xs flex items-center gap-1 transition"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>Audit Proof</span>
                            </button>

                            {canDelete && (
                              <button
                                onClick={() => {
                                  if (confirm(`Delete return request #${ret.requestNumber}?`)) {
                                    deleteReturnRequest(ret.id);
                                  }
                                }}
                                className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition"
                                title="Delete Return Request"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
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

      {/* ======================================================== */}
      {/* TAB 4: OMNICHANNEL LIVE QUEUE                            */}
      {/* ======================================================== */}
      {activeTab === "live-console" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-indigo-600 font-bold text-xs">
                <span>Web Storefront Tickets</span>
                <LifeBuoy className="w-4 h-4" />
              </div>
              <p className="text-2xl font-black text-slate-900">
                {supportTickets.filter((t) => t.channel === "Web Ticket" || !t.channel).length}
              </p>
              <span className="text-[10px] text-slate-400">Direct user portal submissions</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-emerald-600 font-bold text-xs">
                <span>WhatsApp Hotline</span>
                <Send className="w-4 h-4" />
              </div>
              <p className="text-2xl font-black text-slate-900">
                {supportTickets.filter((t) => t.channel === "WhatsApp").length}
              </p>
              <span className="text-[10px] text-slate-400">+8801700000000 Connected</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-cyan-600 font-bold text-xs">
                <span>Storefront Live Chat</span>
                <MessageSquare className="w-4 h-4" />
              </div>
              <p className="text-2xl font-black text-slate-900">
                {supportTickets.filter((t) => t.channel === "Live Chat").length}
              </p>
              <span className="text-[10px] text-slate-400">Floating widget interactions</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-purple-600 font-bold text-xs">
                <span>Phone & Email Queue</span>
                <PhoneCall className="w-4 h-4" />
              </div>
              <p className="text-2xl font-black text-slate-900">
                {supportTickets.filter((t) => t.channel === "Phone" || t.channel === "Email").length}
              </p>
              <span className="text-[10px] text-slate-400">Inbound Call logs</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-black text-slate-900 text-sm">Active Queue Channels & Agent Rostering</h3>
                <p className="text-xs text-slate-400">Live operational status across all touchpoints</p>
              </div>
              <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold rounded-lg flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                System Online
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-indigo-600" />
                    <span className="font-bold text-xs text-slate-900">Active Support Executives</span>
                  </div>
                  <span className="text-[10px] font-bold text-slate-500">4 Agents On Duty</span>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="p-2.5 bg-white rounded-xl border border-slate-200 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-slate-900">{currentUser.name}</p>
                      <span className="text-[10px] text-slate-400">Role: {currentUser.role} (Current User)</span>
                    </div>
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold text-[10px] rounded-full">
                      Active Now
                    </span>
                  </div>
                  <div className="p-2.5 bg-white rounded-xl border border-slate-200 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-slate-900">Rahim (Support Executive)</p>
                      <span className="text-[10px] text-slate-400">Handled 14 tickets today</span>
                    </div>
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold text-[10px] rounded-full">
                      Active
                    </span>
                  </div>
                  <div className="p-2.5 bg-white rounded-xl border border-slate-200 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-slate-900">Ayesha Siddiqua</p>
                      <span className="text-[10px] text-slate-400">Assigned to Shipping & Logistics</span>
                    </div>
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold text-[10px] rounded-full">
                      Active
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-amber-600" />
                    <span className="font-bold text-xs text-slate-900">Automated Dispatch Rules</span>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-600">Auto-Escalation: ON</span>
                </div>
                <div className="space-y-2 text-xs text-slate-600">
                  <div className="p-2.5 bg-white rounded-xl border border-slate-200 space-y-1">
                    <p className="font-bold text-slate-900">SLA Violation Rule</p>
                    <p className="text-[11px] text-slate-500">
                      If an Urgent ticket remains unassigned for &gt; 30 minutes, it is automatically escalated to Super Admin.
                    </p>
                  </div>
                  <div className="p-2.5 bg-white rounded-xl border border-slate-200 space-y-1">
                    <p className="font-bold text-slate-900">7-Day Return Guarantee Sync</p>
                    <p className="text-[11px] text-slate-500">
                      Returns within 7 days of delivery are automatically flagged for instant approval and courier reverse pickup.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 5: MACRO & FAQ SYNC                                  */}
      {/* ======================================================== */}
      {activeTab === "faq-sync" && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-black text-slate-900 text-sm">Helpdesk Macros & FAQ Knowledge Base</h3>
                <p className="text-xs text-slate-400">Pre-approved answers and standard operational procedures for support executives</p>
              </div>
              <span className="text-xs text-indigo-600 font-bold">
                {faqs.length} FAQs in Store Repository
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {faqs.map((faq) => (
                <div key={faq.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-bold text-xs text-slate-900">{faq.question}</h4>
                    <span className="px-2 py-0.5 bg-indigo-100 text-indigo-800 font-bold text-[9px] rounded uppercase shrink-0">
                      {faq.category}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">{faq.answer}</p>
                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={() => copyToClipboard(faq.answer, "FAQ Answer")}
                      className="px-2.5 py-1 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 text-[10px] font-bold rounded-lg transition flex items-center gap-1 shadow-2xs"
                    >
                      <Copy className="w-3 h-3" /> Insert as Macro Reply
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 6: SLA & CSAT ANALYTICS                              */}
      {/* ======================================================== */}
      {activeTab === "analytics" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                First Response Time (FRT)
              </span>
              <p className="text-2xl font-black text-indigo-600">14.2 Mins</p>
              <span className="text-[10px] text-emerald-600 font-bold">92% faster than target (&lt; 30m)</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Mean Time to Resolution (MTTR)
              </span>
              <p className="text-2xl font-black text-emerald-600">4.8 Hours</p>
              <span className="text-[10px] text-slate-500 font-medium">Standard SLA window: 24h</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                One-Touch Resolution Rate
              </span>
              <p className="text-2xl font-black text-purple-600">76.4%</p>
              <span className="text-[10px] text-purple-600 font-bold">Resolved in single agent response</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <h4 className="font-black text-slate-900 text-sm">Ticket Categories Breakdown</h4>
            <div className="space-y-3">
              {[
                { label: "Order Fulfilment & Delivery", count: supportTickets.filter((t) => t.category === "Order" || t.category === "Shipping").length, color: "bg-indigo-600" },
                { label: "bKash & Payment Processing", count: supportTickets.filter((t) => t.category === "Payment").length, color: "bg-emerald-600" },
                { label: "Returns, Replacements & RMA", count: supportTickets.filter((t) => t.category === "Returns").length, color: "bg-rose-500" },
                { label: "Coupons & Promotional Vouchers", count: supportTickets.filter((t) => t.category === "Coupons").length, color: "bg-amber-500" },
                { label: "General & Technical Inquiries", count: supportTickets.filter((t) => t.category === "General" || t.category === "Technical").length, color: "bg-purple-600" },
              ].map((item, idx) => {
                const total = Math.max(1, supportTickets.length);
                const pct = Math.round((item.count / total) * 100);
                return (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                      <span>{item.label}</span>
                      <span>{item.count} tickets ({pct}%)</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className={`h-full ${item.color} rounded-full`} style={{ width: `${Math.max(5, pct)}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* INTERACTIVE MODAL: DETAILED TICKET & AI RESOLUTION       */}
      {/* ======================================================== */}
      {selectedTicket && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 shadow-2xl space-y-4 max-h-[92vh] flex flex-col animate-in fade-in zoom-in-95">
            {/* Modal Top Header */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-xs font-black text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200">
                    {selectedTicket.ticketNumber}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                      selectedTicket.priority === "Urgent"
                        ? "bg-red-600 text-white animate-pulse"
                        : selectedTicket.priority === "High"
                        ? "bg-orange-500 text-white"
                        : "bg-slate-100 text-slate-700"
                    }`}
                  >
                    {selectedTicket.priority} Priority
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                    Category: {selectedTicket.category}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700">
                    Channel: {selectedTicket.channel || "Web Ticket"}
                  </span>
                </div>

                <h3 className="font-black text-slate-900 text-base sm:text-lg mt-2">
                  {selectedTicket.subject}
                </h3>

                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1">
                  <span>Customer: <strong className="text-slate-800">{selectedTicket.customerName}</strong></span>
                  <span>Email: {selectedTicket.customerEmail}</span>
                  {selectedTicket.customerPhone && (
                    <span>Phone: <strong className="text-slate-800 font-mono">{selectedTicket.customerPhone}</strong></span>
                  )}
                  {selectedTicket.orderNumber && (
                    <span className="text-indigo-600 font-mono font-bold">Order: #{selectedTicket.orderNumber}</span>
                  )}
                </div>
              </div>

              <button
                onClick={() => setSelectedTicket(null)}
                className="text-slate-400 hover:text-slate-600 text-2xl font-black p-1 leading-none"
              >
                &times;
              </button>
            </div>

            {/* AI Assistant Ribbon */}
            <div className="p-3 bg-gradient-to-r from-purple-50 via-indigo-50 to-blue-50 border border-purple-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-600 shrink-0" />
                <div>
                  <span className="text-xs font-black text-purple-900 block">AI Resolution Assistant</span>
                  <span className="text-[10px] text-purple-700">Auto-draft policy resolution, Bengali response script & courtesy coupons</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleGenerateAiResolution}
                disabled={isAiDrafting}
                className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5 shrink-0 disabled:opacity-50"
              >
                <Sparkles className={`w-3.5 h-3.5 ${isAiDrafting ? "animate-spin" : ""}`} />
                <span>{isAiDrafting ? "Analyzing Policy..." : "Generate AI Resolution"}</span>
              </button>
            </div>

            {/* Generated AI Resolution Box */}
            {aiDraftResolution && (
              <div className="p-4 bg-white border border-purple-200 rounded-2xl shadow-xs space-y-3 animate-in fade-in text-xs">
                <div className="flex items-center justify-between border-b border-purple-100 pb-2">
                  <span className="font-bold text-purple-900 text-xs flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4 text-purple-600" />
                    AI Formulated Resolution
                  </span>
                  <span className="text-[10px] font-bold text-slate-500">
                    Action: {aiDraftResolution.suggestedAction}
                  </span>
                </div>

                <div className="space-y-2">
                  <p className="font-medium text-slate-800 whitespace-pre-line leading-relaxed bg-purple-50/50 p-2.5 rounded-xl border border-purple-100">
                    {aiDraftResolution.bengali}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[10px] font-bold text-slate-400">
                    Suggested Compensation: <strong className="text-purple-700">{aiDraftResolution.suggestedVoucher}</strong>
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setReplyMessage(aiDraftResolution.bengali);
                      addToast("AI resolution copied into reply input box!", "success");
                    }}
                    className="px-3 py-1 bg-purple-600 text-white font-bold text-xs rounded-lg hover:bg-purple-700 transition"
                  >
                    Insert into Reply Box ↓
                  </button>
                </div>
              </div>
            )}

            {/* Conversation Log Box */}
            <div className="flex-1 overflow-y-auto space-y-3 p-4 bg-slate-50 rounded-2xl border border-slate-200 min-h-[220px]">
              {selectedTicket.messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`p-3.5 rounded-2xl max-w-lg text-xs space-y-1.5 shadow-2xs ${
                    msg.sender === "Customer"
                      ? "bg-white border border-slate-200 ml-0 mr-auto text-slate-900"
                      : msg.sender === "Support Agent"
                      ? "bg-indigo-600 text-white ml-auto mr-0"
                      : "bg-amber-100 border border-amber-200 text-amber-900 mx-auto text-center"
                  }`}
                >
                  <div className="flex items-center justify-between gap-4 text-[10px] opacity-80 font-bold">
                    <span>{msg.senderName}</span>
                    <span>{msg.createdAt}</span>
                  </div>
                  <p className="leading-relaxed whitespace-pre-line text-xs font-medium">{msg.message}</p>
                </div>
              ))}
            </div>

            {/* Internal Staff Notes Collapsible / Listing */}
            {selectedTicket.internalNotes && selectedTicket.internalNotes.length > 0 && (
              <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-2xl text-xs space-y-1.5">
                <span className="font-bold text-amber-900 text-[11px] block">
                  Staff Internal Notes (Private to Executives):
                </span>
                <ul className="list-disc pl-4 space-y-1 text-slate-700 text-[11px]">
                  {selectedTicket.internalNotes.map((note, idx) => (
                    <li key={idx}>{note}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Reply & Management Controls */}
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <textarea
                rows={3}
                placeholder="Type response to customer (গ্রাহকের কাছে পাঠানোর উত্তর লিখুন)..."
                value={replyMessage}
                onChange={(e) => setReplyMessage(e.target.value)}
                className="w-full border border-slate-200 rounded-2xl p-3 text-xs outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
              />

              {/* Internal Note Input Row */}
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={internalNoteInput}
                  onChange={(e) => setInternalNoteInput(e.target.value)}
                  placeholder="Add private internal staff note for other agents..."
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs outline-none"
                />
                <button
                  type="button"
                  onClick={handleAddInternalNote}
                  disabled={!internalNoteInput.trim()}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-xl disabled:opacity-40"
                >
                  + Add Note
                </button>
              </div>

              {/* Actions Footer */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowEscalateBox(!showEscalateBox)}
                    className="text-xs text-orange-600 hover:text-orange-800 font-bold flex items-center gap-1"
                  >
                    <AlertTriangle className="w-3.5 h-3.5" /> Escalate Priority
                  </button>

                  <select
                    value={selectedTicket.status}
                    onChange={(e) => handleQuickStatusChange(selectedTicket.id, e.target.value as SupportTicket["status"])}
                    className="border border-slate-200 bg-slate-50 text-xs font-bold rounded-xl px-3 py-1.5"
                  >
                    <option value="Open">Status: Open</option>
                    <option value="In Progress">Status: In Progress</option>
                    <option value="Resolved">Status: Resolved</option>
                    <option value="Closed">Status: Closed</option>
                  </select>
                </div>

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
                    className="px-5 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-1.5 shadow-sm"
                  >
                    <Send className="w-3.5 h-3.5" /> Send Response
                  </button>
                </div>
              </div>

              {showEscalateBox && (
                <div className="p-3 bg-orange-50 border border-orange-200 rounded-2xl space-y-2 text-xs animate-in fade-in">
                  <span className="font-bold text-orange-900 block">Select Escalation Priority Level:</span>
                  <div className="flex gap-2">
                    {(["Low", "Medium", "High", "Urgent"] as const).map((p) => (
                      <button
                        key={p}
                        onClick={() => handleEscalatePriority(p)}
                        className="px-3 py-1 bg-white border border-orange-300 rounded-xl text-xs font-bold text-orange-800 hover:bg-orange-100"
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

      {/* ======================================================== */}
      {/* MODAL: RMA RETURN DETAILS & PROOF AUDIT                  */}
      {/* ======================================================== */}
      {selectedReturn && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="font-black text-slate-900 text-base">Return Request #{selectedReturn.requestNumber}</h3>
                <p className="text-xs text-slate-500 font-mono">Order: #{selectedReturn.orderNumber}</p>
              </div>
              <button
                onClick={() => setSelectedReturn(null)}
                className="text-slate-400 hover:text-slate-600 text-2xl font-black"
              >
                &times;
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-1">
                <div className="font-bold text-slate-900 text-sm">{selectedReturn.productName}</div>
                <div className="text-xs text-rose-600 font-bold mt-1">Reason: {selectedReturn.reason}</div>
                <p className="text-xs text-slate-700 mt-2 bg-white p-3 rounded-xl border border-slate-200 leading-relaxed">
                  "{selectedReturn.details}"
                </p>
              </div>

              <div>
                <h4 className="font-black text-slate-800 text-[11px] uppercase mb-2">Customer Proof Photos</h4>
                <div className="flex gap-2">
                  {selectedReturn.images && selectedReturn.images.length > 0 ? (
                    selectedReturn.images.map((img, i) => (
                      <img key={i} src={img} alt="Return proof" className="w-24 h-24 object-cover rounded-xl border" />
                    ))
                  ) : (
                    <p className="text-slate-400 italic">No image attachments provided.</p>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-2xl border border-emerald-200 font-bold text-emerald-900">
                <span>Refund Valuation:</span>
                <span className="text-base font-black">৳{selectedReturn.refundAmount.toLocaleString()}</span>
              </div>
            </div>

            <div className="flex justify-between items-center pt-3 border-t">
              <select
                value={selectedReturn.status}
                onChange={(e) => {
                  const newStat = e.target.value as ReturnRequest["status"];
                  updateReturnRequest(selectedReturn.id, { status: newStat });
                  setSelectedReturn({ ...selectedReturn, status: newStat });
                }}
                className="border border-slate-300 bg-slate-50 text-xs font-bold rounded-xl px-3 py-1.5"
              >
                <option value="Requested">Requested</option>
                <option value="Approved">Approved</option>
                <option value="Product Received">Product Received</option>
                <option value="Refund Processed">Refund Processed</option>
                <option value="Rejected">Rejected</option>
              </select>

              <button
                onClick={() => setSelectedReturn(null)}
                className="px-5 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800"
              >
                Close Audit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: CREATE NEW SUPPORT TICKET                         */}
      {/* ======================================================== */}
      {isCreateTicketOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="font-black text-slate-900 text-base">Create New Support Ticket</h3>
                <p className="text-xs text-slate-500">Log customer issue from phone call, WhatsApp or live visit</p>
              </div>
              <button
                onClick={() => setIsCreateTicketOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-2xl font-black"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleCreateNewTicket} className="space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Customer Full Name *</label>
                  <input
                    type="text"
                    required
                    value={newCustomerName}
                    onChange={(e) => setNewCustomerName(e.target.value)}
                    placeholder="e.g. Mahfuzur Rahman"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-medium"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Customer Phone Number</label>
                  <input
                    type="text"
                    value={newCustomerPhone}
                    onChange={(e) => setNewCustomerPhone(e.target.value)}
                    placeholder="+88017XXXXXXXX"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-mono font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Customer Email</label>
                  <input
                    type="email"
                    value={newCustomerEmail}
                    onChange={(e) => setNewCustomerEmail(e.target.value)}
                    placeholder="customer@example.com"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-medium"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Associated Order Number</label>
                  <input
                    type="text"
                    value={newOrderNumber}
                    onChange={(e) => setNewOrderNumber(e.target.value)}
                    placeholder="ORD-XXXX (Optional)"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-mono font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold"
                  >
                    <option value="Order">Order Issue</option>
                    <option value="Shipping">Shipping</option>
                    <option value="Payment">Payment</option>
                    <option value="Coupons">Coupons</option>
                    <option value="Returns">Returns</option>
                    <option value="General">General</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Priority</label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Inbound Channel</label>
                  <select
                    value={newChannel}
                    onChange={(e) => setNewChannel(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold"
                  >
                    <option value="Web Ticket">Web Portal</option>
                    <option value="WhatsApp">WhatsApp</option>
                    <option value="Live Chat">Live Chat</option>
                    <option value="Phone">Phone Call</option>
                    <option value="Email">Email</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Ticket Subject *</label>
                <input
                  type="text"
                  required
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  placeholder="Summary of customer issue"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-medium"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Initial Customer Statement / Query *</label>
                <textarea
                  rows={3}
                  required
                  value={newInitialMsg}
                  onChange={(e) => setNewInitialMsg(e.target.value)}
                  placeholder="Details of the customer complaint or query..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-medium"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsCreateTicketOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl font-bold text-xs hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-sm"
                >
                  Submit & Assign Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Enterprise Print Modal */}
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
