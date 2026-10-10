import React from "react";
import { useStore } from "../../context/StoreContext";
import {
  Home,
  ShoppingBag,
  Sparkles,
  ShoppingCart,
  LayoutDashboard,
  Smartphone,
} from "lucide-react";

interface AndroidBottomNavProps {
  onOpenCart: () => void;
  onOpenAndroidAppModal: () => void;
}

export const AndroidBottomNav: React.FC<AndroidBottomNavProps> = ({
  onOpenCart,
  onOpenAndroidAppModal,
}) => {
  const { mode, setMode, storeView, setStoreView, adminView, setAdminView, cart, activeRole } =
    useStore();

  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const isAIAgentActive = mode === "admin" && adminView === "ai-agent";
  const isHomeActive = mode === "storefront" && storeView === "home";
  const isShopActive = mode === "storefront" && storeView === "products";
  const isAdminActive = mode === "admin" && adminView !== "ai-agent";

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 block md:hidden bg-slate-950/92 backdrop-blur-xl border-t border-slate-800/80 shadow-2xl pb-[env(safe-area-inset-bottom,4px)]">
      <div className="grid grid-cols-5 items-center h-16 px-1">
        {/* 1. Home */}
        <button
          onClick={() => {
            setMode("storefront");
            setStoreView("home");
          }}
          className={`flex flex-col items-center justify-center py-1 transition-all ${
            isHomeActive ? "text-indigo-400 font-bold" : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <div
            className={`p-1.5 rounded-xl transition ${
              isHomeActive ? "bg-indigo-500/20 shadow-xs" : ""
            }`}
          >
            <Home className="w-5 h-5" />
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight">হোম</span>
        </button>

        {/* 2. Shop / Products */}
        <button
          onClick={() => {
            setMode("storefront");
            setStoreView("products");
          }}
          className={`flex flex-col items-center justify-center py-1 transition-all ${
            isShopActive ? "text-indigo-400 font-bold" : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <div
            className={`p-1.5 rounded-xl transition ${
              isShopActive ? "bg-indigo-500/20 shadow-xs" : ""
            }`}
          >
            <ShoppingBag className="w-5 h-5" />
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight">শপ</span>
        </button>

        {/* 3. AI Agent (Central Featured Action) */}
        <button
          onClick={() => {
            setMode("admin");
            setAdminView("ai-agent");
          }}
          className="flex flex-col items-center justify-center -mt-4 relative group"
        >
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transition-transform active:scale-95 ${
              isAIAgentActive
                ? "bg-gradient-to-tr from-emerald-500 to-indigo-600 text-white shadow-emerald-500/30 ring-2 ring-emerald-400/50"
                : "bg-gradient-to-tr from-indigo-600 via-indigo-700 to-slate-900 text-white shadow-indigo-500/30"
            }`}
          >
            <Sparkles className="w-6 h-6 animate-pulse text-amber-300" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full border-2 border-slate-950 animate-ping" />
          </div>
          <span
            className={`text-[10px] mt-1 font-bold ${
              isAIAgentActive ? "text-emerald-400" : "text-slate-300"
            }`}
          >
            AI এজেন্ট
          </span>
        </button>

        {/* 4. Cart */}
        <button
          onClick={onOpenCart}
          className="flex flex-col items-center justify-center py-1 text-slate-400 hover:text-slate-200 relative transition-all"
        >
          <div className="p-1.5 rounded-xl relative">
            <ShoppingCart className="w-5 h-5" />
            {totalCartCount > 0 && (
              <span className="absolute -top-1 -right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-600 text-white font-black text-[9px] flex items-center justify-center border-2 border-slate-950 shadow-xs">
                {totalCartCount}
              </span>
            )}
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight">কার্ট</span>
        </button>

        {/* 5. Android App Hub / Admin Panel */}
        <button
          onClick={onOpenAndroidAppModal}
          className="flex flex-col items-center justify-center py-1 text-slate-400 hover:text-emerald-400 transition-all"
        >
          <div className="p-1.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Smartphone className="w-5 h-5" />
          </div>
          <span className="text-[10px] mt-0.5 text-emerald-400 font-bold tracking-tight">
            অ্যাপ হাব
          </span>
        </button>
      </div>
    </nav>
  );
};
