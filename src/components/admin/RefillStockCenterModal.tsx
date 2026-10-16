import React, { useState, useMemo } from "react";
import { useStore } from "../../context/StoreContext";
import { Product } from "../../types";
import {
  Boxes,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Search,
  Filter,
  RefreshCw,
  Plus,
  ArrowRight,
  TrendingUp,
  DollarSign,
  Download,
  Printer,
  Package,
  Layers,
  Building2,
  Check,
  X,
  Truck,
  FileSpreadsheet,
  Zap,
  ShoppingBag,
  Wallet,
  ArrowUpDown,
  ExternalLink,
  RotateCcw,
} from "lucide-react";
import { exportToCSV } from "../../utils/exportUtils";

interface RefillStockCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialFilter?: "deficit" | "all" | "out-of-stock";
}

export const RefillStockCenterModal: React.FC<RefillStockCenterModalProps> = ({
  isOpen,
  onClose,
  initialFilter = "deficit",
}) => {
  const {
    products,
    updateProduct,
    executeInventoryTransaction,
    settings,
    language,
    addToast,
    addAuditLog,
    setAdminView,
  } = useStore();

  const isBN = language === "BN";
  const [filterMode, setFilterMode] = useState<"deficit" | "all" | "out-of-stock">(initialFilter);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLetter, setSelectedLetter] = useState<string>("ALL");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortOrder, setSortOrder] = useState<"a-z" | "z-a" | "deficit-desc" | "stock-asc" | "cost-desc">("a-z");
  const [unitsPerCase, setUnitsPerCase] = useState<number>(12); // Standard wholesale pack: 12 units = 1 case
  const [targetStockLevel, setTargetStockLevel] = useState<number>(50); // Default safe target stock
  const [customRefillInputs, setCustomRefillInputs] = useState<Record<string, number>>({});

  if (!isOpen) return null;

  // Categories list
  const categories = Array.from(new Set(products.map((p) => p.categoryName || "General"))).filter(Boolean);

  // Filtered and sorted products
  const processedProducts = useMemo(() => {
    return products
      .filter((p) => {
        const threshold = p.lowStockThreshold || 10;
        const isDeficit = p.totalStock <= threshold;
        const isOut = p.totalStock <= 0;

        if (filterMode === "deficit" && !isDeficit) return false;
        if (filterMode === "out-of-stock" && !isOut) return false;

        if (selectedCategory !== "all" && p.categoryName !== selectedCategory) {
          return false;
        }

        if (selectedLetter !== "ALL") {
          const firstChar = (p.name || "").trim().charAt(0).toUpperCase();
          if (firstChar !== selectedLetter) return false;
        }

        if (searchTerm.trim()) {
          const q = searchTerm.toLowerCase();
          const matchName = p.name.toLowerCase().includes(q);
          const matchSKU = p.sku.toLowerCase().includes(q);
          const matchCat = (p.categoryName || "").toLowerCase().includes(q);
          const matchVendor = (p.vendor || "").toLowerCase().includes(q);
          if (!matchName && !matchSKU && !matchCat && !matchVendor) return false;
        }

        return true;
      })
      .sort((a, b) => {
        const thresholdA = a.lowStockThreshold || 10;
        const deficitA = Math.max(0, targetStockLevel - a.totalStock);
        const thresholdB = b.lowStockThreshold || 10;
        const deficitB = Math.max(0, targetStockLevel - b.totalStock);

        if (sortOrder === "a-z") return a.name.localeCompare(b.name);
        if (sortOrder === "z-a") return b.name.localeCompare(a.name);
        if (sortOrder === "deficit-desc") return deficitB - deficitA;
        if (sortOrder === "stock-asc") return a.totalStock - b.totalStock;
        if (sortOrder === "cost-desc") {
          const costA = deficitA * (a.costPrice || a.purchasePrice || a.sellingPrice * 0.7);
          const costB = deficitB * (b.costPrice || b.purchasePrice || b.sellingPrice * 0.7);
          return costB - costA;
        }
        return 0;
      });
  }, [products, filterMode, selectedCategory, selectedLetter, searchTerm, sortOrder, targetStockLevel]);

  // High-precision Refill Calculations
  const calculations = useMemo(() => {
    let totalItemsNeedingRefill = 0;
    let criticalOutCount = 0;
    let totalUnitsDeficit = 0;
    let totalRefillWholesaleCost = 0;
    let totalRetailRevenue = 0;

    products.forEach((p) => {
      const threshold = p.lowStockThreshold || 10;
      if (p.totalStock <= 0) criticalOutCount++;
      if (p.totalStock <= threshold) {
        totalItemsNeedingRefill++;
        const deficit = Math.max(0, targetStockLevel - p.totalStock);
        totalUnitsDeficit += deficit;
        const unitCost = p.costPrice || p.purchasePrice || Math.round(p.sellingPrice * 0.7);
        totalRefillWholesaleCost += deficit * unitCost;
        totalRetailRevenue += deficit * p.sellingPrice;
      }
    });

    const totalCasesDeficit = Math.ceil(totalUnitsDeficit / unitsPerCase);
    const projectedProfit = totalRetailRevenue - totalRefillWholesaleCost;
    const profitMargin = totalRetailRevenue > 0 ? (projectedProfit / totalRetailRevenue) * 100 : 0;

    return {
      totalItemsNeedingRefill,
      criticalOutCount,
      totalUnitsDeficit,
      totalCasesDeficit,
      totalRefillWholesaleCost,
      totalRetailRevenue,
      projectedProfit,
      profitMargin,
    };
  }, [products, targetStockLevel, unitsPerCase]);

  // Single Product Refill Action
  const handleRefillSingle = (product: Product, unitsToAdd: number, reason: string = "Manual Refill") => {
    if (unitsToAdd <= 0) return;
    const newStock = product.totalStock + unitsToAdd;
    updateProduct(product.id, {
      totalStock: newStock,
      isLowStock: newStock <= (product.lowStockThreshold || 10),
    });

    executeInventoryTransaction({
      productId: product.id,
      sku: product.sku,
      productName: product.name,
      type: "Stock In",
      quantity: unitsToAdd,
      warehouseId: product.warehouseLocation || "WH-MAIN-DHAKA",
      notes: `Refill Stock Center (${reason} - ${(unitsToAdd / unitsPerCase).toFixed(1)} Cases)`,
      referenceNo: `RFL-${Date.now()}`,
    });

    addAuditLog({
      action: `Stock Refilled: ${product.name} (+${unitsToAdd} units / ${(unitsToAdd / unitsPerCase).toFixed(1)} Cases)`,
      module: "Inventory Refill Center",
      details: `Stock increased from ${product.totalStock} to ${newStock}. Target: ${targetStockLevel}. Reason: ${reason}`,
    });

    addToast(
      isBN
        ? `${product.name} এ +${unitsToAdd} টি স্টক সফলভাবে যুক্ত হয়েছে! (নতুন স্টক: ${newStock})`
        : `Added +${unitsToAdd} units to ${product.name}! (New stock: ${newStock})`,
      "success"
    );

    // Clear input
    setCustomRefillInputs((prev) => ({ ...prev, [product.id]: 0 }));
  };

  // Batch 1-Click Refill All Deficits
  const handleBatchRefillAll = () => {
    const deficitItems = products.filter((p) => p.totalStock < targetStockLevel);
    if (deficitItems.length === 0) {
      addToast(
        isBN ? "সকল পণ্যের স্টক নিরাপদ লেভেলে রয়েছে!" : "All products are already at or above safe target level!",
        "info"
      );
      return;
    }

    if (
      !window.confirm(
        isBN
          ? `আপনি কি নিশ্চিত যে সকল ঘাটতি পণ্যে মোট ${calculations.totalUnitsDeficit} ইউনিট (${calculations.totalCasesDeficit} কেস) রিফিল করতে চান?`
          : `Are you sure you want to refill all deficits (${calculations.totalUnitsDeficit} units / ${calculations.totalCasesDeficit} cases) up to ${targetStockLevel} units each?`
      )
    ) {
      return;
    }

    deficitItems.forEach((p) => {
      const deficit = targetStockLevel - p.totalStock;
      updateProduct(p.id, {
        totalStock: targetStockLevel,
        isLowStock: false,
      });

      executeInventoryTransaction({
        productId: p.id,
        sku: p.sku,
        productName: p.name,
        type: "Stock In",
        quantity: deficit,
        warehouseId: p.warehouseLocation || "WH-MAIN-DHAKA",
        notes: `Batch Refill Deficits to Target ${targetStockLevel} (${Math.ceil(deficit / unitsPerCase)} Cases)`,
        referenceNo: `BATCH-RFL-${Date.now()}`,
      });
    });

    addAuditLog({
      action: `Batch Refill Executed for ${deficitItems.length} Products (+${calculations.totalUnitsDeficit} units)`,
      module: "Inventory Refill Center",
      details: `Refilled to safe target of ${targetStockLevel} units across ${deficitItems.length} items. Total Cases: ${calculations.totalCasesDeficit}.`,
    });

    addToast(
      isBN
        ? `সফল! ${deficitItems.length}টি পণ্যে মোট ${calculations.totalUnitsDeficit} টি ইউনিট (+${calculations.totalCasesDeficit} কেস) রিফিল সম্পন্ন হয়েছে!`
        : `Successfully refilled ${deficitItems.length} items (+${calculations.totalUnitsDeficit} units / ${calculations.totalCasesDeficit} cases)!`,
      "success"
    );
  };

  // Export Refill Reorder Sheet to CSV
  const handleExportRefillSheet = () => {
    const rows = processedProducts.map((p) => {
      const deficit = Math.max(0, targetStockLevel - p.totalStock);
      const casesNeeded = Math.ceil(deficit / unitsPerCase);
      const unitCost = p.costPrice || p.purchasePrice || Math.round(p.sellingPrice * 0.7);
      const totalCost = deficit * unitCost;

      return {
        "Product Name": p.name,
        "SKU": p.sku,
        "Category": p.categoryName,
        "Supplier / Vendor": p.vendor || "Direct Factory",
        "Current Stock (Units)": p.totalStock,
        "Current Stock (Cases)": (p.totalStock / unitsPerCase).toFixed(2),
        "Safe Target (Units)": targetStockLevel,
        "Deficit Refill Units": deficit,
        "Cases to Order": casesNeeded,
        "Pack Size (Units/Case)": unitsPerCase,
        "Unit Cost (BDT)": unitCost,
        "Total Refill Cost (BDT)": totalCost,
        "Selling Price (BDT)": p.sellingPrice,
        "Expected Revenue (BDT)": deficit * p.sellingPrice,
      };
    });

    exportToCSV(`refill_order_sheet_${Date.now()}`, rows);
    addToast(
      isBN ? "রিফিল পারচেজ অর্ডার শিট CSV ফাইল হিসেবে ডাউনলোড হয়েছে!" : "Refill order sheet exported to CSV successfully!",
      "success"
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl w-full max-w-6xl max-h-[94vh] shadow-2xl flex flex-col overflow-hidden text-slate-100">
        {/* Header Ribbon */}
        <div className="p-5 sm:p-6 border-b border-slate-800 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
            title="Close Refill Hub"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pr-10">
            <div>
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-black uppercase tracking-wider border border-amber-500/30 flex items-center gap-1">
                  <Boxes className="w-3 h-3 text-amber-400 animate-pulse" />
                  <span>{isBN ? "স্মার্ট রিফিল ও কেস ক্যালকুলেটর" : "Smart Refill & Total Case Engine"}</span>
                </span>
                <span className="text-[11px] font-mono text-slate-400 bg-slate-950/60 px-2 py-0.5 rounded-md border border-slate-800">
                  A to Z Product Replenishment Hub
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
                <span>{isBN ? "কোন পণ্যগুলো রিফিল করতে হবে (A to Z তালিকা)" : "Which Items Need Refill (A to Z Inspection)"}</span>
              </h2>
              <p className="text-xs text-slate-400 max-w-2xl mt-0.5">
                {isBN
                  ? "ঘাটতি পণ্যের সংখ্যা, মোট কেস (কার্টন) হিসাব, পাইকারি ক্রয়মূল্য এবং ১-ক্লিকে রিফিল করার স্বয়ংক্রিয় কমান্ড ব্যবস্থা।"
                  : "Instant low-stock deficit breakdown, total carton case calculation, wholesale replenishment expense & 1-click stock restoration."}
              </p>
            </div>

            {/* Quick Jumps to other connected modules */}
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => {
                  onClose();
                  setAdminView("cash-calculation");
                }}
                className="px-3 py-1.5 rounded-xl bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-900/70 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                title="Jump to Cash Calculation Log"
              >
                <Wallet className="w-3.5 h-3.5 text-emerald-400" />
                <span>{isBN ? "ক্যাশ ক্যালকুলেশনে যান" : "Jump to Cash Log"}</span>
              </button>

              <button
                onClick={() => {
                  onClose();
                  setAdminView("orders");
                }}
                className="px-3 py-1.5 rounded-xl bg-indigo-950/70 border border-indigo-500/40 text-indigo-300 hover:bg-indigo-900/70 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                title="Jump to Orders Management"
              >
                <ShoppingBag className="w-3.5 h-3.5 text-indigo-400" />
                <span>{isBN ? "অর্ডার ম্যানেজমেন্ট" : "Orders Hub"}</span>
              </button>

              <button
                onClick={() => {
                  onClose();
                  setAdminView("supplier-management");
                }}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                title="Supplier & Vendor Management"
              >
                <Truck className="w-3.5 h-3.5 text-amber-400" />
                <span>{isBN ? "সাপ্লায়ার কনসোল" : "Suppliers"}</span>
              </button>
            </div>
          </div>
        </div>

        {/* 5 Live Calculation Pillars (Total Case & Stock Economics) */}
        <div className="p-4 sm:p-5 bg-slate-950 border-b border-slate-800 grid grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
          {/* 1. Total Refill Needed SKUs */}
          <div className="bg-slate-900 p-3.5 rounded-2xl border border-amber-500/40 space-y-1">
            <div className="flex items-center justify-between text-slate-400 font-bold">
              <span>{isBN ? "রিফিল প্রয়োজন (SKUs)" : "Items Needing Refill"}</span>
              <AlertTriangle className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-black font-mono text-amber-400">
              {calculations.totalItemsNeedingRefill}{" "}
              <span className="text-xs font-normal text-slate-400">/ {products.length}</span>
            </div>
            <p className="text-[10px] text-slate-500">
              {calculations.criticalOutCount} {isBN ? "টি শূন্য স্টকে (০)" : "out of stock (0 pcs)"}
            </p>
          </div>

          {/* 2. Total Units Deficit */}
          <div className="bg-slate-900 p-3.5 rounded-2xl border border-rose-500/40 space-y-1">
            <div className="flex items-center justify-between text-slate-400 font-bold">
              <span>{isBN ? "মোট ইউনিট ঘাটতি" : "Total Units Deficit"}</span>
              <Package className="w-4 h-4 text-rose-400" />
            </div>
            <div className="text-2xl font-black font-mono text-rose-400">
              {calculations.totalUnitsDeficit.toLocaleString()}{" "}
              <span className="text-xs font-normal text-slate-400">units</span>
            </div>
            <p className="text-[10px] text-slate-500">
              {isBN ? `টার্গেট ${targetStockLevel} ইউনিট পূরণ করতে` : `To reach target ${targetStockLevel} pcs`}
            </p>
          </div>

          {/* 3. Total Cases / Cartons Needed (Total Case Calculation) */}
          <div className="bg-gradient-to-br from-indigo-950 to-slate-900 p-3.5 rounded-2xl border-2 border-indigo-500 space-y-1 shadow-lg shadow-indigo-950/40">
            <div className="flex items-center justify-between text-indigo-300 font-extrabold">
              <span>{isBN ? "মোট কেস (কার্টন) সংখ্যা" : "TOTAL CASES (CARTONS)"}</span>
              <Boxes className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="text-2xl font-black font-mono text-indigo-300">
              {calculations.totalCasesDeficit}{" "}
              <span className="text-xs font-bold text-indigo-400">Cases</span>
            </div>
            <div className="flex items-center justify-between text-[10px] text-slate-400">
              <span>@{unitsPerCase} pcs/case</span>
              <span className="text-indigo-400 font-bold">100% Case Pack</span>
            </div>
          </div>

          {/* 4. Wholesale Purchase Cost Estimate */}
          <div className="bg-slate-900 p-3.5 rounded-2xl border border-slate-800 space-y-1">
            <div className="flex items-center justify-between text-slate-400 font-bold">
              <span>{isBN ? "পাইকারি রিফিল খরচ" : "Wholesale Refill Cost"}</span>
              <DollarSign className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-black font-mono text-emerald-400">
              {settings.currencySymbol}
              {calculations.totalRefillWholesaleCost.toLocaleString()}
            </div>
            <p className="text-[10px] text-slate-500">
              {isBN ? "সাপ্লায়ার ইনভয়েস প্রাক্কলন" : "Estimated supplier PO cost"}
            </p>
          </div>

          {/* 5. Projected Retail Value & Profit */}
          <div className="bg-slate-900 p-3.5 rounded-2xl border border-slate-800 space-y-1">
            <div className="flex items-center justify-between text-slate-400 font-bold">
              <span>{isBN ? "বিক্রয়মূল্য ও লাভ" : "Retail Value & Margin"}</span>
              <TrendingUp className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-2xl font-black font-mono text-purple-400">
              {settings.currencySymbol}
              {calculations.totalRetailRevenue.toLocaleString()}
            </div>
            <p className="text-[10px] text-emerald-400 font-bold">
              +{settings.currencySymbol}
              {calculations.projectedProfit.toLocaleString()} ({calculations.profitMargin.toFixed(1)}% ROI)
            </p>
          </div>
        </div>

        {/* Filter, Parameter Controls & Action Bar */}
        <div className="p-4 bg-slate-900/90 border-b border-slate-800 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 text-xs">
          {/* Filter Modes */}
          <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-2xl border border-slate-800 font-bold overflow-x-auto">
            <button
              onClick={() => setFilterMode("deficit")}
              className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 whitespace-nowrap ${
                filterMode === "deficit"
                  ? "bg-amber-500 text-slate-950 font-black shadow-xs"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>
                {isBN ? "⚠️ রিফিল প্রয়োজন ঘাটতি তালিকা" : "⚠️ Needs Refill"} ({calculations.totalItemsNeedingRefill})
              </span>
            </button>

            <button
              onClick={() => setFilterMode("out-of-stock")}
              className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 whitespace-nowrap ${
                filterMode === "out-of-stock"
                  ? "bg-rose-500 text-white font-black shadow-xs"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <XCircle className="w-3.5 h-3.5" />
              <span>
                {isBN ? "❌ শূন্য স্টক" : "❌ Out of Stock"} ({calculations.criticalOutCount})
              </span>
            </button>

            <button
              onClick={() => setFilterMode("all")}
              className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 whitespace-nowrap ${
                filterMode === "all"
                  ? "bg-indigo-600 text-white font-black shadow-xs"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>
                {isBN ? "🔤 সকল পণ্য A-Z" : "🔤 All Products A-Z"} ({products.length})
              </span>
            </button>
          </div>

          {/* Target Stock & Case Pack Tuning */}
          <div className="flex items-center gap-2 flex-wrap text-slate-300">
            <div className="flex items-center gap-1 bg-slate-950 px-2.5 py-1 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400">{isBN ? "প্রতি কেসে ইউনিট:" : "Units/Case:"}</span>
              <select
                value={unitsPerCase}
                onChange={(e) => setUnitsPerCase(Number(e.target.value))}
                className="bg-transparent font-mono font-bold text-indigo-400 focus:outline-none cursor-pointer"
              >
                <option value={6} className="bg-slate-900 text-white">6 pcs</option>
                <option value={12} className="bg-slate-900 text-white">12 pcs (Standard)</option>
                <option value={24} className="bg-slate-900 text-white">24 pcs (Bulk)</option>
                <option value={48} className="bg-slate-900 text-white">48 pcs (Master Carton)</option>
              </select>
            </div>

            <div className="flex items-center gap-1 bg-slate-950 px-2.5 py-1 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400">{isBN ? "সেফটি টার্গেট:" : "Safe Target:"}</span>
              <select
                value={targetStockLevel}
                onChange={(e) => setTargetStockLevel(Number(e.target.value))}
                className="bg-transparent font-mono font-bold text-amber-400 focus:outline-none cursor-pointer"
              >
                <option value={20} className="bg-slate-900 text-white">20 pcs</option>
                <option value={50} className="bg-slate-900 text-white">50 pcs</option>
                <option value={100} className="bg-slate-900 text-white">100 pcs</option>
                <option value={200} className="bg-slate-900 text-white">200 pcs</option>
              </select>
            </div>

            {/* Batch Refill All Button */}
            <button
              onClick={handleBatchRefillAll}
              disabled={calculations.totalUnitsDeficit === 0}
              className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-40 text-white font-extrabold px-3.5 py-1.5 rounded-xl shadow-md transition flex items-center gap-1.5 cursor-pointer"
              title="Refill all deficits to target in 1 click"
            >
              <Zap className="w-3.5 h-3.5 text-amber-300" />
              <span>{isBN ? "১-ক্লিকে সকল ঘাটতি রিফিল" : "1-Click Refill All"}</span>
            </button>

            {/* Export CSV PO */}
            <button
              onClick={handleExportRefillSheet}
              className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 px-3 py-1.5 rounded-xl transition flex items-center gap-1 cursor-pointer font-bold"
              title="Download Purchase Order Sheet"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">{isBN ? "PO এক্সপোর্ট" : "Export PO"}</span>
            </button>
          </div>
        </div>

        {/* Search, Sort and Category Sub-Bar */}
        <div className="p-3 bg-slate-950/60 border-b border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder={isBN ? "পণ্য নাম, SKU বা ক্যাটাগরি খুঁজুন..." : "Search product name, SKU, vendor..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-white placeholder-slate-500 font-medium focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-400 text-[11px] shrink-0">{isBN ? "ক্যাটাগরি:" : "Category:"}</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5 text-slate-200 font-bold focus:outline-none"
            >
              <option value="all">{isBN ? "সকল ক্যাটাগরি" : "All Categories"}</option>
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-400 text-[11px] shrink-0">{isBN ? "সর্টিং:" : "Sort:"}</span>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as any)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5 text-slate-200 font-bold focus:outline-none"
            >
              <option value="a-z">A to Z ({isBN ? "নাম অনুযায়ী" : "Alphabetical"})</option>
              <option value="z-a">Z to A</option>
              <option value="deficit-desc">{isBN ? "ঘাটতি সর্বোচ্চ আগে" : "Highest Deficit First"}</option>
              <option value="stock-asc">{isBN ? "স্টক সর্বনিম্ন আগে" : "Lowest Stock First"}</option>
              <option value="cost-desc">{isBN ? "রিফিল খরচ সর্বোচ্চ আগে" : "Highest Refill Cost First"}</option>
            </select>
          </div>
        </div>

        {/* Alphabet Quick Filter Ribbon & Clear Calculation */}
        <div className="px-4 py-2 bg-slate-950 border-b border-slate-800 flex items-center justify-between gap-2 overflow-x-auto text-[11px]">
          <div className="flex items-center gap-1 shrink-0 font-bold">
            <span className="text-slate-400 text-[10px] mr-1 hidden sm:inline">A-Z:</span>
            {["ALL", ..."ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("")].map((letter) => (
              <button
                key={letter}
                onClick={() => setSelectedLetter(letter)}
                className={`px-1.5 py-0.5 rounded-md transition font-mono ${
                  selectedLetter === letter
                    ? "bg-amber-400 text-slate-950 font-black shadow-2xs"
                    : "text-slate-400 hover:text-white hover:bg-slate-800"
                }`}
              >
                {letter}
              </button>
            ))}
          </div>

          {/* Reset / Clear Calculation */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => {
                setCustomRefillInputs({});
                setSearchTerm("");
                setSelectedLetter("ALL");
                setSelectedCategory("all");
                setTargetStockLevel(50);
                setUnitsPerCase(12);
                addToast(isBN ? "রিফিল হিসাব ও ফিল্টার রিসেট করা হয়েছে" : "Refill calculation & filters cleared", "info");
              }}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition flex items-center gap-1 font-semibold text-[11px] cursor-pointer"
              title="Reset search, filters and refill inputs"
            >
              <RotateCcw className="w-3 h-3 text-amber-400" />
              <span>{isBN ? "ক্লিয়ার হিসাব" : "Clear Filters"}</span>
            </button>
          </div>
        </div>

        {/* Product Inspection Table / Cards */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {processedProducts.length === 0 ? (
            <div className="text-center py-16 bg-slate-950/40 rounded-3xl border border-dashed border-slate-800 space-y-2">
              <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto" />
              <h3 className="text-base font-bold text-white">
                {isBN ? "কোন ঘাটতি পাওয়া যায়নি!" : "No Deficit Products Found!"}
              </h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                {isBN
                  ? "নির্বাচিত ফিল্টার অনুযায়ী সকল পণ্য নিরাপদ স্টক মাত্রায় রয়েছে। '🔤 সকল পণ্য A-Z' ট্যাবে ক্লিক করে সমস্ত পণ্যের স্টক দেখতে পারেন।"
                  : "All products meet the current stock threshold under this filter. Switch to '🔤 All Products A-Z' to view complete inventory."}
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {processedProducts.map((p) => {
                const threshold = p.lowStockThreshold || 10;
                const isOut = p.totalStock <= 0;
                const isLow = p.totalStock <= threshold;
                const deficit = Math.max(0, targetStockLevel - p.totalStock);
                const casesNeeded = Math.ceil(deficit / unitsPerCase);
                const currentCases = (p.totalStock / unitsPerCase).toFixed(1);
                const unitCost = p.costPrice || p.purchasePrice || Math.round(p.sellingPrice * 0.7);
                const totalRefillCost = deficit * unitCost;
                const customQty = customRefillInputs[p.id] || 0;

                return (
                  <div
                    key={p.id}
                    className={`p-4 rounded-2xl border transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-4 ${
                      isOut
                        ? "bg-rose-950/20 border-rose-500/40 hover:border-rose-400"
                        : isLow
                        ? "bg-amber-950/20 border-amber-500/40 hover:border-amber-400"
                        : "bg-slate-900/60 border-slate-800 hover:border-slate-700"
                    }`}
                  >
                    {/* Left: Product Info & Thumbnail */}
                    <div className="flex items-center gap-3.5 min-w-0 flex-1">
                      <img
                        src={p.mainImage}
                        alt={p.name}
                        className="w-14 h-14 rounded-xl object-contain bg-slate-950 border border-slate-800 p-1 shrink-0"
                      />

                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-white text-sm truncate">{p.name}</span>
                          {isOut ? (
                            <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-black text-[10px] border border-rose-500/40 uppercase">
                              {isBN ? "শূন্য স্টক" : "Out of Stock"}
                            </span>
                          ) : isLow ? (
                            <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-black text-[10px] border border-amber-500/40 uppercase">
                              {isBN ? `লো স্টক (${p.totalStock})` : `Low Stock (${p.totalStock})`}
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold text-[10px] border border-emerald-500/40">
                              {isBN ? "নিরাপদ স্টক" : "Safe Stock"}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-3 text-[11px] text-slate-400 font-mono flex-wrap">
                          <span>SKU: <strong className="text-slate-300">{p.sku}</strong></span>
                          <span>•</span>
                          <span>{p.categoryName}</span>
                          <span>•</span>
                          <span>{isBN ? "সাপ্লায়ার:" : "Vendor:"} <strong className="text-slate-300">{p.vendor || "Primary Vendor"}</strong></span>
                        </div>
                      </div>
                    </div>

                    {/* Middle: Stock & Case Breakdown Calculation */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-950/80 p-3 rounded-xl border border-slate-800/80 text-xs shrink-0">
                      <div>
                        <span className="text-[10px] text-slate-500 block uppercase font-bold">{isBN ? "বর্তমান স্টক" : "Current Stock"}</span>
                        <div className="font-mono font-black text-white text-sm">
                          {p.totalStock} <span className="text-[10px] text-slate-400">pcs</span>
                        </div>
                        <span className="text-[10px] text-indigo-400 font-mono font-bold">
                          {currentCases} Cases
                        </span>
                      </div>

                      <div>
                        <span className="text-[10px] text-slate-500 block uppercase font-bold">{isBN ? "টার্গেট ঘাটতি" : "Deficit (Needed)"}</span>
                        <div className={`font-mono font-black text-sm ${deficit > 0 ? "text-rose-400" : "text-emerald-400"}`}>
                          {deficit > 0 ? `-${deficit} pcs` : "0 (Fulfilled)"}
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono">
                          Target: {targetStockLevel}
                        </span>
                      </div>

                      <div>
                        <span className="text-[10px] text-slate-500 block uppercase font-bold">{isBN ? "কেস সংখ্যা" : "Cases Needed"}</span>
                        <div className="font-mono font-black text-amber-400 text-sm">
                          {casesNeeded} <span className="text-[10px] text-slate-400">Cases</span>
                        </div>
                        <span className="text-[10px] text-slate-500">
                          @{unitsPerCase}/case
                        </span>
                      </div>

                      <div>
                        <span className="text-[10px] text-slate-500 block uppercase font-bold">{isBN ? "প্রাক্কলিত খরচ" : "Refill Cost"}</span>
                        <div className="font-mono font-black text-emerald-400 text-sm">
                          {settings.currencySymbol}{totalRefillCost.toLocaleString()}
                        </div>
                        <span className="text-[10px] text-slate-500 font-mono">
                          @{settings.currencySymbol}{unitCost}/pc
                        </span>
                      </div>
                    </div>

                    {/* Right: Quick Refill Buttons & Custom Stepper */}
                    <div className="flex items-center gap-2 flex-wrap lg:justify-end shrink-0">
                      {/* Refill 1 Case */}
                      <button
                        onClick={() => handleRefillSingle(p, unitsPerCase, "1 Case Quick Refill")}
                        className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-indigo-300 font-bold text-xs border border-slate-700 transition flex items-center gap-1 cursor-pointer active:scale-95"
                        title={`Refill 1 Case (+${unitsPerCase} units)`}
                      >
                        <Plus className="w-3.5 h-3.5 text-indigo-400" />
                        <span>+1 Case ({unitsPerCase})</span>
                      </button>

                      {/* Refill 2 Cases */}
                      <button
                        onClick={() => handleRefillSingle(p, unitsPerCase * 2, "2 Cases Quick Refill")}
                        className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold text-xs border border-slate-700 transition flex items-center gap-1 cursor-pointer active:scale-95"
                        title={`Refill 2 Cases (+${unitsPerCase * 2} units)`}
                      >
                        <Plus className="w-3.5 h-3.5 text-amber-400" />
                        <span>+2 Cases ({unitsPerCase * 2})</span>
                      </button>

                      {/* If deficit exists: 1-click Deficit Fill */}
                      {deficit > 0 && (
                        <button
                          onClick={() => handleRefillSingle(p, deficit, "Deficit Fill to Target")}
                          className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-md transition flex items-center gap-1 cursor-pointer active:scale-95"
                          title={`Add +${deficit} units to reach safe target of ${targetStockLevel}`}
                        >
                          <Zap className="w-3.5 h-3.5 text-amber-300" />
                          <span>{isBN ? `ঘাটতি পূরণ (+${deficit})` : `Fill Deficit (+${deficit})`}</span>
                        </button>
                      )}

                      {/* Custom Input */}
                      <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
                        <input
                          type="number"
                          min={1}
                          placeholder="Qty"
                          value={customQty || ""}
                          onChange={(e) => {
                            const val = parseInt(e.target.value) || 0;
                            setCustomRefillInputs((prev) => ({ ...prev, [p.id]: val }));
                          }}
                          className="w-14 bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-white font-mono text-xs focus:outline-none focus:border-indigo-500"
                        />
                        <button
                          disabled={!customQty || customQty <= 0}
                          onClick={() => handleRefillSingle(p, customQty, "Custom Manual Input")}
                          className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white rounded-lg text-xs font-bold transition cursor-pointer"
                        >
                          {isBN ? "রিফিল" : "Add"}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer Navigation Bar */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <div className="flex items-center gap-3">
            <span>
              {isBN ? "মোট প্রদর্শিত পণ্য:" : "Showing:"} <strong className="text-white">{processedProducts.length}</strong> of {products.length}
            </span>
            <span>•</span>
            <span>
              {isBN ? "কার্টন প্যাক মাপ:" : "Carton Pack:"} <strong className="text-indigo-400">{unitsPerCase} units/case</strong>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                onClose();
                setAdminView("inventory");
              }}
              className="text-indigo-400 hover:text-indigo-300 font-bold transition flex items-center gap-1 cursor-pointer"
            >
              <span>{isBN ? "পূর্ণাঙ্গ ইনভেন্টরি পেজ খুলুন" : "Open Full Inventory Master Page"}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold transition cursor-pointer"
            >
              {isBN ? "বন্ধ করুন" : "Close"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
