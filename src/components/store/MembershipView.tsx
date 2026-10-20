import React, { useState } from "react";
import { useStore } from "../../context/StoreContext";
import { MembershipPlan, MembershipTier, MembershipCardOrder } from "../../types";
import {
  Crown,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Truck,
  CreditCard,
  Tag,
  ArrowRight,
  Check,
  Flame,
  Award,
  Zap,
  Phone,
  MapPin,
  Clock,
  User,
  ShoppingBag,
  Gift,
  HelpCircle,
  X,
  FileCheck,
  AlertCircle,
  Layers,
  ChevronRight,
} from "lucide-react";

export const MembershipView: React.FC = () => {
  const {
    currentUser,
    membershipPlans,
    membershipCardOrders,
    orderMembershipCard,
    cancelMembership,
    setStoreView,
    addToast,
    settings,
  } = useStore();

  const userMembership = currentUser?.membership;
  const isMember = !!userMembership && userMembership.status === "active";

  // Selected plan for checkout modal
  const [selectedPlanForOrder, setSelectedPlanForOrder] = useState<MembershipPlan | null>(null);

  // Card Order Form State
  const [cardHolderName, setCardHolderName] = useState(
    currentUser?.name || "Sabbir Hossain"
  );
  const [recipientPhone, setRecipientPhone] = useState(
    currentUser?.phone || "01712345678"
  );
  const [alternativePhone, setAlternativePhone] = useState("");
  const [selectedDivision, setSelectedDivision] = useState<
    "Dhaka" | "Chittagong" | "Rajshahi" | "Khulna" | "Barisal" | "Sylhet" | "Rangpur" | "Mymensingh"
  >("Dhaka");
  const [district, setDistrict] = useState("Dhaka");
  const [thanaOrArea, setThanaOrArea] = useState("Dhanmondi");
  const [fullAddress, setFullAddress] = useState(
    currentUser?.address || "House 12, Road 4, Dhanmondi, Dhaka-1205"
  );
  const [deliveryNotes, setDeliveryNotes] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"cod" | "bkash" | "nagad" | "card">("bkash");
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);

  // Delivery charge calculation based on division & plan
  const deliveryCharge = selectedPlanForOrder
    ? selectedPlanForOrder.tier === "Platinum"
      ? 0
      : selectedDivision === "Dhaka"
      ? selectedPlanForOrder.deliveryChargeDhaka
      : selectedPlanForOrder.deliveryChargeOutside
    : 0;

  const totalPayable = selectedPlanForOrder
    ? selectedPlanForOrder.price + deliveryCharge
    : 0;

  const handleOpenOrderModal = (plan: MembershipPlan) => {
    setSelectedPlanForOrder(plan);
    setCardHolderName(currentUser?.name || "Sabbir Hossain");
    setRecipientPhone(currentUser?.phone || "01712345678");
  };

  const handleExecuteCardOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlanForOrder) return;

    if (!cardHolderName.trim()) {
      addToast("কার্ডে প্রিন্ট করার জন্য নাম লিখুন।", "error");
      return;
    }
    if (!recipientPhone.trim()) {
      addToast("ডেলিভারি যোগাযোগের জন্য ফোন নম্বর লিখুন।", "error");
      return;
    }
    if (!fullAddress.trim()) {
      addToast("কার্ড ডেলিভারির বিস্তারিত পূর্ণ ঠিকানা লিখুন।", "error");
      return;
    }

    setIsSubmittingOrder(true);

    setTimeout(() => {
      orderMembershipCard({
        tier: selectedPlanForOrder.tier,
        planId: selectedPlanForOrder.id,
        membershipFee: selectedPlanForOrder.price,
        deliveryCharge,
        totalAmount: totalPayable,
        cardHolderName,
        deliveryAddress: {
          fullName: cardHolderName,
          phone: recipientPhone,
          alternativePhone,
          division: selectedDivision,
          district,
          thanaOrArea,
          fullAddress,
          deliveryNotes,
        },
        paymentMethod,
      });

      setIsSubmittingOrder(false);
      setSelectedPlanForOrder(null);
    }, 600);
  };

  // Find user's latest card order for delivery tracking
  const userLatestCardOrder = membershipCardOrders.find(
    (order) => order.userId === currentUser.id || order.cardNumber === userMembership?.cardNumber
  );

  return (
    <div className="space-y-8 text-left pb-12">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-10 border border-indigo-800/40 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-96 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-amber-500/20 via-transparent to-transparent pointer-events-none" />

        <div className="max-w-3xl space-y-3 relative z-10">
          <div className="flex items-center gap-2">
            <span className="p-2 bg-amber-500/20 border border-amber-400/40 rounded-xl text-amber-300">
              <Crown className="w-5 h-5" />
            </span>
            <span className="text-[11px] font-black uppercase tracking-wider text-amber-300 bg-amber-950/80 px-3 py-0.5 rounded-full border border-amber-700/50">
              Smart VIP Membership Club
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white leading-tight">
            স্মার্টশপ প্রিমিয়াম মেম্বারশিপ ও ফিজিক্যাল কার্ড ক্লাব
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
            একটি ছোট্ট সাবস্ক্রিপশন ফি দিয়ে সংগ্রহ করুন আপনার নিজস্ব মেম্বারশিপ কার্ড। প্রতিটি কেনাকাটায় অতিরিক্ত ৫% থেকে ১৫% ছাড়, ফ্রি ডেলিভারি এবং পণ্যে সরাসরি দরদাম (প্রাইস কম্প্রোমাইজ) করার অবিশ্বাস্য সুবিধা!
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2 text-xs font-semibold text-slate-300">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <Truck className="w-4 h-4" /> দ্রুততম ফিজিক্যাল কার্ড হোম ডেলিভারি
            </span>
            <span className="flex items-center gap-1.5 text-amber-300">
              <Tag className="w-4 h-4" /> বিশেষ মেম্বার ডিসকাউন্ট
            </span>
            <span className="flex items-center gap-1.5 text-indigo-300">
              <Sparkles className="w-4 h-4" /> এক্সক্লুসিভ প্রাইস কম্প্রোমাইজ
            </span>
          </div>
        </div>
      </div>

      {/* ACTIVE USER MEMBERSHIP STATUS CARD (IF ACTIVE) */}
      {isMember && userMembership && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <div
                className={`p-3 rounded-2xl text-white ${
                  userMembership.tier === "Platinum"
                    ? "bg-purple-900"
                    : userMembership.tier === "Gold"
                    ? "bg-amber-600"
                    : "bg-slate-700"
                }`}
              >
                <Crown className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full inline-block mb-1">
                  Active Member
                </span>
                <h3 className="text-lg font-black text-slate-900">
                  আপনার সক্রিয় মেম্বারশিপ: {userMembership.tier} VIP Club
                </h3>
                <p className="text-xs text-slate-500 font-mono">
                  কার্ড নম্বর: {userMembership.cardNumber} • মেয়াদ: {userMembership.validUntil} পর্যন্ত
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setStoreView("products")}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>মেম্বার ডিসকাউন্টে শপ করুন</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Visual Digital Twin Card */}
            <div
              className={`p-5 rounded-2xl text-white shadow-xl flex flex-col justify-between h-48 sm:h-52 relative overflow-hidden border ${
                userMembership.tier === "Platinum"
                  ? "bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900 border-purple-500/40"
                  : userMembership.tier === "Gold"
                  ? "bg-gradient-to-br from-amber-700 via-yellow-700 to-amber-950 border-amber-400"
                  : "bg-gradient-to-br from-slate-700 via-slate-600 to-slate-900 border-slate-400"
              }`}
            >
              {/* Card Holographic Ambient */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-xl pointer-events-none" />

              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black tracking-widest uppercase">
                  SMART SHOP VIP CLUB
                </span>
                <div className="flex items-center gap-1.5">
                  <span className="text-[9px] font-mono px-2 py-0.5 bg-white/20 rounded-md backdrop-blur-xs font-bold">
                    {userMembership.tier.toUpperCase()}
                  </span>
                  <Crown className="w-4 h-4 text-amber-300" />
                </div>
              </div>

              {/* Smart Card Chip */}
              <div className="w-9 h-7 bg-gradient-to-br from-amber-200 via-yellow-400 to-amber-500 rounded-md border border-amber-600/50 shadow-inner flex items-center justify-center">
                <div className="w-5 h-3.5 border border-amber-900/30 rounded-xs" />
              </div>

              <div>
                <span className="text-sm sm:text-base font-mono tracking-widest font-black block">
                  {userMembership.cardNumber}
                </span>
                <div className="flex items-center justify-between text-[10px] text-white/80 pt-1">
                  <span className="uppercase font-bold tracking-wider">
                    {userMembership.cardHolderName || currentUser.name}
                  </span>
                  <span className="font-mono">VALID: {userMembership.validUntil}</span>
                </div>
              </div>
            </div>

            {/* Delivery Tracking Card */}
            <div className="md:col-span-2 p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-4 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-black text-slate-900 text-sm flex items-center gap-2">
                    <Truck className="w-4 h-4 text-indigo-600" />
                    ফিজিক্যাল মেম্বারশিপ কার্ড ডেলিভারি স্ট্যাটাস
                  </h4>
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-700">
                    {userLatestCardOrder?.cardStatus || "Active & Printed"}
                  </span>
                </div>

                <p className="text-xs text-slate-500">
                  আপনার প্রিমিয়াম মেম্বারশিপ প্লাস্টিক কার্ডটি কুরিয়ারের মাধ্যমে ডেলিভারির জন্য প্রস্তুত করা হয়েছে।
                </p>

                {/* 4-Step Tracker */}
                <div className="grid grid-cols-4 gap-2 pt-2 text-center text-[10px]">
                  <div className="space-y-1">
                    <div className="w-7 h-7 mx-auto rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold shadow-xs">
                      ✓
                    </div>
                    <span className="font-bold text-slate-800 block">অর্ডার সম্পন্ন</span>
                  </div>
                  <div className="space-y-1">
                    <div className="w-7 h-7 mx-auto rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold shadow-xs">
                      ✓
                    </div>
                    <span className="font-bold text-slate-800 block">কার্ড প্রিন্টিং</span>
                  </div>
                  <div className="space-y-1">
                    <div className={`w-7 h-7 mx-auto rounded-full flex items-center justify-center font-bold shadow-xs ${
                      userLatestCardOrder?.cardStatus === "Dispatched" || userLatestCardOrder?.cardStatus === "Delivered" || userLatestCardOrder?.cardStatus === "Active"
                        ? "bg-emerald-600 text-white"
                        : "bg-slate-200 text-slate-600"
                    }`}>
                      3
                    </div>
                    <span className="font-bold text-slate-800 block">কুরিয়ারে হস্তান্তর</span>
                  </div>
                  <div className="space-y-1">
                    <div className={`w-7 h-7 mx-auto rounded-full flex items-center justify-center font-bold shadow-xs ${
                      userLatestCardOrder?.cardStatus === "Delivered" || userLatestCardOrder?.cardStatus === "Active"
                        ? "bg-emerald-600 text-white"
                        : "bg-slate-200 text-slate-600"
                    }`}>
                      4
                    </div>
                    <span className="font-bold text-slate-800 block">হোম ডেলিভারি</span>
                  </div>
                </div>
              </div>

              {/* Quick Perks Summary */}
              <div className="pt-3 border-t border-slate-200 grid grid-cols-3 gap-2 text-center text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block font-semibold">ইনস্ট্যান্ট ছাড়</span>
                  <strong className="text-emerald-600 font-black text-sm">
                    {userMembership.discountPercent}% অফ
                  </strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-semibold">প্রাইস কম্প্রোমাইজ</span>
                  <strong className="text-indigo-600 font-black text-sm">
                    সর্বোচ্চ {userMembership.priceCompromiseMaxPercent}%
                  </strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-semibold">ফ্রি ডেলিভারি</span>
                  <strong className="text-purple-600 font-black text-sm">
                    {userMembership.freeDeliveryThreshold === 0 ? "সব অর্ডারে" : `৳${userMembership.freeDeliveryThreshold}+`}
                  </strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3 MEMBERSHIP CATEGORIES / TIERS PRICING GRID */}
      <div className="space-y-4">
        <div className="text-center max-w-xl mx-auto space-y-1.5">
          <span className="text-[10px] font-black uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-200">
            ৩টি বিশেষ ক্যাটাগরি
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            আপনার পছন্দের মেম্বারশিপ প্ল্যান বেছে নিন
          </h2>
          <p className="text-xs text-slate-500">
            ছোট প্রাইসে ফিজিক্যাল মেম্বারশিপ কার্ড হাতে পান এবং বছরজুড়ে দারুণ সব ছাড় ও দরদাম সুবিধা উপভোগ করুন।
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-3">
          {membershipPlans.map((plan) => {
            const isUserCurrentTier = userMembership?.tier === plan.tier;

            return (
              <div
                key={plan.id}
                className={`bg-white rounded-3xl border transition-all duration-300 p-6 flex flex-col justify-between relative shadow-sm hover:shadow-xl ${
                  plan.isPopular
                    ? "border-amber-400 ring-2 ring-amber-400/30 transform md:-translate-y-2"
                    : "border-slate-200 hover:border-indigo-300"
                }`}
              >
                {/* Popular Pill */}
                {plan.isPopular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-500 to-yellow-600 text-white text-[10px] font-black uppercase px-3 py-1 rounded-full shadow-md flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5" /> মোস্ট পপুলার চয়েস
                  </div>
                )}

                <div className="space-y-4">
                  {/* Card Visual Header */}
                  <div
                    className={`p-4 rounded-2xl text-white shadow-md flex flex-col justify-between h-36 relative overflow-hidden bg-gradient-to-br ${plan.cardColor}`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-black tracking-widest uppercase">
                        {plan.cardTitle}
                      </span>
                      <Crown className="w-4 h-4 text-amber-300" />
                    </div>

                    <div className="w-7 h-5 bg-gradient-to-br from-amber-200 via-yellow-400 to-amber-500 rounded border border-amber-600/40 shadow-xs" />

                    <div className="flex items-center justify-between text-[10px] text-white/90">
                      <span className="font-mono tracking-widest font-bold">
                        SMART-{plan.tier.toUpperCase()}-••••-••••
                      </span>
                      <span className="font-bold">{plan.nameBn}</span>
                    </div>
                  </div>

                  {/* Title & Small Price Display */}
                  <div className="border-b border-slate-100 pb-4">
                    <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${plan.badgeColor}`}>
                      {plan.tier} Club
                    </span>
                    <h3 className="text-lg font-black text-slate-900 mt-1">
                      {plan.name}
                    </h3>

                    <div className="flex items-baseline gap-1 mt-2">
                      <span className="text-3xl font-black text-slate-900 font-mono">
                        ৳{plan.price}
                      </span>
                      <span className="text-xs text-slate-500 font-medium">
                        / {plan.durationMonths} মাস (১ বছর)
                      </span>
                    </div>

                    {/* Delivery Charge Callout */}
                    <div className="mt-2 text-[11px] text-slate-600 flex items-center gap-1.5 font-medium">
                      <Truck className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                      <span>
                        কার্ড ডেলিভারি চার্জ:{" "}
                        <strong className="text-slate-900">
                          {plan.tier === "Platinum"
                            ? "সম্পূর্ণ ফ্রি (৳০)"
                            : `ঢাকা ৳${plan.deliveryChargeDhaka} / বাইরে ৳${plan.deliveryChargeOutside}`}
                        </strong>
                      </span>
                    </div>
                  </div>

                  {/* Key Perks List */}
                  <div className="space-y-2.5 pt-1">
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                      মেম্বারশিপের সুবিধাসমূহ:
                    </span>
                    {plan.perksBn.map((perk, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs text-slate-700 font-medium">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span className="leading-snug">{perk}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bottom Action Button */}
                <div className="pt-6 border-t border-slate-100 mt-6">
                  {isUserCurrentTier ? (
                    <button
                      type="button"
                      disabled
                      className="w-full py-2.5 bg-emerald-50 text-emerald-800 border border-emerald-300 font-extrabold text-xs rounded-xl flex items-center justify-center gap-1.5"
                    >
                      <Check className="w-4 h-4" /> আপনার সক্রিয় মেম্বারশিপ
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleOpenOrderModal(plan)}
                      className={`w-full py-3 rounded-xl font-extrabold text-xs shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                        plan.tier === "Platinum"
                          ? "bg-gradient-to-r from-purple-900 to-slate-900 hover:from-purple-800 hover:to-slate-800 text-white"
                          : plan.tier === "Gold"
                          ? "bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-slate-950"
                          : "bg-indigo-600 hover:bg-indigo-700 text-white"
                      }`}
                    >
                      <CreditCard className="w-4 h-4" />
                      <span>{plan.nameBn} অর্ডার করুন (৳{plan.price})</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* HOW PRICE COMPROMISE WORKS SECTION */}
      <div className="bg-gradient-to-br from-indigo-50/70 via-white to-purple-50/50 rounded-3xl p-6 sm:p-8 border border-indigo-200/80 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-indigo-100 pb-4">
          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-purple-700 bg-purple-100 px-2.5 py-0.5 rounded-full">
              Exclusive Member Benefit
            </span>
            <h3 className="text-lg sm:text-xl font-black text-slate-900">
              🤝 "প্রাইস কম্প্রোমাইজ" বা দরদাম সুবিধা কীভাবে কাজ করে?
            </h3>
            <p className="text-xs text-slate-500">
              মেম্বারদের জন্য কোনো ফিক্সড প্রাইজ বাধ্যবাধকতা নেই—ন্যায্য মূল্যে কেনাকাটার পূর্ণ স্বাধীনতা।
            </p>
          </div>

          <button
            type="button"
            onClick={() => setStoreView("products")}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-1 self-start sm:self-auto cursor-pointer"
          >
            <span>পণ্য ক্যাটালগ দেখুন</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black text-sm">
              ১
            </div>
            <h4 className="font-extrabold text-slate-900 text-sm">পণ্য সিলেক্ট করুন</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              পণ্য পেজে গিয়ে সাধারণ মূল্যের নিচে <strong>"🤝 মেম্বার প্রাইস কম্প্রোমাইজ"</strong> বাটনে ক্লিক করুন।
            </p>
          </div>

          <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-2">
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-black text-sm">
              ২
            </div>
            <h4 className="font-extrabold text-slate-900 text-sm">কাঙ্ক্ষিত মূল্য প্রস্তাব দিন</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              আপনার মেম্বারশিপ টিয়ার (সিলভার ৮%, গোল্ড ১৫%, প্লাটিনাম ২৫%) অনুযায়ী প্রস্তাবিত মূল্য লিখে সাবমিট করুন।
            </p>
          </div>

          <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-black text-sm">
              ৩
            </div>
            <h4 className="font-extrabold text-slate-900 text-sm">তাৎক্ষণিক ছাড় ও অর্ডার</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              অনুমোদিত হওয়ার সাথে সাথে ওই স্পেশাল কম মূল্যে কার্টে যোগ করে অর্ডার সম্পন্ন করুন।
            </p>
          </div>
        </div>
      </div>

      {/* CARD ORDER & DELIVERY LOCATION MODAL */}
      {selectedPlanForOrder && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full border border-slate-200 shadow-2xl overflow-hidden text-left relative animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div
              className={`p-5 text-white flex items-center justify-between ${
                selectedPlanForOrder.tier === "Platinum"
                  ? "bg-gradient-to-r from-purple-950 via-slate-900 to-slate-950 border-b border-purple-500/40"
                  : selectedPlanForOrder.tier === "Gold"
                  ? "bg-gradient-to-r from-amber-900 via-yellow-950 to-slate-950 border-b border-amber-500/40"
                  : "bg-gradient-to-r from-slate-800 via-slate-900 to-indigo-950 border-b border-slate-700"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-white/10 rounded-xl border border-white/20">
                  <CreditCard className="w-5 h-5 text-amber-300" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base leading-tight">
                    {selectedPlanForOrder.name} ফিজিক্যাল কার্ড অর্ডার
                  </h3>
                  <p className="text-[11px] text-white/80">
                    কার্ড ডেলিভারির জন্য বিস্তারিত লোকেশন ও তথ্যাদি পূরণ করুন
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedPlanForOrder(null)}
                className="p-1.5 text-white/70 hover:text-white rounded-xl bg-white/10 hover:bg-white/20 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Order Form */}
            <form onSubmit={handleExecuteCardOrder} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
              {/* Fee & Delivery Summary Bar */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 grid grid-cols-3 gap-2 text-center text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block font-semibold">মেম্বারশিপ ফি</span>
                  <strong className="text-slate-900 font-black text-sm">
                    ৳{selectedPlanForOrder.price}
                  </strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-semibold">ডেলিভারি চার্জ</span>
                  <strong className="text-indigo-600 font-black text-sm">
                    {deliveryCharge === 0 ? "ফ্রি (৳০)" : `৳${deliveryCharge}`}
                  </strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-semibold">মোট প্রদেয়</span>
                  <strong className="text-emerald-700 font-black text-base">
                    ৳{totalPayable}
                  </strong>
                </div>
              </div>

              {/* Cardholder Name */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  কার্ডে যে নাম প্রিন্ট হবে (Cardholder Full Name) *
                </label>
                <input
                  type="text"
                  required
                  value={cardHolderName}
                  onChange={(e) => setCardHolderName(e.target.value)}
                  placeholder="যেমন: MD. SABBIR HOSSAIN"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold uppercase focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Phone & Alternative Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    মোবাইল নম্বর (ডেলিভারি ট্র্যাকিং) *
                  </label>
                  <input
                    type="tel"
                    required
                    value={recipientPhone}
                    onChange={(e) => setRecipientPhone(e.target.value)}
                    placeholder="017XXXXXXXX"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    বিকল্প মোবাইল নম্বর (ঐচ্ছিক)
                  </label>
                  <input
                    type="tel"
                    value={alternativePhone}
                    onChange={(e) => setAlternativePhone(e.target.value)}
                    placeholder="018XXXXXXXX"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Division & District */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    বিভাগ (Division) *
                  </label>
                  <select
                    value={selectedDivision}
                    onChange={(e: any) => setSelectedDivision(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Dhaka">ঢাকা (Dhaka)</option>
                    <option value="Chittagong">চট্টগ্রাম (Chittagong)</option>
                    <option value="Rajshahi">রাজশাহী (Rajshahi)</option>
                    <option value="Khulna">খুলনা (Khulna)</option>
                    <option value="Barisal">বরিশাল (Barisal)</option>
                    <option value="Sylhet">সিলেট (Sylhet)</option>
                    <option value="Rangpur">রংপুর (Rangpur)</option>
                    <option value="Mymensingh">ময়মনসিংহ (Mymensingh)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    জেলা (District) *
                  </label>
                  <input
                    type="text"
                    required
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    placeholder="যেমন: Dhaka"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    থানা / এরিয়া *
                  </label>
                  <input
                    type="text"
                    required
                    value={thanaOrArea}
                    onChange={(e) => setThanaOrArea(e.target.value)}
                    placeholder="যেমন: Dhanmondi"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Full Detailed Address */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  বিস্তারিত পূর্ণ ডেলিভারি ঠিকানা (বাসা/রোড/এলাকা) *
                </label>
                <textarea
                  rows={2}
                  required
                  value={fullAddress}
                  onChange={(e) => setFullAddress(e.target.value)}
                  placeholder="বাড়ি নং, রোড নং, ফ্ল্যাট বা ফ্লোর এবং নিকটস্থ পরিচিত স্থান..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Delivery Notes */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  ডেলিভারির জন্য বিশেষ নির্দেশনা (ঐচ্ছিক)
                </label>
                <input
                  type="text"
                  value={deliveryNotes}
                  onChange={(e) => setDeliveryNotes(e.target.value)}
                  placeholder="যেমন: বিকাল ৪টার পর ডেলিভারি দিন..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Payment Method Selector */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-2">
                  পেমেন্ট মাধ্যম নির্বাচন করুন *
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("bkash")}
                    className={`p-2.5 rounded-xl border text-center transition-all ${
                      paymentMethod === "bkash"
                        ? "bg-rose-50 border-rose-500 text-rose-800 font-bold ring-2 ring-rose-500/20"
                        : "bg-slate-50 border-slate-200 text-slate-700"
                    }`}
                  >
                    বিকাশ (bKash)
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("nagad")}
                    className={`p-2.5 rounded-xl border text-center transition-all ${
                      paymentMethod === "nagad"
                        ? "bg-amber-50 border-amber-500 text-amber-800 font-bold ring-2 ring-amber-500/20"
                        : "bg-slate-50 border-slate-200 text-slate-700"
                    }`}
                  >
                    নগদ (Nagad)
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("card")}
                    className={`p-2.5 rounded-xl border text-center transition-all ${
                      paymentMethod === "card"
                        ? "bg-indigo-50 border-indigo-500 text-indigo-800 font-bold ring-2 ring-indigo-500/20"
                        : "bg-slate-50 border-slate-200 text-slate-700"
                    }`}
                  >
                    কার্ড / ব্যাংক
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("cod")}
                    className={`p-2.5 rounded-xl border text-center transition-all ${
                      paymentMethod === "cod"
                        ? "bg-emerald-50 border-emerald-500 text-emerald-800 font-bold ring-2 ring-emerald-500/20"
                        : "bg-slate-50 border-slate-200 text-slate-700"
                    }`}
                  >
                    ক্যাশ অন ডেলিভারি
                  </button>
                </div>
              </div>

              {/* Final Submit & Confirmation */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                <div>
                  <span className="text-[10px] text-slate-400 block font-semibold">
                    মোট প্রদেয় মূল্য (ডেলিভারিসহ)
                  </span>
                  <span className="text-xl font-black text-slate-900 font-mono">
                    ৳{totalPayable}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedPlanForOrder(null)}
                    className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
                  >
                    বাতিল
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingOrder}
                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-md transition flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
                  >
                    {isSubmittingOrder ? (
                      <span>অর্ডার হচ্ছে...</span>
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        <span>অর্ডার নিশ্চিত করুন</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
