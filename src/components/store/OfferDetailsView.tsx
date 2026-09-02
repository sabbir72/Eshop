import React, { useState, useEffect } from "react";
import { useStore } from "../../context/StoreContext";
import { Product } from "../../types";
import {
  ArrowLeft,
  Sparkles,
  Copy,
  Check,
  Clock,
  ShieldAlert,
  ShoppingBag,
  Flame,
  Tag,
  ExternalLink,
  ChevronRight,
  Gift,
} from "lucide-react";

export const OfferDetailsView: React.FC = () => {
  const {
    selectedOffer,
    setStoreView,
    products,
    addToCart,
    setSelectedProduct,
    addToast,
    appliedCoupon,
    applyCoupon,
  } = useStore();

  const [copied, setCopied] = useState(false);

  // Live countdown timer calculation
  const [timeLeft, setTimeLeft] = useState({ days: 3, hours: 14, minutes: 22, seconds: 45 });

  useEffect(() => {
    if (selectedOffer?.countdownEnd) {
      const targetTime = new Date(selectedOffer.countdownEnd).getTime();
      const interval = setInterval(() => {
        const now = new Date().getTime();
        const diff = targetTime - now;
        if (diff <= 0) {
          clearInterval(interval);
          setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        } else {
          const days = Math.floor(diff / (1000 * 60 * 60 * 24));
          const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((diff % (1000 * 60)) / 1000);
          setTimeLeft({ days, hours, minutes, seconds });
        }
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [selectedOffer]);

  if (!selectedOffer) {
    return (
      <div className="max-w-4xl mx-auto py-16 text-center space-y-4">
        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
          <Gift className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-800">No Campaign Selected</h2>
        <p className="text-xs text-slate-500">Please select an active promotional campaign from the storefront slider or popups.</p>
        <button
          onClick={() => setStoreView("home")}
          className="px-5 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl shadow-md"
        >
          Return to Homepage
        </button>
      </div>
    );
  }

  const handleCopyCoupon = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    addToast(`Coupon "${code}" copied to clipboard!`, "success");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleApplyToCart = (code: string) => {
    const res = applyCoupon(code);
    if (res.success) {
      addToast(`Coupon "${code}" applied to your active shopping cart!`, "success");
    } else {
      addToast(res.message, "warning");
    }
  };

  // Filter eligible products (e.g., if specific IDs are set or default to featured discount products)
  const eligibleProducts = selectedOffer.eligibleProductIds?.length
    ? products.filter((p) => selectedOffer.eligibleProductIds?.includes(p.id))
    : products.filter((p) => p.discountPrice > 0).slice(0, 8);

  const relatedProducts = products.slice(0, 4);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-8 text-left">
      {/* Top Back Navigation Breadcrumb */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setStoreView("home")}
          className="flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-indigo-600 transition-colors bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-2xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Homepage</span>
        </button>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-amber-100 text-amber-800 text-[11px] font-extrabold uppercase rounded-full border border-amber-200">
            Official Campaign
          </span>
        </div>
      </div>

      {/* Hero Media Banner */}
      <div className="bg-slate-950 rounded-3xl overflow-hidden shadow-xl border border-slate-800 relative grid grid-cols-1 lg:grid-cols-12 gap-0 text-white">
        <div className="lg:col-span-7 relative h-72 lg:h-auto min-h-[320px]">
          {selectedOffer.mediaType === "video" && selectedOffer.videoUrl ? (
            <video
              src={selectedOffer.videoUrl}
              autoPlay
              muted
              loop
              playsInline
              className="w-full h-full object-cover"
            />
          ) : (
            <img
              src={selectedOffer.mediaUrl || "https://images.unsplash.com/photo-1512499617640-c74ae3a79d37?w=1200&q=80"}
              alt={selectedOffer.title}
              className="w-full h-full object-cover opacity-85"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent lg:bg-gradient-to-r lg:from-transparent lg:to-slate-950"></div>
        </div>

        {/* Campaign Info Card */}
        <div className="lg:col-span-5 p-6 sm:p-8 flex flex-col justify-between space-y-6">
          <div className="space-y-3">
            {selectedOffer.offerBadge && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-400 text-slate-950 font-black text-[10px] uppercase tracking-wider rounded-full shadow-md">
                <Flame className="w-3.5 h-3.5 text-rose-600" />
                {selectedOffer.offerBadge}
              </span>
            )}
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight">
              {selectedOffer.title}
            </h1>
            <p className="text-xs text-slate-300 leading-relaxed">
              {selectedOffer.description}
            </p>
          </div>

          {/* Countdown Timer */}
          <div className="p-4 bg-slate-900/90 rounded-2xl border border-slate-800 space-y-2">
            <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              <span>Offer Expiry Countdown</span>
            </span>
            <div className="grid grid-cols-4 gap-2 text-center">
              <div className="bg-slate-800 p-2 rounded-xl border border-slate-700/60">
                <span className="block font-black text-lg text-amber-400">{timeLeft.days}</span>
                <span className="text-[9px] text-slate-400 uppercase font-bold">Days</span>
              </div>
              <div className="bg-slate-800 p-2 rounded-xl border border-slate-700/60">
                <span className="block font-black text-lg text-white">{timeLeft.hours}</span>
                <span className="text-[9px] text-slate-400 uppercase font-bold">Hours</span>
              </div>
              <div className="bg-slate-800 p-2 rounded-xl border border-slate-700/60">
                <span className="block font-black text-lg text-white">{timeLeft.minutes}</span>
                <span className="text-[9px] text-slate-400 uppercase font-bold">Mins</span>
              </div>
              <div className="bg-slate-800 p-2 rounded-xl border border-slate-700/60">
                <span className="block font-black text-lg text-white">{timeLeft.seconds}</span>
                <span className="text-[9px] text-slate-400 uppercase font-bold">Secs</span>
              </div>
            </div>
          </div>

          {/* Coupon Code Action */}
          {selectedOffer.couponCode && (
            <div className="bg-gradient-to-r from-indigo-900/80 to-purple-900/80 p-4 rounded-2xl border border-indigo-500/30 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-indigo-300 block">Promo Code</span>
                <span className="font-black text-base text-white tracking-widest">{selectedOffer.couponCode}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCopyCoupon(selectedOffer.couponCode!)}
                  className="px-3 py-1.5 bg-white text-slate-900 hover:bg-slate-100 font-bold text-xs rounded-xl flex items-center gap-1 transition-colors shadow-sm"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? "Copied" : "Copy"}</span>
                </button>
                <button
                  onClick={() => handleApplyToCart(selectedOffer.couponCode!)}
                  className="px-3 py-1.5 bg-amber-400 hover:bg-amber-500 text-slate-950 font-extrabold text-xs rounded-xl flex items-center gap-1 transition-colors shadow-md"
                >
                  <Tag className="w-3.5 h-3.5" />
                  <span>Apply</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Terms & Conditions Section */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-3">
        <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-indigo-600" />
          <span>Terms & Conditions</span>
        </h3>
        <p className="text-xs text-slate-600 leading-relaxed">
          {selectedOffer.termsConditions ||
            "This offer is valid during the stated campaign period for orders placed through our website. Offers cannot be exchanged for cash or combined with other stackable promotional discounts unless explicitly stated."}
        </p>
      </div>

      {/* Eligible Products Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-indigo-600" />
              <span>Eligible Campaign Products</span>
            </h2>
            <p className="text-xs text-slate-500">Products eligible for this promotional discount</p>
          </div>
          <button
            onClick={() => setStoreView("products")}
            className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
          >
            <span>View All Products</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {eligibleProducts.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-2xl border border-slate-200 p-3 shadow-xs hover:shadow-md transition-all space-y-3 group"
            >
              <div
                onClick={() => {
                  setSelectedProduct(product);
                  setStoreView("product-detail");
                }}
                className="relative h-40 rounded-xl overflow-hidden bg-slate-100 cursor-pointer"
              >
                <img
                  src={product.mainImage || "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600&q=80"}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {product.discountPrice > 0 && (
                  <span className="absolute top-2 left-2 bg-rose-600 text-white font-black text-[10px] px-2 py-0.5 rounded-md shadow-xs">
                    SAVE ৳{(product.sellingPrice - product.discountPrice).toLocaleString()}
                  </span>
                )}
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">{product.categoryName}</span>
                <h4
                  onClick={() => {
                    setSelectedProduct(product);
                    setStoreView("product-detail");
                  }}
                  className="font-bold text-xs text-slate-900 truncate cursor-pointer hover:text-indigo-600"
                >
                  {product.name}
                </h4>
                <div className="flex items-baseline gap-2 pt-1">
                  <span className="font-extrabold text-sm text-slate-900">
                    ৳{(product.discountPrice || product.sellingPrice).toLocaleString()}
                  </span>
                  {product.discountPrice > 0 && (
                    <span className="text-xs text-slate-400 line-through">
                      ৳{product.sellingPrice.toLocaleString()}
                    </span>
                  )}
                </div>
              </div>

              <button
                onClick={() => {
                  addToCart(product);
                  addToast(`Added "${product.name}" to cart`, "success");
                }}
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Add to Cart</span>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
