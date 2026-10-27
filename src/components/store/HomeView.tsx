import React, { useState, useEffect, useMemo, useRef } from "react";
import { useStore } from "../../context/StoreContext";
import { Product } from "../../types";
import { t, translateDynamic } from "../../utils/i18n";
import {
  ShoppingBag,
  Heart,
  GitCompare,
  Star,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  ArrowRight,
  Flame,
  Zap,
  Sparkles,
  Eye,
  ShieldCheck,
  Truck,
  CreditCard,
  RefreshCw,
  Gift,
  Smartphone,
  Laptop,
  Watch,
  Camera,
  Tv,
  Shirt,
  Home as HomeIcon,
  Grid,
  Check,
  Copy,
  Percent,
  Award,
  Layers,
  FileSpreadsheet,
  User,
  ThumbsUp,
  Tag,
  BadgeCheck,
  Plus,
  Rotate3d,
  Box,
} from "lucide-react";
import { PsychologicalDealsSection } from "./PsychologicalDealsSection";
import { ThreeDProductCard } from "./ThreeDProductCard";
import { ThreeDProductCarousel } from "./ThreeDProductCarousel";

export const HomeView: React.FC<{ onQuickView?: (p: Product) => void }> = ({ onQuickView }) => {
  const {
    homeBanners,
    advertisements,
    setSelectedOffer,
    trackAdImpression,
    trackAdClick,
    categories,
    brands,
    products,
    setStoreView,
    setSelectedCategoryId,
    setSelectedProduct,
    addToCart,
    wishlist,
    toggleWishlist,
    compareList,
    toggleCompare,
    settings,
    addToast,
    language,
  } = useStore();

  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [copiedCoupon, setCopiedCoupon] = useState(false);
  const [activeTabFilter, setActiveTabFilter] = useState<"all" | "deals" | "gadgets" | "budget">("all");
  const [productDisplayMode, setProductDisplayMode] = useState<"3d-tilt" | "3d-carousel" | "grid">("3d-tilt");
  const handleProduct3DInspect = (product?: Product) => {
    if (product && onQuickView) {
      onQuickView(product);
    }
  };

  // Combine advertisements of type "slider" (top 5 active scheduled) or fall back to homeBanners
  const activeSliderAds = useMemo(() => {
    const todayStr = new Date().toISOString().split("T")[0];
    const sliderAds = advertisements.filter((a) => {
      if (a.type !== "slider" || !a.isActive) return false;
      if (a.startDate && a.startDate > todayStr) return false;
      if (a.endDate && a.endDate < todayStr) return false;
      return true;
    });

    if (sliderAds.length > 0) {
      return [...sliderAds].sort((a, b) => a.priority - b.priority).slice(0, 5);
    }

    return homeBanners.slice(0, 5).map((b) => ({
      id: b.id,
      title: b.title,
      description: b.subtitle,
      type: "slider" as const,
      mediaType: "image" as const,
      mediaUrl: b.imageUrl,
      offerBadge: "HOT" as const,
      couponCode: "WELCOME500",
      buttonText: b.buttonText || "এখনই কিনুন",
      buttonLink: b.link || "products",
      priority: 1,
      startDate: "2026-01-01",
      endDate: "2026-12-31",
      isActive: true,
      views: 100,
      clicks: 20,
      conversions: 5,
    }));
  }, [advertisements, homeBanners]);

  const currentAd = activeSliderAds[currentBannerIndex % activeSliderAds.length] || activeSliderAds[0];
  const trackedAdsRef = useRef<Set<string>>(new Set());

  // Auto-slide every 5.5 seconds
  useEffect(() => {
    if (!activeSliderAds.length) return;
    const interval = setInterval(() => {
      setCurrentBannerIndex((prev) => (prev + 1) % activeSliderAds.length);
    }, 5500);
    return () => clearInterval(interval);
  }, [activeSliderAds.length]);

  // Track impression on active slide change once per ad ID
  useEffect(() => {
    if (currentAd && currentAd.id && !trackedAdsRef.current.has(currentAd.id)) {
      trackedAdsRef.current.add(currentAd.id);
      trackAdImpression(currentAd.id);
    }
  }, [currentAd?.id, trackAdImpression]);

  const handleNextBanner = () => {
    setCurrentBannerIndex((prev) => (prev + 1) % activeSliderAds.length);
  };

  const handlePrevBanner = () => {
    setCurrentBannerIndex((prev) => (prev - 1 + activeSliderAds.length) % activeSliderAds.length);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX - touchEndX;
    if (diff > 50) {
      handleNextBanner(); // Swipe Left -> Next
    } else if (diff < -50) {
      handlePrevBanner(); // Swipe Right -> Prev
    }
    setTouchStartX(null);
  };

  // Live Countdown Timer for Deals & Offers
  const [timeLeft, setTimeLeft] = useState({
    days: 3,
    hours: 14,
    minutes: 42,
    seconds: 35,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        if (prev.days > 0) return { ...prev, days: prev.days - 1, hours: 23, minutes: 59, seconds: 59 };
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Category Icon Mapping
  const getCategoryIcon = (name: string) => {
    const lower = name.toLowerCase();
    if (lower.includes("mobile") || lower.includes("phone") || lower.includes("android") || lower.includes("iphone")) {
      return <Smartphone className="w-5 h-5 text-sky-600" />;
    }
    if (lower.includes("laptop") || lower.includes("computer") || lower.includes("macbook")) {
      return <Laptop className="w-5 h-5 text-blue-600" />;
    }
    if (lower.includes("watch") || lower.includes("wearable")) {
      return <Watch className="w-5 h-5 text-amber-600" />;
    }
    if (lower.includes("camera") || lower.includes("photo")) {
      return <Camera className="w-5 h-5 text-rose-600" />;
    }
    if (lower.includes("electronic") || lower.includes("gadget") || lower.includes("tv")) {
      return <Tv className="w-5 h-5 text-indigo-600" />;
    }
    if (lower.includes("fashion") || lower.includes("cloth") || lower.includes("apparel") || lower.includes("shirt")) {
      return <Shirt className="w-5 h-5 text-emerald-600" />;
    }
    if (lower.includes("home") || lower.includes("living") || lower.includes("furniture")) {
      return <HomeIcon className="w-5 h-5 text-teal-600" />;
    }
    return <Grid className="w-5 h-5 text-indigo-600" />;
  };

  // Unique products helper
  const getUniqueProducts = (filtered: Product[], fallback: Product[], count: number) => {
    const map = new Map<string, Product>();
    filtered.forEach((p) => map.set(p.id, p));
    if (map.size < count) {
      fallback.forEach((p) => {
        if (!map.has(p.id)) map.set(p.id, p);
      });
    }
    return Array.from(map.values()).slice(0, count);
  };

  // Filtered product collections
  const electronicsProducts = useMemo(
    () =>
      getUniqueProducts(
        products.filter(
          (p) =>
            p.categoryName?.toLowerCase().includes("electronic") ||
            p.categoryName?.toLowerCase().includes("gadget") ||
            p.categoryName?.toLowerCase().includes("phone") ||
            p.categoryName?.toLowerCase().includes("laptop")
        ),
        products,
        8
      ),
    [products]
  );

  const homeAndOutdoorProducts = useMemo(
    () =>
      getUniqueProducts(
        products.filter(
          (p) =>
            p.categoryName?.toLowerCase().includes("home") ||
            p.categoryName?.toLowerCase().includes("furniture") ||
            p.categoryName?.toLowerCase().includes("living")
        ),
        products,
        8
      ),
    [products]
  );

  const dealProducts = useMemo(
    () =>
      getUniqueProducts(
        products.filter((p) => p.discountPrice && p.discountPrice < p.sellingPrice),
        products,
        6
      ),
    [products]
  );

  // Dynamic View More (Load More) State for Homepage Products
  const [recommendedVisibleCount, setRecommendedVisibleCount] = useState<number>(12);

  // All matching recommended products
  const allMatchingRecommended = useMemo(() => {
    if (activeTabFilter === "deals") {
      return products.filter((p) => p.discountPrice && p.discountPrice < p.sellingPrice);
    }
    if (activeTabFilter === "gadgets") {
      return products.filter(
        (p) =>
          p.categoryName?.toLowerCase().includes("electronic") ||
          p.categoryName?.toLowerCase().includes("gadget") ||
          p.categoryName?.toLowerCase().includes("phone")
      );
    }
    if (activeTabFilter === "budget") {
      return products.filter((p) => (p.discountPrice || p.sellingPrice) <= 50000);
    }
    return products;
  }, [products, activeTabFilter]);

  // Filtered recommended products with dynamic slicing
  const filteredRecommendedProducts = useMemo(() => {
    return allMatchingRecommended.slice(0, recommendedVisibleCount);
  }, [allMatchingRecommended, recommendedVisibleCount]);

  return (
    <div className="space-y-6 sm:space-y-8 pb-16 max-w-7xl mx-auto">
      {/* 1. Live Animated Promo Notice Ticker (Web & Mobile) */}
      <div className="bg-gradient-to-r from-indigo-900 via-slate-900 to-indigo-950 text-white px-4 py-2.5 rounded-2xl border border-indigo-500/30 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-2.5 text-xs">
        <div className="flex items-center gap-2 text-center sm:text-left">
          <span className="p-1 rounded-md bg-amber-400 text-slate-950 font-black text-[10px] uppercase shrink-0">
            মেগা অফার
          </span>
          <span className="text-slate-200">
            প্রথম অর্ডারে ফ্ল্যাট <strong>৳৫০০ ক্যাশব্যাক</strong> ও সারা দেশে ফ্রি হোম ডেলিভারি!
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white/10 rounded-xl font-mono text-[11px] font-bold text-amber-300 border border-white/20">
            <span>WELCOME500</span>
            <button
              onClick={() => {
                navigator.clipboard.writeText("WELCOME500");
                setCopiedCoupon(true);
                addToast("কুপন কোড 'WELCOME500' কপি হয়েছে!", "success");
                setTimeout(() => setCopiedCoupon(false), 2000);
              }}
              className="p-0.5 hover:text-white transition cursor-pointer"
              title="কপি করুন"
            >
              {copiedCoupon ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>

          <button
            onClick={() => setStoreView("products")}
            className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-[11px] transition shadow-xs cursor-pointer"
          >
            অফার দেখুন →
          </button>
        </div>
      </div>

      {/* 2. Mobile App-Style Category Story Circles (Visible on Mobile / Tablet) */}
      <div className="lg:hidden bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-black text-slate-900 tracking-tight flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5 text-rose-500" />
            <span>জনপ্রিয় ক্যাটাগরি ব্রাউজ করুন</span>
          </span>
          <button
            onClick={() => setStoreView("categories")}
            className="text-[11px] font-bold text-indigo-600 hover:underline flex items-center gap-0.5"
          >
            <span>সকল ক্যাটাগরি</span>
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>

        <div className="flex items-center gap-3 overflow-x-auto no-scrollbar py-1 px-0.5">
          {categories.slice(0, 10).map((cat) => (
            <button
              key={`mob-cat-${cat.id}`}
              onClick={() => {
                setSelectedCategoryId(cat.id);
                setStoreView("products");
              }}
              className="flex flex-col items-center gap-1.5 shrink-0 group w-16 cursor-pointer"
            >
              <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-slate-50 to-indigo-50/40 border border-slate-200/80 p-2.5 flex items-center justify-center group-hover:scale-105 group-hover:border-indigo-400 transition-all shadow-2xs">
                {cat.image ? (
                  <img src={cat.image} alt={cat.name} className="w-full h-full object-contain" />
                ) : (
                  getCategoryIcon(cat.name)
                )}
              </div>
              <span className="text-[10px] font-bold text-slate-700 group-hover:text-indigo-600 text-center line-clamp-1 w-full">
                {translateDynamic(cat.name, cat.name_bn, language)}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* 3. Hero Showcase Bento Grid (Category Sidebar + Main Slider + Member Perks Card) */}
      <div className="bg-white rounded-3xl border border-slate-200 p-3 sm:p-4 shadow-xs grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Category Menu (Desktop) */}
        <div className="lg:col-span-3 border-r border-slate-100 pr-2 hidden lg:block">
          <div className="flex items-center gap-2 pb-2.5 mb-1 border-b border-slate-100 px-3">
            <Grid className="w-4 h-4 text-indigo-600" />
            <span className="text-xs font-black text-slate-900 uppercase tracking-wider">
              {t("all_categories", language)}
            </span>
          </div>

          <div className="space-y-0.5">
            {categories.slice(0, 8).map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  setSelectedCategoryId(cat.id);
                  setStoreView("products");
                }}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold text-slate-700 hover:text-indigo-600 hover:bg-slate-50 transition-colors group cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <div className="group-hover:scale-110 transition-transform">
                    {getCategoryIcon(cat.name)}
                  </div>
                  <span className="truncate">{translateDynamic(cat.name, cat.name_bn, language)}</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
              </button>
            ))}

            <button
              onClick={() => {
                setSelectedCategoryId(null);
                setStoreView("categories");
              }}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-black text-indigo-600 hover:bg-indigo-50 transition-colors pt-2.5 border-t border-slate-100 cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>সকল ক্যাটাগরি ব্রাউজ করুন</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-indigo-600" />
            </button>
          </div>
        </div>

        {/* Center Hero Promotional Interactive Slider */}
        <div
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          className="lg:col-span-6 relative rounded-2xl sm:rounded-3xl overflow-hidden bg-slate-950 text-white min-h-[350px] sm:min-h-[380px] flex items-center shadow-xl group border border-slate-800"
        >
          {/* Background Media */}
          {currentAd.mediaType === "video" && currentAd.videoUrl ? (
            <video
              src={currentAd.videoUrl}
              autoPlay
              muted
              loop
              playsInline
              className="absolute inset-0 w-full h-full object-cover opacity-70"
            />
          ) : (
            <img
              src={
                currentAd.mediaUrl ||
                "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=1200&q=80"
              }
              alt={currentAd.title}
              loading="lazy"
              className="absolute inset-0 w-full h-full object-cover opacity-70 transition-opacity duration-500 scale-100 group-hover:scale-102 transition-transform duration-700"
            />
          )}

          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-950/75 to-transparent"></div>

          {/* Previous / Next Arrow Controls */}
          {activeSliderAds.length > 1 && (
            <>
              <button
                onClick={handlePrevBanner}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-slate-900/80 hover:bg-slate-900 text-white flex items-center justify-center opacity-85 sm:opacity-0 sm:group-hover:opacity-100 transition-all shadow-md cursor-pointer border border-white/10"
                title="পূর্ববর্তী ব্যানার"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={handleNextBanner}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-slate-900/80 hover:bg-slate-900 text-white flex items-center justify-center opacity-85 sm:opacity-0 sm:group-hover:opacity-100 transition-all shadow-md cursor-pointer border border-white/10"
                title="পরবর্তী ব্যানার"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}

          {/* Banner Content Body */}
          <div className="relative p-6 sm:p-8 space-y-3.5 max-w-lg z-10">
            <div className="flex items-center gap-2">
              {currentAd.offerBadge && (
                <span className="px-3 py-1 bg-amber-400 text-slate-950 font-black text-[10px] uppercase tracking-wider rounded-full shadow-md flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5 text-rose-600" />
                  {currentAd.offerBadge}
                </span>
              )}
              <span className="text-[11px] font-bold uppercase tracking-wider text-sky-300">
                প্রিমিয়াম কালেকশন
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight drop-shadow-md text-white text-balance">
              {currentAd.title}
            </h1>

            <p className="text-xs text-slate-200 line-clamp-2 leading-relaxed font-medium">
              {currentAd.description}
            </p>

            {/* Coupon Voucher Strip */}
            {currentAd.couponCode && (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-900/80 border border-indigo-400/40 rounded-xl text-xs font-mono font-bold text-amber-300 shadow-sm">
                <span>কোড: {currentAd.couponCode}</span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(currentAd.couponCode!);
                    setCopiedCoupon(true);
                    addToast(`কুপন কোড "${currentAd.couponCode}" কপি হয়েছে!`, "success");
                    setTimeout(() => setCopiedCoupon(false), 2000);
                  }}
                  className="p-1 hover:bg-white/10 rounded-md text-white transition-colors cursor-pointer"
                  title="কোড কপি করুন"
                >
                  {copiedCoupon ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            )}

            {/* Action Buttons */}
            <div className="pt-2 flex flex-wrap items-center gap-2.5">
              <button
                onClick={() => {
                  trackAdClick(currentAd.id);
                  setStoreView("products");
                }}
                className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black px-5 py-2.5 rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer active:scale-95"
              >
                <ShoppingBag className="w-4 h-4 text-amber-300" />
                <span>{currentAd.buttonText || "এখনই কিনুন"}</span>
              </button>

              <button
                onClick={() => {
                  trackAdClick(currentAd.id);
                  if ("termsConditions" in currentAd) {
                    setSelectedOffer(currentAd as any);
                    setStoreView("offer-details");
                  } else {
                    setStoreView("products");
                  }
                }}
                className="bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs font-bold px-4 py-2.5 rounded-xl transition-all flex items-center gap-1.5 backdrop-blur-xs cursor-pointer"
              >
                <span>বিস্তারিত জানুন</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Carousel Indicators */}
          {activeSliderAds.length > 1 && (
            <div className="absolute bottom-3 right-4 z-20 flex items-center gap-1.5 bg-slate-950/70 px-3 py-1.5 rounded-full border border-white/10">
              {activeSliderAds.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentBannerIndex(idx)}
                  className={`h-2 rounded-full transition-all cursor-pointer ${
                    idx === currentBannerIndex ? "w-6 bg-amber-400" : "w-2 bg-white/40"
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Right Feature Bento: Member Perks & Android/Excel Cards */}
        <div className="lg:col-span-3 flex flex-col justify-between gap-3">
          {/* Card 1: Member Rewards */}
          <div className="bg-gradient-to-br from-indigo-700 via-indigo-800 to-slate-900 rounded-2xl p-4 sm:p-5 text-white space-y-3 shadow-md border border-indigo-500/30 flex-1 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="w-8 h-8 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-black text-sm shadow-md">
                  <Gift className="w-4 h-4 text-slate-950" />
                </span>
                <span className="px-2 py-0.5 bg-white/10 text-amber-300 font-extrabold text-[10px] uppercase rounded-full border border-white/20">
                  সদস্য সুবিধা
                </span>
              </div>
              <h3 className="font-black text-white text-sm leading-snug tracking-tight">
                প্রথম অর্ডারে ৳৫০০ ইনস্ট্যান্ট ছাড়!
              </h3>
              <p className="text-[11px] text-indigo-100 leading-relaxed font-medium">
                স্মার্টশপ মেম্বার হয়ে লুফে নিন ফ্রি হোম ডেলিভারি ও এক্সক্লুসিভ ক্যাশব্যাক।
              </p>
            </div>

            <div className="pt-1">
              <button
                onClick={() => {
                  navigator.clipboard.writeText("WELCOME500");
                  addToast("ভাউচার কোড 'WELCOME500' অ্যাপ্লাই হয়েছে!", "success");
                }}
                className="w-full bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black py-2.5 px-3 rounded-xl shadow-md transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>ভাউচার কোড রিডিম করুন</span>
              </button>
            </div>
          </div>

          {/* Card 2: Official Android Mobile App for Customers */}
          <div className="bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 rounded-2xl p-4 text-white border border-emerald-500/30 shadow-md flex items-center justify-between gap-3">
            <div className="space-y-0.5 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[10px] font-black uppercase text-emerald-400 tracking-wider">
                  Official Android App v2.5.0
                </span>
              </div>
              <h4 className="text-xs font-bold text-white truncate">স্মার্টশপ অ্যান্ড্রয়েড অ্যাপ</h4>
              <p className="text-[10px] text-slate-300">ইনস্টল করুন এবং দ্রুত অর্ডার ও অফলাইন সুবিধা পান</p>
            </div>

            <button
              onClick={() => window.dispatchEvent(new CustomEvent("open-android-install"))}
              className="px-3 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs transition shadow-md flex items-center gap-1.5 shrink-0 cursor-pointer active:scale-95"
              title="অ্যান্ড্রয়েড অ্যাপ ইনস্টল করুন"
            >
              <Smartphone className="w-4 h-4 animate-bounce text-emerald-200" />
              <span>ইনস্টল</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4. Trust & Value Proposition Strip (4 High-Trust Pillars) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-white p-4 rounded-3xl border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-3 p-2">
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-black text-slate-900">২৪ ঘণ্টায় এক্সপ্রেস ডেলিভারি</h4>
            <p className="text-[10px] text-slate-500 font-medium">ঢাকা ও সারা দেশে দ্রুত কুরিয়ার</p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-2">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-black text-slate-900">১০০% আসল পণ্যের গ্যারান্টি</h4>
            <p className="text-[10px] text-slate-500 font-medium">অফিসিয়াল ব্র্যান্ড ওয়ারেন্টি</p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-2">
          <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <CreditCard className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-black text-slate-900">ক্যাশ অন ডেলিভারি ও বিকাশ</h4>
            <p className="text-[10px] text-slate-500 font-medium">নিরাপদ পেমেন্ট সুবিধা</p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-2">
          <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
            <RefreshCw className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-black text-slate-900">৭ দিনের সহজ রিটার্ন পলিসি</h4>
            <p className="text-[10px] text-slate-500 font-medium">ঝামেলাহীন পণ্য বদল</p>
          </div>
        </div>
      </div>

      {/* 5. Deals & Offers Section (Flash Sale Countdown + Products Carousel) */}
      <section className="bg-gradient-to-br from-slate-950 via-rose-950/80 to-slate-950 rounded-3xl border border-rose-500/20 overflow-hidden shadow-xl p-4 sm:p-6 space-y-4 relative">
        {/* Glow ambient blurs */}
        <div className="absolute top-0 right-1/4 w-72 h-72 bg-rose-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 left-10 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header & Countdown Bar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-white/10 pb-4 relative z-10">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 font-black text-[11px] uppercase rounded-full shadow-sm">
                <Flame className="w-3.5 h-3.5 fill-slate-950 animate-bounce" />
                <span>সীমিত সময়ের মেগা অফার</span>
              </span>
              <span className="flex items-center gap-1 text-[11px] font-bold text-rose-300">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                <span>LIVE SALE</span>
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              আজকের সেরা ফ্ল্যাশ ডিল (Mega Flash Deals)
            </h2>
            <p className="text-xs text-slate-300 font-medium">
              সর্বোচ্চ ছাড়ের ধামাকা কালেকশন • অফার শেষ হওয়ার আগেই আপনার পছন্দের পণ্যটি সংগ্রহ করুন
            </p>
          </div>

          {/* Countdown & Action */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Countdown Boxes */}
            <div className="flex items-center gap-1.5 bg-black/40 backdrop-blur-md p-1.5 rounded-2xl border border-white/10">
              <div className="px-2.5 py-1.5 bg-white/10 rounded-xl text-center min-w-[42px]">
                <span className="block font-black text-sm sm:text-base font-mono text-amber-300 leading-tight">
                  {String(timeLeft.days).padStart(2, "0")}
                </span>
                <span className="text-[8px] text-slate-400 uppercase font-bold">দিন</span>
              </div>
              <span className="font-bold text-amber-300">:</span>
              <div className="px-2.5 py-1.5 bg-white/10 rounded-xl text-center min-w-[42px]">
                <span className="block font-black text-sm sm:text-base font-mono text-amber-300 leading-tight">
                  {String(timeLeft.hours).padStart(2, "0")}
                </span>
                <span className="text-[8px] text-slate-400 uppercase font-bold">ঘণ্টা</span>
              </div>
              <span className="font-bold text-amber-300">:</span>
              <div className="px-2.5 py-1.5 bg-white/10 rounded-xl text-center min-w-[42px]">
                <span className="block font-black text-sm sm:text-base font-mono text-amber-300 leading-tight">
                  {String(timeLeft.minutes).padStart(2, "0")}
                </span>
                <span className="text-[8px] text-slate-400 uppercase font-bold">মিনিট</span>
              </div>
              <span className="font-bold text-amber-300">:</span>
              <div className="px-2.5 py-1.5 bg-white/10 rounded-xl text-center min-w-[42px]">
                <span className="block font-black text-sm sm:text-base font-mono text-amber-300 animate-pulse leading-tight">
                  {String(timeLeft.seconds).padStart(2, "0")}
                </span>
                <span className="text-[8px] text-slate-400 uppercase font-bold">সেকেন্ড</span>
              </div>
            </div>

            <button
              onClick={() => setStoreView("products")}
              className="py-2.5 px-4 bg-gradient-to-r from-amber-400 to-orange-400 hover:from-amber-300 hover:to-orange-300 text-slate-950 font-black text-xs rounded-xl transition shadow-md hover:shadow-lg active:scale-95 cursor-pointer flex items-center gap-1.5 shrink-0"
            >
              <span>সকল ডিল দেখুন</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Product Cards Row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 relative z-10">
          {dealProducts.map((p, idx) => {
            const hasDiscount = p.discountPrice && p.discountPrice < p.sellingPrice;
            const discountPercent = hasDiscount
              ? Math.round(((p.sellingPrice - p.discountPrice!) / p.sellingPrice) * 100)
              : 20;

            return (
              <div
                key={`deal-${p.id}-${idx}`}
                onClick={() => {
                  setSelectedProduct(p);
                  setStoreView("product-detail");
                }}
                className="bg-white rounded-2xl p-3 flex flex-col justify-between hover:shadow-xl transition-all duration-300 cursor-pointer group border border-slate-100 hover:border-amber-400 hover:-translate-y-1 relative overflow-hidden"
              >
                {/* Top Badges */}
                <div className="flex items-center justify-between w-full mb-1">
                  <span className="bg-gradient-to-r from-rose-600 to-red-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-xs">
                    -{discountPercent}%
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleWishlist(p);
                      addToast(
                        wishlist.some((w) => w.id === p.id) ? "উইশলিস্ট থেকে সরানো হয়েছে" : "উইশলিস্টে যুক্ত হয়েছে",
                        "info"
                      );
                    }}
                    className={`p-1.5 rounded-full transition-colors ${
                      wishlist.some((w) => w.id === p.id)
                        ? "text-rose-600 bg-rose-50"
                        : "text-slate-400 hover:text-rose-600 hover:bg-slate-50"
                    }`}
                    title="Wishlist"
                  >
                    <Heart className={`w-3.5 h-3.5 ${wishlist.some((w) => w.id === p.id) ? "fill-rose-600" : ""}`} />
                  </button>
                </div>

                {/* Product Image */}
                <div className="h-28 sm:h-32 w-full flex items-center justify-center p-1.5 bg-slate-50/70 rounded-xl overflow-hidden mb-2">
                  <img
                    src={p.mainImage}
                    alt={p.name}
                    className="max-h-full max-w-full object-contain group-hover:scale-108 transition-transform duration-300"
                  />
                </div>

                {/* Info */}
                <div className="space-y-1.5 w-full">
                  <h4
                    className="text-xs font-bold text-slate-800 line-clamp-1 group-hover:text-indigo-600 transition-colors"
                    title={p.name}
                  >
                    {p.name}
                  </h4>
                  <div className="flex items-baseline gap-1.5 flex-wrap">
                    <span className="text-xs sm:text-sm font-black text-rose-600 font-mono">
                      {settings.currencySymbol}{(p.discountPrice || p.sellingPrice).toLocaleString()}
                    </span>
                    {hasDiscount && (
                      <span className="text-[10px] text-slate-400 line-through font-mono">
                        {settings.currencySymbol}{p.sellingPrice.toLocaleString()}
                      </span>
                    )}
                  </div>

                  {/* Stock meter */}
                  <div className="space-y-1 pt-0.5">
                    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                      <div className="bg-gradient-to-r from-amber-500 to-rose-600 h-full rounded-full" style={{ width: `${Math.max(30, 95 - (idx * 12))}%` }} />
                    </div>
                    <p className="text-[9.5px] font-bold text-slate-500">
                      🔥 আর মাত্র {Math.max(2, 8 - idx)}টি বাকি!
                    </p>
                  </div>
                </div>

                {/* Quick Add Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    addToCart(p);
                    addToast(`${p.name} কার্টে যুক্ত হয়েছে!`, "success");
                  }}
                  className="mt-2.5 w-full py-1.5 bg-slate-900 hover:bg-indigo-600 text-white text-[11px] font-bold rounded-xl transition flex items-center justify-center gap-1 shadow-xs group-hover:bg-indigo-600 cursor-pointer"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>কার্টে যোগ</span>
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* 5.5 Psychological Deals Hub: Round of Three, Contrast Effect, Anchoring Bias */}
      <PsychologicalDealsSection onQuickView={onQuickView} />

      {/* 6. Popular Brands Spotlight */}
      <section className="bg-white p-4 sm:p-6 rounded-3xl border border-slate-200/90 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-indigo-50 text-indigo-700 text-[10px] font-extrabold uppercase rounded-md border border-indigo-200">
                <BadgeCheck className="w-3.5 h-3.5 text-indigo-600" />
                <span>১০০% অথেনটিক পার্টনার্স</span>
              </span>
              <span className="text-emerald-600 text-[11px] font-bold hidden sm:inline">
                ✓ অফিশিয়াল ম্যানুফ্যাকচারার ওয়্যারেন্টি
              </span>
            </div>
            <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
              টপ অফিসিয়াল ব্র্যান্ডসমূহ (Top Official Brands)
            </h3>
            <p className="text-xs text-slate-500">
              বিশ্বসেরা ব্র্যান্ডের আসল পণ্য কিনুন নিশ্চিন্তে সরাসরি ব্র্যান্ড স্টোর থেকে
            </p>
          </div>

          <button
            onClick={() => setStoreView("products")}
            className="text-xs font-black text-indigo-600 hover:text-indigo-800 flex items-center gap-1 bg-indigo-50/70 hover:bg-indigo-100 px-3.5 py-2 rounded-xl border border-indigo-200/80 transition shadow-2xs shrink-0 self-start sm:self-auto cursor-pointer"
          >
            <span>সকল ব্র্যান্ড দেখুন</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Brands Responsive Grid */}
        <div className="grid grid-cols-2 min-[420px]:grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 sm:gap-4">
          {brands.slice(0, 6).map((brand, idx) => (
            <button
              key={`brand-${brand.id}`}
              onClick={() => {
                setStoreView("products");
                addToast(`ব্র্যান্ড ফিল্টার করা হয়েছে: ${brand.name}`, "info");
              }}
              className="p-3.5 sm:p-4 rounded-2xl sm:rounded-3xl bg-gradient-to-b from-slate-50/80 via-white to-slate-50/50 hover:from-indigo-50/50 hover:to-white border border-slate-200/90 hover:border-indigo-400 hover:shadow-lg transition-all duration-300 flex flex-col items-center justify-between text-center gap-2 group cursor-pointer hover:-translate-y-1 relative overflow-hidden"
            >
              {/* Verified Badge */}
              <div className="w-full flex items-center justify-between text-[10px]">
                <span className="text-slate-400 font-medium">#{idx + 1}</span>
                <span className="inline-flex items-center gap-0.5 text-indigo-600 font-bold bg-indigo-50 px-1.5 py-0.2 rounded-md">
                  <BadgeCheck className="w-3 h-3 text-indigo-600" />
                  <span className="text-[9px]">Official</span>
                </span>
              </div>

              {/* Brand Logo Container */}
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white shadow-xs border border-slate-200/80 flex items-center justify-center p-2 group-hover:scale-108 group-hover:shadow-md transition-all duration-300 overflow-hidden">
                {brand.logo ? (
                  <img
                    src={brand.logo}
                    alt={brand.name}
                    className="max-h-full max-w-full object-contain"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).style.display = "none";
                    }}
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-indigo-600 to-indigo-800 text-white rounded-xl flex items-center justify-center font-black text-base shadow-inner">
                    {brand.name.slice(0, 2).toUpperCase()}
                  </div>
                )}
              </div>

              {/* Brand Name & Product Count */}
              <div className="space-y-0.5 w-full">
                <span className="text-xs sm:text-sm font-black text-slate-800 group-hover:text-indigo-600 transition-colors block truncate">
                  {brand.name}
                </span>
                <span className="text-[10px] text-slate-500 font-semibold block truncate">
                  {brand.productCount || 15}+ আইটেম
                </span>
              </div>

              {/* Offer Tag */}
              <span className="w-full text-center text-[9.5px] font-black uppercase text-indigo-700 bg-indigo-50/80 group-hover:bg-indigo-600 group-hover:text-white py-1 rounded-lg transition-colors">
                আপ টু ৩০% ছাড়
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* 7. Category Showcase 1: Consumer Electronics and Gadgets */}
      <section className="bg-white rounded-3xl border border-slate-200/90 overflow-hidden shadow-xs flex flex-col lg:flex-row">
        {/* Left Category Banner Card */}
        <div className="lg:w-80 xl:w-96 p-6 sm:p-7 bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900 text-white flex flex-col justify-between relative overflow-hidden shrink-0">
          {/* Background image & gradient lighting */}
          <img
            src="https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&q=80"
            alt="Consumer Electronics"
            className="absolute inset-0 w-full h-full object-cover opacity-25 mix-blend-overlay"
          />
          <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/20 rounded-full blur-2xl pointer-events-none" />

          <div className="relative space-y-3 z-10">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-500/30 text-indigo-300 font-extrabold text-[10px] uppercase rounded-full border border-indigo-400/40 backdrop-blur-md shadow-xs">
              <Zap className="w-3.5 h-3.5 text-indigo-300" />
              <span>স্মার্ট গ্যাজেটস ও টেক</span>
            </span>

            <div>
              <h3 className="text-xl sm:text-2xl font-black leading-tight text-white tracking-tight">
                ইলেকট্রনিক্স ও প্রিমিয়াম গ্যাজেটস
              </h3>
              <p className="text-xs text-indigo-200 mt-1.5 leading-relaxed font-medium">
                স্মার্টওয়াচ, ফ্ল্যাগশিপ ফোন, নয়েজ ক্যানসেলিং অডিও ও অরিজিনাল টেক এক্সেসরিজ
              </p>
            </div>

            {/* Quick Filter Tag Buttons */}
            <div className="flex flex-wrap gap-1.5 pt-2">
              <button
                onClick={() => {
                  const cat = categories.find((c) => c.name.toLowerCase().includes("phone") || c.name.toLowerCase().includes("mobile"));
                  if (cat) setSelectedCategoryId(cat.id);
                  setStoreView("products");
                  addToast("স্মার্টফোন কালেকশন ফিল্টার করা হয়েছে", "info");
                }}
                className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[11px] font-bold border border-white/10 transition cursor-pointer"
              >
                📱 স্মার্টফোন
              </button>
              <button
                onClick={() => {
                  const cat = categories.find((c) => c.name.toLowerCase().includes("laptop") || c.name.toLowerCase().includes("computer"));
                  if (cat) setSelectedCategoryId(cat.id);
                  setStoreView("products");
                  addToast("ল্যাপটপ ও গ্যাজেট ফিল্টার করা হয়েছে", "info");
                }}
                className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[11px] font-bold border border-white/10 transition cursor-pointer"
              >
                💻 ল্যাপটপ
              </button>
              <button
                onClick={() => {
                  setStoreView("products");
                  addToast("প্রিমিয়াম অডিও ও হেডফোন ফিল্টার করা হয়েছে", "info");
                }}
                className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[11px] font-bold border border-white/10 transition cursor-pointer"
              >
                🎧 অডিও
              </button>
              <button
                onClick={() => {
                  const cat = categories.find((c) => c.name.toLowerCase().includes("watch"));
                  if (cat) setSelectedCategoryId(cat.id);
                  setStoreView("products");
                  addToast("স্মার্টওয়াচ কালেকশন ফিল্টার করা হয়েছে", "info");
                }}
                className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[11px] font-bold border border-white/10 transition cursor-pointer"
              >
                ⌚ স্মার্টওয়াচ
              </button>
            </div>

            {/* Value Points */}
            <div className="space-y-1.5 pt-3 border-t border-white/10 text-[11px] text-slate-300 font-medium">
              <p className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>১-২ বছরের অফিশিয়াল ওয়ারেন্টি</span>
              </p>
              <p className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>১০০% অরিজিনাল সিলপ্যাক পণ্য</span>
              </p>
              <p className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>০% ইন্টারেস্টে EMI সুবিধা</span>
              </p>
            </div>
          </div>

          <div className="relative z-10 pt-5">
            <button
              onClick={() => setStoreView("products")}
              className="w-full bg-white text-slate-950 hover:bg-indigo-50 font-black text-xs py-2.5 px-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer active:scale-98"
            >
              <span>সকল গ্যাজেট এক্সপ্লোর করুন</span>
              <ChevronRight className="w-4 h-4 text-indigo-600" />
            </button>
          </div>
        </div>

        {/* Right 4x2 Modern Cards Grid (8 Products) */}
        <div className="flex-1 p-3.5 sm:p-5 grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 bg-slate-50/50">
          {electronicsProducts.map((p, idx) => {
            const hasDiscount = p.discountPrice && p.discountPrice < p.sellingPrice;
            const discountPercent = hasDiscount
              ? Math.round(((p.sellingPrice - p.discountPrice!) / p.sellingPrice) * 100)
              : 15;
            const isWishlisted = wishlist.some((w) => w.id === p.id);

            return (
              <div
                key={`elec-${p.id}-${idx}`}
                onClick={() => {
                  setSelectedProduct(p);
                  setStoreView("product-detail");
                }}
                className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-2xs hover:shadow-xl hover:border-indigo-400 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between overflow-hidden group cursor-pointer relative"
              >
                {/* Top Image Section with Badges */}
                <div className="h-32 sm:h-36 bg-gradient-to-b from-slate-50/90 to-white flex items-center justify-center p-3 relative overflow-hidden">
                  {/* Discount Badge */}
                  <span className="absolute top-2 left-2 z-10 bg-rose-600 text-white font-black text-[9.5px] px-2 py-0.5 rounded-full shadow-xs">
                    -{discountPercent}%
                  </span>

                  {/* Wishlist Heart Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleWishlist(p);
                      addToast(
                        isWishlisted ? "উইশলিস্ট থেকে সরানো হয়েছে" : "উইশলিস্টে যুক্ত হয়েছে",
                        "info"
                      );
                    }}
                    className={`absolute top-2 right-2 z-10 p-1.5 rounded-full backdrop-blur-md transition-colors ${
                      isWishlisted
                        ? "bg-rose-50 text-rose-600 shadow-xs"
                        : "bg-white/80 text-slate-400 hover:text-rose-600 hover:bg-white shadow-2xs"
                    }`}
                    title="Wishlist"
                  >
                    <Heart className={`w-3.5 h-3.5 ${isWishlisted ? "fill-rose-600" : ""}`} />
                  </button>

                  {/* Product Image */}
                  <img
                    src={p.mainImage}
                    alt={p.name}
                    className="max-h-full max-w-full object-contain group-hover:scale-108 transition-transform duration-300"
                  />
                </div>

                {/* Card Content */}
                <div className="p-3 sm:p-3.5 space-y-1.5 flex-1 flex flex-col justify-between">
                  <div className="space-y-1">
                    {/* Brand Tag */}
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="font-bold text-indigo-600 uppercase tracking-wider truncate">
                        {p.brandName || "Official"}
                      </span>
                      <div className="flex items-center gap-0.5 text-amber-500 font-bold">
                        <Star className="w-3 h-3 fill-amber-400" />
                        <span>{p.rating || "4.9"}</span>
                      </div>
                    </div>

                    {/* Product Title */}
                    <h4
                      className="text-xs sm:text-sm font-bold text-slate-800 line-clamp-2 leading-snug group-hover:text-indigo-600 transition-colors"
                      title={p.name}
                    >
                      {p.name}
                    </h4>
                  </div>

                  {/* Price & Action */}
                  <div className="pt-1.5 space-y-2">
                    <div className="flex items-baseline gap-1.5 flex-wrap">
                      <span className="text-xs sm:text-sm font-black text-slate-900 font-mono">
                        {settings.currencySymbol}{(p.discountPrice || p.sellingPrice).toLocaleString()}
                      </span>
                      {hasDiscount && (
                        <span className="text-[10px] text-slate-400 line-through font-mono">
                          {settings.currencySymbol}{p.sellingPrice.toLocaleString()}
                        </span>
                      )}
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        addToCart(p);
                        addToast(`${p.name} কার্টে যুক্ত হয়েছে!`, "success");
                      }}
                      className="w-full py-1.5 bg-slate-900 hover:bg-indigo-600 text-white text-[11px] font-bold rounded-xl transition flex items-center justify-center gap-1.5 shadow-xs cursor-pointer group-hover:bg-indigo-600 active:scale-95"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>কার্টে যোগ</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 8. Category Showcase 2: Home, Living & Appliances */}
      <section className="bg-white rounded-3xl border border-slate-200/90 overflow-hidden shadow-xs flex flex-col lg:flex-row">
        {/* Left Category Banner Card */}
        <div className="lg:w-80 xl:w-96 p-6 sm:p-7 bg-gradient-to-br from-amber-950 via-stone-900 to-amber-900 text-white flex flex-col justify-between relative overflow-hidden shrink-0">
          {/* Background image & gradient lighting */}
          <img
            src="https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80"
            alt="Home & Outdoor"
            className="absolute inset-0 w-full h-full object-cover opacity-25 mix-blend-overlay"
          />
          <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/20 rounded-full blur-2xl pointer-events-none" />

          <div className="relative space-y-3 z-10">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/30 text-amber-300 font-extrabold text-[10px] uppercase rounded-full border border-amber-400/40 backdrop-blur-md shadow-xs">
              <HomeIcon className="w-3.5 h-3.5 text-amber-300" />
              <span>হোম ও লাক্সারি ডেকর</span>
            </span>

            <div>
              <h3 className="text-xl sm:text-2xl font-black leading-tight text-white tracking-tight">
                হোম অ্যাপ্লায়েন্স ও ইন্টেরিয়র ডেকর
              </h3>
              <p className="text-xs text-amber-200 mt-1.5 leading-relaxed font-medium">
                স্মার্ট হোম অটোমেশন, প্রিমিয়াম ফার্নিচার ও আধুনিক লাইফস্টাইল পণ্য
              </p>
            </div>

            {/* Quick Filter Tag Buttons */}
            <div className="flex flex-wrap gap-1.5 pt-2">
              <button
                onClick={() => {
                  setStoreView("products");
                  addToast("লিভিং রুম ডেকর ফিল্টার করা হয়েছে", "info");
                }}
                className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[11px] font-bold border border-white/10 transition cursor-pointer"
              >
                🏠 লিভিং রুম
              </button>
              <button
                onClick={() => {
                  setStoreView("products");
                  addToast("কিচেন ও অ্যাপ্লায়েন্স ফিল্টার করা হয়েছে", "info");
                }}
                className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[11px] font-bold border border-white/10 transition cursor-pointer"
              >
                🍳 কিচেন গ্যাজেট
              </button>
              <button
                onClick={() => {
                  const cat = categories.find((c) => c.name.toLowerCase().includes("furniture") || c.name.toLowerCase().includes("home"));
                  if (cat) setSelectedCategoryId(cat.id);
                  setStoreView("products");
                  addToast("লাক্সারি ফার্নিচার ফিল্টার করা হয়েছে", "info");
                }}
                className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[11px] font-bold border border-white/10 transition cursor-pointer"
              >
                🛋️ ফার্নিচার
              </button>
              <button
                onClick={() => {
                  setStoreView("products");
                  addToast("স্মার্ট লাইটিং ও ডেকর ফিল্টার করা হয়েছে", "info");
                }}
                className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[11px] font-bold border border-white/10 transition cursor-pointer"
              >
                💡 স্মার্ট লাইটিং
              </button>
            </div>

            {/* Value Points */}
            <div className="space-y-1.5 pt-3 border-t border-white/10 text-[11px] text-stone-300 font-medium">
              <p className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>৭ দিনের ইজি রিটার্ন ও রিপ্লেসমেন্ট</span>
              </p>
              <p className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>নিরাপদ প্যাকেজিং ও হোম ডেলিভারি</span>
              </p>
              <p className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>ক্যাশ অন ডেলিভারি ও কার্ড পেমেন্ট</span>
              </p>
            </div>
          </div>

          <div className="relative z-10 pt-5">
            <button
              onClick={() => setStoreView("products")}
              className="w-full bg-white text-slate-950 hover:bg-amber-50 font-black text-xs py-2.5 px-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer active:scale-98"
            >
              <span>সকল হোম প্রোডাক্ট দেখুন</span>
              <ChevronRight className="w-4 h-4 text-amber-700" />
            </button>
          </div>
        </div>

        {/* Right 4x2 Modern Cards Grid (8 Products) */}
        <div className="flex-1 p-3.5 sm:p-5 grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 bg-slate-50/50">
          {homeAndOutdoorProducts.map((p, idx) => {
            const hasDiscount = p.discountPrice && p.discountPrice < p.sellingPrice;
            const discountPercent = hasDiscount
              ? Math.round(((p.sellingPrice - p.discountPrice!) / p.sellingPrice) * 100)
              : 15;
            const isWishlisted = wishlist.some((w) => w.id === p.id);

            return (
              <div
                key={`home-${p.id}-${idx}`}
                onClick={() => {
                  setSelectedProduct(p);
                  setStoreView("product-detail");
                }}
                className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-2xs hover:shadow-xl hover:border-amber-400 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between overflow-hidden group cursor-pointer relative"
              >
                {/* Top Image Section with Badges */}
                <div className="h-32 sm:h-36 bg-gradient-to-b from-amber-50/40 to-white flex items-center justify-center p-3 relative overflow-hidden">
                  {/* Discount Badge */}
                  <span className="absolute top-2 left-2 z-10 bg-amber-600 text-white font-black text-[9.5px] px-2 py-0.5 rounded-full shadow-xs">
                    -{discountPercent}%
                  </span>

                  {/* Wishlist Heart Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleWishlist(p);
                      addToast(
                        isWishlisted ? "উইশলিস্ট থেকে সরানো হয়েছে" : "উইশলিস্টে যুক্ত হয়েছে",
                        "info"
                      );
                    }}
                    className={`absolute top-2 right-2 z-10 p-1.5 rounded-full backdrop-blur-md transition-colors ${
                      isWishlisted
                        ? "bg-rose-50 text-rose-600 shadow-xs"
                        : "bg-white/80 text-slate-400 hover:text-rose-600 hover:bg-white shadow-2xs"
                    }`}
                    title="Wishlist"
                  >
                    <Heart className={`w-3.5 h-3.5 ${isWishlisted ? "fill-rose-600" : ""}`} />
                  </button>

                  {/* Product Image */}
                  <img
                    src={p.mainImage}
                    alt={p.name}
                    className="max-h-full max-w-full object-contain group-hover:scale-108 transition-transform duration-300"
                  />
                </div>

                {/* Card Content */}
                <div className="p-3 sm:p-3.5 space-y-1.5 flex-1 flex flex-col justify-between">
                  <div className="space-y-1">
                    {/* Brand Tag */}
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="font-bold text-amber-700 uppercase tracking-wider truncate">
                        {p.brandName || "Home & Living"}
                      </span>
                      <div className="flex items-center gap-0.5 text-amber-500 font-bold">
                        <Star className="w-3 h-3 fill-amber-400" />
                        <span>{p.rating || "4.8"}</span>
                      </div>
                    </div>

                    {/* Product Title */}
                    <h4
                      className="text-xs sm:text-sm font-bold text-slate-800 line-clamp-2 leading-snug group-hover:text-amber-800 transition-colors"
                      title={p.name}
                    >
                      {p.name}
                    </h4>
                  </div>

                  {/* Price & Action */}
                  <div className="pt-1.5 space-y-2">
                    <div className="flex items-baseline gap-1.5 flex-wrap">
                      <span className="text-xs sm:text-sm font-black text-slate-900 font-mono">
                        {settings.currencySymbol}{(p.discountPrice || p.sellingPrice).toLocaleString()}
                      </span>
                      {hasDiscount && (
                        <span className="text-[10px] text-slate-400 line-through font-mono">
                          {settings.currencySymbol}{p.sellingPrice.toLocaleString()}
                        </span>
                      )}
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        addToCart(p);
                        addToast(`${p.name} কার্টে যুক্ত হয়েছে!`, "success");
                      }}
                      className="w-full py-1.5 bg-slate-900 hover:bg-amber-600 text-white text-[11px] font-bold rounded-xl transition flex items-center justify-center gap-1.5 shadow-xs cursor-pointer group-hover:bg-amber-600 active:scale-95"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>কার্টে যোগ</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 9. Curated Recommendation Products Section with Segmented Filters and 3D Display Styles */}
      <section className="space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="space-y-0.5">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <span>আপনার জন্য নির্বাচিত সেরা পণ্য</span>
              <Sparkles className="w-5 h-5 text-amber-500 animate-pulse hidden sm:inline" />
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              লাইভ ভেরিফাইড স্টক, কাস্টমার রেটিং ও ট্রেন্ডিং ৩ডি ভিজ্যুয়ালাইজেশন
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Interactive Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1 bg-slate-100/90 p-1 rounded-2xl border border-slate-200/70">
              <button
                onClick={() => setActiveTabFilter("all")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition cursor-pointer shrink-0 ${
                  activeTabFilter === "all"
                    ? "bg-white text-indigo-700 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                ✨ সকল পণ্য
              </button>
              <button
                onClick={() => setActiveTabFilter("deals")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition cursor-pointer shrink-0 ${
                  activeTabFilter === "deals"
                    ? "bg-white text-rose-600 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                🔥 স্পেশাল ডিসকাউন্ট
              </button>
              <button
                onClick={() => setActiveTabFilter("gadgets")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition cursor-pointer shrink-0 ${
                  activeTabFilter === "gadgets"
                    ? "bg-white text-indigo-700 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                ⚡ স্মার্ট গ্যাজেটস
              </button>
              <button
                onClick={() => setActiveTabFilter("budget")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition cursor-pointer shrink-0 ${
                  activeTabFilter === "budget"
                    ? "bg-white text-emerald-700 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                🏷️ ৫০,০০০ টাকার মধ্যে
              </button>
            </div>

            {/* 3D Visual Style Switcher */}
            <div className="flex items-center gap-1 bg-slate-900/95 p-1 rounded-2xl border border-indigo-500/30 text-white shadow-sm shrink-0">
              <span className="text-[11px] font-black text-cyan-400 px-2 flex items-center gap-1">
                <Rotate3d className="w-3.5 h-3.5 text-cyan-400" />
                <span className="hidden xl:inline">স্টাইল:</span>
              </span>
              <button
                type="button"
                onClick={() => setProductDisplayMode("3d-tilt")}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition cursor-pointer flex items-center gap-1.5 ${
                  productDisplayMode === "3d-tilt"
                    ? "bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-md"
                    : "text-slate-300 hover:text-white"
                }`}
                title="৩ডি স্পেশাল প্যারালাক্স টিল্ট"
              >
                <Sparkles className="w-3 h-3 text-amber-300" />
                <span>৩ডি টিল্ট</span>
              </button>
              <button
                type="button"
                onClick={() => setProductDisplayMode("3d-carousel")}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition cursor-pointer flex items-center gap-1.5 ${
                  productDisplayMode === "3d-carousel"
                    ? "bg-gradient-to-r from-indigo-600 to-cyan-600 text-white shadow-md"
                    : "text-slate-300 hover:text-white"
                }`}
                title="৩ডি অরবিট ক্যারোসেল"
              >
                <Rotate3d className="w-3 h-3 text-cyan-300" />
                <span>৩ডি অরবিট</span>
              </button>
              <button
                type="button"
                onClick={() => setProductDisplayMode("grid")}
                className={`px-2.5 py-1.5 rounded-xl text-xs font-black transition cursor-pointer flex items-center gap-1 ${
                  productDisplayMode === "grid"
                    ? "bg-slate-700 text-white shadow-md"
                    : "text-slate-400 hover:text-white"
                }`}
                title="ক্লাসিক গ্রিড"
              >
                <Grid className="w-3 h-3" />
                <span className="hidden sm:inline">ক্লাসিক</span>
              </button>
            </div>
          </div>
        </div>

        {/* Conditional Product Display: 3D Orbit Carousel vs 3D Spatial Tilt Grid vs Classic Grid */}
        {productDisplayMode === "3d-carousel" ? (
          <ThreeDProductCarousel
            products={filteredRecommendedProducts}
            onSelectProduct={(p) => {
              setSelectedProduct(p);
              setStoreView("product-detail");
            }}
            onAddToCart={(p) => addToCart(p)}
            wishlist={wishlist}
            onToggleWishlist={(p) => toggleWishlist(p)}
            onQuickView={onQuickView}
            currencySymbol={settings.currencySymbol}
            onOpen3DStage={handleProduct3DInspect}
          />
        ) : productDisplayMode === "3d-tilt" ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-3.5 sm:gap-5">
            {filteredRecommendedProducts.map((product, idx) => (
              <ThreeDProductCard
                key={`rec-3d-${product.id}-${idx}`}
                product={product}
                onSelectProduct={(p) => {
                  setSelectedProduct(p);
                  setStoreView("product-detail");
                }}
                onAddToCart={(p) => addToCart(p)}
                isWishlisted={wishlist.some((item) => item.id === product.id)}
                onToggleWishlist={(p) => toggleWishlist(p)}
                isCompared={compareList.some((item) => item.id === product.id)}
                onToggleCompare={(p) => toggleCompare(p)}
                onQuickView={onQuickView}
                currencySymbol={settings.currencySymbol}
                onOpen3DStage={handleProduct3DInspect}
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-3.5 sm:gap-5">
            {filteredRecommendedProducts.map((product, idx) => (
              <ProductCard
                key={`rec-${product.id}-${idx}`}
                product={product}
                onSelectProduct={(p) => {
                  setSelectedProduct(p);
                  setStoreView("product-detail");
                }}
                onAddToCart={(p) => addToCart(p)}
                isWishlisted={wishlist.some((item) => item.id === product.id)}
                onToggleWishlist={(p) => toggleWishlist(p)}
                isCompared={compareList.some((item) => item.id === product.id)}
                onToggleCompare={(p) => toggleCompare(p)}
                onQuickView={onQuickView}
                currencySymbol={settings.currencySymbol}
              />
            ))}
          </div>
        )}

        {/* Dynamic "View More" (আরও দেখুন / Load More) Interactive Controls */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
          <div className="flex items-center gap-2.5 text-xs text-slate-600 font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>
              প্রদর্শিত হচ্ছে <strong className="text-slate-900 font-black">{filteredRecommendedProducts.length}</strong> /{" "}
              <strong className="text-slate-900 font-black">{allMatchingRecommended.length}</strong> টি ভেরিফাইড প্রোডাক্ট
            </span>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            {filteredRecommendedProducts.length < allMatchingRecommended.length ? (
              <button
                type="button"
                onClick={() => setRecommendedVisibleCount((prev) => prev + 10)}
                className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs transition shadow-sm flex items-center justify-center gap-2 cursor-pointer active:scale-98"
              >
                <span>আরও পণ্য দেখুন (Load More)</span>
                <ChevronDown className="w-4 h-4" />
              </button>
            ) : (
              <div className="text-xs text-emerald-700 font-bold px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200">
                ✓ সকল প্রোডাক্ট প্রদর্শিত হয়েছে
              </div>
            )}

            <button
              type="button"
              onClick={() => setStoreView("products")}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer border border-slate-200"
            >
              <span>সকল পণ্য ব্রাউজ করুন</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* 10. Verified Customer Satisfaction & Courier Trust Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-2">
            <div className="flex items-center text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <span className="text-xs font-bold text-slate-300">৪.৯/৫ কাস্টমার সন্তুষ্টি</span>
          </div>
          <h3 className="text-lg sm:text-xl font-black text-white">
            ১৫,০০০+ এর বেশি সন্তুষ্ট গ্রাহক আমাদের ওপর আস্থা রাখেন
          </h3>
          <p className="text-xs text-slate-300 max-w-xl">
            দ্রুততম কুরিয়ার পার্টনারদের মাধ্যমে সমগ্র বাংলাদেশে ক্যাশ অন ডেলিভারি ও শতভাগ অরিজিনাল পণ্য নিশ্চিত করা হয়।
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2.5 shrink-0">
          <span className="px-3 py-1.5 bg-white/10 rounded-xl text-xs font-bold border border-white/10">
            📦 Steadfast Courier
          </span>
          <span className="px-3 py-1.5 bg-white/10 rounded-xl text-xs font-bold border border-white/10">
            🚀 Pathao Courier
          </span>
          <span className="px-3 py-1.5 bg-white/10 rounded-xl text-xs font-bold border border-white/10">
            ⚡ RedX Delivery
          </span>
        </div>
      </div>
    </div>
  );
};

// Reusable Elevated Product Card Component
export const ProductCard: React.FC<{
  product: Product;
  onSelectProduct: (p: Product) => void;
  onAddToCart: (p: Product) => void;
  isWishlisted: boolean;
  onToggleWishlist: (p: Product) => void;
  isCompared: boolean;
  onToggleCompare: (p: Product) => void;
  onQuickView?: (p: Product) => void;
  currencySymbol: string;
}> = ({
  product,
  onSelectProduct,
  onAddToCart,
  isWishlisted,
  onToggleWishlist,
  isCompared,
  onToggleCompare,
  onQuickView,
  currencySymbol,
}) => {
  const displayPrice = product.discountPrice || product.sellingPrice;
  const hasDiscount = product.discountPrice && product.discountPrice < product.sellingPrice;
  const isOutOfStock = product.totalStock <= 0;
  const discountPercent = hasDiscount
    ? Math.round(((product.sellingPrice - product.discountPrice!) / product.sellingPrice) * 100)
    : 0;

  return (
    <div className="group bg-white rounded-3xl border border-slate-200/90 overflow-hidden hover:border-indigo-400 hover:shadow-xl transition-all duration-300 flex flex-col justify-between h-full min-w-0 w-full relative">
      {/* Uniform Aspect Square Image Gallery Container */}
      <div className="relative w-full aspect-square overflow-hidden bg-slate-100 group/img cursor-pointer">
        <img
          src={product.mainImage}
          alt={product.name}
          className={`w-full h-full object-cover transition-transform duration-700 ease-out group-hover/img:scale-110 ${
            isOutOfStock ? "opacity-50 grayscale" : ""
          }`}
          onClick={() => onSelectProduct(product)}
        />

        {/* Ambient Gradient on Hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-slate-950/20 opacity-0 group-hover/img:opacity-100 transition-opacity duration-300 pointer-events-none" />

        {/* Top-Left Badges */}
        <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5 items-start pointer-events-none">
          {hasDiscount && (
            <span className="bg-gradient-to-r from-rose-600 to-rose-500 text-white text-[11px] font-black px-2.5 py-0.5 rounded-full shadow-md backdrop-blur-xs tracking-tight flex items-center gap-1">
              <span>-{discountPercent}%</span>
            </span>
          )}

          {product.freeShipping && (
            <span className="bg-emerald-600/95 text-white text-[9px] font-extrabold px-2 py-0.5 rounded-full shadow-xs backdrop-blur-xs">
              Free Delivery
            </span>
          )}
        </div>

        {/* Top-Right Stock Badge */}
        <div className="absolute top-3 right-3 z-10 pointer-events-none">
          {isOutOfStock ? (
            <span className="bg-slate-950/90 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full shadow-md">
              স্টক শেষ
            </span>
          ) : product.isLowStock ? (
            <span className="bg-amber-400 text-slate-950 text-[10px] font-black px-2.5 py-0.5 rounded-full shadow-md flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-950 animate-ping" />
              <span>মাত্র {product.totalStock}টি বাকি</span>
            </span>
          ) : null}
        </div>

        {/* Quick Action Floating Buttons */}
        <div className="absolute bottom-3 right-3 z-10 flex items-center gap-1.5 opacity-90 sm:opacity-0 group-hover:opacity-100 transition-all duration-200 transform translate-y-0 sm:translate-y-1 group-hover:translate-y-0">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleWishlist(product);
            }}
            className={`w-8 h-8 rounded-full shadow-md backdrop-blur-md flex items-center justify-center transition-all active:scale-90 cursor-pointer ${
              isWishlisted
                ? "bg-rose-600 text-white"
                : "bg-white/95 text-slate-700 hover:bg-white hover:text-rose-600"
            }`}
            title="Wishlist"
          >
            <Heart className={`w-4 h-4 ${isWishlisted ? "fill-current" : ""}`} />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleCompare(product);
            }}
            className={`w-8 h-8 rounded-full shadow-md backdrop-blur-md flex items-center justify-center transition-all active:scale-90 cursor-pointer ${
              isCompared
                ? "bg-indigo-600 text-white"
                : "bg-white/95 text-slate-700 hover:bg-white hover:text-indigo-600"
            }`}
            title="Compare"
          >
            <GitCompare className="w-4 h-4" />
          </button>
          {onQuickView && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onQuickView(product);
              }}
              className="w-8 h-8 rounded-full shadow-md bg-white/95 text-slate-700 hover:bg-white hover:text-indigo-600 backdrop-blur-md flex items-center justify-center transition-all active:scale-90 cursor-pointer"
              title="Quick View"
            >
              <Eye className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Card Details & Info */}
      <div className="p-4 space-y-2.5 flex-1 flex flex-col justify-between min-w-0">
        <div className="space-y-1.5">
          {/* Brand & Category line */}
          <div className="flex items-center justify-between text-[11px] font-bold text-indigo-600 uppercase tracking-wider">
            <span className="truncate">{product.brandName}</span>
            <span className="text-[10px] font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md font-sans">
              {product.categoryName}
            </span>
          </div>

          {/* Product Title (2-line clamp with uniform height) */}
          <h3
            onClick={() => onSelectProduct(product)}
            className="font-bold text-slate-900 text-xs sm:text-sm line-clamp-2 hover:text-indigo-600 transition-colors cursor-pointer leading-snug min-h-[2.5rem]"
            title={product.name}
          >
            {product.name}
          </h3>

          {/* Rating and Stock Status Row */}
          <div className="flex items-center justify-between gap-1 text-xs pt-0.5">
            <div className="flex items-center gap-1.5 bg-amber-50 text-amber-900 border border-amber-200/60 px-2 py-0.5 rounded-md font-bold text-[11px]">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>{(product.rating || 4.8).toFixed(1)}</span>
              <span className="text-slate-400 font-normal">({product.reviewsCount || 12})</span>
            </div>
            <span className="text-[10px] font-semibold text-emerald-600">
              ✓ ভেরিফাইড
            </span>
          </div>
        </div>

        {/* Pricing & CTA */}
        <div className="pt-2.5 border-t border-slate-100 space-y-2.5 mt-auto">
          <div className="flex items-baseline justify-between gap-1">
            <div>
              <span className="text-base sm:text-lg font-black text-slate-900 font-mono tracking-tight">
                {currencySymbol}{displayPrice.toLocaleString()}
              </span>
              {hasDiscount && (
                <span className="text-xs text-slate-400 line-through font-normal ml-2 font-mono">
                  {currencySymbol}{product.sellingPrice.toLocaleString()}
                </span>
              )}
            </div>
            {hasDiscount && (
              <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-100">
                সাশ্রয় {currencySymbol}{(product.sellingPrice - displayPrice).toLocaleString()}
              </span>
            )}
          </div>

          {isOutOfStock ? (
            <button
              disabled
              className="w-full py-2.5 bg-slate-100 text-slate-400 font-bold text-xs rounded-xl cursor-not-allowed text-center"
            >
              স্টক শেষ (Out of Stock)
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onAddToCart(product)}
              className="w-full py-2.5 px-3 bg-indigo-600 hover:bg-indigo-700 active:scale-98 text-white font-black text-xs rounded-xl shadow-xs hover:shadow-indigo-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer group/btn"
            >
              <ShoppingBag className="w-3.5 h-3.5 transition-transform group-hover/btn:-translate-y-0.5" />
              <span>কার্টে যোগ করুন</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
