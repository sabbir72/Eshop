import React, { useState } from "react";
import { useStore } from "../../context/StoreContext";
import { X, Trash2, Tag, ShoppingBag, ArrowRight, CheckCircle, AlertCircle } from "lucide-react";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose }) => {
  const {
    cart,
    updateCartQuantity,
    removeFromCart,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    getCouponEvaluation,
    setStoreView,
    settings,
  } = useStore();

  const [couponInput, setCouponInput] = useState("");
  const [couponError, setCouponError] = useState("");

  if (!isOpen) return null;

  const couponEval = getCouponEvaluation(appliedCoupon);

  const subtotal = cart.reduce((acc, item) => {
    const price = item.selectedVariant?.price || item.product.discountPrice || item.product.sellingPrice;
    return acc + price * item.quantity;
  }, 0);

  const discountAmount = couponEval.isValid ? couponEval.discountAmount : 0;
  const shippingCharge = cart.length > 0 ? settings.shippingCharge : 0;
  const tax = Math.round((subtotal - discountAmount) * (settings.taxRate / 100));
  const grandTotal = Math.max(0, subtotal - discountAmount + shippingCharge + tax);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError("");
    const res = applyCoupon(couponInput);
    if (!res.success) {
      setCouponError(res.message);
    } else {
      setCouponInput("");
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity" onClick={onClose} />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between">
          {/* Cart Header */}
          <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-blue-400" />
              <h2 className="font-bold text-base">Shopping Cart ({cart.length})</h2>
            </div>
            <button onClick={onClose} className="p-1 hover:bg-slate-800 rounded-lg text-slate-400">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {cart.length === 0 ? (
              <div className="py-16 text-center space-y-3">
                <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto" />
                <p className="text-slate-600 font-bold text-sm">Your cart is empty</p>
                <p className="text-xs text-slate-400 max-w-xs mx-auto">
                  Explore our catalog and add products to your shopping cart.
                </p>
              </div>
            ) : (
              cart.map((item) => {
                const itemPrice = item.selectedVariant?.price || item.product.discountPrice || item.product.sellingPrice;

                return (
                  <div key={item.id} className="flex gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-200">
                    <img
                      src={item.selectedVariant?.image || item.product.mainImage}
                      alt={item.product.name}
                      className="w-20 h-20 object-contain bg-white rounded-xl p-1 border shrink-0"
                    />

                    <div className="flex-1 space-y-1">
                      <h4 className="font-bold text-xs text-slate-900 line-clamp-1">{item.product.name}</h4>
                      {(item.color || item.size) && (
                        <p className="text-[11px] text-slate-500 font-medium">
                          {item.color} {item.color && item.size ? "•" : ""} {item.size}
                        </p>
                      )}

                      <div className="text-sm font-black text-slate-900">
                        {settings.currencySymbol}{itemPrice.toLocaleString()}
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        {/* Quantity Controls */}
                        <div className="flex items-center border border-slate-300 rounded-lg bg-white">
                          <button
                            onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                            className="px-2 py-0.5 text-xs font-bold text-slate-700 hover:bg-slate-100"
                          >
                            -
                          </button>
                          <span className="px-2 py-0.5 text-xs font-bold">{item.quantity}</span>
                          <button
                            onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                            className="px-2 py-0.5 text-xs font-bold text-slate-700 hover:bg-slate-100"
                          >
                            +
                          </button>
                        </div>

                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-rose-500 hover:text-rose-700 p-1 rounded-md"
                          title="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Coupon Input & Order Summary */}
          {cart.length > 0 && (
            <div className="p-4 bg-slate-50 border-t border-slate-200 space-y-3">
              {/* Coupon Form */}
              <div className="space-y-1">
                {appliedCoupon ? (
                  <div className="p-2.5 bg-emerald-50 text-emerald-900 rounded-xl border border-emerald-200 text-xs font-medium space-y-1">
                    <div className="flex items-center justify-between font-bold">
                      <span className="flex items-center gap-1.5 text-emerald-800">
                        <CheckCircle className="w-4 h-4 text-emerald-600" />
                        Code <span className="font-mono bg-emerald-100 px-1.5 py-0.5 rounded text-emerald-950 font-black">{appliedCoupon.code}</span>
                      </span>
                      <button onClick={removeCoupon} className="text-rose-600 font-bold underline hover:text-rose-800">
                        Remove
                      </button>
                    </div>
                    {couponEval.isValid && (
                      <p className="text-[11px] text-emerald-700">
                        {couponEval.scopeType === "PRODUCT"
                          ? `Applied to ${couponEval.eligibleItems.length} specific product(s)`
                          : couponEval.scopeType === "CATEGORY" || couponEval.scopeType === "PRODUCT_GROUP"
                          ? `Applied to ${couponEval.eligibleItems.length} category item(s)`
                          : `Applied storewide on order`}
                        {" • "}
                        <span className="font-bold">Saving {settings.currencySymbol}{discountAmount.toLocaleString()}</span>
                      </p>
                    )}
                  </div>
                ) : (
                  <form onSubmit={handleApplyCoupon} className="flex gap-2">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        value={couponInput}
                        onChange={(e) => setCouponInput(e.target.value)}
                        placeholder="Coupon Code (e.g. WELCOME10)"
                        className="w-full bg-white text-xs pl-8 pr-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase font-mono"
                      />
                      <Tag className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
                    </div>
                    <button
                      type="submit"
                      className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-3.5 py-2 rounded-xl"
                    >
                      Apply
                    </button>
                  </form>
                )}

                {couponError && (
                  <p className="text-[11px] text-rose-600 font-medium flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" /> {couponError}
                  </p>
                )}
              </div>

              {/* Price Calculation */}
              <div className="space-y-1.5 text-xs text-slate-600 border-t border-slate-200 pt-3">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-bold text-slate-900">{settings.currencySymbol}{subtotal.toLocaleString()}</span>
                </div>

                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-semibold">
                    <span>Discount</span>
                    <span>-{settings.currencySymbol}{discountAmount.toLocaleString()}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span>Shipping Charge</span>
                  <span className="font-bold text-slate-900">{settings.currencySymbol}{shippingCharge}</span>
                </div>

                <div className="flex justify-between">
                  <span>Tax ({settings.taxRate}%)</span>
                  <span className="font-bold text-slate-900">{settings.currencySymbol}{tax.toLocaleString()}</span>
                </div>

                <div className="flex justify-between text-base font-black text-slate-900 border-t border-slate-200 pt-2">
                  <span>Grand Total</span>
                  <span className="text-blue-600">{settings.currencySymbol}{grandTotal.toLocaleString()}</span>
                </div>
              </div>

              {/* Checkout Button */}
              <button
                onClick={() => {
                  onClose();
                  setStoreView("checkout");
                }}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm py-3 px-4 rounded-xl flex items-center justify-center gap-2 shadow-lg transition-colors"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
