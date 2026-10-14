import React, { useState, useMemo } from "react";
import { useStore } from "../../context/StoreContext";
import { AdminView } from "../../context/StoreContext";
import {
  COMMAND_CENTER_CATEGORIES,
  ALL_COMMAND_CENTER_FEATURES,
  CommandCenterCategory,
  CommandCenterFeature,
} from "./commandCenterStructure";
import {
  Search,
  ChevronDown,
  ChevronRight,
  ArrowRight,
  Layers,
  Sparkles,
  SlidersHorizontal,
  X,
  CheckCircle2,
  Lock,
  Compass,
  Wallet,
  Activity,
  Flame,
  Zap,
  Bot,
  FileSpreadsheet,
  Package,
  ShoppingBag,
  TrendingUp,
} from "lucide-react";

interface CommandCenterDirectoryProps {
  onSelectFeature?: (view: AdminView) => void;
}

export const CommandCenterDirectory: React.FC<CommandCenterDirectoryProps> = ({ onSelectFeature }) => {
  const { adminView, setAdminView, activeRole, hasPermission, language, orders, products, settings } = useStore();

  const isBN = language === "BN";

  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>("all");
  
  // State for expanded/collapsed categories (default all open)
  const [collapsedCategories, setCollapsedCategories] = useState<Record<string, boolean>>({});

  // Dynamic metrics for smart badges
  const pendingOrdersCount = useMemo(() => orders.filter((o) => o.orderStatus === "Pending").length, [orders]);
  const lowStockCount = useMemo(() => products.filter((p) => p.totalStock <= 5).length, [products]);
  const codSettledAmount = useMemo(
    () =>
      orders
        .filter((o) => o.paymentMethod === "Cash On Delivery" && o.orderStatus === "Delivered")
        .reduce((sum, o) => sum + o.total, 0),
    [orders]
  );

  const toggleCategory = (catId: string) => {
    setCollapsedCategories((prev) => ({
      ...prev,
      [catId]: !prev[catId],
    }));
  };

  const expandAll = () => {
    setCollapsedCategories({});
  };

  const collapseAll = () => {
    const allCollapsed: Record<string, boolean> = {};
    COMMAND_CENTER_CATEGORIES.forEach((cat) => {
      allCollapsed[cat.id] = true;
    });
    setCollapsedCategories(allCollapsed);
  };

  const handleSelect = (viewId: AdminView) => {
    if (onSelectFeature) {
      onSelectFeature(viewId);
    } else {
      setAdminView(viewId);
    }
  };

  // Check if current user has permission to view a feature
  const isFeatureAllowed = (feature: CommandCenterFeature) => {
    if (activeRole === "Super Admin" || activeRole === "Admin") return true;
    return hasPermission(feature.module, "view");
  };

  // Filtered categories and features based on search query, category filter and RBAC permissions
  const filteredCategories = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return COMMAND_CENTER_CATEGORIES.map((category) => {
      // Filter by category pill if specified
      if (activeCategoryFilter !== "all") {
        if (activeCategoryFilter === "popular") {
          // Keep only popular features
          const filteredSubcategories = category.subcategories.map((subcat) => {
            const filteredFeatures = subcat.features.filter((feat) => isFeatureAllowed(feat) && feat.isPopular);
            return { ...subcat, features: filteredFeatures };
          }).filter((subcat) => subcat.features.length > 0);

          if (filteredSubcategories.length === 0) return null;
          const totalFeatureCount = filteredSubcategories.reduce((sum, sub) => sum + sub.features.length, 0);
          return { ...category, subcategories: filteredSubcategories, totalFeatureCount };
        } else if (category.id !== activeCategoryFilter) {
          return null;
        }
      }

      const filteredSubcategories = category.subcategories.map((subcat) => {
        const filteredFeatures = subcat.features.filter((feat) => {
          if (!isFeatureAllowed(feat)) return false;

          if (!query) return true;

          const matchName = feat.name.toLowerCase().includes(query);
          const matchDesc = feat.description.toLowerCase().includes(query);
          const matchTag = feat.tag?.toLowerCase().includes(query);
          const matchCat = category.name.toLowerCase().includes(query);
          const matchSub = subcat.name.toLowerCase().includes(query);

          return matchName || matchDesc || matchTag || matchCat || matchSub;
        });

        return {
          ...subcat,
          features: filteredFeatures,
        };
      }).filter((subcat) => subcat.features.length > 0);

      if (filteredSubcategories.length === 0) return null;

      const totalFeatureCount = filteredSubcategories.reduce(
        (sum, sub) => sum + sub.features.length,
        0
      );

      return {
        ...category,
        subcategories: filteredSubcategories,
        totalFeatureCount,
      };
    }).filter(Boolean) as (CommandCenterCategory & { totalFeatureCount: number })[];
  }, [searchQuery, activeCategoryFilter, activeRole, hasPermission]);

  // Search Results preview list when typing
  const searchResults = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return [];

    return ALL_COMMAND_CENTER_FEATURES.filter((feat) => {
      if (!isFeatureAllowed(feat)) return false;

      const matchName = feat.name.toLowerCase().includes(query);
      const matchDesc = feat.description.toLowerCase().includes(query);
      const matchTag = feat.tag?.toLowerCase().includes(query);
      const matchCat = feat.categoryName.toLowerCase().includes(query);
      const matchSub = feat.subcategoryName.toLowerCase().includes(query);

      return matchName || matchDesc || matchTag || matchCat || matchSub;
    });
  }, [searchQuery, activeRole, hasPermission]);

  // Render smart status indicator badge for feature cards
  const renderSmartIndicator = (featureId: AdminView) => {
    if (featureId === "cash-calculation") {
      return (
        <span className="text-[10px] font-mono font-black text-emerald-700 bg-emerald-100/90 px-2 py-0.5 rounded-md border border-emerald-300 flex items-center gap-1 shadow-2xs">
          <Wallet className="w-3 h-3 text-emerald-600" />
          <span>{isBN ? "ক্যাশ ড্রয়ার অডিট" : "Live Cash Audit"}</span>
        </span>
      );
    }
    if (featureId === "orders" && pendingOrdersCount > 0) {
      return (
        <span className="text-[10px] font-mono font-black text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md border border-amber-300 flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
          <span>{pendingOrdersCount} {isBN ? "পেন্ডিং অর্ডার" : "Pending Orders"}</span>
        </span>
      );
    }
    if (featureId === "inventory" && lowStockCount > 0) {
      return (
        <span className="text-[10px] font-mono font-black text-rose-800 bg-rose-100 px-2 py-0.5 rounded-md border border-rose-300 flex items-center gap-1">
          <span>⚠️ {lowStockCount} {isBN ? "স্টক এলার্ট" : "Low Stock"}</span>
        </span>
      );
    }
    if (featureId === "dashboard") {
      return (
        <span className="text-[10px] font-mono font-black text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded-md border border-indigo-200 flex items-center gap-1">
          <Activity className="w-3 h-3 text-indigo-600 animate-pulse" />
          <span>{isBN ? "ট্রাফিক লাইভ" : "Traffic Wave"}</span>
        </span>
      );
    }
    if (featureId === "ai-agent") {
      return (
        <span className="text-[10px] font-mono font-black text-purple-800 bg-purple-100 px-2 py-0.5 rounded-md border border-purple-300 flex items-center gap-1">
          <Bot className="w-3 h-3 text-purple-600" />
          <span>{isBN ? "অটোনোমাস ৫-ইন-১" : "Autonomous 5-in-1"}</span>
        </span>
      );
    }
    if (featureId === "excel-hub") {
      return (
        <span className="text-[10px] font-mono font-black text-teal-800 bg-teal-100 px-2 py-0.5 rounded-md border border-teal-300 flex items-center gap-1">
          <FileSpreadsheet className="w-3 h-3 text-teal-600" />
          <span>{isBN ? "এক্সেল সিঙ্ক" : "Excel Sync"}</span>
        </span>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Smart Quick Launcher Bar (Fast One-Click Triggers) */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 rounded-2xl p-4 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold border border-indigo-500/30">
            <Zap className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <h4 className="font-extrabold text-white text-sm">
              {isBN ? "স্মার্ট কমান্ড কুইক লঞ্চার ও শর্টকাট" : "Smart Command Quick Launcher & Shortcuts"}
            </h4>
            <p className="text-[11px] text-slate-400">
              {isBN
                ? "তাত্ক্ষণিক ক্যাশ রিকনসিলিয়েশন, নতুন প্রোডাক্ট আপলোড, ট্রাফিক লোড ট্র্যাকিং ও এআই এজেন্ট।"
                : "Instant 1-click jump to Cash Audit, Catalog, Live Traffic Load Track & AI Workspace."}
            </p>
          </div>
        </div>

        {/* Quick Launch Pills */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Cash Calculation 1-Click */}
          <button
            onClick={() => handleSelect("cash-calculation")}
            className="px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black transition flex items-center gap-1.5 shadow-sm active:scale-95 cursor-pointer"
          >
            <Wallet className="w-3.5 h-3.5" />
            <span>{isBN ? "💵 ক্যাশ ক্যালকুলেশন" : "💵 Cash Ledger"}</span>
          </button>

          {/* Traffic Tracker 1-Click */}
          <button
            onClick={() => handleSelect("dashboard")}
            className="px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 font-bold transition flex items-center gap-1.5 cursor-pointer"
          >
            <Activity className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span>{isBN ? "📈 ট্রাফিক ট্র্যাকার" : "📈 Traffic Track"}</span>
          </button>

          {/* AI Agent 1-Click */}
          <button
            onClick={() => handleSelect("ai-agent")}
            className="px-3 py-1.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/40 font-bold transition flex items-center gap-1.5 cursor-pointer"
          >
            <Bot className="w-3.5 h-3.5" />
            <span>{isBN ? "🤖 AI এজেন্ট" : "🤖 AI Agent"}</span>
          </button>

          {/* Excel Hub 1-Click */}
          <button
            onClick={() => handleSelect("excel-hub")}
            className="px-3 py-1.5 rounded-xl bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 border border-teal-500/40 font-bold transition flex items-center gap-1.5 cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>{isBN ? "📑 এক্সেল হাব" : "📑 Excel Hub"}</span>
          </button>
        </div>
      </div>

      {/* Search and Navigation Toolbar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg border border-indigo-100">
                <Compass className="w-4 h-4" />
              </span>
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                {isBN ? "এডমিন কমান্ড সেন্টার ও ডিরেক্টরি সূচিপত্র" : "Enterprise Command Center Directory"}
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {isBN
                ? "ক্যাটালগ, ক্যাশ ক্যালকুলেশন, ট্রাফিক লোড ট্র্যাকার, ওয়্যারহাউজ ও গভর্নেন্স সিস্টেমের পূর্ণাঙ্গ তালিকা।"
                : "Hierarchical navigation index across all catalog, cash reconciliation, traffic tracking & administrative modules."}
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto">
            <button
              onClick={expandAll}
              className="text-[11px] font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition-colors"
            >
              {isBN ? "সব খুলুন" : "Expand All"}
            </button>
            <button
              onClick={collapseAll}
              className="text-[11px] font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition-colors"
            >
              {isBN ? "সব বন্ধ করুন" : "Collapse All"}
            </button>
          </div>
        </div>

        {/* Real-time Search Input */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              isBN
                ? "কমান্ড সেন্টারের যেকোনো ফিচার খুঁজুন (যেমন: Cash Calculation, Traffic, Products, Orders, Coupons, Audit)..."
                : "Search Command Center (e.g. Cash Calculation, Live Traffic, Products, Orders, Coupons, Audit)..."
            }
            className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all shadow-2xs"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
          <button
            onClick={() => setActiveCategoryFilter("all")}
            className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all text-[11px] ${
              activeCategoryFilter === "all"
                ? "bg-indigo-600 text-white shadow-xs"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            {isBN ? "সকল ক্যাটাগরি" : "All Categories"} ({COMMAND_CENTER_CATEGORIES.length})
          </button>

          {/* Popular filter pill */}
          <button
            onClick={() => setActiveCategoryFilter("popular")}
            className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all text-[11px] flex items-center gap-1 ${
              activeCategoryFilter === "popular"
                ? "bg-amber-500 text-slate-950 font-black shadow-xs"
                : "bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200"
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-amber-600" />
            <span>{isBN ? "জনপ্রিয় ও কোর ফিচারসমূহ" : "Popular & Core"}</span>
          </button>

          {COMMAND_CENTER_CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isActive = activeCategoryFilter === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategoryFilter(cat.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap transition-all text-[11px] ${
                  isActive
                    ? "bg-indigo-600 text-white font-bold shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? "text-white" : "text-slate-500"}`} />
                <span>{cat.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Live Search Quick Results List (if search query entered) */}
      {searchQuery && (
        <div className="bg-white rounded-2xl border border-indigo-100 shadow-sm p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <Search className="w-3.5 h-3.5 text-indigo-600" />
              <span>{isBN ? "অনুসন্ধানের ফলাফল" : "Search Results"} ({searchResults.length})</span>
            </span>
            <span className="text-[11px] text-slate-400">{isBN ? "ক্লিক করে মডিউল চালু করুন" : "Click card to launch"}</span>
          </div>

          {searchResults.length === 0 ? (
            <div className="py-8 text-center text-slate-500 space-y-1">
              <p className="text-xs font-semibold">{isBN ? "কোনো ফলাফল পাওয়া যায়নি।" : `No features found matching "${searchQuery}"`}</p>
              <p className="text-[11px] text-slate-400">
                {isBN ? "কীওয়ার্ড পরীক্ষা করুন: cash, traffic, orders, products, audit, excel" : 'Try keywords: "cash", "traffic", "orders", "excel", "inventory"'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {searchResults.map((feat) => {
                const Icon = feat.icon;
                const isActive = adminView === feat.id;

                return (
                  <button
                    key={`search-${feat.id}`}
                    onClick={() => handleSelect(feat.id)}
                    className={`text-left p-3.5 rounded-xl border transition-all flex flex-col justify-between group cursor-pointer ${
                      isActive
                        ? "bg-indigo-50/70 border-indigo-300 ring-1 ring-indigo-400"
                        : "bg-slate-50/50 hover:bg-indigo-50/40 border-slate-200 hover:border-indigo-200"
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-700 group-hover:bg-indigo-600 group-hover:text-white shrink-0">
                          <Icon className="w-4 h-4" />
                        </div>
                        {renderSmartIndicator(feat.id)}
                      </div>
                      <h4 className="text-xs font-bold text-slate-900 group-hover:text-indigo-600">
                        {feat.name}
                      </h4>
                      <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                        {feat.description}
                      </p>
                    </div>

                    <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400 group-hover:text-indigo-600 font-bold">
                      <span>{feat.categoryName}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Main Hierarchical Category Grid */}
      <div className="space-y-6">
        {filteredCategories.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500">
            <p className="font-bold text-sm text-slate-800">{isBN ? "কোনো ক্যাটাগরি পাওয়া যায়নি" : "No categories found"}</p>
            <p className="text-xs text-slate-400 mt-1">
              {isBN ? "ফিল্টার পরিবর্তন করে চেষ্টা করুন।" : "Try selecting 'All Categories' or resetting search."}
            </p>
          </div>
        ) : (
          filteredCategories.map((category) => {
            const CatIcon = category.icon;
            const isCollapsed = !!collapsedCategories[category.id];

            return (
              <section
                key={category.id}
                id={`command-cat-${category.id}`}
                className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden transition-all duration-200"
              >
                {/* CATEGORY HEADER (Accordion Control) */}
                <button
                  onClick={() => toggleCategory(category.id)}
                  aria-expanded={!isCollapsed}
                  className="w-full flex items-center justify-between p-5 bg-gradient-to-r from-slate-50/80 to-white hover:bg-slate-100/60 border-b border-slate-100 text-left transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-xs shrink-0 group-hover:bg-indigo-600 transition-colors">
                      <CatIcon className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <h3 className="text-base font-bold text-slate-900 tracking-tight">
                          {category.name}
                        </h3>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                            category.badgeColor || "bg-slate-100 text-slate-700 border-slate-200"
                          }`}
                        >
                          {category.totalFeatureCount} {category.totalFeatureCount === 1 ? "Feature" : "Features"}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                        {category.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pl-3 shrink-0">
                    <span className="text-[11px] font-semibold text-slate-400 group-hover:text-slate-600 hidden sm:inline">
                      {isCollapsed ? (isBN ? "খুলুন" : "Expand") : (isBN ? "সংক্ষেপ" : "Collapse")}
                    </span>
                    <div
                      className={`w-7 h-7 rounded-lg bg-white border border-slate-200 text-slate-600 flex items-center justify-center shadow-2xs transition-transform duration-200 ${
                        isCollapsed ? "" : "rotate-180"
                      }`}
                    >
                      <ChevronDown className="w-4 h-4" />
                    </div>
                  </div>
                </button>

                {/* CATEGORY BODY (Subcategories & Feature Cards) */}
                {!isCollapsed && (
                  <div className="p-5 sm:p-6 space-y-6">
                    {category.subcategories.map((subcat) => (
                      <div key={subcat.id} className="space-y-3">
                        {/* SUBCATEGORY HEADER */}
                        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                          <div>
                            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                              {subcat.name}
                            </h4>
                            {subcat.description && (
                              <p className="text-[11px] text-slate-400 mt-0.5 pl-3.5">
                                {subcat.description}
                              </p>
                            )}
                          </div>
                          <span className="text-[10px] font-semibold text-slate-400 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100">
                            {subcat.features.length} {subcat.features.length === 1 ? "action" : "actions"}
                          </span>
                        </div>

                        {/* FEATURE CARDS GRID (Desktop: 3 cols, Mobile: 1 col) */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-3.5">
                          {subcat.features.map((feature) => {
                            const FeatIcon = feature.icon;
                            const isActive = adminView === feature.id;
                            const smartIndicator = renderSmartIndicator(feature.id);

                            return (
                              <button
                                key={feature.id}
                                onClick={() => handleSelect(feature.id)}
                                title={`Launch ${feature.name}`}
                                className={`text-left p-4 rounded-xl border transition-all duration-150 flex flex-col justify-between group relative overflow-hidden cursor-pointer ${
                                  isActive
                                    ? "bg-indigo-50/80 border-indigo-300 ring-2 ring-indigo-500/20 shadow-xs"
                                    : "bg-white hover:bg-slate-50/80 border-slate-200 hover:border-slate-300 hover:shadow-2xs"
                                }`}
                              >
                                {isActive && (
                                  <div className="absolute top-0 right-0 w-2 h-2 bg-indigo-600 rounded-bl-md"></div>
                                )}

                                <div>
                                  <div className="flex items-start justify-between gap-2 mb-2.5">
                                    <div
                                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                                        isActive
                                          ? "bg-indigo-600 text-white shadow-xs"
                                          : "bg-slate-100 text-slate-700 group-hover:bg-indigo-600 group-hover:text-white"
                                      }`}
                                    >
                                      <FeatIcon className="w-4 h-4" />
                                    </div>

                                    <div className="flex items-center gap-1.5 flex-wrap justify-end">
                                      {smartIndicator}

                                      {feature.tag && !smartIndicator && (
                                        <span
                                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                                            isActive
                                              ? "bg-indigo-100 text-indigo-700 border-indigo-200"
                                              : "bg-slate-50 text-slate-600 border-slate-200 group-hover:bg-indigo-50 group-hover:text-indigo-700 group-hover:border-indigo-100"
                                          }`}
                                        >
                                          {feature.tag}
                                        </span>
                                      )}
                                    </div>
                                  </div>

                                  <h5 className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors flex items-center gap-1.5">
                                    <span>{feature.name}</span>
                                    {feature.isPopular && (
                                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400" title="Core Feature" />
                                    )}
                                  </h5>
                                  <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                                    {feature.description}
                                  </p>
                                </div>

                                <div className="mt-3.5 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] font-semibold">
                                  <span
                                    className={`transition-colors ${
                                      isActive ? "text-indigo-600 font-bold" : "text-slate-400 group-hover:text-indigo-600"
                                    }`}
                                  >
                                    {isActive ? (isBN ? "বর্তমানে সক্রিয়" : "Currently Active") : (isBN ? "চালু করুন →" : "Launch Module →")}
                                  </span>
                                  <ArrowRight
                                    className={`w-3.5 h-3.5 transition-transform ${
                                      isActive
                                        ? "text-indigo-600 translate-x-0.5"
                                        : "text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5"
                                    }`}
                                  />
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            );
          })
        )}
      </div>
    </div>
  );
};
