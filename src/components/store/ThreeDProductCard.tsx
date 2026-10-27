import React, { useState, useRef } from "react";
import { Product } from "../../types";
import {
  ShoppingBag,
  Heart,
  GitCompare,
  Star,
  Eye,
  Sparkles,
  Rotate3d,
  Zap,
  Check,
} from "lucide-react";

interface ThreeDProductCardProps {
  product: Product;
  onSelectProduct: (p: Product) => void;
  onAddToCart: (p: Product) => void;
  isWishlisted: boolean;
  onToggleWishlist: (p: Product) => void;
  isCompared: boolean;
  onToggleCompare: (p: Product) => void;
  onQuickView?: (p: Product) => void;
  currencySymbol: string;
  onOpen3DStage?: (p: Product) => void;
}

export const ThreeDProductCard: React.FC<ThreeDProductCardProps> = ({
  product,
  onSelectProduct,
  onAddToCart,
  isWishlisted,
  onToggleWishlist,
  isCompared,
  onToggleCompare,
  onQuickView,
  currencySymbol,
  onOpen3DStage,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [glintPos, setGlintPos] = useState({ x: 50, y: 50 });
  const [isHovered, setIsHovered] = useState(false);
  const [isAdded, setIsAdded] = useState(false);

  if (!product) return null;

  const displayPrice = product.discountPrice ?? product.sellingPrice ?? 0;
  const isOutOfStock = (product.totalStock ?? 0) <= 0;
  const hasDiscount =
    product.discountPrice !== undefined &&
    product.discountPrice > 0 &&
    product.discountPrice < (product.sellingPrice || 0);
  const discountPercent = hasDiscount && product.sellingPrice
    ? Math.round(((product.sellingPrice - product.discountPrice!) / product.sellingPrice) * 100)
    : 0;

  // 3D Tilt calculation on mouse move
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    // Calculate rotation (-14 deg to +14 deg)
    const rotX = ((y - centerY) / centerY) * -12;
    const rotY = ((x - centerX) / centerX) * 12;

    setRotateX(rotX);
    setRotateY(rotY);

    // Glint percentage position
    setGlintPos({
      x: (x / rect.width) * 100,
      y: (y / rect.height) * 100,
    });
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setRotateX(0);
    setRotateY(0);
  };

  const handleAddToCartClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddToCart(product);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1400);
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        perspective: "1200px",
      }}
      className="relative select-none group min-w-0 w-full h-full flex flex-col"
    >
      {/* Outer 3D Canvas Box */}
      <div
        style={{
          transform: isHovered
            ? `rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(10px) scale3d(1.025, 1.025, 1.025)`
            : "rotateX(0deg) rotateY(0deg) translateZ(0px) scale3d(1, 1, 1)",
          transition: isHovered ? "transform 0.08s ease-out" : "transform 0.5s ease-out",
          transformStyle: "preserve-3d",
        }}
        className={`relative flex flex-col justify-between h-full bg-white dark:bg-slate-900 rounded-3xl border transition-shadow duration-300 overflow-hidden ${
          isHovered
            ? "border-indigo-400 shadow-2xl shadow-indigo-500/20"
            : "border-slate-200/90 shadow-md"
        }`}
      >
        {/* Holographic Specular Glint Layer */}
        <div
          className="absolute inset-0 pointer-events-none rounded-3xl z-30 transition-opacity duration-300"
          style={{
            opacity: isHovered ? 0.65 : 0,
            background: `radial-gradient(circle at ${glintPos.x}% ${glintPos.y}%, rgba(255,255,255,0.7) 0%, rgba(129, 140, 248, 0.25) 35%, rgba(236, 72, 153, 0.15) 55%, transparent 75%)`,
          }}
        />

        {/* Dynamic 3D Neon Edge Highlight */}
        <div
          className="absolute -inset-0.5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10 blur-sm pointer-events-none"
          style={{
            background: `linear-gradient(${rotateY * 15 + 45}deg, #6366f1, #ec4899, #38bdf8)`,
          }}
        />

        {/* 3D Depth Card Header & Image Stage */}
        <div
          className="relative w-full aspect-square bg-gradient-to-b from-slate-50 via-slate-100/70 to-slate-200/40 overflow-hidden flex items-center justify-center p-4 cursor-pointer"
          style={{ transformStyle: "preserve-3d" }}
          onClick={() => onSelectProduct(product)}
        >
          {/* Subtle 3D Grid Stage Floor */}
          <div
            className="absolute bottom-0 inset-x-0 h-28 opacity-30 pointer-events-none"
            style={{
              backgroundImage:
                "linear-gradient(0deg, rgba(99,102,241,0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.2) 1px, transparent 1px)",
              backgroundSize: "16px 16px",
              transform: "rotateX(60deg) translateY(20px)",
              transformOrigin: "bottom center",
            }}
          />

          {/* Floating Product Image with Depth */}
          <div
            style={{
              transform: isHovered
                ? `translateZ(45px) scale(1.08) translateY(-4px)`
                : "translateZ(0px) scale(1) translateY(0px)",
              transition: isHovered ? "transform 0.15s ease-out" : "transform 0.4s ease-out",
            }}
            className="relative z-10 w-full h-full flex items-center justify-center"
          >
            <img
              src={product.mainImage}
              alt={product.name}
              className={`max-w-full max-h-full object-contain filter drop-shadow-xl transition-all duration-300 ${
                isOutOfStock ? "opacity-50 grayscale" : ""
              }`}
            />

            {/* Simulated 3D Ground Shadow under product */}
            <div
              className="absolute -bottom-2 w-3/4 h-4 bg-slate-900/15 rounded-full blur-md transition-all duration-300 pointer-events-none"
              style={{
                transform: isHovered ? "scale(0.85) opacity(0.2)" : "scale(1) opacity(0.4)",
              }}
            />
          </div>

          {/* 3D Popping Floating Badges (Top Left) */}
          <div
            style={{
              transform: isHovered ? "translateZ(55px)" : "translateZ(0px)",
              transition: "transform 0.2s ease-out",
            }}
            className="absolute top-3 left-3 z-20 flex flex-col gap-1.5 items-start pointer-events-none"
          >
            {/* 3D Tech badge */}
            <span className="bg-slate-950/85 backdrop-blur-md text-cyan-400 border border-cyan-400/30 text-[10px] font-black px-2 py-0.5 rounded-full shadow-lg flex items-center gap-1">
              <Rotate3d className="w-3 h-3 text-cyan-400 animate-spin" style={{ animationDuration: "8s" }} />
              <span>3D স্পেশাল</span>
            </span>

            {hasDiscount && (
              <span className="bg-gradient-to-r from-rose-600 to-rose-500 text-white text-[11px] font-black px-2 py-0.5 rounded-full shadow-md">
                -{discountPercent}% OFF
              </span>
            )}
          </div>

          {/* 3D Action Floating Buttons (Top Right) */}
          <div
            style={{
              transform: isHovered ? "translateZ(60px)" : "translateZ(0px)",
              transition: "transform 0.2s ease-out",
            }}
            className="absolute top-3 right-3 z-20 flex flex-col gap-1.5"
          >
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleWishlist(product);
              }}
              className={`w-8 h-8 rounded-full shadow-md backdrop-blur-md flex items-center justify-center transition-all active:scale-90 cursor-pointer ${
                isWishlisted
                  ? "bg-rose-600 text-white"
                  : "bg-white/90 text-slate-700 hover:bg-white hover:text-rose-600"
              }`}
              title="উইশলিস্টে রাখুন"
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
                  : "bg-white/90 text-slate-700 hover:bg-white hover:text-indigo-600"
              }`}
              title="তুলনা করুন"
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
                className="w-8 h-8 rounded-full shadow-md bg-white/90 text-slate-700 hover:bg-white hover:text-indigo-600 backdrop-blur-md flex items-center justify-center transition-all active:scale-90 cursor-pointer"
                title="কুইক ভিউ"
              >
                <Eye className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Bottom 360° Inspect Pill */}
          {onOpen3DStage && (
            <div
              style={{
                transform: isHovered ? "translateZ(45px) translateY(0)" : "translateZ(0px) translateY(8px)",
                opacity: isHovered ? 1 : 0.8,
                transition: "all 0.25s ease-out",
              }}
              className="absolute bottom-2 inset-x-2 z-20 flex justify-center"
            >
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onOpen3DStage(product);
                }}
                className="px-3 py-1 bg-slate-900/90 hover:bg-indigo-600 text-white font-bold text-[10px] rounded-full shadow-lg backdrop-blur-md flex items-center gap-1.5 transition-all cursor-pointer border border-white/20 hover:scale-105 active:scale-95"
              >
                <Sparkles className="w-3 h-3 text-amber-300" />
                <span>৩৬০° ৩ডি স্টেজ ভিউ</span>
              </button>
            </div>
          )}
        </div>

        {/* 3D Depth Card Body */}
        <div
          style={{
            transform: isHovered ? "translateZ(30px)" : "translateZ(0px)",
            transition: "transform 0.2s ease-out",
            transformStyle: "preserve-3d",
          }}
          className="p-4 space-y-2 flex-1 flex flex-col justify-between min-w-0 bg-white"
        >
          <div className="space-y-1">
            {/* Brand & Stock Status */}
            <div className="flex items-center justify-between text-[11px] font-bold">
              <span className="text-indigo-600 uppercase tracking-wider truncate">
                {product.brandName}
              </span>
              <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                {isOutOfStock ? "স্টক শেষ" : "ইন-স্টক"}
              </span>
            </div>

            {/* Product Title */}
            <h3
              onClick={() => onSelectProduct(product)}
              className="font-bold text-slate-900 text-xs sm:text-sm line-clamp-2 hover:text-indigo-600 transition-colors cursor-pointer leading-snug min-h-[2.5rem]"
              title={product.name}
            >
              {product.name}
            </h3>

            {/* Rating Stars */}
            <div className="flex items-center gap-1.5 pt-0.5">
              <div className="flex items-center gap-1 bg-amber-50 text-amber-900 border border-amber-200/60 px-1.5 py-0.5 rounded text-[11px] font-bold">
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                <span>{(product.rating || 4.9).toFixed(1)}</span>
              </div>
              <span className="text-slate-400 text-[11px]">
                ({product.reviewsCount || 24} রিভিউ)
              </span>
            </div>
          </div>

          {/* Pricing & 1-Click Action */}
          <div
            style={{
              transform: isHovered ? "translateZ(40px)" : "translateZ(0px)",
              transition: "transform 0.2s ease-out",
            }}
            className="pt-2 border-t border-slate-100 space-y-2.5 mt-auto"
          >
            <div className="flex items-baseline justify-between">
              <div>
                <span className="text-base sm:text-lg font-black text-slate-900 font-mono tracking-tight">
                  {currencySymbol}{displayPrice.toLocaleString()}
                </span>
                {hasDiscount && (
                  <span className="text-xs text-slate-400 line-through ml-2 font-mono">
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
                className="w-full py-2 bg-slate-100 text-slate-400 font-bold text-xs rounded-xl cursor-not-allowed"
              >
                স্টক শেষ
              </button>
            ) : (
              <button
                type="button"
                onClick={handleAddToCartClick}
                className={`w-full py-2.5 px-3 rounded-xl font-black text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 ${
                  isAdded
                    ? "bg-emerald-600 text-white shadow-emerald-500/30"
                    : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-500/25 hover:shadow-lg"
                }`}
              >
                {isAdded ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>কার্টে যুক্ত হয়েছে!</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4" />
                    <span>কার্টে নিন</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
