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
  ArrowRight,
  Flame,
  Zap,
  Sparkles,
  Eye,
  Send,
  Car,
  Home as HomeIcon,
  Wrench,
  BookOpen,
  Smartphone,
  Shirt,
  Dumbbell,
  Grid,
  CheckCircle2,
  Clock,
  Laptop,
  Watch,
  Camera,
  Tv,
  User,
  Gift,
  Armchair,
  HeartPulse,
  Package,
  ChevronLeft,
  Play,
  Pause,
  Copy,
  Check,
} from "lucide-react";

export const HomeView: React.FC<{ onQuickView?: (p: Product) => void }> = ({ onQuickView }) => {
  const {
    homeBanners,
    advertisements,
    setSelectedOffer,
    trackAdImpression,
    trackAdClick,
    categories,
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
      // Sort by priority and cap at exactly top 5 active slides
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
      buttonText: b.buttonText || "Shop Now",
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

  // Auto-slide every 5 seconds
  useEffect(() => {
    if (!activeSliderAds.length) return;
    const interval = setInterval(() => {
      setCurrentBannerIndex((prev) => (prev + 1) % activeSliderAds.length);
    }, 5000);
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
    days: 4,
    hours: 13,
    minutes: 34,
    seconds: 56,
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

  // Supplier Inquiry Form State
  const [inquiryItem, setInquiryItem] = useState("");
  const [inquiryDetails, setInquiryDetails] = useState("");
  const [inquiryQty, setInquiryQty] = useState("10");
  const [inquiryUnit, setInquiryUnit] = useState("Pcs");

  const handleInquirySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inquiryItem.trim() || !inquiryDetails.trim()) {
      addToast("Please fill out the item name and inquiry details", "warning");
      return;
    }
    addToast(`Quote request for "${inquiryItem}" (${inquiryQty} ${inquiryUnit}) sent to verified suppliers!`, "success");
    setInquiryItem("");
    setInquiryDetails("");
  };

  const activeBanner = homeBanners[currentBannerIndex] || homeBanners[0];

  // Category Icon Mapping
  const getCategoryIcon = (name: string) => {
    const lower = name.toLowerCase();
    if (lower.includes("mobile") || lower.includes("phone") || lower.includes("android") || lower.includes("iphone")) {
      return <Smartphone className="w-4 h-4 text-sky-600" />;
    }
    if (lower.includes("laptop") || lower.includes("computer") || lower.includes("pc") || lower.includes("macbook")) {
      return <Laptop className="w-4 h-4 text-blue-600" />;
    }
    if (lower.includes("watch") || lower.includes("wearable")) {
      return <Watch className="w-4 h-4 text-amber-600" />;
    }
    if (lower.includes("camera") || lower.includes("photo") || lower.includes("dslr")) {
      return <Camera className="w-4 h-4 text-rose-600" />;
    }
    if (lower.includes("electronic") || lower.includes("gadget") || lower.includes("tech")) {
      return <Tv className="w-4 h-4 text-indigo-600" />;
    }
    if (lower.includes("men") && !lower.includes("women")) {
      return <User className="w-4 h-4 text-slate-700" />;
    }
    if (lower.includes("women") || lower.includes("lady") || lower.includes("ladies")) {
      return <ShoppingBag className="w-4 h-4 text-pink-600" />;
    }
    if (lower.includes("fashion") || lower.includes("cloth") || lower.includes("wear") || lower.includes("apparel") || lower.includes("shirt")) {
      return <Shirt className="w-4 h-4 text-emerald-600" />;
    }
    if (lower.includes("home") || lower.includes("living") || lower.includes("appliance")) {
      return <HomeIcon className="w-4 h-4 text-teal-600" />;
    }
    if (lower.includes("furniture") || lower.includes("decor")) {
      return <Armchair className="w-4 h-4 text-amber-700" />;
    }
    if (lower.includes("auto") || lower.includes("car") || lower.includes("bike") || lower.includes("vehicle")) {
      return <Car className="w-4 h-4 text-red-600" />;
    }
    if (lower.includes("tool") || lower.includes("equipment") || lower.includes("hardware")) {
      return <Wrench className="w-4 h-4 text-amber-800" />;
    }
    if (lower.includes("book") || lower.includes("stationery") || lower.includes("novel")) {
      return <BookOpen className="w-4 h-4 text-purple-600" />;
    }
    if (lower.includes("sport") || lower.includes("outdoor") || lower.includes("gym") || lower.includes("fitness")) {
      return <Dumbbell className="w-4 h-4 text-orange-600" />;
    }
    if (lower.includes("beauty") || lower.includes("health") || lower.includes("cosmetic") || lower.includes("care")) {
      return <HeartPulse className="w-4 h-4 text-rose-500" />;
    }
    if (lower.includes("jewelry") || lower.includes("jewel") || lower.includes("gold") || lower.includes("ring")) {
      return <Sparkles className="w-4 h-4 text-yellow-500" />;
    }
    if (lower.includes("gift") || lower.includes("present")) {
      return <Gift className="w-4 h-4 text-indigo-500" />;
    }
    if (lower.includes("bag") || lower.includes("luggage") || lower.includes("backpack")) {
      return <Package className="w-4 h-4 text-stone-600" />;
    }
    return <Grid className="w-4 h-4 text-indigo-600" />;
  };

  // Helper to ensure unique products in sliced lists
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

  // Filtered product collections for Category Product Sections
  const homeAndOutdoorProducts = getUniqueProducts(
    products.filter((p) => p.categoryName?.toLowerCase().includes("home") || p.categoryName?.toLowerCase().includes("furniture")),
    products,
    8
  );

  const electronicsProducts = getUniqueProducts(
    products.filter((p) => p.categoryName?.toLowerCase().includes("electronic") || p.categoryName?.toLowerCase().includes("gadget")),
    products,
    8
  );

  const dealProducts = getUniqueProducts(
    products.filter((p) => p.discountPrice && p.discountPrice < p.sellingPrice),
    products,
    5
  );

  const recommendedProducts = getUniqueProducts(products, products, 8);

  return (
    <div className="space-y-8 pb-16">
      {/* 1. Hero Grid Section (Left Category Panel + Main Hero Banner + Supplier Promo Banner) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-3 sm:p-4 shadow-xs grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Category Navigation Panel */}
        <div className="lg:col-span-3 border-r border-slate-100 pr-2 hidden lg:block">
          <div className="space-y-1">
            {categories.slice(0, 8).map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  setSelectedCategoryId(cat.id);
                  setStoreView("products");
                }}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:text-indigo-600 hover:bg-slate-50 transition-colors group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="group-hover:scale-110 transition-transform">
                    {getCategoryIcon(cat.name)}
                  </div>
                  <span className="truncate">{cat.name}</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
              </button>
            ))}

            <button
              onClick={() => {
                setSelectedCategoryId(null);
                setStoreView("categories");
              }}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold text-indigo-600 hover:bg-indigo-50 transition-colors pt-2 border-t border-slate-100"
            >
              <div className="flex items-center gap-2.5">
                <Grid className="w-4 h-4 text-indigo-600" />
                <span>More Categories</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-indigo-600" />
            </button>
          </div>
        </div>

        {/* Center Hero Promotional Slider */}
        <div
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          className="lg:col-span-6 relative rounded-2xl overflow-hidden bg-slate-950 text-white min-h-[340px] flex items-center shadow-xl group border border-slate-800"
        >
          {/* Media Background */}
          {currentAd.mediaType === "video" && currentAd.videoUrl ? (
            <video
              src={currentAd.videoUrl}
              autoPlay
              muted
              loop
              playsInline
              className="absolute inset-0 w-full h-full object-cover opacity-75"
            />
          ) : (
            <img
              src={currentAd.mediaUrl || "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=1200&q=80"}
              alt={currentAd.title}
              loading="lazy"
              className="absolute inset-0 w-full h-full object-cover opacity-75 transition-opacity duration-500"
            />
          )}

          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-950/70 to-transparent"></div>

          {/* Previous / Next Arrow Controls */}
          {activeSliderAds.length > 1 && (
            <>
              <button
                onClick={handlePrevBanner}
                className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-slate-900/70 hover:bg-slate-900 text-white flex items-center justify-center opacity-80 sm:opacity-0 sm:group-hover:opacity-100 transition-all shadow-md"
                title="Previous Slide"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={handleNextBanner}
                className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-slate-900/70 hover:bg-slate-900 text-white flex items-center justify-center opacity-80 sm:opacity-0 sm:group-hover:opacity-100 transition-all shadow-md"
                title="Next Slide"
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
                Exclusive Campaign
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight drop-shadow-md">
              {currentAd.title}
            </h1>

            <p className="text-xs text-slate-200 line-clamp-2 leading-relaxed">
              {currentAd.description}
            </p>

            {/* Coupon Code Strip */}
            {currentAd.couponCode && (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-900/80 border border-indigo-400/40 rounded-xl text-xs font-mono font-bold text-amber-300 shadow-sm">
                <span>Voucher Code: {currentAd.couponCode}</span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(currentAd.couponCode!);
                    setCopiedCoupon(true);
                    addToast(`Copied code "${currentAd.couponCode}"`, "success");
                    setTimeout(() => setCopiedCoupon(false), 2000);
                  }}
                  className="p-1 hover:bg-white/10 rounded-md text-white transition-colors"
                  title="Copy Code"
                >
                  {copiedCoupon ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            )}

            {/* CTA Buttons */}
            <div className="pt-2 flex flex-wrap items-center gap-2.5">
              <button
                onClick={() => {
                  trackAdClick(currentAd.id);
                  setStoreView("products");
                }}
                className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-md transition-all flex items-center gap-2"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>{currentAd.buttonText || "Shop Now"}</span>
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
                className="bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs font-bold px-4 py-2.5 rounded-xl transition-all flex items-center gap-1.5 backdrop-blur-xs"
              >
                <span>Learn More</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Carousel Dot Indicators */}
          {activeSliderAds.length > 1 && (
            <div className="absolute bottom-3 right-4 z-20 flex items-center gap-1.5 bg-slate-950/60 px-3 py-1.5 rounded-full border border-white/10">
              {activeSliderAds.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentBannerIndex(idx)}
                  className={`h-2 rounded-full transition-all ${
                    idx === currentBannerIndex ? "w-6 bg-amber-400" : "w-2 bg-white/40"
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Right Customer Member Benefits & Vouchers Card */}
        <div className="lg:col-span-3 bg-gradient-to-br from-indigo-600 via-indigo-700 to-slate-900 rounded-2xl p-5 text-white flex flex-col justify-between space-y-4 shadow-lg border border-indigo-500/30">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="w-9 h-9 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-black text-sm shadow-md">
                <Sparkles className="w-5 h-5 text-slate-950" />
              </span>
              <span className="px-2.5 py-0.5 bg-white/10 text-amber-300 font-extrabold text-[10px] uppercase rounded-full border border-white/20">
                Member Rewards
              </span>
            </div>
            <h3 className="font-black text-white text-sm leading-snug tracking-tight">
              Get ৳500 OFF On Your First Purchase!
            </h3>
            <p className="text-[11px] text-indigo-100 leading-relaxed">
              Unlock exclusive customer vouchers, daily mega flash deals, and enjoy express home delivery.
            </p>
          </div>

          <div className="space-y-2 pt-2">
            <button
              onClick={() => {
                addToast("Customer Voucher Code 'WELCOME500' Applied!", "success");
              }}
              className="w-full bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black py-2.5 px-4 rounded-xl shadow-md transition-colors flex items-center justify-center gap-1.5"
            >
              <Gift className="w-4 h-4 text-slate-950" />
              <span>Get Offer Vouchers</span>
            </button>
            <button
              onClick={() => setStoreView("user-profile")}
              className="w-full bg-white/10 hover:bg-white/20 text-white text-xs font-bold py-2 px-4 rounded-xl border border-white/20 transition-colors flex items-center justify-center gap-1"
            >
              <User className="w-3.5 h-3.5 text-amber-300" />
              <span>User Account</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Deals & Offers Section (Flash Sale Countdown + Products) */}
      <section className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs grid grid-cols-1 lg:grid-cols-12">
        {/* Left Timer Block */}
        <div className="lg:col-span-3 p-6 bg-slate-50 border-r border-slate-200 flex flex-col justify-between space-y-4">
          <div>
            <h2 className="text-lg font-black text-slate-900 tracking-tight">Deals and offers</h2>
            <p className="text-xs text-slate-500 font-medium">Limited time flash discounts</p>
          </div>

          {/* Countdown Boxes */}
          <div className="flex items-center gap-1.5">
            <div className="flex-1 bg-slate-900 text-white p-2 rounded-xl text-center">
              <span className="block font-black text-sm font-mono">{String(timeLeft.days).padStart(2, "0")}</span>
              <span className="text-[9px] text-slate-400 uppercase font-bold">Days</span>
            </div>
            <div className="flex-1 bg-slate-900 text-white p-2 rounded-xl text-center">
              <span className="block font-black text-sm font-mono">{String(timeLeft.hours).padStart(2, "0")}</span>
              <span className="text-[9px] text-slate-400 uppercase font-bold">Hour</span>
            </div>
            <div className="flex-1 bg-slate-900 text-white p-2 rounded-xl text-center">
              <span className="block font-black text-sm font-mono">{String(timeLeft.minutes).padStart(2, "0")}</span>
              <span className="text-[9px] text-slate-400 uppercase font-bold">Min</span>
            </div>
            <div className="flex-1 bg-slate-900 text-white p-2 rounded-xl text-center">
              <span className="block font-black text-sm font-mono">{String(timeLeft.seconds).padStart(2, "0")}</span>
              <span className="text-[9px] text-slate-400 uppercase font-bold">Sec</span>
            </div>
          </div>
        </div>

        {/* Right Product Items Row */}
        <div className="lg:col-span-9 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 divide-x divide-y lg:divide-y-0 divide-slate-100">
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
                className="p-4 flex flex-col items-center text-center space-y-3 hover:bg-slate-50/80 transition-colors cursor-pointer group"
              >
                <div className="w-28 h-28 p-2 overflow-hidden flex items-center justify-center">
                  <img
                    src={p.mainImage}
                    alt={p.name}
                    className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform"
                  />
                </div>
                <div className="space-y-1 w-full">
                  <h4 className="text-xs font-bold text-slate-800 truncate group-hover:text-indigo-600 transition-colors">
                    {p.name}
                  </h4>
                  <span className="inline-block bg-rose-100 text-rose-700 text-[11px] font-black px-2.5 py-0.5 rounded-full">
                    -{discountPercent}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. Category Product Section 1: Home and outdoor products */}
      <section className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs grid grid-cols-1 lg:grid-cols-12">
        {/* Left Category Banner Card */}
        <div className="lg:col-span-3 relative bg-amber-900 text-white p-6 flex flex-col justify-between min-h-[280px]">
          <img
            src="https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&q=80"
            alt="Home & Outdoor"
            className="absolute inset-0 w-full h-full object-cover opacity-40 mix-blend-overlay"
          />
          <div className="relative space-y-2 z-10">
            <h3 className="text-xl font-black leading-tight">Home and outdoor products</h3>
            <p className="text-xs text-amber-100">Quality furniture, decor & appliances</p>
          </div>

          <div className="relative z-10 pt-4">
            <button
              onClick={() => {
                setStoreView("products");
              }}
              className="bg-white text-slate-900 hover:bg-slate-100 font-bold text-xs px-4 py-2 rounded-xl shadow-md transition-colors inline-flex items-center gap-1.5"
            >
              <span>Explore all</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Right 4x2 Grid (8 Products) */}
        <div className="lg:col-span-9 grid grid-cols-2 sm:grid-cols-4 divide-x divide-y divide-slate-100">
          {homeAndOutdoorProducts.map((p, idx) => (
            <div
              key={`home-${p.id}-${idx}`}
              onClick={() => {
                setSelectedProduct(p);
                setStoreView("product-detail");
              }}
              className="p-4 flex flex-col justify-between hover:bg-slate-50 transition-colors cursor-pointer group space-y-2"
            >
              <div>
                <h4 className="text-xs font-bold text-slate-800 line-clamp-1 group-hover:text-indigo-600 transition-colors">
                  {p.name}
                </h4>
                <p className="text-[11px] text-slate-400 font-medium">
                  From {settings.currencySymbol}
                  {(p.discountPrice || p.sellingPrice).toLocaleString()}
                </p>
              </div>
              <div className="h-24 flex items-center justify-center p-1">
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

      {/* 4. Category Product Section 2: Consumer Electronics and Gadgets */}
      <section className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs grid grid-cols-1 lg:grid-cols-12">
        {/* Left Category Banner Card */}
        <div className="lg:col-span-3 relative bg-indigo-950 text-white p-6 flex flex-col justify-between min-h-[280px]">
          <img
            src="https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&q=80"
            alt="Consumer Electronics"
            className="absolute inset-0 w-full h-full object-cover opacity-40 mix-blend-overlay"
          />
          <div className="relative space-y-2 z-10">
            <h3 className="text-xl font-black leading-tight">Consumer electronics and gadgets</h3>
            <p className="text-xs text-indigo-200">Smartwatches, headphones & accessories</p>
          </div>

          <div className="relative z-10 pt-4">
            <button
              onClick={() => {
                setStoreView("products");
              }}
              className="bg-white text-slate-900 hover:bg-slate-100 font-bold text-xs px-4 py-2 rounded-xl shadow-md transition-colors inline-flex items-center gap-1.5"
            >
              <span>Explore all</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Right 4x2 Grid (8 Products) */}
        <div className="lg:col-span-9 grid grid-cols-2 sm:grid-cols-4 divide-x divide-y divide-slate-100">
          {electronicsProducts.map((p, idx) => (
            <div
              key={`elec-${p.id}-${idx}`}
              onClick={() => {
                setSelectedProduct(p);
                setStoreView("product-detail");
              }}
              className="p-4 flex flex-col justify-between hover:bg-slate-50 transition-colors cursor-pointer group space-y-2"
            >
              <div>
                <h4 className="text-xs font-bold text-slate-800 line-clamp-1 group-hover:text-indigo-600 transition-colors">
                  {p.name}
                </h4>
                <p className="text-[11px] text-slate-400 font-medium">
                  From {settings.currencySymbol}
                  {(p.discountPrice || p.sellingPrice).toLocaleString()}
                </p>
              </div>
              <div className="h-24 flex items-center justify-center p-1">
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

      {/* 5. Flash Sale & Trending Megadeals Section */}
      <section className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-rose-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 shadow-xl border border-indigo-900/50">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-white/10">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 bg-amber-400 text-slate-950 font-black text-[10px] uppercase rounded-full tracking-wider animate-pulse">
                ⚡ Flash Sale
              </span>
              <span className="text-xs text-rose-300 font-bold uppercase tracking-widest">Ending Soon</span>
            </div>
            <h2 className="text-2xl font-black tracking-tight text-white">Trending Deals & Super Savings</h2>
            <p className="text-xs text-slate-300">Limited time discounts up to 45% off on top-rated flagship items</p>
          </div>

          <button
            onClick={() => setStoreView("products")}
            className="px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-xs rounded-2xl shadow-lg transition-all flex items-center gap-1.5 self-start sm:self-auto"
          >
            <span>Shop All Deals</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {products.slice(0, 4).map((p) => {
            const displayPrice = p.discountPrice || p.sellingPrice;
            const hasDiscount = p.discountPrice && p.discountPrice < p.sellingPrice;
            return (
              <div
                key={`flash-${p.id}`}
                onClick={() => {
                  setSelectedProduct(p);
                  setStoreView("product-detail");
                }}
                className="bg-white/10 backdrop-blur-md border border-white/15 p-4 rounded-2xl hover:bg-white/20 transition-all cursor-pointer group space-y-3"
              >
                <div className="relative aspect-square rounded-xl bg-white/5 p-2 overflow-hidden flex items-center justify-center">
                  {hasDiscount && (
                    <span className="absolute top-2 left-2 z-10 bg-rose-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                      FLASH DEAL
                    </span>
                  )}
                  <img
                    src={p.mainImage}
                    alt={p.name}
                    className="w-full h-full object-contain group-hover:scale-105 transition-transform"
                  />
                </div>

                <div className="space-y-1">
                  <h3 className="font-extrabold text-xs text-white line-clamp-1 group-hover:text-amber-300 transition-colors">
                    {p.name}
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-black text-amber-300 font-mono">
                      {settings.currencySymbol}{displayPrice.toLocaleString()}
                    </span>
                    {hasDiscount && (
                      <span className="text-xs text-slate-400 line-through font-mono">
                        {settings.currencySymbol}{p.sellingPrice.toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 6. Recommended Items Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Recommended items</h2>
            <p className="text-xs text-slate-500">Selected based on popular customer searches</p>
          </div>
          <button
            onClick={() => setStoreView("products")}
            className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
          >
            <span>View All</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 min-[380px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-3 sm:gap-4">
          {recommendedProducts.map((product, idx) => (
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
      </section>
    </div>
  );
};

// Reusable Product Card Component
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

  return (
    <div className="group bg-white rounded-2xl border border-slate-200 overflow-hidden hover:border-indigo-400 hover:shadow-xl transition-all duration-300 flex flex-col justify-between">
      <div className="relative bg-slate-50 p-4 aspect-square overflow-hidden flex items-center justify-center">
        {/* Badges Column */}
        <div className="absolute top-3 left-3 z-10 flex flex-col gap-1 items-start">
          {hasDiscount && (
            <span className="bg-rose-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-xs">
              OFFER
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
            Out of Stock
          </span>
        ) : product.isLowStock ? (
          <span className="absolute top-3 right-3 z-10 bg-amber-500 text-slate-900 text-[10px] font-black px-2 py-0.5 rounded-full shadow-xs">
            Only {product.totalStock} Left
          </span>
        ) : null}

        <img
          src={product.mainImage}
          alt={product.name}
          className={`w-full h-full object-contain group-hover:scale-105 transition-transform duration-300 cursor-pointer ${
            isOutOfStock ? "opacity-50 grayscale" : ""
          }`}
          onClick={() => onSelectProduct(product)}
        />

        {/* Quick Action Overlay Buttons */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button
            onClick={() => onToggleWishlist(product)}
            className={`p-2 rounded-full shadow-md backdrop-blur-md transition-colors ${
              isWishlisted ? "bg-rose-600 text-white" : "bg-white/90 text-slate-700 hover:bg-white"
            }`}
            title="Wishlist"
          >
            <Heart className="w-4 h-4 fill-current" />
          </button>
          <button
            onClick={() => onToggleCompare(product)}
            className={`p-2 rounded-full shadow-md backdrop-blur-md transition-colors ${
              isCompared ? "bg-indigo-600 text-white" : "bg-white/90 text-slate-700 hover:bg-white"
            }`}
            title="Compare"
          >
            <GitCompare className="w-4 h-4" />
          </button>
          {onQuickView && (
            <button
              onClick={() => onQuickView(product)}
              className="p-2 rounded-full shadow-md bg-white/90 text-slate-700 hover:bg-white transition-colors"
              title="Quick View Modal"
            >
              <Eye className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[11px] text-slate-500">
            <span className="font-bold text-slate-900 font-mono text-sm">
              {currencySymbol}{displayPrice.toLocaleString()}
              {hasDiscount && (
                <span className="text-xs text-slate-400 line-through font-normal ml-1.5 font-mono">
                  {currencySymbol}{product.sellingPrice.toLocaleString()}
                </span>
              )}
            </span>
          </div>

          <div className="flex items-center gap-1 text-amber-500 text-[11px] font-bold">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-3 h-3 ${
                    i < Math.floor(product.rating)
                      ? "fill-amber-400 text-amber-400"
                      : "fill-slate-200 text-slate-200"
                  }`}
                />
              ))}
            </div>
            <span className="text-slate-600 font-medium">({product.reviewsCount})</span>
          </div>

          <h3
            onClick={() => onSelectProduct(product)}
            className="font-semibold text-slate-800 text-xs line-clamp-2 hover:text-indigo-600 transition-colors cursor-pointer leading-snug"
          >
            {product.name}
          </h3>
        </div>

        <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
          <span className="text-[10px] text-slate-400 font-medium truncate">
            {product.brandName}
          </span>

          {isOutOfStock ? (
            <button
              disabled
              className="bg-slate-100 text-slate-400 font-bold text-[11px] px-3 py-1.5 rounded-lg cursor-not-allowed"
            >
              Out of Stock
            </button>
          ) : (
            <button
              onClick={() => onAddToCart(product)}
              className="bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-bold text-[11px] px-3 py-1.5 rounded-lg flex items-center gap-1 shadow-xs transition-all"
            >
              <ShoppingBag className="w-3 h-3" />
              <span>Add to Cart</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
