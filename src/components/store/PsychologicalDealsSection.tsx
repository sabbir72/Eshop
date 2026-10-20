import React, { useState } from "react";
import { useStore } from "../../context/StoreContext";
import { Product } from "../../types";
import {
  Sparkles,
  Flame,
  Zap,
  ShoppingBag,
  CheckCircle2,
  Tag,
  ArrowRight,
  TrendingDown,
  ShieldCheck,
  Gift,
  Truck,
  Layers,
  Percent,
} from "lucide-react";

interface PsychologicalDealsSectionProps {
  onQuickView?: (product: Product) => void;
}

export const PsychologicalDealsSection: React.FC<PsychologicalDealsSectionProps> = ({
  onQuickView,
}) => {
  const { products, addToCart, addToast, setStoreView, setSelectedProduct } = useStore();

  const [activeStrategyTab, setActiveStrategyTab] = useState<
    "round-of-three" | "contrast-effect" | "anchoring-bias"
  >("round-of-three");

  // Choose products for each showcase
  const triadProduct = products.find((p) => p.isFeatured || p.rating >= 4.7) || products[0];
  const contrastProduct = products.find((p) => p.discountPrice && p.discountPrice < p.price) || products[1] || products[0];
  const anchorProduct = products.find((p) => p.price > 2500) || products[2] || products[0];

  if (!triadProduct) return null;

  // Triad Calculations
  const triadBasePrice = triadProduct.discountPrice || triadProduct.price;
  const tier1Price = triadBasePrice;
  const tier2Price = Math.round(triadBasePrice * 2 * 0.88); // 12% off
  const tier2Savings = triadBasePrice * 2 - tier2Price;
  const tier3Price = Math.round(triadBasePrice * 3 * 0.75); // 25% off
  const tier3Savings = triadBasePrice * 3 - tier3Price;

  // Contrast Calculations
  const contrastOurPrice = contrastProduct.discountPrice || contrastProduct.price;
  const contrastMarketPrice = Math.round(contrastOurPrice * 1.65);
  const contrastSavings = contrastMarketPrice - contrastOurPrice;
  const contrastPercent = Math.round((contrastSavings / contrastMarketPrice) * 100);

  // Anchoring Calculations
  const anchorNowPrice = anchorProduct.discountPrice || anchorProduct.price;
  const anchorWasPrice = Math.round(anchorNowPrice * 1.55);
  const anchorSavings = anchorWasPrice - anchorNowPrice;
  const anchorPercent = Math.round((anchorSavings / anchorWasPrice) * 100);
  const dailyCost = Math.round(anchorNowPrice / 60); // 60 days framing

  return (
    <section className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-950 rounded-3xl border border-indigo-800/40 p-4 sm:p-7 text-white shadow-xl relative overflow-hidden space-y-6 text-left">
      {/* Background glow effects */}
      <div className="absolute -top-24 -right-24 w-72 h-72 bg-violet-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10 border-b border-indigo-900/60 pb-5">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-violet-500/20 border border-violet-400/30 rounded-xl text-violet-300">
              <Sparkles className="w-4 h-4" />
            </span>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-violet-300 bg-violet-950/80 px-2.5 py-0.5 rounded-full border border-violet-700/50">
              Exclusive Value Studio
            </span>
            <span className="text-[10px] text-amber-300 font-bold bg-amber-950/60 border border-amber-600/40 px-2 py-0.5 rounded-full">
              গ্রাহকের লাভ ও সাশ্রয়
            </span>
          </div>

          <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            স্মার্ট ভ্যালু ও সাইকোলজিক্যাল ডিলস (Value Strategies)
          </h3>
          <p className="text-xs text-indigo-200/90 max-w-2xl leading-relaxed">
            গ্রাহকের সর্বোচ্চ সাশ্রয় নিশ্চিত করতে ৩টি স্পেশাল অফার আর্কিটেকচার: ৩-প্যাক মেগা বান্ডেল, বাজার দর বনাম আমাদের অফার এবং বিশেষ নোঙর ছাড়!
          </p>
        </div>

        {/* Strategy Switcher Pills */}
        <div className="flex items-center gap-1.5 bg-slate-900/90 p-1 rounded-2xl border border-indigo-700/40 self-start md:self-auto">
          <button
            type="button"
            onClick={() => setActiveStrategyTab("round-of-three")}
            className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
              activeStrategyTab === "round-of-three"
                ? "bg-indigo-600 text-white shadow-md"
                : "text-slate-400 hover:text-white"
            }`}
          >
            ১. রাউন্ড অফ থ্রি (৩-প্যাক)
          </button>
          <button
            type="button"
            onClick={() => setActiveStrategyTab("contrast-effect")}
            className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
              activeStrategyTab === "contrast-effect"
                ? "bg-rose-600 text-white shadow-md"
                : "text-slate-400 hover:text-white"
            }`}
          >
            ২. কন্ট্রাস্ট ইফেক্ট
          </button>
          <button
            type="button"
            onClick={() => setActiveStrategyTab("anchoring-bias")}
            className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
              activeStrategyTab === "anchoring-bias"
                ? "bg-amber-600 text-white shadow-md"
                : "text-slate-400 hover:text-white"
            }`}
          >
            ৩. অ্যাঙ্করিং বায়াস
          </button>
        </div>
      </div>

      {/* STRATEGY 1: ROUND OF THREE TAB */}
      {activeStrategyTab === "round-of-three" && (
        <div className="space-y-4 relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-indigo-300">
                ৩ এর নিয়ম: যত বেশি নিবেন, তত বেশি সাশ্রয়!
              </span>
              <span className="text-[10px] bg-indigo-900/80 text-indigo-300 px-2 py-0.5 rounded-full border border-indigo-700/50">
                কুপন: TRIAD25
              </span>
            </div>
            <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
              <Truck className="w-3.5 h-3.5" /> ৩-প্যাকে সারা দেশে ফ্রি ক্যাশ অন ডেলিভারি
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Tier 1: Single Pack */}
            <div className="bg-slate-900/90 rounded-2xl border border-slate-700/80 p-4 space-y-3 flex flex-col justify-between hover:border-slate-500 transition-all">
              <div className="space-y-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
                  সিঙ্গেল ট্রায়াল প্যাক (১টি)
                </span>
                <div className="flex items-center gap-3">
                  <img
                    src={triadProduct.image}
                    alt=""
                    className="w-14 h-14 object-cover rounded-xl border border-slate-700"
                  />
                  <div>
                    <h5 className="font-bold text-white text-xs line-clamp-1">
                      {triadProduct.name}
                    </h5>
                    <span className="text-lg font-black text-white font-mono">
                      ৳{tier1Price.toLocaleString()}
                    </span>
                  </div>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  একটি পণ্য নিয়ে কোয়ালিটি যাচাই করার জন্য স্ট্যান্ডার্ড অপশন।
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  addToCart(triadProduct, undefined, undefined, 1);
                  addToast(`সিঙ্গেল প্যাক কার্টে যুক্ত হয়েছে!`, "success");
                }}
                className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <ShoppingBag className="w-3.5 h-3.5" /> ১টি কিনুন — ৳{tier1Price.toLocaleString()}
              </button>
            </div>

            {/* Tier 2: Duo Pack (Most Popular Hero) */}
            <div className="bg-gradient-to-b from-indigo-950 via-slate-900 to-indigo-950 rounded-2xl border-2 border-indigo-500 p-4 space-y-3 flex flex-col justify-between shadow-xl relative transform md:-translate-y-1">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-[10px] font-black uppercase px-3 py-0.5 rounded-full shadow-md flex items-center gap-1">
                <Flame className="w-3 h-3 text-amber-300" /> মোস্ট পপুলার চয়েস
              </div>

              <div className="space-y-2 pt-1">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-400 block">
                  ডাবল প্যাক সেভার (২টি)
                </span>
                <div className="flex items-center gap-3">
                  <img
                    src={triadProduct.image}
                    alt=""
                    className="w-14 h-14 object-cover rounded-xl border border-indigo-500/40"
                  />
                  <div>
                    <h5 className="font-bold text-white text-xs line-clamp-1">
                      {triadProduct.name}
                    </h5>
                    <div className="flex items-baseline gap-2">
                      <span className="text-xl font-black text-indigo-400 font-mono">
                        ৳{tier2Price.toLocaleString()}
                      </span>
                      <span className="text-[11px] text-slate-400 line-through font-mono">
                        ৳{(triadBasePrice * 2).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-2 bg-indigo-950/80 rounded-xl border border-indigo-800/60 text-[11px] text-emerald-400 font-bold flex items-center justify-between">
                  <span>১২% ইনস্ট্যান্ট ডিসকাউন্ট</span>
                  <span>সাশ্রয় ৳{tier2Savings.toLocaleString()}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  addToCart(triadProduct, undefined, undefined, 2);
                  addToast(`২টি পণ্য (ডাবল প্যাক) কার্টে যুক্ত হয়েছে! সাশ্রয় ৳${tier2Savings.toLocaleString()}`, "success");
                }}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <ShoppingBag className="w-3.5 h-3.5" /> ২টি নিন — ৳{tier2Price.toLocaleString()}
              </button>
            </div>

            {/* Tier 3: Triad Mega Pack */}
            <div className="bg-gradient-to-b from-purple-950 via-slate-900 to-purple-950 rounded-2xl border border-purple-500/80 p-4 space-y-3 flex flex-col justify-between shadow-md">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-purple-400 block">
                    মেগা ট্রায়াড প্যাক (৩টি)
                  </span>
                  <span className="text-[9px] font-black uppercase text-amber-300 bg-amber-950/80 px-2 py-0.2 rounded-full border border-amber-500/40">
                    ২৫% অফ
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <img
                    src={triadProduct.image}
                    alt=""
                    className="w-14 h-14 object-cover rounded-xl border border-purple-500/40"
                  />
                  <div>
                    <h5 className="font-bold text-white text-xs line-clamp-1">
                      {triadProduct.name}
                    </h5>
                    <div className="flex items-baseline gap-2">
                      <span className="text-xl font-black text-purple-300 font-mono">
                        ৳{tier3Price.toLocaleString()}
                      </span>
                      <span className="text-[11px] text-slate-400 line-through font-mono">
                        ৳{(triadBasePrice * 3).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-2 bg-purple-950/80 rounded-xl border border-purple-800/60 text-[11px] text-emerald-400 font-bold flex items-center justify-between">
                  <span>সাশ্রয় ৳{tier3Savings.toLocaleString()}</span>
                  <span>+ ফ্রি ডেলিভারি</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  addToCart(triadProduct, undefined, undefined, 3);
                  addToast(`৩-প্যাক মেগা অফার কার্টে যুক্ত হয়েছে! সর্বোচ্চ সাশ্রয় ৳${tier3Savings.toLocaleString()} ও ফ্রি ডেলিভারি!`, "success");
                }}
                className="w-full py-2 bg-purple-800 hover:bg-purple-700 text-white font-extrabold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Gift className="w-3.5 h-3.5" /> ৩-প্যাক নিন — ৳{tier3Price.toLocaleString()}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STRATEGY 2: CONTRAST EFFECT TAB */}
      {activeStrategyTab === "contrast-effect" && (
        <div className="space-y-4 relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span className="text-xs font-bold text-rose-300">
              কন্ট্রাস্ট ইফেক্ট: বাজারের অতিরিক্ত মূল্যের বিপরীতে ১০০% লাভজনক অফার!
            </span>
            <span className="text-xs text-amber-300 font-bold">
              কুপন কোড: CONTRAST50
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Competitor / Market Price Card */}
            <div className="bg-slate-900/80 rounded-2xl border border-slate-700 p-5 space-y-4 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                    সাধারণ রিটেল মার্কেট বা অন্যান্য শপ
                  </span>
                  <span className="text-[10px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                    হাই প্রাইস
                  </span>
                </div>

                <div className="pt-1">
                  <span className="text-3xl font-black text-slate-400 font-mono">
                    ৳{contrastMarketPrice.toLocaleString()}
                  </span>
                  <span className="block text-xs text-slate-500 pt-0.5">
                    + ডেলিভারি চার্জ অতিরিক্ত ৳১৩০
                  </span>
                </div>

                <div className="space-y-2 pt-2 text-xs text-slate-400">
                  <div className="flex items-center gap-2 text-rose-400 font-medium">
                    <span>✕</span>
                    <span>লোকাল ওয়ারেন্টি ছাড়া পণ্য পাওয়ার ঝুঁকি</span>
                  </div>
                  <div className="flex items-center gap-2 text-rose-400 font-medium">
                    <span>✕</span>
                    <span>কোনো রিটার্ন বা ইনস্ট্যান্ট ক্যাশব্যাক সুবিধা নেই</span>
                  </div>
                </div>
              </div>

              <div className="p-2.5 bg-slate-800/80 rounded-xl text-center text-xs text-slate-400 font-semibold">
                অতিরিক্ত ব্যয়বহুল ও ঝুঁকিপূর্ণ বিকল্প
              </div>
            </div>

            {/* Our Contrast Offer Card */}
            <div className="bg-gradient-to-br from-rose-950 via-slate-900 to-indigo-950 rounded-2xl border-2 border-rose-500 p-5 space-y-4 flex flex-col justify-between shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-rose-600 text-white text-[10px] font-black uppercase px-3 py-1 rounded-bl-xl shadow-xs">
                আমাদের স্পেশাল মেম্বার রেট
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <img
                    src={contrastProduct.image}
                    alt=""
                    className="w-14 h-14 object-cover rounded-xl border border-rose-400/40"
                  />
                  <div>
                    <h5 className="font-extrabold text-white text-sm line-clamp-1">
                      {contrastProduct.name}
                    </h5>
                    <span className="text-[11px] text-emerald-400 font-bold">
                      অফিসিয়াল ১ বছরের রিপ্লেসমেন্ট ওয়ারেন্টি
                    </span>
                  </div>
                </div>

                <div className="pt-1">
                  <div className="text-xs text-slate-400 line-through font-mono">
                    বাজার মূল্য: ৳{contrastMarketPrice.toLocaleString()}
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black text-rose-400 font-mono">
                      ৳{contrastOurPrice.toLocaleString()}
                    </span>
                    <span className="text-xs font-black text-emerald-400 bg-emerald-950/80 border border-emerald-600/40 px-2.5 py-0.5 rounded-full">
                      বাঁচান ৳{contrastSavings.toLocaleString()} ({contrastPercent}% অফ)
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs text-slate-200">
                  <div className="flex items-center gap-2 text-emerald-300 font-bold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>১০০% অরিজিনাল অথেনটিক প্রোডাক্ট গ্যারান্টি</span>
                  </div>
                  <div className="flex items-center gap-2 text-emerald-300 font-bold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>পণ্য হাতে পেয়ে চেক করে মূল্য পরিশোধের সুবিধা</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  addToCart(contrastProduct, undefined, undefined, 1);
                  addToast(`কন্ট্রাস্ট অফার মূল্যে কার্টে যুক্ত হয়েছে! আপনি বাঁচিয়েছেন ৳${contrastSavings.toLocaleString()} টাকা!`, "success");
                }}
                className="w-full py-2.5 bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-extrabold text-xs rounded-xl shadow-lg transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <Zap className="w-4 h-4" /> সাশ্রয়ী মূল্যে এখনই সংগ্রহ করুন
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STRATEGY 3: ANCHORING BIAS TAB */}
      {activeStrategyTab === "anchoring-bias" && (
        <div className="space-y-4 relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span className="text-xs font-bold text-amber-300">
              প্রাইস অ্যাঙ্করিং: বড় স্ট্রাইকথ্রু নোঙর ও ক্ষুদ্র দৈনিক খরচের সাইকোলজি!
            </span>
            <span className="text-xs text-emerald-400 font-bold">
              ইনস্ট্যান্ট সেভিং: ৳{anchorSavings.toLocaleString()}
            </span>
          </div>

          <div className="bg-gradient-to-r from-slate-900 via-amber-950/40 to-slate-900 rounded-2xl border border-amber-600/40 p-5 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <img
                src={anchorProduct.image}
                alt=""
                className="w-24 h-24 object-cover rounded-2xl border border-amber-500/30 shadow-md shrink-0"
              />
              <div className="space-y-1.5">
                <span className="px-2.5 py-0.5 bg-amber-500 text-slate-950 font-black text-[10px] uppercase rounded-full">
                  লিমিটেড টাইম নোঙর ছাড়
                </span>
                <h4 className="font-extrabold text-white text-base line-clamp-1">
                  {anchorProduct.name}
                </h4>

                {/* Strikethrough Anchor */}
                <div className="flex items-baseline gap-3 pt-1">
                  <span className="text-sm text-slate-400 line-through font-mono font-bold">
                    MRP: ৳{anchorWasPrice.toLocaleString()}
                  </span>
                  <span className="text-3xl font-black text-amber-400 font-mono">
                    ৳{anchorNowPrice.toLocaleString()}
                  </span>
                  <span className="text-xs font-extrabold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-md border border-emerald-600/40">
                    {anchorPercent}% অফ
                  </span>
                </div>
              </div>
            </div>

            {/* Daily Reframe Card */}
            <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
              <div className="p-3 bg-slate-950/80 rounded-2xl border border-amber-500/30 text-center sm:text-left min-w-[180px]">
                <div className="flex items-center gap-1.5 text-[11px] text-amber-300 font-extrabold uppercase">
                  <span>☕</span>
                  <span>দৈনিক খরচের হিসেবে:</span>
                </div>
                <div className="text-2xl font-black text-white font-mono mt-1">
                  মাত্র ৳{dailyCost} <span className="text-xs text-slate-400 font-normal">/দিন</span>
                </div>
                <span className="text-[10px] text-slate-400 block pt-0.5">
                  এক কাপ চায়ের খরচে বিশ্বমানের প্রিমিয়াম পণ্য!
                </span>
              </div>

              <button
                type="button"
                onClick={() => {
                  addToCart(anchorProduct, undefined, undefined, 1);
                  addToast(`অ্যাঙ্করিং স্পেশাল অফার কার্টে যুক্ত হয়েছে!`, "success");
                }}
                className="w-full sm:w-auto px-6 py-3 bg-amber-600 hover:bg-amber-500 text-white font-extrabold text-xs rounded-xl shadow-lg transition flex items-center justify-center gap-2 cursor-pointer shrink-0"
              >
                <ShoppingBag className="w-4 h-4" /> এখনই অর্ডার করুন
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
