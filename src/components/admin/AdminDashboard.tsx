import React, { useState, useEffect } from "react";
import { useStore } from "../../context/StoreContext";
import {
  DollarSign,
  ShoppingBag,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  Users,
  UserPlus,
  Package,
  AlertTriangle,
  Flame,
  Shield,
  Activity,
  Compass,
  BarChart3,
  Layers,
  ArrowRight,
  Bot,
  Sparkles,
  FileSpreadsheet,
  Zap,
  Server,
  RefreshCw,
  Cpu,
  Radio,
  Eye,
  CheckCircle2,
  Lock,
  Globe,
  Wallet,
  Boxes,
  ArrowUpRight,
  ExternalLink,
} from "lucide-react";
import { CommandCenterDirectory } from "./CommandCenterDirectory";
import { TrafficLoadTracker } from "./TrafficLoadTracker";
import { CashCalculationLog } from "./CashCalculationLog";
import { RefillStockCenterModal } from "./RefillStockCenterModal";

export const AdminDashboard: React.FC = () => {
  const { products, orders, users, auditLogs, settings, setAdminView, activeRole, language, addToast, updateProduct } =
    useStore();
  const [dashboardMode, setDashboardMode] = useState<"all" | "traffic" | "cash" | "kpis" | "directory">("all");
  const [isRefillModalOpen, setIsRefillModalOpen] = useState(false);
  const [refillInitialFilter, setRefillInitialFilter] = useState<"deficit" | "all" | "out-of-stock">("deficit");
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());
  const [isSyncing, setIsSyncing] = useState(false);

  const isBN = language === "BN";
  const isSuperAdmin = activeRole === "Super Admin";

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const totalRevenue = orders.reduce((acc, o) => acc + o.total, 0);
  const pendingOrders = orders.filter((o) => o.orderStatus === "Pending").length;
  const deliveredOrders = orders.filter((o) => o.orderStatus === "Delivered").length;
  const cancelledOrders = orders.filter((o) => o.orderStatus === "Cancelled").length;

  const lowStockProducts = products.filter((p) => p.totalStock > 0 && p.totalStock <= 5);
  const outOfStockProducts = products.filter((p) => p.totalStock <= 0);

  const handleManualSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      addToast(
        isBN
          ? "সিস্টেম ক্যাশ ও ডাটাবেজ সফলভাবে সিঙ্ক সম্পন্ন হয়েছে!"
          : "System Cache & Cloud Firestore Synced Successfully!",
        "success"
      );
    }, 1200);
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Executive Command Header */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-2xl text-white relative overflow-hidden">
        {/* Top ambient glow */}
        <div className="absolute top-0 right-1/4 w-96 h-40 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col gap-5 relative z-10">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-wider border border-emerald-500/30">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                {isBN ? "সিস্টেম অপারেশনাল (১০০%)" : "System Operational (100% Uptime)"}
              </span>

              {isSuperAdmin ? (
                <span className="px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-300 text-[10px] font-black uppercase tracking-wider border border-amber-500/40 flex items-center gap-1">
                  <span>👑</span>
                  <span>{isBN ? "সুপার এডমিন রুট অ্যাক্সেস" : "Super Admin Full Root Clearance"}</span>
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-bold border border-indigo-500/30">
                  {activeRole} Mode
                </span>
              )}

              <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1 bg-slate-950/60 px-2.5 py-0.5 rounded-md border border-slate-800">
                <Clock className="w-3 h-3 text-slate-400" />
                <span>BST {currentTime}</span>
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
              <span>{isBN ? "এডমিন কমান্ড সেন্টার ও ড্যাশবোর্ড" : "Enterprise Admin Command Center"}</span>
            </h1>
            <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
              {isBN
                ? "ক্যাটালগ পরিচালনা, রিয়েল-টাইম ট্রাফিক মনিটরিং, লজিস্টিকস ওয়্যারহাউজ, ক্যাশ ক্যালকুলেশন ও এআই বিজনেস গভর্নেন্স।"
                : "Real-time traffic load tracking, catalog operations, warehouse logistics, cash calculation ledger & AI business governance."}
            </p>
          </div>

          {/* Quick Action Button Hub */}
          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Dedicated Refill Center Button */}
            <button
              onClick={() => {
                setRefillInitialFilter("deficit");
                setIsRefillModalOpen(true);
              }}
              className="bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-slate-950 font-black text-xs px-3.5 py-2 rounded-xl shadow-md transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer border border-amber-300"
              title={isBN ? "কোন পণ্যগুলো রিফিল করতে হবে দেখুন (A to Z)" : "Check which items need refill (A to Z)"}
            >
              <Boxes className="w-4 h-4 text-slate-950" />
              <span>{isBN ? "📦 কোনগুলি রিফিল হবে (A-Z)" : "📦 Refill Center (A-Z)"}</span>
              <span className="bg-slate-950 text-amber-300 px-1.5 py-0.2 rounded-full text-[10px] font-mono">
                {lowStockProducts.length + outOfStockProducts.length}
              </span>
            </button>

            {/* Real-time Traffic load quick button */}
            <button
              onClick={() => setDashboardMode(dashboardMode === "traffic" ? "all" : "traffic")}
              className={`text-xs font-bold px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 shadow-md border ${
                dashboardMode === "traffic"
                  ? "bg-emerald-500 text-slate-950 border-emerald-400"
                  : "bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-300 border-emerald-500/40"
              }`}
            >
              <Activity className="w-4 h-4 text-emerald-400" />
              <span>{isBN ? "ট্রাফিক লোড মনিটর" : "Traffic Load Track"}</span>
            </button>

            {/* Cash Calculation Log Button */}
            <button
              onClick={() => setDashboardMode(dashboardMode === "cash" ? "all" : "cash")}
              className={`text-xs font-bold px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 shadow-md border ${
                dashboardMode === "cash"
                  ? "bg-amber-400 text-slate-950 border-amber-300 font-black"
                  : "bg-amber-950/60 hover:bg-amber-900/60 text-amber-300 border-amber-500/40"
              }`}
            >
              <Wallet className="w-4 h-4 text-amber-400" />
              <span>{isBN ? "ক্যাশ ক্যালকুলেশন" : "Cash Calculation"}</span>
            </button>

            {/* AI Business Agent 5-in-1 */}
            <button
              onClick={() => setAdminView("ai-agent")}
              className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:to-pink-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl shadow-md transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer"
            >
              <Bot className="w-4 h-4" />
              <span>{isBN ? "AI এজেন্ট (৫-ইন-১)" : "AI Agent Workspace"}</span>
            </button>

            {/* Excel Data Hub */}
            <button
              onClick={() => setAdminView("excel-hub")}
              className="bg-emerald-600/90 hover:bg-emerald-600 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition-colors shadow-2xs flex items-center gap-1.5 cursor-pointer active:scale-95"
            >
              <FileSpreadsheet className="w-4 h-4 text-amber-300" />
              <span>{isBN ? "এক্সেল হাব" : "Excel Hub"}</span>
            </button>

            {/* Manual Cache & Sync Button */}
            <button
              onClick={handleManualSync}
              disabled={isSyncing}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white transition cursor-pointer disabled:opacity-50"
              title={isBN ? "ক্যাশ ও ডাটাবেজ রিফ্রেশ" : "Sync Cache & Refresh DB"}
            >
              <RefreshCw className={`w-4 h-4 ${isSyncing ? "animate-spin text-emerald-400" : ""}`} />
            </button>
          </div>
        </div>

        {/* View Mode Switcher Filter Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-5 mt-5 border-t border-slate-800/80">
          <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-2xl border border-slate-800 text-xs font-bold overflow-x-auto no-scrollbar">
            <button
              onClick={() => setDashboardMode("all")}
              className={`px-3.5 py-2 rounded-xl transition-all whitespace-nowrap ${
                dashboardMode === "all"
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {isBN ? "🌟 পূর্ণাঙ্গ ওভারভিউ ও ট্রাফিক" : "🌟 Full Executive Overview"}
            </button>

            <button
              onClick={() => setDashboardMode("traffic")}
              className={`px-3.5 py-2 rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 ${
                dashboardMode === "traffic"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "text-slate-400 hover:text-emerald-300"
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>{isBN ? "📈 লাইভ ট্রাফিক ট্র্যাকার" : "📈 Traffic Load Tracker"}</span>
            </button>

            <button
              onClick={() => setDashboardMode("cash")}
              className={`px-3.5 py-2 rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 ${
                dashboardMode === "cash"
                  ? "bg-amber-400 text-slate-950 shadow-xs font-black"
                  : "text-slate-400 hover:text-amber-300"
              }`}
            >
              <Wallet className="w-3.5 h-3.5" />
              <span>{isBN ? "💵 ক্যাশ ক্যালকুলেশন লগ" : "💵 Cash Calculation Log"}</span>
            </button>

            <button
              onClick={() => setDashboardMode("directory")}
              className={`px-3.5 py-2 rounded-xl transition-all whitespace-nowrap ${
                dashboardMode === "directory"
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <span className="hidden sm:inline">🗂️</span>
              <span>{isBN ? " কমান্ড ডিরেক্টরি (২৮+ ফিচার)" : " Command Directory"}</span>
            </button>

            <button
              onClick={() => setDashboardMode("kpis")}
              className={`px-3.5 py-2 rounded-xl transition-all whitespace-nowrap ${
                dashboardMode === "kpis"
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {isBN ? "📊 আর্থিক ও সেলস কেপিআই" : "📊 Sales & Financial KPIs"}
            </button>
          </div>

          {/* Super Admin Status Ticker */}
          <div className="flex items-center gap-3 text-xs text-slate-400">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>Firestore: <strong>Active</strong></span>
            </div>
            <div className="flex items-center gap-1.5 hidden md:flex">
              <span className="w-2 h-2 rounded-full bg-indigo-400" />
              <span>CDN Nodes: <strong>3/3 Ready</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* Cash Calculation & Reconciliation Log (Visible when cash mode is selected) */}
      {dashboardMode === "cash" && (
        <section aria-label="Cash Calculation & Reconciliation Log">
          <CashCalculationLog />
        </section>
      )}

      {/* Real-time Traffic Load Tracker Section (Visible in 'all' and 'traffic' modes) */}
      {(dashboardMode === "all" || dashboardMode === "traffic") && (
        <section aria-label="Real-time Traffic Load Track">
          <TrafficLoadTracker />
        </section>
      )}

      {/* Primary Financial & Operational KPI Cards Grid */}
      {(dashboardMode === "all" || dashboardMode === "kpis") && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 1. Total Revenue -> Click to view Cash Calculation Log */}
          <button
            onClick={() => setDashboardMode("cash")}
            className="text-left bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-emerald-400 hover:shadow-md transition-all space-y-2 group cursor-pointer"
            title={isBN ? "ক্যাশ ক্যালকুলেশন ও হিসাব দেখতে ক্লিক করুন" : "Click to view Cash Calculation Ledger"}
          >
            <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
              <span className="group-hover:text-emerald-700 transition-colors">{isBN ? "মোট বিক্রয় ও আয়" : "Total Revenue"}</span>
              <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                <DollarSign className="w-4 h-4" />
              </span>
            </div>
            <div className="flex items-baseline justify-between mt-1">
              <h3 className="text-2xl font-black font-mono text-slate-900 tracking-tight group-hover:text-emerald-700 transition-colors">
                {settings.currencySymbol}
                {totalRevenue.toLocaleString()}
              </h3>
              <span className="text-emerald-700 text-xs font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                +14.8% ↑
              </span>
            </div>
            <div className="flex items-center justify-between pt-1">
              <p className="text-[10px] text-slate-400">
                {isBN ? "বিকাশ, নগদ ও সিওডি মিলিয়ে" : "Combined online & COD gross"}
              </p>
              <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-0.5 opacity-80 group-hover:opacity-100">
                <span>{isBN ? "ক্যাশ লগ" : "Cash Log"}</span>
                <ArrowUpRight className="w-3 h-3" />
              </span>
            </div>
          </button>

          {/* 2. Pending Orders -> Click to jump to Orders view */}
          <button
            onClick={() => setAdminView("orders")}
            className="text-left bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-amber-400 hover:shadow-md transition-all space-y-2 group cursor-pointer"
            title={isBN ? "পেন্ডিং অর্ডার প্রসেস করতে ক্লিক করুন" : "Click to process pending orders"}
          >
            <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
              <span className="group-hover:text-amber-700 transition-colors">{isBN ? "পেন্ডিং অর্ডারসমূহ" : "Pending Orders"}</span>
              <span className="p-1.5 rounded-lg bg-amber-50 text-amber-600 group-hover:bg-amber-500 group-hover:text-white transition-colors">
                <Clock className="w-4 h-4" />
              </span>
            </div>
            <div className="flex items-baseline justify-between mt-1">
              <h3 className="text-2xl font-black font-mono text-slate-900 tracking-tight group-hover:text-amber-700 transition-colors">
                {pendingOrders}
              </h3>
              <span className="text-amber-700 text-xs font-bold bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100">
                {pendingOrders} {isBN ? "অ্যাকশন প্রয়োজন" : "actions due"}
              </span>
            </div>
            <div className="flex items-center justify-between pt-1">
              <p className="text-[10px] text-slate-400">
                {isBN ? "প্যাকিং ও কুরিয়ার হ্যান্ডওভার" : "Awaiting courier handover"}
              </p>
              <span className="text-[10px] font-bold text-amber-600 flex items-center gap-0.5 opacity-80 group-hover:opacity-100">
                <span>{isBN ? "অর্ডারে যান" : "Go to Orders"}</span>
                <ArrowUpRight className="w-3 h-3" />
              </span>
            </div>
          </button>

          {/* 3. Delivered Orders -> Click to jump to Orders */}
          <button
            onClick={() => setAdminView("orders")}
            className="text-left bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-emerald-400 hover:shadow-md transition-all space-y-2 group cursor-pointer"
            title={isBN ? "ডেলিভার্ড অর্ডার ইতিহাস দেখতে ক্লিক করুন" : "Click to view delivered orders history"}
          >
            <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
              <span className="group-hover:text-emerald-700 transition-colors">{isBN ? "সফলভাবে ডেলিভার্ড" : "Delivered Orders"}</span>
              <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                <CheckCircle className="w-4 h-4" />
              </span>
            </div>
            <div className="flex items-baseline justify-between mt-1">
              <h3 className="text-2xl font-black font-mono text-slate-900 tracking-tight group-hover:text-emerald-700 transition-colors">
                {deliveredOrders}
              </h3>
              <span className="text-emerald-700 text-xs font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                98.2% SLA
              </span>
            </div>
            <div className="flex items-center justify-between pt-1">
              <p className="text-[10px] text-slate-400">
                {isBN ? "সফল কুরিয়ার ক্লোজার" : "Steadfast & RedX delivered"}
              </p>
              <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-0.5 opacity-80 group-hover:opacity-100">
                <span>{isBN ? "হিস্ট্রি দেখুন" : "View History"}</span>
                <ArrowUpRight className="w-3 h-3" />
              </span>
            </div>
          </button>

          {/* 4. Stock Warnings -> Click to open Refill Center Modal */}
          <button
            onClick={() => {
              setRefillInitialFilter("deficit");
              setIsRefillModalOpen(true);
            }}
            className="text-left bg-gradient-to-br from-white to-rose-50/50 p-5 rounded-2xl border-2 border-rose-200 shadow-xs hover:border-rose-500 hover:shadow-md transition-all space-y-2 group cursor-pointer relative overflow-hidden"
            title={isBN ? "কোনগুলো রিফিল করতে হবে দেখতে ক্লিক করুন (A to Z)" : "Click to see which items need refill (A to Z)"}
          >
            <div className="flex items-center justify-between text-slate-700 text-xs font-bold">
              <span className="text-rose-900 font-extrabold flex items-center gap-1">
                <span>{isBN ? "লো স্টক সতর্কতা" : "Low Stock Items"}</span>
              </span>
              <span className="p-1.5 rounded-lg bg-rose-100 text-rose-700 group-hover:bg-rose-600 group-hover:text-white transition-colors">
                <AlertTriangle className="w-4 h-4" />
              </span>
            </div>
            <div className="flex items-baseline justify-between mt-1">
              <h3 className="text-2xl font-black font-mono text-rose-600 tracking-tight">
                {lowStockProducts.length + outOfStockProducts.length}
              </h3>
              <span className="text-rose-800 text-xs font-black bg-rose-100 px-2 py-0.5 rounded-full border border-rose-200 animate-pulse">
                {isBN ? "রি-স্টক প্রয়োজন" : "Refill needed"}
              </span>
            </div>
            <div className="flex items-center justify-between pt-1 border-t border-rose-100">
              <p className="text-[10px] text-slate-500">
                {isBN ? "৫ টির কম ইনভেন্টরি স্টক" : "Less than 5 items left"}
              </p>
              <span className="text-[11px] font-extrabold text-rose-600 flex items-center gap-0.5 group-hover:underline">
                <span>{isBN ? "রিফিল দেখুন (A-Z)" : "Refill (A-Z)"}</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </button>
        </div>
      )}

      {/* Super Admin Infrastructure Matrix Bar */}
      {isSuperAdmin && (dashboardMode === "all" || dashboardMode === "kpis") && (
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 rounded-2xl p-4 text-white shadow-md flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
              <Server className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-bold text-white">
                {isBN ? "সুপার এডমিন সিস্টেম ইনফ্রাস্ট্রাকচার মেট্রিক্স" : "Super Admin Infrastructure Live Health"}
              </h4>
              <p className="text-[11px] text-slate-400">
                Postgres/Prisma DB • Redis Cache • Automated Hourly Backups • TLS 1.3
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 flex-wrap text-[11px] font-mono">
            <span className="text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> DB Latency: 4ms
            </span>
            <span className="text-indigo-300 flex items-center gap-1">
              <Cpu className="w-3.5 h-3.5" /> Node Load: 24%
            </span>
            <span className="text-amber-300 flex items-center gap-1">
              <Shield className="w-3.5 h-3.5" /> RBAC Strict
            </span>
            <button
              onClick={() => setAdminView("audit-logs")}
              className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white font-bold transition"
            >
              {isBN ? "অডিট লগ দেখুন →" : "Audit Logs →"}
            </button>
          </div>
        </div>
      )}

      {/* Structured Category → Subcategory → Feature Command Center Directory */}
      {(dashboardMode === "all" || dashboardMode === "directory") && (
        <CommandCenterDirectory onSelectFeature={(view) => setAdminView(view)} />
      )}

      {/* Sales Trend Chart & Recent Orders Layout */}
      {(dashboardMode === "all" || dashboardMode === "kpis") && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sales Performance Chart */}
          <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-indigo-600" />
                <span>{isBN ? "সাপ্তাহিক সেলস ও রেভিনিউ ট্রেন্ড" : "Weekly Sales & Revenue Trend"}</span>
              </h4>
              <select className="text-xs font-semibold border border-slate-200 rounded-lg px-2.5 py-1 text-slate-700 bg-slate-50 focus:outline-none">
                <option>{isBN ? "বিগত ৭ দিন" : "Last 7 Days"}</option>
                <option>{isBN ? "চলতি মাস" : "This Month"}</option>
                <option>{isBN ? "বাৎসরিক" : "Year To Date"}</option>
              </select>
            </div>

            <div className="h-60 w-full flex items-end justify-between gap-3 pt-6 px-2 pb-2">
              {[
                { day: isBN ? "সোম" : "Mon", val: 40, amt: 42000 },
                { day: isBN ? "মঙ্গল" : "Tue", val: 65, amt: 68000 },
                { day: isBN ? "বুধ" : "Wed", val: 85, amt: 89000 },
                { day: isBN ? "বৃহস্পতি" : "Thu", val: 55, amt: 58000 },
                { day: isBN ? "শুক্র" : "Fri", val: 95, amt: 105000 },
                { day: isBN ? "শনি" : "Sat", val: 75, amt: 79000 },
                { day: isBN ? "রবি" : "Sun", val: 30, amt: 31000 },
              ].map((bar, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                  <span className="text-[10px] font-mono font-bold text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity">
                    {settings.currencySymbol}
                    {(bar.amt / 1000).toFixed(0)}k
                  </span>
                  <div
                    className="w-full max-w-[36px] bg-indigo-600 hover:bg-indigo-700 rounded-t-lg transition-all duration-300 shadow-2xs"
                    style={{ height: `${bar.val}%` }}
                  />
                  <span className="text-[11px] font-medium text-slate-500">{bar.day}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Orders Side Widget */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-indigo-600" />
                <span>{isBN ? "সাম্প্রতিক অর্ডারসমূহ" : "Recent Orders"}</span>
              </h4>
              <button
                onClick={() => setAdminView("orders")}
                className="text-xs font-semibold text-indigo-600 hover:underline cursor-pointer"
              >
                {isBN ? "সব দেখুন" : "View All"}
              </button>
            </div>

            <div className="space-y-3">
              {orders.slice(0, 4).map((order, idx) => {
                const statusClass =
                  order.orderStatus === "Delivered"
                    ? "bg-emerald-100 text-emerald-800"
                    : order.orderStatus === "Pending"
                    ? "bg-amber-100 text-amber-800"
                    : "bg-blue-100 text-blue-800";

                return (
                  <div
                    key={order.id}
                    className="flex items-center justify-between pb-3 border-b border-slate-100 last:border-none last:pb-0"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs font-mono shrink-0">
                        #{idx + 1}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-900 truncate">{order.orderNumber}</p>
                        <p className="text-[10px] text-slate-400 truncate">{order.customerName}</p>
                      </div>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${statusClass}`}>
                      {order.orderStatus}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Secondary Stats & Inventory Stock Warnings */}
      {(dashboardMode === "all" || dashboardMode === "kpis") && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Administrative Audit Activity */}
          <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Activity className="w-4 h-4 text-indigo-600" />
                <span>{isBN ? "সাম্প্রতিক প্রশাসনিক কার্যক্রম (Audit Log)" : "Recent Administrative Activity"}</span>
              </h3>
              <button
                onClick={() => setAdminView("audit-logs")}
                className="text-xs text-indigo-600 font-semibold hover:underline cursor-pointer"
              >
                {isBN ? "পূর্ণাঙ্গ লগ" : "Full Log"}
              </button>
            </div>

            <div className="space-y-2 text-xs">
              {auditLogs.slice(0, 4).map((log) => (
                <div
                  key={log.id}
                  className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-black shrink-0 text-xs">
                      {log.userName.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <span className="font-bold text-slate-900 block truncate">{log.action}</span>
                      <span className="text-slate-400 text-[11px] truncate block">
                        By {log.userName} ({log.userRole}) • {log.module}
                      </span>
                    </div>
                  </div>

                  <span className="text-[10px] text-slate-400 font-mono shrink-0 pl-2">{log.timestamp}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Low Stock Warning Card */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <span>{isBN ? "ইনভেন্টরি স্টক সতর্কতা" : "Inventory Stock Warnings"}</span>
              </h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setRefillInitialFilter("deficit");
                    setIsRefillModalOpen(true);
                  }}
                  className="text-xs text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-2 py-1 rounded-lg font-bold transition flex items-center gap-1 cursor-pointer"
                  title="Open A-to-Z Refill Center"
                >
                  <Boxes className="w-3 h-3 text-amber-600" />
                  <span>{isBN ? "রিফিল তালিকা" : "Refill Hub"}</span>
                </button>
                <button
                  onClick={() => setAdminView("inventory")}
                  className="text-xs text-indigo-600 font-semibold hover:underline cursor-pointer"
                >
                  {isBN ? "ইনভেন্টরি" : "Inventory"}
                </button>
              </div>
            </div>

            <div className="space-y-2.5">
              {lowStockProducts.length === 0 ? (
                <div className="text-center py-6 space-y-2">
                  <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto" />
                  <p className="text-xs text-slate-600 font-medium">
                    {isBN ? "সকল ইনভেন্টরি স্টক লেভেল নিরাপদ।" : "All inventory stock levels are healthy."}
                  </p>
                  <button
                    onClick={() => {
                      setRefillInitialFilter("all");
                      setIsRefillModalOpen(true);
                    }}
                    className="text-xs text-indigo-600 font-bold hover:underline cursor-pointer inline-flex items-center gap-1"
                  >
                    <span>{isBN ? "সকল পণ্যের স্টক দেখুন (A to Z) →" : "View All Stock Levels (A-Z) →"}</span>
                  </button>
                </div>
              ) : (
                lowStockProducts.map((prod) => (
                  <div
                    key={prod.id}
                    className="flex items-center justify-between p-2.5 bg-slate-50 hover:bg-amber-50/50 rounded-xl border border-slate-200 transition-colors text-xs group"
                  >
                    <div
                      onClick={() => {
                        setRefillInitialFilter("deficit");
                        setIsRefillModalOpen(true);
                      }}
                      className="flex items-center gap-2.5 min-w-0 flex-1 cursor-pointer"
                    >
                      <img
                        src={prod.mainImage}
                        alt={prod.name}
                        className="w-8 h-8 rounded-lg object-contain bg-white p-1 border border-slate-200 shrink-0"
                      />
                      <div className="min-w-0">
                        <span className="font-bold text-slate-900 block line-clamp-1 group-hover:text-amber-800">{prod.name}</span>
                        <span className="text-[10px] text-slate-400 font-mono">SKU: {prod.sku}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0 pl-2">
                      <span className="bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full text-[10px] font-mono">
                        {prod.totalStock} {isBN ? "বাকি" : "left"}
                      </span>
                      <button
                        onClick={() => {
                          updateProduct(prod.id, { totalStock: prod.totalStock + 10, isLowStock: false });
                          addToast(isBN ? `${prod.name} এ +১০ টি স্টক যুক্ত হয়েছে!` : `Added +10 stock to ${prod.name}!`, "success");
                        }}
                        className="p-1 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-[10px] transition cursor-pointer"
                        title={isBN ? "+১০ টি স্টক রিফিল করুন" : "Quick Refill +10"}
                      >
                        +10
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Quick Action Footer in Low Stock Widget */}
            <button
              onClick={() => {
                setRefillInitialFilter("deficit");
                setIsRefillModalOpen(true);
              }}
              className="w-full py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-black text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Boxes className="w-3.5 h-3.5" />
              <span>{isBN ? "কোনগুলো রিফিল করতে হবে দেখুন (A-Z)" : "Check Which Items Need Refill (A-Z)"}</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Interactive Stock Refill Center Modal */}
      <RefillStockCenterModal
        isOpen={isRefillModalOpen}
        onClose={() => setIsRefillModalOpen(false)}
        initialFilter={refillInitialFilter}
      />
    </div>
  );
};
