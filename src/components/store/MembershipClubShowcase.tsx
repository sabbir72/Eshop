import React, { useState } from "react";
import { useStore } from "../../context/StoreContext";
import { MembershipPlan } from "../../types";
import {
  Crown,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Truck,
  CreditCard,
  Tag,
  ArrowRight,
  Flame,
  Zap,
  MapPin,
  Clock,
  Phone,
  User,
  ShoppingBag,
  Sliders,
  DollarSign,
  ChevronRight,
  Check,
  HelpCircle,
  X,
  AlertCircle,
} from "lucide-react";

interface MembershipClubShowcaseProps {
  onQuickOrder?: (plan: MembershipPlan) => void;
}

export const MembershipClubShowcase: React.FC<MembershipClubShowcaseProps> = () => {
  const {
    membershipPlans,
    currentUser,
    membershipCardOrders,
    orderMembershipCard,
    setStoreView,
    addToast,
    settings,
  } = useStore();

  const userMembership = currentUser?.membership;
  const isMember = !!userMembership && userMembership.status === "active";

  // Selected plan for fast order modal
  const [selectedPlan, setSelectedPlan] = useState<MembershipPlan | null>(null);

  // Card delivery location form state
  const [cardHolderName, setCardHolderName] = useState(
    currentUser?.name || "Sabbir Hossain"
  );
  const [phone, setPhone] = useState(currentUser?.phone || "01712345678");
  const [altPhone, setAltPhone] = useState("");
  const [division, setDivision] = useState<
    "Dhaka" | "Chittagong" | "Rajshahi" | "Khulna" | "Barisal" | "Sylhet" | "Rangpur" | "Mymensingh"
  >("Dhaka");
  const [district, setDistrict] = useState("Dhaka");
  const [thana, setThana] = useState("Dhanmondi");
  const [fullAddress, setFullAddress] = useState(
    currentUser?.address || "House 12, Road 4, Dhanmondi, Dhaka"
  );
  const [deliveryNotes, setDeliveryNotes] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"cod" | "bkash" | "nagad" | "card">("bkash");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delivery charge calculation
  const deliveryCharge = selectedPlan
    ? selectedPlan.tier === "Platinum"
      ? 0
      : division === "Dhaka"
      ? selectedPlan.deliveryChargeDhaka
      : selectedPlan.deliveryChargeOutside
    : 0;

  const totalAmount = selectedPlan ? selectedPlan.price + deliveryCharge : 0;

  const handleOpenOrder = (plan: MembershipPlan) => {
    setSelectedPlan(plan);
    setCardHolderName(currentUser?.name || "Sabbir Hossain");
    setPhone(currentUser?.phone || "01712345678");
  };

  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlan) return;

    if (!cardHolderName.trim()) {
      addToast("কার্ডে প্রিন্ট করার জন্য নাম লিখুন।", "error");
      return;
    }
    if (!phone.trim()) {
      addToast("কার্ড ডেলিভারি যোগাযোগের ফোন নম্বর দিন।", "error");
      return;
    }
    if (!fullAddress.trim()) {
      addToast("কার্ড ডেলিভারির পূর্ণাঙ্গ ঠিকানা লিখুন।", "error");
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      orderMembershipCard({
        tier: selectedPlan.tier,
        planId: selectedPlan.id,
        membershipFee: selectedPlan.price,
        deliveryCharge,
        totalAmount,
        cardHolderName,
        deliveryAddress: {
          fullName: cardHolderName,
          phone,
          alternativePhone: altPhone,
          division,
          district,
          thanaOrArea: thana,
          fullAddress,
          deliveryNotes,
        },
        paymentMethod,
      });

      setIsSubmitting(false);
      setSelectedPlan(null);
    }, 600);
  };

  return (
    <section className="bg-gradient-to-b from-slate-950 via-indigo-950/80 to-slate-950 rounded-3xl p-5 sm:p-8 border border-indigo-800/40 text-white shadow-xl space-y-8 relative overflow-hidden text-left">
      {/* Ambient background glow */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-10 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 relative z-10 border-b border-indigo-900/60 pb-6">
        <div className="space-y-2 max-w-2xl">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-amber-500/20 text-amber-300 rounded-xl border border-amber-400/40">
              <Crown className="w-4 h-4" />
            </span>
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-300 bg-amber-950/80 px-2.5 py-0.5 rounded-full border border-amber-700/50">
              ৩টি মেম্বারশিপ ক্যাটাগরি ও ফিজিক্যাল কার্ড ক্লাব
            </span>
          </div>

          <h2 className="text-xl sm:text-3xl font-black text-white tracking-tight leading-tight">
            স্মার্ট মেম্বারশিপ নিন — কেনাকাটায় বিশেষ ছাড় ও সরাসরি{" "}
            <span className="text-amber-400">প্রাইস কম্প্রোমাইজ (দরদাম)</span> সুবিধা
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
            একটি ছোট্ট মেম্বারশিপ ফি দিয়ে ঘরে বসে সংগ্রহ করুন আপনার নিজস্ব মেম্বারশিপ কার্ড। কার্ড অর্ডারের জন্য ঠিকানা ও ডেলিভারি চার্জ নির্ধারণ করে অর্ডার দিন এবং উপভোগ করুন ফ্ল্যাট ডিসকাউন্ট ও যেকোনো পণ্যে মেম্বার কম্প্রোমাইজ মূল্য!
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setStoreView("membership")}
            className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-extrabold text-xs transition flex items-center gap-2 border border-white/20 cursor-pointer"
          >
            <span>মেম্বারশিপ পোর্টাল বিস্তারিত</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Active Member Status Notice */}
      {isMember && userMembership && (
        <div className="bg-gradient-to-r from-amber-500/20 via-indigo-900/40 to-slate-900 p-4 rounded-2xl border border-amber-400/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black">
              <Crown className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-amber-300 uppercase">
                  {userMembership.tier} VIP Active Member
                </span>
                <span className="text-[9px] bg-emerald-500 text-slate-950 font-black px-2 py-0.2 rounded-full">
                  সক্রিয়
                </span>
              </div>
              <p className="text-xs text-slate-300 font-mono">
                কার্ড নম্বর: {userMembership.cardNumber} • মেয়াদ: {userMembership.validUntil}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setStoreView("membership")}
              className="px-3.5 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs rounded-xl transition cursor-pointer"
            >
              কার্ড ডেলিভারি ট্র্যাক করুন
            </button>
          </div>
        </div>
      )}

      {/* 3 Categories Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 relative z-10">
        {membershipPlans.map((plan) => {
          const isUserPlan = userMembership?.tier === plan.tier;
          const isPlatinum = plan.tier === "Platinum";
          const isGold = plan.tier === "Gold";

          return (
            <div
              key={plan.id}
              className={`rounded-3xl p-5 sm:p-6 transition-all duration-300 flex flex-col justify-between border relative overflow-hidden group ${
                isGold
                  ? "bg-gradient-to-b from-amber-950/60 via-slate-900 to-slate-950 border-amber-400/70 shadow-lg shadow-amber-500/10 -translate-y-1 sm:-translate-y-2 ring-1 ring-amber-400/50"
                  : isPlatinum
                  ? "bg-gradient-to-b from-purple-950/60 via-slate-900 to-slate-950 border-purple-400/60 shadow-md"
                  : "bg-slate-900/90 border-slate-700/80 shadow-md"
              }`}
            >
              {/* Popular / Best Value Ribbon */}
              {plan.isPopular && (
                <div className="absolute top-3.5 right-3.5">
                  <span className="bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full shadow-md flex items-center gap-1">
                    <Flame className="w-3 h-3 fill-current" /> সর্বাধিক জনপ্রিয়
                  </span>
                </div>
              )}
              {isPlatinum && (
                <div className="absolute top-3.5 right-3.5">
                  <span className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full shadow-md flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> আজীবন ফ্রি ডেলিভারি
                  </span>
                </div>
              )}

              <div className="space-y-4">
                {/* Tier Badge & Name */}
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`p-1.5 rounded-lg text-white ${
                        isPlatinum
                          ? "bg-purple-600"
                          : isGold
                          ? "bg-amber-500"
                          : "bg-slate-700"
                      }`}
                    >
                      <Crown className="w-4 h-4" />
                    </span>
                    <span className="text-xs font-black text-slate-300 uppercase tracking-wider">
                      {plan.tier} Club
                    </span>
                  </div>
                  <h3 className="text-lg font-black text-white">{plan.nameBn || plan.name}</h3>
                  <p className="text-[11px] text-slate-400">{plan.cardTitle}</p>
                </div>

                {/* Small Price Display */}
                <div className="bg-black/30 p-3.5 rounded-2xl border border-white/10 space-y-1">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-3xl font-black text-white font-mono">
                      {settings.currencySymbol}{plan.price.toLocaleString()}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">/ ১২ মাস মেয়াদ</span>
                  </div>
                  <p className="text-[10px] text-amber-300 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-amber-400" />
                    একটি ছোট্ট ফি দিয়ে এক বছরের ভিআইপি ক্লাব মেম্বারশিপ
                  </p>
                </div>

                {/* Delivery Charge Detail */}
                <div className="bg-white/5 p-3 rounded-xl border border-white/5 space-y-1 text-xs">
                  <div className="flex items-center justify-between text-slate-300">
                    <span className="flex items-center gap-1 text-[11px] text-slate-400">
                      <Truck className="w-3.5 h-3.5 text-indigo-400" /> কার্ড ডেলিভারি চার্জ:
                    </span>
                    <span className="font-bold text-white font-mono text-[11px]">
                      {isPlatinum ? (
                        <span className="text-emerald-400 font-black">সম্পূর্ণ ফ্রি (৳০)</span>
                      ) : (
                        `ঢাকা ৳${plan.deliveryChargeDhaka} • বাইরে ৳${plan.deliveryChargeOutside}`
                      )}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-slate-300">
                    <span className="flex items-center gap-1 text-[11px] text-slate-400">
                      <Tag className="w-3.5 h-3.5 text-amber-400" /> ছোট ডিসকাউন্ট:
                    </span>
                    <span className="font-extrabold text-amber-300 font-mono text-[11px]">
                      {plan.discountPercent}% প্রতিটি কেনাকাটায়
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-slate-300">
                    <span className="flex items-center gap-1 text-[11px] text-slate-400">
                      <Sliders className="w-3.5 h-3.5 text-purple-400" /> প্রাইস কম্প্রোমাইজ:
                    </span>
                    <span className="font-extrabold text-purple-300 font-mono text-[11px]">
                      আপ টু {plan.priceCompromiseMaxPercent}% দরদাম সুবিধা
                    </span>
                  </div>
                </div>

                {/* Key Perks List */}
                <ul className="space-y-2 text-xs text-slate-300 pt-1">
                  {(plan.perksBn || plan.perks).slice(0, 4).map((perk, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-[11px] leading-tight">
                      <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{perk}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action Button */}
              <div className="pt-5 mt-4 border-t border-white/10">
                {isUserPlan ? (
                  <button
                    disabled
                    className="w-full py-2.5 rounded-xl bg-emerald-500/20 text-emerald-300 font-black text-xs border border-emerald-500/40 cursor-default flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>আপনার বর্তমান সক্রিয় মেম্বারশিপ</span>
                  </button>
                ) : (
                  <button
                    onClick={() => handleOpenOrder(plan)}
                    className={`w-full py-2.5 rounded-xl font-black text-xs transition flex items-center justify-center gap-2 cursor-pointer shadow-md active:scale-98 ${
                      isGold
                        ? "bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-slate-950"
                        : isPlatinum
                        ? "bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-400 hover:to-indigo-400 text-white"
                        : "bg-indigo-600 hover:bg-indigo-500 text-white"
                    }`}
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>কার্ড অর্ডার করুন (ফি {settings.currencySymbol}{plan.price})</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Feature Explanations Bar (Delivery + Price Compromise) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-indigo-900/60 relative z-10">
        <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800 flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
            <Truck className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-white">ফিজিক্যাল কার্ড কুরিয়ার ডেলিভারি</h4>
            <p className="text-[11px] text-slate-400 leading-snug">
              আপনার সঠিক নাম ও ঠিকানা প্রদান সাপেক্ষে পিভিসি স্মার্টকার্ড পৌঁছে যাবে আপনার বাসায়।
            </p>
          </div>
        </div>

        <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800 flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
            <Tag className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-white">স্বয়ংক্রিয় ছোট ডিসকাউন্ট</h4>
            <p className="text-[11px] text-slate-400 leading-snug">
              চেকআউটে কুপন ছাড়াই মেম্বারদের জন্য ৫% থেকে ১৫% পর্যন্ত ইনস্ট্যান্ট অতিরিক্ত মূল্যছাড়।
            </p>
          </div>
        </div>

        <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800 flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
            <Sliders className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-white">🤝 লাইভ প্রাইস কম্প্রোমাইজ টুল</h4>
            <p className="text-[11px] text-slate-400 leading-snug">
              পছন্দের পণ্যে সামর্থ্য অনুযায়ী সরাসরি প্রস্তাবিত মূল্য দিয়ে কেনাকাটার এক অনন্য সুযোগ।
            </p>
          </div>
        </div>
      </div>

      {/* QUICK CARD ORDER & DELIVERY LOCATION MODAL */}
      {selectedPlan && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden text-left relative animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-slate-950 to-indigo-950 p-5 text-white flex items-center justify-between border-b border-indigo-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black">
                  <Crown className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">
                    {selectedPlan.nameBn || selectedPlan.name} কার্ড অর্ডার
                  </h3>
                  <p className="text-xs text-slate-300">
                    মেম্বারশিপ ফি: ৳{selectedPlan.price} • মেয়াদ: ১২ মাস
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedPlan(null)}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmitOrder} className="p-5 sm:p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">
                  কার্ডে মুদ্রিত নাম (Cardholder Full Name) *
                </label>
                <input
                  type="text"
                  required
                  value={cardHolderName}
                  onChange={(e) => setCardHolderName(e.target.value)}
                  placeholder="e.g. Sabbir Hossain"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">
                    যোগাযোগের ফোন নম্বর *
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="017xxxxxxxx"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">
                    বিকল্প ফোন নম্বর (ঐচ্ছিক)
                  </label>
                  <input
                    type="tel"
                    value={altPhone}
                    onChange={(e) => setAltPhone(e.target.value)}
                    placeholder="018xxxxxxxx"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Delivery Location Section */}
              <div className="p-3.5 rounded-2xl bg-indigo-50/70 border border-indigo-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-indigo-950 flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-indigo-600" /> ফিজিক্যাল কার্ড ডেলিভারি লোকেশন
                  </span>
                  <span className="text-[10px] font-bold text-indigo-700">
                    {division === "Dhaka" ? "ঢাকা মেট্রো" : "ঢাকার বাইরে"}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-700 block">বিভাগ</label>
                    <select
                      value={division}
                      onChange={(e) => setDivision(e.target.value as any)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="Dhaka">Dhaka</option>
                      <option value="Chittagong">Chittagong</option>
                      <option value="Rajshahi">Rajshahi</option>
                      <option value="Khulna">Khulna</option>
                      <option value="Barisal">Barisal</option>
                      <option value="Sylhet">Sylhet</option>
                      <option value="Rangpur">Rangpur</option>
                      <option value="Mymensingh">Mymensingh</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-700 block">জেলা</label>
                    <input
                      type="text"
                      required
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      placeholder="e.g. Dhaka"
                      className="w-full bg-white border border-slate-300 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-700 block">থানা / এরিয়া</label>
                    <input
                      type="text"
                      required
                      value={thana}
                      onChange={(e) => setThana(e.target.value)}
                      placeholder="e.g. Dhanmondi"
                      className="w-full bg-white border border-slate-300 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 block">
                    বিস্তারিত পূর্ণাঙ্গ ঠিকানা (বাড়ি, রোড, ফ্ল্যাট নম্বর সহ) *
                  </label>
                  <textarea
                    rows={2}
                    required
                    value={fullAddress}
                    onChange={(e) => setFullAddress(e.target.value)}
                    placeholder="e.g. House 12, Road 4, Sector 7, Uttara, Dhaka-1230"
                    className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Payment Method Selector */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 block">পেমেন্ট মেথড</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: "bkash", label: "bKash" },
                    { id: "nagad", label: "Nagad" },
                    { id: "cod", label: "কার্ড COD" },
                    { id: "card", label: "Visa/Master" },
                  ].map((pm) => (
                    <button
                      key={pm.id}
                      type="button"
                      onClick={() => setPaymentMethod(pm.id as any)}
                      className={`p-2 rounded-xl text-xs font-extrabold border transition-all cursor-pointer ${
                        paymentMethod === pm.id
                          ? "bg-indigo-600 text-white border-indigo-600 shadow-xs"
                          : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      {pm.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Order Total Breakdown */}
              <div className="bg-slate-100 p-3.5 rounded-2xl space-y-1.5 text-xs text-slate-700">
                <div className="flex justify-between">
                  <span>মেম্বারশিপ সাবস্ক্রিপশন ফি (১২ মাস)</span>
                  <span className="font-bold text-slate-900">৳{selectedPlan.price}</span>
                </div>
                <div className="flex justify-between">
                  <span>ফিজিক্যাল কার্ড ডেলিভারি চার্জ ({division === "Dhaka" ? "ঢাকা" : "ঢাকার বাইরে"})</span>
                  <span className="font-bold text-slate-900">
                    {deliveryCharge === 0 ? (
                      <span className="text-emerald-600 font-bold">ফ্রি (৳০)</span>
                    ) : (
                      `৳${deliveryCharge}`
                    )}
                  </span>
                </div>
                <div className="flex justify-between font-black text-sm text-slate-950 border-t border-slate-200 pt-2">
                  <span>মোট প্রদেয় টাকা</span>
                  <span className="text-indigo-600 font-mono">৳{totalAmount}</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs shadow-md transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span>প্রসেসিং হচ্ছে...</span>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4" />
                    <span>কার্ড অর্ডার কনফার্ম করুন (৳{totalAmount})</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};
