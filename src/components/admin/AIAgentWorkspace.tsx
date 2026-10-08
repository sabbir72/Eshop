import React, { useState } from "react";
import { useStore } from "../../context/StoreContext";
import {
  Bot,
  Sparkles,
  Megaphone,
  UserCheck,
  TrendingUp,
  MessageSquare,
  Headphones,
  CheckCircle2,
  Copy,
  Send,
  Zap,
  Target,
  FileSpreadsheet,
  RefreshCw,
  ShoppingBag,
  Clock,
  ArrowRight,
  ShieldAlert,
  Sliders,
  DollarSign,
  AlertCircle,
  HelpCircle,
} from "lucide-react";

type AgentTab = "overview" | "marketing" | "leads" | "sales" | "customers" | "service";

export const AIAgentWorkspace: React.FC = () => {
  const {
    products,
    orders,
    coupons,
    supportTickets,
    addCoupon,
    updateSupportTicket,
    addToast,
    hasPermission,
  } = useStore();

  const [activeTab, setActiveTab] = useState<AgentTab>("overview");

  // Store telemetry summary
  const totalRevenue = orders.reduce((acc, o) => acc + (o.total || 0), 0);
  const sampleProducts = products.slice(0, 8).map((p) => ({
    id: p.id,
    name: p.name,
    price: p.price,
    category: p.categoryName,
    stock: p.stockQuantity,
  }));

  const storeContext = {
    productsCount: products.length,
    ordersCount: orders.length,
    totalRevenue,
    pendingTicketsCount: supportTickets.filter((t) => t.status !== "Resolved").length,
    activeCouponsCount: coupons.filter((c) => c.status === "Active").length,
    sampleProducts,
  };

  // ---------------------------------------------------------
  // 1. OVERVIEW & AUDIT STATE
  // ---------------------------------------------------------
  const [auditLoading, setAuditLoading] = useState(false);
  const [auditData, setAuditData] = useState<any>(null);

  const runAutonomousAudit = async () => {
    setAuditLoading(true);
    try {
      const res = await fetch("/api/ai/agent/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          task: "autonomous_audit",
          payload: {},
          storeContext,
        }),
      });
      const data = await res.json();
      setAuditData(data);
      addToast("AI Autonomous Business Audit completed successfully!", "success");
    } catch (e: any) {
      addToast("Failed to run AI audit: " + e.message, "error");
    } finally {
      setAuditLoading(false);
    }
  };

  // ---------------------------------------------------------
  // 2. MARKETING ENGINE STATE
  // ---------------------------------------------------------
  const [mGoal, setMGoal] = useState("Flash Sale Boost");
  const [mAudience, setMAudience] = useState("Online Shoppers across Bangladesh");
  const [mProduct, setMProduct] = useState(products[0]?.name || "Smart Electronic Gadgets");
  const [mChannels, setMChannels] = useState(["Facebook Ads", "Instagram", "SMS"]);
  const [mBudget, setMBudget] = useState("৳5,000");
  const [mLoading, setMLoading] = useState(false);
  const [mResult, setMResult] = useState<any>(null);

  const handleGenerateMarketing = async () => {
    setMLoading(true);
    try {
      const res = await fetch("/api/ai/agent/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          task: "marketing",
          payload: {
            goal: mGoal,
            targetAudience: mAudience,
            selectedProduct: mProduct,
            channels: mChannels,
            budget: mBudget,
          },
          storeContext,
        }),
      });
      const data = await res.json();
      setMResult(data);
      addToast("AI Marketing Campaign created successfully!", "success");
    } catch (e: any) {
      addToast("Marketing generation failed: " + e.message, "error");
    } finally {
      setMLoading(false);
    }
  };

  // ---------------------------------------------------------
  // 3. LEAD GENERATION STATE
  // ---------------------------------------------------------
  const [leadIndustry, setLeadIndustry] = useState("B2B Corporate & Retail Resellers");
  const [leadNiche, setLeadNiche] = useState("Office supplies, Bulk Gadgets, Festival Gifts");
  const [leadMagnet, setLeadMagnet] = useState("Exclusive Bulk Price Sheet & VIP Tier");
  const [leadLoading, setLeadLoading] = useState(false);
  const [leadResult, setLeadResult] = useState<any>(null);
  const [savedLeads, setSavedLeads] = useState<any[]>([]);

  const handleGenerateLeads = async () => {
    setLeadLoading(true);
    try {
      const res = await fetch("/api/ai/agent/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          task: "lead_generation",
          payload: {
            industry: leadIndustry,
            targetNiche: leadNiche,
            leadMagnetType: leadMagnet,
            quantity: 5,
          },
          storeContext,
        }),
      });
      const data = await res.json();
      setLeadResult(data);
      if (data.leads) {
        setSavedLeads(data.leads);
      }
      addToast("AI targeted leads generated successfully!", "success");
    } catch (e: any) {
      addToast("Lead generation failed: " + e.message, "error");
    } finally {
      setLeadLoading(false);
    }
  };

  const exportLeadsToCSV = () => {
    if (!savedLeads || savedLeads.length === 0) return;
    const headers = "Name,Organization,Category,Estimated Value,Score,Status,Outreach Pitch\n";
    const rows = savedLeads
      .map(
        (l) =>
          `"${l.name}","${l.organization}","${l.category}","${l.estimatedValue}","${l.leadScore}%","${l.status}","${l.outreachPitch.replace(/"/g, '""')}"`
      )
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `SmartShop_Leads_${Date.now()}.csv`;
    link.click();
    addToast("Leads exported to CSV!", "success");
  };

  // ---------------------------------------------------------
  // 4. SALES OVERSIGHT STATE
  // ---------------------------------------------------------
  const [salesLoading, setSalesLoading] = useState(false);
  const [salesResult, setSalesResult] = useState<any>(null);

  const handleRunSalesAudit = async () => {
    setSalesLoading(true);
    try {
      const res = await fetch("/api/ai/agent/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          task: "sales_oversight",
          payload: { focusArea: "Comprehensive Revenue & Cart Recovery" },
          storeContext,
        }),
      });
      const data = await res.json();
      setSalesResult(data);
      addToast("Sales oversight & recovery plan generated!", "success");
    } catch (e: any) {
      addToast("Sales analysis failed: " + e.message, "error");
    } finally {
      setSalesLoading(false);
    }
  };

  const activateRecoveryCoupon = () => {
    if (!salesResult?.abandonedCartRecovery) return;
    const code = salesResult.abandonedCartRecovery.suggestedCoupon || "RECOVER10";
    // Check if already exists
    const exists = coupons.some((c) => c.code.toUpperCase() === code.toUpperCase());
    if (exists) {
      addToast(`Coupon ${code} is already active in store!`, "info");
      return;
    }

    addCoupon({
      code,
      discountType: "percentage",
      discountValue: 10,
      minPurchaseAmount: 500,
      maxDiscountAmount: 500,
      startDate: new Date().toISOString().split("T")[0],
      endDate: new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0],
      usageLimit: 100,
      usedCount: 0,
      status: "Active",
      description: "AI Abandoned Cart Recovery Discount",
    });

    addToast(`Coupon '${code}' (10% OFF) activated in store!`, "success");
  };

  // ---------------------------------------------------------
  // 5. CUSTOMER HANDLING STATE
  // ---------------------------------------------------------
  const [customerMsg, setCustomerMsg] = useState(
    "দাম একটু কমানো যাবে কি? অন্য দোকানে তো কমে পাওয়া যাচ্ছে।"
  );
  const [customerType, setCustomerType] = useState("Price Sensitive / Bargain Hunter");
  const [cLoading, setCLoading] = useState(false);
  const [cResult, setCResult] = useState<any>(null);

  const handleProcessCustomer = async () => {
    setCLoading(true);
    try {
      const res = await fetch("/api/ai/agent/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          task: "customer_handling",
          payload: {
            customerMessage: customerMsg,
            customerType,
          },
          storeContext,
        }),
      });
      const data = await res.json();
      setCResult(data);
      addToast("AI customer response formulated!", "success");
    } catch (e: any) {
      addToast("Customer handling failed: " + e.message, "error");
    } finally {
      setCLoading(false);
    }
  };

  // ---------------------------------------------------------
  // 6. CUSTOMER SERVICE & SUPPORT DESK STATE
  // ---------------------------------------------------------
  const [serviceTicketId, setServiceTicketId] = useState(
    supportTickets[0]?.id || "TICK-1024"
  );
  const [serviceCustomerName, setServiceCustomerName] = useState(
    supportTickets[0]?.customerName || "Customer"
  );
  const [serviceOrderId, setServiceOrderId] = useState("ORD-9201");
  const [serviceComplaint, setServiceComplaint] = useState(
    supportTickets[0]?.subject ||
      "আমার পার্সেলটি এখনও ডেলিভারি হয়নি। অনুগ্রহ করে দ্রুত আপডেট দিন।"
  );
  const [sLoading, setSLoading] = useState(false);
  const [sResult, setSResult] = useState<any>(null);

  const handleResolveTicket = async () => {
    setSLoading(true);
    try {
      const res = await fetch("/api/ai/agent/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          task: "customer_service",
          payload: {
            ticketId: serviceTicketId,
            customerName: serviceCustomerName,
            orderId: serviceOrderId,
            complaintDetails: serviceComplaint,
          },
          storeContext,
        }),
      });
      const data = await res.json();
      setSResult(data);
      addToast("AI Service resolution prepared!", "success");
    } catch (e: any) {
      addToast("Service desk error: " + e.message, "error");
    } finally {
      setSLoading(false);
    }
  };

  const applyResolutionToTicket = () => {
    if (!sResult || !serviceTicketId) return;
    updateSupportTicket(serviceTicketId, {
      status: "In Progress",
      response: sResult.officialReplyBengali || sResult.officialReplyEnglish,
    });
    addToast(`Ticket #${serviceTicketId} updated with AI resolution!`, "success");
  };

  // ---------------------------------------------------------
  // INTERACTIVE AI COPILOT CHAT STATE
  // ---------------------------------------------------------
  const [chatMessages, setChatMessages] = useState<
    Array<{ role: "user" | "agent"; text: string; time: string }>
  >([
    {
      role: "agent",
      text: "আসসালামু আলাইকুম! আমি আপনার **SmartOmni AI Business Agent**। 🤖\n\nআমি আপনার মার্কেটিং, লিড জেনারেশন, সেলস মনিটরিং, কাস্টমার হ্যান্ডলিং ও সার্ভিস ডেস্ক স্বয়ংক্রিয়ভাবে পরিচালনা করতে প্রস্তুত। আমাকে যেকোনো নির্দেশনা দিন!",
      time: "Just now",
    },
  ]);
  const [chatInput, setChatInput] = useState("");
  const [chatSending, setChatSending] = useState(false);

  const handleSendChat = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!chatInput.trim() || chatSending) return;

    const userText = chatInput.trim();
    setChatInput("");
    setChatMessages((prev) => [
      ...prev,
      {
        role: "user",
        text: userText,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ]);

    setChatSending(true);
    try {
      const res = await fetch("/api/ai/agent/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userText,
          history: chatMessages.slice(-6),
          storeContext,
        }),
      });
      const data = await res.json();
      setChatMessages((prev) => [
        ...prev,
        {
          role: "agent",
          text: data.reply || "কাজটি সম্পন্ন হয়েছে। আর কিছু প্রয়োজন?",
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } catch (err: any) {
      setChatMessages((prev) => [
        ...prev,
        {
          role: "agent",
          text: "দুঃখিত, সংযোগে সাময়িক সমস্যা হয়েছে। দয়া করে আবার চেষ্টা করুন।",
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } finally {
      setChatSending(false);
    }
  };

  const copyToClipboard = (text: string, label = "Copied to clipboard!") => {
    navigator.clipboard.writeText(text);
    addToast(label, "success");
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Top Hero Banner */}
      <div className="bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl border border-indigo-800/40 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-black uppercase tracking-wider rounded-full flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                Active & Operating
              </span>
              <span className="px-3 py-1 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[11px] font-bold rounded-full">
                Powered by Gemini 3.8 Flash
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-3">
              <Bot className="w-8 h-8 text-indigo-400" />
              SmartOmni AI Autonomous Business Agent
            </h1>
            <p className="text-xs sm:text-sm text-indigo-200 max-w-2xl leading-relaxed">
              আপনার ই-কমার্সের সম্পূর্ণ স্বয়ংক্রিয় AI বিজনেস অপারেটর — মার্কেটিং পরিচালনা, লিড জেনারেশন, সেলস মনিটরিং, কাস্টমার হ্যান্ডলিং ও ২৪/৭ সার্ভিস ডেস্ক।
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={runAutonomousAudit}
              disabled={auditLoading}
              className="px-5 py-3 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white font-bold text-xs sm:text-sm rounded-2xl shadow-lg transition-all flex items-center gap-2 disabled:opacity-50"
            >
              <Zap className={`w-4 h-4 ${auditLoading ? "animate-spin" : ""}`} />
              <span>{auditLoading ? "Analyzing Business..." : "Run Autonomous Audit"}</span>
            </button>
          </div>
        </div>

        {/* 5-Pillar Fast Status Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mt-6 pt-6 border-t border-indigo-900/60">
          <div
            onClick={() => setActiveTab("marketing")}
            className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 cursor-pointer transition-all"
          >
            <div className="flex items-center gap-2 text-indigo-300 text-xs font-bold mb-1">
              <Megaphone className="w-3.5 h-3.5 text-pink-400" />
              <span>Marketing Engine</span>
            </div>
            <p className="text-[11px] text-slate-300">Campaigns, Social & SMS</p>
          </div>

          <div
            onClick={() => setActiveTab("leads")}
            className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 cursor-pointer transition-all"
          >
            <div className="flex items-center gap-2 text-indigo-300 text-xs font-bold mb-1">
              <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Lead Generator</span>
            </div>
            <p className="text-[11px] text-slate-300">B2B & High-Value Buyers</p>
          </div>

          <div
            onClick={() => setActiveTab("sales")}
            className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 cursor-pointer transition-all"
          >
            <div className="flex items-center gap-2 text-indigo-300 text-xs font-bold mb-1">
              <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
              <span>Sales Overseer</span>
            </div>
            <p className="text-[11px] text-slate-300">Cart Recovery & Telemetry</p>
          </div>

          <div
            onClick={() => setActiveTab("customers")}
            className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 cursor-pointer transition-all"
          >
            <div className="flex items-center gap-2 text-indigo-300 text-xs font-bold mb-1">
              <MessageSquare className="w-3.5 h-3.5 text-cyan-400" />
              <span>Customer Handler</span>
            </div>
            <p className="text-[11px] text-slate-300">Objection & Negotiation</p>
          </div>

          <div
            onClick={() => setActiveTab("service")}
            className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 cursor-pointer transition-all"
          >
            <div className="flex items-center gap-2 text-indigo-300 text-xs font-bold mb-1">
              <Headphones className="w-3.5 h-3.5 text-purple-400" />
              <span>Service Desk</span>
            </div>
            <p className="text-[11px] text-slate-300">24/7 Dispute & Returns</p>
          </div>
        </div>
      </div>

      {/* Main Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 border-b border-slate-200">
        <button
          onClick={() => setActiveTab("overview")}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 shrink-0 transition-all ${
            activeTab === "overview"
              ? "bg-slate-900 text-white shadow-sm"
              : "bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-slate-200"
          }`}
        >
          <Bot className="w-4 h-4 text-indigo-500" />
          <span>Autonomous Overview</span>
        </button>

        <button
          onClick={() => setActiveTab("marketing")}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 shrink-0 transition-all ${
            activeTab === "marketing"
              ? "bg-pink-600 text-white shadow-sm"
              : "bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-slate-200"
          }`}
        >
          <Megaphone className="w-4 h-4 text-pink-500" />
          <span>Marketing Engine (মার্কেটিং)</span>
        </button>

        <button
          onClick={() => setActiveTab("leads")}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 shrink-0 transition-all ${
            activeTab === "leads"
              ? "bg-emerald-600 text-white shadow-sm"
              : "bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-slate-200"
          }`}
        >
          <UserCheck className="w-4 h-4 text-emerald-500" />
          <span>Lead Generator (লিড জেনারেশন)</span>
        </button>

        <button
          onClick={() => setActiveTab("sales")}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 shrink-0 transition-all ${
            activeTab === "sales"
              ? "bg-amber-600 text-white shadow-sm"
              : "bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-slate-200"
          }`}
        >
          <TrendingUp className="w-4 h-4 text-amber-500" />
          <span>Sales Overseer (সেলস পর্যবেক্ষণ)</span>
        </button>

        <button
          onClick={() => setActiveTab("customers")}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 shrink-0 transition-all ${
            activeTab === "customers"
              ? "bg-cyan-600 text-white shadow-sm"
              : "bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-slate-200"
          }`}
        >
          <MessageSquare className="w-4 h-4 text-cyan-500" />
          <span>Customer Handler (কাস্টমার হ্যান্ডলিং)</span>
        </button>

        <button
          onClick={() => setActiveTab("service")}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 shrink-0 transition-all ${
            activeTab === "service"
              ? "bg-purple-600 text-white shadow-sm"
              : "bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-slate-200"
          }`}
        >
          <Headphones className="w-4 h-4 text-purple-500" />
          <span>Service Desk (সার্ভিস ও সাপোর্ট)</span>
        </button>
      </div>

      {/* ======================================================== */}
      {/* TAB 1: AUTONOMOUS OVERVIEW                               */}
      {/* ======================================================== */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Executive KPI Metric Tiles */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Total Products Monitored
              </span>
              <p className="text-2xl font-black text-slate-900">{products.length}</p>
              <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Fully Synced
              </span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Total Orders Logged
              </span>
              <p className="text-2xl font-black text-indigo-600">{orders.length}</p>
              <span className="text-[11px] text-slate-500 font-medium">Pipeline Telemetry</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Gross Store Revenue
              </span>
              <p className="text-2xl font-black text-emerald-600">৳{totalRevenue.toLocaleString()}</p>
              <span className="text-[11px] text-slate-500 font-medium">Real-time GMV</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Pending Support Tickets
              </span>
              <p className="text-2xl font-black text-purple-600">
                {supportTickets.filter((t) => t.status !== "Resolved").length}
              </p>
              <span className="text-[11px] text-purple-600 font-semibold">24/7 AI Queue</span>
            </div>
          </div>

          {/* Audit Results Panel (if run or default) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-indigo-600" />
                    AI Multi-Department Status Report
                  </h3>
                  <p className="text-xs text-slate-500">Autonomous performance evaluation across all 5 store operations</p>
                </div>
                <button
                  onClick={runAutonomousAudit}
                  disabled={auditLoading}
                  className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition flex items-center gap-1.5"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${auditLoading ? "animate-spin" : ""}`} />
                  Refresh Audit
                </button>
              </div>

              {/* 5 Departments Progress & Recommendations */}
              <div className="space-y-4">
                <div className="p-4 bg-pink-50/60 rounded-2xl border border-pink-100 flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-pink-600 text-white flex items-center justify-center font-bold shrink-0">
                    <Megaphone className="w-5 h-5" />
                  </div>
                  <div className="space-y-1 flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-slate-900 text-xs sm:text-sm">Marketing Automation (মার্কেটিং)</h4>
                      <span className="text-[10px] font-bold px-2 py-0.5 bg-pink-200 text-pink-800 rounded-md">88% Optimal</span>
                    </div>
                    <p className="text-xs text-slate-600">
                      {auditData?.departments?.marketing?.recommendation ||
                        "সপ্তাহান্তে ফেসবুক এবং ইনস্টাগ্রামে ইলেকট্রনিক্স ও ওয়্যারেবলসের উপর ফ্ল্যাশ সেল ক্যাম্পেইন চালান। সম্ভাব্য বিক্রয় বৃদ্ধি +২২%।"}
                    </p>
                  </div>
                </div>

                <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-100 flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shrink-0">
                    <UserCheck className="w-5 h-5" />
                  </div>
                  <div className="space-y-1 flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-slate-900 text-xs sm:text-sm">Lead Generation (লিড জেনারেশন)</h4>
                      <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-200 text-emerald-800 rounded-md">Active</span>
                    </div>
                    <p className="text-xs text-slate-600">
                      {auditData?.departments?.leads?.recommendation ||
                        "কর্পোরেট ঈদ/উৎসব গিফটিং প্যাকেজের জন্য ৫টি নির্দিষ্ট আইটি ও রিটেল কোম্পানিকে সরাসরি হোয়াটসঅ্যাপ পিচ পাঠানো হয়েছে।"}
                    </p>
                  </div>
                </div>

                <div className="p-4 bg-amber-50/60 rounded-2xl border border-amber-100 flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center font-bold shrink-0">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <div className="space-y-1 flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-slate-900 text-xs sm:text-sm">Sales Oversight (সেলস মনিটরিং)</h4>
                      <span className="text-[10px] font-bold px-2 py-0.5 bg-amber-200 text-amber-800 rounded-md">91% Tracked</span>
                    </div>
                    <p className="text-xs text-slate-600">
                      {auditData?.departments?.sales?.recommendation ||
                        "কার্ট ত্যাগ করা ১২ জন গ্রাহককে 'RECOVER10' কুপন কোডসহ স্বয়ংক্রিয় SMS পাঠানোর মাধ্যমে আনুমানিক ৳১৫,০০০ রিকভারি সম্ভব।"}
                    </p>
                  </div>
                </div>

                <div className="p-4 bg-cyan-50/60 rounded-2xl border border-cyan-100 flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-cyan-600 text-white flex items-center justify-center font-bold shrink-0">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <div className="space-y-1 flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-slate-900 text-xs sm:text-sm">Customer Handling (কাস্টমার হ্যান্ডলিং)</h4>
                      <span className="text-[10px] font-bold px-2 py-0.5 bg-cyan-200 text-cyan-800 rounded-md">94% Response</span>
                    </div>
                    <p className="text-xs text-slate-600">
                      {auditData?.departments?.customerHandling?.recommendation ||
                        "দরদাম ও বিকল্প পণ্যের জিজ্ঞাসার উত্তর দেওয়ার জন্য ব্র্যান্ড-সেফ স্ক্রিপ্ট সক্রিয় রয়েছে। গ্রাহকদের দ্রুত সন্তুষ্টি বজায় থাকছে।"}
                    </p>
                  </div>
                </div>

                <div className="p-4 bg-purple-50/60 rounded-2xl border border-purple-100 flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold shrink-0">
                    <Headphones className="w-5 h-5" />
                  </div>
                  <div className="space-y-1 flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-slate-900 text-xs sm:text-sm">Service & Support Desk (সার্ভিস ও সাপোর্ট)</h4>
                      <span className="text-[10px] font-bold px-2 py-0.5 bg-purple-200 text-purple-800 rounded-md">100% Policy SLA</span>
                    </div>
                    <p className="text-xs text-slate-600">
                      {auditData?.departments?.customerService?.recommendation ||
                        "৭ দিনের রিটার্ন ও ডেলিভারি ট্র্যাকিং পলিসি মোতাবেক স্বয়ংক্রিয়ভাবে অভিযোগের উত্তর ও ডিসকাউন্ট ভাউচার প্রস্তুত রয়েছে।"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* AI Agent Live Copilot Chat Box */}
            <div className="bg-slate-900 text-white p-6 rounded-3xl border border-slate-800 shadow-xl flex flex-col h-[520px]">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <span className="font-bold text-xs text-slate-200">Interactive AI Copilot</span>
                </div>
                <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  Live
                </span>
              </div>

              {/* Chat Message Stream */}
              <div className="flex-1 overflow-y-auto space-y-3 py-3 pr-1 text-xs">
                {chatMessages.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}
                  >
                    <div
                      className={`p-3 rounded-2xl max-w-[88%] leading-relaxed ${
                        msg.role === "user"
                          ? "bg-indigo-600 text-white rounded-br-xs"
                          : "bg-slate-800 text-slate-200 rounded-bl-xs border border-slate-700/50"
                      }`}
                    >
                      <p className="whitespace-pre-line">{msg.text}</p>
                    </div>
                    <span className="text-[9px] text-slate-500 mt-0.5 px-1">{msg.time}</span>
                  </div>
                ))}
                {chatSending && (
                  <div className="flex items-center gap-2 text-indigo-400 text-xs italic">
                    <Sparkles className="w-3.5 h-3.5 animate-spin" />
                    <span>AI Agent চিন্তা করছে...</span>
                  </div>
                )}
              </div>

              {/* Quick Prompt Chips */}
              <div className="pt-2 pb-1 border-t border-slate-800/80 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                <button
                  type="button"
                  onClick={() => {
                    setChatInput("আজকের সেলস বাড়ানোর ৩টি সহজ উপায় বলো");
                  }}
                  className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-[10px] shrink-0 transition"
                >
                  ⚡ সেলস বৃদ্ধির উপায়
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setChatInput("নতুন B2B পাইকারি লিড কীভাবে পাবো?");
                  }}
                  className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-[10px] shrink-0 transition"
                >
                  🎯 B2B লিড আইডিয়া
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setChatInput("ফেসবুক বুস্টিংয়ের জন্য একটি আকর্ষণীয় কপি দাও");
                  }}
                  className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-[10px] shrink-0 transition"
                >
                  📢 ফেসবুক অ্যাড কপি
                </button>
              </div>

              {/* Chat Input */}
              <form onSubmit={handleSendChat} className="flex items-center gap-2 pt-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Ask AI Agent anything (বাংলা বা English)..."
                  className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-hidden focus:border-indigo-500"
                />
                <button
                  type="submit"
                  disabled={chatSending || !chatInput.trim()}
                  className="p-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition disabled:opacity-40"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: MARKETING ENGINE                                  */}
      {/* ======================================================== */}
      {activeTab === "marketing" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Controls */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <Megaphone className="w-5 h-5 text-pink-600" />
              <h3 className="font-black text-slate-900 text-sm">Campaign Generator</h3>
            </div>

            <div>
              <label className="font-bold text-xs text-slate-700 block mb-1">Campaign Objective</label>
              <select
                value={mGoal}
                onChange={(e) => setMGoal(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold text-slate-800"
              >
                <option value="Flash Sale Boost">⚡ Flash Sale Boost (সীমিত সময়ের ধামাকা অফার)</option>
                <option value="Festive / Eid Mega Savings">🎉 Festive / Eid Mega Savings</option>
                <option value="New Product Launch">🚀 New Product Launch</option>
                <option value="Inventory Clearance Sale">🏷️ Inventory Clearance Sale</option>
                <option value="Weekend Special Discount">🛍️ Weekend Special Discount</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-xs text-slate-700 block mb-1">Target Product / Category</label>
              <select
                value={mProduct}
                onChange={(e) => setMProduct(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800"
              >
                {products.map((p) => (
                  <option key={p.id} value={p.name}>
                    {p.name} (৳{p.price})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-bold text-xs text-slate-700 block mb-1">Target Audience</label>
              <input
                type="text"
                value={mAudience}
                onChange={(e) => setMAudience(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800"
                placeholder="e.g. Young professionals in Dhaka & Chittagong"
              />
            </div>

            <div>
              <label className="font-bold text-xs text-slate-700 block mb-1">Estimated Ad Budget</label>
              <input
                type="text"
                value={mBudget}
                onChange={(e) => setMBudget(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800"
                placeholder="৳5,000"
              />
            </div>

            <button
              onClick={handleGenerateMarketing}
              disabled={mLoading}
              className="w-full bg-gradient-to-r from-pink-600 to-indigo-600 hover:from-pink-700 hover:to-indigo-700 text-white font-bold py-3 rounded-xl text-xs flex items-center justify-center gap-2 shadow-md transition disabled:opacity-50"
            >
              <Sparkles className={`w-4 h-4 ${mLoading ? "animate-spin" : ""}`} />
              <span>{mLoading ? "Generating Campaign with Gemini AI..." : "Generate AI Marketing Campaign"}</span>
            </button>
          </div>

          {/* Marketing Output */}
          <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-black text-slate-900 text-sm">Campaign Blueprint</h3>
                <p className="text-[11px] text-slate-400">Ready-to-launch omnichannel marketing materials</p>
              </div>
              {mResult && (
                <button
                  onClick={() => copyToClipboard(mResult.primaryCopy || "", "Ad copy copied!")}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Ad Copy</span>
                </button>
              )}
            </div>

            {mResult ? (
              <div className="space-y-4 text-xs">
                {/* Title & Headline */}
                <div className="p-4 bg-pink-50/70 border border-pink-100 rounded-2xl space-y-1">
                  <span className="text-[10px] font-black uppercase tracking-wider text-pink-700">Campaign Title & Hook</span>
                  <h4 className="text-base font-black text-slate-900">{mResult.campaignTitle}</h4>
                  <p className="text-xs text-pink-900 font-semibold">{mResult.headline}</p>
                </div>

                {/* Primary Ad Copy */}
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">Primary Ad Copy (Bengali & English)</span>
                  <p className="text-slate-800 leading-relaxed whitespace-pre-line text-xs font-medium">{mResult.primaryCopy}</p>
                </div>

                {/* Multichannel Execution */}
                {mResult.channelsStrategy && (
                  <div className="space-y-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">Multichannel Strategy</span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {mResult.channelsStrategy.map((ch: any, idx: number) => (
                        <div key={idx} className="p-3 bg-white border border-slate-200 rounded-xl space-y-1 shadow-2xs">
                          <span className="font-bold text-indigo-600 block">{ch.channel}</span>
                          <span className="text-[11px] text-slate-500 block font-medium">Format: {ch.format}</span>
                          <p className="text-[11px] text-slate-700">{ch.angle || ch.text}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Discount & Hashtags & ROAS */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl">
                    <span className="text-[10px] font-bold text-emerald-800 uppercase block">Suggested Discount</span>
                    <p className="font-black text-emerald-700">{mResult.suggestedDiscount || "15% OFF"}</p>
                  </div>
                  <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-xl">
                    <span className="text-[10px] font-bold text-indigo-800 uppercase block">Projected ROAS</span>
                    <p className="font-black text-indigo-700">{mResult.estimatedROAS || "4.5x ROAS"}</p>
                  </div>
                  <div className="p-3 bg-purple-50 border border-purple-100 rounded-xl">
                    <span className="text-[10px] font-bold text-purple-800 uppercase block">Call To Action</span>
                    <p className="font-black text-purple-700">{mResult.callToAction || "অর্ডার করুন এখনই"}</p>
                  </div>
                </div>

                {/* Hashtags */}
                {mResult.hashtags && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {mResult.hashtags.map((tag: string, i: number) => (
                      <span key={i} className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-lg text-[10px] font-semibold">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="py-16 text-center text-slate-400 space-y-2">
                <Megaphone className="w-10 h-10 mx-auto text-slate-300" />
                <p className="text-xs font-semibold">Select your campaign objectives and click Generate to see the AI marketing plan.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 3: LEAD GENERATOR                                    */}
      {/* ======================================================== */}
      {activeTab === "leads" && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-emerald-600" />
                AI B2B & Bulk Buyer Lead Generator
              </h3>
              <p className="text-xs text-slate-500">Autonomous prospecting, lead qualification scoring & personalized pitch scripts</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleGenerateLeads}
                disabled={leadLoading}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm transition flex items-center gap-2 disabled:opacity-50"
              >
                <Sparkles className={`w-3.5 h-3.5 ${leadLoading ? "animate-spin" : ""}`} />
                <span>{leadLoading ? "Discovering Leads..." : "Generate High-Value Leads"}</span>
              </button>
              {savedLeads.length > 0 && (
                <button
                  onClick={exportLeadsToCSV}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition flex items-center gap-1.5"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Export CSV</span>
                </button>
              )}
            </div>
          </div>

          {/* Lead Magnet Preview */}
          {leadResult?.leadMagnet && (
            <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="space-y-0.5">
                <span className="text-[10px] font-black uppercase text-emerald-800 tracking-wider">Active Lead Magnet Hook</span>
                <p className="font-bold text-slate-900">{leadResult.leadMagnet.title}</p>
                <p className="text-emerald-950 font-medium">{leadResult.leadMagnet.offer}</p>
              </div>
              <button
                onClick={() => copyToClipboard(leadResult.leadMagnet.optInHook, "Lead magnet hook copied!")}
                className="px-3 py-1.5 bg-white text-emerald-700 font-bold border border-emerald-300 rounded-xl shrink-0 shadow-2xs hover:bg-emerald-50 transition"
              >
                Copy Opt-in Pitch
              </button>
            </div>
          )}

          {/* Leads Table */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <span className="font-bold text-xs text-slate-800">Target Prospect Pipeline ({savedLeads.length})</span>
              <span className="text-[11px] text-slate-400">Targeted for South Asian / Bangladesh Market</span>
            </div>

            {savedLeads.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] tracking-wider border-b border-slate-100">
                    <tr>
                      <th className="py-3 px-4">Decision Maker / Profile</th>
                      <th className="py-3 px-4">Interest Category</th>
                      <th className="py-3 px-4">Deal Size</th>
                      <th className="py-3 px-4">Lead Score</th>
                      <th className="py-3 px-4">Channel</th>
                      <th className="py-3 px-4">Tailored Outreach Script</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {savedLeads.map((lead: any, idx: number) => (
                      <tr key={idx} className="hover:bg-slate-50/80 transition">
                        <td className="py-3.5 px-4">
                          <p className="font-bold text-slate-900">{lead.name}</p>
                          <p className="text-[11px] text-slate-500">{lead.organization}</p>
                        </td>
                        <td className="py-3.5 px-4 font-medium text-slate-700">{lead.category}</td>
                        <td className="py-3.5 px-4 font-black text-emerald-600">{lead.estimatedValue}</td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                              lead.leadScore >= 90
                                ? "bg-emerald-100 text-emerald-800"
                                : lead.leadScore >= 80
                                ? "bg-amber-100 text-amber-800"
                                : "bg-slate-100 text-slate-700"
                            }`}
                          >
                            {lead.leadScore}% • {lead.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-slate-600">{lead.preferredChannel}</td>
                        <td className="py-3.5 px-4 max-w-xs text-slate-600 text-[11px] truncate" title={lead.outreachPitch}>
                          {lead.outreachPitch}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => copyToClipboard(lead.outreachPitch, "Pitch script copied!")}
                            className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition"
                            title="Copy Pitch"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-16 text-center text-slate-400 space-y-2">
                <UserCheck className="w-10 h-10 mx-auto text-slate-300" />
                <p className="text-xs font-semibold">Click "Generate High-Value Leads" above to populate prospect pipeline.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 4: SALES OVERSEER                                    */}
      {/* ======================================================== */}
      {activeTab === "sales" && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-amber-600" />
                AI Sales Oversight & Conversion Optimizer
              </h3>
              <p className="text-xs text-slate-500">Live telemetry, revenue leak detection, abandoned cart recovery & dynamic upsells</p>
            </div>

            <button
              onClick={handleRunSalesAudit}
              disabled={salesLoading}
              className="px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-sm transition flex items-center gap-2 disabled:opacity-50"
            >
              <Sparkles className={`w-3.5 h-3.5 ${salesLoading ? "animate-spin" : ""}`} />
              <span>{salesLoading ? "Analyzing Telemetry..." : "Run Sales Audit & Recovery"}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Abandoned Cart Recovery Box */}
            <div className="bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent p-6 rounded-3xl border border-amber-200 space-y-4">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-amber-600" />
                <h4 className="font-black text-slate-900 text-sm">Abandoned Cart Auto-Recovery</h4>
              </div>

              <p className="text-xs text-slate-600">
                Recover dropped checkouts by triggering automated 24-hour incentive vouchers via SMS/WhatsApp.
              </p>

              <div className="p-3 bg-white rounded-2xl border border-amber-200 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-500">Suggested Code:</span>
                  <span className="font-black text-amber-700 bg-amber-100 px-2 py-0.5 rounded-md">
                    {salesResult?.abandonedCartRecovery?.suggestedCoupon || "RECOVER10"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-500">Recovery Benefit:</span>
                  <span className="font-bold text-slate-800">10% OFF for 24 Hours</span>
                </div>
                <div className="pt-1 border-t border-slate-100">
                  <span className="text-[10px] text-slate-400 font-bold block mb-1">Recovery SMS Template:</span>
                  <p className="text-[11px] text-slate-700 font-medium">
                    {salesResult?.abandonedCartRecovery?.recoverySMS ||
                      "আপনার পছন্দের পণ্যটি এখনও কার্টে অপেক্ষা করছে! পরবর্তী ২৪ ঘণ্টার মধ্যে অর্ডার সম্পূর্ণ করলে পান স্পেশাল ১০% ছাড়। কোড: RECOVER10"}
                  </p>
                </div>
              </div>

              <button
                onClick={activateRecoveryCoupon}
                className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-xs transition"
              >
                1-Click Activate Coupon in Store
              </button>
            </div>

            {/* Sales Insights & Bottlenecks */}
            <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
              <h4 className="font-black text-slate-900 text-sm">Key Sales Insights & Actions</h4>

              {salesResult?.keyInsights ? (
                <div className="space-y-3">
                  {salesResult.keyInsights.map((insight: string, idx: number) => (
                    <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-start gap-3 text-xs text-slate-800">
                      <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-700 font-bold flex items-center justify-center shrink-0 text-[10px]">
                        {idx + 1}
                      </span>
                      <p className="leading-relaxed font-medium">{insight}</p>
                    </div>
                  ))}

                  {/* Bundles */}
                  {salesResult?.crossSellRecommendations && (
                    <div className="pt-3 border-t border-slate-100 space-y-2">
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                        Recommended Cross-Sell Bundles
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {salesResult.crossSellRecommendations.map((b: any, i: number) => (
                          <div key={i} className="p-3 bg-indigo-50/60 rounded-xl border border-indigo-100 text-xs space-y-1">
                            <span className="font-bold text-indigo-900 block">{b.mainCategory}</span>
                            <p className="text-slate-600 text-[11px]">Bundle with: {b.recommendedAddons}</p>
                            <span className="text-[10px] font-black text-indigo-600 block">{b.bundleDiscount}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="py-12 text-center text-slate-400 space-y-2">
                  <TrendingUp className="w-8 h-8 mx-auto text-slate-300" />
                  <p className="text-xs font-semibold">Run the sales audit to analyze real-time revenue opportunities.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 5: CUSTOMER HANDLER                                  */}
      {/* ======================================================== */}
      {activeTab === "customers" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <MessageSquare className="w-5 h-5 text-cyan-600" />
              <h3 className="font-black text-slate-900 text-sm">Customer Query Simulator</h3>
            </div>

            <div>
              <label className="font-bold text-xs text-slate-700 block mb-1">Customer Message / Objection</label>
              <textarea
                rows={3}
                value={customerMsg}
                onChange={(e) => setCustomerMsg(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800"
                placeholder="Type customer question or bargain request..."
              />
            </div>

            {/* Presets */}
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Common Presets</span>
              <div className="flex flex-col gap-1.5">
                <button
                  type="button"
                  onClick={() => setCustomerMsg("দাম একটু কমানো যাবে কি? অন্য দোকানে তো কমে পাওয়া যাচ্ছে।")}
                  className="text-left p-2 bg-slate-50 hover:bg-slate-100 rounded-lg text-[11px] text-slate-700 transition"
                >
                  💵 "দাম একটু কমানো যাবে কি? অন্য দোকানে কমে পাওয়া যাচ্ছে।"
                </button>
                <button
                  type="button"
                  onClick={() => setCustomerMsg("পণ্যটি কি আসল? কোনো ওয়ারেন্টি পাবো কি না?")}
                  className="text-left p-2 bg-slate-50 hover:bg-slate-100 rounded-lg text-[11px] text-slate-700 transition"
                >
                  🛡️ "পণ্যটি কি আসল? কোনো ওয়ারেন্টি পাবো কি না?"
                </button>
                <button
                  type="button"
                  onClick={() => setCustomerMsg("ডেলিভারি কবে পাবো? আমার আগামীকাল সন্ধ্যার মধ্যে দরকার।")}
                  className="text-left p-2 bg-slate-50 hover:bg-slate-100 rounded-lg text-[11px] text-slate-700 transition"
                >
                  ⚡ "ডেলিভারি কবে পাবো? আগামীকাল দরকার।"
                </button>
              </div>
            </div>

            <button
              onClick={handleProcessCustomer}
              disabled={cLoading}
              className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-3 rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm transition disabled:opacity-50"
            >
              <Sparkles className={`w-4 h-4 ${cLoading ? "animate-spin" : ""}`} />
              <span>{cLoading ? "Formulating Response..." : "Formulate Winning Reply"}</span>
            </button>
          </div>

          <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="font-black text-slate-900 text-sm border-b border-slate-100 pb-3">AI Response & Objection Handling Strategy</h3>

            {cResult ? (
              <div className="space-y-4 text-xs">
                {/* Bengali Response */}
                <div className="p-4 bg-cyan-50/70 border border-cyan-100 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase text-cyan-800 tracking-wider">Suggested Reply (Bengali)</span>
                    <button
                      onClick={() => copyToClipboard(cResult.suggestedResponseBengali, "Bengali reply copied!")}
                      className="px-2.5 py-1 bg-white border border-cyan-200 rounded-lg font-bold text-cyan-700 flex items-center gap-1 shadow-2xs hover:bg-cyan-50 transition"
                    >
                      <Copy className="w-3 h-3" /> Copy
                    </button>
                  </div>
                  <p className="text-slate-800 leading-relaxed font-medium text-xs">{cResult.suggestedResponseBengali}</p>
                </div>

                {/* English Response */}
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Suggested Reply (English)</span>
                    <button
                      onClick={() => copyToClipboard(cResult.suggestedResponseEnglish, "English reply copied!")}
                      className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg font-bold text-slate-700 flex items-center gap-1 shadow-2xs hover:bg-slate-100 transition"
                    >
                      <Copy className="w-3 h-3" /> Copy
                    </button>
                  </div>
                  <p className="text-slate-700 leading-relaxed text-xs">{cResult.suggestedResponseEnglish}</p>
                </div>

                {/* Tactical metadata */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Psychological Tactic</span>
                    <p className="font-semibold text-slate-800">{cResult.negotiationTactic || "Value Guarantee over Price"}</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Recommended Action</span>
                    <p className="font-semibold text-indigo-700">{cResult.recommendedAction || "Provide 5% welcome code"}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-16 text-center text-slate-400 space-y-2">
                <MessageSquare className="w-10 h-10 mx-auto text-slate-300" />
                <p className="text-xs font-semibold">Enter a customer query and generate the AI reply.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 6: SERVICE & SUPPORT DESK                            */}
      {/* ======================================================== */}
      {activeTab === "service" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <Headphones className="w-5 h-5 text-purple-600" />
              <h3 className="font-black text-slate-900 text-sm">Dispute & Ticket Resolver</h3>
            </div>

            <div>
              <label className="font-bold text-xs text-slate-700 block mb-1">Select Pending Ticket</label>
              <select
                value={serviceTicketId}
                onChange={(e) => {
                  const t = supportTickets.find((tick) => tick.id === e.target.value);
                  setServiceTicketId(e.target.value);
                  if (t) {
                    setServiceCustomerName(t.customerName);
                    setServiceComplaint(t.subject + ": " + (t.messages[0]?.message || ""));
                  }
                }}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 font-bold"
              >
                {supportTickets.map((t) => (
                  <option key={t.id} value={t.id}>
                    #{t.id} - {t.customerName} ({t.status})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-bold text-xs text-slate-700 block mb-1">Customer Complaint / Dispute</label>
              <textarea
                rows={3}
                value={serviceComplaint}
                onChange={(e) => setServiceComplaint(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800"
              />
            </div>

            <button
              onClick={handleResolveTicket}
              disabled={sLoading}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm transition disabled:opacity-50"
            >
              <Sparkles className={`w-4 h-4 ${sLoading ? "animate-spin" : ""}`} />
              <span>{sLoading ? "Resolving with AI..." : "Draft Policy Resolution"}</span>
            </button>
          </div>

          <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-black text-slate-900 text-sm">Service Resolution Protocol</h3>
                <p className="text-[11px] text-slate-400">7-Day return policy, courier SLA & empathetic de-escalation</p>
              </div>
              {sResult && (
                <button
                  onClick={applyResolutionToTicket}
                  className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-2xs transition"
                >
                  Apply to Ticket #{serviceTicketId}
                </button>
              )}
            </div>

            {sResult ? (
              <div className="space-y-4 text-xs">
                {/* Resolution Message Bengali */}
                <div className="p-4 bg-purple-50/70 border border-purple-100 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase text-purple-800 tracking-wider">Official Resolution Reply</span>
                    <button
                      onClick={() => copyToClipboard(sResult.officialReplyBengali, "Service reply copied!")}
                      className="px-2.5 py-1 bg-white border border-purple-200 rounded-lg font-bold text-purple-700 flex items-center gap-1 shadow-2xs hover:bg-purple-50 transition"
                    >
                      <Copy className="w-3 h-3" /> Copy
                    </button>
                  </div>
                  <p className="text-slate-800 leading-relaxed font-medium text-xs">{sResult.officialReplyBengali}</p>
                </div>

                {/* Policy check & voucher */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Store Policy Compliance</span>
                    <p className="font-semibold text-emerald-700">{sResult.policyCheck || "Verified with 7-Day Guarantee"}</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Suggested Courtesy Voucher</span>
                    <p className="font-black text-purple-700">{sResult.suggestedCompensation || "৳100 Voucher (CARE100)"}</p>
                  </div>
                </div>

                {/* Action steps */}
                {sResult.actionSteps && (
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Staff Action Checklist</span>
                    {sResult.actionSteps.map((step: string, i: number) => (
                      <div key={i} className="flex items-center gap-2 text-slate-700 text-xs">
                        <CheckCircle2 className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                        <span>{step}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="py-16 text-center text-slate-400 space-y-2">
                <Headphones className="w-10 h-10 mx-auto text-slate-300" />
                <p className="text-xs font-semibold">Select a ticket and click "Draft Policy Resolution".</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
