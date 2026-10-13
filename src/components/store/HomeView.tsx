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
} from "lucide-react";

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
  const [recommendedVisibleCount, setRecommendedVisibleCount] = useState<number>(10);

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
      <section className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs grid grid-cols-1 lg:grid-cols-12">
        {/* Left Timer Block */}
        <div className="lg:col-span-3 p-6 bg-gradient-to-br from-rose-950/90 to-slate-950 text-white flex flex-col justify-between space-y-4">
          <div className="space-y-1">
            <span className="px-2.5 py-0.5 bg-amber-400 text-slate-950 font-black text-[10px] uppercase rounded-full tracking-wider">
              ⚡ ফ্ল্যাশ সেল
            </span>
            <h2 className="text-lg font-black text-white tracking-tight">সীমিত সময়ের ধামাকা অফার</h2>
            <p className="text-xs text-rose-200 font-medium">আজকের বিশেষ ছাড় শেষ হতে বাকি:</p>
          </div>

          {/* Countdown Boxes */}
          <div className="flex items-center gap-1.5">
            <div className="flex-1 bg-white/10 backdrop-blur-md p-2 rounded-xl text-center border border-white/10">
              <span className="block font-black text-base font-mono text-amber-300">
                {String(timeLeft.days).padStart(2, "0")}
              </span>
              <span className="text-[9px] text-slate-300 uppercase font-bold">দিন</span>
            </div>
            <div className="flex-1 bg-white/10 backdrop-blur-md p-2 rounded-xl text-center border border-white/10">
              <span className="block font-black text-base font-mono text-amber-300">
                {String(timeLeft.hours).padStart(2, "0")}
              </span>
              <span className="text-[9px] text-slate-300 uppercase font-bold">ঘণ্টা</span>
            </div>
            <div className="flex-1 bg-white/10 backdrop-blur-md p-2 rounded-xl text-center border border-white/10">
              <span className="block font-black text-base font-mono text-amber-300">
                {String(timeLeft.minutes).padStart(2, "0")}
              </span>
              <span className="text-[9px] text-slate-300 uppercase font-bold">মিনিট</span>
            </div>
            <div className="flex-1 bg-white/10 backdrop-blur-md p-2 rounded-xl text-center border border-white/10">
              <span className="block font-black text-base font-mono text-amber-300 animate-pulse">
                {String(timeLeft.seconds).padStart(2, "0")}
              </span>
              <span className="text-[9px] text-slate-300 uppercase font-bold">সেকেন্ড</span>
            </div>
          </div>

          <button
            onClick={() => setStoreView("products")}
            className="w-full py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs rounded-xl transition shadow-md cursor-pointer text-center"
          >
            সকল ফ্ল্যাশ ডিল দেখুন →
          </button>
        </div>

        {/* Right Product Items Row */}
        <div className="lg:col-span-9 grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 divide-x divide-y divide-slate-100">
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
                className="p-3.5 flex flex-col items-center justify-between text-center space-y-2.5 hover:bg-slate-50 transition-colors cursor-pointer group min-w-0"
              >
                <div className="w-24 h-24 p-1.5 overflow-hidden flex items-center justify-center shrink-0">
                  <img
                    src={p.mainImage}
                    alt={p.name}
                    className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform"
                  />
                </div>
                <div className="space-y-1 w-full min-w-0">
                  <h4
                    className="text-xs font-bold text-slate-800 truncate group-hover:text-indigo-600 transition-colors"
                    title={p.name}
                  >
                    {p.name}
                  </h4>
                  <div className="flex items-center justify-center gap-1.5">
                    <span className="text-xs font-black text-indigo-600 font-mono">
                      {settings.currencySymbol}{(p.discountPrice || p.sellingPrice).toLocaleString()}
                    </span>
                    <span className="bg-rose-100 text-rose-700 text-[10px] font-black px-1.5 py-0.2 rounded-md">
                      -{discountPercent}%
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 6. Popular Brands Spotlight Carousel */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-indigo-600" />
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
              টপ অফিসিয়াল ব্র্যান্ডসমূহ (Top Brands)
            </h3>
          </div>
          <button
            onClick={() => setStoreView("products")}
            className="text-xs font-bold text-indigo-600 hover:underline flex items-center gap-0.5"
          >
            <span>সব দেখুন</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2.5">
          {brands.slice(0, 6).map((brand) => (
            <button
              key={`brand-${brand.id}`}
              onClick={() => {
                setStoreView("products");
                addToast(`ব্র্যান্ড ফিল্টার করা হয়েছে: ${brand.name}`, "info");
              }}
              className="p-3 rounded-2xl bg-slate-50 hover:bg-indigo-50 border border-slate-200/80 hover:border-indigo-300 transition-all flex flex-col items-center justify-center gap-1.5 group cursor-pointer"
            >
              <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-xs font-black text-slate-800 group-hover:text-indigo-600 shadow-2xs">
                {brand.name.slice(0, 2).toUpperCase()}
              </div>
              <span className="text-xs font-bold text-slate-700 group-hover:text-indigo-600 truncate max-w-full">
                {brand.name}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* 7. Category Showcase 1: Consumer Electronics and Gadgets */}
      <section className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs grid grid-cols-1 lg:grid-cols-12">
        {/* Left Category Banner Card */}
        <div className="lg:col-span-3 relative bg-indigo-950 text-white p-6 flex flex-col justify-between min-h-[300px]">
          <img
            src="https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&q=80"
            alt="Consumer Electronics"
            className="absolute inset-0 w-full h-full object-cover opacity-35 mix-blend-overlay"
          />
          <div className="relative space-y-2 z-10">
            <span className="px-2.5 py-0.5 bg-indigo-500/30 text-indigo-300 font-bold text-[10px] uppercase rounded-md border border-indigo-500/40">
              স্মার্ট গ্যাজেটস
            </span>
            <h3 className="text-xl font-black leading-tight text-white">ইলেকট্রনিক্স ও প্রিমিয়াম গ্যাজেটস</h3>
            <p className="text-xs text-indigo-200">স্মার্টওয়াচ, ফ্ল্যাগশিপ ফোন, হেডফোন ও অরিজিনাল এক্সেসরিজ</p>
          </div>

          <div className="relative z-10 pt-4">
            <button
              onClick={() => setStoreView("products")}
              className="bg-white text-slate-900 hover:bg-slate-100 font-bold text-xs px-4 py-2 rounded-xl shadow-md transition-colors inline-flex items-center gap-1.5 cursor-pointer"
            >
              <span>সকল গ্যাজেট দেখুন</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Right 4x2 Grid (8 Products) */}
        <div className="lg:col-span-9 grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 divide-x divide-y divide-slate-100">
          {electronicsProducts.map((p, idx) => (
            <div
              key={`elec-${p.id}-${idx}`}
              onClick={() => {
                setSelectedProduct(p);
                setStoreView("product-detail");
              }}
              className="p-3.5 flex flex-col justify-between hover:bg-slate-50 transition-colors cursor-pointer group space-y-2 min-w-0"
            >
              <div>
                <h4
                  className="text-xs font-bold text-slate-800 line-clamp-1 group-hover:text-indigo-600 transition-colors"
                  title={p.name}
                >
                  {p.name}
                </h4>
                <p className="text-[11px] text-indigo-600 font-black font-mono mt-0.5">
                  {settings.currencySymbol}{(p.discountPrice || p.sellingPrice).toLocaleString()}
                </p>
              </div>
              <div className="h-28 flex items-center justify-center p-1">
                <img
                  src={p.mainImage}
                  alt={p.name}
                  className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform"
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 8. Category Showcase 2: Home, Living & Appliances */}
      <section className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs grid grid-cols-1 lg:grid-cols-12">
        {/* Left Category Banner Card */}
        <div className="lg:col-span-3 relative bg-amber-950 text-white p-6 flex flex-col justify-between min-h-[300px]">
          <img
            src="https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&q=80"
            alt="Home & Outdoor"
            className="absolute inset-0 w-full h-full object-cover opacity-35 mix-blend-overlay"
          />
          <div className="relative space-y-2 z-10">
            <span className="px-2.5 py-0.5 bg-amber-500/30 text-amber-300 font-bold text-[10px] uppercase rounded-md border border-amber-500/40">
              হোম ও লিভিং
            </span>
            <h3 className="text-xl font-black leading-tight text-white">হোম অ্যাপ্লায়েন্স ও ডেকর</h3>
            <p className="text-xs text-amber-200">স্মার্ট হোম গ্যাজেট, ফার্নিচার ও দৈনন্দিন ব্যবহার্য পণ্য</p>
          </div>

          <div className="relative z-10 pt-4">
            <button
              onClick={() => setStoreView("products")}
              className="bg-white text-slate-900 hover:bg-slate-100 font-bold text-xs px-4 py-2 rounded-xl shadow-md transition-colors inline-flex items-center gap-1.5 cursor-pointer"
            >
              <span>সকল পণ্য দেখুন</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Right 4x2 Grid (8 Products) */}
        <div className="lg:col-span-9 grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 divide-x divide-y divide-slate-100">
          {homeAndOutdoorProducts.map((p, idx) => (
            <div
              key={`home-${p.id}-${idx}`}
              onClick={() => {
                setSelectedProduct(p);
                setStoreView("product-detail");
              }}
              className="p-3.5 flex flex-col justify-between hover:bg-slate-50 transition-colors cursor-pointer group space-y-2 min-w-0"
            >
              <div>
                <h4
                  className="text-xs font-bold text-slate-800 line-clamp-1 group-hover:text-indigo-600 transition-colors"
                  title={p.name}
                >
                  {p.name}
                </h4>
                <p className="text-[11px] text-amber-700 font-black font-mono mt-0.5">
                  {settings.currencySymbol}{(p.discountPrice || p.sellingPrice).toLocaleString()}
                </p>
              </div>
              <div className="h-28 flex items-center justify-center p-1">
                <img
                  src={p.mainImage}
                  alt={p.name}
                  className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform"
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 9. Curated Recommendation Products Section with Segmented Filters */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">আপনার জন্য নির্বাচিত সেরা পণ্য</h2>
            <p className="text-xs text-slate-500 font-medium">লাইভ ভেরিফাইড স্টক ও ট্রেন্ডিং কালেকশন</p>
          </div>

          {/* Interactive Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1 bg-slate-100 p-1 rounded-2xl">
            <button
              onClick={() => setActiveTabFilter("all")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 ${
                activeTabFilter === "all" ? "bg-white text-indigo-700 shadow-xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              সকল পণ্য
            </button>
            <button
              onClick={() => setActiveTabFilter("deals")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 ${
                activeTabFilter === "deals" ? "bg-white text-rose-700 shadow-xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              🔥 স্পেশাল ডিসকাউন্ট
            </button>
            <button
              onClick={() => setActiveTabFilter("gadgets")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 ${
                activeTabFilter === "gadgets" ? "bg-white text-indigo-700 shadow-xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              স্মার্ট গ্যাজেটস
            </button>
            <button
              onClick={() => setActiveTabFilter("budget")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 ${
                activeTabFilter === "budget" ? "bg-white text-emerald-700 shadow-xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              ৫০,০০০ টাকার মধ্যে
            </button>
          </div>
        </div>

        {/* Product Cards Grid */}
        <div className="grid grid-cols-1 min-[380px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-3.5 sm:gap-4.5">
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
    <div className="group bg-white rounded-3xl border border-slate-200/90 overflow-hidden hover:border-indigo-400 hover:shadow-xl transition-all duration-300 flex flex-col justify-between h-full min-w-0 w-full">
      <div className="relative bg-gradient-to-b from-slate-50 to-white p-4 aspect-square overflow-hidden flex items-center justify-center">
        {/* Badges Column */}
        <div className="absolute top-3 left-3 z-10 flex flex-col gap-1 items-start">
          {hasDiscount && (
            <span className="bg-rose-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-xs">
              -{discountPercent}%
            </span>
          )}

          {product.freeShipping && (
            <span className="bg-emerald-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md shadow-xs">
              Free Delivery
            </span>
          )}
        </div>

        {isOutOfStock ? (
          <span className="absolute top-3 right-3 z-10 bg-slate-800 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-xs">
            স্টক শেষ
          </span>
        ) : product.isLowStock ? (
          <span className="absolute top-3 right-3 z-10 bg-amber-500 text-slate-900 text-[10px] font-black px-2 py-0.5 rounded-full shadow-xs">
            মাত্র {product.totalStock}টি বাকি
          </span>
        ) : null}

        <img
          src={product.mainImage}
          alt={product.name}
          className={`w-full h-full object-contain group-hover:scale-108 transition-transform duration-300 cursor-pointer ${
            isOutOfStock ? "opacity-50 grayscale" : ""
          }`}
          onClick={() => onSelectProduct(product)}
        />

        {/* Quick Action Overlay Buttons */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button
            onClick={() => onToggleWishlist(product)}
            className={`p-2 rounded-full shadow-md backdrop-blur-md transition-colors cursor-pointer ${
              isWishlisted ? "bg-rose-600 text-white" : "bg-white/95 text-slate-700 hover:bg-white"
            }`}
            title="Wishlist"
          >
            <Heart className="w-4 h-4 fill-current" />
          </button>
          <button
            onClick={() => onToggleCompare(product)}
            className={`p-2 rounded-full shadow-md backdrop-blur-md transition-colors cursor-pointer ${
              isCompared ? "bg-indigo-600 text-white" : "bg-white/95 text-slate-700 hover:bg-white"
            }`}
            title="Compare"
          >
            <GitCompare className="w-4 h-4" />
          </button>
          {onQuickView && (
            <button
              onClick={() => onQuickView(product)}
              className="p-2 rounded-full shadow-md bg-white/95 text-slate-700 hover:bg-white transition-colors cursor-pointer"
              title="Quick View"
            >
              <Eye className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <div className="p-4 space-y-2.5 flex-1 flex flex-col justify-between min-w-0">
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-black text-slate-900 font-mono text-base">
              {currencySymbol}{displayPrice.toLocaleString()}
              {hasDiscount && (
                <span className="text-xs text-slate-400 line-through font-normal ml-1.5 font-mono">
                  {currencySymbol}{product.sellingPrice.toLocaleString()}
                </span>
              )}
            </span>
          </div>

          <div className="flex items-center gap-1 text-amber-500 text-xs font-bold">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-3.5 h-3.5 ${
                    i < Math.floor(product.rating || 4.5)
                      ? "fill-amber-400 text-amber-400"
                      : "fill-slate-200 text-slate-200"
                  }`}
                />
              ))}
            </div>
            <span className="text-slate-600 font-medium text-[11px]">({product.reviewsCount || 12})</span>
          </div>

          <h3
            onClick={() => onSelectProduct(product)}
            className="font-bold text-slate-900 text-xs sm:text-sm line-clamp-2 hover:text-indigo-600 transition-colors cursor-pointer leading-snug"
            title={product.name}
          >
            {product.name}
          </h3>
        </div>

        <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2 mt-auto">
          <span className="text-xs text-slate-400 font-medium truncate max-w-[45%]" title={product.brandName}>
            {product.brandName}
          </span>

          {isOutOfStock ? (
            <button
              disabled
              className="bg-slate-100 text-slate-400 font-bold text-xs px-3 py-1.5 rounded-xl cursor-not-allowed shrink-0"
            >
              স্টক শেষ
            </button>
          ) : (
            <button
              onClick={() => onAddToCart(product)}
              className="bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-bold text-xs px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 shadow-xs transition-all shrink-0 cursor-pointer"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>কার্টে নিন</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
