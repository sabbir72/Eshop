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
  } = useStore();

  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const isAIAgentActive = mode === "admin" && adminView === "ai-agent";
  const isHomeActive = mode === "storefront" && storeView === "home";
  const isShopActive = mode === "storefront" && storeView === "products";
  const isWishlistActive = mode === "storefront" && storeView === "wishlist";

  // Provide light native vibration if supported on Android
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

  return (
    <>
      {/* Smart Android Mini Quick Utility Bar (Fixed right above the bottom nav on mobile) */}
      <div className="fixed bottom-[calc(4.1rem+env(safe-area-inset-bottom,0px))] left-0 right-0 z-35 block md:hidden pointer-events-none px-3">
        <div className="flex items-center justify-between pointer-events-auto">
          {/* 1-Tap Language Toggle Pill (BN / EN) */}
          <button
            onClick={handleLanguageToggle}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/90 text-white text-[11px] font-extrabold backdrop-blur-md border border-slate-700/80 shadow-lg active:scale-95 transition-transform"
            title={language === "BN" ? "Switch to English" : "বাংলায় দেখুন"}
          >
            <Globe className="w-3.5 h-3.5 text-amber-400" />
            <span>{language === "BN" ? "🇧🇩 বাংলা" : "🇬🇧 English"}</span>
            <span className="text-[9px] px-1 py-0.2 rounded bg-indigo-600/80 text-white font-mono uppercase">
              {language === "BN" ? "EN" : "বাং"}
            </span>
          </button>

          {/* Android App Quick Action Badge */}
          <button
            onClick={() => {
              triggerHaptic(15);
              onOpenAndroidAppModal();
            }}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/85 text-emerald-300 text-[11px] font-extrabold backdrop-blur-md border border-emerald-500/40 shadow-lg active:scale-95 transition-transform"
          >
            <Smartphone className="w-3.5 h-3.5 text-emerald-400 animate-bounce" />
            <span>Android Pro</span>
          </button>
        </div>
      </div>

      {/* Main Android Bottom Navigation Bar */}
      <nav
        aria-label="Android Bottom Navigation"
        className="fixed bottom-0 left-0 right-0 z-40 block md:hidden bg-slate-950/95 backdrop-blur-xl border-t border-slate-800/80 shadow-2xl pb-[env(safe-area-inset-bottom,4px)] select-none"
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
            <span className="text-[10px] mt-0.5 tracking-tight font-medium">
              {t("nav_home", language)}
            </span>
          </button>

          {/* 2. Shop / শপ */}
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
            <span className="text-[10px] mt-0.5 tracking-tight font-medium">
              {t("nav_shop", language)}
            </span>
          </button>

          {/* 3. AI Agent (Central Featured Smart Action) */}
          <button
            onClick={() => {
              triggerHaptic(25);
              setMode("admin");
              setAdminView("ai-agent");
            }}
            className="flex flex-col items-center justify-center -mt-4 relative group"
            title="AI Business Agent & Support"
          >
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-xl transition-transform active:scale-90 ${
                isAIAgentActive
                  ? "bg-gradient-to-tr from-emerald-500 to-indigo-600 text-white shadow-emerald-500/40 ring-2 ring-emerald-400/80"
                  : "bg-gradient-to-tr from-indigo-600 via-indigo-700 to-slate-900 text-white shadow-indigo-500/40"
              }`}
            >
              <Sparkles className="w-6 h-6 animate-pulse text-amber-300" />
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-400 rounded-full border-2 border-slate-950 animate-ping" />
            </div>
            <span
              className={`text-[10px] mt-1 font-black ${
                isAIAgentActive ? "text-emerald-400" : "text-slate-300"
              }`}
            >
              {t("nav_ai_agent", language)}
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
            <span className="text-[10px] mt-0.5 tracking-tight font-medium">
              {t("nav_cart", language)}
            </span>
          </button>

          {/* 5. Android App Hub / অ্যাপ হাব */}
          <button
            onClick={() => {
              triggerHaptic(15);
              onOpenAndroidAppModal();
            }}
            className="flex flex-col items-center justify-center py-1 text-emerald-400 hover:text-emerald-300 transition-all"
          >
            <div className="p-1.5 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              <Smartphone className="w-5 h-5" />
            </div>
            <span className="text-[10px] mt-0.5 text-emerald-400 font-bold tracking-tight">
              {t("nav_hub", language)}
            </span>
          </button>
        </div>
      </nav>
    </>
  );
};
