import React from "react";
import { useStore } from "../../context/StoreContext";
import { t } from "../../utils/i18n";
import {
  Home,
  ShoppingBag,
  Sparkles,
  ShoppingCart,
  Smartphone,
  Globe,
  Heart,
  Package,
  User,
  Flame,
  Truck,
  Shield,
  Layers,
} from "lucide-react";

interface AndroidBottomNavProps {
  onOpenCart: () => void;
  onOpenAndroidAppModal: () => void;
}

export const AndroidBottomNav: React.FC<AndroidBottomNavProps> = ({
  onOpenCart,
  onOpenAndroidAppModal,
}) => {
  const {
    mode,
    setMode,
    storeView,
    setStoreView,
    adminView,
    setAdminView,
    cart,
    wishlist,
    language,
    setLanguage,
    addToast,
    currentUser,
    activeRole,
    settings,
  } = useStore();

  const isBN = language === "BN";
  const isAdmin = activeRole !== "Customer" && activeRole !== "Guest";

  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartSubtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const isHomeActive = mode === "storefront" && storeView === "home";
  const isShopActive = mode === "storefront" && storeView === "products";
  const isDealsActive = mode === "storefront" && storeView === "offer-details";
  const isProfileActive = mode === "storefront" && (storeView === "profile" || storeView === "orders");
  const isAIAgentActive = mode === "admin" && adminView === "ai-agent";

  // Provide light native vibration if supported on Android/iOS
  const triggerHaptic = (ms: number = 12) => {
    try {
      if (typeof window !== "undefined" && "vibrate" in navigator) {
        navigator.vibrate(ms);
      }
    } catch {
      // ignore
    }
  };

  const handleLanguageToggle = () => {
    triggerHaptic(20);
    const nextLang = language === "BN" ? "EN" : "BN";
    setLanguage(nextLang);
    addToast(
      nextLang === "BN"
        ? "ভাষা বাংলায় পরিবর্তিত হয়েছে"
        : "Language switched to English",
      "info"
    );
  };

  const handleCenterAction = () => {
    triggerHaptic(25);
    if (isAdmin) {
      setMode("admin");
      setAdminView("ai-agent");
      addToast(isBN ? "এআই বিজনেস এজেন্ট লোড হচ্ছে..." : "Loading AI Business Agent...", "info");
    } else {
      setMode("storefront");
      setStoreView("products");
      addToast(
        isBN
          ? "মেগা ডিসকাউন্ট ও স্পেশাল অফার লোড হচ্ছে!"
          : "Loading Hot Deals & Special Promotions!",
        "info"
      );
    }
  };

  return (
    <>
      {/* Smart Android Mini Quick Utility Bar (Fixed right above the bottom nav on mobile) */}
      <div className="fixed bottom-[calc(4.3rem+env(safe-area-inset-bottom,0px))] left-0 right-0 z-35 block md:hidden pointer-events-none px-3">
        <div className="flex items-center justify-between pointer-events-auto">
          {/* 1-Tap Language Toggle Pill (BN / EN) */}
          <button
            onClick={handleLanguageToggle}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900/95 text-white text-[11px] font-black backdrop-blur-md border border-slate-700/80 shadow-lg active:scale-95 transition-transform"
            title={language === "BN" ? "Switch to English" : "বাংলায় দেখুন"}
          >
            <Globe className="w-3.5 h-3.5 text-amber-400" />
            <span>{language === "BN" ? "🇧🇩 বাংলা" : "🇬🇧 English"}</span>
            <span className="text-[9px] px-1.5 py-0.2 rounded bg-indigo-600 text-white font-mono uppercase">
              {language === "BN" ? "EN" : "বাং"}
            </span>
          </button>

          {/* Quick Track Orders Pill */}
          <button
            onClick={() => {
              triggerHaptic(12);
              setMode("storefront");
              setStoreView("orders");
            }}
            className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-indigo-950/90 text-indigo-300 text-[11px] font-bold backdrop-blur-md border border-indigo-500/40 shadow-lg active:scale-95 transition-transform"
          >
            <Truck className="w-3.5 h-3.5 text-indigo-400" />
            <span>{isBN ? "অর্ডার ট্র্যাক" : "Track Order"}</span>
          </button>

          {/* Android App Quick Action Badge */}
          <button
            onClick={() => {
              triggerHaptic(15);
              onOpenAndroidAppModal();
            }}
            className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-emerald-950/90 text-emerald-300 text-[11px] font-extrabold backdrop-blur-md border border-emerald-500/40 shadow-lg active:scale-95 transition-transform"
          >
            <Smartphone className="w-3.5 h-3.5 text-emerald-400 animate-bounce" />
            <span>App Pro</span>
          </button>
        </div>
      </div>

      {/* Main Native-Feel Android Bottom Navigation Bar */}
      <nav
        aria-label="Mobile Bottom Navigation"
        className="fixed bottom-0 left-0 right-0 z-40 block md:hidden bg-slate-950/95 backdrop-blur-2xl border-t border-slate-800/80 shadow-2xl pb-[env(safe-area-inset-bottom,6px)] select-none"
      >
        <div className="grid grid-cols-5 items-center h-16 px-1">
          {/* 1. Home / হোম */}
          <button
            onClick={() => {
              triggerHaptic(10);
              setMode("storefront");
              setStoreView("home");
            }}
            className={`flex flex-col items-center justify-center py-1 transition-all ${
              isHomeActive
                ? "text-indigo-400 font-extrabold scale-105"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <div
              className={`p-1.5 rounded-xl transition-all ${
                isHomeActive ? "bg-indigo-500/20 shadow-xs" : ""
              }`}
            >
              <Home className="w-5 h-5" />
            </div>
            <span className="text-[10px] mt-0.5 tracking-tight font-bold">
              {t("nav_home", language)}
            </span>
          </button>

          {/* 2. Shop / শপ (Catalog) */}
          <button
            onClick={() => {
              triggerHaptic(10);
              setMode("storefront");
              setStoreView("products");
            }}
            className={`flex flex-col items-center justify-center py-1 transition-all ${
              isShopActive
                ? "text-indigo-400 font-extrabold scale-105"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <div
              className={`p-1.5 rounded-xl transition-all ${
                isShopActive ? "bg-indigo-500/20 shadow-xs" : ""
              }`}
            >
              <ShoppingBag className="w-5 h-5" />
            </div>
            <span className="text-[10px] mt-0.5 tracking-tight font-bold">
              {t("nav_shop", language)}
            </span>
          </button>

          {/* 3. Central Smart Button (Deals & AI / Hot Offers) */}
          <button
            onClick={handleCenterAction}
            className="flex flex-col items-center justify-center -mt-5 relative group"
            title={isAdmin ? "AI Business Agent" : "Hot Deals & AI Support"}
          >
            <div
              className={`w-13 h-13 rounded-2xl flex items-center justify-center shadow-xl transition-transform active:scale-90 border-2 border-slate-950 ${
                isAIAgentActive || isDealsActive
                  ? "bg-gradient-to-tr from-amber-500 via-rose-600 to-indigo-600 text-white shadow-rose-500/40 ring-2 ring-amber-400"
                  : "bg-gradient-to-tr from-indigo-600 via-indigo-700 to-purple-700 text-white shadow-indigo-500/40"
              }`}
            >
              {isAdmin ? (
                <Sparkles className="w-6 h-6 animate-pulse text-amber-300" />
              ) : (
                <Flame className="w-6 h-6 animate-pulse text-amber-300" />
              )}
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-400 rounded-full border-2 border-slate-950 animate-ping" />
            </div>
            <span
              className={`text-[10px] mt-1 font-black ${
                isAIAgentActive || isDealsActive ? "text-amber-400" : "text-slate-300"
              }`}
            >
              {isAdmin
                ? t("nav_ai_agent", language)
                : isBN
                ? "মেগা ডিল"
                : "Hot Deals"}
            </span>
          </button>

          {/* 4. Cart / কার্ট */}
          <button
            onClick={() => {
              triggerHaptic(12);
              onOpenCart();
            }}
            className="flex flex-col items-center justify-center py-1 text-slate-400 hover:text-slate-200 relative transition-all"
          >
            <div className="p-1.5 rounded-xl relative">
              <ShoppingCart className="w-5 h-5" />
              {totalCartCount > 0 && (
                <span className="absolute -top-1 -right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-600 text-white font-black text-[9px] flex items-center justify-center border-2 border-slate-950 shadow-xs animate-bounce">
                  {totalCartCount}
                </span>
              )}
            </div>
            <span className="text-[10px] mt-0.5 tracking-tight font-bold">
              {t("nav_cart", language)}
            </span>
          </button>

          {/* 5. Account / Profile (প্রোফাইল ও অর্ডার) */}
          <button
            onClick={() => {
              triggerHaptic(10);
              setMode("storefront");
              setStoreView("profile");
            }}
            className={`flex flex-col items-center justify-center py-1 transition-all ${
              isProfileActive
                ? "text-indigo-400 font-extrabold scale-105"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <div
              className={`p-1.5 rounded-xl transition-all ${
                isProfileActive ? "bg-indigo-500/20 shadow-xs" : ""
              }`}
            >
              {currentUser.name && currentUser.role !== "Guest" ? (
                <div className="w-5 h-5 rounded-full bg-indigo-600 text-white font-bold text-[10px] flex items-center justify-center">
                  {currentUser.name[0].toUpperCase()}
                </div>
              ) : (
                <User className="w-5 h-5" />
              )}
            </div>
            <span className="text-[10px] mt-0.5 tracking-tight font-bold">
              {isBN ? "প্রোফাইল" : "Profile"}
            </span>
          </button>
        </div>
      </nav>
    </>
  );
};
