import React, { useState, useMemo } from "react";
import { useStore } from "../../context/StoreContext";
import { AdminDashboard } from "./AdminDashboard";
import { ProductManagement } from "./ProductManagement";
import { CategoryManagement } from "./CategoryManagement";
import { InventoryManagement } from "./InventoryManagement";
import { OrderManagement } from "./OrderManagement";
import { CouponManagement } from "./CouponManagement";
import { ReportsAnalytics } from "./ReportsAnalytics";
import { RoleManagement } from "./RoleManagement";
import { AuditLogView } from "./AuditLogView";
import { AdminAIAssistant } from "./AdminAIAssistant";
import { SettingsCMS } from "./SettingsCMS";
import { WebsiteProfileSettings } from "./WebsiteProfileSettings";
import { SecurityLabelManagement } from "./SecurityLabelManagement";
import { CompanyCMSManagement } from "./CompanyCMSManagement";
import { CareersManagement } from "./CareersManagement";
import { LegalPoliciesManagement } from "./LegalPoliciesManagement";
import { FAQManagement } from "./FAQManagement";
import { CustomerSupportManagement } from "./CustomerSupportManagement";
import { SupplierManagement } from "./SupplierManagement";
import { MarketingManagement } from "./MarketingManagement";
import { WarehouseMovementManagement } from "./WarehouseMovementManagement";
import { SEOMarketingManagement } from "./SEOMarketingManagement";
import {
  COMMAND_CENTER_CATEGORIES,
  findBreadcrumbsForView,
  ALL_COMMAND_CENTER_FEATURES,
} from "./commandCenterStructure";
import {
  LayoutDashboard,
  Package,
  Layers,
  Building2,
  ShoppingBag,
  Tag,
  BarChart3,
  ShieldCheck,
  Activity,
  Sparkles,
  Settings,
  Briefcase,
  HelpCircle,
  Headphones,
  FileText,
  Building,
  Truck,
  ShieldAlert,
  Store,
  Lock,
  Megaphone,
  ArrowLeftRight,
  Search,
  Menu,
  X,
  ChevronDown,
  ChevronRight,
  Compass,
  ArrowLeft,
  LogOut,
} from "lucide-react";

export const AdminPanel: React.FC = () => {
  const { adminView, setAdminView, activeRole, hasPermission, setMode, currentUser, logoutUser } = useStore();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [collapsedCategories, setCollapsedCategories] = useState<Record<string, boolean>>({});
  const [quickSearchOpen, setQuickSearchOpen] = useState(false);
  const [quickSearchQuery, setQuickSearchQuery] = useState("");

  const toggleCategory = (catId: string) => {
    setCollapsedCategories((prev) => ({
      ...prev,
      [catId]: !prev[catId],
    }));
  };

  // Check RBAC permission for features
  const isFeatureAllowed = (moduleName: any) => {
    if (activeRole === "Super Admin" || activeRole === "Admin") return true;
    return hasPermission(moduleName, "view");
  };

  // Quick search filtered list - always called at top level
  const quickSearchResults = useMemo(() => {
    const query = quickSearchQuery.trim().toLowerCase();
    if (!query) return ALL_COMMAND_CENTER_FEATURES.slice(0, 8);

    return ALL_COMMAND_CENTER_FEATURES.filter((feat) => {
      if (!isFeatureAllowed(feat.module)) return false;
      return (
        feat.name.toLowerCase().includes(query) ||
        feat.description.toLowerCase().includes(query) ||
        feat.tag?.toLowerCase().includes(query) ||
        feat.categoryName.toLowerCase().includes(query) ||
        feat.subcategoryName.toLowerCase().includes(query)
      );
    });
  }, [quickSearchQuery, activeRole, hasPermission]);

  // Active view breadcrumbs
  const breadcrumbInfo = findBreadcrumbsForView(adminView);

  // BR-02: Customer / Guest role attempting to view Admin Panel
  if (activeRole === "Customer" || activeRole === "Guest") {
    return (
      <div className="max-w-2xl mx-auto my-16 p-8 bg-white border border-rose-200 rounded-3xl shadow-xl text-center space-y-6">
        <div className="w-20 h-20 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
          <ShieldAlert className="w-10 h-10" />
        </div>
        <div className="space-y-2">
          <span className="inline-block px-3 py-1 bg-rose-100 text-rose-800 text-xs font-black uppercase tracking-wider rounded-full border border-rose-200">
            403 Forbidden
          </span>
          <h1 className="text-2xl font-extrabold text-slate-900">Access Denied to Admin Command Center</h1>
          <p className="text-slate-600 text-sm max-w-md mx-auto leading-relaxed">
            Your current active role <strong className="text-rose-700 font-bold">"{activeRole}"</strong> does not have administrative privileges required to access the portal.
          </p>
        </div>

        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs text-slate-600 text-left space-y-2">
          <div className="flex items-center gap-2 font-bold text-slate-800">
            <Lock className="w-4 h-4 text-amber-500" />
            <span>Role-Based Access Control (RBAC) Enforcement</span>
          </div>
          <p>
            An authorized staff account (Super Admin, Admin, Manager, Supplier, Warehouse, etc.) is required to access the Admin Portal.
          </p>
        </div>

        <div className="pt-4 border-t border-slate-100 flex items-center justify-center">
          <button
            onClick={() => setMode("storefront")}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center gap-2"
          >
            <Store className="w-4 h-4" />
            <span>Return to Customer Storefront</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-4">
      {/* Top Enterprise Breadcrumb & Utility Bar */}
      <div className="bg-white px-4 py-3 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Breadcrumbs Navigation */}
        <div className="flex items-center gap-2 text-xs font-medium text-slate-500 overflow-x-auto no-scrollbar py-0.5">
          <button
            onClick={() => setAdminView("dashboard")}
            className="flex items-center gap-1.5 text-slate-700 hover:text-indigo-600 font-bold shrink-0 transition-colors"
          >
            <Compass className="w-3.5 h-3.5 text-indigo-600" />
            <span>Command Center</span>
          </button>

          {breadcrumbInfo && adminView !== "dashboard" && (
            <>
              <ChevronRight className="w-3 h-3 text-slate-400 shrink-0" />
              <span className="text-slate-600 font-semibold shrink-0">
                {breadcrumbInfo.category.name}
              </span>
              <ChevronRight className="w-3 h-3 text-slate-400 shrink-0" />
              <span className="text-slate-500 shrink-0">
                {breadcrumbInfo.subcategory.name}
              </span>
              <ChevronRight className="w-3 h-3 text-slate-400 shrink-0" />
              <span className="text-indigo-600 font-bold bg-indigo-50 px-2 py-0.5 rounded-md shrink-0 border border-indigo-100">
                {breadcrumbInfo.feature.name}
              </span>
            </>
          )}
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setQuickSearchOpen(!quickSearchOpen)}
            className="text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-xl transition-colors flex items-center gap-1.5"
            title="Search all features"
          >
            <Search className="w-3.5 h-3.5 text-slate-500" />
            <span>Quick Launcher</span>
            <span className="hidden md:inline text-[10px] bg-white text-slate-500 px-1.5 py-0.2 rounded border border-slate-200">
              ⌘K
            </span>
          </button>

          {adminView !== "dashboard" && (
            <button
              onClick={() => setAdminView("dashboard")}
              className="text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 px-3 py-1.5 rounded-xl transition-colors flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Hub Overview</span>
            </button>
          )}

          <button
            onClick={() => setMode("storefront")}
            className="text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-xl transition-colors flex items-center gap-1.5"
            title="Switch to Storefront"
          >
            <Store className="w-3.5 h-3.5 text-indigo-600" />
            <span className="hidden sm:inline">Storefront</span>
          </button>

          <div className="text-[11px] font-bold text-slate-700 bg-slate-100 px-2.5 py-1.5 rounded-xl border border-slate-200 hidden sm:block">
            {activeRole}
          </div>
        </div>
      </div>

      {/* Quick Launcher Modal / Drawer (when quickSearchOpen is true) */}
      {quickSearchOpen && (
        <div className="bg-white p-4 rounded-2xl border border-indigo-200 shadow-md space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div className="flex items-center gap-2">
              <Compass className="w-4 h-4 text-indigo-600" />
              <span className="text-xs font-bold text-slate-900">Jump to Any Command Center Module</span>
            </div>
            <button
              onClick={() => setQuickSearchOpen(false)}
              className="text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={quickSearchQuery}
              onChange={(e) => setQuickSearchQuery(e.target.value)}
              placeholder="Type module name, keyword, or action..."
              autoFocus
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 max-h-64 overflow-y-auto custom-scrollbar pt-1">
            {quickSearchResults.map((feat) => {
              const Icon = feat.icon;
              return (
                <button
                  key={`quick-${feat.id}`}
                  onClick={() => {
                    setAdminView(feat.id);
                    setQuickSearchOpen(false);
                  }}
                  className="flex items-center gap-2.5 p-2.5 rounded-xl text-left border border-slate-100 bg-slate-50 hover:bg-indigo-50 hover:border-indigo-200 transition-colors group"
                >
                  <div className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-700 group-hover:bg-indigo-600 group-hover:text-white shrink-0">
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 truncate group-hover:text-indigo-600">
                      {feat.name}
                    </p>
                    <p className="text-[10px] text-slate-400 truncate">
                      {feat.categoryName}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Mobile Top Navigation Switcher (visible on lg:hidden) */}
      <div className="lg:hidden bg-[#0F172A] text-white p-3.5 rounded-2xl border border-slate-800 shadow-md">
        <button
          onClick={() => setMobileNavOpen(!mobileNavOpen)}
          className="w-full flex items-center justify-between font-bold text-xs"
        >
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-indigo-400 shrink-0" />
            <span className="text-white uppercase tracking-wider text-[11px] font-black truncate">
              {breadcrumbInfo ? breadcrumbInfo.feature.name : "Command Center"}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-300 bg-slate-800 px-2.5 py-1 rounded-xl text-[11px] shrink-0">
            <span>{mobileNavOpen ? "Close" : "Menu"}</span>
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${mobileNavOpen ? "rotate-180" : ""}`} />
          </div>
        </button>

        {mobileNavOpen && (
          <div className="mt-3 pt-3 border-t border-slate-800 space-y-3 max-h-[70vh] overflow-y-auto custom-scrollbar">
            {COMMAND_CENTER_CATEGORIES.map((category) => {
              const CatIcon = category.icon;
              return (
                <div key={`mob-cat-${category.id}`} className="space-y-1.5">
                  <div className="flex items-center gap-2 px-2 py-1 text-[11px] font-black text-indigo-400 uppercase tracking-wider">
                    <CatIcon className="w-3.5 h-3.5" />
                    <span>{category.name}</span>
                  </div>

                  {category.subcategories.map((subcat) => (
                    <div key={`mob-sub-${subcat.id}`} className="pl-2 space-y-1">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2">
                        {subcat.name}
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                        {subcat.features.map((feat) => {
                          if (!isFeatureAllowed(feat.module)) return null;
                          const FeatIcon = feat.icon;
                          const isActive = adminView === feat.id;

                          return (
                            <button
                              key={`mob-feat-${feat.id}`}
                              onClick={() => {
                                setAdminView(feat.id);
                                setMobileNavOpen(false);
                              }}
                              className={`flex items-center text-left transition-colors rounded-xl px-3 py-2 text-xs font-semibold ${
                                isActive
                                  ? "bg-indigo-600 text-white font-black shadow-xs"
                                  : "text-slate-300 hover:bg-slate-800"
                              }`}
                            >
                              <FeatIcon className="w-4 h-4 mr-2 shrink-0" />
                              <span className="truncate">{feat.name}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Desktop Enterprise Hierarchical Sidebar Nav */}
        <aside className="hidden lg:flex lg:col-span-3 bg-[#0F172A] p-4 rounded-2xl border border-slate-800 space-y-4 shadow-md flex-col justify-between sticky top-6">
          <div className="space-y-3">
            {/* Sidebar Header */}
            <div className="pb-3 border-b border-slate-800/80 px-2 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black uppercase text-indigo-400 tracking-wider block">
                  Admin Console
                </span>
                <span className="text-xs font-bold text-white">Role: {activeRole}</span>
              </div>
              <div className="flex items-center gap-1.5 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="text-[10px] text-emerald-400 font-bold">Online</span>
              </div>
            </div>

            {/* Hierarchical CATEGORY → SUBCATEGORY → FEATURE Navigation */}
            <nav className="space-y-3.5 max-h-[calc(100vh-210px)] overflow-y-auto pr-1 custom-scrollbar">
              {COMMAND_CENTER_CATEGORIES.map((category) => {
                const CatIcon = category.icon;
                const isCollapsed = !!collapsedCategories[category.id];

                // Calculate visible features under this category based on permissions
                const categoryVisibleFeatures = category.subcategories.flatMap((sub) =>
                  sub.features.filter((feat) => isFeatureAllowed(feat.module))
                );

                if (categoryVisibleFeatures.length === 0) return null;

                const hasActiveChild = categoryVisibleFeatures.some((f) => f.id === adminView);

                return (
                  <div
                    key={category.id}
                    className={`rounded-xl border transition-colors ${
                      hasActiveChild
                        ? "border-slate-700/80 bg-slate-900/60"
                        : "border-slate-800/40 bg-slate-900/20"
                    }`}
                  >
                    {/* CATEGORY HEADER TOGGLE */}
                    <button
                      onClick={() => toggleCategory(category.id)}
                      className="w-full flex items-center justify-between px-2.5 py-2 text-left rounded-xl hover:bg-slate-800/60 transition-colors group"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <CatIcon
                          className={`w-4 h-4 shrink-0 transition-colors ${
                            hasActiveChild ? "text-indigo-400" : "text-slate-400 group-hover:text-slate-200"
                          }`}
                        />
                        <span className="text-[11.5px] font-bold text-slate-200 truncate uppercase tracking-wider">
                          {category.name}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0 pl-1">
                        <span className="text-[9.5px] font-semibold px-1.5 py-0.2 bg-slate-800 text-slate-400 rounded-md">
                          {categoryVisibleFeatures.length}
                        </span>
                        <ChevronDown
                          className={`w-3.5 h-3.5 text-slate-500 transition-transform duration-150 ${
                            isCollapsed ? "-rotate-90" : ""
                          }`}
                        />
                      </div>
                    </button>

                    {/* SUBCATEGORIES & FEATURES (when category is expanded) */}
                    {!isCollapsed && (
                      <div className="px-2 pb-2 pt-1 space-y-2 border-t border-slate-800/60 mt-1">
                        {category.subcategories.map((subcat) => {
                          const subcatVisibleFeatures = subcat.features.filter((feat) =>
                            isFeatureAllowed(feat.module)
                          );

                          if (subcatVisibleFeatures.length === 0) return null;

                          return (
                            <div key={subcat.id} className="space-y-0.5">
                              {/* Subcategory Label */}
                              <div className="px-2 pt-1 pb-0.5">
                                <span className="text-[9.5px] font-bold uppercase tracking-wider text-slate-500 block">
                                  {subcat.name}
                                </span>
                              </div>

                              {/* Feature Items */}
                              <div className="space-y-0.5">
                                {subcatVisibleFeatures.map((feat) => {
                                  const FeatIcon = feat.icon;
                                  const isActive = adminView === feat.id;

                                  return (
                                    <button
                                      key={feat.id}
                                      onClick={() => setAdminView(feat.id)}
                                      title={feat.name}
                                      className={`w-full flex items-center text-left transition-all duration-150 rounded-lg px-2.5 py-1.5 min-h-[32px] group ${
                                        isActive
                                          ? "bg-indigo-600 text-white font-bold shadow-xs shadow-indigo-600/30"
                                          : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/70 font-medium"
                                      }`}
                                    >
                                      <span
                                        className={`w-1.5 h-1.5 rounded-full mr-2 shrink-0 transition-colors ${
                                          isActive
                                            ? "bg-white"
                                            : "bg-slate-600 group-hover:bg-slate-400"
                                        }`}
                                      />
                                      <FeatIcon
                                        className={`w-3.5 h-3.5 mr-2 shrink-0 transition-colors ${
                                          isActive
                                            ? "text-white"
                                            : "text-slate-400 group-hover:text-slate-200"
                                        }`}
                                      />
                                      <span className="text-[12px] truncate leading-none">
                                        {feat.name}
                                      </span>
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </nav>
          </div>

          {/* Admin User Profile Footprint */}
          <div className="pt-3 border-t border-slate-800/80">
            <div className="flex items-center justify-between gap-2.5 p-2 bg-slate-800/80 rounded-xl border border-slate-700/60">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-8 h-8 bg-indigo-500 text-white rounded-lg flex items-center justify-center font-black text-xs border border-white/20 shrink-0">
                  {currentUser.name ? currentUser.name.split(" ").map((n) => n[0]).join("").substring(0, 2).toUpperCase() : "AD"}
                </div>
                <div className="overflow-hidden text-left flex-1 min-w-0">
                  <p className="text-white text-xs font-bold truncate leading-tight">{currentUser.name || "Administrator"}</p>
                  <p className="text-slate-400 text-[10px] truncate leading-tight">{activeRole}</p>
                </div>
              </div>
              <button
                onClick={() => logoutUser()}
                className="p-1.5 text-rose-400 hover:text-rose-300 hover:bg-rose-500/20 rounded-lg transition-colors shrink-0"
                title="Sign Out / Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </aside>

        {/* Admin Content Column */}
        <main className="lg:col-span-9 min-w-0">
          {adminView === "dashboard" && <AdminDashboard />}
          {adminView === "products" && <ProductManagement />}
          {adminView === "categories" && <CategoryManagement />}
          {adminView === "inventory" && <InventoryManagement />}
          {adminView === "warehouse-movement" && <WarehouseMovementManagement />}
          {adminView === "orders" && <OrderManagement />}
          {adminView === "coupons" && <CouponManagement />}
          {adminView === "marketing" && <MarketingManagement />}
          {adminView === "seo-marketing" && <SEOMarketingManagement />}
          {adminView === "reports" && <ReportsAnalytics />}
          {adminView === "supplier-management" && <SupplierManagement />}
          {adminView === "company-cms" && <CompanyCMSManagement />}
          {adminView === "careers" && <CareersManagement />}
          {adminView === "legal-policies" && <LegalPoliciesManagement />}
          {adminView === "faq-kb" && <FAQManagement />}
          {adminView === "customer-support" && <CustomerSupportManagement />}
          {adminView === "roles" && <RoleManagement />}
          {adminView === "audit-logs" && <AuditLogView />}
          {adminView === "ai-assistant" && <AdminAIAssistant />}
          {adminView === "cms-security" && <SecurityLabelManagement />}
          {adminView === "website-profile" && <WebsiteProfileSettings />}
          {adminView === "settings" && (
            <div className="space-y-6">
              <SettingsCMS />
              <SecurityLabelManagement />
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

