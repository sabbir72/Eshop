import React, { useState, useMemo } from "react";
import { useStore } from "../../context/StoreContext";
import { Coupon, CouponScopeType, CustomerEligibilityType, CodeType } from "../../types";
import { PrintableDocumentData } from "../../types/print";
import { buildReportPrintData } from "../../utils/printDocumentBuilder";
import { EnterprisePrintModal } from "../common/EnterprisePrintModal";
import {
  Tag,
  Plus,
  Edit2,
  Trash2,
  X,
  CheckCircle2,
  AlertTriangle,
  Search,
  Filter,
  Printer,
  Layers,
  Package,
  Users,
  Calendar,
  Sparkles,
  ShieldCheck,
  Percent,
  DollarSign,
  Info,
  Check,
  Flame,
  ArrowRight,
} from "lucide-react";

export const CouponManagement: React.FC = () => {
  const {
    coupons,
    addCoupon,
    updateCoupon,
    deleteCoupon,
    categories,
    products,
    hasPermission,
    settings,
    addToast,
    recordAuditLog,
  } = useStore();

  const [activePrintData, setActivePrintData] = useState<PrintableDocumentData | null>(null);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState<boolean>(false);

  const openPrintModal = (data: PrintableDocumentData) => {
    setActivePrintData(data);
    setIsPrintModalOpen(true);
  };

  // Filter & Search State
  const [searchQuery, setSearchQuery] = useState("");
  const [filterScope, setFilterScope] = useState<string>("ALL");
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [activeTab, setActiveTab] = useState<"ALL" | "GLOBAL" | "CATEGORY" | "PRODUCT">("ALL");

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingCoupon, setDeletingCoupon] = useState<Coupon | null>(null);

  // Form Fields
  const [code, setCode] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<"Percentage" | "Fixed">("Percentage");
  const [codeType, setCodeType] = useState<CodeType>("COUPON");
  const [scopeType, setScopeType] = useState<CouponScopeType>("GLOBAL");
  const [customerEligibility, setCustomerEligibility] = useState<CustomerEligibilityType>("ALL");
  const [discountValue, setDiscountValue] = useState(15);
  const [minSpend, setMinSpend] = useState(1500);
  const [maxDiscount, setMaxDiscount] = useState(1000);
  const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0]);
  const [endDate, setEndDate] = useState("2026-12-31");
  const [usageLimit, setUsageLimit] = useState(500);
  const [status, setStatus] = useState<"Active" | "Disabled">("Active");

  // Scoped Selections
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [productSearch, setProductSearch] = useState("");
  const [productGroupName, setProductGroupName] = useState("");

  // Simulation test state
  const [testProductPrice, setTestProductPrice] = useState(3000);
  const [testProductCategoryId, setTestProductCategoryId] = useState(categories[0]?.id || "");
  const [testProductId, setTestProductId] = useState(products[0]?.id || "");

  const handleOpenCreate = (presetScope: CouponScopeType = "GLOBAL") => {
    setEditingId(null);
    const prefix = presetScope === "GLOBAL" ? "SAVE" : presetScope === "CATEGORY" ? "CAT" : "PROD";
    setCode(`${prefix}${Math.floor(10 + Math.random() * 90)}`);
    setTitle(
      presetScope === "GLOBAL"
        ? "Storewide Special Discount"
        : presetScope === "CATEGORY"
        ? "Category Special Voucher"
        : "Exclusive Product Deal"
    );
    setDescription("");
    setType("Percentage");
    setCodeType(presetScope === "GLOBAL" ? "COUPON" : "PROMO");
    setScopeType(presetScope);
    setCustomerEligibility("ALL");
    setDiscountValue(presetScope === "GLOBAL" ? 10 : 20);
    setMinSpend(1000);
    setMaxDiscount(presetScope === "GLOBAL" ? 2000 : 3000);
    setStartDate(new Date().toISOString().split("T")[0]);
    setEndDate("2026-12-31");
    setUsageLimit(500);
    setStatus("Active");
    setSelectedCategoryIds(categories.length > 0 && presetScope === "CATEGORY" ? [categories[0].id] : []);
    setSelectedProductIds(products.length > 0 && presetScope === "PRODUCT" ? [products[0].id] : []);
    setProductGroupName("");
    setShowModal(true);
  };

  const handleEdit = (c: Coupon) => {
    setEditingId(c.id);
    setCode(c.code);
    setTitle(c.title || "");
    setDescription(c.description || "");
    setType(c.type === "Fixed Amount" ? "Fixed" : c.type);
    setCodeType(c.codeType || "COUPON");
    setScopeType((c.scopeType as any) || "GLOBAL");
    setCustomerEligibility(c.customerEligibility || "ALL");
    setDiscountValue(c.discountValue);
    setMinSpend(c.minSpend || c.minPurchase || 0);
    setMaxDiscount(c.maxDiscount || 0);
    setStartDate(c.startDate || new Date().toISOString().split("T")[0]);
    setEndDate(c.endDate || c.expiryDate || "2026-12-31");
    setUsageLimit(c.usageLimit || 1000);
    setStatus(c.status === "Disabled" ? "Disabled" : "Active");
    setSelectedCategoryIds(c.applicableCategoryIds || []);
    setSelectedProductIds(c.applicableProductIds || []);
    setProductGroupName(c.productGroupName || "");
    setShowModal(true);
  };

  const handleToggleCategory = (catId: string) => {
    setSelectedCategoryIds((prev) =>
      prev.includes(catId) ? prev.filter((id) => id !== catId) : [...prev, catId]
    );
  };

  const handleToggleProduct = (prodId: string) => {
    setSelectedProductIds((prev) =>
      prev.includes(prodId) ? prev.filter((id) => id !== prodId) : [...prev, prodId]
    );
  };

  const handleSaveCoupon = (e: React.FormEvent) => {
    e.preventDefault();

    const cleanCode = code.trim().toUpperCase();
    if (!cleanCode) {
      addToast("Coupon Code is required.", "error");
      return;
    }

    if (discountValue <= 0) {
      addToast("Discount value must be greater than 0.", "error");
      return;
    }

    if (type === "Percentage" && discountValue > 100) {
      addToast("Percentage discount cannot exceed 100%.", "error");
      return;
    }

    if (scopeType === "CATEGORY" && selectedCategoryIds.length === 0) {
      addToast("Please select at least one applicable Category / Product Group.", "error");
      return;
    }

    if (scopeType === "PRODUCT" && selectedProductIds.length === 0) {
      addToast("Please select at least one applicable Product.", "error");
      return;
    }

    const applicableCategoryNames = categories
      .filter((c) => selectedCategoryIds.includes(c.id))
      .map((c) => c.name);

    const applicableProductNames = products
      .filter((p) => selectedProductIds.includes(p.id))
      .map((p) => p.name);

    const payload: Omit<Coupon, "id" | "usageCount"> = {
      code: cleanCode,
      title: title.trim() || `${cleanCode} Promo Code`,
      description: description.trim(),
      type,
      codeType,
      scopeType,
      customerEligibility,
      discountValue,
      minSpend,
      minPurchase: minSpend,
      maxDiscount: type === "Percentage" ? maxDiscount : discountValue,
      startDate,
      endDate,
      expiryDate: endDate,
      usageLimit,
      status,
      applicableCategoryIds: selectedCategoryIds,
      applicableCategoryNames,
      applicableProductIds: selectedProductIds,
      applicableProductNames,
      productGroupName: productGroupName.trim() || applicableCategoryNames.join(", "),
    };

    if (editingId) {
      updateCoupon(editingId, payload);
      recordAuditLog(`Updated Coupon '${cleanCode}'`, "Coupon", "", JSON.stringify(payload));
      addToast(`Coupon '${cleanCode}' updated successfully!`, "success");
    } else {
      addCoupon(payload);
      recordAuditLog(`Created Coupon '${cleanCode}'`, "Coupon", "", JSON.stringify(payload));
      addToast(`Coupon '${cleanCode}' created successfully!`, "success");
    }

    setShowModal(false);
  };

  const handleToggleStatus = (c: Coupon) => {
    const nextStatus = c.status === "Active" ? "Disabled" : "Active";
    updateCoupon(c.id, { status: nextStatus });
    recordAuditLog(`Toggled Coupon '${c.code}' status to ${nextStatus}`, "Coupon");
    addToast(`Coupon '${c.code}' marked as ${nextStatus}`, "info");
  };

  const handleConfirmDelete = () => {
    if (!deletingCoupon) return;
    deleteCoupon(deletingCoupon.id);
    recordAuditLog(`Deleted Coupon '${deletingCoupon.code}'`, "Coupon");
    addToast(`Coupon '${deletingCoupon.code}' deleted`, "warning");
    setDeletingCoupon(null);
  };

  // Filtered list
  const filteredCoupons = useMemo(() => {
    return coupons.filter((c) => {
      // Tab filter
      if (activeTab !== "ALL") {
        const cScope = (c.scopeType || "GLOBAL").toUpperCase();
        if (activeTab === "GLOBAL" && cScope !== "GLOBAL") return false;
        if (activeTab === "CATEGORY" && cScope !== "CATEGORY" && cScope !== "PRODUCT_GROUP") return false;
        if (activeTab === "PRODUCT" && cScope !== "PRODUCT") return false;
      }

      // Scope filter dropdown
      if (filterScope !== "ALL" && (c.scopeType || "GLOBAL").toUpperCase() !== filterScope) {
        return false;
      }

      // Status filter dropdown
      if (filterStatus !== "ALL") {
        const isExpired = c.endDate ? new Date(c.endDate).getTime() < Date.now() : false;
        if (filterStatus === "EXPIRED" && !isExpired) return false;
        if (filterStatus === "ACTIVE" && (c.status !== "Active" || isExpired)) return false;
        if (filterStatus === "DISABLED" && c.status !== "Disabled") return false;
      }

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchCode = c.code.toLowerCase().includes(q);
        const matchTitle = (c.title || "").toLowerCase().includes(q);
        const matchCat = (c.applicableCategoryNames || []).some((cn) => cn.toLowerCase().includes(q));
        const matchProd = (c.applicableProductNames || []).some((pn) => pn.toLowerCase().includes(q));
        const matchGroup = (c.productGroupName || "").toLowerCase().includes(q);
        if (!matchCode && !matchTitle && !matchCat && !matchProd && !matchGroup) {
          return false;
        }
      }

      return true;
    });
  }, [coupons, activeTab, filterScope, filterStatus, searchQuery]);

  // Filtered products for modal search
  const filteredModalProducts = useMemo(() => {
    if (!productSearch.trim()) return products.slice(0, 15);
    const q = productSearch.toLowerCase();
    return products
      .filter((p) => p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q) || p.categoryName.toLowerCase().includes(q))
      .slice(0, 20);
  }, [products, productSearch]);

  // Live simulation for modal preview
  const simulationResult = useMemo(() => {
    let isEligible = false;
    let explanation = "";

    if (scopeType === "GLOBAL") {
      isEligible = true;
      explanation = "Eligible (Storewide)";
    } else if (scopeType === "CATEGORY" || scopeType === "PRODUCT_GROUP") {
      isEligible = selectedCategoryIds.includes(testProductCategoryId);
      const catObj = categories.find((c) => c.id === testProductCategoryId);
      explanation = isEligible
        ? `Eligible (Matches category: ${catObj?.name || testProductCategoryId})`
        : `Unauthorized (${catObj?.name || "Category"} is not in coupon scope - ৳0 Discount)`;
    } else if (scopeType === "PRODUCT") {
      isEligible = selectedProductIds.includes(testProductId);
      const prodObj = products.find((p) => p.id === testProductId);
      explanation = isEligible
        ? `Eligible (Matches product: ${prodObj?.name || testProductId})`
        : `Unauthorized (${prodObj?.name || "Product"} is not in coupon scope - ৳0 Discount)`;
    }

    let calculatedDiscount = 0;
    if (isEligible) {
      if (testProductPrice >= minSpend) {
        if (type === "Percentage") {
          calculatedDiscount = Math.min((testProductPrice * discountValue) / 100, maxDiscount);
        } else {
          calculatedDiscount = Math.min(discountValue, testProductPrice);
        }
      } else {
        explanation += ` (Below minimum spend of ${settings.currencySymbol}${minSpend})`;
      }
    }

    return {
      isEligible,
      explanation,
      calculatedDiscount: Math.round(calculatedDiscount * 100) / 100,
      finalPrice: Math.max(0, testProductPrice - calculatedDiscount),
    };
  }, [
    scopeType,
    selectedCategoryIds,
    selectedProductIds,
    testProductCategoryId,
    testProductId,
    testProductPrice,
    minSpend,
    type,
    discountValue,
    maxDiscount,
    categories,
    products,
    settings.currencySymbol,
  ]);

  return (
    <div className="space-y-6 pb-16">
      {/* Header Banner */}
      <div className="bg-slate-900 text-white p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between shadow-md border border-slate-800 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Tag className="w-6 h-6 text-indigo-400" />
            <h1 className="text-2xl font-black tracking-tight">Discounts & Promo Command Center</h1>
          </div>
          <p className="text-xs text-slate-300 mt-1">
            Enterprise multi-scope discount engine: Global Storewide, Category/Group Vouchers & Specific Product Deals
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => {
              const headers = [
                "Code",
                "Scope",
                "Type",
                "Discount",
                "Min Spend",
                "Max Cap",
                "Target Entities",
                "Usage",
                "Status",
              ];
              const rawRows = coupons.map((c) => [
                c.code,
                c.scopeType || "GLOBAL",
                c.type,
                `${c.discountValue}${c.type === "Percentage" ? "%" : settings.currencySymbol}`,
                `${settings.currencySymbol}${(c.minSpend || c.minPurchase || 0).toLocaleString()}`,
                `${settings.currencySymbol}${(c.maxDiscount || 0).toLocaleString()}`,
                c.scopeType === "CATEGORY"
                  ? c.applicableCategoryNames?.join(", ") || "Categories"
                  : c.scopeType === "PRODUCT"
                  ? c.applicableProductNames?.join(", ") || "Products"
                  : "All Store Catalog",
                `${c.usageCount} / ${c.usageLimit || "∞"}`,
                c.status || "Active",
              ]);
              openPrintModal(
                buildReportPrintData(
                  "DISCOUNT VOUCHERS & PROMO CODES AUDIT REPORT",
                  headers,
                  rawRows,
                  "coupon_report"
                )
              );
            }}
            className="bg-indigo-800/60 hover:bg-indigo-800 text-white font-bold text-xs px-3.5 py-2.5 rounded-xl flex items-center gap-1.5 border border-indigo-700/50 transition-all"
          >
            <Printer className="w-4 h-4 text-indigo-300" /> Print Report
          </button>

          {hasPermission("Coupon", "add") && (
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => handleOpenCreate("GLOBAL")}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-3.5 py-2.5 rounded-xl flex items-center gap-1.5 shadow-md transition-all active:scale-95"
              >
                <Plus className="w-4 h-4" /> Add Store Voucher
              </button>

              <button
                onClick={() => handleOpenCreate("CATEGORY")}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3 py-2.5 rounded-xl flex items-center gap-1 shadow-md transition-all active:scale-95"
                title="Create Category Promo"
              >
                <Layers className="w-4 h-4" /> Category Promo
              </button>

              <button
                onClick={() => handleOpenCreate("PRODUCT")}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-3 py-2.5 rounded-xl flex items-center gap-1 shadow-md transition-all active:scale-95"
                title="Create Product Specific Voucher"
              >
                <Package className="w-4 h-4" /> Product Deal
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Scope Navigation Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-1.5 overflow-x-auto">
          <button
            onClick={() => setActiveTab("ALL")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === "ALL"
                ? "bg-slate-900 text-white shadow-xs"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <Tag className="w-3.5 h-3.5" /> All Discounts ({coupons.length})
          </button>

          <button
            onClick={() => setActiveTab("GLOBAL")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === "GLOBAL"
                ? "bg-indigo-600 text-white shadow-xs"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-300" /> Storewide (
            {coupons.filter((c) => (c.scopeType || "GLOBAL") === "GLOBAL").length})
          </button>

          <button
            onClick={() => setActiveTab("CATEGORY")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === "CATEGORY"
                ? "bg-emerald-600 text-white shadow-xs"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-emerald-300" /> Category / Group (
            {coupons.filter((c) => (c.scopeType || "") === "CATEGORY" || (c.scopeType || "") === "PRODUCT_GROUP").length})
          </button>

          <button
            onClick={() => setActiveTab("PRODUCT")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === "PRODUCT"
                ? "bg-blue-600 text-white shadow-xs"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <Package className="w-3.5 h-3.5 text-blue-300" /> Product Specific (
            {coupons.filter((c) => c.scopeType === "PRODUCT").length})
          </button>
        </div>

        {/* Search & Status Filters */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search code, category or product..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
            />
          </div>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 font-bold text-slate-700"
          >
            <option value="ALL">All Status</option>
            <option value="ACTIVE">Active Only</option>
            <option value="DISABLED">Disabled Only</option>
            <option value="EXPIRED">Expired Only</option>
          </select>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCoupons.length === 0 ? (
          <div className="col-span-full bg-white p-12 text-center rounded-2xl border border-slate-200 shadow-xs">
            <Tag className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">No Discounts Found</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              No promo codes match your current search and scope filters. Create a new storewide or product-scoped voucher.
            </p>
          </div>
        ) : (
          filteredCoupons.map((c) => {
            const isExpired = c.endDate ? new Date(c.endDate).getTime() < Date.now() : false;
            const scope = (c.scopeType || "GLOBAL").toUpperCase();
            const usagePercent = c.usageLimit ? Math.min(100, Math.round((c.usageCount / c.usageLimit) * 100)) : 0;

            return (
              <div
                key={c.id}
                className={`bg-white p-5 rounded-2xl border shadow-xs space-y-3 relative group transition-all hover:shadow-md ${
                  c.status === "Disabled" || isExpired
                    ? "border-slate-200 opacity-75"
                    : scope === "PRODUCT"
                    ? "border-blue-200 hover:border-blue-400"
                    : scope === "CATEGORY" || scope === "PRODUCT_GROUP"
                    ? "border-emerald-200 hover:border-emerald-400"
                    : "border-indigo-200 hover:border-indigo-400"
                }`}
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-2 pb-2.5 border-b border-slate-100">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-black text-slate-900 text-lg tracking-wider bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-200">
                        {c.code}
                      </span>
                      <span
                        className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase border ${
                          scope === "PRODUCT"
                            ? "bg-blue-50 text-blue-700 border-blue-200"
                            : scope === "CATEGORY" || scope === "PRODUCT_GROUP"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-indigo-50 text-indigo-700 border-indigo-200"
                        }`}
                      >
                        {scope === "PRODUCT"
                          ? "Product Scope"
                          : scope === "CATEGORY" || scope === "PRODUCT_GROUP"
                          ? "Category Scope"
                          : "Storewide"}
                      </span>
                    </div>
                    {c.title && <p className="text-xs font-bold text-slate-700 mt-1">{c.title}</p>}
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase shrink-0 ${
                      isExpired
                        ? "bg-rose-50 text-rose-700 border-rose-200"
                        : c.status === "Active"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : "bg-amber-50 text-amber-700 border-amber-200"
                    }`}
                  >
                    {isExpired ? "Expired" : c.status}
                  </span>
                </div>

                {/* Scope Target Description */}
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/70 text-[11px] space-y-1">
                  <div className="flex items-center justify-between text-slate-500 font-semibold">
                    <span className="flex items-center gap-1">
                      {scope === "PRODUCT" ? (
                        <Package className="w-3.5 h-3.5 text-blue-600" />
                      ) : scope === "CATEGORY" || scope === "PRODUCT_GROUP" ? (
                        <Layers className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                      )}
                      Authorized Target:
                    </span>
                    <span className="font-extrabold text-slate-800 truncate max-w-[150px]">
                      {scope === "CATEGORY" || scope === "PRODUCT_GROUP"
                        ? c.productGroupName || c.applicableCategoryNames?.join(", ") || "Category items"
                        : scope === "PRODUCT"
                        ? c.applicableProductNames?.join(", ") || "Selected products"
                        : "All Store Items"}
                    </span>
                  </div>

                  {c.customerEligibility && c.customerEligibility !== "ALL" && (
                    <div className="flex items-center gap-1 text-amber-700 font-bold">
                      <Users className="w-3.5 h-3.5" />
                      <span>
                        {c.customerEligibility === "NEW_USERS"
                          ? "First-time customers only"
                          : "VIP account holders only"}
                      </span>
                    </div>
                  )}
                </div>

                {/* Discount Metrics */}
                <div className="text-xs text-slate-600 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Discount Rate:</span>
                    <strong className="text-slate-900 font-black text-sm">
                      {c.discountValue}
                      {c.type === "Percentage" ? "% OFF" : ` ${settings.currencySymbol} Flat`}
                    </strong>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Min Spend Required:</span>
                    <strong className="text-slate-800 font-bold">
                      {settings.currencySymbol}
                      {(c.minSpend || c.minPurchase || 0).toLocaleString()}
                    </strong>
                  </div>

                  {c.type === "Percentage" && (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Max Discount Cap:</span>
                      <strong className="text-slate-800 font-bold">
                        {settings.currencySymbol}
                        {(c.maxDiscount || 0).toLocaleString()}
                      </strong>
                    </div>
                  )}

                  {/* Usage Quota Progress Bar */}
                  <div className="pt-1">
                    <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium mb-1">
                      <span>Usage Redemptions:</span>
                      <span className="font-bold text-slate-800">
                        {c.usageCount} / {c.usageLimit || "∞"} ({usagePercent}%)
                      </span>
                    </div>
                    {c.usageLimit && (
                      <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            usagePercent >= 90
                              ? "bg-rose-500"
                              : usagePercent >= 50
                              ? "bg-amber-500"
                              : "bg-indigo-600"
                          }`}
                          style={{ width: `${usagePercent}%` }}
                        ></div>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> Valid: {c.startDate || "Anytime"} → {c.endDate || "No Expiry"}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                  <button
                    onClick={() => handleToggleStatus(c)}
                    className={`text-[11px] font-bold px-2.5 py-1.5 rounded-xl border transition-colors ${
                      c.status === "Active"
                        ? "text-amber-700 bg-amber-50 hover:bg-amber-100 border-amber-200"
                        : "text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border-emerald-200"
                    }`}
                  >
                    {c.status === "Active" ? "Pause" : "Activate"}
                  </button>

                  {hasPermission("Coupon", "edit") && (
                    <button
                      onClick={() => handleEdit(c)}
                      className="flex-1 text-center text-xs font-bold text-indigo-600 hover:bg-indigo-50 py-1.5 rounded-xl border border-indigo-200 transition-colors"
                    >
                      Edit
                    </button>
                  )}

                  {hasPermission("Coupon", "delete") && (
                    <button
                      onClick={() => setDeletingCoupon(c)}
                      className="text-center text-xs font-bold text-rose-600 hover:bg-rose-50 px-3 py-1.5 rounded-xl border border-rose-200 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Enterprise Multi-Scope Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white max-w-2xl w-full rounded-2xl p-6 shadow-2xl space-y-4 max-h-[92vh] flex flex-col my-auto">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3 shrink-0">
              <div>
                <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                  <Tag className="w-5 h-5 text-indigo-600" />
                  {editingId ? "Edit Discount / Promo Configuration" : "Configure New Discount Rule"}
                </h3>
                <p className="text-[11px] text-slate-400">
                  Strict backend validation ensures zero unauthorized cross-application to other scopes.
                </p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCoupon} className="space-y-4 overflow-y-auto pr-1 text-xs">
              {/* 1. Scope Selector */}
              <div className="bg-indigo-50/70 p-3.5 rounded-xl border border-indigo-200 space-y-2">
                <label className="font-black text-indigo-950 block">1. Select Discount Scope *</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setScopeType("GLOBAL")}
                    className={`p-2.5 rounded-xl border text-center transition-all ${
                      scopeType === "GLOBAL"
                        ? "bg-indigo-600 text-white border-indigo-700 font-black shadow-xs"
                        : "bg-white text-slate-700 border-indigo-200 hover:bg-indigo-50 font-bold"
                    }`}
                  >
                    <Sparkles className="w-4 h-4 mx-auto mb-1" />
                    Storewide (All)
                  </button>

                  <button
                    type="button"
                    onClick={() => setScopeType("CATEGORY")}
                    className={`p-2.5 rounded-xl border text-center transition-all ${
                      scopeType === "CATEGORY" || scopeType === "PRODUCT_GROUP"
                        ? "bg-emerald-600 text-white border-emerald-700 font-black shadow-xs"
                        : "bg-white text-slate-700 border-indigo-200 hover:bg-emerald-50 font-bold"
                    }`}
                  >
                    <Layers className="w-4 h-4 mx-auto mb-1" />
                    Category / Group
                  </button>

                  <button
                    type="button"
                    onClick={() => setScopeType("PRODUCT")}
                    className={`p-2.5 rounded-xl border text-center transition-all ${
                      scopeType === "PRODUCT"
                        ? "bg-blue-600 text-white border-blue-700 font-black shadow-xs"
                        : "bg-white text-slate-700 border-indigo-200 hover:bg-blue-50 font-bold"
                    }`}
                  >
                    <Package className="w-4 h-4 mx-auto mb-1" />
                    Specific Product(s)
                  </button>
                </div>
              </div>

              {/* Conditional Scope Targets */}
              {(scopeType === "CATEGORY" || scopeType === "PRODUCT_GROUP") && (
                <div className="bg-emerald-50/60 p-3.5 rounded-xl border border-emerald-200 space-y-2.5 animate-fadeIn">
                  <div className="flex items-center justify-between">
                    <label className="font-black text-emerald-950 block">
                      Applicable Categories / Product Groups * ({selectedCategoryIds.length} selected)
                    </label>
                    <button
                      type="button"
                      onClick={() =>
                        setSelectedCategoryIds(
                          selectedCategoryIds.length === categories.length ? [] : categories.map((c) => c.id)
                        )
                      }
                      className="text-[10px] text-emerald-700 font-bold underline"
                    >
                      {selectedCategoryIds.length === categories.length ? "Deselect All" : "Select All"}
                    </button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-36 overflow-y-auto p-1 bg-white rounded-xl border border-emerald-100">
                    {categories.map((c) => {
                      const isSel = selectedCategoryIds.includes(c.id);
                      return (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => handleToggleCategory(c.id)}
                          className={`p-2 rounded-lg border text-left text-[11px] font-bold transition-all flex items-center justify-between ${
                            isSel
                              ? "bg-emerald-100/70 border-emerald-400 text-emerald-900"
                              : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                          }`}
                        >
                          <span className="truncate">{c.name}</span>
                          {isSel && <Check className="w-3.5 h-3.5 text-emerald-700 shrink-0 ml-1" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {scopeType === "PRODUCT" && (
                <div className="bg-blue-50/60 p-3.5 rounded-xl border border-blue-200 space-y-2.5 animate-fadeIn">
                  <div className="flex items-center justify-between">
                    <label className="font-black text-blue-950 block">
                      Select Authorized Products * ({selectedProductIds.length} selected)
                    </label>
                  </div>

                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                    <input
                      type="text"
                      value={productSearch}
                      onChange={(e) => setProductSearch(e.target.value)}
                      placeholder="Search product name or SKU..."
                      className="w-full bg-white pl-8 pr-3 py-1.5 rounded-lg border border-blue-200 text-xs font-medium"
                    />
                  </div>

                  <div className="space-y-1 max-h-40 overflow-y-auto p-1 bg-white rounded-xl border border-blue-100">
                    {filteredModalProducts.map((p) => {
                      const isSel = selectedProductIds.includes(p.id);
                      return (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => handleToggleProduct(p.id)}
                          className={`w-full p-2 rounded-lg border text-left text-xs font-medium transition-all flex items-center justify-between ${
                            isSel
                              ? "bg-blue-100/70 border-blue-400 text-blue-900 font-bold"
                              : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                          }`}
                        >
                          <div className="flex items-center gap-2 truncate">
                            <img src={p.mainImage} alt="" className="w-6 h-6 rounded object-cover shrink-0" />
                            <span className="truncate">{p.name}</span>
                            <span className="text-[10px] text-slate-400 font-mono">({p.sku})</span>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0 ml-2">
                            <span className="text-[11px] font-bold text-slate-800">
                              {settings.currencySymbol}
                              {p.sellingPrice}
                            </span>
                            {isSel && <Check className="w-4 h-4 text-blue-700" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Basic Code Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Coupon / Promo Code *</label>
                  <input
                    type="text"
                    required
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-mono uppercase font-black text-sm tracking-wider"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Display Title / Tagline</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Flash Fashion Voucher"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold"
                  />
                </div>
              </div>

              {/* Discount Rates */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Discount Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold"
                  >
                    <option value="Percentage">Percentage (%)</option>
                    <option value="Fixed">Fixed Amount ({settings.currencySymbol})</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Discount Value *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={discountValue}
                    onChange={(e) => setDiscountValue(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold text-indigo-700"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Max Discount Cap ({settings.currencySymbol})
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={maxDiscount}
                    onChange={(e) => setMaxDiscount(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold"
                  />
                </div>
              </div>

              {/* Rules & Quotas */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Min Order Spend ({settings.currencySymbol})
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={minSpend}
                    onChange={(e) => setMinSpend(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Total Usage Limit</label>
                  <input
                    type="number"
                    min={1}
                    value={usageLimit}
                    onChange={(e) => setUsageLimit(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Customer Eligibility</label>
                  <select
                    value={customerEligibility}
                    onChange={(e) => setCustomerEligibility(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold"
                  >
                    <option value="ALL">All Customers</option>
                    <option value="NEW_USERS">First-Time Customers Only</option>
                    <option value="VIP_CUSTOMERS">VIP Tier Accounts Only</option>
                  </select>
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Valid From</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-medium"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Expiration Date</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-medium"
                  />
                </div>
              </div>

              {/* Live Scope Simulation & Verification Preview */}
              <div className="bg-slate-900 text-white p-3.5 rounded-xl space-y-2 border border-slate-800">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-black text-indigo-300 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" /> Real-time Scope & Discount Simulator
                  </span>
                  <span className="text-[10px] text-slate-400">Verifies strict isolation</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-0.5">Test Item Category</label>
                    <select
                      value={testProductCategoryId}
                      onChange={(e) => setTestProductCategoryId(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg p-1.5 text-xs text-white"
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 block mb-0.5">Test Item Price ({settings.currencySymbol})</label>
                    <input
                      type="number"
                      value={testProductPrice}
                      onChange={(e) => setTestProductPrice(Number(e.target.value))}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg p-1.5 text-xs text-white font-mono"
                    />
                  </div>

                  <div className="bg-slate-800/90 p-2 rounded-lg border border-slate-700 text-right">
                    <p className="text-[10px] text-slate-400">Discount Applied:</p>
                    <p className="text-sm font-black text-emerald-400 font-mono">
                      -{settings.currencySymbol}
                      {simulationResult.calculatedDiscount}
                    </p>
                  </div>
                </div>

                <p
                  className={`text-[11px] font-bold flex items-center gap-1 ${
                    simulationResult.isEligible ? "text-emerald-400" : "text-rose-400"
                  }`}
                >
                  {simulationResult.isEligible ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
                  {simulationResult.explanation}
                </p>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md transition-all active:scale-95"
                >
                  {editingId ? "Save Changes" : "Create Coupon"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingCoupon && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-sm w-full rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="font-extrabold text-slate-900 text-base">Delete Coupon Code</h3>
              <p className="text-xs text-slate-500">
                Are you sure you want to delete coupon <strong className="text-slate-900 font-mono font-black">{deletingCoupon.code}</strong>?
                This action cannot be undone.
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setDeletingCoupon(null)}
                className="flex-1 px-4 py-2 border border-slate-200 rounded-xl font-bold text-xs hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="flex-1 px-4 py-2 bg-rose-600 text-white rounded-xl font-bold text-xs hover:bg-rose-700 shadow-md"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Enterprise Print Modal */}
      {activePrintData && (
        <EnterprisePrintModal
          isOpen={isPrintModalOpen}
          onClose={() => setIsPrintModalOpen(false)}
          data={activePrintData}
          currencySymbol={settings.currencySymbol}
        />
      )}
    </div>
  );
};
