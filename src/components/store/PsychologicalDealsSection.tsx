import React, { useState } from "react";
import { useStore } from "../../context/StoreContext";
import { Product, PsychologicalCampaign } from "../../types";
import {
  ShoppingBag,
  Gift,
  Flame,
  ArrowRight,
  Truck,
  Check,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

interface PsychologicalDealsSectionProps {
  onQuickView?: (product: Product) => void;
}

export const PsychologicalDealsSection: React.FC<PsychologicalDealsSectionProps> = ({
  onQuickView,
}) => {
  const {
    products,
    psychologicalCampaigns = [],
    addToCart,
    addToast,
    setStoreView,
  } = useStore();

  // ONLY campaigns that are Active in the backend are displayed
  const activeCampaigns = psychologicalCampaigns.filter((c) => c.isActive);

  // If no campaign is active in backend, hide the section completely
  if (activeCampaigns.length === 0) {
    return null;
  }

  // Active campaign index (if multiple are active)
  const [activeIdx, setActiveIdx] = useState(0);

  // Ensure valid index
  const safeIdx = Math.min(activeIdx, activeCampaigns.length - 1);
  const currentCampaign: PsychologicalCampaign = activeCampaigns[safeIdx] || activeCampaigns[0];

  // Find product associated with the campaign
  const targetProduct =
    products.find((p) => p.id === currentCampaign.productId) ||
    products.find((p) => p.name === currentCampaign.productName) ||
    products.find((p) => p.name.includes("iPhone 15 Pro Max")) ||
    products[0];

  if (!targetProduct) return null;

  const productImage =
    currentCampaign.productImage ||
    targetProduct.mainImage ||
    targetProduct.images?.[0] ||
    "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400&q=80";

  // Triad Calculations
  const triadConfig = currentCampaign.triadConfig || {
    tier1Qty: 1,
    tier1Price: currentCampaign.basePrice,
    tier2Qty: 2,
    tier2Price: Math.round(currentCampaign.basePrice * 2 * 0.88),
    tier2Savings: Math.round(currentCampaign.basePrice * 2 * 0.12),
    tier2Discount: 12,
    tier3Qty: 3,
    tier3Price: Math.round(currentCampaign.basePrice * 3 * 0.75),
    tier3Savings: Math.round(currentCampaign.basePrice * 3 * 0.25),
    tier3Discount: 25,
  };

  const pack1Price = triadConfig.tier1Price;
  const pack2Original = currentCampaign.basePrice * triadConfig.tier2Qty;
  const pack2Price = triadConfig.tier2Price;
  const pack2Savings = triadConfig.tier2Savings;

  const pack3Original = currentCampaign.basePrice * triadConfig.tier3Qty;
  const pack3Price = triadConfig.tier3Price;
  const pack3Savings = triadConfig.tier3Savings;

  // Contrast Calculations
  const contrastConfig = currentCampaign.contrastConfig || {
    competitorPrice: Math.round(currentCampaign.basePrice * 1.25),
    ourPrice: currentCampaign.basePrice,
    savings: Math.round(currentCampaign.basePrice * 0.25),
    savingsPercent: 20,
    ourHighlight: "১০০% অফিসিয়াল ওয়ারেন্টি ও ওপেন-বক্স ক্যাশ অন ডেলিভারি",
    competitorNote: "অজানা ওয়ারেন্টি, হিডেন ডেলিভারি চার্জ ও অগ্রিম পেমেন্টের ঝুঁকি",
  };

  // Anchoring Calculations
  const anchorConfig = currentCampaign.anchorConfig || {
    anchorPrice: Math.round(currentCampaign.basePrice * 1.35),
    sellingPrice: currentCampaign.basePrice,
    savings: Math.round(currentCampaign.basePrice * 0.35),
    savingsPercent: 26,
    dailyCost: Math.max(1, Math.round(currentCampaign.basePrice / 365)),
    hookText: "প্রতিদিন মাত্র এক কাপ চায়ের খরচে প্রিমিয়াম কোয়ালিটি সার্ভিস!",
  };

  // Selected Option inside the current comparison photo card (default to best value / tier 2)
  const [selectedOption, setSelectedOption] = useState<number>(2);

  // Directly navigate to purchase / checkout
  const handleProceedToPurchase = (qty: number, title: string, price: number) => {
    addToCart(targetProduct, undefined, undefined, qty);
    addToast(`${title} যোগ করা হয়েছে। সরাসরি চেকআউটে নিয়ে যাওয়া হচ্ছে...`, "success");
    setStoreView("checkout");
  };

  // Add to cart without checkout
  const handleAddToCartOnly = (qty: number, title: string) => {
    addToCart(targetProduct, undefined, undefined, qty);
    addToast(`${title} সফলভাবে কার্টে যোগ হয়েছে!`, "success");
  };

  // Next / Prev campaign controls if multiple active in backend
  const handleNext = () => {
    setActiveIdx((prev) => (prev + 1) % activeCampaigns.length);
  };
  const handlePrev = () => {
    setActiveIdx((prev) => (prev - 1 + activeCampaigns.length) % activeCampaigns.length);
  };

  return (
    <section className="relative w-full text-left my-4">
      {/* SECTION HEADER: Purely "স্পেশাল অফার" */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <span className="p-1.5 bg-rose-500/10 text-rose-600 rounded-xl border border-rose-500/20">
            <Flame className="w-4 h-4 fill-rose-500" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                স্পেশাল অফার (Special Offer)
              </h3>
              <span className="bg-rose-100 text-rose-800 text-[10px] font-black uppercase px-2 py-0.5 rounded-full">
                সীমিত সময়
              </span>
            </div>
            <p className="text-xs text-slate-500">
              সর্বোচ্চ সাশ্রয়ে প্রিমিয়াম প্যাকেজ ও অফিশিয়াল ভ্যালু ডিল
            </p>
          </div>
        </div>

        {/* Multi-campaign indicators (clean dots and arrows - NO strategy names) */}
        {activeCampaigns.length > 1 && (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              {activeCampaigns.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setActiveIdx(i)}
                  className={`h-2 rounded-full transition-all cursor-pointer ${
                    i === safeIdx ? "w-6 bg-indigo-600" : "w-2 bg-slate-200 hover:bg-slate-300"
                  }`}
                  aria-label={`Offer ${i + 1}`}
                />
              ))}
            </div>
            <div className="flex items-center gap-1 border border-slate-200 rounded-xl p-0.5 bg-white shadow-2xs">
              <button
                type="button"
                onClick={handlePrev}
                className="p-1 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition cursor-pointer"
                aria-label="Previous Offer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="p-1 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition cursor-pointer"
                aria-label="Next Offer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ----------------------------------------------------------------- */}
      {/* THE COMPARISON PHOTO CARD (কম্পারিজন ফটো কার্ড) */}
      {/* ----------------------------------------------------------------- */}
      <div className="bg-[#0b0f22] rounded-3xl p-4 sm:p-6 lg:p-7 border border-indigo-950 shadow-2xl relative overflow-hidden space-y-6">
        {/* Subtle background ambiance */}
        <div className="absolute top-0 right-1/4 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* 1. STRATEGY: ROUND OF THREE COMPARISON CARDS */}
        {currentCampaign.strategy === "round-of-three" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-5 items-stretch relative z-10">
            {/* OPTION 1: 1 PACK */}
            <div
              onClick={() => setSelectedOption(1)}
              className={`group rounded-2xl p-4 sm:p-5 flex flex-col justify-between space-y-4 transition-all duration-200 cursor-pointer shadow-lg ${
                selectedOption === 1
                  ? "bg-[#161d38] border-2 border-indigo-500 ring-2 ring-indigo-500/20"
                  : "bg-[#11172d]/95 hover:bg-[#151c38] border border-slate-800"
              }`}
            >
              <div className="space-y-3">
                <span className="text-xs font-semibold text-slate-400 block">
                  সিঙ্গেল ট্রায়াল প্যাক (১টি)
                </span>

                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-xl bg-[#0c1022] p-1.5 border border-slate-800 shrink-0 flex items-center justify-center overflow-hidden">
                    <img
                      src={productImage}
                      alt={targetProduct.name}
                      className="w-full h-full object-contain group-hover:scale-105 transition-transform"
                      onError={(e) => {
                        e.currentTarget.src =
                          "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400&q=80";
                      }}
                    />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-bold text-white text-xs sm:text-sm line-clamp-1 leading-snug">
                      {targetProduct.name}
                    </h4>
                    <div className="text-lg sm:text-xl font-black text-white font-mono mt-0.5">
                      ৳{pack1Price.toLocaleString()}
                    </div>
                  </div>
                </div>

                <p className="text-[11px] text-slate-400 leading-relaxed pt-1">
                  একটি পণ্য নিয়ে কোয়ালিটি যাচাই করার জন্য স্ট্যান্ডার্ড অপশন।
                </p>
              </div>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedOption(1);
                  handleProceedToPurchase(1, "সিঙ্গেল ট্রায়াল প্যাক (১টি)", pack1Price);
                }}
                className={`w-full py-3 px-4 text-xs font-bold rounded-xl border flex items-center justify-center gap-2 transition cursor-pointer active:scale-98 ${
                  selectedOption === 1
                    ? "bg-indigo-600 text-white border-indigo-500"
                    : "bg-[#1a233f] hover:bg-[#232f55] text-white border-slate-700/80"
                }`}
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>১টি নিন — ৳{pack1Price.toLocaleString()}</span>
              </button>
            </div>

            {/* OPTION 2: 2 PACK (HERO) */}
            <div
              onClick={() => setSelectedOption(2)}
              className={`group rounded-2xl p-4 sm:p-5 flex flex-col justify-between space-y-4 transition-all duration-200 cursor-pointer shadow-xl relative transform md:-translate-y-1.5 ${
                selectedOption === 2
                  ? "bg-[#161f48] border-2 border-[#5249f0] ring-2 ring-indigo-500/40 shadow-indigo-950/80"
                  : "bg-[#13193c]/95 hover:bg-[#171e47] border-2 border-indigo-600/70"
              }`}
            >
              {/* Floating Badge */}
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#5249f0] text-white text-[11px] font-black uppercase tracking-wider px-3.5 py-0.5 rounded-full shadow-lg border border-indigo-300/40 flex items-center gap-1.5 whitespace-nowrap z-20">
                <Flame className="w-3 h-3 text-amber-300 fill-amber-300" />
                <span>{currentCampaign.badge || "মোস্ট পপুলার চয়েস"}</span>
              </div>

              <div className="space-y-3 pt-1">
                <span className="text-xs font-semibold text-indigo-300 block">
                  ডাবল প্যাক সেভার (২টি)
                </span>

                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-xl bg-[#0c1022] p-1.5 border border-indigo-900/60 shrink-0 flex items-center justify-center overflow-hidden">
                    <img
                      src={productImage}
                      alt={targetProduct.name}
                      className="w-full h-full object-contain group-hover:scale-105 transition-transform"
                      onError={(e) => {
                        e.currentTarget.src =
                          "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400&q=80";
                      }}
                    />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-bold text-white text-xs sm:text-sm line-clamp-1 leading-snug">
                      {targetProduct.name}
                    </h4>
                    <div className="flex items-baseline gap-2 mt-0.5">
                      <span className="text-lg sm:text-xl font-black text-[#60a5fa] font-mono">
                        ৳{pack2Price.toLocaleString()}
                      </span>
                      <span className="text-xs text-slate-400 line-through font-mono">
                        ৳{pack2Original.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-[#0b102b] border border-indigo-900/80 rounded-xl px-3 py-2 flex items-center justify-between text-xs">
                  <span className="text-[#34d399] font-bold text-[11px]">
                    {triadConfig.tier2Discount}% ইনস্ট্যান্ট ডিসকাউন্ট
                  </span>
                  <span className="text-emerald-300 font-mono font-bold text-[11px]">
                    সাশ্রয় ৳{pack2Savings.toLocaleString()}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedOption(2);
                  handleProceedToPurchase(2, "ডাবল প্যাক সেভার (২টি)", pack2Price);
                }}
                className="w-full py-3 px-4 bg-[#5249f0] hover:bg-[#4338ca] text-white font-black text-xs rounded-xl shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition cursor-pointer active:scale-98"
              >
                <ShoppingBag className="w-3.5 h-3.5 text-white" />
                <span>২টি নিন — ৳{pack2Price.toLocaleString()}</span>
              </button>
            </div>

            {/* OPTION 3: 3 PACK */}
            <div
              onClick={() => setSelectedOption(3)}
              className={`group rounded-2xl p-4 sm:p-5 flex flex-col justify-between space-y-4 transition-all duration-200 cursor-pointer shadow-xl relative ${
                selectedOption === 3
                  ? "bg-[#211848] border-2 border-[#8b5cf6] ring-2 ring-purple-500/40"
                  : "bg-[#181335]/95 hover:bg-[#1d1740] border-2 border-purple-800/80"
              }`}
            >
              <div className="absolute top-3.5 right-3.5 bg-[#451a03]/90 text-[#fbbf24] border border-amber-600/50 text-[10px] font-black px-2.5 py-0.5 rounded-full font-mono">
                {triadConfig.tier3Discount}% অফ
              </div>

              <div className="space-y-3">
                <span className="text-xs font-semibold text-purple-300 block">
                  মেগা ট্রায়াড প্যাক (৩টি)
                </span>

                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-xl bg-[#0c1022] p-1.5 border border-purple-900/60 shrink-0 flex items-center justify-center overflow-hidden">
                    <img
                      src={productImage}
                      alt={targetProduct.name}
                      className="w-full h-full object-contain group-hover:scale-105 transition-transform"
                      onError={(e) => {
                        e.currentTarget.src =
                          "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400&q=80";
                      }}
                    />
                  </div>
                  <div className="min-w-0 pr-8">
                    <h4 className="font-bold text-white text-xs sm:text-sm line-clamp-1 leading-snug">
                      {targetProduct.name}
                    </h4>
                    <div className="flex items-baseline gap-2 mt-0.5">
                      <span className="text-lg sm:text-xl font-black text-white font-mono">
                        ৳{pack3Price.toLocaleString()}
                      </span>
                      <span className="text-xs text-slate-400 line-through font-mono">
                        ৳{pack3Original.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-[#120c2b] border border-purple-900/80 rounded-xl px-3 py-2 flex items-center justify-between text-xs">
                  <span className="text-[#38bdf8] font-mono font-bold text-[11px]">
                    সাশ্রয় ৳{pack3Savings.toLocaleString()}
                  </span>
                  <span className="text-[#34d399] font-bold text-[11px] flex items-center gap-1">
                    + ফ্রি ডেলিভারি
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedOption(3);
                  handleProceedToPurchase(3, "মেগা ট্রায়াড প্যাক (৩টি)", pack3Price);
                }}
                className="w-full py-3 px-4 bg-[#7c3aed] hover:bg-[#6d28d9] text-white font-black text-xs rounded-xl shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2 transition cursor-pointer active:scale-98"
              >
                <Gift className="w-3.5 h-3.5 text-white" />
                <span>৩-প্যাক নিন — ৳{pack3Price.toLocaleString()}</span>
              </button>
            </div>
          </div>
        )}

        {/* 2. STRATEGY: CONTRAST COMPARISON CARDS */}
        {currentCampaign.strategy === "contrast-effect" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6 items-stretch relative z-10">
            {/* Box 1: সাধারণ বাজার দর */}
            <div className="bg-[#101426] rounded-2xl border border-slate-800 p-5 space-y-4 flex flex-col justify-between opacity-80">
              <div className="space-y-3">
                <span className="text-xs font-semibold text-slate-400 block">
                  সাধারণ বাজার দর (Local Market Price)
                </span>
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-xl bg-slate-900 p-1.5 border border-slate-800 shrink-0 flex items-center justify-center overflow-hidden">
                    <img
                      src={productImage}
                      alt={targetProduct.name}
                      className="w-full h-full object-contain opacity-75"
                    />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-300 text-sm line-clamp-1">
                      {targetProduct.name}
                    </h4>
                    <div className="text-xl font-bold text-slate-400 font-mono mt-0.5 line-through">
                      ৳{contrastConfig.competitorPrice.toLocaleString()}
                    </div>
                  </div>
                </div>

                <p className="text-xs text-rose-300/80 bg-rose-950/40 p-3 rounded-xl border border-rose-900/40 leading-relaxed">
                  ⚠️ {contrastConfig.competitorNote}
                </p>
              </div>

              <div className="py-2.5 text-center text-xs font-bold text-slate-500 bg-slate-900/60 rounded-xl border border-slate-800">
                তুলনামূলক বাজার মূল্য
              </div>
            </div>

            {/* Box 2: আমাদের অফিশিয়াল স্পেশাল অফার */}
            <div
              onClick={() => setSelectedOption(1)}
              className="bg-gradient-to-b from-[#171b3e] to-[#121634] rounded-2xl border-2 border-emerald-500/80 p-5 space-y-4 flex flex-col justify-between shadow-2xl relative cursor-pointer"
            >
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-emerald-600 text-white text-[11px] font-black uppercase tracking-wider px-3.5 py-0.5 rounded-full shadow-lg border border-emerald-300/40 flex items-center gap-1.5 whitespace-nowrap z-20">
                <Check className="w-3.5 h-3.5" />
                <span>আমাদের অফিশিয়াল স্পেশাল অফার</span>
              </div>

              <div className="space-y-3 pt-1">
                <span className="text-xs font-semibold text-emerald-300 block">
                  আমাদের অফিশিয়াল মূল্য
                </span>
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-xl bg-slate-900 p-1.5 border border-emerald-800/60 shrink-0 flex items-center justify-center overflow-hidden">
                    <img
                      src={productImage}
                      alt={targetProduct.name}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm line-clamp-1">
                      {targetProduct.name}
                    </h4>
                    <div className="flex items-baseline gap-2 mt-0.5">
                      <span className="text-2xl font-black text-emerald-400 font-mono">
                        ৳{contrastConfig.ourPrice.toLocaleString()}
                      </span>
                      <span className="text-xs text-slate-400 line-through font-mono">
                        ৳{contrastConfig.competitorPrice.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-emerald-950/60 border border-emerald-700/50 rounded-xl px-3 py-2 flex items-center justify-between text-xs">
                  <span className="text-emerald-300 font-bold">
                    সাশ্রয় ৳{contrastConfig.savings.toLocaleString()}
                  </span>
                  <span className="text-emerald-400 font-bold font-mono">
                    {contrastConfig.savingsPercent}% সরাসরি ডিসকাউন্ট
                  </span>
                </div>

                <p className="text-xs text-emerald-200/90 leading-relaxed">
                  ✓ {contrastConfig.ourHighlight}
                </p>
              </div>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleProceedToPurchase(
                    1,
                    `স্পেশাল অফার: ${targetProduct.name}`,
                    contrastConfig.ourPrice
                  );
                }}
                className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition cursor-pointer active:scale-98"
              >
                <ShoppingBag className="w-3.5 h-3.5 text-white" />
                <span>সাশ্রয়ী অফারে কিনুন — ৳{contrastConfig.ourPrice.toLocaleString()}</span>
              </button>
            </div>
          </div>
        )}

        {/* 3. STRATEGY: ANCHORING COMPARISON CARDS */}
        {currentCampaign.strategy === "anchoring-bias" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-5 items-stretch relative z-10">
            {/* Box 1: ঘোষিত MRP */}
            <div className="bg-[#11162d] rounded-2xl border border-slate-800 p-4 sm:p-5 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <span className="text-xs font-semibold text-slate-400 block">
                  ঘোষিত MRP মূল্য
                </span>
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-xl bg-slate-900 p-1.5 border border-slate-800 shrink-0 flex items-center justify-center overflow-hidden">
                    <img
                      src={productImage}
                      alt={targetProduct.name}
                      className="w-full h-full object-contain opacity-75"
                    />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-xs sm:text-sm line-clamp-1">
                      {targetProduct.name}
                    </h4>
                    <div className="text-lg sm:text-xl font-black text-slate-400 line-through font-mono mt-0.5">
                      ৳{anchorConfig.anchorPrice.toLocaleString()}
                    </div>
                  </div>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  ম্যানুফ্যাকচারার কর্তৃক স্ট্যান্ডার্ড রিটেইল MRP মূল্য।
                </p>
              </div>

              <div className="py-2.5 text-center text-xs font-bold text-slate-400 bg-slate-900 rounded-xl border border-slate-800">
                অরিজিনাল MRP
              </div>
            </div>

            {/* Box 2: আজকের বিশেষ মূল্য */}
            <div
              onClick={() => setSelectedOption(1)}
              className="bg-[#141b3c] rounded-2xl border-2 border-indigo-500 p-4 sm:p-5 flex flex-col justify-between space-y-4 shadow-xl relative cursor-pointer"
            >
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-[11px] font-black uppercase tracking-wider px-3.5 py-0.5 rounded-full shadow-lg border border-indigo-300/40 flex items-center gap-1 whitespace-nowrap z-20">
                <Flame className="w-3 h-3 text-amber-300 fill-amber-300" />
                <span>আজকের বিশেষ মূল্য</span>
              </div>

              <div className="space-y-3 pt-1">
                <span className="text-xs font-semibold text-indigo-300 block">
                  স্পেশাল অফার প্রাইস
                </span>
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-xl bg-slate-900 p-1.5 border border-indigo-900/60 shrink-0 flex items-center justify-center overflow-hidden">
                    <img
                      src={productImage}
                      alt={targetProduct.name}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-xs sm:text-sm line-clamp-1">
                      {targetProduct.name}
                    </h4>
                    <div className="flex items-baseline gap-2 mt-0.5">
                      <span className="text-lg sm:text-xl font-black text-indigo-400 font-mono">
                        ৳{anchorConfig.sellingPrice.toLocaleString()}
                      </span>
                      <span className="text-xs text-slate-400 line-through font-mono">
                        ৳{anchorConfig.anchorPrice.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-indigo-950/80 border border-indigo-800/80 rounded-xl px-3 py-2 flex items-center justify-between text-xs">
                  <span className="text-emerald-400 font-bold">
                    সাশ্রয় ৳{anchorConfig.savings.toLocaleString()}
                  </span>
                  <span className="text-indigo-300 font-bold font-mono">
                    {anchorConfig.savingsPercent}% অফ
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleProceedToPurchase(
                    1,
                    `স্পেশাল অফার: ${targetProduct.name}`,
                    anchorConfig.sellingPrice
                  );
                }}
                className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs rounded-xl shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition cursor-pointer active:scale-98"
              >
                <ShoppingBag className="w-3.5 h-3.5 text-white" />
                <span>অর্ডারে কিনুন — ৳{anchorConfig.sellingPrice.toLocaleString()}</span>
              </button>
            </div>

            {/* Box 3: দৈনিক হিসেব */}
            <div className="bg-[#181335] rounded-2xl border-2 border-purple-500/80 p-4 sm:p-5 flex flex-col justify-between space-y-4 shadow-xl">
              <div className="space-y-3">
                <span className="text-xs font-semibold text-purple-300 block">
                  দৈনিক হিসেব
                </span>
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-xl bg-purple-950/60 p-2 border border-purple-800/80 shrink-0 flex items-center justify-center text-2xl">
                    ☕
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 block font-semibold">
                      প্রতিদিনের গড় খরচ
                    </span>
                    <div className="text-xl font-black text-purple-300 font-mono mt-0.5">
                      মাত্র ৳{anchorConfig.dailyCost}/দিন
                    </div>
                  </div>
                </div>

                <div className="bg-purple-950/80 border border-purple-800/80 rounded-xl px-3 py-2 text-xs text-purple-200">
                  {anchorConfig.hookText}
                </div>
              </div>

              <button
                type="button"
                onClick={() =>
                  handleProceedToPurchase(
                    1,
                    `স্পেশাল অফার: ${targetProduct.name}`,
                    anchorConfig.sellingPrice
                  )
                }
                className="w-full py-3 px-4 bg-purple-600 hover:bg-purple-500 text-white font-black text-xs rounded-xl shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2 transition cursor-pointer active:scale-98"
              >
                <Gift className="w-3.5 h-3.5 text-white" />
                <span>আজই অর্ডার করুন — ৳{anchorConfig.sellingPrice.toLocaleString()}</span>
              </button>
            </div>
          </div>
        )}

        {/* ----------------------------------------------------------------- */}
        {/* DIRECT PURCHASE ACTION BAR (সরাসরি পারচেসে যাওয়ার অপশন) */}
        {/* ----------------------------------------------------------------- */}
        <div className="pt-4 border-t border-indigo-900/60 flex flex-col sm:flex-row items-center justify-between gap-4 relative z-10 bg-[#070b1a]/90 p-4 rounded-2xl border border-indigo-950">
          <div className="space-y-1 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-2 text-xs font-bold text-slate-300">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>১০০% অফিসিয়াল ওয়ারেন্টি ও ওপেন-বক্স ক্যাশ অন ডেলিভারি</span>
            </div>
            <p className="text-[11px] text-slate-400">
              অর্ডার সম্পন্ন করার পূর্বে পণ্য চেক করে মূল্য পরিশোধ করার সুবিধা।
            </p>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto shrink-0">
            <button
              type="button"
              onClick={() => {
                const qty = currentCampaign.strategy === "round-of-three" ? selectedOption : 1;
                const title = `স্পেশাল অফার: ${targetProduct.name}`;
                handleAddToCartOnly(qty, title);
              }}
              className="px-4 py-3 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-300 font-bold text-xs transition cursor-pointer"
            >
              কার্টে রাখুন
            </button>

            <button
              type="button"
              onClick={() => {
                const qty = currentCampaign.strategy === "round-of-three" ? selectedOption : 1;
                const price =
                  currentCampaign.strategy === "round-of-three"
                    ? selectedOption === 1
                      ? pack1Price
                      : selectedOption === 2
                      ? pack2Price
                      : pack3Price
                    : currentCampaign.strategy === "contrast-effect"
                    ? contrastConfig.ourPrice
                    : anchorConfig.sellingPrice;

                const title =
                  currentCampaign.strategy === "round-of-three"
                    ? `${selectedOption}-প্যাক অফার: ${targetProduct.name}`
                    : `স্পেশাল অফার: ${targetProduct.name}`;

                handleProceedToPurchase(qty, title, price);
              }}
              className="flex-1 sm:flex-initial px-6 py-3 bg-gradient-to-r from-emerald-500 via-teal-500 to-indigo-600 hover:from-emerald-400 hover:to-indigo-500 text-white font-black text-xs sm:text-sm rounded-xl shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition cursor-pointer active:scale-98"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>সরাসরি অর্ডার করুন (Buy Now)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
