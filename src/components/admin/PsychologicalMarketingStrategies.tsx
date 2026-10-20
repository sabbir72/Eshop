import React, { useState, useMemo } from "react";
import { useStore } from "../../context/StoreContext";
import { Product, Advertisement } from "../../types";
import {
  Sparkles,
  Zap,
  Target,
  Layers,
  ArrowRight,
  CheckCircle2,
  Copy,
  Plus,
  Tag,
  TrendingUp,
  Sliders,
  DollarSign,
  Percent,
  Check,
  Eye,
  Smartphone,
  Laptop,
  HelpCircle,
  Award,
  Flame,
  ShieldCheck,
  Gift,
  Send,
  Share2,
  Megaphone,
  ArrowUpRight,
  Info,
} from "lucide-react";

interface PsychologicalMarketingStrategiesProps {
  onOpenCreateModal?: (type: "slider" | "popup" | "campaign") => void;
  onSelectStrategyCopy?: (title: string, desc: string) => void;
  onSendToBroadcast?: (text: string) => void;
}

export const PsychologicalMarketingStrategies: React.FC<
  PsychologicalMarketingStrategiesProps
> = ({ onOpenCreateModal, onSelectStrategyCopy, onSendToBroadcast }) => {
  const { products, addAdvertisement, addCoupon, addToast, settings } = useStore();

  const [activeStrategy, setActiveStrategy] = useState<
    "round-of-three" | "contrast-effect" | "anchoring-bias"
  >("round-of-three");

  const [previewDevice, setPreviewDevice] = useState<"desktop" | "mobile">("desktop");

  // Selected product for live simulations
  const [selectedProductId, setSelectedProductId] = useState<string>(
    products[0]?.id || ""
  );

  const currentProduct = useMemo(
    () => products.find((p) => p.id === selectedProductId) || products[0],
    [products, selectedProductId]
  );

  // -------------------------------------------------------------
  // STRATEGY 1: ROUND OF THREE (RULE OF THREE / ৩ এর নিয়ম) STATE
  // -------------------------------------------------------------
  const basePrice = currentProduct?.discountPrice || currentProduct?.price || 1500;
  const [tier1Qty, setTier1Qty] = useState(1);
  const [tier1Discount, setTier1Discount] = useState(0); // 0%
  const [tier2Qty, setTier2Qty] = useState(2);
  const [tier2Discount, setTier2Discount] = useState(12); // 12% off
  const [tier3Qty, setTier3Qty] = useState(3);
  const [tier3Discount, setTier3Discount] = useState(25); // 25% off + Free gift

  const tier1Price = Math.round(basePrice * tier1Qty * (1 - tier1Discount / 100));
  const tier2Price = Math.round(basePrice * tier2Qty * (1 - tier2Discount / 100));
  const tier3Price = Math.round(basePrice * tier3Qty * (1 - tier3Discount / 100));

  const tier2Savings = basePrice * tier2Qty - tier2Price;
  const tier3Savings = basePrice * tier3Qty - tier3Price;

  // -------------------------------------------------------------
  // STRATEGY 2: CONTRAST EFFECT (বৈপরীত্য প্রভাব) STATE
  // -------------------------------------------------------------
  const [contrastCompetitorPrice, setContrastCompetitorPrice] = useState<number>(
    Math.round(basePrice * 1.6)
  );
  const [ourContrastPrice, setOurContrastPrice] = useState<number>(basePrice);
  const [contrastBenefit1, setContrastBenefit1] = useState("অরিজিনাল ১ বছরের রিপ্লেসমেন্ট গ্যারান্টি");
  const [contrastBenefit2, setContrastBenefit2] = useState("সারা বাংলাদেশে দ্রুততম হোম ডেলিভারি");
  const [contrastBenefit3, setContrastBenefit3] = useState("পণ্য দেখে চেক করে মূল্য পরিশোধের সুবিধা");
  const [competitorDisadvantage, setCompetitorDisadvantage] = useState("লোকাল ওয়ারেন্টি ছাড়া, অতিরিক্ত ডেলিভারি ফি ও অগ্রিম পেমেন্টের ঝুঁকি");

  const contrastSavings = Math.max(0, contrastCompetitorPrice - ourContrastPrice);
  const contrastPercent = Math.round((contrastSavings / (contrastCompetitorPrice || 1)) * 100);

  // -------------------------------------------------------------
  // STRATEGY 3: ANCHORING BIAS (নোঙর প্রভাব) STATE
  // -------------------------------------------------------------
  const [anchorOriginalPrice, setAnchorOriginalPrice] = useState<number>(
    Math.round(basePrice * 1.55)
  );
  const [anchorSellingPrice, setAnchorSellingPrice] = useState<number>(basePrice);
  const [anchorDurationDays, setAnchorDurationDays] = useState<number>(60);
  const [anchorCustomHook, setAnchorCustomHook] = useState("প্রতিদিন মাত্র ৳২৫ এরও কম খরচে প্রিমিয়াম কোয়ালিটি!");

  const anchorSavings = Math.max(0, anchorOriginalPrice - anchorSellingPrice);
  const anchorDiscountPercent = Math.round((anchorSavings / (anchorOriginalPrice || 1)) * 100);
  const dailyAmortizedCost = Math.round(anchorSellingPrice / (anchorDurationDays || 1));

  // -------------------------------------------------------------
  // ACTION DISPATCHERS
  // -------------------------------------------------------------
  const handleDeployTriadCampaign = () => {
    const newAd: Advertisement = {
      id: `ad-triad-${Date.now()}`,
      title: `৩-প্যাক মেগা সেভার ডিল: ${currentProduct?.name || "পণ্য কালেকশন"}`,
      description: `১টি কিনলে ৳${tier1Price.toLocaleString()}, ২টি কিনলে ৳${tier2Price.toLocaleString()} (বাঁচান ৳${tier2Savings.toLocaleString()}), ৩টি মেগা প্যাক কিনলে মাত্র ৳${tier3Price.toLocaleString()} ও ফ্রি হোম ডেলিভারি!`,
      type: "campaign",
      mediaType: "image",
      mediaUrl: currentProduct?.image || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80",
      offerBadge: "HOT",
      couponCode: "TRIAD25",
      buttonText: "৩-প্যাক অফার দেখুন",
      buttonLink: "products",
      priority: 1,
      startDate: new Date().toISOString().split("T")[0],
      endDate: "2026-12-31",
      isActive: true,
      views: 0,
      clicks: 0,
      conversions: 0,
    };
    addAdvertisement(newAd);

    // Create coupon
    addCoupon({
      id: `cp-triad-${Date.now()}`,
      code: "TRIAD25",
      discountType: "percentage",
      discountValue: 25,
      minPurchase: tier2Price,
      maxDiscount: 2000,
      startDate: new Date().toISOString().split("T")[0],
      endDate: "2026-12-31",
      usageLimit: 500,
      usageCount: 0,
      isActive: true,
    });

    addToast(
      "সফলভাবে 'রাউন্ড অফ থ্রি' ক্যাম্পেইন ব্যানার ও TRIAD25 কুপন লাইভ করা হয়েছে!",
      "success"
    );
  };

  const handleDeployContrastCampaign = () => {
    const newAd: Advertisement = {
      id: `ad-contrast-${Date.now()}`,
      title: `মার্কেট প্রাইস কন্ট্রাস্ট: ৳${contrastCompetitorPrice.toLocaleString()} ➔ আমাদের মূল্য মাত্র ৳${ourContrastPrice.toLocaleString()}`,
      description: `বাজারে যেখানে দাম ৳${contrastCompetitorPrice.toLocaleString()}, আমাদের স্মার্টশপে পাচ্ছেন মাত্র ৳${ourContrastPrice.toLocaleString()} মূল্যে (সাশ্রয় ৳${contrastSavings.toLocaleString()} / ${contrastPercent}% ছাড়) + ফ্রি ডেলিভারি!`,
      type: "slider",
      mediaType: "image",
      mediaUrl: currentProduct?.image || "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80",
      offerBadge: "FLASH SALE",
      couponCode: "CONTRAST50",
      buttonText: "স্মার্ট অফারটি নিন",
      buttonLink: "products",
      priority: 1,
      startDate: new Date().toISOString().split("T")[0],
      endDate: "2026-12-31",
      isActive: true,
      views: 0,
      clicks: 0,
      conversions: 0,
    };
    addAdvertisement(newAd);
    addToast(
      "সফলভাবে 'কন্ট্রাস্ট ইফেক্ট' হাই-কনভার্সন ব্যানার স্টোরে লাইভ করা হয়েছে!",
      "success"
    );
  };

  const handleDeployAnchoringCampaign = () => {
    const newAd: Advertisement = {
      id: `ad-anchor-${Date.now()}`,
      title: `প্রাইস অ্যাঙ্করিং অফার: মূল মূল্য ৳${anchorOriginalPrice.toLocaleString()} ➔ এখন মাত্র ৳${anchorSellingPrice.toLocaleString()}`,
      description: `সীমিত সময়ের জন্য পাচ্ছেন নিশ্চিত ${anchorDiscountPercent}% মেগা ছাড়! দৈনিক খরচ মাত্র ৳${dailyAmortizedCost}- এক কাপ চায়ের খরচে প্রিমিয়াম গ্যাজেট।`,
      type: "popup",
      mediaType: "image",
      mediaUrl: currentProduct?.image || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80",
      offerBadge: "LIMITED TIME",
      couponCode: "ANCHORHOT",
      buttonText: "অফারটি গ্রহণ করুন",
      buttonLink: "products",
      priority: 1,
      startDate: new Date().toISOString().split("T")[0],
      endDate: "2026-12-31",
      isActive: true,
      views: 0,
      clicks: 0,
      conversions: 0,
    };
    addAdvertisement(newAd);
    addToast(
      "সফলভাবে 'অ্যাঙ্করিং বায়াস' পপ-আপ অফার স্টোরে লাইভ করা হয়েছে!",
      "success"
    );
  };

  return (
    <div className="space-y-6 text-left">
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-violet-950 via-indigo-950 to-slate-950 p-6 sm:p-7 rounded-3xl border border-violet-800/40 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-96 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-violet-600/20 via-transparent to-transparent pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="p-2 bg-violet-600/30 border border-violet-500/40 rounded-xl text-violet-300">
                <Sparkles className="w-5 h-5" />
              </span>
              <span className="text-[11px] font-black uppercase tracking-wider text-violet-300 bg-violet-900/60 px-2.5 py-0.5 rounded-full border border-violet-700/50">
                Behavioral Marketing & Neuroscience Lab
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              নিউরো-মার্কেটিং ও আচরণগত সাইকোলজি স্ট্র্যাটেজি
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              গ্রাহকের অবচেতন সিদ্ধান্ত গ্রহণের মনস্তত্ত্বকে কাজে লাগিয়ে কনভার্সন রেট, গড় অর্ডার ভ্যালু (AOV) এবং দ্রুত পারচেজ ডিসিশন বাড়িয়ে তোলার ৩টি বৈজ্ঞানিক কৌশল।
            </p>
          </div>

          {/* Quick HUD Metrics */}
          <div className="grid grid-cols-3 gap-2 bg-slate-900/80 p-3.5 rounded-2xl border border-violet-500/30 backdrop-blur-md">
            <div className="text-center px-2">
              <span className="text-[10px] text-slate-400 block font-semibold">কনভার্সন লিফট</span>
              <strong className="text-emerald-400 text-sm font-extrabold">+২৮.৪%</strong>
            </div>
            <div className="text-center px-2 border-x border-slate-800">
              <span className="text-[10px] text-slate-400 block font-semibold">অর্ডার ভ্যালু (AOV)</span>
              <strong className="text-violet-400 text-sm font-extrabold">+৩৪.৮%</strong>
            </div>
            <div className="text-center px-2">
              <span className="text-[10px] text-slate-400 block font-semibold">সিদ্ধান্তের সময়</span>
              <strong className="text-amber-400 text-sm font-extrabold">-৪২% দ্রুত</strong>
            </div>
          </div>
        </div>

        {/* Product Selector Bar */}
        <div className="mt-6 pt-5 border-t border-violet-900/60 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <Tag className="w-4 h-4 text-violet-400" />
            <span className="font-bold text-slate-300">স্ট্র্যাটেজি টেস্টের জন্য পণ্য নির্বাচন করুন:</span>
            <select
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              className="bg-slate-900 border border-violet-700/70 text-white rounded-xl px-3 py-1.5 font-bold focus:outline-none focus:ring-2 focus:ring-violet-500"
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} — ৳{(p.discountPrice || p.price).toLocaleString()}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-900/90 p-1 rounded-xl border border-violet-800/50">
            <button
              type="button"
              onClick={() => setPreviewDevice("desktop")}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-all ${
                previewDevice === "desktop"
                  ? "bg-violet-600 text-white shadow-xs"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Laptop className="w-3.5 h-3.5" /> ডেস্কটপ ভিউ
            </button>
            <button
              type="button"
              onClick={() => setPreviewDevice("mobile")}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-all ${
                previewDevice === "mobile"
                  ? "bg-violet-600 text-white shadow-xs"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" /> মোবাইল ভিউ
            </button>
          </div>
        </div>
      </div>

      {/* 3 Core Strategy Selection Tabs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Tab 1: Round of Three */}
        <button
          type="button"
          onClick={() => setActiveStrategy("round-of-three")}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer relative overflow-hidden ${
            activeStrategy === "round-of-three"
              ? "bg-gradient-to-br from-indigo-50 to-white border-indigo-500 shadow-md ring-2 ring-indigo-500/20"
              : "bg-white border-slate-200 hover:border-indigo-300 hover:bg-slate-50/50 shadow-2xs"
          }`}
        >
          {activeStrategy === "round-of-three" && (
            <span className="absolute top-0 right-0 w-16 h-16 bg-indigo-500/10 rounded-bl-full pointer-events-none" />
          )}
          <div className="flex items-center justify-between mb-2">
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-xl bg-indigo-600 text-white font-extrabold text-sm shadow-xs">
              ৩
            </span>
            <span className="text-[10px] font-bold text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded-full uppercase">
              Triad Packaging
            </span>
          </div>
          <h3 className="font-extrabold text-slate-900 text-sm">
            ১. রাউন্ড অফ থ্রি (Round of Three)
          </h3>
          <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
            মানুষের মস্তিষ্ক ৩টি বিকল্প সবচেয়ে সহজে প্রসেস করে। ১টি, ২টি ও ৩টি বান্ডেলের মধ্যে মাঝখানেরটি মোস্ট পপুলার হিসেবে সবচেয়ে বেশি বিক্রয় হয়।
          </p>
        </button>

        {/* Tab 2: Contrast Effect */}
        <button
          type="button"
          onClick={() => setActiveStrategy("contrast-effect")}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer relative overflow-hidden ${
            activeStrategy === "contrast-effect"
              ? "bg-gradient-to-br from-rose-50 to-white border-rose-500 shadow-md ring-2 ring-rose-500/20"
              : "bg-white border-slate-200 hover:border-rose-300 hover:bg-slate-50/50 shadow-2xs"
          }`}
        >
          {activeStrategy === "contrast-effect" && (
            <span className="absolute top-0 right-0 w-16 h-16 bg-rose-500/10 rounded-bl-full pointer-events-none" />
          )}
          <div className="flex items-center justify-between mb-2">
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-xl bg-rose-600 text-white font-extrabold text-sm shadow-xs">
              ⚡
            </span>
            <span className="text-[10px] font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-full uppercase">
              Comparative Decoy
            </span>
          </div>
          <h3 className="font-extrabold text-slate-900 text-sm">
            ২. কন্ট্রাস্ট ইফেক্ট (Contrast Effect)
          </h3>
          <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
            কোনো অফারের আকর্ষণ নির্ভর করে তার পাশে কী রাখা আছে। বাজারের চড়া মূল্য বা চড়া ডিকয়ের পাশে মূল পণ্য রাখলে তা অবিশ্বাস্য সাশ্রয়ী মনে হয়।
          </p>
        </button>

        {/* Tab 3: Anchoring Bias */}
        <button
          type="button"
          onClick={() => setActiveStrategy("anchoring-bias")}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer relative overflow-hidden ${
            activeStrategy === "anchoring-bias"
              ? "bg-gradient-to-br from-amber-50 to-white border-amber-500 shadow-md ring-2 ring-amber-500/20"
              : "bg-white border-slate-200 hover:border-amber-300 hover:bg-slate-50/50 shadow-2xs"
          }`}
        >
          {activeStrategy === "anchoring-bias" && (
            <span className="absolute top-0 right-0 w-16 h-16 bg-amber-500/10 rounded-bl-full pointer-events-none" />
          )}
          <div className="flex items-center justify-between mb-2">
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-xl bg-amber-600 text-white font-extrabold text-sm shadow-xs">
              ⚓
            </span>
            <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full uppercase">
              First Price Anchor
            </span>
          </div>
          <h3 className="font-extrabold text-slate-900 text-sm">
            ৩. অ্যাঙ্করিং বায়াস (Anchoring Bias)
          </h3>
          <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
            ক্রেতার চোখে প্রথম যে সংখ্যা বা MRP পড়বে তা রেফারেন্স পয়েন্ট হয়ে যায়। বড় স্ট্রাইকথ্রু এবং দৈনিক খরচের রিফ্রেমিং ক্রেতাকে তাত্ক্ষণিক আগ্রহী করে।
          </p>
        </button>
      </div>

      {/* STRATEGY 1: ROUND OF THREE BUILDER & SIMULATOR */}
      {activeStrategy === "round-of-three" && (
        <div className="space-y-6">
          {/* Strategy Deep Dive Info */}
          <div className="bg-indigo-900/10 border border-indigo-200 rounded-3xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-black text-indigo-950 text-sm">
                  মনস্তাত্ত্বিক মূলনীতি: মিলারস ল ও ট্রায়াড চয়েস আর্কিটেকচার (Rule of Three)
                </span>
                <span className="px-2 py-0.5 bg-indigo-600 text-white text-[10px] font-bold rounded-full">
                  Verified Tactic
                </span>
              </div>
              <p className="text-xs text-indigo-900/80 leading-relaxed max-w-3xl">
                যখন ক্রেতাকে ৩টি বিকল্প দেয়া হয় (১টি স্টার্টার, ২টি মোস্ট পপুলার এবং ৩টি মেগা বান্ডেল), প্রায় <strong>৬৭% ক্রেতা ২য় অথবা ৩য় বান্ডেলটি নির্বাচন করেন</strong>। এতে প্রতি অর্ডারের সাইজ দ্বিগুণ বা তিনগুণ বৃদ্ধি পায় এবং অবিক্রিত স্টক দ্রুত বিক্রি হয়।
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleDeployTriadCampaign}
                className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Zap className="w-4 h-4" /> ৩-টিয়ার ক্যাম্পেইন লাইভ করুন
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Interactive Parameters Configurator */}
            <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200 p-5 shadow-xs space-y-4">
              <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                <h4 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-indigo-600" />
                  ৩-টিয়ার প্যাকেজ কনফিগারেশন
                </h4>
                <span className="text-[11px] font-mono font-bold text-slate-500">
                  ভিত্তি মূল্য: ৳{basePrice.toLocaleString()}
                </span>
              </div>

              {/* Tier 1 Controls */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-800">
                    টিয়ার ১: সিঙ্গেল স্টার্টার প্যাক
                  </span>
                  <span className="text-[11px] font-bold text-slate-500">
                    {tier1Qty}টি পণ্য
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className="text-[10px] text-slate-400 font-semibold block">পরিমাণ (Qty)</label>
                    <input
                      type="number"
                      min={1}
                      max={5}
                      value={tier1Qty}
                      onChange={(e) => setTier1Qty(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-1 text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 font-semibold block">ডিসকাউন্ট (%)</label>
                    <input
                      type="number"
                      min={0}
                      max={50}
                      value={tier1Discount}
                      onChange={(e) => setTier1Discount(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-1 text-xs font-bold"
                    />
                  </div>
                </div>
                <div className="text-right text-[11px] font-extrabold text-slate-800">
                  নির্ধারিত মূল্য: ৳{tier1Price.toLocaleString()}
                </div>
              </div>

              {/* Tier 2 Controls */}
              <div className="p-3 bg-indigo-50/70 rounded-2xl border border-indigo-200 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-xs text-indigo-950">
                      টিয়ার ২: ডাবল প্যাক (মোস্ট পপুলার)
                    </span>
                    <span className="px-1.5 py-0.2 bg-indigo-600 text-white text-[9px] font-bold rounded">
                      STAR CHOICE
                    </span>
                  </div>
                  <span className="text-[11px] font-bold text-indigo-800">
                    {tier2Qty}টি পণ্য
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className="text-[10px] text-slate-400 font-semibold block">পরিমাণ (Qty)</label>
                    <input
                      type="number"
                      min={2}
                      max={10}
                      value={tier2Qty}
                      onChange={(e) => setTier2Qty(Math.max(2, parseInt(e.target.value) || 2))}
                      className="w-full bg-white border border-indigo-300 rounded-xl px-2.5 py-1 text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 font-semibold block">ডিসকাউন্ট (%)</label>
                    <input
                      type="number"
                      min={1}
                      max={60}
                      value={tier2Discount}
                      onChange={(e) => setTier2Discount(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-full bg-white border border-indigo-300 rounded-xl px-2.5 py-1 text-xs font-bold"
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-emerald-700 font-bold">
                    গ্রাহকের সাশ্রয়: ৳{tier2Savings.toLocaleString()}
                  </span>
                  <span className="font-extrabold text-indigo-950">
                    নির্ধারিত মূল্য: ৳{tier2Price.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Tier 3 Controls */}
              <div className="p-3 bg-purple-50/70 rounded-2xl border border-purple-200 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-xs text-purple-950">
                      টিয়ার ৩: ট্রায়াড মেগা সেভার
                    </span>
                    <span className="px-1.5 py-0.2 bg-purple-600 text-white text-[9px] font-bold rounded">
                      MAX VALUE
                    </span>
                  </div>
                  <span className="text-[11px] font-bold text-purple-800">
                    {tier3Qty}টি পণ্য
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className="text-[10px] text-slate-400 font-semibold block">পরিমাণ (Qty)</label>
                    <input
                      type="number"
                      min={3}
                      max={20}
                      value={tier3Qty}
                      onChange={(e) => setTier3Qty(Math.max(3, parseInt(e.target.value) || 3))}
                      className="w-full bg-white border border-purple-300 rounded-xl px-2.5 py-1 text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 font-semibold block">ডিসকাউন্ট (%)</label>
                    <input
                      type="number"
                      min={5}
                      max={70}
                      value={tier3Discount}
                      onChange={(e) => setTier3Discount(Math.max(5, parseInt(e.target.value) || 5))}
                      className="w-full bg-white border border-purple-300 rounded-xl px-2.5 py-1 text-xs font-bold"
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-emerald-700 font-bold">
                    গ্রাহকের সাশ্রয়: ৳{tier3Savings.toLocaleString()}
                  </span>
                  <span className="font-extrabold text-purple-950">
                    নির্ধারিত মূল্য: ৳{tier3Price.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Ready Copy Hook for SMS/Ad */}
              <div className="p-3 bg-slate-900 text-white rounded-2xl space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-indigo-300 flex items-center gap-1">
                    <Megaphone className="w-3.5 h-3.5" /> রেডি মার্কেটিং হুক (Copy for Ads):
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      const text = `🔥 ৩-প্যাক মেগা সেভার ডিল! ${currentProduct?.name}: ১টি ৳${tier1Price.toLocaleString()}, ২টি ৳${tier2Price.toLocaleString()} (১০% অফ), আর ৩টি নিলে পাচ্ছেন সরাসরি ২৫% মহা ছাড় ও ফ্রি ডেলিভারি! এখনই ভিজিট করুন: smartshop.bd`;
                      navigator.clipboard.writeText(text);
                      addToast("কপি করা হয়েছে!", "success");
                    }}
                    className="p-1 hover:text-indigo-400 text-slate-400"
                    title="কপি করুন"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed font-mono">
                  {`🔥 ৩-প্যাক মেগা সেভার ডিল! ${currentProduct?.name}: ১টি ৳${tier1Price.toLocaleString()}, ২টি ৳${tier2Price.toLocaleString()}, আর ৩টি নিলে পাচ্ছেন সরাসরি ২৫% মহা ছাড় ও ফ্রি ডেলিভারি!`}
                </p>
                <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => {
                      const text = `🔥 ৩-প্যাক মেগা সেভার ডিল! ${currentProduct?.name}: ১টি ৳${tier1Price.toLocaleString()}, ২টি ৳${tier2Price.toLocaleString()}, ৩টি মাত্র ৳${tier3Price.toLocaleString()} ও ফ্রি ডেলিভারি!`;
                      if (onSendToBroadcast) {
                        onSendToBroadcast(text);
                      } else {
                        navigator.clipboard.writeText(text);
                        addToast("ব্রডকাস্ট টেক্সট কপি করা হয়েছে!", "info");
                      }
                    }}
                    className="text-[10px] font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
                  >
                    <Send className="w-3 h-3" /> ব্রডকাস্টে পাঠান
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column: Live Triad Customer Experience Card */}
            <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 p-5 shadow-xs space-y-4 flex flex-col justify-between">
              <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                <div>
                  <h4 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                    <Eye className="w-4 h-4 text-indigo-600" />
                    লাইভ কাস্টমার ইন্টারঅ্যাকশন প্রিভিউ ({previewDevice === "desktop" ? "ডেস্কটপ" : "মোবাইল"})
                  </h4>
                  <p className="text-xs text-slate-400">
                    গ্রাহক আপনার শপে এই ৩টি প্যাকেজ পাশাপাশি যেভাবে দেখতে পাবে।
                  </p>
                </div>

                <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200">
                  A/B Tested 3-Tier Layout
                </span>
              </div>

              {/* Preview Cards Container */}
              <div
                className={`w-full mx-auto transition-all ${
                  previewDevice === "mobile"
                    ? "max-w-sm p-4 bg-slate-950 rounded-3xl border-4 border-slate-800 shadow-2xl"
                    : "p-4 bg-slate-50/70 rounded-2xl border border-slate-200"
                }`}
              >
                {/* Product mini header */}
                <div className="flex items-center gap-3 mb-4 bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs">
                  <img
                    src={currentProduct?.image}
                    alt=""
                    className="w-12 h-12 object-cover rounded-lg border border-slate-100"
                  />
                  <div>
                    <h5 className="font-black text-slate-900 text-xs line-clamp-1">
                      {currentProduct?.name}
                    </h5>
                    <span className="text-[10px] text-slate-500 font-bold">
                      রেগুলার সিঙ্গেল প্রাইস: ৳{basePrice.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* 3 Interactive Cards */}
                <div
                  className={`grid gap-3 ${
                    previewDevice === "mobile"
                      ? "grid-cols-1"
                      : "grid-cols-1 sm:grid-cols-3"
                  }`}
                >
                  {/* Tier 1 Card */}
                  <div className="bg-white p-4 rounded-2xl border border-slate-200 text-center space-y-2 flex flex-col justify-between shadow-2xs relative">
                    <div className="space-y-1">
                      <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                        স্টার্টার প্যাক
                      </span>
                      <h6 className="font-black text-slate-900 text-sm">
                        {tier1Qty}টি পিস
                      </h6>
                      <div className="pt-2">
                        <span className="text-xl font-black text-slate-900">
                          ৳{tier1Price.toLocaleString()}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500 pt-1">
                        সাধারণ ট্রায়াল অর্ডারের জন্য উপযুক্ত।
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => addToast("সিঙ্গেল প্যাক টেস্ট ক্লিক!", "info")}
                      className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors mt-3"
                    >
                      সিঙ্গেল কিনুন
                    </button>
                  </div>

                  {/* Tier 2 Card (HERO / MOST POPULAR) */}
                  <div className="bg-gradient-to-b from-indigo-50/80 via-white to-indigo-50/40 p-4 rounded-2xl border-2 border-indigo-600 text-center space-y-2 flex flex-col justify-between shadow-lg relative transform sm:-translate-y-2">
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-[10px] font-black uppercase px-3 py-0.5 rounded-full shadow-xs flex items-center gap-1">
                      <Flame className="w-3 h-3 text-amber-300" /> মোস্ট পপুলার
                    </div>

                    <div className="space-y-1 pt-1">
                      <span className="text-[10px] font-extrabold text-indigo-700 uppercase tracking-wider block">
                        ডাবল প্যাক সেভার
                      </span>
                      <h6 className="font-black text-slate-900 text-sm">
                        {tier2Qty}টি পিস
                      </h6>
                      <div className="pt-2">
                        <div className="text-[11px] text-slate-400 line-through">
                          ৳{(basePrice * tier2Qty).toLocaleString()}
                        </div>
                        <span className="text-2xl font-black text-indigo-700">
                          ৳{tier2Price.toLocaleString()}
                        </span>
                      </div>
                      <div className="text-[10px] font-bold text-emerald-700 bg-emerald-50 py-0.5 px-2 rounded-full inline-block">
                        সাশ্রয় ৳{tier2Savings.toLocaleString()} ({tier2Discount}% অফ)
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => addToast("মোস্ট পপুলার ডাবল প্যাক টেস্ট ক্লিক!", "success")}
                      className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-colors mt-3 flex items-center justify-center gap-1"
                    >
                      ডাবল প্যাক নিন →
                    </button>
                  </div>

                  {/* Tier 3 Card (MAX VALUE) */}
                  <div className="bg-white p-4 rounded-2xl border border-purple-300 text-center space-y-2 flex flex-col justify-between shadow-2xs relative">
                    <div className="space-y-1">
                      <span className="text-[10px] font-extrabold text-purple-700 uppercase tracking-wider block">
                        ফ্যামিলি ট্রায়াড প্যাক
                      </span>
                      <h6 className="font-black text-slate-900 text-sm">
                        {tier3Qty}টি পিস
                      </h6>
                      <div className="pt-2">
                        <div className="text-[11px] text-slate-400 line-through">
                          ৳{(basePrice * tier3Qty).toLocaleString()}
                        </div>
                        <span className="text-xl font-black text-purple-900">
                          ৳{tier3Price.toLocaleString()}
                        </span>
                      </div>
                      <div className="text-[10px] font-bold text-purple-700 bg-purple-50 py-0.5 px-2 rounded-full inline-block">
                        সাশ্রয় ৳{tier3Savings.toLocaleString()} ({tier3Discount}% অফ)
                      </div>
                      <p className="text-[10px] text-emerald-600 font-bold pt-1">
                        + ফ্রি ক্যাশ অন ডেলিভারি
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => addToast("মেগা ট্রায়াড প্যাক টেস্ট ক্লিক!", "success")}
                      className="w-full py-2 bg-purple-900 hover:bg-purple-800 text-white font-bold text-xs rounded-xl transition-colors mt-3"
                    >
                      ৩-প্যাক মেগা অফার
                    </button>
                  </div>
                </div>
              </div>

              {/* Bottom Quick Activation Action */}
              <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs text-slate-500 font-semibold flex items-center gap-1">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  গ্রাহক ফ্রন্টে এটি প্রদর্শিত হলে এভারেজ অর্ডার সাইজ (AOV) ৩৫% বেড়ে যায়।
                </span>
                <button
                  type="button"
                  onClick={handleDeployTriadCampaign}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" /> স্টোরফ্রন্টে ৩-টিয়ার সক্রিয় করুন
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STRATEGY 2: CONTRAST EFFECT BUILDER & SIMULATOR */}
      {activeStrategy === "contrast-effect" && (
        <div className="space-y-6">
          {/* Strategy Deep Dive Info */}
          <div className="bg-rose-900/10 border border-rose-200 rounded-3xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-black text-rose-950 text-sm">
                  মনস্তাত্ত্বিক মূলনীতি: পারসেপচুয়াল কন্ট্রাস্ট ও ডিকয় কম্প্যারিজন (Contrast Effect)
                </span>
                <span className="px-2 py-0.5 bg-rose-600 text-white text-[10px] font-bold rounded-full">
                  High-Impact Heuristic
                </span>
              </div>
              <p className="text-xs text-rose-900/80 leading-relaxed max-w-3xl">
                কোনো পণ্য একা দেখলে দাম বেশি মনে হতে পারে, কিন্তু যখনই তার পাশে একটি চড়া মার্কেট প্রাইস বা অন্য কোনো অলটারনেটিভের ঘাটতি তুলে ধরা হয়, অবচেতন মনে আপনার অফারটি <strong>সবচেয়ে লাভজনক সিদ্ধান্ত</strong> হিসেবে স্বীকৃতি পায়।
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleDeployContrastCampaign}
                className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Zap className="w-4 h-4" /> কন্ট্রাস্ট ব্যানার লাইভ করুন
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Contrast Comparator Setup */}
            <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200 p-5 shadow-xs space-y-4">
              <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                <h4 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-rose-600" />
                  কন্ট্রাস্ট প্যারামিটার ও কম্প্যারিজন কনফিগারার
                </h4>
              </div>

              {/* Price Contrast Inputs */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-100 rounded-2xl border border-slate-300">
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                    বাজার দর / চড়া ডিকয় প্রাইস
                  </label>
                  <div className="flex items-center gap-1">
                    <span className="font-black text-slate-700 text-sm">৳</span>
                    <input
                      type="number"
                      value={contrastCompetitorPrice}
                      onChange={(e) => setContrastCompetitorPrice(parseInt(e.target.value) || 0)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-2 py-1 text-sm font-extrabold text-slate-900"
                    />
                  </div>
                </div>

                <div className="p-3 bg-rose-50 rounded-2xl border border-rose-300">
                  <label className="text-[10px] font-bold text-rose-700 uppercase block mb-1">
                    আমাদের স্পেশাল অফার প্রাইস
                  </label>
                  <div className="flex items-center gap-1">
                    <span className="font-black text-rose-700 text-sm">৳</span>
                    <input
                      type="number"
                      value={ourContrastPrice}
                      onChange={(e) => setOurContrastPrice(parseInt(e.target.value) || 0)}
                      className="w-full bg-white border border-rose-300 rounded-xl px-2 py-1 text-sm font-extrabold text-rose-900"
                    />
                  </div>
                </div>
              </div>

              {/* Contrast Metrics Tag */}
              <div className="p-3 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl border border-emerald-200 flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] text-emerald-800 font-bold block">সরাসরি সাশ্রয়ের পরিমাণ</span>
                  <strong className="text-emerald-700 text-base font-black">
                    ৳{contrastSavings.toLocaleString()}
                  </strong>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-emerald-800 font-bold block">কনট্রাস্ট ডিসকাউন্ট রেট</span>
                  <span className="px-2 py-0.5 bg-emerald-600 text-white font-extrabold text-xs rounded-full">
                    {contrastPercent}% অফ
                  </span>
                </div>
              </div>

              {/* Benefit Bullet 1 */}
              <div>
                <label className="text-[10px] text-slate-500 font-bold block mb-1">
                  আমাদের প্রধান সুবিধা ১ (Contrast Advantage)
                </label>
                <input
                  type="text"
                  value={contrastBenefit1}
                  onChange={(e) => setContrastBenefit1(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold"
                />
              </div>

              {/* Benefit Bullet 2 */}
              <div>
                <label className="text-[10px] text-slate-500 font-bold block mb-1">
                  আমাদের প্রধান সুবিধা ২
                </label>
                <input
                  type="text"
                  value={contrastBenefit2}
                  onChange={(e) => setContrastBenefit2(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold"
                />
              </div>

              {/* Competitor Risk Tag */}
              <div>
                <label className="text-[10px] text-slate-500 font-bold block mb-1">
                  অন্যান্য সাধারণ দোকানের ঝুঁকি / সীমাবদ্ধতা
                </label>
                <input
                  type="text"
                  value={competitorDisadvantage}
                  onChange={(e) => setCompetitorDisadvantage(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold"
                />
              </div>

              {/* Copy Template Box */}
              <div className="p-3 bg-slate-900 text-white rounded-2xl space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-rose-300 flex items-center gap-1">
                    <Megaphone className="w-3.5 h-3.5" /> ফেসবুক ও সোশ্যাল এড ক্যাপশন:
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      const text = `⚡ বাজারে যা ৳${contrastCompetitorPrice.toLocaleString()} দিয়ে কিনতে হয়, আজ আমাদের কাছে পাচ্ছেন মাত্র ৳${ourContrastPrice.toLocaleString()} মূল্যে! পুরো ৳${contrastSavings.toLocaleString()} সাশ্রয় (${contrastPercent}% ডিসকাউন্ট)। সাথে ১০০% অরিজিনাল গ্যারান্টি ও ফ্রি হোম ডেলিভারি! কোড: CONTRAST50`;
                      navigator.clipboard.writeText(text);
                      addToast("কন্ট্রাস্ট ক্যাপশন কপি করা হয়েছে!", "success");
                    }}
                    className="p-1 hover:text-rose-400 text-slate-400"
                    title="কপি করুন"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed font-mono">
                  {`⚡ বাজারে যা ৳${contrastCompetitorPrice.toLocaleString()}, আজ পাচ্ছেন মাত্র ৳${ourContrastPrice.toLocaleString()} মূল্যে (সাশ্রয় ৳${contrastSavings.toLocaleString()})!`}
                </p>
              </div>
            </div>

            {/* Right Column: Live Contrast Comparator Visual */}
            <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 p-5 shadow-xs space-y-4 flex flex-col justify-between">
              <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                <div>
                  <h4 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                    <Eye className="w-4 h-4 text-rose-600" />
                    সাইড-বাই-সাইড কন্ট্রাস্ট কার্ড প্রিভিউ
                  </h4>
                  <p className="text-xs text-slate-400">
                    উচ্চমূল্যের বিকল্পের পাশে গ্রাহক কীভাবে আপনার অফারকে পরম সুবিধাজনক দেখবে।
                  </p>
                </div>

                <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                  Visual Contrast Ratio: 2.1x
                </span>
              </div>

              {/* Split Comparison Visual */}
              <div
                className={`w-full mx-auto transition-all ${
                  previewDevice === "mobile"
                    ? "max-w-sm p-4 bg-slate-950 rounded-3xl border-4 border-slate-800 shadow-2xl"
                    : "p-4 bg-slate-50/70 rounded-2xl border border-slate-200"
                }`}
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Competitor / Market Card (MUTED CONTRAST) */}
                  <div className="bg-slate-100 p-4 rounded-2xl border border-slate-300 text-slate-600 space-y-3 flex flex-col justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                          সাধারণ বাজার বা অন্যান্য শপ
                        </span>
                        <span className="text-[9px] font-bold bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded">
                          হাই প্রাইস
                        </span>
                      </div>

                      <div className="pt-2">
                        <span className="text-2xl font-black text-slate-700">
                          ৳{contrastCompetitorPrice.toLocaleString()}
                        </span>
                        <span className="block text-[10px] text-slate-400">
                          অতিরিক্ত ডেলিভারি চার্জ প্রযোজ্য
                        </span>
                      </div>

                      <div className="space-y-1.5 pt-2 text-[11px] text-slate-500">
                        <div className="flex items-center gap-1.5 text-rose-600 font-semibold">
                          <span>✕</span>
                          <span>{competitorDisadvantage}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span>✕</span>
                          <span>কোনো মানি-ব্যাক গ্যারান্টি নেই</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-2.5 bg-slate-200/80 rounded-xl text-center text-xs font-bold text-slate-500">
                      অতিরিক্ত ব্যয় ও অনিশ্চয়তা
                    </div>
                  </div>

                  {/* Our Offer Card (HIGH INTENSITY CONTRAST) */}
                  <div className="bg-gradient-to-br from-rose-950 via-slate-900 to-indigo-950 p-4 rounded-2xl border-2 border-rose-500 text-white space-y-3 flex flex-col justify-between shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 bg-rose-600 text-white text-[10px] font-black uppercase px-2.5 py-0.5 rounded-bl-xl shadow-xs">
                      আমাদের স্পেশাল ডিল
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <img
                          src={currentProduct?.image}
                          alt=""
                          className="w-10 h-10 object-cover rounded-lg border border-rose-400/40"
                        />
                        <span className="text-xs font-extrabold text-white line-clamp-1">
                          {currentProduct?.name}
                        </span>
                      </div>

                      <div className="pt-2">
                        <div className="text-[11px] text-slate-400 line-through">
                          বাজার দর: ৳{contrastCompetitorPrice.toLocaleString()}
                        </div>
                        <div className="flex items-baseline gap-2">
                          <span className="text-2xl font-black text-rose-400">
                            ৳{ourContrastPrice.toLocaleString()}
                          </span>
                          <span className="text-[10px] font-extrabold text-emerald-400 bg-emerald-950/80 border border-emerald-600/50 px-2 py-0.5 rounded-full">
                            সাশ্রয় ৳{contrastSavings.toLocaleString()}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-1.5 pt-1 text-[11px] text-slate-200">
                        <div className="flex items-center gap-1.5 text-emerald-300 font-bold">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span>{contrastBenefit1}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-emerald-300 font-bold">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span>{contrastBenefit2}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-emerald-300 font-bold">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span>{contrastBenefit3}</span>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => addToast("কন্ট্রাস্ট অফার গ্রহণ টেস্ট ক্লিক!", "success")}
                      className="w-full py-2.5 bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-extrabold text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-1.5"
                    >
                      <Zap className="w-3.5 h-3.5" /> সাশ্রয়ী মূল্যে অর্ডার করুন →
                    </button>
                  </div>
                </div>
              </div>

              {/* Bottom Quick Action */}
              <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs text-slate-500 font-semibold flex items-center gap-1">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  কনট্রাস্ট ব্যানার ক্রেতার মনে দ্বিমত না রেখে সাথে সাথে কেনার প্রেরণা দেয়।
                </span>
                <button
                  type="button"
                  onClick={handleDeployContrastCampaign}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" /> স্টোরে কন্ট্রাস্ট ব্যানার পুশ করুন
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STRATEGY 3: ANCHORING BIAS BUILDER & SIMULATOR */}
      {activeStrategy === "anchoring-bias" && (
        <div className="space-y-6">
          {/* Strategy Deep Dive Info */}
          <div className="bg-amber-900/10 border border-amber-200 rounded-3xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-black text-amber-950 text-sm">
                  মনস্তাত্ত্বিক মূলনীতি: প্রাইস অ্যাঙ্করিং ও ফ্রেইমিং হিউরিস্টিক (Anchoring Bias)
                </span>
                <span className="px-2 py-0.5 bg-amber-600 text-white text-[10px] font-bold rounded-full">
                  Classic Behavioral Bias
                </span>
              </div>
              <p className="text-xs text-amber-900/80 leading-relaxed max-w-3xl">
                গ্রাহক যখন প্রথম কোনো বড় সংখ্যা (MRP বা Was Price) দেখে, তার মন সেই সংখ্যাটিকে পণ্যের আসল মূল্য হিসেবে রেজিস্টার করে। এরপরে যখন ডিসকাউন্টেড প্রাইস ও <strong>দৈনিক ক্ষুদ্র খরচের হিসাব ("প্রতিদিন মাত্র ৳{dailyAmortizedCost}")</strong> দেখানো হয়, তখন পণ্যটি কেনা অবধারিত লাভজনক মনে হয়।
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleDeployAnchoringCampaign}
                className="px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Zap className="w-4 h-4" /> অ্যাঙ্করিং পপ-আপ চালু করুন
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Anchoring Setup */}
            <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200 p-5 shadow-xs space-y-4">
              <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                <h4 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-amber-600" />
                  অ্যাঙ্করিং ও ডেইলি রিফ্রেমিং প্যারামিটার
                </h4>
              </div>

              {/* Price Anchors Inputs */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                    নোঙর মূল্য / MRP (Anchor)
                  </label>
                  <div className="flex items-center gap-1">
                    <span className="font-black text-slate-700 text-sm">৳</span>
                    <input
                      type="number"
                      value={anchorOriginalPrice}
                      onChange={(e) => setAnchorOriginalPrice(parseInt(e.target.value) || 0)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-2 py-1 text-sm font-extrabold text-slate-900"
                    />
                  </div>
                </div>

                <div className="p-3 bg-amber-50 rounded-2xl border border-amber-300">
                  <label className="text-[10px] font-bold text-amber-800 uppercase block mb-1">
                    অফার বিক্রয় মূল্য (Now)
                  </label>
                  <div className="flex items-center gap-1">
                    <span className="font-black text-amber-800 text-sm">৳</span>
                    <input
                      type="number"
                      value={anchorSellingPrice}
                      onChange={(e) => setAnchorSellingPrice(parseInt(e.target.value) || 0)}
                      className="w-full bg-white border border-amber-300 rounded-xl px-2 py-1 text-sm font-extrabold text-amber-950"
                    />
                  </div>
                </div>
              </div>

              {/* Daily Cost Reframe Slider */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-slate-700">
                    দৈনিক ব্যবহারের মেয়াদ (Micro-Cost Framing):
                  </label>
                  <span className="text-xs font-mono font-bold text-indigo-600">
                    {anchorDurationDays} দিন
                  </span>
                </div>
                <input
                  type="range"
                  min={15}
                  max={365}
                  step={5}
                  value={anchorDurationDays}
                  onChange={(e) => setAnchorDurationDays(parseInt(e.target.value) || 30)}
                  className="w-full accent-amber-600 cursor-pointer"
                />
                <div className="flex items-center justify-between text-[11px] pt-1">
                  <span className="text-slate-500">প্রতিদিনের ফ্র্যাকশনাল খরচ:</span>
                  <span className="font-extrabold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-md">
                    মাত্র ৳{dailyAmortizedCost} / দিন
                  </span>
                </div>
              </div>

              {/* Micro-Copy Hook */}
              <div>
                <label className="text-[10px] text-slate-500 font-bold block mb-1">
                  কাস্টম সাইকোলজি হুক
                </label>
                <input
                  type="text"
                  value={anchorCustomHook}
                  onChange={(e) => setAnchorCustomHook(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold"
                />
              </div>

              {/* Anchoring Metrics Box */}
              <div className="grid grid-cols-2 gap-2 text-center text-xs">
                <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-200">
                  <span className="text-[10px] text-emerald-800 font-bold block">মোট সাশ্রয়</span>
                  <strong className="text-emerald-700 font-black text-sm">
                    ৳{anchorSavings.toLocaleString()}
                  </strong>
                </div>
                <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-200">
                  <span className="text-[10px] text-amber-800 font-bold block">অফ পার্সেন্টেজ</span>
                  <strong className="text-amber-800 font-black text-sm">
                    {anchorDiscountPercent}% ডিসকাউন্ট
                  </strong>
                </div>
              </div>

              {/* Copy Template Box */}
              <div className="p-3 bg-slate-900 text-white rounded-2xl space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-amber-300 flex items-center gap-1">
                    <Megaphone className="w-3.5 h-3.5" /> এসএমএস ও হোয়াটসঅ্যাপ পুশ হুক:
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      const text = `⚓ বিশেষ অফার! ${currentProduct?.name}-এর নিয়মিত মূল্য ৳${anchorOriginalPrice.toLocaleString()} টাকা, আজ পাচ্ছেন মাত্র ৳${anchorSellingPrice.toLocaleString()} মূল্যে (সাশ্রয় ৳${anchorSavings.toLocaleString()})! দৈনিক হিসেবে খরচ মাত্র ৳${dailyAmortizedCost} টাকা। স্টক সীমিত, এখনই অর্ডার করুন: smartshop.bd`;
                      navigator.clipboard.writeText(text);
                      addToast("অ্যাঙ্করিং টেক্সট কপি করা হয়েছে!", "success");
                    }}
                    className="p-1 hover:text-amber-400 text-slate-400"
                    title="কপি করুন"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed font-mono">
                  {`⚓ বিশেষ অফার! নিয়মিত মূল্য ৳${anchorOriginalPrice.toLocaleString()} টাকা ➔ আজ মাত্র ৳${anchorSellingPrice.toLocaleString()} টাকা! (সাশ্রয় ৳${anchorSavings.toLocaleString()})। প্রতিদিন মাত্র ৳${dailyAmortizedCost} টাকা!`}
                </p>
              </div>
            </div>

            {/* Right Column: Live Anchoring Card Visual */}
            <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 p-5 shadow-xs space-y-4 flex flex-col justify-between">
              <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                <div>
                  <h4 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                    <Eye className="w-4 h-4 text-amber-600" />
                    প্রাইস অ্যাঙ্করিং লাইভ প্রিভিউ
                  </h4>
                  <p className="text-xs text-slate-400">
                    বড় স্ট্রাইক প্রাইস নোঙর এবং দৈনিক ক্ষুদ্র খরচ দেখে ক্রেতার পারসিভড ভ্যালু বৃদ্ধি পায়।
                  </p>
                </div>

                <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                  Perceived Value Multiplier: 2.3x
                </span>
              </div>

              {/* Anchoring Card Display */}
              <div
                className={`w-full mx-auto transition-all ${
                  previewDevice === "mobile"
                    ? "max-w-sm p-4 bg-slate-950 rounded-3xl border-4 border-slate-800 shadow-2xl"
                    : "p-4 bg-slate-50/70 rounded-2xl border border-slate-200"
                }`}
              >
                <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-md space-y-4">
                  {/* Top Anchoring Badges */}
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 bg-rose-600 text-white text-[10px] font-extrabold uppercase rounded-full shadow-2xs">
                      মেগা সেভিংস অফার
                    </span>
                    <span className="text-[10px] font-extrabold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                      {anchorDiscountPercent}% ইনস্ট্যান্ট ছাড়
                    </span>
                  </div>

                  <div className="flex items-center gap-4">
                    <img
                      src={currentProduct?.image}
                      alt=""
                      className="w-20 h-20 object-cover rounded-xl border border-slate-200 shadow-2xs"
                    />
                    <div className="space-y-1">
                      <h5 className="font-black text-slate-900 text-sm line-clamp-1">
                        {currentProduct?.name}
                      </h5>
                      <p className="text-[11px] text-slate-500">
                        অফিসিয়াল ওয়ারেন্টি ও অরিজিনাল কোয়ালিটি নিশ্চয়তা
                      </p>

                      {/* Anchoring Strike-Through & Big Price */}
                      <div className="pt-1 flex items-baseline gap-2">
                        <span className="text-sm text-slate-400 line-through font-mono font-bold">
                          ৳{anchorOriginalPrice.toLocaleString()}
                        </span>
                        <span className="text-2xl font-black text-slate-900 font-mono">
                          ৳{anchorSellingPrice.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Micro-Reframing Banner (One cup of tea psychology) */}
                  <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">☕</span>
                      <div>
                        <span className="text-[10px] font-extrabold uppercase text-amber-900 block">
                          এক কাপ চায়ের খরচে প্রিমিয়াম লাইফস্টাইল
                        </span>
                        <span className="text-xs font-bold text-amber-800">
                          {anchorCustomHook}
                        </span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-sm font-black text-amber-950 font-mono">
                        ৳{dailyAmortizedCost}
                      </span>
                      <span className="block text-[9px] text-amber-700">/প্রতিদিন</span>
                    </div>
                  </div>

                  {/* Savings Summary Banner */}
                  <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-between text-xs text-emerald-800 font-bold">
                    <span>আপনার মোট লাভ ও সাশ্রয়:</span>
                    <span className="text-emerald-700 font-black text-sm">
                      + ৳{anchorSavings.toLocaleString()} টাকা
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => addToast("অ্যাঙ্করিং অফার টেস্ট অর্ডার ক্লিক!", "success")}
                    className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5"
                  >
                    <Zap className="w-3.5 h-3.5" /> সাশ্রয়ী মূল্যে এখনই সংগ্রহ করুন →
                  </button>
                </div>
              </div>

              {/* Bottom Quick Action */}
              <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs text-slate-500 font-semibold flex items-center gap-1">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  অ্যাঙ্করিংয়ের মাধ্যমে গ্রাহক মূল্যকে বোঝা না ভেবে বড় সুযোগ হিসেবে দেখে।
                </span>
                <button
                  type="button"
                  onClick={handleDeployAnchoringCampaign}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" /> স্টোরে অ্যাঙ্করিং পপ-আপ সক্রিয় করুন
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
