import React, { useState, useEffect, useRef } from "react";
import { Product } from "../../types";
import {
  ChevronLeft,
  ChevronRight,
  ShoppingBag,
  Heart,
  Eye,
  Star,
  Sparkles,
  Zap,
  Rotate3d,
  Check,
  Flame,
} from "lucide-react";

interface ThreeDProductCarouselProps {
  products: Product[];
  onSelectProduct: (p: Product) => void;
  onAddToCart: (p: Product) => void;
  wishlist: Product[];
  onToggleWishlist: (p: Product) => void;
  onQuickView?: (p: Product) => void;
  currencySymbol: string;
  onOpen3DStage?: (p: Product) => void;
}

export const ThreeDProductCarousel: React.FC<ThreeDProductCarouselProps> = ({
  products,
  onSelectProduct,
  onAddToCart,
  wishlist,
  onToggleWishlist,
  onQuickView,
  currencySymbol,
  onOpen3DStage,
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);
  const [addedId, setAddedId] = useState<string | null>(null);
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null);

  const productList = products || [];
  const displayList = productList.slice(0, 10);
  const total = displayList.length;

  useEffect(() => {
    if (!isAutoPlay || total <= 1) return;
    autoPlayRef.current = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % total);
    }, 4500);

    return () => {
      if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    };
  }, [isAutoPlay, total]);

  const handlePrev = () => {
    if (total <= 0) return;
    setActiveIndex((prev) => (prev - 1 + total) % total);
  };

  const handleNext = () => {
    if (total <= 0) return;
    setActiveIndex((prev) => (prev + 1) % total);
  };

  if (total === 0) return null;
  const activeProduct = displayList[activeIndex] || displayList[0];
  if (!activeProduct) return null;

  const displayPrice = activeProduct.discountPrice ?? activeProduct.sellingPrice;
  const hasDiscount =
    activeProduct.discountPrice !== undefined &&
    activeProduct.discountPrice > 0 &&
    activeProduct.discountPrice < activeProduct.sellingPrice;
  const discountPercent = hasDiscount
    ? Math.round(
        ((activeProduct.sellingPrice - activeProduct.discountPrice!) / activeProduct.sellingPrice) *
          100
      )
    : 0;

  const handleAddToCart = (p: Product) => {
    onAddToCart(p);
    setAddedId(p.id);
    setTimeout(() => setAddedId(null), 1500);
  };

  return (
    <div
      className="relative w-full overflow-hidden py-10 px-4 sm:px-8 bg-gradient-to-b from-slate-950 via-slate-900 to-indigo-950 rounded-3xl text-white shadow-2xl border border-indigo-500/20"
      onMouseEnter={() => setIsAutoPlay(false)}
      onMouseLeave={() => setIsAutoPlay(true)}
    >
      {/* Ambient background particles & grid */}
      <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(#6366f1_1px,transparent_1px)] [background-size:24px_24px]" />
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

      {/* Header with Title and Mode Badges */}
      <div className="relative z-20 flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-black tracking-wide uppercase mb-1.5">
            <Rotate3d className="w-3.5 h-3.5 animate-spin text-cyan-400" style={{ animationDuration: "10s" }} />
            <span>৩ডি সাইবার অরবিট স্টেজ</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
            <span>ফ্ল্যাগশিপ ৩ডি পণ্য প্রদক্ষিণ</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30 font-bold">
              সরাসরি দেখুন ও কিনুন
            </span>
          </h2>
        </div>

        {/* Carousel Controls */}
        <div className="flex items-center gap-2 bg-slate-900/80 backdrop-blur-md p-1.5 rounded-2xl border border-slate-700/60">
          <button
            onClick={handlePrev}
            className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-indigo-600 text-white flex items-center justify-center transition cursor-pointer shadow-sm active:scale-95"
            title="পূর্ববর্তী পণ্য"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <span className="text-xs font-mono px-3 text-slate-300 font-bold">
            {activeIndex + 1} / {total}
          </span>

          <button
            onClick={handleNext}
            className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-indigo-600 text-white flex items-center justify-center transition cursor-pointer shadow-sm active:scale-95"
            title="পরবর্তী পণ্য"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* 3D Arc Viewport */}
      <div
        className="relative w-full h-[380px] sm:h-[420px] flex items-center justify-center"
        style={{ perspective: "1100px" }}
      >
        {displayList.map((product, idx) => {
          // Calculate relative offset from activeIndex
          let offset = idx - activeIndex;
          if (offset < -Math.floor(total / 2)) offset += total;
          if (offset > Math.floor(total / 2)) offset -= total;

          const isCenter = offset === 0;
          const isVisible = Math.abs(offset) <= 2;

          if (!isVisible) return null;

          // Spatial 3D transform attributes based on distance from center
          const translateX = offset * 210;
          const translateZ = -Math.abs(offset) * 160;
          const rotateY = offset * -28;
          const scale = isCenter ? 1 : 0.82 - Math.abs(offset) * 0.08;
          const opacity = isCenter ? 1 : Math.max(0.25, 0.7 - Math.abs(offset) * 0.25);
          const zIndex = 20 - Math.abs(offset);

          return (
            <div
              key={product.id}
              onClick={() => {
                if (!isCenter) {
                  setActiveIndex(idx);
                }
              }}
              style={{
                transform: `translateX(${translateX}px) translateZ(${translateZ}px) rotateY(${rotateY}deg) scale(${scale})`,
                opacity,
                zIndex,
                transition: "all 0.6s cubic-bezier(0.16, 1, 0.3, 1)",
                cursor: isCenter ? "default" : "pointer",
              }}
              className="absolute w-[260px] sm:w-[290px] rounded-3xl bg-slate-900/90 border border-indigo-500/30 backdrop-blur-xl shadow-2xl p-4 flex flex-col justify-between overflow-hidden"
            >
              {/* Top product badges */}
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-black text-cyan-400 bg-cyan-950/60 border border-cyan-500/30 px-2 py-0.5 rounded-full uppercase tracking-wider">
                  {product.brandName}
                </span>

                <div className="flex items-center gap-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleWishlist(product);
                    }}
                    className={`w-7 h-7 rounded-full flex items-center justify-center transition cursor-pointer ${
                      wishlist.some((w) => w.id === product.id)
                        ? "bg-rose-600 text-white"
                        : "bg-slate-800/80 text-slate-300 hover:text-white"
                    }`}
                  >
                    <Heart className="w-3.5 h-3.5" />
                  </button>

                  {onQuickView && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onQuickView(product);
                      }}
                      className="w-7 h-7 rounded-full bg-slate-800/80 text-slate-300 hover:text-white flex items-center justify-center transition cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Product Image Stage */}
              <div className="relative w-full aspect-square bg-gradient-to-b from-indigo-950/30 to-slate-950/80 rounded-2xl p-4 flex items-center justify-center group overflow-hidden border border-indigo-500/10">
                {/* 3D Glow behind center product */}
                {isCenter && (
                  <div className="absolute inset-0 bg-indigo-500/15 rounded-full blur-2xl animate-pulse" />
                )}

                <img
                  src={product.mainImage}
                  alt={product.name}
                  className="max-w-full max-h-full object-contain filter drop-shadow-2xl transition-transform duration-500 group-hover:scale-110"
                />

                {isCenter && (
                  <div className="absolute bottom-2 inset-x-2 flex justify-center">
                    <span className="bg-slate-950/80 text-[10px] text-cyan-300 px-2.5 py-0.5 rounded-full border border-cyan-400/30 font-bold backdrop-blur-md">
                      ✨ ফোকাস ৩ডি অবজেক্ট
                    </span>
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="mt-3 space-y-1.5">
                <h4
                  onClick={() => onSelectProduct(product)}
                  className="text-sm font-bold text-white truncate cursor-pointer hover:text-cyan-400 transition"
                  title={product.name}
                >
                  {product.name}
                </h4>

                <div className="flex items-center justify-between">
                  <div className="text-base font-black text-cyan-300 font-mono">
                    {currencySymbol}
                    {(product.discountPrice ?? product.sellingPrice).toLocaleString()}
                  </div>

                  <div className="flex items-center gap-1 text-[11px] text-amber-400 font-bold">
                    <Star className="w-3 h-3 fill-amber-400" />
                    <span>{(product.rating || 4.8).toFixed(1)}</span>
                  </div>
                </div>

                {/* Direct Action Buttons for Center Card */}
                {isCenter ? (
                  <div className="pt-2 flex items-center gap-2">
                    <button
                      onClick={() => handleAddToCart(product)}
                      className={`flex-1 py-2 px-3 rounded-xl font-black text-xs transition cursor-pointer flex items-center justify-center gap-1.5 shadow-lg ${
                        addedId === product.id
                          ? "bg-emerald-600 text-white"
                          : "bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white shadow-indigo-500/30"
                      }`}
                    >
                      {addedId === product.id ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>যুক্ত হয়েছে!</span>
                        </>
                      ) : (
                        <>
                          <ShoppingBag className="w-3.5 h-3.5" />
                          <span>কার্টে নিন</span>
                        </>
                      )}
                    </button>

                    {onOpen3DStage && (
                      <button
                        onClick={() => onOpen3DStage(product)}
                        className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/30 transition cursor-pointer"
                        title="পূর্ণাঙ্গ ৩ডি হলোগ্রাফিক স্টেজে দেখুন"
                      >
                        <Sparkles className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="pt-1 text-center">
                    <span className="text-[11px] text-indigo-400 font-bold hover:underline">
                      ক্লিক করে সামনে আনুন
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Pagination Dots */}
      <div className="relative z-20 flex items-center justify-center gap-1.5 mt-4">
        {displayList.map((_, i) => (
          <button
            key={i}
            onClick={() => setActiveIndex(i)}
            className={`transition-all rounded-full cursor-pointer ${
              i === activeIndex
                ? "w-7 h-2 bg-gradient-to-r from-cyan-400 to-indigo-500"
                : "w-2 h-2 bg-slate-700 hover:bg-slate-500"
            }`}
          />
        ))}
      </div>
    </div>
  );
};
