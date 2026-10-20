import React, { useState } from "react";
import { useStore } from "../../context/StoreContext";
import { Product } from "../../types";
import {
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  X,
  Tag,
  ShoppingBag,
  Sliders,
  DollarSign,
  AlertCircle,
  HelpCircle,
  Clock,
  ArrowRight,
  Crown,
} from "lucide-react";

interface PriceCompromiseModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export const PriceCompromiseModal: React.FC<PriceCompromiseModalProps> = ({
  product,
  isOpen,
  onClose,
}) => {
  const {
    currentUser,
    submitPriceCompromise,
    addToCart,
    setStoreView,
    addToast,
    settings,
  } = useStore();

  if (!isOpen || !product) return null;

  const originalPrice = product.discountPrice || product.sellingPrice;
  const hasMembership = !!currentUser?.membership && currentUser.membership.status === "active";
  const memberTier = currentUser?.membership?.tier || "Silver";
  const maxCompromisePercent = currentUser?.membership?.priceCompromiseMaxPercent || 8;

  // Maximum allowed discounted price for instant approval
  const minAllowedInstantPrice = Math.round(originalPrice * (1 - maxCompromisePercent / 100));

  const [proposedPrice, setProposedPrice] = useState<number>(
    Math.round(originalPrice * (1 - (maxCompromisePercent * 0.7) / 100))
  );
  const [buyerNote, setBuyerNote] = useState("");
  const [submittedOffer, setSubmittedOffer] = useState<{
    id: string;
    approvedPrice: number;
    status: string;
  } | null>(null);

  const priceDiff = originalPrice - proposedPrice;
  const discountPercent = Math.round((priceDiff / originalPrice) * 100);
  const isWithinInstantApproval = proposedPrice >= minAllowedInstantPrice;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasMembership) {
      addToast("প্রাইস কম্প্রোমাইজ সুবিধা উপভোগ করতে মেম্বারশিপ গ্রহণ করুন।", "warning");
      return;
    }

    if (proposedPrice <= 0 || proposedPrice > originalPrice) {
      addToast("অনুগ্রহ করে একটি সঠিক প্রস্তাবিত মূল্য লিখুন।", "error");
      return;
    }

    const offer = submitPriceCompromise(product.id, proposedPrice, buyerNote);
    setSubmittedOffer({
      id: offer.id,
      approvedPrice: offer.approvedPrice || proposedPrice,
      status: offer.status,
    });
  };

  const handleAddDiscountedToCart = () => {
    if (!submittedOffer) return;
    // Create a special compromise-discounted variant of the product to add to cart
    const compromisedProduct: Product = {
      ...product,
      discountPrice: submittedOffer.approvedPrice,
    };
    addToCart(compromisedProduct, undefined, undefined, 1);
    addToast(`স্পেশাল কম্প্রোমাইজ মূল্যে ৳${submittedOffer.approvedPrice.toLocaleString()} কার্টে যোগ হয়েছে!`, "success");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden text-left relative animate-in fade-in zoom-in-95 duration-200">
        {/* Header with Tier Glow */}
        <div
          className={`p-5 text-white flex items-center justify-between ${
            memberTier === "Platinum"
              ? "bg-gradient-to-r from-slate-950 via-purple-950 to-slate-900 border-b border-purple-500/40"
              : memberTier === "Gold"
              ? "bg-gradient-to-r from-amber-900 via-yellow-950 to-slate-950 border-b border-amber-500/40"
              : "bg-gradient-to-r from-slate-800 via-slate-900 to-indigo-950 border-b border-slate-700"
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-white/10 rounded-xl border border-white/20">
              <Crown className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h3 className="font-extrabold text-base leading-tight">
                মেম্বার প্রাইস কম্প্রোমাইজ (দরদাম ও অফার)
              </h3>
              <p className="text-[11px] text-white/80">
                {hasMembership
                  ? `${memberTier} মেম্বারশিপের বিশেষ সুবিধা — সরাসরি সেরা মূল্যে কিনুন`
                  : "শুধুমাত্র স্মার্টশপ মেম্বারদের জন্য এক্সক্লুসিভ ফিচার"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-white/70 hover:text-white rounded-xl bg-white/10 hover:bg-white/20 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Non-Member Notification */}
        {!hasMembership ? (
          <div className="p-6 text-center space-y-4">
            <div className="w-16 h-16 bg-amber-50 border border-amber-200 text-amber-600 rounded-3xl mx-auto flex items-center justify-center">
              <Crown className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h4 className="font-extrabold text-slate-900 text-base">
                আপনি এখনও কোনো মেম্বারশিপে যুক্ত হননি!
              </h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                সিলভার, গোল্ড বা প্লাটিনাম মেম্বারশিপ কার্ড নিয়ে প্রতি পণ্যে দরদাম ও ৫% থেকে ২৫% পর্যন্ত অতিরিক্ত প্রাইস কম্প্রোমাইজ সুবিধা উপভোগ করুন।
              </p>
            </div>

            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-600 space-y-1 text-left">
              <div className="flex items-center gap-2 font-bold text-slate-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>সিলভার কার্ড (৳৯৯/বছর): সর্বোচ্চ ৮% দরদাম সুবিধা</span>
              </div>
              <div className="flex items-center gap-2 font-bold text-slate-800">
                <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0" />
                <span>গোল্ড ভিআইপি (৳১৯৯/বছর): সর্বোচ্চ ১৫% দরদাম সুবিধা</span>
              </div>
              <div className="flex items-center gap-2 font-bold text-slate-800">
                <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0" />
                <span>প্লাটিনাম এলিট (৳৩৪৯/বছর): সর্বোচ্চ ২৫% দরদাম সুবিধা + ফ্রি ডেলিভারি</span>
              </div>
            </div>

            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
              >
                পরে দেখব
              </button>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  setStoreView("membership");
                }}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-md transition flex items-center gap-1.5 cursor-pointer"
              >
                <span>মেম্বারশিপ প্ল্যান দেখুন</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : submittedOffer ? (
          /* Success / Instant Approval View */
          <div className="p-6 text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-50 border border-emerald-200 text-emerald-600 rounded-3xl mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                {submittedOffer.status === "Approved" ? "তাৎক্ষণিক অনুমোদিত" : "পর্যালোচনাধীন"}
              </span>
              <h4 className="font-black text-slate-900 text-lg">
                {submittedOffer.status === "Approved"
                  ? "দরদাম সফলভাবে গৃহীত হয়েছে!"
                  : "আপনার রিকোয়েস্ট জমা হয়েছে!"}
              </h4>
              <p className="text-xs text-slate-500">
                {submittedOffer.status === "Approved"
                  ? `আপনার ${memberTier} মেম্বারশিপ সুবিধায় এই বিশেষ মূল্যে কার্টে যোগ করার সুযোগ দেওয়া হলো।`
                  : "আমাদের প্রাইসিং টিম আপনার প্রস্তাব পর্যালোচনা করে দ্রুত কনফার্ম করবে।"}
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between text-left">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">
                  মূল নিয়মিত মূল্য
                </span>
                <span className="text-sm font-bold text-slate-400 line-through">
                  ৳{originalPrice.toLocaleString()}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-emerald-600 font-bold uppercase block">
                  অনুমোদিত কম্প্রোমাইজ মূল্য
                </span>
                <span className="text-xl font-black text-emerald-700">
                  ৳{submittedOffer.approvedPrice.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
              >
                বন্ধ করুন
              </button>
              {submittedOffer.status === "Approved" && (
                <button
                  type="button"
                  onClick={handleAddDiscountedToCart}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-md transition flex items-center gap-1.5 cursor-pointer"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>এই মূল্যে কার্টে যোগ করুন</span>
                </button>
              )}
            </div>
          </div>
        ) : (
          /* Active Price Compromise Form */
          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            {/* Product Mini Bar */}
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-200">
              <img
                src={product.mainImage || product.galleryImages?.[0]}
                alt={product.name}
                className="w-14 h-14 object-cover rounded-xl border border-slate-200 shrink-0"
              />
              <div className="min-w-0 flex-1">
                <h4 className="font-extrabold text-slate-900 text-xs truncate">
                  {product.name}
                </h4>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-slate-400 line-through">
                    ৳{product.sellingPrice.toLocaleString()}
                  </span>
                  <span className="text-sm font-black text-indigo-700">
                    ৳{originalPrice.toLocaleString()}
                  </span>
                </div>
              </div>
              <div className="text-right shrink-0">
                <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md block">
                  {memberTier} Member
                </span>
                <span className="text-[9px] text-slate-400 mt-0.5 block">
                  সর্বোচ্চ {maxCompromisePercent}% ছাড়
                </span>
              </div>
            </div>

            {/* Slider & Proposed Price Input */}
            <div className="p-4 bg-indigo-50/50 rounded-2xl border border-indigo-200 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-extrabold text-indigo-950 flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-indigo-600" />
                  আপনার প্রস্তাবিত দরদাম মূল্য:
                </label>
                <div className="flex items-center gap-1">
                  <span className="text-base font-black text-indigo-950">৳</span>
                  <input
                    type="number"
                    min={Math.round(originalPrice * 0.5)}
                    max={originalPrice}
                    value={proposedPrice}
                    onChange={(e) => setProposedPrice(parseInt(e.target.value) || 0)}
                    className="w-24 bg-white border border-indigo-300 rounded-xl px-2 py-1 text-sm font-black text-indigo-950 text-right focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Slider Controller */}
              <input
                type="range"
                min={minAllowedInstantPrice}
                max={originalPrice}
                step={10}
                value={proposedPrice}
                onChange={(e) => setProposedPrice(parseInt(e.target.value) || originalPrice)}
                className="w-full accent-indigo-600 cursor-pointer"
              />

              {/* Instant Status Helper */}
              <div className="flex items-center justify-between text-[11px] pt-1">
                <span className="text-slate-600">
                  সাশ্রয়: <strong>৳{Math.max(0, priceDiff).toLocaleString()}</strong> ({discountPercent}% ছাড়)
                </span>
                {isWithinInstantApproval ? (
                  <span className="text-emerald-700 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    ইনস্ট্যান্ট অটো-অ্যাপ্রুভাল
                  </span>
                ) : (
                  <span className="text-amber-700 font-bold flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-amber-600" />
                    অ্যাডমিন রিভিউ প্রয়োজন
                  </span>
                )}
              </div>
            </div>

            {/* Note Input */}
            <div>
              <label className="text-[11px] font-bold text-slate-600 block mb-1">
                বিশেষ কোনো নোট বা রেফারেন্স (ঐচ্ছিক):
              </label>
              <textarea
                rows={2}
                value={buyerNote}
                onChange={(e) => setBuyerNote(e.target.value)}
                placeholder="যেমন: একসাথে ২টি পণ্য নিব, অথবা পুরনো কাস্টমার হিসেবে স্পেশাল ছাড় চাই..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Price Compromise Guarantee Note */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-start gap-2 text-[11px] text-slate-500 leading-relaxed">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                আপনার {memberTier} মেম্বারশিপ থাকায় ৳{minAllowedInstantPrice.toLocaleString()} টাকা পর্যন্ত প্রস্তাব সরাসরি গৃহীত হবে।
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition"
              >
                বাতিল
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-md transition flex items-center gap-1.5 cursor-pointer"
              >
                <span>দরদাম সাবমিট করুন</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
