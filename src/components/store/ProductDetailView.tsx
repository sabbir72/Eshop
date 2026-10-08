import React, { useState } from "react";
import { useStore } from "../../context/StoreContext";
import { Product, ProductVariant } from "../../types";
import {
  Star,
  ShoppingBag,
  Heart,
  GitCompare,
  ShieldCheck,
  CheckCircle,
  Video,
  Sparkles,
  MessageSquare,
  ArrowLeft,
  X,
  Truck,
  RotateCcw,
} from "lucide-react";

export const ProductDetailView: React.FC = () => {
  const {
    selectedProduct,
    setSelectedProduct,
    setStoreView,
    addToCart,
    wishlist,
    toggleWishlist,
    compareList,
    toggleCompare,
    reviews,
    addReview,
    products,
    settings,
  } = useStore();

  const p = selectedProduct;

  // Selected Media Image
  const [activeImage, setActiveImage] = useState<string>(p?.mainImage || p?.galleryImages?.[0] || "");

  // Variant Selection State
  const [selectedColor, setSelectedColor] = useState<string>(p?.colors?.[0] || "");
  const [selectedSize, setSelectedSize] = useState<string>(p?.sizes?.[0] || "");
  const [quantity, setQuantity] = useState<number>(1);

  // Video Modal
  const [showVideoModal, setShowVideoModal] = useState<boolean>(false);
  const [showImageZoomModal, setShowImageZoomModal] = useState<boolean>(false);

  // Add Review Modal
  const [showReviewModal, setShowReviewModal] = useState<boolean>(false);
  const [newReviewRating, setNewReviewRating] = useState<number>(5);
  const [newReviewComment, setNewReviewComment] = useState<string>("");

  if (!p) {
    return (
      <div className="py-12 text-center space-y-4">
        <p className="text-slate-500 text-sm">No product selected.</p>
        <button
          onClick={() => setStoreView("products")}
          className="bg-blue-600 text-white font-bold text-xs px-4 py-2 rounded-xl"
        >
          Back to Catalog
        </button>
      </div>
    );
  }

  // Active Selected Variant lookup
  const activeVariant: ProductVariant | undefined = p.variants.find(
    (v) => (selectedColor ? v.color === selectedColor : true) && (selectedSize ? v.size === selectedSize : true)
  ) || p.variants[0];

  const currentPrice = activeVariant?.price || p.discountPrice || p.sellingPrice;
  const currentStock = activeVariant?.stock ?? p.totalStock;

  const productReviews = reviews.filter((r) => r.productId === p.id && r.status === "Approved");

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReviewComment.trim()) return;

    addReview({
      productId: p.id,
      productName: p.name,
      productImage: p.mainImage,
      customerName: "You (Verified Buyer)",
      customerAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
      rating: newReviewRating,
      comment: newReviewComment,
      verifiedBuyer: true,
    });

    setNewReviewComment("");
    setShowReviewModal(false);
  };

  const handleBuyNow = () => {
    if (currentStock <= 0) return;
    addToCart(p, selectedColor, selectedSize, quantity);
    setStoreView("checkout");
  };

  const isWishlisted = wishlist.some((item) => item.id === p.id);
  const isCompared = compareList.some((item) => item.id === p.id);

  return (
    <div className="space-y-8 pb-16">
      {/* Back Button */}
      <button
        onClick={() => setStoreView("products")}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-blue-600 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Products
      </button>

      {/* Main Details Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 bg-white p-4 sm:p-6 rounded-3xl border border-slate-200 shadow-xs">
        {/* Gallery Column */}
        <div className="space-y-4">
          <div className="relative aspect-square rounded-2xl bg-slate-50 border border-slate-200 overflow-hidden flex items-center justify-center p-6">
            <img src={activeImage} alt={p.name} className="w-full h-full object-contain" />

            {/* Video Trigger Button */}
            {p.videoUrl && (
              <button
                onClick={() => setShowVideoModal(true)}
                className="absolute bottom-4 right-4 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-lg transition-colors"
              >
                <Video className="w-4 h-4" /> Watch Product Video
              </button>
            )}
          </div>

          {/* Thumbnails */}
          {p.galleryImages.length > 0 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-2">
              <button
                onClick={() => setActiveImage(p.mainImage)}
                className={`w-16 h-16 rounded-xl border-2 overflow-hidden shrink-0 bg-slate-50 p-1 transition-all ${
                  activeImage === p.mainImage ? "border-blue-600 ring-2 ring-blue-500/20" : "border-slate-200"
                }`}
              >
                <img src={p.mainImage} alt="Main" className="w-full h-full object-contain" />
              </button>

              {(p.galleryImages || []).map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(img)}
                  className={`w-16 h-16 rounded-xl border-2 overflow-hidden shrink-0 bg-slate-50 p-1 transition-all ${
                    activeImage === img ? "border-blue-600 ring-2 ring-blue-500/20" : "border-slate-200"
                  }`}
                >
                  <img src={img} alt={`Gallery ${idx}`} className="w-full h-full object-contain" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info Column */}
        <div className="space-y-6">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span className="font-bold text-blue-600 uppercase tracking-wider">{p.categoryName}</span>
              <span className="font-mono">SKU: {activeVariant?.sku || p.sku}</span>
            </div>

            <h1 className="text-2xl font-black text-slate-900 tracking-tight">{p.name}</h1>

            <div className="flex items-center gap-3 mt-2 text-xs">
              <div className="flex items-center gap-1 text-amber-500 font-bold">
                <Star className="w-4 h-4 fill-amber-400" /> {p.rating} ({productReviews.length} Verified Reviews)
              </div>
              <span className="text-slate-300">•</span>
              <span className="text-emerald-600 font-semibold flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5" /> In Stock ({currentStock} available)
              </span>
            </div>
          </div>

          {/* Pricing Box */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex items-center justify-between">
            <div>
              <div className="text-2xl font-black text-slate-900">
                {settings.currencySymbol}{currentPrice.toLocaleString()}
              </div>
              {p.sellingPrice > currentPrice && (
                <div className="text-xs text-slate-400 line-through font-medium">
                  {settings.currencySymbol}{p.sellingPrice.toLocaleString()}
                </div>
              )}
            </div>

            <span className="bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1 rounded-full">
              Tax: {p.taxPercent || 5}% Included
            </span>
          </div>

          {/* Color Matrix Picker */}
          {p.colors && p.colors.length > 0 && (
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                Select Color: <strong className="text-slate-900">{selectedColor}</strong>
              </label>
              <div className="flex flex-wrap gap-2">
                {p.colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                      selectedColor === color
                        ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                        : "bg-white text-slate-700 border-slate-200 hover:border-slate-400"
                    }`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Size Matrix Picker */}
          {p.sizes && p.sizes.length > 0 && (
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                Select Size / Storage: <strong className="text-slate-900">{selectedSize}</strong>
              </label>
              <div className="flex flex-wrap gap-2">
                {p.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                      selectedSize === size
                        ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                        : "bg-white text-slate-700 border-slate-200 hover:border-slate-400"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity & Action Buttons */}
          <div className="space-y-3 pt-2">
            {currentStock <= 0 ? (
              <div className="bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-2xl text-xs font-bold text-center">
                ⚠️ Out of Stock - Currently Unavailable for Purchase
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <div className="flex items-center justify-between border border-slate-200 rounded-xl overflow-hidden bg-slate-50 shrink-0">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-2.5 text-slate-700 font-bold hover:bg-slate-200"
                  >
                    -
                  </button>
                  <span className="px-4 py-2.5 font-bold text-slate-900 text-sm">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(currentStock, quantity + 1))}
                    className="px-3 py-2.5 text-slate-700 font-bold hover:bg-slate-200"
                  >
                    +
                  </button>
                </div>

                <button
                  onClick={() => addToCart(p, selectedColor, selectedSize, quantity)}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-bold text-xs py-3 px-4 rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all"
                >
                  <ShoppingBag className="w-4 h-4" /> Add To Cart
                </button>

                <button
                  onClick={handleBuyNow}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs py-3 px-4 rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all"
                >
                  <CheckCircle className="w-4 h-4" /> Buy Now Direct
                </button>
              </div>
            )}

            <div className="flex items-center gap-2">
              <button
                onClick={() => toggleWishlist(p)}
                className={`flex-1 py-2.5 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                  isWishlisted ? "bg-rose-50 text-rose-700 border-rose-200" : "bg-white text-slate-700 border-slate-200"
                }`}
              >
                <Heart className="w-4 h-4 fill-current" /> {isWishlisted ? "In Wishlist" : "Save to Wishlist"}
              </button>

              <button
                onClick={() => toggleCompare(p)}
                className={`flex-1 py-2.5 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                  isCompared ? "bg-indigo-50 text-indigo-700 border-indigo-200" : "bg-white text-slate-700 border-slate-200"
                }`}
              >
                <GitCompare className="w-4 h-4" /> {isCompared ? "In Comparison" : "Compare"}
              </button>
            </div>
          </div>

          {/* Warranty & Delivery & Return Policy Highlights */}
          <div className="grid grid-cols-3 gap-2 pt-4 border-t border-slate-200 text-xs">
            <div className="flex items-center gap-2 p-2.5 bg-slate-50 rounded-xl border border-slate-200">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <div>
                <span className="font-bold text-slate-900 block">Warranty</span>
                <span className="text-slate-500 text-[10px]">{p.warranty || "1 Year Brand"}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 p-2.5 bg-slate-50 rounded-xl border border-slate-200">
              <Truck className="w-4 h-4 text-indigo-600 shrink-0" />
              <div>
                <span className="font-bold text-slate-900 block">Delivery</span>
                <span className="text-slate-500 text-[10px]">Nationwide 24-48h</span>
              </div>
            </div>

            <div className="flex items-center gap-2 p-2.5 bg-slate-50 rounded-xl border border-slate-200">
              <RotateCcw className="w-4 h-4 text-amber-600 shrink-0" />
              <div>
                <span className="font-bold text-slate-900 block">Return Policy</span>
                <span className="text-slate-500 text-[10px]">7 Days Guarantee</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Specifications & Description Tabs */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 space-y-6">
        <h3 className="text-lg font-bold text-slate-900 border-b border-slate-200 pb-3">
          Product Overview & Specifications
        </h3>

        <div className="space-y-4 text-sm text-slate-700 leading-relaxed">
          <p>{p.description}</p>

          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200">
            <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-3">Technical Specifications</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-xs">
              {Object.entries(p.specifications || {}).map(([key, val]) => (
                <div key={key} className="flex items-center justify-between py-1.5 border-b border-slate-200/60">
                  <span className="text-slate-500 font-medium">{key}</span>
                  <span className="font-bold text-slate-900">{val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Customer Reviews & Modal */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Customer Ratings & Reviews</h3>
            <p className="text-xs text-slate-500">Verified buyer feedback & ratings</p>
          </div>

          <button
            onClick={() => setShowReviewModal(true)}
            className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-4 py-2 rounded-xl"
          >
            Write a Review
          </button>
        </div>

        <div className="space-y-3">
          {productReviews.length === 0 ? (
            <p className="text-xs text-slate-500 italic py-2">No reviews yet. Be the first to leave a review!</p>
          ) : (
            productReviews.map((rev) => (
              <div key={rev.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <img src={rev.customerAvatar} alt={rev.customerName} className="w-7 h-7 rounded-full object-cover" />
                    <div>
                      <span className="font-bold text-slate-900 block">{rev.customerName}</span>
                      <span className="text-[10px] text-slate-400">{rev.createdAt}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 text-amber-500 font-bold">
                    <Star className="w-3.5 h-3.5 fill-amber-400" /> {rev.rating} / 5
                  </div>
                </div>

                <p className="text-slate-700 leading-normal">{rev.comment}</p>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Video Modal */}
      {showVideoModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 max-w-2xl w-full rounded-2xl overflow-hidden shadow-2xl relative border border-slate-800">
            <button
              onClick={() => setShowVideoModal(false)}
              className="absolute top-3 right-3 text-white bg-slate-800 hover:bg-slate-700 p-1.5 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="p-4 border-b border-slate-800">
              <h3 className="text-white font-bold text-sm">Product Video Preview</h3>
            </div>
            <div className="aspect-video bg-black flex items-center justify-center">
              {p.videoUrl.includes("youtube") ? (
                <iframe
                  src={p.videoUrl}
                  title={p.name}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              ) : (
                <div className="text-white text-xs text-center p-6 space-y-2">
                  <Video className="w-10 h-10 text-rose-500 mx-auto animate-pulse" />
                  <p>Product Demonstration Video URL: {p.videoUrl}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="font-bold text-slate-900 text-sm">Submit Review for {p.name}</h3>
              <button onClick={() => setShowReviewModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleReviewSubmit} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Your Rating</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setNewReviewRating(star)}
                      className={`p-2 rounded-lg border ${
                        star <= newReviewRating ? "bg-amber-100 text-amber-600 border-amber-300" : "bg-slate-100 text-slate-400"
                      }`}
                    >
                      <Star className="w-5 h-5 fill-current" />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Your Feedback & Experience</label>
                <textarea
                  rows={4}
                  required
                  value={newReviewComment}
                  onChange={(e) => setNewReviewComment(e.target.value)}
                  placeholder="Share details regarding build quality, battery life, packaging..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                ></textarea>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowReviewModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 text-white font-bold"
                >
                  Post Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
