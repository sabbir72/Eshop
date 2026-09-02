import React, { useState, useEffect, useRef } from "react";
import { useStore } from "../../context/StoreContext";
import { X, Sparkles, Copy, Check, ExternalLink, Flame, Clock } from "lucide-react";

export const PromotionalPopup: React.FC = () => {
  const { advertisements, storeView, setStoreView, setSelectedOffer, trackAdImpression, trackAdClick, addToast } = useStore();
  const [activePopup, setActivePopup] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [dontShowToday, setDontShowToday] = useState(false);
  const [copied, setCopied] = useState(false);
  const trackedPopupRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    // Do not show popups on Checkout or Payment pages
    if (storeView === "checkout" || storeView === "cart") {
      setIsVisible(false);
      return;
    }

    // Check if dismissed today
    const dismissedTimestamp = localStorage.getItem("promo_popup_dismissed_until");
    if (dismissedTimestamp) {
      const now = new Date().getTime();
      if (now < parseInt(dismissedTimestamp, 10)) {
        return;
      }
    }

    // Find active popup ad (valid schedule date & active)
    const todayStr = new Date().toISOString().split("T")[0];
    const validPopups = advertisements.filter((ad) => {
      if (ad.type !== "popup" || !ad.isActive) return false;
      if (ad.startDate && ad.startDate > todayStr) return false;
      if (ad.endDate && ad.endDate < todayStr) return false;
      return true;
    });

    if (validPopups.length > 0) {
      // Pick highest priority active popup
      const chosen = [...validPopups].sort((a, b) => a.priority - b.priority)[0];
      setActivePopup(chosen);

      // Delay display 2.5 seconds after page load for non-intrusive experience
      const timer = setTimeout(() => {
        setIsVisible(true);
        if (chosen.id && !trackedPopupRef.current.has(chosen.id)) {
          trackedPopupRef.current.add(chosen.id);
          trackAdImpression(chosen.id);
        }
      }, 2500);

      return () => clearTimeout(timer);
    }
  }, [storeView]);

  if (!isVisible || !activePopup) return null;

  const handleClose = () => {
    if (dontShowToday) {
      // Store 24-hour expiration timestamp in localStorage
      const tomorrowMs = new Date().getTime() + 24 * 60 * 60 * 1000;
      localStorage.setItem("promo_popup_dismissed_until", tomorrowMs.toString());
    }
    setIsVisible(false);
  };

  const handleShopNow = () => {
    trackAdClick(activePopup.id);
    handleClose();
    if (activePopup.buttonLink === "products" || activePopup.buttonLink.startsWith("products")) {
      setStoreView("products");
    } else {
      setStoreView("products");
    }
  };

  const handleViewDetails = () => {
    trackAdClick(activePopup.id);
    setSelectedOffer(activePopup);
    handleClose();
    setStoreView("offer-details");
  };

  const handleCopyCoupon = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    addToast(`Coupon "${code}" copied to clipboard!`, "success");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-300">
      <div className="bg-white max-w-md w-full max-h-[90vh] overflow-y-auto custom-scrollbar rounded-3xl overflow-hidden shadow-2xl border border-slate-100 relative text-left">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 z-20 w-8 h-8 rounded-full bg-slate-900/60 hover:bg-slate-900 text-white flex items-center justify-center transition-all shadow-md"
          title="Close Popup"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Media Header (Image or Video) */}
        <div className="relative h-56 bg-slate-900 overflow-hidden">
          {activePopup.mediaType === "video" && activePopup.videoUrl ? (
            <video
              src={activePopup.videoUrl}
              autoPlay
              muted
              loop
              playsInline
              className="w-full h-full object-cover"
            />
          ) : (
            <img
              src={activePopup.mediaUrl || "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1000&q=80"}
              alt={activePopup.title}
              className="w-full h-full object-cover"
            />
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent"></div>

          {/* Badge */}
          {activePopup.offerBadge && (
            <div className="absolute top-3 left-3 z-10">
              <span className="px-3 py-1 bg-amber-400 text-slate-950 font-black text-[10px] uppercase tracking-wider rounded-full shadow-lg flex items-center gap-1 border border-amber-300">
                <Flame className="w-3 h-3 text-rose-600" />
                {activePopup.offerBadge}
              </span>
            </div>
          )}

          <div className="absolute bottom-3 left-4 right-4 text-white">
            <h2 className="text-xl font-black tracking-tight leading-snug drop-shadow-md">
              {activePopup.title}
            </h2>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-4">
          <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
            {activePopup.description}
          </p>

          {/* Coupon Code Section */}
          {activePopup.couponCode && (
            <div className="p-3 bg-indigo-50/80 border border-indigo-200 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider block">
                  Promo Voucher
                </span>
                <span className="text-sm font-black text-indigo-950 tracking-wider">
                  {activePopup.couponCode}
                </span>
              </div>
              <button
                onClick={() => handleCopyCoupon(activePopup.couponCode)}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl flex items-center gap-1 shadow-xs transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? "Copied" : "Copy Code"}</span>
              </button>
            </div>
          )}

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-2.5 pt-1">
            <button
              onClick={handleViewDetails}
              className="w-full py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1"
            >
              <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
              <span>View Details</span>
            </button>
            <button
              onClick={handleShopNow}
              className="w-full py-2.5 px-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md hover:shadow-indigo-500/20 transition-all flex items-center justify-center gap-1"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>{activePopup.buttonText || "Shop Now"}</span>
            </button>
          </div>

          {/* Footer Preference Checkbox */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <label className="flex items-center gap-2 cursor-pointer select-none hover:text-slate-700">
              <input
                type="checkbox"
                checked={dontShowToday}
                onChange={(e) => setDontShowToday(e.target.checked)}
                className="w-3.5 h-3.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span>Don't show again today</span>
            </label>
            <span className="text-[10px] text-slate-400">Smart Promotions</span>
          </div>
        </div>
      </div>
    </div>
  );
};
