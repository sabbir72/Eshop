import React, { useState } from "react";
import { Product } from "../../types";
import { useStore } from "../../context/StoreContext";
import { X, Star, ShoppingBag, Heart, RefreshCw, Check, ShieldCheck, Truck, Zap } from "lucide-react";

interface QuickViewModalProps {
  product: Product | null;
  onClose: () => void;
}

export const QuickViewModal: React.FC<QuickViewModalProps> = ({ product, onClose }) => {
  const { addToCart, toggleWishlist, wishlist, toggleCompare, compareList, settings, setStoreView, setSelectedProduct } = useStore();

  const [selectedImage, setSelectedImage] = useState(product?.mainImage || "");
  const [selectedColor, setSelectedColor] = useState(product?.colors?.[0] || "");
  const [selectedSize, setSelectedSize] = useState(product?.sizes?.[0] || "");
  const [quantity, setQuantity] = useState(1);

  if (!product) return null;

  const isWishlisted = wishlist.some((p) => p.id === product.id);
  const isCompared = compareList.some((p) => p.id === product.id);

  const displayPrice = product.discountPrice > 0 ? product.discountPrice : product.sellingPrice;
  const hasDiscount = product.discountPrice > 0 && product.discountPrice < product.sellingPrice;
  const discountPct = hasDiscount
    ? Math.round(((product.sellingPrice - product.discountPrice) / product.sellingPrice) * 100)
    : 0;

  const handleAddToCart = () => {
    addToCart(product, selectedColor, selectedSize, quantity);
  };

  const handleBuyNow = () => {
    addToCart(product, selectedColor, selectedSize, quantity);
    onClose();
    setStoreView("checkout");
  };

  const handleFullDetails = () => {
    setSelectedProduct(product);
    onClose();
    setStoreView("product-detail");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col md:flex-row max-h-[90vh] relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 bg-slate-100 hover:bg-slate-200 text-slate-700 p-2 rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Gallery Column */}
        <div className="md:w-1/2 p-6 bg-slate-50 border-r border-slate-100 flex flex-col items-center justify-between">
          <div className="relative w-full aspect-square bg-white rounded-xl border border-slate-200 p-4 flex items-center justify-center overflow-hidden mb-4">
            {hasDiscount && (
              <span className="absolute top-3 left-3 bg-rose-600 text-white font-black text-xs px-2.5 py-1 rounded-full shadow-xs">
                {discountPct}% OFF
              </span>
            )}
            <img
              src={selectedImage || product.mainImage}
              alt={product.name}
              className="max-h-full max-w-full object-contain transition-all duration-300 hover:scale-105"
            />
          </div>

          {/* Thumbnails */}
          {product.galleryImages && product.galleryImages.length > 0 && (
            <div className="flex gap-2 overflow-x-auto w-full pb-2">
              {[product.mainImage, ...(product.galleryImages || [])].map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(img)}
                  className={`w-14 h-14 rounded-lg border-2 bg-white p-1 flex-shrink-0 transition-all ${
                    selectedImage === img ? "border-indigo-600 shadow-sm" : "border-slate-200 opacity-70 hover:opacity-100"
                  }`}
                >
                  <img src={img} alt="thumb" className="w-full h-full object-contain" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Content Column */}
        <div className="md:w-1/2 p-6 overflow-y-auto space-y-5 text-xs text-slate-800">
          <div>
            <span className="text-[10px] font-bold uppercase text-indigo-600 tracking-wider block">
              {product.brandName} • {product.categoryName}
            </span>
            <h2 className="text-xl font-black text-slate-900 tracking-tight mt-0.5">{product.name}</h2>
            <div className="flex items-center gap-2 mt-2">
              <div className="flex items-center text-amber-400">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span className="text-slate-900 font-extrabold text-xs ml-1">{product.rating}</span>
              </div>
              <span className="text-slate-400">({product.reviewsCount} verified reviews)</span>
              <span className="text-slate-300">•</span>
              <span className="text-slate-500 font-mono">SKU: {product.sku}</span>
            </div>
          </div>

          {/* Price */}
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 flex items-baseline gap-3">
            <span className="text-2xl font-black text-slate-900 font-mono">
              {settings.currencySymbol}{displayPrice.toLocaleString()}
            </span>
            {hasDiscount && (
              <span className="text-sm font-semibold text-slate-400 line-through font-mono">
                {settings.currencySymbol}{product.sellingPrice.toLocaleString()}
              </span>
            )}
            <span className="ml-auto text-emerald-600 font-bold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              In Stock ({product.totalStock} units)
            </span>
          </div>

          <p className="text-slate-600 leading-relaxed">{product.shortDescription}</p>

          {/* Color Selection */}
          {product.colors && product.colors.length > 0 && (
            <div>
              <label className="font-bold text-slate-900 block mb-1.5">Color: {selectedColor}</label>
              <div className="flex flex-wrap gap-2">
                {product.colors.map((c) => (
                  <button
                    key={c}
                    onClick={() => setSelectedColor(c)}
                    className={`px-3 py-1.5 rounded-lg border font-bold text-xs transition-all ${
                      selectedColor === c
                        ? "bg-indigo-600 text-white border-indigo-600 shadow-xs"
                        : "bg-white text-slate-700 border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Size Selection */}
          {product.sizes && product.sizes.length > 0 && (
            <div>
              <label className="font-bold text-slate-900 block mb-1.5">Size: {selectedSize}</label>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSelectedSize(s)}
                    className={`px-3 py-1.5 rounded-lg border font-bold text-xs transition-all ${
                      selectedSize === s
                        ? "bg-indigo-600 text-white border-indigo-600 shadow-xs"
                        : "bg-white text-slate-700 border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity and Actions */}
          <div className="flex items-center gap-3 pt-2">
            <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden bg-slate-50">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="px-3 py-2 font-black text-slate-600 hover:bg-slate-200"
              >
                -
              </button>
              <span className="px-4 py-2 font-bold font-mono text-slate-900">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="px-3 py-2 font-black text-slate-600 hover:bg-slate-200"
              >
                +
              </button>
            </div>

            <button
              onClick={handleAddToCart}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 shadow-sm transition-colors"
            >
              <ShoppingBag className="w-4 h-4" /> Add to Cart
            </button>

            <button
              onClick={handleBuyNow}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-4 rounded-xl flex items-center gap-1.5 shadow-sm transition-colors"
            >
              <Zap className="w-4 h-4" /> Buy Now
            </button>
          </div>

          {/* Wishlist & Compare buttons */}
          <div className="flex items-center justify-between border-t border-slate-100 pt-3">
            <button
              onClick={() => toggleWishlist(product)}
              className={`flex items-center gap-1.5 font-bold transition-colors ${
                isWishlisted ? "text-rose-600" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Heart className={`w-4 h-4 ${isWishlisted ? "fill-rose-600" : ""}`} />
              <span>{isWishlisted ? "Wishlisted" : "Add to Wishlist"}</span>
            </button>

            <button
              onClick={() => toggleCompare(product)}
              className={`flex items-center gap-1.5 font-bold transition-colors ${
                isCompared ? "text-indigo-600" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <RefreshCw className="w-4 h-4" />
              <span>{isCompared ? "In Comparison" : "Compare"}</span>
            </button>

            <button
              onClick={handleFullDetails}
              className="text-indigo-600 font-bold hover:underline"
            >
              Full Page Details →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
