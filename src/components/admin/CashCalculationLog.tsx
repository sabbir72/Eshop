import React, { useState, useMemo } from "react";
import { useStore } from "../../context/StoreContext";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  ArrowDownLeft,
  ArrowUpRight,
  Filter,
  Search,
  Plus,
  Printer,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ShieldCheck,
  Calculator,
  Building,
  Truck,
  RotateCcw,
  Lock,
  Wallet,
  Receipt,
  Eye,
  X,
  CreditCard,
  RefreshCw,
  Sliders,
  ChevronDown,
} from "lucide-react";
import { exportToCSV } from "../../utils/exportUtils";

export interface CashEntry {
  id: string;
  voucherNo: string;
  orderNumber?: string;
  date: string;
  time: string;
  type: "inflow" | "outflow";
  category:
    | "COD Collection"
    | "bKash Inflow"
    | "Nagad Inflow"
    | "Rocket Inflow"
    | "SSLCommerz Card"
    | "Courier Remittance"
    | "Courier Delivery Charge"
    | "Customer Refund"
    | "Supplier Payment"
    | "Office Petty Cash"
    | "Packaging Materials"
    | "Bank Deposit";
  channel: "Cash On Delivery" | "bKash" | "Nagad" | "Rocket" | "SSLCommerz" | "Cash Drawer" | "Bank Transfer";
  amount: number;
  customerOrBeneficiary: string;
  courierName?: string;
  courierTrackingNo?: string;
  reconciliationStatus: "Reconciled" | "Pending Courier" | "Disputed" | "Deposited to Bank";
  recordedBy: string;
  notes?: string;
}

export const CashCalculationLog: React.FC = () => {
  const { orders, settings, language, activeRole, currentUser, addToast } = useStore();
  const isBN = language === "BN";
  const isSuperAdmin = activeRole === "Super Admin";

  // State for manual cash entries added in session
  const [manualEntries, setManualEntries] = useState<CashEntry[]>([
    {
      id: "entry-cod-remit-1",
      voucherNo: "VCH-2026-081",
      orderNumber: "ORD-9021",
      date: new Date().toISOString().split("T")[0],
      time: "11:30 AM",
      type: "inflow",
      category: "Courier Remittance",
      channel: "Cash On Delivery",
      amount: 4850,
      customerOrBeneficiary: "Steadfast Courier Remittance Handover",
      courierName: "Steadfast Courier",
      courierTrackingNo: "ST-8819420",
      reconciliationStatus: "Reconciled",
      recordedBy: "Accountant Rakib",
      notes: "Daily COD collection batch disbursement after delivery",
    },
    {
      id: "entry-petty-1",
      voucherNo: "VCH-2026-082",
      date: new Date().toISOString().split("T")[0],
      time: "12:15 PM",
      type: "outflow",
      category: "Office Petty Cash",
      channel: "Cash Drawer",
      amount: 450,
      customerOrBeneficiary: "Packing Bubblewrap & Poly Supply",
      reconciliationStatus: "Reconciled",
      recordedBy: currentUser.name || "Admin",
      notes: "Warehouse shipping consumables for fragile electronics",
    },
    {
      id: "entry-refund-1",
      voucherNo: "VCH-2026-083",
      orderNumber: "ORD-8992",
      date: new Date().toISOString().split("T")[0],
      time: "02:00 PM",
      type: "outflow",
      category: "Customer Refund",
      channel: "bKash",
      amount: 1200,
      customerOrBeneficiary: "Farhana Akter (Size Exchange Adjustment)",
      reconciliationStatus: "Reconciled",
      recordedBy: "Support Supervisor",
      notes: "Processed instant partial refund to customer wallet",
    },
    {
      id: "entry-courier-fee-1",
      voucherNo: "VCH-2026-084",
      date: new Date().toISOString().split("T")[0],
      time: "03:45 PM",
      type: "outflow",
      category: "Courier Delivery Charge",
      channel: "Cash Drawer",
      amount: 980,
      customerOrBeneficiary: "Pathao Express Daily Freight Bill",
      courierName: "Pathao Express",
      courierTrackingNo: "PTH-99210",
      reconciliationStatus: "Reconciled",
      recordedBy: "Logistics Dispatcher",
      notes: "14 parcel dispatches across Dhaka & Chittagong",
    },
    {
      id: "entry-bank-dep-1",
      voucherNo: "VCH-2026-085",
      date: new Date().toISOString().split("T")[0],
      time: "04:30 PM",
      type: "outflow",
      category: "Bank Deposit",
      channel: "Bank Transfer",
      amount: 25000,
      customerOrBeneficiary: "City Bank Corporate Account #2104",
      reconciliationStatus: "Deposited to Bank",
      recordedBy: "Accountant Rakib",
      notes: "End of day excess cash deposit into corporate checking",
    },
  ]);

  // Filters state
  const [searchQuery, setSearchQuery] = useState("");
  const [filterChannel, setFilterChannel] = useState<string>("all");
  const [filterType, setFilterType] = useState<"all" | "inflow" | "outflow">("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterDateRange, setFilterDateRange] = useState<"all" | "today" | "week" | "month">("all");

  // Denomination notes calculator state
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);
  const [denominations, setDenominations] = useState<{ [key: number]: number }>({
    1000: 18,
    500: 24,
    200: 35,
    100: 42,
    50: 15,
    20: 10,
    10: 20,
  });

  // Add Manual Cash Entry Modal State
  const [isAddEntryModalOpen, setIsAddEntryModalOpen] = useState(false);
  const [newEntry, setNewEntry] = useState({
    type: "inflow" as "inflow" | "outflow",
    category: "COD Collection" as CashEntry["category"],
    channel: "Cash On Delivery" as CashEntry["channel"],
    amount: "",
    customerOrBeneficiary: "",
    orderNumber: "",
    courierName: "",
    courierTrackingNo: "",
    notes: "",
  });

  // Derive initial cash entries from the StoreContext orders list
  const orderDerivedEntries: CashEntry[] = useMemo(() => {
    return orders.map((o) => {
      const isCod = o.paymentMethod === "Cash On Delivery";
      const isDelivered = o.orderStatus === "Delivered";
      const isCancelled = o.orderStatus === "Cancelled";

      let status: CashEntry["reconciliationStatus"] = "Reconciled";
      if (isCod) {
        if (isDelivered) {
          status = "Reconciled";
        } else if (isCancelled) {
          status = "Disputed";
        } else {
          status = "Pending Courier";
        }
      } else {
        status = "Reconciled";
      }

      const category: CashEntry["category"] =
        o.paymentMethod === "bKash"
          ? "bKash Inflow"
          : o.paymentMethod === "Nagad"
          ? "Nagad Inflow"
          : o.paymentMethod === "Rocket"
          ? "Rocket Inflow"
          : o.paymentMethod === "SSLCommerz"
          ? "SSLCommerz Card"
          : "COD Collection";

      return {
        id: `order-cash-${o.id}`,
        voucherNo: `VCH-${o.orderNumber.replace(/[^0-9]/g, "").slice(-4) || "001"}`,
        orderNumber: o.orderNumber,
        date: o.createdAt.split(" ")[0] || new Date().toISOString().split("T")[0],
        time: o.createdAt.split(" ")[1] || "10:00 AM",
        type: "inflow",
        category,
        channel: o.paymentMethod as any,
        amount: o.total,
        customerOrBeneficiary: `${o.customerName} (${o.customerPhone || "N/A"})`,
        courierName: isCod ? "Steadfast Courier" : undefined,
        courierTrackingNo: isCod ? `ST-${o.orderNumber.replace(/[^0-9]/g, "")}` : undefined,
        reconciliationStatus: status,
        recordedBy: "Automated Gateway",
        notes: `Order items: ${o.items.length} sku(s). Payment: ${o.paymentMethod}.`,
      };
    });
  }, [orders]);

  // All combined transactions
  const allTransactions: CashEntry[] = useMemo(() => {
    const list = [...manualEntries, ...orderDerivedEntries];
    // Sort newest first
    return list.sort((a, b) => b.id.localeCompare(a.id));
  }, [manualEntries, orderDerivedEntries]);

  // Filtered transactions
  const filteredTransactions = useMemo(() => {
    const todayStr = new Date().toISOString().split("T")[0];

    return allTransactions.filter((item) => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchVoucher = item.voucherNo.toLowerCase().includes(q);
        const matchOrder = item.orderNumber?.toLowerCase().includes(q);
        const matchPerson = item.customerOrBeneficiary.toLowerCase().includes(q);
        const matchCourier = item.courierTrackingNo?.toLowerCase().includes(q);
        const matchNotes = item.notes?.toLowerCase().includes(q);
        if (!matchVoucher && !matchOrder && !matchPerson && !matchCourier && !matchNotes) {
          return false;
        }
      }

      // Filter Channel
      if (filterChannel !== "all" && item.channel !== filterChannel) {
        return false;
      }

      // Filter Type
      if (filterType !== "all" && item.type !== filterType) {
        return false;
      }

      // Filter Status
      if (filterStatus !== "all" && item.reconciliationStatus !== filterStatus) {
        return false;
      }

      // Filter Date
      if (filterDateRange === "today") {
        if (!item.date.includes(todayStr)) return false;
      }

      return true;
    });
  }, [allTransactions, searchQuery, filterChannel, filterType, filterStatus, filterDateRange]);

  // Executive Balance Calculations
  const metrics = useMemo(() => {
    let totalInflow = 0;
    let totalOutflow = 0;
    let codCashInHand = 0;
    let digitalGatewayTotal = 0;
    let courierPendingTotal = 0;

    allTransactions.forEach((t) => {
      if (t.type === "inflow") {
        totalInflow += t.amount;
        if (t.channel === "Cash On Delivery" && t.reconciliationStatus === "Reconciled") {
          codCashInHand += t.amount;
        } else if (t.channel === "Cash On Delivery" && t.reconciliationStatus === "Pending Courier") {
          courierPendingTotal += t.amount;
        } else if (t.channel !== "Cash On Delivery" && t.channel !== "Cash Drawer") {
          digitalGatewayTotal += t.amount;
        }
      } else {
        totalOutflow += t.amount;
      }
    });

    const openingBalance = 15000; // Standard day opening cash float
    const netCashPosition = openingBalance + totalInflow - totalOutflow;

    return {
      openingBalance,
      totalInflow,
      totalOutflow,
      codCashInHand,
      digitalGatewayTotal,
      courierPendingTotal,
      netCashPosition,
    };
  }, [allTransactions]);

  // Denominations Total Calculation
  const denominationTotal = useMemo(() => {
    return Object.entries(denominations).reduce((sum, [note, count]) => {
      return sum + Number(note) * count;
    }, 0);
  }, [denominations]);

  // Drawer variance calculation against COD in-hand + manual cash drawer items
  const drawerVariance = denominationTotal - metrics.codCashInHand;

  // Handle adding manual cash entry
  const handleSaveEntry = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(newEntry.amount);
    if (!parsedAmount || parsedAmount <= 0) {
      addToast(isBN ? "সঠিক টাকার পরিমাণ প্রদান করুন!" : "Please enter a valid amount!", "error");
      return;
    }
    if (!newEntry.customerOrBeneficiary.trim()) {
      addToast(isBN ? "গ্রহীতা বা উৎস নাম প্রদান করুন!" : "Please enter beneficiary / source!", "error");
      return;
    }

    const created: CashEntry = {
      id: `manual-cash-${Date.now()}`,
      voucherNo: `VCH-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      orderNumber: newEntry.orderNumber.trim() || undefined,
      date: new Date().toISOString().split("T")[0],
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      type: newEntry.type,
      category: newEntry.category,
      channel: newEntry.channel,
      amount: parsedAmount,
      customerOrBeneficiary: newEntry.customerOrBeneficiary.trim(),
      courierName: newEntry.courierName.trim() || undefined,
      courierTrackingNo: newEntry.courierTrackingNo.trim() || undefined,
      reconciliationStatus: "Reconciled",
      recordedBy: currentUser.name || "Supervisor Admin",
      notes: newEntry.notes.trim() || "Manual financial ledger journal record",
    };

    setManualEntries((prev) => [created, ...prev]);
    setIsAddEntryModalOpen(false);
    setNewEntry({
      type: "inflow",
      category: "COD Collection",
      channel: "Cash On Delivery",
      amount: "",
      customerOrBeneficiary: "",
      orderNumber: "",
      courierName: "",
      courierTrackingNo: "",
      notes: "",
    });

    addToast(
      isBN
        ? `ক্যাশ এন্ট্রি (${settings.currencySymbol}${parsedAmount.toLocaleString()}) সফলভাবে লিপিবদ্ধ হয়েছে!`
        : `Cash entry (${settings.currencySymbol}${parsedAmount.toLocaleString()}) logged successfully!`,
      "success"
    );
  };

  // Export CSV
  const handleExportCSV = () => {
    const data = filteredTransactions.map((t) => ({
      Voucher: t.voucherNo,
      Date: `${t.date} ${t.time}`,
      Type: t.type.toUpperCase(),
      Category: t.category,
      Channel: t.channel,
      Amount: t.amount,
      Party: t.customerOrBeneficiary,
      OrderNumber: t.orderNumber || "N/A",
      Courier: t.courierName || "N/A",
      Tracking: t.courierTrackingNo || "N/A",
      Status: t.reconciliationStatus,
      RecordedBy: t.recordedBy,
    }));
    exportToCSV("Daily_Cash_Calculation_Audit_Ledger", data);
    addToast(isBN ? "ক্যাশ ক্যালকুলেশন এক্সেল সিএসভি ডাউনলোড হয়েছে!" : "Cash ledger exported to CSV!", "success");
  };

  // Toggle status of an entry
  const handleToggleStatus = (id: string) => {
    setManualEntries((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const nextStatus =
            item.reconciliationStatus === "Reconciled"
              ? "Deposited to Bank"
              : item.reconciliationStatus === "Deposited to Bank"
              ? "Disputed"
              : "Reconciled";
          return { ...item, reconciliationStatus: nextStatus };
        }
        return item;
      })
    );
    addToast(isBN ? "রিকনসিলিয়েশন স্ট্যাটাস আপডেট হয়েছে!" : "Reconciliation status updated!", "info");
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Top Banner Header */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-2xl text-white relative overflow-hidden">
        {/* Glow ambient */}
        <div className="absolute top-0 right-1/4 w-80 h-32 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative z-10">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-wider border border-emerald-500/30">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                {isBN ? "ক্যাশ অডিট ও রিকনসিলিয়েশন লাইভ" : "Live Cash Audit & Daily Reconciliation"}
              </span>

              {isSuperAdmin && (
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-black uppercase tracking-wider border border-amber-500/30">
                  👑 Super Admin Master Ledger
                </span>
              )}

              <span className="text-[11px] font-mono text-slate-400 bg-slate-950/70 px-2 py-0.5 rounded-md border border-slate-800">
                {new Date().toLocaleDateString(isBN ? "bn-BD" : "en-US", {
                  weekday: "short",
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
              <Wallet className="w-7 h-7 text-emerald-400" />
              <span>{isBN ? "ক্যাশ ক্যালকুলেশন ও রিকনসিলিয়েশন লগ" : "Cash Calculation & Reconciliation Log"}</span>
            </h1>

            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              {isBN
                ? "ক্যাশ অন ডেলিভারি (সিওডি), বিকাশ/নগদ গেটওয়ে সেটেলমেন্ট, কুরিয়ার রিকনসিলিয়েশন ও ক্যাশ ড্রয়ার নোট ব্যালান্সিং।"
                : "Real-time COD cash-in-hand, bKash & Nagad gateway settlement, courier remittance tracking & physical cash drawer notes tally."}
            </p>
          </div>

          {/* Action Button Suite */}
          <div className="flex items-center gap-2.5 flex-wrap shrink-0">
            {/* Denomination Calculator Toggle */}
            <button
              onClick={() => setIsCalculatorOpen(!isCalculatorOpen)}
              className={`text-xs font-bold px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 shadow-md border ${
                isCalculatorOpen
                  ? "bg-indigo-600 text-white border-indigo-500 shadow-indigo-600/30"
                  : "bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700"
              }`}
            >
              <Calculator className="w-4 h-4 text-amber-400" />
              <span>{isBN ? "নোট গণনা ক্যালকুলেটর" : "Cash Note Calculator"}</span>
            </button>

            {/* Manual Cash In / Out Entry Button */}
            <button
              onClick={() => setIsAddEntryModalOpen(true)}
              className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3.5 py-2 rounded-xl shadow-md transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{isBN ? "+ নতুন ক্যাশ এন্ট্রি" : "+ Record Cash Entry"}</span>
            </button>

            {/* Export CSV */}
            <button
              onClick={handleExportCSV}
              className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 hover:text-white text-xs font-bold px-3 py-2 rounded-xl transition-colors flex items-center gap-1.5"
              title="Export Daily Cash Ledger to CSV"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              <span className="hidden sm:inline">{isBN ? "এক্সপোর্ট" : "Export"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 5 Executive Balance Pillar Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
        {/* 1. Net Cash Drawer Balance */}
        <div className="col-span-2 sm:col-span-1 bg-white p-4.5 rounded-2xl border-2 border-emerald-500/40 shadow-xs space-y-1.5 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
            <span className="text-slate-800 font-extrabold">{isBN ? "নেট ক্যাশ ইন-হ্যান্ড" : "Net Cash In-Hand"}</span>
            <span className="p-1 rounded-md bg-emerald-100 text-emerald-700">
              <Wallet className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-black font-mono text-emerald-700 tracking-tight">
            {settings.currencySymbol}
            {metrics.netCashPosition.toLocaleString()}
          </div>
          <p className="text-[10px] text-slate-500 font-medium">
            {isBN ? "ওপেনিং + মোট জমা - খরচ" : "Opening + Inflow - Outflow"}
          </p>
        </div>

        {/* 2. Reconciled COD In-Hand */}
        <div className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-xs space-y-1.5">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
            <span>{isBN ? "সংগৃহীত সিওডি ক্যাশ" : "COD Cash Collected"}</span>
            <span className="p-1 rounded-md bg-blue-100 text-blue-700">
              <Truck className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-black font-mono text-blue-700 tracking-tight">
            {settings.currencySymbol}
            {metrics.codCashInHand.toLocaleString()}
          </div>
          <p className="text-[10px] text-slate-500">
            {isBN ? "কুরিয়ার থেকে প্রাপ্ত নগদ টাকা" : "Physical cash settled by couriers"}
          </p>
        </div>

        {/* 3. Digital Gateways Inflow */}
        <div className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-xs space-y-1.5">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
            <span>{isBN ? "বিকাশ ও নগদ ডিজিটাল" : "Digital Gateways"}</span>
            <span className="p-1 rounded-md bg-purple-100 text-purple-700">
              <CreditCard className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-black font-mono text-purple-700 tracking-tight">
            {settings.currencySymbol}
            {metrics.digitalGatewayTotal.toLocaleString()}
          </div>
          <p className="text-[10px] text-slate-500">
            {isBN ? "মার্চেন্ট একাউন্ট সেটেলমেন্ট" : "bKash, Nagad & Cards inflow"}
          </p>
        </div>

        {/* 4. Cash Outflows & Disbursements */}
        <div className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-xs space-y-1.5">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
            <span>{isBN ? "মোট ক্যাশ খরচ ও প্রদান" : "Cash Outflow"}</span>
            <span className="p-1 rounded-md bg-rose-100 text-rose-700">
              <TrendingDown className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-black font-mono text-rose-600 tracking-tight">
            {settings.currencySymbol}
            {metrics.totalOutflow.toLocaleString()}
          </div>
          <p className="text-[10px] text-slate-500">
            {isBN ? "কুরিয়ার বিল, রিফান্ড ও পেটিক্যাশ" : "Courier fees, refunds & petty cash"}
          </p>
        </div>

        {/* 5. Courier In-Transit Pending */}
        <div className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-xs space-y-1.5">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
            <span>{isBN ? "কুরিয়ারে পেন্ডিং সিওডি" : "Courier Pipeline"}</span>
            <span className="p-1 rounded-md bg-amber-100 text-amber-700">
              <Clock className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-black font-mono text-amber-700 tracking-tight">
            {settings.currencySymbol}
            {metrics.courierPendingTotal.toLocaleString()}
          </div>
          <p className="text-[10px] text-slate-500">
            {isBN ? "ডেলিভারি শেষে রেমিট্যান্স আসবে" : "Expected COD remittance in-transit"}
          </p>
        </div>
      </div>

      {/* Interactive Cash Note Denomination Calculator Accordion */}
      {isCalculatorOpen && (
        <div className="bg-gradient-to-br from-slate-900 to-indigo-950 border border-slate-800 rounded-3xl p-6 text-white shadow-xl space-y-5 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800 gap-3">
            <div>
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                <Calculator className="w-5 h-5 text-amber-400" />
                <span>{isBN ? "ক্যাশ ড্রয়ার নোট গণনা ও ফিজিক্যাল রিকনসিলিয়েশন" : "Cash Drawer Denomination Tally & Count"}</span>
              </h3>
              <p className="text-xs text-slate-400">
                {isBN
                  ? "ড্রয়ারে থাকা বাংলাদেশি টাকার বিভিন্ন নোট গুনে সংখ্যা লিখুন। সিস্টেম স্বয়ংক্রিয়ভাবে মোট ও পার্থক্যের হিসাব বের করবে।"
                  : "Count currency notes in the cashier drawer. The system instantly tallies physical cash against expected COD."}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setDenominations({ 1000: 0, 500: 0, 200: 0, 100: 0, 50: 0, 20: 0, 10: 0 });
                  addToast(isBN ? "ক্যালকুলেটর ক্লিয়ার করা হয়েছে" : "Calculator reset", "info");
                }}
                className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition flex items-center gap-1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{isBN ? "রিসেট" : "Reset"}</span>
              </button>
            </div>
          </div>

          {/* Grid of note count inputs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
            {[1000, 500, 200, 100, 50, 20, 10].map((note) => {
              const count = denominations[note] || 0;
              const subtotal = note * count;
              return (
                <div key={note} className="bg-slate-800/80 p-3 rounded-2xl border border-slate-700/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-amber-300 font-mono">৳{note}</span>
                    <span className="text-[10px] text-slate-400">{isBN ? "নোট" : "Note"}</span>
                  </div>
                  <input
                    type="number"
                    min="0"
                    value={count}
                    onChange={(e) => {
                      const val = Math.max(0, parseInt(e.target.value) || 0);
                      setDenominations((prev) => ({ ...prev, [note]: val }));
                    }}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-1.5 text-sm font-black font-mono text-white text-center focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
                  />
                  <div className="text-[11px] font-mono font-bold text-emerald-400 text-center">
                    = ৳{subtotal.toLocaleString()}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Summary and Variance Result Bar */}
          <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-6 flex-wrap text-xs">
              <div>
                <span className="text-slate-400 block">{isBN ? "গণনাকৃত মোট ক্যাশ" : "Physical Count Total"}</span>
                <span className="text-xl font-black font-mono text-emerald-400">
                  {settings.currencySymbol}
                  {denominationTotal.toLocaleString()}
                </span>
              </div>
              <div className="h-8 w-px bg-slate-800 hidden sm:block" />
              <div>
                <span className="text-slate-400 block">{isBN ? "সিস্টেমে প্রত্যাশিত সিওডি" : "Expected COD In-Hand"}</span>
                <span className="text-xl font-black font-mono text-slate-200">
                  {settings.currencySymbol}
                  {metrics.codCashInHand.toLocaleString()}
                </span>
              </div>
              <div className="h-8 w-px bg-slate-800 hidden sm:block" />
              <div>
                <span className="text-slate-400 block">{isBN ? "পার্থক্য (Variance)" : "Discrepancy / Variance"}</span>
                <span
                  className={`text-xl font-black font-mono ${
                    drawerVariance === 0
                      ? "text-emerald-400"
                      : drawerVariance > 0
                      ? "text-blue-400"
                      : "text-rose-400"
                  }`}
                >
                  {drawerVariance > 0 ? "+" : ""}
                  {settings.currencySymbol}
                  {drawerVariance.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Status indicator button */}
            <div className="flex items-center gap-3">
              {drawerVariance === 0 ? (
                <span className="px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-bold text-xs flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isBN ? "✅ ১০০% নিখুঁত ব্যালান্স" : "✅ 100% Balanced"}</span>
                </span>
              ) : drawerVariance > 0 ? (
                <span className="px-3 py-1.5 rounded-xl bg-blue-500/20 text-blue-300 border border-blue-500/40 font-bold text-xs flex items-center gap-1.5">
                  <span>ℹ️ {isBN ? "উদ্বৃত্ত ক্যাশ (+)" : "Surplus Cash (+)"}</span>
                </span>
              ) : (
                <span className="px-3 py-1.5 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/40 font-bold text-xs flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4" />
                  <span>{isBN ? "⚠️ ক্যাশ ঘাটতি (-)" : "⚠️ Cash Shortage (-)"}</span>
                </span>
              )}

              <button
                onClick={() => {
                  addToast(
                    isBN
                      ? "ক্যাশ ড্রয়ার শিফট অডিট সফলভাবে সিল ও রেকর্ড করা হয়েছে!"
                      : "Cash Drawer Shift Reconciled and Locked Successfully!",
                    "success"
                  );
                }}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center gap-1.5"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>{isBN ? "ড্রয়ার লক ও শিফট ক্লোজ" : "Lock & Close Shift"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Ledger Control & Search Bar */}
      <div className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                isBN
                  ? "ভাউচার নম্বর, অর্ডার আইডি, কাস্টমার, কুরিয়ার ট্র্যাকিং খুঁজুন..."
                  : "Search voucher #, order ID, customer name, courier tracking..."
              }
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          {/* Quick Filters */}
          <div className="flex items-center gap-2 flex-wrap text-xs">
            {/* Flow Type Filter */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 font-bold">
              <button
                onClick={() => setFilterType("all")}
                className={`px-2.5 py-1 rounded-lg transition ${
                  filterType === "all" ? "bg-white text-slate-900 shadow-2xs" : "text-slate-500 hover:text-slate-900"
                }`}
              >
                {isBN ? "সব" : "All"}
              </button>
              <button
                onClick={() => setFilterType("inflow")}
                className={`px-2.5 py-1 rounded-lg transition text-emerald-700 flex items-center gap-1 ${
                  filterType === "inflow" ? "bg-white shadow-2xs font-black" : "text-slate-500"
                }`}
              >
                <ArrowDownLeft className="w-3 h-3 text-emerald-600" />
                <span>{isBN ? "জমা (+)" : "Inflow (+)"}</span>
              </button>
              <button
                onClick={() => setFilterType("outflow")}
                className={`px-2.5 py-1 rounded-lg transition text-rose-700 flex items-center gap-1 ${
                  filterType === "outflow" ? "bg-white shadow-2xs font-black" : "text-slate-500"
                }`}
              >
                <ArrowUpRight className="w-3 h-3 text-rose-600" />
                <span>{isBN ? "খরচ (-)" : "Outflow (-)"}</span>
              </button>
            </div>

            {/* Payment Channel Filter */}
            <select
              value={filterChannel}
              onChange={(e) => setFilterChannel(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none"
            >
              <option value="all">{isBN ? "সকল পেমেন্ট চ্যানেল" : "All Channels"}</option>
              <option value="Cash On Delivery">Cash On Delivery (COD)</option>
              <option value="bKash">bKash Merchant</option>
              <option value="Nagad">Nagad Wallet</option>
              <option value="Rocket">Rocket</option>
              <option value="SSLCommerz">SSLCommerz Card</option>
              <option value="Cash Drawer">Physical Cash Drawer</option>
              <option value="Bank Transfer">Bank Transfer</option>
            </select>

            {/* Reconciliation Status Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none"
            >
              <option value="all">{isBN ? "সকল স্ট্যাটাস" : "All Status"}</option>
              <option value="Reconciled">{isBN ? "কালেক্টেড / জমা" : "Reconciled"}</option>
              <option value="Pending Courier">{isBN ? "কুরিয়ারে পেন্ডিং" : "Pending Courier"}</option>
              <option value="Deposited to Bank">{isBN ? "ব্যাংকে জমা" : "Deposited to Bank"}</option>
              <option value="Disputed">{isBN ? "রিটার্ন / ডিসপ্যুট" : "Disputed"}</option>
            </select>

            {/* Date filter */}
            <select
              value={filterDateRange}
              onChange={(e) => setFilterDateRange(e.target.value as any)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none"
            >
              <option value="all">{isBN ? "সকল তারিখ" : "All Dates"}</option>
              <option value="today">{isBN ? "আজকের দিন" : "Today Only"}</option>
            </select>
          </div>
        </div>

        {/* Results Counter Bar */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
          <span>
            {isBN ? "মোট প্রদর্শিত ট্রানজ্যাকশন:" : "Showing transactions:"}{" "}
            <strong className="text-slate-800 font-mono font-bold">{filteredTransactions.length}</strong>
          </span>

          <span className="text-[11px] text-slate-400">
            {isBN ? "অটো ক্যালকুলেশন রেডি • প্রতি মিনিটে সিঙ্ক" : "Auto Calculation Active • Synced"}
          </span>
        </div>

        {/* Clean & Clear Transaction Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-700 font-bold uppercase tracking-wider border-b border-slate-200 text-[10px]">
              <tr>
                <th className="py-3 px-3.5">{isBN ? "ভাউচার ও তারিখ" : "Voucher & Time"}</th>
                <th className="py-3 px-3.5">{isBN ? "অর্ডার / সোর্স" : "Order / Source"}</th>
                <th className="py-3 px-3.5">{isBN ? "কাস্টমার বা প্রাপক" : "Customer / Beneficiary"}</th>
                <th className="py-3 px-3.5">{isBN ? "পেমেন্ট মাধ্যম" : "Channel"}</th>
                <th className="py-3 px-3.5 text-right">{isBN ? "টাকার পরিমাণ" : "Amount"}</th>
                <th className="py-3 px-3.5">{isBN ? "কুরিয়ার ও ট্র্যাকিং" : "Courier / Tracking"}</th>
                <th className="py-3 px-3.5">{isBN ? "রিকনসিলিয়েশন" : "Status"}</th>
                <th className="py-3 px-3.5 text-center">{isBN ? "অ্যাকশন" : "Action"}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400 italic">
                    {isBN
                      ? "কোনো ক্যাশ রেকর্ড পাওয়া যায়নি।"
                      : "No cash calculation records match your search criteria."}
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((tx) => {
                  const isInflow = tx.type === "inflow";

                  let statusBadgeClass = "bg-emerald-50 text-emerald-700 border-emerald-200";
                  if (tx.reconciliationStatus === "Pending Courier") {
                    statusBadgeClass = "bg-amber-50 text-amber-700 border-amber-200";
                  } else if (tx.reconciliationStatus === "Deposited to Bank") {
                    statusBadgeClass = "bg-blue-50 text-blue-700 border-blue-200";
                  } else if (tx.reconciliationStatus === "Disputed") {
                    statusBadgeClass = "bg-rose-50 text-rose-700 border-rose-200";
                  }

                  let channelBadge = "bg-slate-100 text-slate-700";
                  if (tx.channel === "Cash On Delivery") channelBadge = "bg-emerald-50 text-emerald-800 border-emerald-200";
                  if (tx.channel === "bKash") channelBadge = "bg-pink-50 text-pink-700 border-pink-200";
                  if (tx.channel === "Nagad") channelBadge = "bg-orange-50 text-orange-700 border-orange-200";
                  if (tx.channel === "Bank Transfer") channelBadge = "bg-indigo-50 text-indigo-700 border-indigo-200";

                  return (
                    <tr key={tx.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Voucher & Time */}
                      <td className="py-3 px-3.5 whitespace-nowrap">
                        <div className="font-extrabold text-slate-900 font-mono text-[11px]">{tx.voucherNo}</div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {tx.date} • {tx.time}
                        </div>
                      </td>

                      {/* Order / Source */}
                      <td className="py-3 px-3.5">
                        {tx.orderNumber ? (
                          <span className="font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100 font-mono text-[11px]">
                            {tx.orderNumber}
                          </span>
                        ) : (
                          <span className="font-semibold text-slate-600 text-[11px]">{tx.category}</span>
                        )}
                        <div className="text-[10px] text-slate-400 mt-0.5">{tx.category}</div>
                      </td>

                      {/* Customer / Beneficiary */}
                      <td className="py-3 px-3.5 max-w-[180px]">
                        <div className="font-semibold text-slate-900 text-xs truncate" title={tx.customerOrBeneficiary}>
                          {tx.customerOrBeneficiary}
                        </div>
                        {tx.notes && (
                          <div className="text-[10px] text-slate-400 truncate mt-0.5" title={tx.notes}>
                            {tx.notes}
                          </div>
                        )}
                      </td>

                      {/* Channel */}
                      <td className="py-3 px-3.5 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${channelBadge}`}>
                          {tx.channel}
                        </span>
                      </td>

                      {/* Amount with +/- indicator */}
                      <td className="py-3 px-3.5 text-right whitespace-nowrap">
                        <div
                          className={`font-mono font-extrabold text-sm flex items-center justify-end gap-1 ${
                            isInflow ? "text-emerald-600" : "text-rose-600"
                          }`}
                        >
                          <span>{isInflow ? "+" : "-"}</span>
                          <span>
                            {settings.currencySymbol}
                            {tx.amount.toLocaleString()}
                          </span>
                        </div>
                        <span className="text-[9.5px] text-slate-400 font-mono">
                          {isInflow ? (isBN ? "জমা" : "Inflow") : (isBN ? "খরচ" : "Disbursement")}
                        </span>
                      </td>

                      {/* Courier & Tracking */}
                      <td className="py-3 px-3.5 whitespace-nowrap">
                        {tx.courierTrackingNo ? (
                          <div className="space-y-0.5">
                            <span className="font-mono text-[10.5px] font-bold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                              {tx.courierTrackingNo}
                            </span>
                            <div className="text-[10px] text-slate-400">{tx.courierName}</div>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-[10px] italic">{isBN ? "প্রযোজ্য নয়" : "Direct / Cashier"}</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-3.5 whitespace-nowrap">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold border inline-flex items-center gap-1 ${statusBadgeClass}`}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-current" />
                          <span>
                            {isBN
                              ? tx.reconciliationStatus === "Reconciled"
                                ? "জমা হয়েছে"
                                : tx.reconciliationStatus === "Pending Courier"
                                ? "কুরিয়ারে পেন্ডিং"
                                : tx.reconciliationStatus === "Deposited to Bank"
                                ? "ব্যাংকে জমা"
                                : "ডিসপ্যুট"
                              : tx.reconciliationStatus}
                          </span>
                        </span>
                      </td>

                      {/* Action */}
                      <td className="py-3 px-3.5 text-center whitespace-nowrap">
                        <button
                          onClick={() => handleToggleStatus(tx.id)}
                          className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-600 font-bold text-[10.5px] transition"
                          title="Toggle Status (Reconciled / Bank Settled / Disputed)"
                        >
                          {isBN ? "স্ট্যাটাস" : "Toggle"}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manual Cash In / Out Entry Modal */}
      {isAddEntryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                  <Receipt className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">
                    {isBN ? "নতুন ক্যাশ ট্রানজ্যাকশন এন্ট্রি" : "Record New Cash Transaction"}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {isBN ? "লেজারে তাত্ক্ষণিক ক্যাশ আগমন বা ব্যয় লিপিবদ্ধ করুন" : "Add financial journal entry to daily ledger"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAddEntryModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEntry} className="space-y-4 text-xs">
              {/* Type selector */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  {isBN ? "ট্রানজ্যাকশন ধরন" : "Transaction Flow Type"}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setNewEntry((prev) => ({
                        ...prev,
                        type: "inflow",
                        category: "COD Collection",
                      }));
                    }}
                    className={`py-2 rounded-xl font-bold border transition flex items-center justify-center gap-1.5 ${
                      newEntry.type === "inflow"
                        ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                        : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    <ArrowDownLeft className="w-4 h-4" />
                    <span>{isBN ? "ক্যাশ জমা / আগমন (+)" : "Cash Inflow (+)"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setNewEntry((prev) => ({
                        ...prev,
                        type: "outflow",
                        category: "Office Petty Cash",
                      }));
                    }}
                    className={`py-2 rounded-xl font-bold border transition flex items-center justify-center gap-1.5 ${
                      newEntry.type === "outflow"
                        ? "bg-rose-600 text-white border-rose-600 shadow-xs"
                        : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    <ArrowUpRight className="w-4 h-4" />
                    <span>{isBN ? "ক্যাশ খরচ / প্রদান (-)" : "Cash Outflow (-)"}</span>
                  </button>
                </div>
              </div>

              {/* Amount */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  {isBN ? "টাকার পরিমাণ (৳)" : "Amount (BDT ৳)"} *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 font-bold text-slate-400 font-mono">
                    {settings.currencySymbol}
                  </span>
                  <input
                    type="number"
                    min="1"
                    step="any"
                    required
                    value={newEntry.amount}
                    onChange={(e) => setNewEntry({ ...newEntry, amount: e.target.value })}
                    placeholder="e.g. 2500"
                    className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-sm font-bold text-slate-900 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Category & Channel */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    {isBN ? "ক্যাটাগরি" : "Category"}
                  </label>
                  <select
                    value={newEntry.category}
                    onChange={(e) => setNewEntry({ ...newEntry, category: e.target.value as any })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800 focus:outline-none"
                  >
                    {newEntry.type === "inflow" ? (
                      <>
                        <option value="COD Collection">COD Collection</option>
                        <option value="Courier Remittance">Courier Remittance</option>
                        <option value="bKash Inflow">bKash Settlement</option>
                        <option value="Nagad Inflow">Nagad Settlement</option>
                        <option value="Bank Deposit">Owner Cash Inflow</option>
                      </>
                    ) : (
                      <>
                        <option value="Office Petty Cash">Office Petty Cash</option>
                        <option value="Packaging Materials">Packaging Materials</option>
                        <option value="Courier Delivery Charge">Courier Delivery Charge</option>
                        <option value="Customer Refund">Customer Refund</option>
                        <option value="Supplier Payment">Supplier Payment</option>
                        <option value="Bank Deposit">Bank Deposit</option>
                      </>
                    )}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    {isBN ? "পেমেন্ট চ্যানেল" : "Payment Channel"}
                  </label>
                  <select
                    value={newEntry.channel}
                    onChange={(e) => setNewEntry({ ...newEntry, channel: e.target.value as any })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800 focus:outline-none"
                  >
                    <option value="Cash Drawer">Physical Cash Drawer</option>
                    <option value="Cash On Delivery">Cash On Delivery (COD)</option>
                    <option value="bKash">bKash</option>
                    <option value="Nagad">Nagad</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                  </select>
                </div>
              </div>

              {/* Beneficiary / Source */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  {isBN ? "গ্রহীতা / উৎস / কাস্টমার নাম" : "Customer / Beneficiary / Vendor"} *
                </label>
                <input
                  type="text"
                  required
                  value={newEntry.customerOrBeneficiary}
                  onChange={(e) => setNewEntry({ ...newEntry, customerOrBeneficiary: e.target.value })}
                  placeholder={
                    isBN
                      ? "যেমন: Steadfast Courier, দারোয়ান মামা, বা কাস্টমার নাম"
                      : "e.g., Steadfast Courier, Packaging Vendor, or Customer Name"
                  }
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:outline-none"
                />
              </div>

              {/* Optional Order # & Courier Tracking */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    {isBN ? "অর্ডার আইডি (ঐচ্ছিক)" : "Order # (Optional)"}
                  </label>
                  <input
                    type="text"
                    value={newEntry.orderNumber}
                    onChange={(e) => setNewEntry({ ...newEntry, orderNumber: e.target.value })}
                    placeholder="e.g. ORD-9012"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    {isBN ? "কুরিয়ার ট্র্যাকিং (ঐচ্ছিক)" : "Courier Tracking # (Optional)"}
                  </label>
                  <input
                    type="text"
                    value={newEntry.courierTrackingNo}
                    onChange={(e) => setNewEntry({ ...newEntry, courierTrackingNo: e.target.value })}
                    placeholder="e.g. ST-882194"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-900 focus:outline-none"
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">{isBN ? "মন্তব্য" : "Notes / Remarks"}</label>
                <textarea
                  rows={2}
                  value={newEntry.notes}
                  onChange={(e) => setNewEntry({ ...newEntry, notes: e.target.value })}
                  placeholder={
                    isBN
                      ? "ট্রানজ্যাকশনের বিস্তারিত কারণ বা ক্যাশিয়ার নোট..."
                      : "Reason for expense, voucher serial, or cashier memo..."
                  }
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none resize-none"
                />
              </div>

              {/* Action buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddEntryModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition"
                >
                  {isBN ? "বাতিল" : "Cancel"}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-md transition"
                >
                  {isBN ? "সংরক্ষণ করুন" : "Save Record"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
