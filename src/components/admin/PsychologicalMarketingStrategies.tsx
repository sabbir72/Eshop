import React, { useState, useMemo, useEffect } from "react";
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
  Brain,
  Truck,
  RotateCcw,
  CheckCheck,
  Search,
  X,
  Filter,
  Package,
  CheckCircle,
  Trash2,
} from "lucide-react";

interface PsychologicalMarketingStrategiesProps {
  onOpenCreateModal?: (type: "slider" | "popup" | "campaign") => void;
  onSelectStrategyCopy?: (title: string, desc: string) => void;
  onSendToBroadcast?: (text: string) => void;
}

export const PsychologicalMarketingStrategies: React.FC<
  PsychologicalMarketingStrategiesProps
> = ({ onOpenCreateModal, onSelectStrategyCopy, onSendToBroadcast }) => {
  const {
    products,
    addAdvertisement,
    addCoupon,
    addToast,
    settings,
    psychologicalCampaigns = [],
    addPsychologicalCampaign,
    togglePsychologicalCampaignStatus,
    deletePsychologicalCampaign,
  } = useStore();

  const [activeStrategy, setActiveStrategy] = useState<
    "round-of-three" | "contrast-effect" | "anchoring-bias"
  >("round-of-three");

  const [previewDevice, setPreviewDevice] = useState<"desktop" | "mobile">("desktop");

  // Selected product for live simulations
  const [selectedProductId, setSelectedProductId] = useState<string>(
    products[0]?.id || ""
  );

  // All Items Picker Modal and Filtering State
  const [isItemPickerOpen, setIsItemPickerOpen] = useState(false);
  const [itemSearchQuery, setItemSearchQuery] = useState("");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState("all");

  const currentProduct = useMemo(
    () => products.find((p) => p.id === selectedProductId) || products[0],
    [products, selectedProductId]
  );

  // Available unique categories for filtering
  const availableCategories = useMemo(() => {
    const cats = new Set<string>();
    products.forEach((p) => {
      if (p.categoryName) cats.add(p.categoryName);
    });
    return Array.from(cats);
  }, [products]);

  // Filtered system products list for the item picker
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const q = itemSearchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        (p.name_bn && p.name_bn.toLowerCase().includes(q)) ||
        (p.sku && p.sku.toLowerCase().includes(q)) ||
        (p.brandName && p.brandName.toLowerCase().includes(q)) ||
        (p.categoryName && p.categoryName.toLowerCase().includes(q));

      const matchesCategory =
        selectedCategoryFilter === "all" ||
        p.categoryName === selectedCategoryFilter;

      return matchesSearch && matchesCategory;
    });
  }, [products, itemSearchQuery, selectedCategoryFilter]);

  // Fallback product image and price getters
  const basePrice = currentProduct?.discountPrice || currentProduct?.sellingPrice || 1500;
  const productImage =
    currentProduct?.mainImage ||
    "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80";

  // -------------------------------------------------------------
  // STRATEGY 1: ROUND OF THREE (RULE OF THREE / ৩ এর নিয়ম) STATE
  // -------------------------------------------------------------
  const [tier1Qty, setTier1Qty] = useState(1);
  const [tier1Discount, setTier1Discount] = useState(0); // 0%
  const [tier2Qty, setTier2Qty] = useState(2);
  const [tier2Discount, setTier2Discount] = useState(12); // 12% off
  const [tier3Qty, setTier3Qty] = useState(3);
  const [tier3Discount, setTier3Discount] = useState(25); // 25% off + Free gift

  const tier1Price = Math.round(basePrice * tier1Qty * (1 - tier1Discount / 100));
  const tier2Price = Math.round(basePrice * tier2Qty * (1 - tier2Discount / 100));
  const tier3Price = Math.round(basePrice * tier3Qty * (1 - tier3Discount / 100));

  const tier1PerPiece = Math.round(tier1Price / tier1Qty);
  const tier2PerPiece = Math.round(tier2Price / tier2Qty);
  const tier3PerPiece = Math.round(tier3Price / tier3Qty);

  const tier2Savings = basePrice * tier2Qty - tier2Price;
  const tier3Savings = basePrice * tier3Qty - tier3Price;

  // -------------------------------------------------------------
  // STRATEGY 2: CONTRAST EFFECT (স্বচ্ছ বৈপরীত্য প্রভাব) STATE
  // -------------------------------------------------------------
  const [contrastCompetitorPrice, setContrastCompetitorPrice] = useState<number>(
    Math.round(basePrice * 1.6)
  );
  const [ourContrastPrice, setOurContrastPrice] = useState<number>(basePrice);
  const [contrastBenefit1, setContrastBenefit1] = useState(
    "১০০% অফিসিয়াল ১ বছরের রিপ্লেসমেন্ট ওয়ারেন্টি"
  );
  const [contrastBenefit2, setContrastBenefit2] = useState(
    "ওপেন-বক্স ক্যাশ অন ডেলিভারি (পণ্য দেখে মূল্য পরিশোধ)"
  );
  const [contrastBenefit3, setContrastBenefit3] = useState(
    "৭ দিনের নিঃশর্ত রিটার্ন ও মানি-ব্যাক গ্যারান্টি"
  );
  const [competitorDisadvantage, setCompetitorDisadvantage] = useState(
    "অজানা লোকাল ওয়ারেন্টি, হিডেন ডেলিভারি চার্জ ও অগ্রিম পেমেন্টের ঝুঁকি"
  );

  const contrastSavings = Math.max(0, contrastCompetitorPrice - ourContrastPrice);
  const contrastPercent = Math.round((contrastSavings / (contrastCompetitorPrice || 1)) * 100);

  // -------------------------------------------------------------
  // STRATEGY 3: ANCHORING BIAS (স্বচ্ছ নোঙর ও মাইক্রো ফ্রেইমিং) STATE
  // -------------------------------------------------------------
  const [anchorOriginalPrice, setAnchorOriginalPrice] = useState<number>(
    Math.round(basePrice * 1.55)
  );
  const [anchorSellingPrice, setAnchorSellingPrice] = useState<number>(basePrice);
  const [anchorDurationDays, setAnchorDurationDays] = useState<number>(60);
  const [anchorCustomHook, setAnchorCustomHook] = useState(
    "প্রতিদিন মাত্র ৳২৫ — এক কাপ চায়ের খরচে ১ বছর প্রিমিয়াম নিশ্চিন্ত কোয়ালিটি!"
  );
  const [anchorTransparencyReason, setAnchorTransparencyReason] = useState(
    "সরাসরি ব্র্যান্ড পার্টনারশিপ ও নো-মিডলম্যান সোর্সিংয়ের কারণে এই বিশেষ সাশ্রয়।"
  );

  const anchorSavings = Math.max(0, anchorOriginalPrice - anchorSellingPrice);
  const anchorDiscountPercent = Math.round(
    (anchorSavings / (anchorOriginalPrice || 1)) * 100
  );
  const dailyAmortizedCost = Math.max(
    1,
    Math.round(anchorSellingPrice / (anchorDurationDays || 1))
  );

  // Auto-synchronize pricing parameters whenever the selected product changes
  useEffect(() => {
    if (currentProduct) {
      const pPrice = currentProduct.discountPrice || currentProduct.sellingPrice || 1500;
      setOurContrastPrice(pPrice);
      setContrastCompetitorPrice(Math.round(pPrice * 1.6));
      setAnchorSellingPrice(pPrice);
      setAnchorOriginalPrice(Math.round(pPrice * 1.55));
    }
  }, [currentProduct?.id]);

  const handleSelectProduct = (product: Product) => {
    setSelectedProductId(product.id);
    setIsItemPickerOpen(false);
    addToast(
      `"${product.name}" সফলভাবে ক্যাম্পেইনের জন্য নির্বাচন করা হয়েছে! ৩টি কৌশল স্বয়ংক্রিয়ভাবে আপডেট হয়েছে।`,
      "success"
    );
  };

  // -------------------------------------------------------------
  // ACTION DISPATCHERS (STORES IN PSYCHOLOGICAL CAMPAIGNS DB)
  // -------------------------------------------------------------
  const handleDeployTriadCampaign = () => {
    // 1. Add to first-class Psychological Campaigns Storage
    addPsychologicalCampaign({
      strategy: "round-of-three",
      title: `৩-প্যাক মেগা সেভার ডিল — ${currentProduct?.name || "পণ্য কালেকশন"}`,
      badge: "মোস্ট পপুলার চয়েস",
      productId: currentProduct?.id || "prod-1",
      productName: currentProduct?.name || "পণ্য কালেকশন",
      productImage: productImage,
      basePrice: basePrice,
      triadConfig: {
        tier1Qty,
        tier1Price,
        tier2Qty,
        tier2Price,
        tier2Savings,
        tier2Discount,
        tier3Qty,
        tier3Price,
        tier3Savings,
        tier3Discount,
      },
      isActive: true,
    });

    // 2. Also register banner in standard ads
    const newAd: Advertisement = {
      id: `ad-triad-${Date.now()}`,
      title: `৩-প্যাক মেগা সেভার ডিল: ${currentProduct?.name || "পণ্য কালেকশন"}`,
      description: `১টি কিনলে ৳${tier1Price.toLocaleString()}, ২টি কিনলে ৳${tier2Price.toLocaleString()} (বাঁচান ৳${tier2Savings.toLocaleString()}), ৩টি মেগা প্যাক কিনলে মাত্র ৳${tier3Price.toLocaleString()} ও ফ্রি হোম ডেলিভারি!`,
      type: "campaign",
      mediaType: "image",
      mediaUrl: productImage,
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
      "সফলভাবে 'রাউন্ড অফ থ্রি' অফার ক্যাম্পেইন স্টোরেজে যুক্ত ও সক্রিয় করা হয়েছে!",
      "success"
    );
  };

  const handleDeployContrastCampaign = () => {
    // 1. Add to Psychological Campaigns Storage
    addPsychologicalCampaign({
      strategy: "contrast-effect",
      title: `স্বচ্ছ বাজার দর বনাম আমাদের মান — ${currentProduct?.name || "পণ্য কালেকশন"}`,
      badge: "লিমিটেড টাইম",
      productId: currentProduct?.id || "prod-2",
      productName: currentProduct?.name || "পণ্য কালেকশন",
      productImage: productImage,
      basePrice: basePrice,
      contrastConfig: {
        competitorPrice: contrastCompetitorPrice,
        ourPrice: ourContrastPrice,
        savings: contrastSavings,
        savingsPercent: contrastPercent,
        ourHighlight: contrastBenefit1,
        competitorNote: competitorDisadvantage,
      },
      isActive: true,
    });

    const newAd: Advertisement = {
      id: `ad-contrast-${Date.now()}`,
      title: `স্বচ্ছ বাজার দর বনাম আমাদের মান: ${currentProduct?.name || "স্পেশাল অফার"}`,
      description: `বাজার দর ৳${contrastCompetitorPrice.toLocaleString()} বনাম আমাদের অফার ৳${ourContrastPrice.toLocaleString()}! পুরো ৳${contrastSavings.toLocaleString()} সাশ্রয় ও ১০০% অফিসিয়াল ওয়ারেন্টি।`,
      type: "slider",
      mediaType: "image",
      mediaUrl: productImage,
      offerBadge: "LIMITED TIME",
      couponCode: "CONTRAST50",
      buttonText: "সাশ্রয়ী অফারে কিনুন",
      buttonLink: "products",
      priority: 2,
      startDate: new Date().toISOString().split("T")[0],
      endDate: "2026-12-31",
      isActive: true,
      views: 0,
      clicks: 0,
      conversions: 0,
    };
    addAdvertisement(newAd);

    addCoupon({
      id: `cp-contrast-${Date.now()}`,
      code: "CONTRAST50",
      discountType: "percentage",
      discountValue: 15,
      minPurchase: ourContrastPrice,
      maxDiscount: 1500,
      startDate: new Date().toISOString().split("T")[0],
      endDate: "2026-12-31",
      usageLimit: 500,
      usageCount: 0,
      isActive: true,
    });

    addToast(
      "সফলভাবে 'কন্ট্রাস্ট ইফেক্ট' অফার ক্যাম্পেইন স্টোরেজে যুক্ত ও সক্রিয় করা হয়েছে!",
      "success"
    );
  };

  const handleDeployAnchoringCampaign = () => {
    // 1. Add to Psychological Campaigns Storage
    addPsychologicalCampaign({
      strategy: "anchoring-bias",
      title: `অরিজিনাল MRP বনাম ডিরেক্ট প্রাইস — ${currentProduct?.name || "পণ্য কালেকশন"}`,
      badge: "ফ্ল্যাশ ডিল",
      productId: currentProduct?.id || "prod-3",
      productName: currentProduct?.name || "পণ্য কালেকশন",
      productImage: productImage,
      basePrice: basePrice,
      anchorConfig: {
        anchorPrice: anchorOriginalPrice,
        sellingPrice: anchorSellingPrice,
        savings: anchorSavings,
        savingsPercent: anchorDiscountPercent,
        dailyCost: dailyAmortizedCost,
        hookText: anchorCustomHook,
      },
      isActive: true,
    });

    const newAd: Advertisement = {
      id: `ad-anchor-${Date.now()}`,
      title: `অরিজিনাল MRP ৳${anchorOriginalPrice.toLocaleString()} ➔ আজ মাত্র ৳${anchorSellingPrice.toLocaleString()}`,
      description: `দৈনিক হিসেবে খরচ মাত্র ৳${dailyAmortizedCost} টাকা! ${anchorCustomHook} কুপন কোড ANCHOROFF ব্যবহার করুন।`,
      type: "popup",
      mediaType: "image",
      mediaUrl: productImage,
      offerBadge: "FLASH SALE",
      couponCode: "ANCHOROFF",
      buttonText: "অফারে অর্ডার করুন",
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
      "সফলভাবে 'অ্যাঙ্করিং বায়াস' অফার ক্যাম্পেইন স্টোরেজে যুক্ত ও সক্রিয় করা হয়েছে!",
      "success"
    );
  };

  return (
    <div className="space-y-6 text-left">
      {/* Top Banner Header: Max Level Lab Dashboard */}
      <div className="bg-gradient-to-r from-fuchsia-950 via-indigo-950 to-slate-950 p-6 sm:p-7 rounded-3xl border border-fuchsia-700/40 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-96 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-fuchsia-600/20 via-transparent to-transparent pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="p-2 bg-fuchsia-600/30 border border-fuchsia-500/40 rounded-xl text-fuchsia-300">
                <Brain className="w-5 h-5" />
              </span>
              <span className="text-[11px] font-black uppercase tracking-wider text-fuchsia-300 bg-fuchsia-900/60 px-2.5 py-0.5 rounded-full border border-fuchsia-700/50">
                MAX LEVEL · সাইকোলজি ইন্টেলিজেন্স ল্যাব
              </span>
              <span className="text-[10px] font-extrabold text-emerald-400 bg-emerald-950/80 px-2.5 py-0.5 rounded-full border border-emerald-600/40">
                স্বচ্ছ তথ্য ও সত্যনিষ্ঠ মার্কেটিং
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              সাইকোলজি ইন্টেলিজেন্স ল্যাব — গ্রাহককে স্বচ্ছ তথ্য দিয়ে সিদ্ধান্ত নিতে সাহায্য করার ৩টি ব্যবহারযোগ্য ক্যাম্পেইন কৌশল
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              গ্রাহকের অবচেতন সিদ্ধান্ত গ্রহণের মনস্তত্ত্ব ও স্বচ্ছ তথ্যের সমন্বয়ে তৈরি ৩টি প্রমাণিত কৌশল: <strong>রাউন্ড অফ থ্রি</strong>, <strong>কন্ট্রাস্ট ইফেক্ট</strong> ও <strong>অ্যাঙ্করিং বায়াস</strong>। কোনো বিভ্রান্তি ছাড়া সত্যনিষ্ঠ উপাত্ত দিয়ে বিক্রয় বৃদ্ধি করুন।
            </p>
          </div>

          {/* Quick HUD Metrics (Transparency + Growth) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-900/90 p-3.5 rounded-2xl border border-fuchsia-500/30 backdrop-blur-md shrink-0">
            <div className="text-center px-2">
              <span className="text-[10px] text-slate-400 block font-semibold">কনভার্সন লিফট</span>
              <strong className="text-emerald-400 text-sm font-extrabold">+২৮.৪%</strong>
            </div>
            <div className="text-center px-2 border-l border-slate-800">
              <span className="text-[10px] text-slate-400 block font-semibold">স্বচ্ছতা স্কোর</span>
              <strong className="text-fuchsia-300 text-sm font-extrabold">১০০% ভেরিফাইড</strong>
            </div>
            <div className="text-center px-2 border-l border-slate-800">
              <span className="text-[10px] text-slate-400 block font-semibold">অর্ডার ভ্যালু (AOV)</span>
              <strong className="text-violet-400 text-sm font-extrabold">+৩৪.৮%</strong>
            </div>
            <div className="text-center px-2 border-l border-slate-800">
              <span className="text-[10px] text-slate-400 block font-semibold">সিদ্ধান্তের সময়</span>
              <strong className="text-amber-400 text-sm font-extrabold">-৪২% দ্রুত</strong>
            </div>
          </div>
        </div>

        {/* All Items Strategy Selector Hub (Max Level) */}
        <div className="mt-6 pt-5 border-t border-fuchsia-900/60 flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-4 text-xs">
          {/* Active Product Showcase & Quick Switcher */}
          <div className="flex flex-1 flex-col sm:flex-row items-start sm:items-center gap-3 bg-slate-900/95 p-3 rounded-2xl border border-fuchsia-700/60 shadow-inner">
            <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-slate-800 border border-fuchsia-500/40 shrink-0">
              <img
                src={productImage}
                alt={currentProduct?.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80";
                }}
              />
              <span className="absolute bottom-0 inset-x-0 bg-slate-950/80 text-[8px] font-mono font-bold text-center py-0.5 text-fuchsia-300">
                ACTIVE
              </span>
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] uppercase font-black text-fuchsia-300 bg-fuchsia-950/90 px-2 py-0.5 rounded-md border border-fuchsia-700/50">
                  বর্তমান ক্যাম্পেইনের পণ্য
                </span>
                <span className="text-[11px] text-slate-400">
                  {currentProduct?.categoryName || "ক্যাটাগরি"} {currentProduct?.sku ? `· SKU: ${currentProduct.sku}` : ""}
                </span>
                {currentProduct?.totalStock !== undefined && (
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      currentProduct.totalStock > 5
                        ? "bg-emerald-950/80 text-emerald-400 border border-emerald-600/40"
                        : currentProduct.totalStock > 0
                        ? "bg-amber-950/80 text-amber-400 border border-amber-600/40"
                        : "bg-rose-950/80 text-rose-400 border border-rose-600/40"
                    }`}
                  >
                    স্টক: {currentProduct.totalStock}টি
                  </span>
                )}
              </div>
              <h4 className="font-extrabold text-white text-sm line-clamp-1 mt-1">
                {currentProduct?.name}
              </h4>
              <div className="flex items-center gap-2 text-xs font-bold text-slate-300 mt-0.5">
                <span className="text-emerald-400">বিক্রয় মূল্য: ৳{basePrice.toLocaleString()}</span>
                {currentProduct?.discountPrice && currentProduct.discountPrice < currentProduct.sellingPrice && (
                  <span className="text-slate-400 line-through text-[11px]">
                    ৳{currentProduct.sellingPrice.toLocaleString()}
                  </span>
                )}
              </div>
            </div>

            {/* Quick dropdown for immediate switch */}
            <div className="flex items-center gap-2 w-full sm:w-auto mt-2 sm:mt-0">
              <select
                value={selectedProductId}
                onChange={(e) => {
                  const p = products.find((x) => x.id === e.target.value);
                  if (p) handleSelectProduct(p);
                }}
                className="flex-1 sm:flex-initial bg-slate-950 border border-fuchsia-600/70 text-white text-xs rounded-xl px-3 py-2 font-bold max-w-[240px] focus:outline-none focus:ring-2 focus:ring-fuchsia-500 cursor-pointer"
              >
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} — ৳{(p.discountPrice || p.sellingPrice).toLocaleString()}
                  </option>
                ))}
              </select>

              {/* Browse All System Items Modal Trigger */}
              <button
                type="button"
                onClick={() => setIsItemPickerOpen(true)}
                className="px-3.5 py-2 bg-gradient-to-r from-fuchsia-600 to-indigo-600 hover:from-fuchsia-500 hover:to-indigo-500 text-white font-extrabold text-xs rounded-xl shadow-md transition flex items-center gap-1.5 shrink-0 cursor-pointer"
              >
                <Package className="w-4 h-4" />
                <span>সকল পণ্য খুঁজুন ({products.length})</span>
              </button>
            </div>
          </div>

          {/* Device Preview Toggle */}
          <div className="flex items-center gap-1.5 bg-slate-900/90 p-1.5 rounded-xl border border-fuchsia-800/50 self-start xl:self-auto shrink-0">
            <button
              type="button"
              onClick={() => setPreviewDevice("desktop")}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                previewDevice === "desktop"
                  ? "bg-fuchsia-600 text-white shadow-xs"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Laptop className="w-3.5 h-3.5" /> ডেস্কটপ ভিউ
            </button>
            <button
              type="button"
              onClick={() => setPreviewDevice("mobile")}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                previewDevice === "mobile"
                  ? "bg-fuchsia-600 text-white shadow-xs"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" /> মোবাইল ভিউ
            </button>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* STORED PSYCHOLOGY CAMPAIGNS HUB (ACTIVE/INACTIVE TOGGLE & DB) */}
      {/* ------------------------------------------------------------- */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="p-1.5 bg-fuchsia-100 text-fuchsia-700 rounded-lg">
                <Brain className="w-4 h-4" />
              </span>
              <h3 className="text-base font-black text-slate-900">
                সাইকোলজি ক্যাম্পেইন স্টোরেজ ও লাইভ কন্ট্রোল
              </h3>
              <span className="text-xs bg-slate-100 text-slate-700 font-bold px-2.5 py-0.5 rounded-full border border-slate-200">
                মোট সংরক্ষিত: {psychologicalCampaigns.length}টি
              </span>
            </div>
            <p className="text-xs text-slate-500">
              যে ক্যাম্পেইনটি <strong>Active (সক্রিয়)</strong> থাকবে শুধুমাত্র সেটাই ফ্রন্টপেজে ফটো-কার্ড হিসেবে দৃশ্যমান হবে। একাধিক ক্যাম্পেইন সক্রিয় থাকলে ফ্রন্টে সবগুলোই শো করবে।
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-xl border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              {psychologicalCampaigns.filter((c) => c.isActive).length}টি লাইভ সক্রিয়
            </span>
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-slate-100 text-slate-600 text-xs font-bold rounded-xl border border-slate-200">
              {psychologicalCampaigns.filter((c) => !c.isActive).length}টি অফ (লুকানো)
            </span>
          </div>
        </div>

        {/* List of stored campaigns */}
        {psychologicalCampaigns.length === 0 ? (
          <div className="text-center py-8 text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            <p className="text-xs font-bold">এখনো কোনো ক্যাম্পেইন সেভ করা হয়নি। নিচের ৩টি কৌশল থেকে ক্যাম্পেইন তৈরি করুন।</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {psychologicalCampaigns.map((camp) => {
              const strategyName =
                camp.strategy === "round-of-three"
                  ? "রাউন্ড অফ থ্রি (৩-প্যাক)"
                  : camp.strategy === "contrast-effect"
                  ? "কন্ট্রাস্ট ইফেক্ট (বাজার দর)"
                  : "অ্যাঙ্করিং বায়াস (MRP নোঙর)";

              const badgeColor =
                camp.strategy === "round-of-three"
                  ? "bg-indigo-50 text-indigo-700 border-indigo-200"
                  : camp.strategy === "contrast-effect"
                  ? "bg-rose-50 text-rose-700 border-rose-200"
                  : "bg-purple-50 text-purple-700 border-purple-200";

              return (
                <div
                  key={camp.id}
                  className={`p-4 rounded-2xl border transition-all flex flex-col justify-between space-y-3 ${
                    camp.isActive
                      ? "bg-gradient-to-b from-white to-slate-50/80 border-emerald-400 shadow-md ring-1 ring-emerald-400/30"
                      : "bg-slate-50/60 border-slate-200 opacity-75"
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${badgeColor}`}>
                        {strategyName}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {camp.createdAt}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <img
                        src={camp.productImage}
                        alt={camp.productName}
                        className="w-12 h-12 rounded-xl object-contain bg-white p-1 border border-slate-200 shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <h4 className="text-xs font-black text-slate-900 truncate">
                          {camp.title}
                        </h4>
                        <p className="text-[11px] text-slate-500 truncate">
                          {camp.productName} · ৳{camp.basePrice.toLocaleString()}
                        </p>
                      </div>
                    </div>

                    {/* Specific preview stats */}
                    <div className="text-[11px] font-bold text-slate-600 bg-white p-2.5 rounded-xl border border-slate-200/80 space-y-1">
                      {camp.strategy === "round-of-three" && camp.triadConfig && (
                        <div className="flex justify-between items-center">
                          <span>৩-প্যাকে সাশ্রয়:</span>
                          <span className="text-emerald-600 font-black">
                            ৳{camp.triadConfig.tier3Savings.toLocaleString()} ({camp.triadConfig.tier3Discount}%)
                          </span>
                        </div>
                      )}
                      {camp.strategy === "contrast-effect" && camp.contrastConfig && (
                        <div className="flex justify-between items-center">
                          <span>বাজার দর বনাম সাশ্রয়:</span>
                          <span className="text-rose-600 font-black">
                            ৳{camp.contrastConfig.savings.toLocaleString()} ({camp.contrastConfig.savingsPercent}%)
                          </span>
                        </div>
                      )}
                      {camp.strategy === "anchoring-bias" && camp.anchorConfig && (
                        <div className="flex justify-between items-center">
                          <span>দৈনিক খরচ:</span>
                          <span className="text-purple-600 font-black">
                            মাত্র ৳{camp.anchorConfig.dailyCost}/দিন (সাশ্রয় ৳{camp.anchorConfig.savings.toLocaleString()})
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions & Live Toggle */}
                  <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => togglePsychologicalCampaignStatus(camp.id)}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-black transition cursor-pointer ${
                        camp.isActive
                          ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
                          : "bg-slate-200 hover:bg-slate-300 text-slate-700"
                      }`}
                    >
                      <span className={`w-2 h-2 rounded-full ${camp.isActive ? "bg-white" : "bg-slate-500"}`} />
                      <span>{camp.isActive ? "সক্রিয় (Live ফ্রন্টে)" : "নিষ্ক্রিয় (লুকানো)"}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => deletePsychologicalCampaign(camp.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition cursor-pointer"
                      title="মুছে ফেলুন"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 3 Core Strategy Selection Tabs (Max Level) */}
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
            স্বচ্ছ প্রতি পিস হিসেব: ১টি, ২টি ও ৩টি বান্ডেলের স্বচ্ছ বিকল্প যাতে গ্রাহক কোনো কনফিউশন ছাড়া সেরা ভ্যালুটি দ্রুত নির্বাচন করে।
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
            স্বচ্ছ ডিসিশন ম্যাট্রিক্স: বাজার দর ও লোকাল ঝুঁকির বিপরীতে আমাদের অফিসিয়াল ১ বছরের ওয়ারেন্টি ও ফ্রি রিটার্ন পলিসির স্পষ্ট বৈপরীত্য।
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
              Transparent Anchor
            </span>
          </div>
          <h3 className="font-extrabold text-slate-900 text-sm">
            ৩. অ্যাঙ্করিং বায়াস (Anchoring Bias)
          </h3>
          <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
            স্বচ্ছ মূল্য নোঙর ও ক্ষুদ্র দৈনিক খরচের হিসাব (যেমন: প্রতিদিন মাত্র ৳২৫)। বড় সংখ্যাকে সহজ ও বোধগম্য করে দ্রুত সিদ্ধান্ত নিশ্চিতকরণ।
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
                  কৌশল ১: রাউন্ড অফ থ্রি (৩ এর নিয়ম ও ট্রায়াড চয়েস আর্কিটেকচার)
                </span>
                <span className="px-2 py-0.5 bg-indigo-600 text-white text-[10px] font-bold rounded-full">
                  স্বচ্ছ তথ্য নীতি
                </span>
              </div>
              <p className="text-xs text-indigo-900/80 leading-relaxed max-w-3xl">
                গ্রাহককে সিদ্ধান্তহীনতায় না ফেলে ৩টি পরিষ্কার বিকল্প দিন: <strong>১টি ট্রায়াল</strong>, <strong>২টি মোস্ট পপুলার</strong> এবং <strong>৩টি মেগা ভ্যালু প্যাক</strong>। প্রতি পিসের দামের স্বচ্ছ হিসাব দেখালে প্রায় <strong>৬৮% ক্রেতা ২য় বা ৩য় প্যাক নির্বাচন করেন</strong>।
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
                  ৩-টিয়ার প্যাকেজ ও স্বচ্ছ মূল্য ক্যালকুলেটর
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
                <div className="flex justify-between items-center text-[11px] font-bold pt-1">
                  <span className="text-slate-500">প্রতি পিস: ৳{tier1PerPiece.toLocaleString()}</span>
                  <span className="font-extrabold text-slate-800">মোট: ৳{tier1Price.toLocaleString()}</span>
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
                <div className="flex items-center justify-between text-[11px] pt-1">
                  <span className="text-emerald-700 font-bold">
                    সাশ্রয়: ৳{tier2Savings.toLocaleString()} (প্রতি পিস ৳{tier2PerPiece.toLocaleString()})
                  </span>
                  <span className="font-extrabold text-indigo-950">
                    মোট: ৳{tier2Price.toLocaleString()}
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
                <div className="flex items-center justify-between text-[11px] pt-1">
                  <span className="text-emerald-700 font-bold">
                    সাশ্রয়: ৳{tier3Savings.toLocaleString()} (প্রতি পিস মাত্র ৳{tier3PerPiece.toLocaleString()})
                  </span>
                  <span className="font-extrabold text-purple-950">
                    মোট: ৳{tier3Price.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Ready Copy Hook for SMS/Ad */}
              <div className="p-3 bg-slate-900 text-white rounded-2xl space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-indigo-300 flex items-center gap-1">
                    <Megaphone className="w-3.5 h-3.5" /> স্বচ্ছ ক্যাম্পেইন হুক (Copy for Ads):
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      const text = `🔥 ৩-প্যাক মেগা সেভার ডিল! ${currentProduct?.name}: ১টি ৳${tier1Price.toLocaleString()}, ২টি ৳${tier2Price.toLocaleString()} (প্রতি পিস ৳${tier2PerPiece.toLocaleString()}), আর ৩টি নিলে পাচ্ছেন সরাসরি ২৫% মহা ছাড় (প্রতি পিস মাত্র ৳${tier3PerPiece.toLocaleString()}) ও ফ্রি ডেলিভারি! কোড: TRIAD25`;
                      navigator.clipboard.writeText(text);
                      addToast("কপি করা হয়েছে!", "success");
                    }}
                    className="p-1 hover:text-indigo-400 text-slate-400 cursor-pointer"
                    title="কপি করুন"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed font-mono">
                  {`🔥 ৩-প্যাক মেগা সেভার ডিল! ${currentProduct?.name}: ১টি ৳${tier1Price.toLocaleString()}, ২টি ৳${tier2Price.toLocaleString()}, ৩টি মাত্র ৳${tier3Price.toLocaleString()} ও ফ্রি ডেলিভারি!`}
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
                    className="text-[10px] font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer"
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
                    গ্রাহক ফ্রন্ট প্রিভিউ ({previewDevice === "desktop" ? "ডেস্কটপ" : "মোবাইল"})
                  </h4>
                  <p className="text-xs text-slate-400">
                    গ্রাহক আপনার শপে এই ৩টি প্যাকেজ স্বচ্ছ হিসাব সহ যেভাবে দেখতে পাবে।
                  </p>
                </div>

                <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200">
                  Decision Architecture
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
                    src={productImage}
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
                        স্টার্টার ট্রায়াল
                      </span>
                      <h6 className="font-black text-slate-900 text-sm">
                        {tier1Qty}টি পিস
                      </h6>
                      <div className="pt-2">
                        <span className="text-xl font-black text-slate-900">
                          ৳{tier1Price.toLocaleString()}
                        </span>
                        <span className="block text-[10px] text-slate-500">
                          (৳{tier1PerPiece.toLocaleString()} /পিস)
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500 pt-1">
                        কোয়ালিটি যাচাই করার জন্য স্ট্যান্ডার্ড বিকল্প।
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => addToast("সিঙ্গেল প্যাক টেস্ট ক্লিক!", "info")}
                      className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors mt-3 cursor-pointer"
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
                        <span className="block text-[10px] text-indigo-600 font-bold">
                          (৳{tier2PerPiece.toLocaleString()} /পিস)
                        </span>
                      </div>
                      <div className="text-[10px] font-bold text-emerald-700 bg-emerald-50 py-0.5 px-2 rounded-full inline-block">
                        সাশ্রয় ৳{tier2Savings.toLocaleString()} ({tier2Discount}% অফ)
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => addToast("মোস্ট পপুলার ডাবল প্যাক টেস্ট ক্লিক!", "success")}
                      className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-colors mt-3 flex items-center justify-center gap-1 cursor-pointer"
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
                        <span className="block text-[10px] text-purple-700 font-bold">
                          (মাত্র ৳{tier3PerPiece.toLocaleString()} /পিস)
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
                      className="w-full py-2 bg-purple-900 hover:bg-purple-800 text-white font-bold text-xs rounded-xl transition-colors mt-3 cursor-pointer"
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
                  প্রতি ইউনিটের স্বচ্ছ ব্রেকডাউন থাকায় গ্রাহকের গড় অর্ডার ভ্যালু (AOV) ৩৫% বেড়ে যায়।
                </span>
                <button
                  type="button"
                  onClick={handleDeployTriadCampaign}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer"
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
                  কৌশল ২: কন্ট্রাস্ট ইফেক্ট (স্বচ্ছ বাজার দর বনাম আমাদের মান ও শর্তাবলী)
                </span>
                <span className="px-2 py-0.5 bg-rose-600 text-white text-[10px] font-bold rounded-full">
                  স্বচ্ছ তুলনামূলক ম্যাট্রিক্স
                </span>
              </div>
              <p className="text-xs text-rose-900/80 leading-relaxed max-w-3xl">
                কোনো বিভ্রান্তি নয়; সাধারণ মার্কেট বা অনির্ভরযোগ্য সোর্সগুলোর উচ্চ মূল্য ও ওয়ারেন্টিহীন ঝুঁকির বিপরীতে আমাদের ন্যায্য মূল্য ও <strong>১০০% অফিসিয়াল ওয়ারেন্টি</strong> সাইড-বাই-সাইড তুলে ধরা হয়, যা গ্রাহককে আত্মবিশ্বাসী সিদ্ধান্ত নিতে সাহায্য করে।
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
                    সাধারণ বাজার দর / চড়া ডিকয়
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
                  আমাদের প্রধান সুবিধা ২ (ওপেন-বক্স চেক)
                </label>
                <input
                  type="text"
                  value={contrastBenefit2}
                  onChange={(e) => setContrastBenefit2(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold"
                />
              </div>

              {/* Benefit Bullet 3 */}
              <div>
                <label className="text-[10px] text-slate-500 font-bold block mb-1">
                  আমাদের প্রধান সুবিধা ৩ (রিটার্ন গ্যারান্টি)
                </label>
                <input
                  type="text"
                  value={contrastBenefit3}
                  onChange={(e) => setContrastBenefit3(e.target.value)}
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
                      const text = `⚡ বাজারে যা ৳${contrastCompetitorPrice.toLocaleString()} দিয়ে কিনতে হয়, আজ আমাদের কাছে পাচ্ছেন মাত্র ৳${ourContrastPrice.toLocaleString()} মূল্যে! পুরো ৳${contrastSavings.toLocaleString()} সাশ্রয় (${contrastPercent}% ডিসকাউন্ট)। সাথে ১০০% অরিজিনাল গ্যারান্টি ও ওপেন-বক্স ক্যাশ অন ডেলিভারি! কোড: CONTRAST50`;
                      navigator.clipboard.writeText(text);
                      addToast("কন্ট্রাস্ট ক্যাপশন কপি করা হয়েছে!", "success");
                    }}
                    className="p-1 hover:text-rose-400 text-slate-400 cursor-pointer"
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
                          src={productImage}
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
                      className="w-full py-2.5 bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-extrabold text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer"
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
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer"
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
                  কৌশল ৩: প্রাইস অ্যাঙ্করিং ও স্বচ্ছ মাইক্রো-কস্ট ফ্রেইমিং (Anchoring Bias)
                </span>
                <span className="px-2 py-0.5 bg-amber-600 text-white text-[10px] font-bold rounded-full">
                  স্বচ্ছ রেফারেন্স ও যৌক্তিক হিসাব
                </span>
              </div>
              <p className="text-xs text-amber-900/80 leading-relaxed max-w-3xl">
                কোনো বিভ্রান্তিকর মূল্য নয়, পণ্যের আসল রেফারেন্স মূল্য (MSRP) নোঙর হিসেবে উপস্থাপন করে ছাড়ের যৌক্তিক কারণ ব্যাখ্যা করা এবং বড় মোট খরচকে দৈনন্দিন অভ্যাসে (যেমন: <strong>প্রতিদিন মাত্র ৳{dailyAmortizedCost} — এক কাপ চায়ের খরচে</strong>) রূপান্তর করে গ্রাহককে নির্ভার রাখা হয়।
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

              {/* Transparency Reason */}
              <div>
                <label className="text-[10px] text-slate-500 font-bold block mb-1">
                  ছাড়ের স্বচ্ছ যৌক্তিক কারণ (Transparency Fact)
                </label>
                <input
                  type="text"
                  value={anchorTransparencyReason}
                  onChange={(e) => setAnchorTransparencyReason(e.target.value)}
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
                    className="p-1 hover:text-amber-400 text-slate-400 cursor-pointer"
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
                      src={productImage}
                      alt=""
                      className="w-20 h-20 object-cover rounded-xl border border-slate-200 shadow-2xs"
                    />
                    <div className="space-y-1">
                      <h5 className="font-black text-slate-900 text-sm line-clamp-1">
                        {currentProduct?.name}
                      </h5>
                      <p className="text-[11px] text-slate-500">
                        {anchorTransparencyReason}
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
                    className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
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
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-4 h-4" /> স্টোরে অ্যাঙ্করিং পপ-আপ সক্রিয় করুন
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ALL SYSTEM ITEMS PICKER MODAL (Max Level) */}
      {isItemPickerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-fuchsia-600/50 rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-left text-white animate-fadeIn">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-800 flex items-center justify-between gap-3 bg-slate-900/90">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-fuchsia-600/20 border border-fuchsia-500/30 rounded-2xl text-fuchsia-300">
                  <Package className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base sm:text-lg text-white">
                    সিস্টেমের সমস্ত পণ্য ব্রাউজ ও নির্বাচন করুন
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    যে কোনো পণ্য সিলেক্ট করুন—রাউন্ড অফ থ্রি, কন্ট্রাস্ট ইফেক্ট এবং অ্যাঙ্করিং বায়াস স্বয়ংক্রিয়ভাবে সেই পণ্যের দাম ও ডাটা অনুযায়ী কনফিগার হবে।
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsItemPickerOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Filter & Search Bar */}
            <div className="p-4 border-b border-slate-800 bg-slate-950/60 flex flex-col sm:flex-row gap-3 items-center justify-between">
              {/* Search input */}
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="পণ্যের নাম, বাংলা নাম, SKU বা ব্র্যান্ড লিখুন..."
                  value={itemSearchQuery}
                  onChange={(e) => setItemSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-fuchsia-500"
                />
              </div>

              {/* Category Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
                <button
                  type="button"
                  onClick={() => setSelectedCategoryFilter("all")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                    selectedCategoryFilter === "all"
                      ? "bg-fuchsia-600 text-white shadow-xs"
                      : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                  }`}
                >
                  সব ক্যাটাগরি ({products.length})
                </button>
                {availableCategories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategoryFilter(cat)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                      selectedCategoryFilter === cat
                        ? "bg-fuchsia-600 text-white shadow-xs"
                        : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Product Grid */}
            <div className="p-4 overflow-y-auto flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredProducts.length === 0 ? (
                <div className="col-span-full py-12 text-center text-slate-400 space-y-2">
                  <Package className="w-10 h-10 mx-auto text-slate-500 opacity-60" />
                  <p className="text-sm font-bold">কোনো পণ্য পাওয়া যায়নি</p>
                  <p className="text-xs text-slate-500">অনুসন্ধান বা ক্যাটাগরি ফিল্টার পরিবর্তন করে আবার চেষ্টা করুন।</p>
                </div>
              ) : (
                filteredProducts.map((p) => {
                  const isCurrent = p.id === selectedProductId;
                  const price = p.discountPrice || p.sellingPrice;
                  return (
                    <div
                      key={p.id}
                      onClick={() => handleSelectProduct(p)}
                      className={`p-3 rounded-2xl border transition-all flex items-center gap-3 cursor-pointer relative overflow-hidden ${
                        isCurrent
                          ? "bg-fuchsia-950/60 border-fuchsia-500 ring-2 ring-fuchsia-500/40 shadow-lg"
                          : "bg-slate-800/80 border-slate-700/80 hover:border-fuchsia-500/60 hover:bg-slate-800"
                      }`}
                    >
                      <div className="w-14 h-14 rounded-xl overflow-hidden bg-slate-900 border border-slate-700 shrink-0">
                        <img
                          src={p.mainImage || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&q=80"}
                          alt={p.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&q=80";
                          }}
                        />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[9px] font-bold text-slate-400 uppercase">
                            {p.categoryName || "General"}
                          </span>
                          {p.sku && (
                            <span className="text-[9px] font-mono text-slate-500">
                              · {p.sku}
                            </span>
                          )}
                        </div>
                        <h4 className="font-extrabold text-white text-xs line-clamp-1 mt-0.5">
                          {p.name}
                        </h4>
                        <div className="flex items-baseline gap-2 mt-1">
                          <span className="text-sm font-black text-emerald-400 font-mono">
                            ৳{price.toLocaleString()}
                          </span>
                          {p.discountPrice && p.discountPrice < p.sellingPrice && (
                            <span className="text-[10px] text-slate-400 line-through font-mono">
                              ৳{p.sellingPrice.toLocaleString()}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="shrink-0">
                        {isCurrent ? (
                          <span className="px-2.5 py-1 bg-fuchsia-600 text-white text-[10px] font-black rounded-lg flex items-center gap-1 shadow-sm">
                            <CheckCircle className="w-3 h-3" /> সিলেক্টেড
                          </span>
                        ) : (
                          <button
                            type="button"
                            className="px-2.5 py-1 bg-slate-700 hover:bg-fuchsia-600 text-slate-200 hover:text-white text-[10px] font-bold rounded-lg transition"
                          >
                            সিলেক্ট করুন
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between text-xs text-slate-400">
              <span>মোট {filteredProducts.length}টি পণ্য প্রদর্শিত হচ্ছে</span>
              <button
                type="button"
                onClick={() => setIsItemPickerOpen(false)}
                className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition cursor-pointer"
              >
                বন্ধ করুন
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
