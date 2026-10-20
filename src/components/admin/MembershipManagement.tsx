import React, { useState, useMemo } from "react";
import { useStore } from "../../context/StoreContext";
import { MembershipCardOrder, MembershipPlan, PriceCompromiseOffer, MembershipTier } from "../../types";
import {
  Crown,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Truck,
  CreditCard,
  Tag,
  Search,
  Filter,
  Eye,
  Sliders,
  DollarSign,
  Download,
  FileSpreadsheet,
  Edit,
  Check,
  X,
  Plus,
  Send,
  Sparkles,
  Layers,
  MapPin,
  Phone,
  User,
  ChevronRight,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import { exportToCSV } from "../../utils/exportUtils";

export const MembershipManagement: React.FC = () => {
  const {
    membershipPlans,
    membershipCardOrders,
    priceCompromiseOffers,
    updateCardOrderStatus,
    updatePriceCompromiseStatus,
    updateMembershipPlan,
    addToast,
    settings,
  } = useStore();

  const [activeTab, setActiveTab] = useState<
    "card-orders" | "compromise-requests" | "tier-config"
  >("card-orders");

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState("");
  const [tierFilter, setTierFilter] = useState<string>("All");
  const [statusFilter, setStatusFilter] = useState<string>("All");

  // Preview Card Modal State
  const [previewingCardOrder, setPreviewingCardOrder] = useState<MembershipCardOrder | null>(null);

  // Edit Plan Modal State
  const [editingPlan, setEditingPlan] = useState<MembershipPlan | null>(null);

  // Counter-offer prompt state
  const [counterOfferTarget, setCounterOfferTarget] = useState<PriceCompromiseOffer | null>(null);
  const [counterPriceInput, setCounterPriceInput] = useState<number>(0);
  const [counterNoteInput, setCounterNoteInput] = useState<string>("");

  // Filtered Card Orders
  const filteredCardOrders = useMemo(() => {
    return membershipCardOrders.filter((order) => {
      const matchSearch =
        order.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.cardNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.userPhone.includes(searchTerm) ||
        order.deliveryAddress.fullAddress.toLowerCase().includes(searchTerm.toLowerCase());

      const matchTier = tierFilter === "All" || order.tier === tierFilter;
      const matchStatus = statusFilter === "All" || order.cardStatus === statusFilter;

      return matchSearch && matchTier && matchStatus;
    });
  }, [membershipCardOrders, searchTerm, tierFilter, statusFilter]);

  // Filtered Price Compromise Offers
  const filteredCompromiseOffers = useMemo(() => {
    return priceCompromiseOffers.filter((offer) => {
      const matchSearch =
        offer.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        offer.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        offer.userPhone.includes(searchTerm);

      const matchStatus = statusFilter === "All" || offer.status === statusFilter;
      const matchTier = tierFilter === "All" || offer.userTier === tierFilter;

      return matchSearch && matchStatus && matchTier;
    });
  }, [priceCompromiseOffers, searchTerm, statusFilter, tierFilter]);

  const handleExportCardOrders = () => {
    const rows = membershipCardOrders.map((o) => ({
      "Order ID": o.id,
      "Card Number": o.cardNumber,
      "Customer Name": o.userName,
      Phone: o.userPhone,
      Tier: o.tier,
      "Membership Fee": o.membershipFee,
      "Delivery Charge": o.deliveryCharge,
      "Total Amount": o.totalAmount,
      "Delivery Address": `${o.deliveryAddress.fullAddress}, ${o.deliveryAddress.thanaOrArea}, ${o.deliveryAddress.district}`,
      "Payment Method": o.paymentMethod,
      "Payment Status": o.paymentStatus,
      "Card Delivery Status": o.cardStatus,
      "Valid Until": o.validUntil,
      "Created At": o.createdAt,
    }));
    exportToCSV(`membership_card_orders_${Date.now()}.csv`, rows);
    addToast("মেম্বারশিপ কার্ড অর্ডারের এক্সেল/CSV সফলভাবে ডাউনলোড হয়েছে।", "success");
  };

  const handleSavePlanEdits = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPlan) return;
    updateMembershipPlan(editingPlan.id, editingPlan);
    setEditingPlan(null);
  };

  const handleSendCounterOffer = () => {
    if (!counterOfferTarget || counterPriceInput <= 0) return;
    updatePriceCompromiseStatus(
      counterOfferTarget.id,
      "Counter-Offered",
      counterPriceInput,
      counterNoteInput || "অ্যাডমিনের পক্ষ থেকে বিশেষ কাউন্টার অফার প্রদান করা হয়েছে।"
    );
    setCounterOfferTarget(null);
  };

  return (
    <div className="space-y-6 text-left">
      {/* Executive Command Header */}
      <div className="bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 p-6 rounded-3xl border border-indigo-800/40 text-white shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-500/20 border border-amber-400/30 rounded-xl text-amber-300">
              <Crown className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight flex items-center gap-2">
                মেম্বারশিপ কার্ড ও প্রাইস কম্প্রোমাইজ কমান্ড সেন্টার
                <span className="text-[11px] font-bold text-amber-300 bg-amber-950/80 px-2.5 py-0.5 rounded-full border border-amber-700/50">
                  VIP Club Operations
                </span>
              </h1>
              <p className="text-xs text-slate-300 max-w-2xl">
                ৩টি ক্যাটাগরির মেম্বারশিপ প্ল্যান, ফিজিক্যাল কার্ড ডেলিভারি ট্র্যাকিং ও গ্রাহকদের স্পেশাল দরদাম (প্রাইস কম্প্রোমাইজ) অনুমোদন।
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleExportCardOrders}
            className="bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl border border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" /> এক্সেল এক্সপোর্ট
          </button>
        </div>
      </div>

      {/* High-Level Overview Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            মোট মেম্বারশিপ কার্ড
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-slate-900">
              {membershipCardOrders.length}
            </span>
            <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded">
              সব টিয়ার
            </span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            প্রিন্টিং ও কুরিয়ারে প্রস্তুত
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-amber-600">
              {membershipCardOrders.filter((o) => o.cardStatus === "Printing" || o.cardStatus === "Card Ready").length}
            </span>
            <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded flex items-center gap-0.5">
              <Truck className="w-3 h-3" /> ডেলিভারি পেন্ডিং
            </span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            সক্রিয় ও ডেলিভার্ড মেম্বার
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-emerald-600">
              {membershipCardOrders.filter((o) => o.cardStatus === "Delivered" || o.cardStatus === "Active").length}
            </span>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
              Active VIP
            </span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            দরদাম (Compromise) রিকোয়েস্ট
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-purple-700">
              {priceCompromiseOffers.filter((p) => p.status === "Pending").length}
            </span>
            <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded">
              পেন্ডিং
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs Bar */}
      <div className="bg-white p-1.5 rounded-2xl border border-slate-200 shadow-2xs flex flex-wrap gap-1">
        <button
          type="button"
          onClick={() => setActiveTab("card-orders")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
            activeTab === "card-orders"
              ? "bg-indigo-600 text-white shadow-xs"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>ফিজিক্যাল কার্ড ডেলিভারি ও অর্ডার ({membershipCardOrders.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("compromise-requests")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
            activeTab === "compromise-requests"
              ? "bg-indigo-600 text-white shadow-xs"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>প্রাইস কম্প্রোমাইজ (দরদাম) ডেস্ক ({priceCompromiseOffers.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("tier-config")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
            activeTab === "tier-config"
              ? "bg-indigo-600 text-white shadow-xs"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <Sliders className="w-4 h-4 text-purple-400" />
          <span>৩টি মেম্বারশিপ টিয়ার প্ল্যান কনফিগারেশন</span>
        </button>
      </div>

      {/* TAB 1: CARD ORDERS & DELIVERY LOGISTICS */}
      {activeTab === "card-orders" && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs space-y-4 p-5">
          {/* Controls Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div className="relative flex-1 min-w-[240px]">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="গ্রাহকের নাম, কার্ড নম্বর, ফোন বা ঠিকানা খুঁজুন..."
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={tierFilter}
                onChange={(e) => setTierFilter(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 outline-none"
              >
                <option value="All">সকল টিয়ার</option>
                <option value="Silver">সিলভার (Silver)</option>
                <option value="Gold">গোল্ড (Gold)</option>
                <option value="Platinum">প্লাটিনাম (Platinum)</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 outline-none"
              >
                <option value="All">সকল স্ট্যাটাস</option>
                <option value="Printing">Printing</option>
                <option value="Card Ready">Card Ready</option>
                <option value="Dispatched">Dispatched</option>
                <option value="Delivered">Delivered</option>
                <option value="Active">Active</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="p-3">কার্ড নম্বর ও গ্রাহক</th>
                  <th className="p-3">টিয়ার</th>
                  <th className="p-3">ডেলিভারি লোকেশন ও ফোন</th>
                  <th className="p-3 text-right">ফি ও চার্জ</th>
                  <th className="p-3 text-center">পেমেন্ট</th>
                  <th className="p-3 text-center">ডেলিভারি স্ট্যাটাস</th>
                  <th className="p-3 text-center">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCardOrders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-400">
                      কোনো মেম্বারশিপ কার্ড অর্ডার পাওয়া যায়নি।
                    </td>
                  </tr>
                ) : (
                  filteredCardOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3">
                        <div className="space-y-0.5">
                          <span className="font-mono font-black text-indigo-700 text-xs block">
                            {order.cardNumber}
                          </span>
                          <span className="font-bold text-slate-900 block truncate max-w-xs">
                            {order.userName} ({order.cardHolderName})
                          </span>
                          <span className="text-[10px] text-slate-400">
                            মেয়াদ: {order.validUntil}
                          </span>
                        </div>
                      </td>

                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                            order.tier === "Platinum"
                              ? "bg-purple-100 text-purple-900 border border-purple-300"
                              : order.tier === "Gold"
                              ? "bg-amber-100 text-amber-900 border border-amber-300"
                              : "bg-slate-100 text-slate-800 border border-slate-300"
                          }`}
                        >
                          {order.tier} VIP
                        </span>
                      </td>

                      <td className="p-3">
                        <div className="space-y-0.5 max-w-xs">
                          <span className="font-semibold text-slate-800 block truncate">
                            {order.deliveryAddress.fullAddress}
                          </span>
                          <span className="text-[10px] text-slate-500 block">
                            {order.deliveryAddress.thanaOrArea}, {order.deliveryAddress.district} ({order.deliveryAddress.division})
                          </span>
                          <span className="text-[10px] text-indigo-600 font-mono font-bold block">
                            📞 {order.userPhone}
                          </span>
                        </div>
                      </td>

                      <td className="p-3 text-right">
                        <div className="space-y-0.5">
                          <span className="font-black text-slate-900 text-xs font-mono block">
                            ৳{order.totalAmount}
                          </span>
                          <span className="text-[10px] text-slate-400 block font-mono">
                            ফি: ৳{order.membershipFee} + ডেলি: ৳{order.deliveryCharge}
                          </span>
                        </div>
                      </td>

                      <td className="p-3 text-center">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            order.paymentStatus === "paid"
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {order.paymentStatus === "paid" ? "Paid" : "COD"}
                        </span>
                      </td>

                      <td className="p-3 text-center">
                        <select
                          value={order.cardStatus}
                          onChange={(e: any) => updateCardOrderStatus(order.id, e.target.value)}
                          className="bg-slate-50 border border-slate-200 text-slate-800 rounded-lg px-2 py-1 text-[11px] font-bold outline-none cursor-pointer"
                        >
                          <option value="Printing">Printing</option>
                          <option value="Card Ready">Card Ready</option>
                          <option value="Dispatched">Dispatched</option>
                          <option value="Delivered">Delivered</option>
                          <option value="Active">Active</option>
                        </select>
                      </td>

                      <td className="p-3 text-center">
                        <button
                          type="button"
                          onClick={() => setPreviewingCardOrder(order)}
                          className="p-1.5 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-lg transition"
                          title="কার্ড প্রিভিউ ও প্রিন্ট"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: PRICE COMPROMISE REQUESTS DESK */}
      {activeTab === "compromise-requests" && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs space-y-4 p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm">
                গ্রাহকদের স্পেশাল দরদাম (Price Compromise) রিকোয়েস্ট ডেস্ক
              </h3>
              <p className="text-xs text-slate-400">
                মেম্বার কাস্টমারদের প্রস্তাবিত দরদাম এক ক্লিকে অনুমোদন বা কাউন্টার অফার দিন।
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="p-3">পণ্য ও গ্রাহক</th>
                  <th className="p-3">মেম্বারশিপ টিয়ার</th>
                  <th className="p-3 text-right">মূল দাম</th>
                  <th className="p-3 text-right">গ্রাহকের প্রস্তাব</th>
                  <th className="p-3 text-right">অনুমোদিত মূল্য</th>
                  <th className="p-3 text-center">স্ট্যাটাস</th>
                  <th className="p-3 text-center">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCompromiseOffers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-400">
                      কোনো প্রাইস কম্প্রোমাইজ রিকোয়েস্ট নেই।
                    </td>
                  </tr>
                ) : (
                  filteredCompromiseOffers.map((offer) => (
                    <tr key={offer.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3">
                        <div className="flex items-center gap-2.5">
                          {offer.productImage && (
                            <img
                              src={offer.productImage}
                              alt=""
                              className="w-10 h-10 object-cover rounded-lg border border-slate-200 shrink-0"
                            />
                          )}
                          <div className="space-y-0.5">
                            <span className="font-extrabold text-slate-900 block truncate max-w-xs">
                              {offer.productName}
                            </span>
                            <span className="text-[10px] text-slate-500 font-medium block">
                              গ্রাহক: {offer.userName} ({offer.userPhone})
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-indigo-50 text-indigo-700 border border-indigo-200">
                          {offer.userTier} VIP
                        </span>
                      </td>

                      <td className="p-3 text-right font-mono font-bold text-slate-500">
                        ৳{offer.originalPrice.toLocaleString()}
                      </td>

                      <td className="p-3 text-right font-mono font-black text-rose-600">
                        ৳{offer.requestedPrice.toLocaleString()}
                      </td>

                      <td className="p-3 text-right font-mono font-black text-emerald-700">
                        {offer.approvedPrice ? `৳${offer.approvedPrice.toLocaleString()}` : "—"}
                      </td>

                      <td className="p-3 text-center">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            offer.status === "Approved"
                              ? "bg-emerald-100 text-emerald-800"
                              : offer.status === "Counter-Offered"
                              ? "bg-blue-100 text-blue-800"
                              : offer.status === "Pending"
                              ? "bg-amber-100 text-amber-800"
                              : "bg-rose-100 text-rose-800"
                          }`}
                        >
                          {offer.status}
                        </span>
                      </td>

                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {offer.status === "Pending" && (
                            <>
                              <button
                                type="button"
                                onClick={() =>
                                  updatePriceCompromiseStatus(
                                    offer.id,
                                    "Approved",
                                    offer.requestedPrice,
                                    "অ্যাডমিন সরাসরি অনুমোদন দিয়েছেন।"
                                  )
                                }
                                className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold rounded-lg transition"
                              >
                                অনুমোদন
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setCounterOfferTarget(offer);
                                  setCounterPriceInput(
                                    Math.round((offer.originalPrice + offer.requestedPrice) / 2)
                                  );
                                }}
                                className="px-2 py-1 bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-bold rounded-lg transition"
                              >
                                কাউন্টার অফার
                              </button>
                            </>
                          )}
                          {offer.status !== "Rejected" && offer.status !== "Approved" && (
                            <button
                              type="button"
                              onClick={() =>
                                updatePriceCompromiseStatus(
                                  offer.id,
                                  "Rejected",
                                  0,
                                  "মার্জিন ও স্টকের সীমাবদ্ধতার কারণে গৃহীত হয়নি।"
                                )
                              }
                              className="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 text-[10px] font-bold rounded-lg transition"
                            >
                              বাতিল
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: TIER CONFIGURATOR */}
      {activeTab === "tier-config" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {membershipPlans.map((plan) => (
              <div
                key={plan.id}
                className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border ${plan.badgeColor}`}>
                      {plan.tier} Tier
                    </span>
                    <button
                      type="button"
                      onClick={() => setEditingPlan({ ...plan })}
                      className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                    >
                      <Edit className="w-3.5 h-3.5" /> এডিট
                    </button>
                  </div>

                  <h4 className="text-base font-black text-slate-900">{plan.name}</h4>

                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5 text-xs text-slate-700">
                    <div className="flex justify-between">
                      <span className="text-slate-500">মেম্বারশিপ ফি:</span>
                      <strong className="font-mono text-slate-900">৳{plan.price}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">ইনস্ট্যান্ট ডিসকাউন্ট:</span>
                      <strong className="font-mono text-emerald-600">{plan.discountPercent}%</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">প্রাইস কম্প্রোমাইজ লিমিট:</span>
                      <strong className="font-mono text-indigo-600">Up to {plan.priceCompromiseMaxPercent}%</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">ডেলিভারি চার্জ (ঢাকা):</span>
                      <strong className="font-mono">{plan.deliveryChargeDhaka === 0 ? "ফ্রি" : `৳${plan.deliveryChargeDhaka}`}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">ডেলিভারি চার্জ (বাইরে):</span>
                      <strong className="font-mono">{plan.deliveryChargeOutside === 0 ? "ফ্রি" : `৳${plan.deliveryChargeOutside}`}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">ফ্রি ডেলিভারি থ্রেশহোল্ড:</span>
                      <strong className="font-mono">{plan.freeDeliveryThreshold === 0 ? "সব অর্ডারে" : `৳${plan.freeDeliveryThreshold}+`}</strong>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setEditingPlan({ ...plan })}
                  className="w-full py-2 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 font-bold text-xs rounded-xl transition"
                >
                  ফি ও ছাড় কনফিগার করুন
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* EDIT PLAN MODAL */}
      {editingPlan && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-black text-slate-900 text-sm">
                {editingPlan.name} কনফিগারেশন
              </h3>
              <button
                type="button"
                onClick={() => setEditingPlan(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePlanEdits} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">মেম্বারশিপ ফি (ছোট প্রাইস ৳)</label>
                <input
                  type="number"
                  value={editingPlan.price}
                  onChange={(e) => setEditingPlan({ ...editingPlan, price: parseInt(e.target.value) || 0 })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">অতিরিক্ত ডিসকাউন্ট (%)</label>
                  <input
                    type="number"
                    value={editingPlan.discountPercent}
                    onChange={(e) => setEditingPlan({ ...editingPlan, discountPercent: parseInt(e.target.value) || 0 })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">কম্প্রোমাইজ লিমিট (%)</label>
                  <input
                    type="number"
                    value={editingPlan.priceCompromiseMaxPercent}
                    onChange={(e) => setEditingPlan({ ...editingPlan, priceCompromiseMaxPercent: parseInt(e.target.value) || 0 })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">ডেলিভারি চার্জ (ঢাকা ৳)</label>
                  <input
                    type="number"
                    value={editingPlan.deliveryChargeDhaka}
                    onChange={(e) => setEditingPlan({ ...editingPlan, deliveryChargeDhaka: parseInt(e.target.value) || 0 })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">ডেলিভারি চার্জ (বাইরে ৳)</label>
                  <input
                    type="number"
                    value={editingPlan.deliveryChargeOutside}
                    onChange={(e) => setEditingPlan({ ...editingPlan, deliveryChargeOutside: parseInt(e.target.value) || 0 })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">ফ্রি ডেলিভারি থ্রেশহোল্ড (৳)</label>
                <input
                  type="number"
                  value={editingPlan.freeDeliveryThreshold}
                  onChange={(e) => setEditingPlan({ ...editingPlan, freeDeliveryThreshold: parseInt(e.target.value) || 0 })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingPlan(null)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 font-bold text-xs rounded-xl"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs"
                >
                  সংরক্ষণ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* COUNTER OFFER PROMPT MODAL */}
      {counterOfferTarget && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="font-black text-slate-900 text-sm">
              কাউন্টার অফার পাঠান ({counterOfferTarget.userName})
            </h3>
            <p className="text-xs text-slate-500">
              মূল্য ছিল ৳{counterOfferTarget.originalPrice} • গ্রাহক চেয়েছেন ৳{counterOfferTarget.requestedPrice}
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">আপনার প্রস্তাবিত কাউন্টার মূল্য (৳)</label>
                <input
                  type="number"
                  value={counterPriceInput}
                  onChange={(e) => setCounterPriceInput(parseInt(e.target.value) || 0)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-black text-indigo-900"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">গ্রাহকের জন্য নোট / বার্তা</label>
                <input
                  type="text"
                  value={counterNoteInput}
                  onChange={(e) => setCounterNoteInput(e.target.value)}
                  placeholder="যেমন: আমরা ৳XX মূল্যে সাথে ১টি ফ্রি গিফট দিতে প্রস্তুত..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setCounterOfferTarget(null)}
                className="px-4 py-2 bg-slate-100 text-slate-700 font-bold text-xs rounded-xl"
              >
                বাতিল
              </button>
              <button
                type="button"
                onClick={handleSendCounterOffer}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs"
              >
                কাউন্টার অফার কনফার্ম করুন
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PHYSICAL CARD PREVIEW & PRINT MODAL */}
      {previewingCardOrder && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-black text-slate-900 text-sm">
                  ফিজিক্যাল মেম্বারশিপ কার্ড প্রিন্ট লেবেল
                </h3>
                <span className="text-[11px] text-slate-400 font-mono">
                  Order ID: {previewingCardOrder.id}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setPreviewingCardOrder(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Visual Card Display */}
            <div
              className={`p-6 rounded-2xl text-white shadow-xl flex flex-col justify-between h-52 relative overflow-hidden border ${
                previewingCardOrder.tier === "Platinum"
                  ? "bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900 border-purple-500/40"
                  : previewingCardOrder.tier === "Gold"
                  ? "bg-gradient-to-br from-amber-700 via-yellow-700 to-amber-950 border-amber-400"
                  : "bg-gradient-to-br from-slate-700 via-slate-600 to-slate-900 border-slate-400"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black tracking-widest uppercase">
                  SMART SHOP VIP CLUB
                </span>
                <span className="text-[9px] font-mono px-2 py-0.5 bg-white/20 rounded-md backdrop-blur-xs font-bold">
                  {previewingCardOrder.tier.toUpperCase()}
                </span>
              </div>

              <div className="w-10 h-7 bg-gradient-to-br from-amber-200 via-yellow-400 to-amber-500 rounded border border-amber-600/50 shadow-inner flex items-center justify-center">
                <div className="w-6 h-4 border border-amber-900/30 rounded-xs" />
              </div>

              <div>
                <span className="text-base sm:text-lg font-mono tracking-widest font-black block">
                  {previewingCardOrder.cardNumber}
                </span>
                <div className="flex items-center justify-between text-[11px] text-white/90 pt-1 font-bold">
                  <span className="uppercase">{previewingCardOrder.cardHolderName}</span>
                  <span className="font-mono">EXP: {previewingCardOrder.validUntil}</span>
                </div>
              </div>
            </div>

            {/* Delivery Dispatch Info Box */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-1.5">
              <div className="flex items-center gap-1.5 text-slate-800 font-bold">
                <MapPin className="w-3.5 h-3.5 text-indigo-600" />
                <span>প্রাপকের পূর্ণ ডেলিভারি ঠিকানা:</span>
              </div>
              <p className="text-slate-600 pl-5">
                {previewingCardOrder.deliveryAddress.fullAddress}, {previewingCardOrder.deliveryAddress.thanaOrArea}, {previewingCardOrder.deliveryAddress.district} ({previewingCardOrder.deliveryAddress.division})
              </p>
              <div className="flex items-center gap-4 pl-5 text-[11px] text-slate-500 pt-1">
                <span>ফোন: <strong>{previewingCardOrder.deliveryAddress.phone}</strong></span>
                {previewingCardOrder.deliveryAddress.alternativePhone && (
                  <span>বিকল্প: <strong>{previewingCardOrder.deliveryAddress.alternativePhone}</strong></span>
                )}
              </div>
              {previewingCardOrder.deliveryAddress.deliveryNotes && (
                <div className="pl-5 text-[11px] text-amber-700 font-medium">
                  নির্দেশনা: {previewingCardOrder.deliveryAddress.deliveryNotes}
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setPreviewingCardOrder(null)}
                className="px-4 py-2 bg-slate-100 text-slate-700 font-bold text-xs rounded-xl"
              >
                বন্ধ করুন
              </button>
              <button
                type="button"
                onClick={() => {
                  window.print();
                  addToast("প্রিন্টার ডায়ালগ ওপেন হয়েছে।", "info");
                }}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs"
              >
                প্রিন্ট কার্ড ও কুরিয়ার লেবেল
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
