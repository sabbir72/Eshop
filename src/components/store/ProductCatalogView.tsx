import React, { useState, useMemo } from "react";
import { useStore } from "../../context/StoreContext";
import { Product } from "../../types";
import {
  Search,
  Filter,
  Grid,
  List as ListIcon,
  X,
  SlidersHorizontal,
  ChevronRight,
  ShoppingBag,
  Star,
  CheckCircle,
  Eye,
  Heart,
  GitCompare,
  Share2,
  Bell,
  Truck,
  Zap,
  Sparkles,
  ChevronLeft,
  RotateCcw,
} from "lucide-react";

interface ProductCatalogViewProps {
  onQuickView?: (p: Product) => void;
}

// Subcomponent: Dedicated Rich Product Card for Grid View
export const ProductGridCard: React.FC<{
  product: Product;
  onSelectProduct: (p: Product) => void;
  onAddToCart: (p: Product) => void;
  onBuyNow: (p: Product) => void;
  isWishlisted: boolean;
  onToggleWishlist: (p: Product) => void;
  isCompared: boolean;
  onToggleCompare: (p: Product) => void;
  onQuickView?: (p: Product) => void;
  onShareProduct: (p: Product) => void;
  onNotifyMe: (p: Product) => void;
  currencySymbol: string;
}> = ({
  product,
  onSelectProduct,
  onAddToCart,
  onBuyNow,
  isWishlisted,
  onToggleWishlist,
  isCompared,
  onToggleCompare,
  onQuickView,
  onShareProduct,
  onNotifyMe,
  currencySymbol,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  // Fallback default image if missing
  const defaultImage = "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&q=80&w=400";
  const mainImg = product.mainImage || defaultImage;
  const hoverImg = product.galleryImages && product.galleryImages.length > 0 ? product.galleryImages[0] : mainImg;

  const displayPrice = product.discountPrice > 0 ? product.discountPrice : product.sellingPrice;
  const hasDiscount = product.discountPrice > 0 && product.discountPrice < product.sellingPrice;
  const discountPercent = hasDiscount
    ? Math.round(((product.sellingPrice - product.discountPrice) / product.sellingPrice) * 100)
    : 0;

  const isOutOfStock = product.totalStock <= 0;
  const isLowStock = product.totalStock > 0 && product.totalStock <= 5;

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group bg-white rounded-2xl border border-slate-200 overflow-hidden hover:border-indigo-500 hover:shadow-2xl transition-all duration-300 flex flex-col justify-between relative"
    >
      {/* Top Badges Bar */}
      <div className="relative bg-slate-50 aspect-square overflow-hidden flex items-center justify-center p-4">
        {/* Left Badges Stack */}
        <div className="absolute top-2.5 left-2.5 z-10 flex flex-col gap-1 items-start max-w-[70%]">
          {hasDiscount && (
            <span className="bg-rose-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-xs">
              -{discountPercent}% OFF
            </span>
          )}

          {product.freeShipping && (
            <span className="bg-emerald-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md shadow-xs flex items-center gap-1">
              <Truck className="w-2.5 h-2.5" /> Free Delivery
            </span>
          )}

          {product.isFeatured && (
            <span className="bg-amber-400 text-slate-900 text-[9px] font-black px-1.5 py-0.5 rounded-md shadow-xs flex items-center gap-0.5">
              <Sparkles className="w-2.5 h-2.5 fill-slate-900" /> New
            </span>
          )}

          {product.reviewsCount > 20 && (
            <span className="bg-indigo-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md shadow-xs">
              Best Seller
            </span>
          )}
        </div>

        {/* Right Stock Status Badge */}
        <div className="absolute top-2.5 right-2.5 z-10">
          {isOutOfStock ? (
            <span className="bg-rose-700 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-xs">
              Out of Stock
            </span>
          ) : isLowStock ? (
            <span className="bg-amber-500 text-slate-900 text-[10px] font-black px-2 py-0.5 rounded-full shadow-xs">
              Only {product.totalStock} Left
            </span>
          ) : (
            <span className="bg-emerald-100 text-emerald-800 text-[9px] font-bold px-2 py-0.5 rounded-full border border-emerald-300 shadow-xs">
              In Stock
            </span>
          )}
        </div>

        {/* Product Images with Hover Image Transition */}
        <div
          onClick={() => onSelectProduct(product)}
          className="w-full h-full cursor-pointer relative flex items-center justify-center"
        >
          <img
            src={mainImg}
            alt={product.name}
            className={`w-full h-full object-contain transition-all duration-500 group-hover:scale-105 ${
              isHovered && hoverImg !== mainImg ? "opacity-0" : "opacity-100"
            } ${isOutOfStock ? "grayscale opacity-60" : ""}`}
          />
          {hoverImg !== mainImg && (
            <img
              src={hoverImg}
              alt={`${product.name} hover`}
              className={`absolute inset-0 w-full h-full object-contain transition-all duration-500 group-hover:scale-105 ${
                isHovered ? "opacity-100" : "opacity-0"
              }`}
            />
          )}
        </div>

        {/* Floating Hover Action Overlay */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-center gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 z-20">
          <button
            onClick={() => onToggleWishlist(product)}
            className={`p-2 rounded-full shadow-lg backdrop-blur-md transition-all active:scale-95 ${
              isWishlisted ? "bg-rose-600 text-white" : "bg-white/95 text-slate-700 hover:bg-white hover:text-rose-600"
            }`}
            title={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
          >
            <Heart className={`w-4 h-4 ${isWishlisted ? "fill-current" : ""}`} />
          </button>

          <button
            onClick={() => onToggleCompare(product)}
            className={`p-2 rounded-full shadow-lg backdrop-blur-md transition-all active:scale-95 ${
              isCompared ? "bg-indigo-600 text-white" : "bg-white/95 text-slate-700 hover:bg-white hover:text-indigo-600"
            }`}
            title={isCompared ? "Remove from Compare" : "Compare Product"}
          >
            <GitCompare className="w-4 h-4" />
          </button>

          {onQuickView && (
            <button
              onClick={() => onQuickView(product)}
              className="p-2 rounded-full shadow-lg bg-white/95 text-slate-700 hover:bg-white hover:text-indigo-600 transition-all active:scale-95"
              title="Quick View Popup"
            >
              <Eye className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={() => onShareProduct(product)}
            className="p-2 rounded-full shadow-lg bg-white/95 text-slate-700 hover:bg-white hover:text-indigo-600 transition-all active:scale-95"
            title="Share Product"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Details & Info Section */}
      <div className="p-4 space-y-2.5 flex-1 flex flex-col justify-between">
        <div className="space-y-1">
          {/* Category, Brand & SKU */}
          <div className="flex items-center justify-between text-[11px] text-slate-500 font-semibold">
            <span className="text-indigo-600 font-bold truncate">
              {product.brandName} • {product.categoryName}
            </span>
            <span className="font-mono text-[10px] text-slate-400 shrink-0">SKU: {product.sku}</span>
          </div>

          {/* Product Name (Strictly Max 2 Lines) */}
          <h3
            onClick={() => onSelectProduct(product)}
            className="font-bold text-slate-900 text-sm line-clamp-2 hover:text-indigo-600 transition-colors cursor-pointer leading-snug"
            title={product.name}
          >
            {product.name}
          </h3>

          {/* Short Description (Max 2 Lines) */}
          {product.shortDescription && (
            <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
              {product.shortDescription}
            </p>
          )}

          {/* Rating & Review Count */}
          <div className="flex items-center gap-1.5 pt-0.5">
            {product.rating > 0 ? (
              <div className="flex items-center gap-1 text-amber-500 font-bold text-xs">
                <Star className="w-3.5 h-3.5 fill-amber-400" />
                <span>{product.rating.toFixed(1)}</span>
                <span className="text-slate-400 font-normal">({product.reviewsCount} reviews)</span>
              </div>
            ) : (
              <span className="text-[11px] text-slate-400 italic">No Rating Yet (0 Reviews)</span>
            )}
          </div>
        </div>

        {/* Pricing & CTA Buttons */}
        <div className="pt-2 border-t border-slate-100 space-y-2">
          <div className="flex items-baseline justify-between">
            <div>
              <span className="text-lg font-black text-slate-900 font-mono">
                {currencySymbol}
                {displayPrice.toLocaleString()}
              </span>
              {hasDiscount && (
                <span className="ml-2 text-xs text-slate-400 line-through font-medium font-mono">
                  {currencySymbol}
                  {product.sellingPrice.toLocaleString()}
                </span>
              )}
            </div>
          </div>

          {/* Action Buttons Grid */}
          <div className="flex items-center gap-1.5 pt-1">
            {isOutOfStock ? (
              <button
                onClick={() => onNotifyMe(product)}
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-colors"
              >
                <Bell className="w-3.5 h-3.5 text-amber-600" /> Notify Me
              </button>
            ) : (
              <>
                <button
                  onClick={() => onAddToCart(product)}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-bold text-xs py-2 px-2.5 rounded-xl flex items-center justify-center gap-1 shadow-xs transition-all"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>Add to Cart</span>
                </button>

                <button
                  onClick={() => onBuyNow(product)}
                  className="bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs py-2 px-2.5 rounded-xl flex items-center justify-center gap-1 shadow-xs transition-all shrink-0"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>Buy Now</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export const ProductCatalogView: React.FC<ProductCatalogViewProps> = ({ onQuickView }) => {
  const {
    products,
    categories,
    brands,
    searchQuery,
    setSearchQuery,
    selectedCategoryId,
    setSelectedCategoryId,
    selectedBrandId,
    setSelectedBrandId,
    setSelectedProduct,
    setStoreView,
    addToCart,
    wishlist,
    toggleWishlist,
    compareList,
    toggleCompare,
    settings,
    addToast,
  } = useStore();

  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [maxPrice, setMaxPrice] = useState<number>(400000);
  const [selectedSize, setSelectedSize] = useState<string>("All");
  const [selectedColor, setSelectedColor] = useState<string>("All");
  const [minRating, setMinRating] = useState<number>(0);
  const [availabilityFilter, setAvailabilityFilter] = useState<string>("All");
  const [onlyDiscounted, setOnlyDiscounted] = useState<boolean>(false);
  const [onlyNewArrivals, setOnlyNewArrivals] = useState<boolean>(false);

  const [sortBy, setSortBy] = useState<
    "featured" | "best-selling" | "newest" | "price-low" | "price-high" | "rating" | "reviews" | "discount"
  >("featured");

  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Pagination State
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(12);

  // Filtered & Sorted Products calculation
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        // Business Rule: Only active products in customer view
        if (p.status === "Draft" || p.status === "Archived") return false;

        // Search text filter (Min 2 chars)
        const q = searchQuery.trim().toLowerCase();
        if (q.length >= 2) {
          const matchName = p.name.toLowerCase().includes(q);
          const matchSku = p.sku.toLowerCase().includes(q);
          const matchCategory = p.categoryName.toLowerCase().includes(q);
          const matchBrand = p.brandName.toLowerCase().includes(q);
          const matchDesc = p.description?.toLowerCase().includes(q) || false;
          if (!matchName && !matchSku && !matchCategory && !matchBrand && !matchDesc) return false;
        }

        // Category filter
        if (selectedCategoryId) {
          if (p.categoryId !== selectedCategoryId) {
            const childCatIds = categories.filter((c) => c.parentId === selectedCategoryId).map((c) => c.id);
            if (!childCatIds.includes(p.categoryId)) return false;
          }
        }

        // Brand filter
        if (selectedBrandId && p.brandId !== selectedBrandId) return false;

        // Price filter
        const price = p.discountPrice > 0 ? p.discountPrice : p.sellingPrice;
        if (price > maxPrice) return false;

        // Size filter
        if (selectedSize !== "All") {
          if (!p.sizes || !p.sizes.includes(selectedSize)) return false;
        }

        // Color filter
        if (selectedColor !== "All") {
          if (!p.colors || !p.colors.includes(selectedColor)) return false;
        }

        // Rating filter
        if (p.rating < minRating) return false;

        // Availability filter
        if (availabilityFilter === "In Stock" && p.totalStock <= 0) return false;
        if (availabilityFilter === "Out of Stock" && p.totalStock > 0) return false;
        if (availabilityFilter === "Low Stock" && (p.totalStock <= 0 || p.totalStock > 5)) return false;

        // Discount filter
        if (onlyDiscounted && (!p.discountPrice || p.discountPrice >= p.sellingPrice)) return false;

        // New arrivals filter
        if (onlyNewArrivals && !p.isFeatured) return false;

        return true;
      })
      .sort((a, b) => {
        const priceA = a.discountPrice > 0 ? a.discountPrice : a.sellingPrice;
        const priceB = b.discountPrice > 0 ? b.discountPrice : b.sellingPrice;

        const discPctA = a.discountPrice > 0 ? ((a.sellingPrice - a.discountPrice) / a.sellingPrice) * 100 : 0;
        const discPctB = b.discountPrice > 0 ? ((b.sellingPrice - b.discountPrice) / b.sellingPrice) * 100 : 0;

        if (sortBy === "price-low") return priceA - priceB;
        if (sortBy === "price-high") return priceB - priceA;
        if (sortBy === "rating") return b.rating - a.rating;
        if (sortBy === "reviews") return b.reviewsCount - a.reviewsCount;
        if (sortBy === "newest") return b.createdAt.localeCompare(a.createdAt);
        if (sortBy === "best-selling") return b.reviewsCount - a.reviewsCount;
        if (sortBy === "discount") return discPctB - discPctA;
        return 0; // featured default
      });
  }, [
    products,
    searchQuery,
    selectedCategoryId,
    selectedBrandId,
    maxPrice,
    selectedSize,
    selectedColor,
    minRating,
    availabilityFilter,
    onlyDiscounted,
    onlyNewArrivals,
    sortBy,
    categories,
  ]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredProducts.length / pageSize) || 1;
  const paginatedProducts = useMemo(() => {
    const startIdx = (currentPage - 1) * pageSize;
    return filteredProducts.slice(startIdx, startIdx + pageSize);
  }, [filteredProducts, currentPage, pageSize]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategoryId(null);
    setSelectedBrandId(null);
    setMaxPrice(400000);
    setSelectedSize("All");
    setSelectedColor("All");
    setMinRating(0);
    setAvailabilityFilter("All");
    setOnlyDiscounted(false);
    setOnlyNewArrivals(false);
    setCurrentPage(1);
  };

  const handleShareProduct = (p: Product) => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    addToast(`Link copied for "${p.name}"! Share with friends.`, "success");
  };

  const handleNotifyMe = (p: Product) => {
    addToast(`Restock alert set for "${p.name}". We will notify you when in stock!`, "info");
  };

  const handleBuyNow = (p: Product) => {
    addToCart(p);
    setStoreView("checkout");
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header Banner */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl">
        <div>
          <h1 className="text-2xl font-black tracking-tight flex items-center gap-2">
            <Grid className="w-6 h-6 text-indigo-400" /> Product Grid Catalog
          </h1>
          <p className="text-xs text-slate-300 mt-1">
            Browse {filteredProducts.length} active items with rich grid cards, quick view, size/color filters & instant cart checkout
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileFilterOpen(true)}
            className="md:hidden flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-md transition-colors"
          >
            <SlidersHorizontal className="w-4 h-4" /> Filters ({filteredProducts.length})
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Sidebar Filters Desktop */}
        <aside className="hidden md:block space-y-5 bg-white p-5 rounded-3xl border border-slate-200 h-fit shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Filter className="w-4 h-4 text-indigo-600" /> Filter Catalog
            </h3>
            <button onClick={clearFilters} className="text-xs text-indigo-600 hover:underline font-bold flex items-center gap-1">
              <RotateCcw className="w-3 h-3" /> Reset
            </button>
          </div>

          {/* Category Filter */}
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Category</label>
            <div className="space-y-1 max-h-48 overflow-y-auto text-xs font-medium text-slate-700 pr-1">
              <button
                onClick={() => { setSelectedCategoryId(null); setCurrentPage(1); }}
                className={`w-full text-left px-2.5 py-1.5 rounded-xl transition-colors flex items-center justify-between ${
                  selectedCategoryId === null ? "bg-indigo-50 text-indigo-700 font-bold" : "hover:bg-slate-50"
                }`}
              >
                <span>All Categories</span>
                <span className="text-[10px] bg-slate-200 px-1.5 py-0.5 rounded-full">{products.length}</span>
              </button>
              {categories.map((c) => (
                <button
                  key={c.id}
                  onClick={() => { setSelectedCategoryId(c.id); setCurrentPage(1); }}
                  className={`w-full text-left px-2.5 py-1.5 rounded-xl transition-colors flex items-center justify-between ${
                    selectedCategoryId === c.id ? "bg-indigo-50 text-indigo-700 font-bold" : "hover:bg-slate-50"
                  }`}
                >
                  <span className="truncate">{c.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Brand Filter */}
          <div className="space-y-2 pt-3 border-t border-slate-200">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Brand</label>
            <div className="space-y-1 max-h-40 overflow-y-auto text-xs font-medium text-slate-700 pr-1">
              <button
                onClick={() => { setSelectedBrandId(null); setCurrentPage(1); }}
                className={`w-full text-left px-2.5 py-1.5 rounded-xl transition-colors ${
                  selectedBrandId === null ? "bg-indigo-50 text-indigo-700 font-bold" : "hover:bg-slate-50"
                }`}
              >
                All Brands
              </button>
              {brands.map((b) => (
                <button
                  key={b.id}
                  onClick={() => { setSelectedBrandId(b.id); setCurrentPage(1); }}
                  className={`w-full text-left px-2.5 py-1.5 rounded-xl transition-colors ${
                    selectedBrandId === b.id ? "bg-indigo-50 text-indigo-700 font-bold" : "hover:bg-slate-50"
                  }`}
                >
                  {b.name}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range Slider */}
          <div className="space-y-2 pt-3 border-t border-slate-200">
            <div className="flex justify-between items-center text-xs">
              <label className="font-bold text-slate-500 uppercase tracking-wider text-[11px]">Max Price</label>
              <span className="font-extrabold text-indigo-600 font-mono">
                {settings.currencySymbol}{maxPrice.toLocaleString()}
              </span>
            </div>
            <input
              type="range"
              min="1000"
              max="400000"
              step="5000"
              value={maxPrice}
              onChange={(e) => { setMaxPrice(Number(e.target.value)); setCurrentPage(1); }}
              className="w-full accent-indigo-600 cursor-pointer"
            />
          </div>

          {/* Size Filter */}
          <div className="space-y-2 pt-3 border-t border-slate-200">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Size</label>
            <div className="flex flex-wrap gap-1.5">
              {["All", "S", "M", "L", "XL", "XXL"].map((sz) => (
                <button
                  key={sz}
                  onClick={() => { setSelectedSize(sz); setCurrentPage(1); }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${
                    selectedSize === sz ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  {sz}
                </button>
              ))}
            </div>
          </div>

          {/* Color Filter */}
          <div className="space-y-2 pt-3 border-t border-slate-200">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Color</label>
            <div className="flex flex-wrap gap-1.5">
              {["All", "Black", "White", "Blue", "Silver", "Gold", "Red"].map((clr) => (
                <button
                  key={clr}
                  onClick={() => { setSelectedColor(clr); setCurrentPage(1); }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${
                    selectedColor === clr ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  {clr}
                </button>
              ))}
            </div>
          </div>

          {/* Rating Filter */}
          <div className="space-y-2 pt-3 border-t border-slate-200 text-xs">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Minimum Rating</label>
            <div className="space-y-1">
              {[0, 4, 3, 2].map((rt) => (
                <button
                  key={rt}
                  onClick={() => { setMinRating(rt); setCurrentPage(1); }}
                  className={`w-full text-left px-2 py-1 rounded-lg flex items-center gap-1 font-semibold ${
                    minRating === rt ? "bg-indigo-50 text-indigo-700 font-bold" : "hover:bg-slate-50 text-slate-600"
                  }`}
                >
                  {rt === 0 ? (
                    <span>All Ratings</span>
                  ) : (
                    <>
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span>{rt} Stars & Above</span>
                    </>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Stock Availability */}
          <div className="space-y-2 pt-3 border-t border-slate-200 text-xs">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Stock Status</label>
            <select
              value={availabilityFilter}
              onChange={(e) => { setAvailabilityFilter(e.target.value); setCurrentPage(1); }}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 font-semibold text-slate-800"
            >
              <option value="All">All Items</option>
              <option value="In Stock">In Stock Only</option>
              <option value="Low Stock">Low Stock Only</option>
              <option value="Out of Stock">Out of Stock Only</option>
            </select>
          </div>

          {/* Toggles */}
          <div className="space-y-2 pt-3 border-t border-slate-200 text-xs font-semibold text-slate-700">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={onlyDiscounted}
                onChange={(e) => { setOnlyDiscounted(e.target.checked); setCurrentPage(1); }}
                className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
              />
              <span>Discounted Items Only</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={onlyNewArrivals}
                onChange={(e) => { setOnlyNewArrivals(e.target.checked); setCurrentPage(1); }}
                className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
              />
              <span>New Arrivals / Featured Only</span>
            </label>
          </div>
        </aside>

        {/* Main Grid View Area */}
        <main className="md:col-span-3 space-y-4">
          {/* Controls Bar: Sort By, View Mode, Page Size */}
          <div className="bg-white p-3.5 rounded-2xl border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs shadow-xs">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-slate-500 font-semibold">Sort By:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="featured">Featured Deals</option>
                <option value="best-selling">Best Selling</option>
                <option value="newest">Newest Arrivals</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
                <option value="reviews">Most Reviewed</option>
                <option value="discount">Highest Discount %</option>
              </select>
            </div>

            <div className="flex items-center gap-3">
              {/* Items Per Page */}
              <div className="flex items-center gap-1">
                <span className="text-slate-500 font-medium hidden sm:inline">Per Page:</span>
                <select
                  value={pageSize}
                  onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
                  className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 font-bold text-slate-800"
                >
                  <option value={8}>8</option>
                  <option value={12}>12</option>
                  <option value={16}>16</option>
                  <option value={24}>24</option>
                </select>
              </div>

              {/* View Toggle */}
              <div className="flex border border-slate-200 rounded-xl overflow-hidden bg-slate-100 p-0.5">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-1.5 rounded-lg transition-colors ${
                    viewMode === "grid" ? "bg-indigo-600 text-white shadow-xs" : "text-slate-600 hover:text-slate-900"
                  }`}
                  title="Grid View (4 Desktop / 3 Laptop / 2 Tablet / 2 Mobile)"
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-1.5 rounded-lg transition-colors ${
                    viewMode === "list" ? "bg-indigo-600 text-white shadow-xs" : "text-slate-600 hover:text-slate-900"
                  }`}
                  title="List View"
                >
                  <ListIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Empty Results State */}
          {filteredProducts.length === 0 ? (
            <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-3 shadow-xs">
              <Search className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="text-lg font-extrabold text-slate-800">No Active Products Found</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                No catalog items matched your current filter criteria or search phrase. Try clearing your filters or increasing max price limit.
              </p>
              <button
                onClick={clearFilters}
                className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-colors shadow-md"
              >
                Clear All Filters
              </button>
            </div>
          ) : viewMode === "grid" ? (
            /* RESPONSIVE GRID LAYOUT
               Desktop: 4–5 columns (xl:grid-cols-4 2xl:grid-cols-5)
               Laptop: 4 columns (lg:grid-cols-4 or xl:grid-cols-4)
               Tablet: 3 columns (md:grid-cols-3)
               Mobile: 2 columns (min-[380px]:grid-cols-2)
               Small Mobile: 1 column (grid-cols-1)
            */
            <div className="grid grid-cols-1 min-[380px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-3 sm:gap-5">
              {paginatedProducts.map((p) => (
                <ProductGridCard
                  key={p.id}
                  product={p}
                  onSelectProduct={(product) => {
                    setSelectedProduct(product);
                    setStoreView("product-detail");
                  }}
                  onAddToCart={(product) => addToCart(product)}
                  onBuyNow={handleBuyNow}
                  isWishlisted={wishlist.some((item) => item.id === p.id)}
                  onToggleWishlist={(product) => toggleWishlist(product)}
                  isCompared={compareList.some((item) => item.id === p.id)}
                  onToggleCompare={(product) => toggleCompare(product)}
                  onQuickView={onQuickView}
                  onShareProduct={handleShareProduct}
                  onNotifyMe={handleNotifyMe}
                  currencySymbol={settings.currencySymbol}
                />
              ))}
            </div>
          ) : (
            /* List View Layout */
            <div className="space-y-3">
              {paginatedProducts.map((p) => {
                const displayPrice = p.discountPrice > 0 ? p.discountPrice : p.sellingPrice;
                const hasDiscount = p.discountPrice > 0 && p.discountPrice < p.sellingPrice;

                return (
                  <div
                    key={p.id}
                    className="bg-white p-4 rounded-2xl border border-slate-200 hover:border-indigo-400 hover:shadow-md transition-all flex flex-col sm:flex-row items-center gap-4"
                  >
                    <img
                      src={p.mainImage}
                      alt={p.name}
                      className="w-28 h-28 object-contain shrink-0 bg-slate-50 rounded-xl p-2 cursor-pointer border"
                      onClick={() => {
                        setSelectedProduct(p);
                        setStoreView("product-detail");
                      }}
                    />

                    <div className="flex-1 space-y-1 text-center sm:text-left">
                      <div className="flex items-center gap-2 justify-center sm:justify-start text-[10px] font-bold text-indigo-600 uppercase tracking-wider">
                        <span>{p.brandName}</span>
                        <span>•</span>
                        <span>{p.categoryName}</span>
                        <span>•</span>
                        <span className="font-mono text-slate-400">SKU: {p.sku}</span>
                      </div>

                      <h3
                        onClick={() => {
                          setSelectedProduct(p);
                          setStoreView("product-detail");
                        }}
                        className="font-bold text-slate-900 text-sm hover:text-indigo-600 cursor-pointer"
                      >
                        {p.name}
                      </h3>

                      <p className="text-xs text-slate-500 line-clamp-2">{p.shortDescription || p.description}</p>

                      <div className="flex items-center gap-2 pt-1 text-amber-500 font-bold text-xs justify-center sm:justify-start">
                        <Star className="w-3.5 h-3.5 fill-amber-400" />
                        <span>{p.rating > 0 ? p.rating.toFixed(1) : "No Rating"}</span>
                        <span className="text-slate-400">({p.reviewsCount} reviews)</span>
                      </div>
                    </div>

                    <div className="text-center sm:text-right space-y-2 shrink-0">
                      <div>
                        <span className="text-lg font-black text-slate-900 font-mono block">
                          {settings.currencySymbol}
                          {displayPrice.toLocaleString()}
                        </span>
                        {hasDiscount && (
                          <span className="text-xs text-slate-400 line-through font-mono">
                            {settings.currencySymbol}
                            {p.sellingPrice.toLocaleString()}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => addToCart(p)}
                          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-xs transition-all"
                        >
                          <ShoppingBag className="w-3.5 h-3.5" /> Add to Cart
                        </button>
                        {onQuickView && (
                          <button
                            onClick={() => onQuickView(p)}
                            className="bg-slate-100 hover:bg-slate-200 text-slate-700 p-2 rounded-xl transition-colors"
                            title="Quick View Modal"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination Controls */}
          {filteredProducts.length > 0 && (
            <div className="bg-white p-4 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-semibold text-slate-600">
              <div>
                Showing <strong className="text-slate-900">{Math.min((currentPage - 1) * pageSize + 1, filteredProducts.length)}</strong> to{" "}
                <strong className="text-slate-900">{Math.min(currentPage * pageSize, filteredProducts.length)}</strong> of{" "}
                <strong className="text-indigo-600">{filteredProducts.length}</strong> Products
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="p-2 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 rounded-xl text-slate-700 font-bold transition-colors"
                  title="Previous Page"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pg) => (
                  <button
                    key={pg}
                    onClick={() => handlePageChange(pg)}
                    className={`w-8 h-8 rounded-xl font-bold transition-all ${
                      currentPage === pg
                        ? "bg-indigo-600 text-white shadow-md"
                        : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                    }`}
                  >
                    {pg}
                  </button>
                ))}

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="p-2 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 rounded-xl text-slate-700 font-bold transition-colors"
                  title="Next Page"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Mobile Filter Slide-Over Drawer */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex justify-end">
          <div className="bg-white w-full max-w-xs h-full p-6 overflow-y-auto space-y-5 shadow-2xl animate-slideLeft">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Filter className="w-4 h-4 text-indigo-600" /> Catalog Filters
              </h3>
              <button onClick={() => setMobileFilterOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mobile Category */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-500 uppercase">Category</label>
              <select
                value={selectedCategoryId || ""}
                onChange={(e) => {
                  setSelectedCategoryId(e.target.value ? e.target.value : null);
                  setCurrentPage(1);
                }}
                className="w-full bg-slate-50 border rounded-xl p-2.5 text-xs font-semibold"
              >
                <option value="">All Categories ({products.length})</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Mobile Brand */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-500 uppercase">Brand</label>
              <select
                value={selectedBrandId || ""}
                onChange={(e) => {
                  setSelectedBrandId(e.target.value ? e.target.value : null);
                  setCurrentPage(1);
                }}
                className="w-full bg-slate-50 border rounded-xl p-2.5 text-xs font-semibold"
              >
                <option value="">All Brands</option>
                {brands.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Mobile Price */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs font-bold">
                <span>Max Price</span>
                <span className="text-indigo-600">{settings.currencySymbol}{maxPrice.toLocaleString()}</span>
              </div>
              <input
                type="range"
                min="1000"
                max="400000"
                step="5000"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full accent-indigo-600"
              />
            </div>

            <div className="pt-4 flex gap-2">
              <button
                onClick={clearFilters}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 rounded-xl text-xs"
              >
                Reset All
              </button>
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-xl text-xs"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
