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
  Boxes,
  ShoppingBag,
  BarChart3,
  Trash2,
  Archive,
  CheckCheck,
  Sparkles,
  Undo2,
  ArrowRight,
} from "lucide-react";
import { exportToCSV } from "../../utils/exportUtils";
import { RefillStockCenterModal } from "./RefillStockCenterModal";

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
    | "Bank Deposit"
    | "POS Retail Sale"
    | "Refund"
    | "Day-End Cash Settle";
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
  const {
    orders,
    products,
    updateProduct,
    executeInventoryTransaction,
    settings,
    language,
    activeRole,
    currentUser,
    addToast,
    setAdminView,
    addAuditLog,
  } = useStore();
  const isBN = language === "BN";
  const isSuperAdmin = activeRole === "Super Admin";
  const [isRefillModalOpen, setIsRefillModalOpen] = useState(false);

  // Set of cleared entry IDs (persisted in localStorage)
  const [clearedEntryIds, setClearedEntryIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("smartshop_cleared_cash_entries");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Dynamic Day Opening Cash Float
  const [openingBalance, setOpeningBalance] = useState<number>(() => {
    try {
      const saved = localStorage.getItem("smartshop_cash_opening_balance");
      return saved ? Number(saved) : 15000;
    } catch {
      return 15000;
    }
  });

  // State for Clear & Settle Modal
  const [isClearModalOpen, setIsClearModalOpen] = useState(false);
  const [clearMode, setClearMode] = useState<"reconciled" | "day-end-bank" | "reset-all">("reconciled");
  const [newOpeningFloatInput, setNewOpeningFloatInput] = useState<number>(15000);

  // Quick Retail POS Cash Sale State
  const [isPosSaleModalOpen, setIsPosSaleModalOpen] = useState(false);
  const [posSale, setPosSale] = useState({
    itemDesc: "",
    customer: "",
    phone: "",
    amount: "",
    channel: "Cash Drawer",
    notes: "",
  });

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

  // Derive cash entries from the StoreContext orders list (Auto-posts every sale and reversal)
  const orderDerivedEntries: CashEntry[] = useMemo(() => {
    const list: CashEntry[] = [];

    orders.forEach((o) => {
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
        status = isCancelled ? "Disputed" : "Reconciled";
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

      // Inflow order sale entry
      list.push({
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
        notes: `Order items: ${o.items.length} sku(s). Payment: ${o.paymentMethod}. Status: ${o.orderStatus}.`,
      });

      // Automatic reversal outflow if order is cancelled
      if (isCancelled) {
        list.push({
          id: `order-cancel-reversal-${o.id}`,
          voucherNo: `REV-${o.orderNumber.replace(/[^0-9]/g, "").slice(-4) || "001"}`,
          orderNumber: o.orderNumber,
          date: o.updatedAt ? o.updatedAt.split(" ")[0] : new Date().toISOString().split("T")[0],
          time: o.updatedAt ? o.updatedAt.split(" ")[1] : "12:00 PM",
          type: "outflow",
          category: "Refund",
          channel: o.paymentMethod as any,
          amount: o.total,
          customerOrBeneficiary: `Cancellation Reversal (${o.customerName})`,
          reconciliationStatus: "Reconciled",
          recordedBy: "Automated Ledger Reversal",
          notes: `Automatic refund/reversal entry for cancelled order #${o.orderNumber}.`,
        });
      }
    });

    return list;
  }, [orders]);

  // All combined transactions excluding cleared ones
  const allTransactions: CashEntry[] = useMemo(() => {
    const list = [...manualEntries, ...orderDerivedEntries].filter(
      (tx) => !clearedEntryIds.includes(tx.id)
    );
    // Sort newest first
    return list.sort((a, b) => b.id.localeCompare(a.id));
  }, [manualEntries, orderDerivedEntries, clearedEntryIds]);

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
  }, [allTransactions, openingBalance]);

  // Denominations Total Calculation
  const denominationTotal = useMemo(() => {
    return Object.entries(denominations).reduce((sum, [note, count]) => {
      return sum + Number(note) * Number(count);
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

  // Clear single entry
  const handleClearSingle = (id: string) => {
    setClearedEntryIds((prev) => {
      const next = [...prev, id];
      try {
        localStorage.setItem("smartshop_cleared_cash_entries", JSON.stringify(next));
      } catch (err) {
        console.error(err);
      }
      return next;
    });
    addToast(isBN ? "ভাউচারটি লেজার থেকে ক্লিয়ার / আর্কাইভে নেওয়া হয়েছে" : "Voucher cleared from active calculation", "info");
  };

  // Restore all cleared entries
  const handleRestoreAllCleared = () => {
    setClearedEntryIds([]);
    try {
      localStorage.removeItem("smartshop_cleared_cash_entries");
    } catch (err) {
      console.error(err);
    }
    addToast(isBN ? "সকল ক্লিয়ার করা ভাউচার সফলভাবে রিস্টোর হয়েছে!" : "All cleared entries restored to active calculation!", "success");
  };

  // Execute batch clear / settlement
  const handleExecuteClear = (mode: "reconciled" | "day-end-bank" | "reset-all") => {
    if (mode === "reconciled") {
      const reconciledIds = allTransactions
        .filter((t) => t.reconciliationStatus === "Reconciled" || t.reconciliationStatus === "Deposited to Bank")
        .map((t) => t.id);
      setClearedEntryIds((prev) => {
        const combined = Array.from(new Set([...prev, ...reconciledIds]));
        try {
          localStorage.setItem("smartshop_cleared_cash_entries", JSON.stringify(combined));
        } catch (err) {
          console.error(err);
        }
        return combined;
      });
      addToast(
        isBN
          ? `${reconciledIds.length}টি সেটেল্ড ও রিকনসাইল্ড হিসাব সফলভাবে ক্লিয়ার হয়েছে!`
          : `Cleared ${reconciledIds.length} reconciled & settled entries!`,
        "success"
      );
    } else if (mode === "day-end-bank") {
      const netDeposit = Math.max(0, metrics.netCashPosition - newOpeningFloatInput);
      if (netDeposit > 0) {
        const depositEntry: CashEntry = {
          id: `manual-cash-dayend-${Date.now()}`,
          voucherNo: `VCH-${new Date().getFullYear()}-SETTLE-${Math.floor(100 + Math.random() * 900)}`,
          date: new Date().toISOString().split("T")[0],
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          type: "outflow",
          category: "Day-End Cash Settle",
          channel: "Bank Transfer",
          amount: netDeposit,
          customerOrBeneficiary: "Day-End Cash Drawer Settle & Bank Vault Transfer",
          reconciliationStatus: "Deposited to Bank",
          recordedBy: currentUser.name || "Shift Supervisor",
          notes: `Day-end excess cash transferred to bank. Retained float: ${settings.currencySymbol}${newOpeningFloatInput}.`,
        };
        setManualEntries((prev) => [depositEntry, ...prev]);
      }
      setOpeningBalance(newOpeningFloatInput);
      try {
        localStorage.setItem("smartshop_cash_opening_balance", String(newOpeningFloatInput));
      } catch (err) {
        console.error(err);
      }

      const allIds = allTransactions.map((t) => t.id);
      setClearedEntryIds((prev) => {
        const combined = Array.from(new Set([...prev, ...allIds]));
        try {
          localStorage.setItem("smartshop_cleared_cash_entries", JSON.stringify(combined));
        } catch (err) {
          console.error(err);
        }
        return combined;
      });
      addToast(
        isBN
          ? `ডে-এন্ড সেটেলমেন্ট সম্পন্ন! নতুন ওপেনিং ক্যাশ: ${settings.currencySymbol}${newOpeningFloatInput}`
          : `Day-end settlement completed! New opening float: ${settings.currencySymbol}${newOpeningFloatInput}`,
        "success"
      );
    } else if (mode === "reset-all") {
      const allIds = allTransactions.map((t) => t.id);
      setClearedEntryIds((prev) => {
        const combined = Array.from(new Set([...prev, ...allIds]));
        try {
          localStorage.setItem("smartshop_cleared_cash_entries", JSON.stringify(combined));
        } catch (err) {
          console.error(err);
        }
        return combined;
      });
      setOpeningBalance(newOpeningFloatInput);
      try {
        localStorage.setItem("smartshop_cash_opening_balance", String(newOpeningFloatInput));
      } catch (err) {
        console.error(err);
      }
      addToast(isBN ? "সম্পূর্ণ ক্যাশ লেজার রিসেট ও ক্লিয়ার করা হয়েছে!" : "Entire cash calculation log reset & cleared!", "success");
    }

    setIsClearModalOpen(false);
  };

  // Quick Retail POS Sale Save
  const handleSavePosSale = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(posSale.amount);
    if (!amt || amt <= 0) {
      addToast(isBN ? "সঠিক টাকার পরিমাণ দিন!" : "Please provide a valid sale amount!", "error");
      return;
    }

    const matchedProd = products.find((p) => p.name.toLowerCase() === posSale.itemDesc.toLowerCase() || p.sku.toLowerCase() === posSale.itemDesc.toLowerCase());
    if (matchedProd) {
      const updatedStock = Math.max(0, matchedProd.totalStock - 1);
      updateProduct(matchedProd.id, {
        totalStock: updatedStock,
        isLowStock: updatedStock <= (matchedProd.lowStockThreshold || 10),
      });
      executeInventoryTransaction({
        productId: matchedProd.id,
        sku: matchedProd.sku,
        productName: matchedProd.name,
        type: "Stock Out",
        quantity: 1,
        warehouseId: matchedProd.warehouseLocation || "WH-MAIN-DHAKA",
        notes: `POS Direct Counter Cash Sale (${posSale.customer || "Walk-in"})`,
        referenceNo: `POS-${Date.now()}`,
      });
    }

    const vchNum = `VCH-${new Date().getFullYear()}-POS-${Math.floor(100 + Math.random() * 900)}`;
    const entry: CashEntry = {
      id: `manual-pos-${Date.now()}`,
      voucherNo: vchNum,
      date: new Date().toISOString().split("T")[0],
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      type: "inflow",
      category: "POS Retail Sale",
      channel: posSale.channel as any,
      amount: amt,
      customerOrBeneficiary: `${posSale.customer || (isBN ? "কাউন্টার ক্রেতা" : "Walk-in Customer")} ${posSale.phone ? `(${posSale.phone})` : ""}`,
      reconciliationStatus: "Reconciled",
      recordedBy: currentUser.name || "Cashier POS",
      notes: `Counter Cash Sale: ${posSale.itemDesc || "Retail Goods"}. ${posSale.notes || ""}`,
    };

    setManualEntries((prev) => [entry, ...prev]);
    setIsPosSaleModalOpen(false);
    setPosSale({
      itemDesc: "",
      customer: "",
      phone: "",
      amount: "",
      channel: "Cash Drawer",
      notes: "",
    });

    addToast(
      isBN
        ? `কাউন্টার ক্যাশ সেল (${settings.currencySymbol}${amt.toLocaleString()}) লেজারে যুক্ত হয়েছে!`
        : `POS Retail Cash Sale (${settings.currencySymbol}${amt.toLocaleString()}) recorded to ledger!`,
      "success"
    );
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
                ? "ক্যাশ অন ডেলিভারি (সিওডি), বিকাশ/নগদ গেটওয়ে সেটেলমেন্ট, কুরিয়ার রিকনসিলিয়েশন, ক্যাশ ড্রয়ার নোট ব্যালান্সিং ও লেজার সেটেলমেন্ট।"
                : "Real-time COD cash-in-hand, bKash & Nagad gateway settlement, courier remittance tracking, drawer tally & ledger clearing."}
            </p>
          </div>

          {/* Action Button Suite */}
          <div className="flex items-center gap-2 flex-wrap shrink-0">
            {/* Quick Retail POS Cash Sale Button */}
            <button
              onClick={() => setIsPosSaleModalOpen(true)}
              className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-3.5 py-2 rounded-xl shadow-md transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer"
              title="Record instant direct retail cash sale"
            >
              <ShoppingBag className="w-4 h-4 text-amber-300" />
              <span>{isBN ? "+ কাউন্টার সেল (POS)" : "+ Quick POS Sale"}</span>
            </button>

            {/* Manual Cash In / Out Entry Button */}
            <button
              onClick={() => setIsAddEntryModalOpen(true)}
              className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3.5 py-2 rounded-xl shadow-md transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{isBN ? "+ ক্যাশ এন্ট্রি" : "+ Cash Entry"}</span>
            </button>

            {/* Denomination Calculator Toggle */}
            <button
              onClick={() => setIsCalculatorOpen(!isCalculatorOpen)}
              className={`text-xs font-bold px-3 py-2 rounded-xl transition-all flex items-center gap-1.5 shadow-md border ${
                isCalculatorOpen
                  ? "bg-indigo-600 text-white border-indigo-500 shadow-indigo-600/30"
                  : "bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700"
              }`}
            >
              <Calculator className="w-4 h-4 text-amber-400" />
              <span className="hidden sm:inline">{isBN ? "নোট গণনা" : "Tally Notes"}</span>
            </button>

            {/* Clear & Settle Log Button */}
            <button
              onClick={() => setIsClearModalOpen(true)}
              className="bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold px-3.5 py-2 rounded-xl shadow-md transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer border border-rose-500/50"
              title="Clear reconciled calculation or perform Day-End cash settlement"
            >
              <Trash2 className="w-4 h-4 text-rose-200" />
              <span>{isBN ? "হিসাব ক্লিয়ার / সেটেল" : "Clear / Settle Log"}</span>
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

      {/* Interconnected Console Quick Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 text-white shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-extrabold text-white">
            {isBN ? "কানেক্টেড কনসোল হাব:" : "Connected Operations Hub:"}
          </span>
          <span className="text-[11px] text-slate-400 hidden md:inline">
            {isBN ? "ক্যাশ হিসাব থেকে ১-ক্লিকে সংশ্লিষ্ট মডিউলে প্রবেশ করুন" : "1-click switch between related business consoles"}
          </span>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Jump to Orders */}
          <button
            onClick={() => setAdminView("orders")}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-indigo-900/60 text-indigo-300 border border-indigo-500/30 font-bold transition flex items-center gap-1.5 cursor-pointer active:scale-95"
            title="Go to Orders Processing"
          >
            <ShoppingBag className="w-3.5 h-3.5 text-indigo-400" />
            <span>{isBN ? "অর্ডার ম্যানেজমেন্ট" : "Orders Hub"}</span>
          </button>

          {/* Jump to Refill Hub */}
          <button
            onClick={() => setIsRefillModalOpen(true)}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-amber-900/60 text-amber-300 border border-amber-500/30 font-bold transition flex items-center gap-1.5 cursor-pointer active:scale-95"
            title="Open Stock Refill & Replenishment Center"
          >
            <Boxes className="w-3.5 h-3.5 text-amber-400" />
            <span>{isBN ? "📦 রিফিল সেন্টার (A-Z)" : "📦 Refill Hub (A-Z)"}</span>
          </button>

          {/* Jump to Inventory */}
          <button
            onClick={() => setAdminView("inventory")}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-500/30 font-bold transition flex items-center gap-1.5 cursor-pointer active:scale-95"
            title="Master Stock & Inventory"
          >
            <Boxes className="w-3.5 h-3.5 text-emerald-400" />
            <span>{isBN ? "ইনভেন্টরি কন্ট্রোল" : "Inventory"}</span>
          </button>

          {/* Jump to Excel Hub */}
          <button
            onClick={() => setAdminView("excel-hub")}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-teal-900/60 text-teal-300 border border-teal-500/30 font-bold transition flex items-center gap-1.5 cursor-pointer active:scale-95"
            title="Excel Hub"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-teal-400" />
            <span>{isBN ? "এক্সেল হাব" : "Excel Hub"}</span>
          </button>

          {/* Jump to Reports */}
          <button
            onClick={() => setAdminView("reports")}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-purple-900/60 text-purple-300 border border-purple-500/30 font-bold transition flex items-center gap-1.5 cursor-pointer active:scale-95"
            title="Financial Reports"
          >
            <BarChart3 className="w-3.5 h-3.5 text-purple-400" />
            <span>{isBN ? "আর্থিক রিপোর্ট" : "Reports"}</span>
          </button>
        </div>
      </div>

      {/* Cleared Entries Notification & Restore Ribbon */}
      {clearedEntryIds.length > 0 && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-3 px-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-amber-300 animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <Archive className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              {isBN
                ? `${clearedEntryIds.length}টি এন্ট্রি ক্লিয়ার/আর্কাইভে সংরক্ষিত রয়েছে (সক্রিয় হিসাব থেকে বাদ দেওয়া হয়েছে)`
                : `${clearedEntryIds.length} entries are cleared & archived from active ledger view`}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleRestoreAllCleared}
              className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs transition flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
              title="Restore all cleared entries to active ledger"
            >
              <Undo2 className="w-3.5 h-3.5" />
              <span>{isBN ? "পূর্বাবস্থায় ফেরান (Restore All)" : "Restore All"}</span>
            </button>
          </div>
        </div>
      )}

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
                          <button
                            onClick={() => setAdminView("orders")}
                            className="font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-2 py-0.5 rounded-md border border-indigo-200 font-mono text-[11px] inline-flex items-center gap-1 cursor-pointer transition-colors"
                            title={isBN ? "অর্ডার ডিটেইলস দেখুন" : "View Order Details"}
                          >
                            <span>{tx.orderNumber}</span>
                            <ArrowUpRight className="w-3 h-3 text-indigo-500" />
                          </button>
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
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => handleToggleStatus(tx.id)}
                            className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-600 font-bold text-[10.5px] transition cursor-pointer"
                            title="Toggle Status (Reconciled / Bank Settled / Disputed)"
                          >
                            {isBN ? "স্ট্যাটাস" : "Toggle"}
                          </button>

                          <button
                            onClick={() => handleClearSingle(tx.id)}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition cursor-pointer"
                            title={isBN ? "হিসাব থেকে এই ভাউচার ক্লিয়ার করুন" : "Clear this voucher from calculation"}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
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

      {/* Quick Retail POS Cash Sale Modal */}
      {isPosSaleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">
                    {isBN ? "কাউন্টার সেল ও ক্যাশ রসিদ (POS)" : "Quick POS Retail Sale"}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {isBN ? "তাৎক্ষণিক ক্যাশ সেল রেকর্ড করুন এবং ড্রয়ারে টাকা যুক্ত করুন" : "Record walk-in retail sales directly into cash drawer"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsPosSaleModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePosSale} className="space-y-4 text-xs">
              {/* Product item selection or manual description */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  {isBN ? "বিক্রিত পণ্য বা আইটেমের বিবরণ" : "Product / Item Description"} *
                </label>
                <input
                  type="text"
                  required
                  list="posProductSuggestions"
                  value={posSale.itemDesc}
                  onChange={(e) => {
                    const val = e.target.value;
                    const matched = products.find((p) => p.name === val || p.sku === val);
                    setPosSale((prev) => ({
                      ...prev,
                      itemDesc: val,
                      amount: matched ? String(matched.sellingPrice) : prev.amount,
                    }));
                  }}
                  placeholder={isBN ? "পণ্য সার্চ করুন বা নাম লিখুন..." : "Select or type product name / SKU..."}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:outline-none focus:border-indigo-500"
                />
                <datalist id="posProductSuggestions">
                  {products.map((p) => (
                    <option key={p.id} value={p.name}>
                      {p.sku} - Stock: {p.totalStock} - {settings.currencySymbol}{p.sellingPrice}
                    </option>
                  ))}
                </datalist>
              </div>

              {/* Amount and Payment Channel */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    {isBN ? "বিক্রয়মূল্য (৳)" : "Sale Amount (BDT)"} *
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
                      value={posSale.amount}
                      onChange={(e) => setPosSale({ ...posSale, amount: e.target.value })}
                      placeholder="e.g. 1500"
                      className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-sm font-bold text-slate-900 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    {isBN ? "পেমেন্ট গ্রহণ মাধ্যম" : "Payment Channel"}
                  </label>
                  <select
                    value={posSale.channel}
                    onChange={(e) => setPosSale({ ...posSale, channel: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800 focus:outline-none"
                  >
                    <option value="Cash Drawer">Physical Cash Drawer</option>
                    <option value="bKash">bKash Personal / Merchant</option>
                    <option value="Nagad">Nagad Personal / Merchant</option>
                    <option value="Bank Transfer">Bank Card / Transfer</option>
                  </select>
                </div>
              </div>

              {/* Customer Info */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    {isBN ? "কাস্টমার নাম (ঐচ্ছিক)" : "Customer Name"}
                  </label>
                  <input
                    type="text"
                    value={posSale.customer}
                    onChange={(e) => setPosSale({ ...posSale, customer: e.target.value })}
                    placeholder={isBN ? "কাউন্টার ক্রেতা" : "Walk-in Buyer"}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    {isBN ? "মোবাইল নম্বর (ঐচ্ছিক)" : "Phone # (Optional)"}
                  </label>
                  <input
                    type="text"
                    value={posSale.phone}
                    onChange={(e) => setPosSale({ ...posSale, phone: e.target.value })}
                    placeholder="017XXXXXXXX"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-900 focus:outline-none"
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">{isBN ? "মন্তব্য" : "Remarks"}</label>
                <input
                  type="text"
                  value={posSale.notes}
                  onChange={(e) => setPosSale({ ...posSale, notes: e.target.value })}
                  placeholder={isBN ? "কাউন্টার ক্যাশ সেল মেমো..." : "Direct store counter checkout..."}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none"
                />
              </div>

              {/* Action buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsPosSaleModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition cursor-pointer"
                >
                  {isBN ? "বাতিল" : "Cancel"}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-md transition cursor-pointer flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isBN ? "সেল সম্পন্ন ও ক্যাশে জমা" : "Record Sale & Post Inflow"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Clear & Settle Ledger Calculation Modal */}
      {isClearModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center font-bold">
                  <Trash2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">
                    {isBN ? "হিসাব ক্লিয়ার ও ক্যাশ সেটেলমেন্ট" : "Clear & Settle Ledger Calculation"}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {isBN ? "রিকনসাইল্ড হিসাব ক্লিয়ার করুন বা ডে-এন্ড ব্যাংক ডিপোজিট ট্রান্সফার করুন" : "Clear settled entries or execute day-end bank vault transfer"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsClearModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mode selection cards */}
            <div className="space-y-2.5">
              <label className="font-bold text-slate-700 block text-xs">
                {isBN ? "ক্লিয়ার করার পদ্ধতি নির্বাচন করুন:" : "Select Clearing Operation Mode:"}
              </label>

              {/* Mode 1 */}
              <div
                onClick={() => setClearMode("reconciled")}
                className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                  clearMode === "reconciled"
                    ? "bg-indigo-50/80 border-indigo-500 shadow-xs"
                    : "bg-slate-50 border-slate-200 hover:bg-slate-100"
                }`}
              >
                <div className="flex items-center justify-between font-bold text-xs text-slate-900">
                  <span className="flex items-center gap-2">
                    <CheckCheck className="w-4 h-4 text-indigo-600" />
                    <span>{isBN ? "১. রিকনসাইল্ড ও পেইড এন্ট্রি ক্লিয়ার (Reconciled Only)" : "1. Clear Reconciled / Delivered Entries"}</span>
                  </span>
                  <input
                    type="radio"
                    checked={clearMode === "reconciled"}
                    onChange={() => setClearMode("reconciled")}
                    className="text-indigo-600"
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1 pl-6">
                  {isBN
                    ? "ইতিমধ্যে ডেলিভার্ড, সংগৃহীত সিওডি এবং ব্যাংক জমা হওয়া ভাউচারগুলো ক্লিয়ার করে শুধুমাত্র চলমান/পেন্ডিং হিসাব রাখবে।"
                    : "Archives delivered & collected COD entries. Leaves only active and pending courier shipments in view."}
                </p>
              </div>

              {/* Mode 2 */}
              <div
                onClick={() => setClearMode("day-end-bank")}
                className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                  clearMode === "day-end-bank"
                    ? "bg-indigo-50/80 border-indigo-500 shadow-xs"
                    : "bg-slate-50 border-slate-200 hover:bg-slate-100"
                }`}
              >
                <div className="flex items-center justify-between font-bold text-xs text-slate-900">
                  <span className="flex items-center gap-2">
                    <Building className="w-4 h-4 text-emerald-600" />
                    <span>{isBN ? "২. ডে-এন্ড ব্যাংক ডিপোজিট ও শিফট ক্লোজ (Day-End Settle)" : "2. Day-End Cash Settle & Bank Transfer"}</span>
                  </span>
                  <input
                    type="radio"
                    checked={clearMode === "day-end-bank"}
                    onChange={() => setClearMode("day-end-bank")}
                    className="text-indigo-600"
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1 pl-6">
                  {isBN
                    ? "অতিরিক্ত ক্যাশ ব্যাংকে জমা হিসেবে এন্ট্রি করবে, ওপেনিং ক্যাশ ফ্লট রিসেট করবে এবং আজকের লেজার ক্লিয়ার করবে।"
                    : "Transfers excess drawer cash to bank, sets next day opening float, and clears today's settled journal."}
                </p>
              </div>

              {/* Mode 3 */}
              <div
                onClick={() => setClearMode("reset-all")}
                className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                  clearMode === "reset-all"
                    ? "bg-rose-50/80 border-rose-500 shadow-xs"
                    : "bg-slate-50 border-slate-200 hover:bg-slate-100"
                }`}
              >
                <div className="flex items-center justify-between font-bold text-xs text-rose-900">
                  <span className="flex items-center gap-2">
                    <RotateCcw className="w-4 h-4 text-rose-600" />
                    <span>{isBN ? "৩. সম্পূর্ণ ক্যাশ লেজার ক্লিয়ার ও ফ্রেশ রিসেট (Full Reset)" : "3. Reset & Clear All Calculation"}</span>
                  </span>
                  <input
                    type="radio"
                    checked={clearMode === "reset-all"}
                    onChange={() => setClearMode("reset-all")}
                    className="text-rose-600"
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1 pl-6">
                  {isBN
                    ? "সকল হিস্ট্রি ক্লিয়ার/আর্কাইভ করবে এবং নতুন ওপেনিং ক্যাশ দিয়ে ফ্রেশভাবে শুরু করবে।"
                    : "Clears all vouchers and starts fresh calculation with your specified opening float."}
                </p>
              </div>
            </div>

            {/* Float Input (Applicable for day-end or reset-all) */}
            {(clearMode === "day-end-bank" || clearMode === "reset-all") && (
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-2 text-xs">
                <label className="font-bold text-slate-800 block">
                  {isBN ? "ড্রয়ারে অবশিষ্ট রাখার ওপেনিং ক্যাশ (Opening Float):" : "Next Shift Opening Cash Float:"}
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 font-bold text-slate-400 font-mono">
                    {settings.currencySymbol}
                  </span>
                  <input
                    type="number"
                    min="0"
                    value={newOpeningFloatInput}
                    onChange={(e) => setNewOpeningFloatInput(Math.max(0, parseFloat(e.target.value) || 0))}
                    className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl font-mono text-sm font-bold text-slate-900 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                {clearMode === "day-end-bank" && (
                  <div className="flex items-center justify-between text-[11px] text-emerald-700 font-bold pt-1">
                    <span>{isBN ? "ব্যাংকে ট্রান্সফার হবে:" : "Excess Transferred to Bank:"}</span>
                    <span className="font-mono">
                      {settings.currencySymbol}
                      {Math.max(0, metrics.netCashPosition - newOpeningFloatInput).toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Warning Note */}
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 text-xs text-amber-800 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <p className="text-[11px] leading-relaxed">
                {isBN
                  ? "ক্লিয়ার করা হিসাব সুরক্ষিত থাকবে। আপনি যেকোনো সময় 'পূর্বাবস্থায় ফেরান (Restore All)' বাটনে ক্লিক করে সব রিস্টোর করতে পারবেন।"
                  : "Cleared records remain safely archived in local memory and can be restored anytime using 'Restore All'."}
              </p>
            </div>

            {/* Action buttons */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsClearModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition cursor-pointer"
              >
                {isBN ? "বাতিল" : "Cancel"}
              </button>
              <button
                type="button"
                onClick={() => handleExecuteClear(clearMode)}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md transition cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                <span>{isBN ? "নিশ্চিতভাবে ক্লিয়ার করুন" : "Confirm & Clear"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Stock Refill Center Modal */}
      <RefillStockCenterModal
        isOpen={isRefillModalOpen}
        onClose={() => setIsRefillModalOpen(false)}
      />
    </div>
  );
};
