import React from "react";
import { useStore } from "../../context/StoreContext";
import { ProductCard } from "./HomeView";
import { Heart, GitCompare, Trash2, ShoppingBag, Check, X } from "lucide-react";

export const WishlistCompareView: React.FC = () => {
  const {
    storeView,
    setStoreView,
    wishlist,
    toggleWishlist,
    compareList,
    toggleCompare,
    setSelectedProduct,
    addToCart,
    settings,
  } = useStore();

  if (storeView === "wishlist") {
    return (
      <div className="space-y-6 pb-16">
        <div className="bg-slate-900 text-white p-6 rounded-2xl flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black tracking-tight">Saved Wishlist ({wishlist.length})</h1>
            <p className="text-xs text-slate-300">Your favorite items saved for later purchase</p>
          </div>
          <Heart className="w-8 h-8 text-rose-500 fill-rose-500" />
        </div>

        {wishlist.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-3">
            <Heart className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-lg font-bold text-slate-800">Your Wishlist is Empty</h3>
            <button
              onClick={() => setStoreView("products")}
              className="bg-blue-600 text-white font-bold text-xs px-4 py-2 rounded-xl"
            >
              Browse Products
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {wishlist.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onSelectProduct={(p) => {
                  setSelectedProduct(p);
                  setStoreView("product-detail");
                }}
                onAddToCart={(p) => addToCart(p)}
                isWishlisted={true}
                onToggleWishlist={(p) => toggleWishlist(p)}
                isCompared={compareList.some((item) => item.id === product.id)}
                onToggleCompare={(p) => toggleCompare(p)}
                currencySymbol={settings.currencySymbol}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  // Compare View
  return (
    <div className="space-y-6 pb-16">
      <div className="bg-slate-900 text-white p-6 rounded-2xl flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight">Product Comparison Matrix</h1>
          <p className="text-xs text-slate-300">Side-by-side technical specification, pricing & warranty matrix</p>
        </div>
        <GitCompare className="w-8 h-8 text-indigo-400" />
      </div>

      {compareList.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-3">
          <GitCompare className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-lg font-bold text-slate-800">No Products Selected for Comparison</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Click the compare button on any product card in the catalog to build your matrix.
          </p>
          <button
            onClick={() => setStoreView("products")}
            className="bg-blue-600 text-white font-bold text-xs px-4 py-2 rounded-xl"
          >
            Explore Catalog
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-x-auto shadow-xs">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="p-4 w-40 font-bold text-slate-500 uppercase tracking-wider">Features</th>
                {compareList.map((prod) => (
                  <th key={prod.id} className="p-4 min-w-[200px] border-l border-slate-200 relative">
                    <button
                      onClick={() => toggleCompare(prod)}
                      className="absolute top-2 right-2 text-rose-500 hover:text-rose-700 p-1"
                      title="Remove"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <img src={prod.mainImage} alt={prod.name} className="w-24 h-24 object-contain mx-auto mb-2 bg-white rounded-lg p-1 border" />
                    <h4 className="font-bold text-slate-900 text-xs text-center line-clamp-2">{prod.name}</h4>
                    <div className="text-center pt-2">
                      <button
                        onClick={() => addToCart(prod)}
                        className="bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold px-3 py-1.5 rounded-lg inline-flex items-center gap-1"
                      >
                        <ShoppingBag className="w-3 h-3" /> Add to Cart
                      </button>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-200 text-slate-700">
              <tr>
                <td className="p-4 font-bold text-slate-900 bg-slate-50">Selling Price</td>
                {compareList.map((prod) => (
                  <td key={prod.id} className="p-4 border-l border-slate-200 font-black text-slate-900 text-sm">
                    {settings.currencySymbol}{(prod.discountPrice || prod.sellingPrice).toLocaleString()}
                  </td>
                ))}
              </tr>

              <tr>
                <td className="p-4 font-bold text-slate-900 bg-slate-50">Category</td>
                {compareList.map((prod) => (
                  <td key={prod.id} className="p-4 border-l border-slate-200 font-semibold">
                    {prod.categoryName}
                  </td>
                ))}
              </tr>

              <tr>
                <td className="p-4 font-bold text-slate-900 bg-slate-50">Brand</td>
                {compareList.map((prod) => (
                  <td key={prod.id} className="p-4 border-l border-slate-200 font-semibold">
                    {prod.brandName}
                  </td>
                ))}
              </tr>

              <tr>
                <td className="p-4 font-bold text-slate-900 bg-slate-50">Rating</td>
                {compareList.map((prod) => (
                  <td key={prod.id} className="p-4 border-l border-slate-200 font-bold text-amber-500">
                    ★ {prod.rating} ({prod.reviewsCount} reviews)
                  </td>
                ))}
              </tr>

              <tr>
                <td className="p-4 font-bold text-slate-900 bg-slate-50">Stock Status</td>
                {compareList.map((prod) => (
                  <td key={prod.id} className="p-4 border-l border-slate-200">
                    {prod.totalStock > 0 ? (
                      <span className="text-emerald-600 font-bold">In Stock ({prod.totalStock} units)</span>
                    ) : (
                      <span className="text-rose-600 font-bold">Out of Stock</span>
                    )}
                  </td>
                ))}
              </tr>

              <tr>
                <td className="p-4 font-bold text-slate-900 bg-slate-50">Warranty</td>
                {compareList.map((prod) => (
                  <td key={prod.id} className="p-4 border-l border-slate-200">
                    {prod.warranty}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
