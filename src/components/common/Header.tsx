import React, { useState } from "react";
import { useStore } from "../../context/StoreContext";
import { UserRole } from "../../types";
import { t, translateDynamic } from "../../utils/i18n";
import { CategoryMegaMenu } from "../common/CategoryMegaMenu";
import {
  ShoppingBag,
  Search,
  Heart,
  GitCompare,
  User as UserIcon,
  LayoutDashboard,
  Store,
  Shield,
  ChevronDown,
  ChevronRight,
  Menu,
  X,
  Sparkles,
  Mic,
  Clock,
  TrendingUp,
  Globe,
  Flame,
  Gift,
  Tag,
  LogOut,
  Grid,
  Home as HomeIcon,
} from "lucide-react";

interface HeaderProps {
  onOpenCart: () => void;
  onOpenAIChat?: () => void;
  onOpenAuth: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenCart, onOpenAuth }) => {
  const {
    mode,
    setMode,
    storeView,
    setStoreView,
    activeRole,
    switchRole,
    logoutUser,
    currentUser,
    cart,
    wishlist,
    compareList,
    searchQuery,
    setSearchQuery,
    settings,
    updateSettings,
    products,
    categories,
    setSelectedCategoryId,
    setSelectedProduct,
    addToast,
    language,
    setLanguage,
  } = useStore();

  const [megaMenuOpen, setMegaMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileCategoriesOpen, setMobileCategoriesOpen] = useState(false);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [searchCategory, setSearchCategory] = useState<string>("all");

  const recentSearches = ["iPhone 15 Pro", "Wireless Earbuds", "Running Shoes", "Ergonomic Chair"];
  const popularSearches = ["MacBook", "Nike Air", "Smart Watch", "Noise Cancelling", "Denim Jacket"];

  const isAdminRole = activeRole !== "Customer" && activeRole !== "Guest";
  const isGuest = activeRole === "Guest";
  const isCustomer = activeRole === "Customer";

  // Search auto suggestions filtering
  const autoSuggestions = products
    .filter((p) => {
      if (p.status === "Draft" || p.status === "Archived") return false;
      if (searchQuery.trim().length < 2) return false;
      const q = searchQuery.toLowerCase();
      return (
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.brandName.toLowerCase().includes(q) ||
        p.categoryName.toLowerCase().includes(q)
      );
    })
    .slice(0, 5);

  const handleVoiceSearch = () => {
    if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = language === "BN" ? "bn-BD" : "en-US";

      setIsListening(true);
      addToast(language === "BN" ? "কথা শুনছি... বলুন!" : "Listening for speech... Speak now!", "info");

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setSearchQuery(transcript);
        setIsListening(false);
        setStoreView("products");
        addToast(`${language === "BN" ? "ভয়েস অনুসন্ধান" : "Voice search"}: "${transcript}"`, "success");
      };

      recognition.onerror = () => {
        setIsListening(false);
        addToast(language === "BN" ? "ভয়েস অনুসন্ধান ব্যর্থ হয়েছে।" : "Voice recognition failed.", "error");
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } else {
      setIsListening(true);
      setTimeout(() => {
        const sampleQuery = popularSearches[Math.floor(Math.random() * popularSearches.length)];
        setSearchQuery(sampleQuery);
        setIsListening(false);
        setStoreView("products");
        addToast(`Voice search simulated: "${sampleQuery}"`, "success");
      }, 1200);
    }
  };

  const rolesList: UserRole[] = [
    "Super Admin",
    "Admin",
    "Category Manager",
    "Product Manager",
    "Order Manager",
    "Inventory Manager",
    "Customer Support",
    "Customer",
    "Guest",
  ];

  const totalCartItems = cart.reduce((acc, item) => acc + item.quantity, 0);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === "storefront") {
      setStoreView("products");
    }
  };

  const handleModeSwitch = () => {
    if (mode === "storefront") {
      if (isCustomer || isGuest) {
        addToast("403 Forbidden: Customer & Guest roles cannot access Admin Portal.", "error");
        return;
      }
      setMode("admin");
      addToast(`Switched to Admin Command Center as ${activeRole}`, "success");
    } else {
      setMode("storefront");
      addToast("Switched to Storefront View", "info");
    }
  };

  const rootCategories = categories
    .filter((c) => !c.parentId && c.status === "Active")
    .sort((a, b) => (a.displayOrder || 99) - (b.displayOrder || 99));

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm">
      {/* Top Banner & Language / RBAC Bar */}
      {mode === "admin" || isAdminRole ? (
        <div className="bg-[#0F172A] text-slate-300 text-xs py-2 px-4 sm:px-8 flex flex-wrap items-center justify-between gap-2 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 bg-indigo-500/20 text-indigo-300 font-semibold px-2.5 py-0.5 rounded-full border border-indigo-500/30">
              <Shield className="w-3.5 h-3.5 text-indigo-400" /> RBAC Engine
            </span>
            <span className="hidden sm:inline text-slate-400">
              Logged User: <strong className="text-white font-semibold">{currentUser.name}</strong>
            </span>
            <span className="bg-indigo-900/60 text-indigo-300 text-[10px] font-bold px-2 py-0.5 rounded border border-indigo-700/50">
              {activeRole}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Language Switcher */}
            <div className="flex items-center gap-1 bg-slate-800 border border-slate-700 px-2.5 py-1 rounded-lg text-[11px]">
              <Globe className="w-3.5 h-3.5 text-amber-400" />
              <select
                value={language}
                onChange={(e) => {
                  setLanguage(e.target.value as any);
                  addToast(e.target.value === "EN" ? "Switched language to English" : "ভাষা পরিবর্তন করা হয়েছে বাংলা", "info");
                }}
                className="bg-transparent text-white focus:outline-none cursor-pointer font-bold"
              >
                <option value="EN" className="bg-slate-900 text-white">English (EN)</option>
                <option value="BN" className="bg-slate-900 text-white">বাংলা (BN)</option>
              </select>
            </div>

            {/* Currency Selector */}
            <div className="flex items-center gap-1 bg-slate-800 border border-slate-700 px-2.5 py-1 rounded-lg text-[11px]">
              <span className="text-amber-400 font-bold">{settings.currencySymbol}</span>
              <select
                value={settings.currency}
                onChange={(e) => {
                  const newCurr = e.target.value;
                  const newSym = newCurr === "BDT" ? "৳" : "$";
                  updateSettings({ currency: newCurr, currencySymbol: newSym });
                }}
                className="bg-transparent text-white focus:outline-none cursor-pointer font-bold"
              >
                <option value="BDT" className="bg-slate-900 text-white">BDT (৳)</option>
                <option value="USD" className="bg-slate-900 text-white">USD ($)</option>
              </select>
            </div>

            {/* Authenticated Role Badge */}
            {activeRole !== "Guest" && (
              <div className="flex items-center gap-1.5 bg-slate-800 text-slate-200 px-3 py-1 rounded-lg border border-slate-700 text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Role: <strong className="text-indigo-400">{activeRole}</strong></span>
              </div>
            )}

            <button
              onClick={handleModeSwitch}
              className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-3.5 py-1 rounded-lg text-xs shadow-xs transition-all"
            >
              {mode === "storefront" ? (
                <>
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  <span>{t("admin_center", language)}</span>
                </>
              ) : (
                <>
                  <Store className="w-3.5 h-3.5" />
                  <span>{t("storefront_view", language)}</span>
                </>
              )}
            </button>
          </div>
        </div>
      ) : (
        /* Customer Website Clean Top Bar */
        <div className="bg-slate-900 text-slate-300 text-xs py-1.5 px-4 sm:px-8 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-4 text-[11px] font-medium text-slate-300">
            <span>📞 {t("support_phone", language)}</span>
            <span className="hidden md:inline text-emerald-400 font-bold">⚡ {t("nationwide_delivery", language)}</span>
          </div>
          <div className="flex items-center gap-3">
            {/* Language Switcher */}
            <div className="flex items-center gap-1 bg-slate-800 border border-slate-700 px-2.5 py-0.5 rounded-md text-[11px]">
              <Globe className="w-3.5 h-3.5 text-amber-400" />
              <select
                value={language}
                onChange={(e) => {
                  setLanguage(e.target.value as any);
                  addToast(e.target.value === "EN" ? "Switched language to English" : "ভাষা পরিবর্তন করা হয়েছে বাংলা", "info");
                }}
                className="bg-transparent text-white focus:outline-none cursor-pointer font-bold"
              >
                <option value="EN" className="bg-slate-900 text-white">English (EN)</option>
                <option value="BN" className="bg-slate-900 text-white">বাংলা (BN)</option>
              </select>
            </div>

            {/* Currency Selector */}
            <div className="flex items-center gap-1 bg-slate-800 border border-slate-700 px-2 py-0.5 rounded text-[11px]">
              <span className="text-amber-400 font-bold">{settings.currencySymbol}</span>
              <select
                value={settings.currency}
                onChange={(e) => {
                  const newCurr = e.target.value;
                  const newSym = newCurr === "BDT" ? "৳" : "$";
                  updateSettings({ currency: newCurr, currencySymbol: newSym });
                }}
                className="bg-transparent text-white focus:outline-none cursor-pointer font-bold"
              >
                <option value="BDT" className="bg-slate-900 text-white">BDT (৳)</option>
                <option value="USD" className="bg-slate-900 text-white">USD ($)</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Main Brand & Search Bar Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <button
          onClick={() => {
            setMode("storefront");
            setStoreView("home");
          }}
          className="flex items-center gap-2.5 text-left group shrink-0"
        >
          {settings.logoUrl ? (
            <img
              src={settings.logoUrl}
              alt={settings.websiteName || "SmartShop"}
              className="h-10 max-w-[180px] object-contain group-hover:scale-105 transition-transform"
            />
          ) : (
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-700 to-indigo-500 text-white flex items-center justify-center font-black text-xl shadow-md shadow-indigo-200 group-hover:scale-105 transition-transform">
              {(settings.websiteName || "SmartShop").substring(0, 1).toUpperCase()}
            </div>
          )}
          <div>
            <span className="text-xl font-black text-slate-900 tracking-tight block leading-none">
              {settings.websiteName || "SmartShop"}
            </span>
            <span className="text-[10px] text-indigo-600 font-black tracking-wider uppercase">
              {settings.tagline || "Premium E-Commerce"}
            </span>
          </div>
        </button>

        {/* Global Search Bar */}
        {mode === "storefront" && (
          <div className="hidden md:flex flex-1 max-w-xl mx-4 relative">
            <form
              onSubmit={handleSearchSubmit}
              className="w-full relative flex items-center bg-slate-100 hover:bg-slate-100/90 rounded-full border border-slate-200 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:bg-white transition-all overflow-hidden shadow-xs"
            >
              {/* Category Dropdown Filter */}
              <select
                value={searchCategory}
                onChange={(e) => {
                  setSearchCategory(e.target.value);
                  if (e.target.value !== "all") {
                    setSelectedCategoryId(e.target.value);
                    setStoreView("products");
                  } else {
                    setSelectedCategoryId(null);
                  }
                }}
                className="bg-slate-200/70 hover:bg-slate-200 text-slate-800 text-[11px] font-extrabold pl-3 pr-2 py-2.5 focus:outline-none border-r border-slate-200 shrink-0 cursor-pointer"
              >
                <option value="all">{t("all_categories", language)}</option>
                {rootCategories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {translateDynamic(c.name, c.name_bn, language)}
                  </option>
                ))}
              </select>

              <div className="relative flex-1 flex items-center">
                <Search className="w-4 h-4 text-slate-400 absolute left-3" />
                <input
                  type="text"
                  value={searchQuery}
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t("search_placeholder", language)}
                  className="w-full bg-transparent text-slate-900 text-xs pl-9 pr-20 py-2.5 focus:outline-none font-medium"
                />

                <div className="absolute right-1 flex items-center gap-1">
                  <button
                    type="button"
                    onClick={handleVoiceSearch}
                    className={`p-1.5 rounded-full transition-colors ${
                      isListening ? "bg-rose-500 text-white animate-bounce" : "text-slate-400 hover:text-indigo-600 hover:bg-slate-200"
                    }`}
                    title="Voice Search"
                  >
                    <Mic className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="submit"
                    className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-3.5 py-1.5 rounded-full transition-colors"
                  >
                    {t("search_button", language)}
                  </button>
                </div>
              </div>
            </form>

            {/* Interactive Search Suggestions Popover */}
            {searchFocused && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-2xl shadow-2xl z-50 p-3 space-y-3 animate-fadeIn text-left text-xs">
                {searchQuery.trim().length > 0 && searchQuery.trim().length < 2 && (
                  <p className="text-[11px] text-amber-600 font-semibold bg-amber-50 p-2 rounded-xl">
                    ⚠️ Enter at least 2 characters to search.
                  </p>
                )}

                {searchQuery.trim().length >= 2 && (
                  <div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 px-1">
                      Matching Products ({autoSuggestions.length})
                    </div>
                    {autoSuggestions.length === 0 ? (
                      <p className="text-slate-500 py-2 text-center text-[11px]">{t("no_products_found", language)}</p>
                    ) : (
                      <div className="space-y-1">
                        {autoSuggestions.map((prod) => (
                          <button
                            key={prod.id}
                            onClick={() => {
                              setSelectedProduct(prod);
                              setStoreView("product-detail");
                              setSearchFocused(false);
                            }}
                            className="w-full flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-slate-50 transition-colors text-left"
                          >
                            <img
                              src={prod.mainImage}
                              alt={prod.name}
                              className="w-8 h-8 rounded-lg object-contain bg-slate-100 p-0.5 border shrink-0"
                            />
                            <div className="flex-1 overflow-hidden">
                              <p className="font-bold text-slate-900 truncate">
                                {translateDynamic(prod.name, prod.name_bn, language)}
                              </p>
                              <p className="text-[10px] text-slate-500 font-mono">
                                {prod.brandName} • SKU: {prod.sku}
                              </p>
                            </div>
                            <div className="text-right shrink-0">
                              <span className="font-bold text-indigo-600 block">
                                {settings.currencySymbol}{(prod.discountPrice || prod.sellingPrice).toLocaleString()}
                              </span>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Popular Searches */}
                <div>
                  <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 px-1">
                    <TrendingUp className="w-3 h-3 text-indigo-500" /> Popular Searches
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {popularSearches.map((term) => (
                      <button
                        key={term}
                        onClick={() => {
                          setSearchQuery(term);
                          setStoreView("products");
                          setSearchFocused(false);
                        }}
                        className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[11px] font-semibold px-2.5 py-1 rounded-lg transition-colors"
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons Header Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {mode === "storefront" && (
            <>
              {/* Wishlist Button */}
              {(isCustomer || isGuest) && (
                <button
                  onClick={() => setStoreView("wishlist")}
                  className={`relative p-2.5 rounded-xl transition-colors ${
                    storeView === "wishlist"
                      ? "bg-rose-100 text-rose-700 ring-1 ring-rose-200"
                      : "bg-rose-50/80 hover:bg-rose-100 text-rose-600 border border-rose-200/60"
                  }`}
                  title={t("wishlist", language)}
                >
                  <Heart className="w-5 h-5" />
                  {wishlist.length > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 bg-rose-600 text-white text-[10px] font-bold min-w-[18px] h-[18px] rounded-full flex items-center justify-center font-mono px-1 shadow-xs">
                      {wishlist.length}
                    </span>
                  )}
                </button>
              )}

              {/* Shopping Cart Button (Styled matching Wishlist) */}
              {(isGuest || isCustomer) && (
                <button
                  onClick={onOpenCart}
                  className="relative p-2.5 rounded-xl transition-colors bg-indigo-50/80 hover:bg-indigo-100 text-indigo-700 border border-indigo-200/60"
                  title={t("cart", language)}
                >
                  <ShoppingBag className="w-5 h-5" />
                  {totalCartItems > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 bg-indigo-600 text-white text-[10px] font-bold min-w-[18px] h-[18px] rounded-full flex items-center justify-center font-mono px-1 shadow-xs">
                      {totalCartItems}
                    </span>
                  )}
                </button>
              )}

              {/* Login / Register Button */}
              {isGuest && (
                <button
                  onClick={onOpenAuth}
                  className="bg-slate-900 hover:bg-indigo-600 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-sm transition-all flex items-center gap-1.5"
                >
                  <UserIcon className="w-4 h-4" />
                  <span>{t("login_register", language)}</span>
                </button>
              )}

              {/* User Account Menu */}
              {!isGuest && (
                <div className="relative">
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 p-2 sm:px-3 sm:py-2 rounded-xl border border-slate-200 transition-colors"
                  >
                    <div className="w-6 h-6 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-black text-[11px]">
                      {currentUser.name ? currentUser.name[0].toUpperCase() : "U"}
                    </div>
                    <span className="text-xs font-bold hidden sm:inline">{currentUser.name.split(" ")[0]}</span>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                  </button>

                  {userDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-2xl shadow-2xl py-2 z-50 text-xs">
                      <div className="px-4 py-2 border-b border-slate-100">
                        <p className="font-extrabold text-slate-900 truncate">{currentUser.name}</p>
                        <p className="text-[11px] text-indigo-600 font-semibold">{activeRole}</p>
                      </div>

                      <button
                        onClick={() => {
                          setStoreView("profile");
                          setUserDropdownOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center gap-2 text-slate-700 font-semibold"
                      >
                        <UserIcon className="w-4 h-4 text-slate-500" />
                        <span>{t("my_account", language)}</span>
                      </button>

                      <button
                        onClick={() => {
                          setStoreView("orders");
                          setUserDropdownOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center gap-2 text-slate-700 font-semibold"
                      >
                        <ShoppingBag className="w-4 h-4 text-slate-500" />
                        <span>{t("my_orders", language)}</span>
                      </button>

                      {isAdminRole && (
                        <button
                          onClick={() => {
                            setMode("admin");
                            setUserDropdownOpen(false);
                          }}
                          className="w-full text-left px-4 py-2 hover:bg-indigo-50 flex items-center gap-2 text-indigo-700 font-bold border-t border-slate-100"
                        >
                          <LayoutDashboard className="w-4 h-4 text-indigo-600" />
                          <span>{t("admin_center", language)}</span>
                        </button>
                      )}

                      <button
                        onClick={() => {
                          logoutUser();
                          setUserDropdownOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-rose-50 flex items-center gap-2 text-rose-600 font-bold border-t border-slate-100"
                      >
                        <LogOut className="w-4 h-4 text-rose-500" />
                        <span>{t("sign_out", language)}</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {/* Mobile Hamburger Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-slate-700 hover:bg-slate-100 rounded-xl"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Modern Navigation Menu Bar (Desktop/Tablet) */}
      {/* Contains ONLY: All Categories, Hot Offers, New Arrivals, Best Sellers, Gift Boxes */}
      {mode === "storefront" && (
        <nav className="bg-slate-900 text-white border-t border-slate-800 text-xs font-extrabold sticky top-0 z-30 shadow-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
            <div className="flex items-center space-x-2 py-2">
              {/* All Categories Mega Menu */}
              <CategoryMegaMenu
                isOpen={megaMenuOpen}
                onClose={() => setMegaMenuOpen(false)}
                onToggle={() => setMegaMenuOpen(!megaMenuOpen)}
              />

              {/* Hot Offers */}
              <button
                onClick={() => {
                  setSelectedCategoryId(null);
                  setSearchQuery("");
                  setStoreView("products");
                  addToast("Showing Hot Offers & Flash Deals!", "info");
                }}
                className={`px-3.5 py-2 rounded-xl flex items-center gap-1.5 font-extrabold transition-all duration-200 ${
                  storeView === "products" ? "bg-white/10 text-amber-400" : "text-slate-200 hover:text-white hover:bg-white/10"
                }`}
              >
                <Flame className="w-4 h-4 text-rose-500 animate-pulse" />
                <span>{t("hot_offers", language)}</span>
              </button>

              {/* New Arrivals */}
              <button
                onClick={() => {
                  setSelectedCategoryId(null);
                  setSearchQuery("");
                  setStoreView("products");
                  addToast("Showing New Arrivals!", "info");
                }}
                className="px-3.5 py-2 rounded-xl flex items-center gap-1.5 font-extrabold text-slate-200 hover:text-white hover:bg-white/10 transition-all duration-200"
              >
                <Tag className="w-4 h-4 text-emerald-400" />
                <span>{t("new_arrivals", language)}</span>
              </button>

              {/* Best Sellers */}
              <button
                onClick={() => {
                  setSelectedCategoryId(null);
                  setSearchQuery("");
                  setStoreView("products");
                  addToast("Showing Best Sellers!", "info");
                }}
                className="px-3.5 py-2 rounded-xl flex items-center gap-1.5 font-extrabold text-slate-200 hover:text-white hover:bg-white/10 transition-all duration-200"
              >
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>{t("best_sellers", language)}</span>
              </button>

              {/* Gift Boxes */}
              <button
                onClick={() => {
                  setSelectedCategoryId(null);
                  setSearchQuery("");
                  setStoreView("products");
                  addToast("Showing Gift Boxes & Combos!", "info");
                }}
                className="px-3.5 py-2 rounded-xl flex items-center gap-1.5 font-extrabold text-slate-200 hover:text-white hover:bg-white/10 transition-all duration-200"
              >
                <Gift className="w-4 h-4 text-purple-400" />
                <span>{t("gift_boxes", language)}</span>
              </button>
            </div>

            <div className="hidden lg:flex items-center space-x-4 text-slate-400 font-medium text-[11px]">
              <span className="flex items-center gap-1">
                <Tag className="w-3.5 h-3.5 text-amber-400" /> {t("promo_code", language)}: <strong className="text-white">WELCOME10</strong>
              </span>
            </div>
          </div>
        </nav>
      )}

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && mode === "storefront" && (
        <div className="md:hidden bg-white border-t border-slate-200 px-4 py-4 space-y-4 animate-in fade-in slide-in-from-top-2">
          {/* Mobile Search */}
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t("search_placeholder", language)}
              className="w-full bg-slate-100 text-xs pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 font-medium"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          </form>

          {/* User Account / Login Section in Mobile Drawer */}
          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
            {isGuest ? (
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-slate-200 text-slate-600 flex items-center justify-center font-bold">
                    <UserIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">Welcome Guest</p>
                    <p className="text-[10px] text-slate-500">Sign in to track orders</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenAuth();
                  }}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow-xs"
                >
                  {t("login_register", language)}
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black text-sm">
                      {currentUser.name ? currentUser.name[0].toUpperCase() : "U"}
                    </div>
                    <div>
                      <p className="text-xs font-black text-slate-900 truncate max-w-[140px]">{currentUser.name}</p>
                      <p className="text-[10px] text-indigo-600 font-bold">{activeRole}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      logoutUser();
                      setMobileMenuOpen(false);
                    }}
                    className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg text-xs font-bold flex items-center gap-1"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs font-bold pt-1">
                  <button
                    onClick={() => {
                      setStoreView("profile");
                      setMobileMenuOpen(false);
                    }}
                    className="flex items-center gap-1.5 p-2 bg-white rounded-xl border border-slate-200 text-slate-700 hover:text-indigo-600"
                  >
                    <UserIcon className="w-3.5 h-3.5 text-indigo-600" />
                    <span>My Profile</span>
                  </button>

                  <button
                    onClick={() => {
                      setStoreView("orders");
                      setMobileMenuOpen(false);
                    }}
                    className="flex items-center gap-1.5 p-2 bg-white rounded-xl border border-slate-200 text-slate-700 hover:text-indigo-600"
                  >
                    <ShoppingBag className="w-3.5 h-3.5 text-indigo-600" />
                    <span>My Orders</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Navigation Links Accordion */}
          <div className="flex flex-col gap-1 text-xs font-bold text-slate-800">
            {/* All Categories Accordion */}
            <div className="border-b border-slate-100 py-2">
              <button
                onClick={() => setMobileCategoriesOpen(!mobileCategoriesOpen)}
                className="w-full flex items-center justify-between font-extrabold text-indigo-700"
              >
                <span className="flex items-center gap-2">
                  <Grid className="w-4 h-4 text-indigo-600" />
                  <span>{t("all_categories", language)}</span>
                </span>
                <ChevronDown className={`w-4 h-4 transition-transform ${mobileCategoriesOpen ? "rotate-180" : ""}`} />
              </button>

              {mobileCategoriesOpen && (
                <div className="mt-2 pl-4 space-y-2 py-2 bg-slate-50 rounded-xl">
                  {rootCategories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => {
                        setSelectedCategoryId(cat.id);
                        setStoreView("products");
                        setMobileMenuOpen(false);
                      }}
                      className="w-full text-left py-1 text-xs font-bold text-slate-700 hover:text-indigo-600 flex items-center justify-between"
                    >
                      <span>{translateDynamic(cat.name, cat.name_bn, language)}</span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                    </button>
                  ))}
                  <button
                    onClick={() => {
                      setStoreView("categories");
                      setMobileMenuOpen(false);
                    }}
                    className="w-full text-left py-1.5 text-xs font-black text-indigo-600 pt-2 border-t border-slate-200"
                  >
                    {t("view_all_categories", language)} →
                  </button>
                </div>
              )}
            </div>

            {/* Hot Offers */}
            <button
              onClick={() => {
                setSelectedCategoryId(null);
                setStoreView("products");
                setMobileMenuOpen(false);
              }}
              className="text-left py-2.5 border-b border-slate-100 flex items-center gap-2 text-rose-600 font-extrabold"
            >
              <Flame className="w-4 h-4" />
              <span>{t("hot_offers", language)}</span>
            </button>

            {/* New Arrivals */}
            <button
              onClick={() => {
                setSelectedCategoryId(null);
                setStoreView("products");
                setMobileMenuOpen(false);
              }}
              className="text-left py-2.5 border-b border-slate-100 flex items-center gap-2 text-emerald-600 font-extrabold"
            >
              <Tag className="w-4 h-4" />
              <span>{t("new_arrivals", language)}</span>
            </button>

            {/* Best Sellers */}
            <button
              onClick={() => {
                setSelectedCategoryId(null);
                setStoreView("products");
                setMobileMenuOpen(false);
              }}
              className="text-left py-2.5 border-b border-slate-100 flex items-center gap-2 text-amber-600 font-extrabold"
            >
              <Sparkles className="w-4 h-4" />
              <span>{t("best_sellers", language)}</span>
            </button>

            {/* Gift Boxes */}
            <button
              onClick={() => {
                setSelectedCategoryId(null);
                setStoreView("products");
                setMobileMenuOpen(false);
              }}
              className="text-left py-2.5 border-b border-slate-100 flex items-center gap-2 text-purple-600 font-extrabold"
            >
              <Gift className="w-4 h-4" />
              <span>{t("gift_boxes", language)}</span>
            </button>
          </div>
        </div>
      )}

      {/* Sticky Mobile Bottom Navigation Bar */}
      {mode === "storefront" && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-2 py-1.5 flex items-center justify-around shadow-2xl text-[10px] font-bold text-slate-600">
          <button
            onClick={() => setStoreView("home")}
            className={`flex flex-col items-center gap-1 p-1.5 rounded-xl transition-colors ${
              storeView === "home" ? "text-indigo-600 font-black" : "hover:text-indigo-600"
            }`}
          >
            <HomeIcon className="w-5 h-5" />
            <span>Home</span>
          </button>

          <button
            onClick={() => setStoreView("categories")}
            className={`flex flex-col items-center gap-1 p-1.5 rounded-xl transition-colors ${
              storeView === "categories" ? "text-indigo-600 font-black" : "hover:text-indigo-600"
            }`}
          >
            <Grid className="w-5 h-5" />
            <span>Categories</span>
          </button>

          <button
            onClick={() => setStoreView("products")}
            className={`flex flex-col items-center gap-1 p-1.5 rounded-xl transition-colors ${
              storeView === "products" ? "text-indigo-600 font-black" : "hover:text-indigo-600"
            }`}
          >
            <Tag className="w-5 h-5" />
            <span>Deals</span>
          </button>

          <button
            onClick={() => setStoreView("wishlist")}
            className={`flex flex-col items-center gap-1 p-1.5 rounded-xl relative transition-colors ${
              storeView === "wishlist" ? "text-indigo-600 font-black" : "hover:text-indigo-600"
            }`}
          >
            <Heart className="w-5 h-5" />
            <span>Wishlist</span>
            {wishlist.length > 0 && (
              <span className="absolute top-1 right-2 bg-rose-600 text-white text-[9px] font-bold w-3.5 h-3.5 rounded-full flex items-center justify-center font-mono">
                {wishlist.length}
              </span>
            )}
          </button>

          <button
            onClick={onOpenCart}
            className="flex flex-col items-center gap-1 p-1.5 rounded-xl relative text-slate-700 hover:text-indigo-600 transition-colors"
          >
            <ShoppingBag className="w-5 h-5 text-indigo-600" />
            <span>Cart</span>
            {totalCartItems > 0 && (
              <span className="absolute top-1 right-2 bg-indigo-600 text-white text-[9px] font-black px-1 rounded-full font-mono">
                {totalCartItems}
              </span>
            )}
          </button>

          {/* Account / Login Tab */}
          {isGuest ? (
            <button
              onClick={onOpenAuth}
              className="flex flex-col items-center gap-1 p-1.5 rounded-xl text-slate-700 hover:text-indigo-600 transition-colors"
            >
              <UserIcon className="w-5 h-5" />
              <span>Login</span>
            </button>
          ) : (
            <button
              onClick={() => setStoreView("profile")}
              className={`flex flex-col items-center gap-1 p-1.5 rounded-xl transition-colors ${
                storeView === "profile" ? "text-indigo-600 font-black" : "hover:text-indigo-600"
              }`}
            >
              <UserIcon className="w-5 h-5" />
              <span>Account</span>
            </button>
          )}
        </div>
      )}
    </header>
  );
};
