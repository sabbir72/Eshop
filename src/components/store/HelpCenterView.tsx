import React, { useState } from "react";
import { useStore } from "../../context/StoreContext";
import {
  HelpCircle,
  Search,
  ThumbsUp,
  ThumbsDown,
  RotateCcw,
  MessageSquare,
  Plus,
  Send,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  FileText,
  Crown,
  CreditCard,
  Sparkles,
  Truck,
  Tag,
  Award,
  Zap,
  Check,
  Flame,
  MapPin,
  Phone,
  Clock,
  User,
  ShoppingBag,
  X,
  ChevronRight,
  AlertCircle,
  ExternalLink,
  PackageCheck,
  Shield,
} from "lucide-react";
import {
  ReturnRequest,
  SupportTicket,
  MembershipPlan,
  MembershipTier,
  MembershipCardOrder,
} from "../../types";

interface HelpCenterViewProps {
  initialTab?: "membership" | "faq" | "returns" | "tickets";
}

export const HelpCenterView: React.FC<HelpCenterViewProps> = ({
  initialTab = "membership",
}) => {
  const {
    faqCategories,
    faqItemsExt,
    voteFAQ,
    returnRequests,
    addReturnRequest,
    supportTickets,
    addSupportTicket,
    addTicketMessage,
    currentUser,
    orders,
    membershipPlans,
    membershipCardOrders,
    orderMembershipCard,
    cancelMembership,
    addToast,
    settings,
    setStoreView,
  } = useStore();

  const siteName = settings.websiteName || settings.siteName || "SmartShop";

  const [activeTab, setActiveTab] = useState<
    "membership" | "faq" | "returns" | "tickets"
  >(initialTab);
  const [selectedCatId, setSelectedCatId] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [openFaqId, setOpenFaqId] = useState<string | null>(null);

  // Membership & Physical Card State
  const userMembership = currentUser?.membership;
  const isMember = !!userMembership && userMembership.status === "active";
  const [selectedPlanForOrder, setSelectedPlanForOrder] = useState<MembershipPlan | null>(null);
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
    currentUser?.address || "House 12, Road 4, Dhanmondi, Dhaka"
  );
  const [deliveryNotes, setDeliveryNotes] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"cod" | "bkash" | "nagad" | "card">("bkash");
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);

  // Delivery charge calculation
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

  const userLatestCardOrder = membershipCardOrders.find(
    (order) => order.userId === currentUser.id || order.cardNumber === userMembership?.cardNumber
  );

  const handleOpenOrderModal = (plan: MembershipPlan) => {
    setSelectedPlanForOrder(plan);
    setCardHolderName(currentUser?.name || "Sabbir Hossain");
    setRecipientPhone(currentUser?.phone || "01712345678");
  };

  const handleExecuteCardOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlanForOrder) return;

    if (!cardHolderName.trim()) {
      addToast("কার্ডে খোদাই করার নাম লিখুন।", "error");
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
      addToast(
        `অভিনন্দন! আপনার ${selectedPlanForOrder.tier} মেম্বারশিপ কার্ড অর্ডার সফল হয়েছে। কাস্টমার কেয়ার টিম দ্রুত ডেলিভারি নিশ্চিত করবে।`,
        "success"
      );
    }, 600);
  };

  const handleOpenMembershipTicket = (subject: string, message: string) => {
    setTicketCategory("Account");
    setTicketSubject(subject);
    setTicketMessage(message);
    setTicketPriority("High");
    setShowTicketModal(true);
  };

  // New Support Ticket Modal
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [ticketCategory, setTicketCategory] = useState<SupportTicket["category"]>("General");
  const [ticketSubject, setTicketSubject] = useState("");
  const [ticketMessage, setTicketMessage] = useState("");
  const [ticketPriority, setTicketPriority] = useState<SupportTicket["priority"]>("Medium");
  const [ticketSubmitted, setTicketSubmitted] = useState(false);

  // Active Ticket Viewer
  const [activeTicket, setActiveTicket] = useState<SupportTicket | null>(null);
  const [ticketReply, setTicketReply] = useState("");

  // FAQ Filter
  const filteredFaqs = faqItemsExt.filter((f) => {
    if (!f.isPublished) return false;
    if (selectedCatId !== "all" && f.categoryId !== selectedCatId) return false;
    if (
      searchQuery &&
      !f.question.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !f.answer.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  const handleTicketSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketSubject || !ticketMessage) return;

    addSupportTicket(
      {
        customerId: currentUser.id,
        customerName: currentUser.name,
        customerEmail: currentUser.email,
        subject: ticketSubject,
        category: ticketCategory,
        priority: ticketPriority,
      },
      ticketMessage
    );

    setTicketSubmitted(true);
    setTicketSubject("");
    setTicketMessage("");
  };

  const handleCustomerReply = () => {
    if (!activeTicket || !ticketReply.trim()) return;
    addTicketMessage(
      activeTicket.id,
      "Customer",
      currentUser.name,
      ticketReply
    );
    setTicketReply("");
    const refreshed = supportTickets.find((t) => t.id === activeTicket.id);
    if (refreshed) setActiveTicket(refreshed);
  };

  return (
    <div className="min-h-screen bg-slate-50/50 py-12 px-4">
      <div className="max-w-6xl mx-auto space-y-10">
        {/* Header Hero */}
        <div className="text-center space-y-4">
          <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-bold uppercase tracking-wider">
            Customer Care & Help Center
          </span>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900">How Can We Help You Today?</h1>

          {/* Search Box */}
          <div className="max-w-xl mx-auto relative">
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-3.5" />
            <input
              type="text"
              placeholder="Search knowledge base articles, orders, or return policy..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-2xl pl-12 pr-4 py-3 text-sm shadow-sm outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Navigation Tabs (Customer Care Hub) */}
        <div className="flex items-center justify-center flex-wrap gap-2.5">
          <button
            onClick={() => setActiveTab("membership")}
            className={`px-5 py-2.5 rounded-2xl text-sm font-black transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === "membership"
                ? "bg-gradient-to-r from-amber-500 via-amber-600 to-indigo-600 text-white shadow-lg ring-2 ring-amber-400/40"
                : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            <Crown className="w-4 h-4 text-amber-300" />
            <span>৩টি মেম্বারশিপ ও ফিজিক্যাল কার্ড ক্লাব</span>
            <span className="text-[9px] uppercase tracking-wider font-mono font-black bg-slate-950 text-amber-400 px-2 py-0.5 rounded-full">
              VIP Club
            </span>
          </button>
          <button
            onClick={() => setActiveTab("faq")}
            className={`px-5 py-2.5 rounded-2xl text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === "faq"
                ? "bg-indigo-600 text-white shadow-md"
                : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            <HelpCircle className="w-4 h-4" /> FAQs & সাধারণ তথ্য
          </button>
          <button
            onClick={() => setActiveTab("returns")}
            className={`px-5 py-2.5 rounded-2xl text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === "returns"
                ? "bg-indigo-600 text-white shadow-md"
                : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            <RotateCcw className="w-4 h-4" /> ৭ দিনের রিটার্ন ও রিফান্ড পলিসি
          </button>
          <button
            onClick={() => setActiveTab("tickets")}
            className={`px-5 py-2.5 rounded-2xl text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === "tickets"
                ? "bg-indigo-600 text-white shadow-md"
                : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            <MessageSquare className="w-4 h-4" /> কাস্টমার সাপোর্ট টিকিট
          </button>
        </div>

        {/* TAB: 3 MEMBERSHIP CATEGORIES & PHYSICAL CARD CLUB (CUSTOMER CARE DECK) */}
        {activeTab === "membership" && (
          <div className="space-y-8 text-left animate-fadeIn">
            {/* Top Sub-Hero Banner */}
            <div className="bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 border border-indigo-800/40 text-white shadow-xl relative overflow-hidden">
              <div className="absolute right-0 top-0 bottom-0 w-96 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-amber-500/20 via-transparent to-transparent pointer-events-none" />

              <div className="max-w-3xl space-y-3 relative z-10">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="p-2 bg-amber-500/20 border border-amber-400/40 rounded-xl text-amber-300">
                    <Crown className="w-5 h-5" />
                  </span>
                  <span className="text-[11px] font-black uppercase tracking-wider text-amber-300 bg-amber-950/80 px-3 py-0.5 rounded-full border border-amber-700/50">
                    Customer Care VIP Desk
                  </span>
                  <span className="text-[10px] font-bold text-emerald-300 bg-emerald-950/80 px-2.5 py-0.5 rounded-full border border-emerald-600/40">
                    ফিজিক্যাল মেম্বারশিপ কার্ড সাপোর্ট
                  </span>
                </div>

                <h2 className="text-xl sm:text-3xl font-black tracking-tight text-white leading-tight">
                  ৩টি মেম্বারশিপ ক্যাটাগরি ও ফিজিক্যাল কার্ড ক্লাব
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  স্মার্টশপ প্রিমিয়াম মেম্বারশিপ ক্লাবে যোগ দিন এবং আপনার ঠিকানায় সংগ্রহ করুন নিজস্ব ফিজিক্যাল মেম্বারশিপ কার্ড। প্রতিটি অর্ডারে ৩% থেকে ১২% নিশ্চিত ক্যাশব্যাক, সারা দেশে ফ্রি ডেলিভারি, সরাসরি দরদাম সুবিধা ও প্রায়োরিটি কাস্টমার কেয়ার হেল্পলাইন।
                </p>

                <div className="flex flex-wrap items-center gap-4 pt-2 text-xs font-semibold text-slate-300">
                  <span className="flex items-center gap-1.5 text-emerald-400">
                    <Truck className="w-4 h-4" /> দ্রুততম ফিজিক্যাল কার্ড হোম ডেলিভারি
                  </span>
                  <span className="flex items-center gap-1.5 text-amber-300">
                    <Tag className="w-4 h-4" /> এক্সক্লুসিভ মেম্বার ডিসকাউন্ট
                  </span>
                  <span className="flex items-center gap-1.5 text-indigo-300">
                    <Sparkles className="w-4 h-4" /> বিশেষ প্রাইস কম্প্রোমাইজ সুবিধা
                  </span>
                </div>
              </div>
            </div>

            {/* ACTIVE MEMBERSHIP STATUS OR PHYSICAL CARD PREVIEW */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full inline-block mb-1">
                    Member Identity Card
                  </span>
                  <h3 className="text-lg font-black text-slate-900">
                    {isMember
                      ? `আপনার সক্রিয় মেম্বারশিপ: ${userMembership?.tier} VIP Club`
                      : "আপনার নিজস্ব ফিজিক্যাল মেম্বারশিপ কার্ড"}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {isMember
                      ? `কার্ড নম্বর: ${userMembership?.cardNumber} • মেয়াদ: ${userMembership?.validUntil} পর্যন্ত সক্রিয়`
                      : "যেকোনো একটি ক্যাটাগরি বেছে নিন এবং ঘরে বসে সংগ্রহ করুন স্মার্ট মেটালিক ফিজিক্যাল কার্ড।"}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {isMember ? (
                    <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-xl flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      ভেরিফাইড মেম্বার একাউন্ট
                    </span>
                  ) : (
                    <span className="px-3 py-1 bg-amber-100 text-amber-800 text-xs font-bold rounded-xl flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-amber-600" />
                      মেম্বারশিপ সক্রিয় করুন
                    </span>
                  )}
                </div>
              </div>

              {/* Holographic Card Visual Representation */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                <div className="lg:col-span-5 flex justify-center">
                  <div
                    className={`w-full max-w-sm aspect-[1.586/1] rounded-3xl p-6 text-white shadow-2xl relative overflow-hidden transition-transform transform hover:scale-105 duration-300 ${
                      userMembership?.tier === "Platinum"
                        ? "bg-gradient-to-tr from-slate-950 via-purple-950 to-slate-900 border-2 border-purple-400/40"
                        : userMembership?.tier === "Gold"
                        ? "bg-gradient-to-tr from-amber-700 via-amber-500 to-yellow-300 text-slate-950 border-2 border-amber-300/60"
                        : "bg-gradient-to-tr from-slate-800 via-slate-600 to-slate-500 border-2 border-slate-300/40"
                    }`}
                  >
                    {/* Background Pattern */}
                    <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

                    <div className="relative z-10 flex flex-col justify-between h-full">
                      {/* Card Header */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Crown className="w-6 h-6" />
                          <span className="font-black text-sm tracking-widest uppercase">
                            {siteName} VIP
                          </span>
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full border border-current bg-black/10">
                          {userMembership?.tier || "CLUB MEMBER"}
                        </span>
                      </div>

                      {/* Chip & NFC symbol */}
                      <div className="flex items-center gap-3 my-2">
                        <div className="w-10 h-7 rounded-md bg-gradient-to-br from-amber-200 via-amber-400 to-amber-600 border border-amber-300/80 shadow-xs flex items-center justify-center">
                          <div className="w-7 h-5 border border-amber-800/40 rounded-xs opacity-70" />
                        </div>
                        <span className="text-xs opacity-70 font-mono tracking-widest">
                          ))) NFC
                        </span>
                      </div>

                      {/* Card Number */}
                      <div>
                        <span className="text-xs opacity-70 font-medium block">CARD NUMBER</span>
                        <p className="font-mono text-base sm:text-lg font-bold tracking-widest">
                          {userMembership?.cardNumber || "VIP-8824-9102-3401"}
                        </p>
                      </div>

                      {/* Cardholder & Expiry */}
                      <div className="flex items-end justify-between pt-1 border-t border-current/20 text-xs">
                        <div>
                          <span className="text-[9px] opacity-70 block font-semibold">CARD HOLDER</span>
                          <span className="font-black tracking-wider uppercase line-clamp-1">
                            {userMembership?.cardHolderName || currentUser.name || "VALUED CUSTOMER"}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-[9px] opacity-70 block font-semibold">VALID THRU</span>
                          <span className="font-mono font-bold">
                            {userMembership?.validUntil || "12/2027"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Benefits HUD & Metrics */}
                <div className="lg:col-span-7 space-y-4">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-center">
                      <span className="text-[10px] text-slate-500 font-bold block">শপিং ডিসকাউন্ট</span>
                      <strong className="text-indigo-600 text-lg font-black">
                        {userMembership ? `${userMembership.discountPercent}%` : "৩% - ১২%"}
                      </strong>
                    </div>
                    <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-center">
                      <span className="text-[10px] text-slate-500 font-bold block">ডেলিভারি চার্জ</span>
                      <strong className="text-emerald-600 text-sm font-black">
                        {userMembership ? (userMembership.deliveryCharge === 0 ? "সম্পূর্ণ ফ্রি" : `৳${userMembership.deliveryCharge}`) : "ফ্রি ডেলিভারি"}
                      </strong>
                    </div>
                    <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-center">
                      <span className="text-[10px] text-slate-500 font-bold block">দরদাম প্রাধিকার</span>
                      <strong className="text-amber-600 text-lg font-black">
                        {userMembership ? `${userMembership.priceCompromiseMaxPercent}%` : "১৫% পর্যন্ত"}
                      </strong>
                    </div>
                    <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-center">
                      <span className="text-[10px] text-slate-500 font-bold block">সাপোর্ট লেভেল</span>
                      <strong className="text-purple-600 text-xs font-black">
                        VIP প্রায়োরিটি
                      </strong>
                    </div>
                  </div>

                  <div className="p-4 bg-gradient-to-r from-indigo-50 to-amber-50 rounded-2xl border border-indigo-100 space-y-2">
                    <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      কাস্টমার কেয়ার মেম্বারশিপ সার্ভিস ও গ্যারান্টি:
                    </h4>
                    <ul className="text-xs text-slate-600 space-y-1">
                      <li className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span>অর্ডার করার ৩-৫ কর্মদিবসের মধ্যে কুরিয়ার মারফত আপনার ঠিকানায় কার্ড পৌঁছে দেওয়া হয়।</span>
                      </li>
                      <li className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span>কার্ড হারিয়ে গেলে বা নষ্ট হলে কাস্টমার কেয়ার থেকে ফ্রি রি-ইস্যু সহায়তা।</span>
                      </li>
                      <li className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span>মেম্বারদের জন্য রয়েছে ডেডিকেটেড ভিআইপি ফোন ও হোয়াটসঅ্যাপ হেল্পলাইন।</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Physical Card Courier Delivery Tracker (If user has a pending or recent card order) */}
              {userLatestCardOrder && (
                <div className="mt-4 pt-5 border-t border-slate-100 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Truck className="w-4 h-4 text-indigo-600" />
                      <h4 className="font-bold text-slate-900 text-sm">
                        ফিজিক্যাল কার্ড কুরিয়ার ও ডেলিভারি ট্র্যাকিং
                      </h4>
                      <span className="text-xs text-slate-500 font-mono">
                        (অর্ডার #{userLatestCardOrder.id.slice(-6).toUpperCase()})
                      </span>
                    </div>
                    <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-200">
                      স্ট্যাটাস: {userLatestCardOrder.cardStatus}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 pt-2 text-xs">
                    <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-800 font-semibold flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>১. অর্ডার কনফার্মড</span>
                    </div>
                    <div className={`p-2.5 rounded-xl border font-semibold flex items-center gap-2 ${
                      userLatestCardOrder.cardStatus !== "Printing"
                        ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                        : "bg-indigo-50 border-indigo-200 text-indigo-800 animate-pulse"
                    }`}>
                      <PackageCheck className="w-4 h-4 text-indigo-600 shrink-0" />
                      <span>২. লেজার প্রিন্টিং ও এনগ্রেভিং</span>
                    </div>
                    <div className={`p-2.5 rounded-xl border font-semibold flex items-center gap-2 ${
                      userLatestCardOrder.cardStatus === "Dispatched" || userLatestCardOrder.cardStatus === "Delivered" || userLatestCardOrder.cardStatus === "Active"
                        ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                        : "bg-slate-50 border-slate-200 text-slate-400"
                    }`}>
                      <Truck className="w-4 h-4 shrink-0" />
                      <span>৩. কুরিয়ারে হস্তান্তর</span>
                    </div>
                    <div className={`p-2.5 rounded-xl border font-semibold flex items-center gap-2 ${
                      userLatestCardOrder.cardStatus === "Delivered" || userLatestCardOrder.cardStatus === "Active"
                        ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                        : "bg-slate-50 border-slate-200 text-slate-400"
                    }`}>
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      <span>৪. হোম ডেলিভারি সম্পন্ন</span>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-500 pt-1">
                    ঠিকানা: {userLatestCardOrder.deliveryAddress.fullAddress}, {userLatestCardOrder.deliveryAddress.district} • কুরিয়ার পার্টনার: Steadfast Courier
                  </p>
                </div>
              )}
            </div>

            {/* 3 MEMBERSHIP CATEGORIES COMPARISON CARDS */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-xl font-black text-slate-900">
                    ৩টি মেম্বারশিপ ক্যাটাগরি ও প্ল্যান
                  </h3>
                  <p className="text-xs text-slate-500">
                    আপনার শপিং ও প্রয়োজনীয়তা অনুযায়ী সেরা ক্যাটাগরিটি বেছে নিন:
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {membershipPlans.map((plan) => {
                  const isCurrent = userMembership?.tier === plan.tier;
                  const isGold = plan.tier === "Gold";
                  const isPlatinum = plan.tier === "Platinum";

                  return (
                    <div
                      key={plan.id}
                      className={`bg-white rounded-3xl border transition-all flex flex-col justify-between overflow-hidden shadow-sm hover:shadow-xl relative ${
                        isGold
                          ? "border-2 border-amber-400 shadow-amber-100 ring-2 ring-amber-400/20"
                          : isPlatinum
                          ? "border-purple-300 shadow-purple-50"
                          : "border-slate-200"
                      }`}
                    >
                      {/* Popular ribbon */}
                      {plan.isPopular && (
                        <div className="bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black text-[10px] uppercase tracking-wider py-1 text-center shadow-xs">
                          🔥 সবচেয়ে জনপ্রিয় চয়েস (Most Popular)
                        </div>
                      )}

                      <div className="p-6 space-y-5">
                        {/* Tier Title & Price */}
                        <div>
                          <div className="flex items-center justify-between">
                            <span
                              className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full ${
                                isPlatinum
                                  ? "bg-purple-100 text-purple-800"
                                  : isGold
                                  ? "bg-amber-100 text-amber-800"
                                  : "bg-slate-100 text-slate-800"
                              }`}
                            >
                              {plan.cardTitle}
                            </span>
                            <span className="text-xs text-slate-400 font-semibold">
                              মেয়াদ ১ বছর
                            </span>
                          </div>

                          <h4 className="text-xl font-black text-slate-900 mt-2">
                            {plan.nameBn || plan.name}
                          </h4>

                          <div className="flex items-baseline gap-1 mt-2">
                            <span className="text-3xl font-black text-slate-900 font-mono">
                              ৳{plan.price.toLocaleString()}
                            </span>
                            <span className="text-xs text-slate-400 font-semibold">/বার্ষিক ফি</span>
                          </div>
                        </div>

                        {/* Perks List */}
                        <div className="space-y-2.5 pt-3 border-t border-slate-100 text-xs text-slate-700">
                          <div className="flex items-start gap-2">
                            <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                            <span className="font-bold text-slate-900">
                              {plan.discountPercent}% প্রতিটি অর্ডারে নিশ্চিত ডিসকাউন্ট
                            </span>
                          </div>
                          <div className="flex items-start gap-2">
                            <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                            <span>
                              {plan.freeDeliveryThreshold === 0
                                ? "শর্তহীন ১০০% সারা দেশে ফ্রি ডেলিভারি"
                                : `৳${plan.freeDeliveryThreshold.toLocaleString()} টাকার অর্ডারে ফ্রি ডেলিভারি`}
                            </span>
                          </div>
                          <div className="flex items-start gap-2">
                            <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                            <span className="font-bold text-amber-700">
                              পণ্য দরদাম (প্রাইস কম্প্রোমাইজ): সর্বোচ্চ {plan.priceCompromiseMaxPercent}% পর্যন্ত
                            </span>
                          </div>
                          <div className="flex items-start gap-2">
                            <CreditCard className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                            <span>লেজার এনগ্রেভড ফিজিক্যাল মেম্বারশিপ কার্ড</span>
                          </div>
                          <div className="flex items-start gap-2">
                            <Truck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                            <span>
                              ঢাকা: ৳{plan.deliveryChargeDhaka} · ঢাকার বাইরে: ৳{plan.deliveryChargeOutside} (কার্ড ডেলিভারি)
                            </span>
                          </div>
                          <div className="flex items-start gap-2">
                            <Phone className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                            <span>
                              {isPlatinum
                                ? "২৪/৭ ভিআইপি কনসিয়ার্জ ও ডেডিকেটেড ম্যানেজার"
                                : isGold
                                ? "গোল্ড প্রায়োরিটি কাস্টমার সাপোর্ট"
                                : "স্ট্যান্ডার্ড সাপোর্ট ডেস্ক"}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Card Footer Button */}
                      <div className="p-6 pt-0">
                        {isCurrent ? (
                          <div className="w-full py-2.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-center text-xs font-black flex items-center justify-center gap-1.5">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            বর্তমান সক্রিয় মেম্বারশিপ
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleOpenOrderModal(plan)}
                            className={`w-full py-3 rounded-xl text-xs font-black shadow-md transition flex items-center justify-center gap-2 cursor-pointer ${
                              isGold
                                ? "bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black shadow-amber-200"
                                : isPlatinum
                                ? "bg-gradient-to-r from-purple-800 to-slate-900 hover:from-purple-900 hover:to-black text-white"
                                : "bg-indigo-600 hover:bg-indigo-700 text-white"
                            }`}
                          >
                            <CreditCard className="w-4 h-4" />
                            <span>{plan.cardTitle} সংগ্রহ করুন</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* DEDICATED CUSTOMER CARE HELPDESK FOR CARDHOLDERS */}
            <div className="bg-slate-900 rounded-3xl p-6 sm:p-7 text-white space-y-5 border border-slate-800">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                <div>
                  <span className="text-[10px] font-mono uppercase text-amber-400 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-700/50">
                    VIP Customer Support Desk
                  </span>
                  <h3 className="text-base sm:text-lg font-black text-white mt-1">
                    ফিজিক্যাল মেম্বারশিপ কার্ড সংক্রান্ত কাস্টমার কেয়ার সার্ভিস
                  </h3>
                  <p className="text-xs text-slate-400">
                    যেকোনো সমস্যায় সরাসরি ১-ক্লিকে সাপোর্ট টিকিট তৈরি করুন অথবা হেল্পলাইনে যোগাযোগ করুন:
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={`tel:${settings.supportPhone || "+8801700000000"}`}
                    className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition"
                  >
                    <Phone className="w-3.5 h-3.5" /> কল হেল্পলাইন
                  </a>
                </div>
              </div>

              {/* 4 Quick Support Ticket Actions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <button
                  type="button"
                  onClick={() =>
                    handleOpenMembershipTicket(
                      "ফিজিক্যাল কার্ড হারিয়ে গেছে — রি-ইস্যু আবেদন",
                      "আমার মেম্বারশিপ কার্ডটি হারিয়ে গেছে / নষ্ট হয়ে গেছে। অনুগ্রহ করে একটি নতুন কার্ড রি-ইস্যু করে আমার ঠিকানায় পাঠানোর ব্যবস্থা করুন।"
                    )
                  }
                  className="p-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-left transition space-y-1.5 group cursor-pointer"
                >
                  <CreditCard className="w-5 h-5 text-amber-400 group-hover:scale-110 transition-transform" />
                  <h5 className="font-bold text-white text-xs">কার্ড রি-ইস্যু আবেদন</h5>
                  <p className="text-[11px] text-slate-400 leading-snug">
                    কার্ড হারিয়ে গেলে বা ভেঙে গেলে নতুন কার্ড পাওয়ার টিকিট
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    handleOpenMembershipTicket(
                      "ফিজিক্যাল কার্ড ডেলিভারি বিলম্ব — কুরিয়ার অনুসন্ধান",
                      "আমার মেম্বারশিপ কার্ড অর্ডার করার পর এখনও ডেলিভারি পাইনি। বর্তমান কুরিয়ার ট্র্যাকিং ও ডেলিভারি স্ট্যাটাস জানিয়ে সাহায্য করুন।"
                    )
                  }
                  className="p-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-left transition space-y-1.5 group cursor-pointer"
                >
                  <Truck className="w-5 h-5 text-indigo-400 group-hover:scale-110 transition-transform" />
                  <h5 className="font-bold text-white text-xs">ডেলিভারি বিলম্ব রিপোর্ট</h5>
                  <p className="text-[11px] text-slate-400 leading-snug">
                    কার্ড হাতে না পেলে কুরিয়ার অনুসন্ধান ও সমাধান
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    handleOpenMembershipTicket(
                      "মেম্বারশিপ ডিসকাউন্ট বা ফ্রি ডেলিভারি কাজ করছে না",
                      "চেকআউট করার সময় আমার মেম্বারশিপের নির্ধারিত ডিসকাউন্ট / ফ্রি ডেলিভারি সক্রিয় হচ্ছে না। অনুগ্রহ করে একাউন্ট চেক করে দিন।"
                    )
                  }
                  className="p-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-left transition space-y-1.5 group cursor-pointer"
                >
                  <Tag className="w-5 h-5 text-emerald-400 group-hover:scale-110 transition-transform" />
                  <h5 className="font-bold text-white text-xs">ডিসকাউন্ট সমস্যা সমাধান</h5>
                  <p className="text-[11px] text-slate-400 leading-snug">
                    চেকআউটে মেম্বার ছাড় বা ফ্রি ডেলিভারি না পাওয়ার অভিযোগ
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    handleOpenMembershipTicket(
                      "মেম্বারশিপ ক্যাটাগরি আপগ্রেড বা বাতিল সংক্রান্ত",
                      "আমি আমার বর্তমান মেম্বারশিপ ক্যাটাগরি গোল্ড বা প্লাটিনামে আপগ্রেড করতে চাই। প্রসিডিউর বুঝিয়ে দেওয়ার অনুরোধ।"
                    )
                  }
                  className="p-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-left transition space-y-1.5 group cursor-pointer"
                >
                  <Crown className="w-5 h-5 text-purple-400 group-hover:scale-110 transition-transform" />
                  <h5 className="font-bold text-white text-xs">ক্যাটাগরি আপগ্রেড গাইড</h5>
                  <p className="text-[11px] text-slate-400 leading-snug">
                    সিলভার থেকে গোল্ড বা প্লাটিনামে সহজে আপগ্রেড সহায়তা
                  </p>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 1: FAQ KNOWLEDGE BASE */}
        {activeTab === "faq" && (
          <div className="space-y-8">
            {/* Category Pills */}
            <div className="flex items-center justify-center flex-wrap gap-2">
              <button
                onClick={() => setSelectedCatId("all")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                  selectedCatId === "all"
                    ? "bg-slate-900 text-white"
                    : "bg-white border text-slate-600 hover:bg-slate-100"
                }`}
              >
                All Categories
              </button>
              {faqCategories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCatId(cat.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                    selectedCatId === cat.id
                      ? "bg-indigo-600 text-white"
                      : "bg-white border text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            {/* Questions Accordion */}
            <div className="max-w-3xl mx-auto space-y-4">
              {filteredFaqs.length === 0 ? (
                <div className="bg-white p-8 rounded-2xl text-center text-slate-400 border">
                  No help articles found matching search query.
                </div>
              ) : (
                filteredFaqs.map((faq) => {
                  const isOpen = openFaqId === faq.id;
                  return (
                    <div
                      key={faq.id}
                      className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden transition"
                    >
                      <button
                        onClick={() => setOpenFaqId(isOpen ? null : faq.id)}
                        className="w-full text-left p-5 font-bold text-slate-900 text-sm md:text-base flex items-center justify-between gap-4 hover:bg-slate-50"
                      >
                        <span className="flex items-center gap-2">
                          <span className="text-xs text-indigo-600 font-mono">[{faq.categoryName}]</span>
                          {faq.question}
                        </span>
                        {isOpen ? (
                          <ChevronUp className="w-5 h-5 text-slate-400" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-slate-400" />
                        )}
                      </button>

                      {isOpen && (
                        <div className="p-5 pt-0 border-t border-slate-100 text-xs text-slate-600 leading-relaxed space-y-4 bg-slate-50/50">
                          <p className="whitespace-pre-line text-sm">{faq.answer}</p>

                          <div className="flex items-center justify-between pt-3 border-t border-slate-200 text-xs text-slate-500">
                            <span>Was this answer helpful?</span>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => voteFAQ(faq.id, true)}
                                className="inline-flex items-center gap-1 px-3 py-1 bg-white border rounded-lg hover:bg-emerald-50 hover:text-emerald-700 font-semibold"
                              >
                                <ThumbsUp className="w-3.5 h-3.5" /> Yes ({faq.helpfulCount})
                              </button>
                              <button
                                onClick={() => voteFAQ(faq.id, false)}
                                className="inline-flex items-center gap-1 px-3 py-1 bg-white border rounded-lg hover:bg-red-50 hover:text-red-700 font-semibold"
                              >
                                <ThumbsDown className="w-3.5 h-3.5" /> No ({faq.notHelpfulCount})
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* TAB 2: 7-DAY RETURN & REFUND POLICY (POLICY ONLY - NO PUBLIC USER ITEMS) */}
        {activeTab === "returns" && (
          <div className="space-y-8 animate-fadeIn text-left">
            {/* Hero Policy Banner */}
            <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 border border-indigo-800/40 text-white shadow-xl relative overflow-hidden">
              <div className="absolute right-0 top-0 bottom-0 w-96 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-500/20 via-transparent to-transparent pointer-events-none" />

              <div className="max-w-3xl space-y-3 relative z-10">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="p-2 bg-indigo-500/20 border border-indigo-400/40 rounded-xl text-indigo-300">
                    <RotateCcw className="w-5 h-5" />
                  </span>
                  <span className="text-[11px] font-black uppercase tracking-wider text-indigo-300 bg-indigo-950/80 px-3 py-0.5 rounded-full border border-indigo-700/50">
                    অফিশিয়াল গ্যারান্টি
                  </span>
                  <span className="text-[10px] font-bold text-emerald-300 bg-emerald-950/80 px-2.5 py-0.5 rounded-full border border-emerald-600/40">
                    ১০০% মানি-ব্যাক ও এক্সচেঞ্জ পলিসি
                  </span>
                </div>

                <h2 className="text-xl sm:text-3xl font-black tracking-tight text-white leading-tight">
                  ৭ দিনের সহজ রিটার্ন ও রিফান্ড পলিসি
                </h2>

                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl">
                  {siteName}-এ প্রতিটি অর্ডারে গ্রাহকের শতভাগ সন্তুষ্টি আমাদের শীর্ষ অগ্রাধিকার। পণ্য হাতে পাওয়ার দিন থেকে পরবর্তী ৭ ক্যালেন্ডার দিনের মধ্যে আপনি কোনো ধরনের ঝামেলা ছাড়াই রিটার্ন বা রিফান্ডের জন্য আবেদন করতে পারবেন।
                </p>
              </div>
            </div>

            {/* Privacy & Account Notice Callout */}
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/80 rounded-3xl p-5 sm:p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className="p-2.5 rounded-2xl bg-amber-500 text-white shrink-0 mt-0.5">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-black text-amber-950 flex items-center gap-2">
                    <span>গ্রাহকের তথ্যের গোপনীয়তা ও সুরক্ষা নোটিশ</span>
                    <span className="text-[10px] px-2 py-0.2 bg-amber-200/70 text-amber-900 rounded font-mono font-bold">
                      প্রাইভেট
                    </span>
                  </h4>
                  <p className="text-xs text-amber-800 leading-relaxed max-w-2xl">
                    গ্রাহকদের গোপনীয়তা রক্ষার্থে এই সাধারণ পেজে কোনো ইউজারের ব্যক্তিগত রিটার্ন আইটেম বা রিফান্ড তথ্য প্রকাশ করা হয় না। আপনার কোনো অর্ডারকৃত পণ্যের রিটার্ন বা রিফান্ড হিস্ট্রি দেখতে অনুগ্রহ করে লগইন অবস্থায় আপনার <strong>প্রোফাইল (Profile)</strong>-এ যান।
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setStoreView("profile")}
                className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-black shadow-md flex items-center justify-center gap-2 transition shrink-0 cursor-pointer"
              >
                <User className="w-4 h-4" />
                <span>আমার প্রোফাইলে রিটার্ন ট্র্যাক করুন</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* 4 Core Pillars of 7-Day Return Policy */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-2.5">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                  <Clock className="w-5 h-5" />
                </div>
                <h4 className="font-black text-slate-900 text-sm">৭ দিনের সময়সীমা</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  কুরিয়ার থেকে পার্সেল ডেলিভারি গ্রহণের তারিখ থেকে পরবর্তী ৭ দিনের মধ্যে রিটার্ন রিকোয়েস্ট গৃহীত হয়।
                </p>
              </div>

              <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-2.5">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                  <PackageCheck className="w-5 h-5" />
                </div>
                <h4 className="font-black text-slate-900 text-sm">প্যাকেজিং ও কন্ডিশন</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  পণ্যটি অব্যবহৃত অবস্থায় মূল ব্র্যান্ড বক্স, ট্যাগ, সিল ও সকল আনুষঙ্গিক এক্সেসরিজ সহ অক্ষত থাকতে হবে।
                </p>
              </div>

              <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-2.5">
                <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <h4 className="font-black text-slate-900 text-sm">ত্রুটিপূর্ণ বা ভুল পণ্য</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  ভুল পণ্য বা ট্রানজিটে ক্ষতিগ্রস্ত পণ্য পৌঁছালে সম্পূর্ণ ফ্রিতে রিটার্ন পিকআপ ও ইনস্ট্যান্ট রিপ্লেসমেন্ট।
                </p>
              </div>

              <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-2.5">
                <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                  <CreditCard className="w-5 h-5" />
                </div>
                <h4 className="font-black text-slate-900 text-sm">১০০% রিফান্ড গ্যারান্টি</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  কোয়ালিটি যাচাই সম্পন্ন হওয়ার পর ২৪-৪৮ ঘণ্টার মধ্যে বিকাশ, নগদ বা ব্যাংক অ্যাকাউন্টে রিফান্ড প্রদান।
                </p>
              </div>
            </div>

            {/* Detailed Policy Sections Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column: Eligible Reasons & Process */}
              <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-xs space-y-5">
                <div className="border-b border-slate-100 pb-3">
                  <span className="text-[10px] font-mono uppercase text-indigo-600 font-bold">
                    Eligibility Guidelines
                  </span>
                  <h3 className="text-base sm:text-lg font-black text-slate-900 mt-0.5">
                    রিটার্ন গ্রহণের গ্রহণযোগ্য কারণসমূহ
                  </h3>
                </div>

                <div className="space-y-3 text-xs text-slate-600">
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-start gap-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-slate-900 block font-bold">ভুল পণ্য ডেলিভারি:</strong>
                      অর্ডারকৃত পণ্যের সাথে প্রাপ্ত পণ্যের ছবি, স্পেসিফিকেশন বা কালার মিল না থাকলে।
                    </div>
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-start gap-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-slate-900 block font-bold">ড্যামেজ বা ট্রানজিট ক্ষতি:</strong>
                      কুরিয়ার পার্সেল পাওয়ার সময় পণ্য ভাঙা, ফাটা বা ত্রুটিপূর্ণ থাকলে।
                    </div>
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-start gap-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-slate-900 block font-bold">ম্যানুফ্যাকচারিং ডিফেক্ট:</strong>
                      প্রথম ব্যবহারের সময় পণ্যে কোনো ফাংশনাল বা অভ্যন্তরীণ টেকনিক্যাল সমস্যা দেখা দিলে।
                    </div>
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-start gap-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-slate-900 block font-bold">সাইজ অমিল (পোশাক/জুতো):</strong>
                      সাইজ অনুপযুক্ত হলে কোনো অতিরিক্ত সার্ভিস চার্জ ছাড়াই সাইজ এক্সচেঞ্জ সুবিধা।
                    </div>
                  </div>
                </div>

                {/* Non-returnable Items */}
                <div className="pt-2">
                  <h4 className="text-xs font-black uppercase text-slate-900 mb-2 flex items-center gap-1.5 text-rose-600">
                    <AlertCircle className="w-4 h-4" />
                    যেসব পণ্য রিটার্নযোগ্য নয়:
                  </h4>
                  <ul className="text-xs text-slate-500 space-y-1.5 list-disc pl-5">
                    <li>ব্যবহৃত কসমেটিকস ও স্কিনকেয়ার পণ্য (স্বাস্থ্যবিধি ও হাইজিন কারণে)।</li>
                    <li>সিল খোলা সফটওয়্যার লাইসেন্স বা ডিজিটাল গিফট ভাউচার।</li>
                    <li>গ্রাহকের ইচ্ছাকৃত ভাঙা বা অননুমোদিত মেরামতের ফলে সৃষ্ট ক্ষতি।</li>
                  </ul>
                </div>
              </div>

              {/* Right Column: Step-by-Step Return & Refund Procedure */}
              <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-xs space-y-5">
                <div className="border-b border-slate-100 pb-3">
                  <span className="text-[10px] font-mono uppercase text-emerald-600 font-bold">
                    Step-by-Step Walkthrough
                  </span>
                  <h3 className="text-base sm:text-lg font-black text-slate-900 mt-0.5">
                    সহজ ৪ ধাপে রিটার্ন ও রিফান্ড প্রক্রিয়া
                  </h3>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start gap-3.5">
                    <div className="w-7 h-7 rounded-full bg-indigo-600 text-white font-mono font-bold text-xs flex items-center justify-center shrink-0">
                      ১
                    </div>
                    <div>
                      <h5 className="font-bold text-slate-900 text-xs">প্রোফাইল থেকে রিটার্ন আবেদন জমা দিন</h5>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        আপনার অ্যাকাউন্টে লগইন করে &apos;প্রোফাইল&apos; -&gt; &apos;রিটার্ন ও রিফান্ড&apos; সেকশনে গিয়ে ডেলিভার্ড অর্ডারটি সিলেক্ট করে কারণ ও ছবি সহ সাবমিট করুন।
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3.5">
                    <div className="w-7 h-7 rounded-full bg-indigo-600 text-white font-mono font-bold text-xs flex items-center justify-center shrink-0">
                      ২
                    </div>
                    <div>
                      <h5 className="font-bold text-slate-900 text-xs">আমাদের টিম ভেরিফিকেশন ও অনুমোদন</h5>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        আমাদের কোয়ালিটি অডিট টিম ২৪ ঘণ্টার মধ্যে প্রমাণ যাচাই করে রিটার্ন অনুমোদন প্রদান করবে।
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3.5">
                    <div className="w-7 h-7 rounded-full bg-indigo-600 text-white font-mono font-bold text-xs flex items-center justify-center shrink-0">
                      ৩
                    </div>
                    <div>
                      <h5 className="font-bold text-slate-900 text-xs">ডোর-স্টেপ পিকআপ অথবা কুরিয়ার ড্রপ</h5>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        কুরিয়ার প্রতিনিধি আপনার ঠিকানা থেকে পণ্যটি সংগ্রহ করবে অথবা নির্ধারিত কুরিয়ার পয়েন্টে জমা দেওয়ার কোড প্রদান করা হবে।
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3.5">
                    <div className="w-7 h-7 rounded-full bg-emerald-600 text-white font-mono font-bold text-xs flex items-center justify-center shrink-0">
                      ৪
                    </div>
                    <div>
                      <h5 className="font-bold text-slate-900 text-xs">ইনস্ট্যান্ট রিফান্ড প্রদান</h5>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        পণ্য ওয়্যারহাউসে পৌঁছানোর ১ কার্যদিবসের মধ্যে আপনার বিকাশ/নগদে বা ব্যাংকে পূর্ণ টাকা ফেরত দেওয়া হবে।
                      </p>
                    </div>
                  </div>
                </div>

                {/* Refund Timetable Card */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-2">
                  <div className="text-xs font-bold text-slate-800">রিফান্ড পাওয়ার সময়সূচি:</div>
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div className="p-2 bg-white rounded-xl border border-slate-200">
                      <span className="font-bold text-pink-600 block">bKash / Nagad:</span>
                      <span className="text-slate-600">অনুমোদনের ২৪-৪৮ ঘণ্টার মধ্যে</span>
                    </div>
                    <div className="p-2 bg-white rounded-xl border border-slate-200">
                      <span className="font-bold text-indigo-600 block">ব্যাংক বা কার্ড:</span>
                      <span className="text-slate-600">৩-৫ কার্যদিবসের মধ্যে</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Need Assistance Hotline Strip */}
            <div className="bg-slate-900 text-white p-6 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-1 text-center sm:text-left">
                <h4 className="font-black text-sm text-white">রিটার্ন বা রিফান্ড সংক্রান্ত কোনো প্রশ্ন আছে?</h4>
                <p className="text-xs text-slate-400">
                  আমাদের কাস্টমার কেয়ার টিম প্রতিদিন সকাল ৯টা থেকে রাত ১১টা পর্যন্ত আপনার সেবায় নিয়োজিত।
                </p>
              </div>

              <div className="flex items-center gap-3">
                <a
                  href={`tel:${settings.supportPhone || "+8801700000000"}`}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition"
                >
                  <Phone className="w-3.5 h-3.5" /> কল হেল্পলাইন
                </a>
                <button
                  type="button"
                  onClick={() => {
                    setTicketCategory("Returns");
                    setTicketSubject("৭ দিনের রিটার্ন ও রিফান্ড সংক্রান্ত প্রশ্ন");
                    setShowTicketModal(true);
                  }}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                >
                  <MessageSquare className="w-3.5 h-3.5" /> সাপোর্ট টিকিট খুলুন
                </button>
              </div>
            </div>
          </div>
        )}


        {/* TAB 3: SUPPORT TICKETS */}
        {activeTab === "tickets" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
              <div>
                <h3 className="font-bold text-slate-900 text-lg">My Customer Support Tickets</h3>
                <p className="text-xs text-slate-500">Track responses and speak directly with official support agents.</p>
              </div>
              <button
                onClick={() => {
                  setTicketSubmitted(false);
                  setShowTicketModal(true);
                }}
                className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-indigo-700 transition flex items-center gap-2"
              >
                <Plus className="w-4 h-4" /> Open Support Ticket
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {supportTickets.map((ticket) => (
                <div
                  key={ticket.id}
                  className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4 hover:shadow-md transition"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-mono text-xs font-bold text-indigo-600">{ticket.ticketNumber}</span>
                      <h4 className="font-bold text-slate-900 text-base mt-1">{ticket.subject}</h4>
                    </div>
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                        ticket.status === "Open"
                          ? "bg-red-100 text-red-800"
                          : ticket.status === "In Progress"
                          ? "bg-amber-100 text-amber-800"
                          : "bg-emerald-100 text-emerald-800"
                      }`}
                    >
                      {ticket.status}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-2">
                    {ticket.messages[0]?.message}
                  </p>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-400">Category: {ticket.category}</span>
                    <button
                      onClick={() => setActiveTicket(ticket)}
                      className="text-indigo-600 font-bold hover:underline"
                    >
                      View Chat Log ({ticket.messages.length}) &rarr;
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}



        {/* OPEN TICKET MODAL */}
        {showTicketModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b pb-3">
                <h3 className="font-bold text-slate-900 text-lg">Create Customer Support Ticket</h3>
                <button
                  onClick={() => setShowTicketModal(false)}
                  className="text-slate-400 hover:text-slate-600 text-2xl font-bold"
                >
                  &times;
                </button>
              </div>

              {ticketSubmitted ? (
                <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-3">
                  <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                  <h4 className="font-bold text-emerald-900 text-lg">Support Ticket Logged</h4>
                  <p className="text-xs text-emerald-700">An agent has been assigned to your ticket.</p>
                  <button
                    onClick={() => setShowTicketModal(false)}
                    className="px-5 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold"
                  >
                    Done
                  </button>
                </div>
              ) : (
                <form onSubmit={handleTicketSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Topic Category</label>
                    <select
                      value={ticketCategory}
                      onChange={(e) => setTicketCategory(e.target.value as SupportTicket["category"])}
                      className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm bg-white"
                    >
                      <option value="General">General Questions</option>
                      <option value="Order">Order Status & Delivery</option>
                      <option value="Payment">Payments & Refunds</option>
                      <option value="Coupons">Coupons & Promotions</option>
                      <option value="Technical">Technical & Warranty</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Ticket Subject</label>
                    <input
                      type="text"
                      value={ticketSubject}
                      onChange={(e) => setTicketSubject(e.target.value)}
                      placeholder="e.g. Need help with promo code"
                      className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Message Body</label>
                    <textarea
                      rows={4}
                      value={ticketMessage}
                      onChange={(e) => setTicketMessage(e.target.value)}
                      placeholder="Explain your inquiry..."
                      className="w-full border border-slate-200 rounded-xl p-3 text-sm outline-none"
                      required
                    />
                  </div>

                  <div className="flex justify-end gap-3 pt-3 border-t">
                    <button
                      type="button"
                      onClick={() => setShowTicketModal(false)}
                      className="px-4 py-2 border text-slate-600 rounded-xl text-xs font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700"
                    >
                      Dispatch Ticket
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}

        {/* ACTIVE TICKET CONVERSATION */}
        {activeTicket && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b pb-3">
                <div>
                  <span className="font-mono text-xs font-bold text-indigo-600">{activeTicket.ticketNumber}</span>
                  <h3 className="font-bold text-slate-900 text-lg">{activeTicket.subject}</h3>
                </div>
                <button
                  onClick={() => setActiveTicket(null)}
                  className="text-slate-400 hover:text-slate-600 text-2xl font-bold"
                >
                  &times;
                </button>
              </div>

              <div className="space-y-3 max-h-60 overflow-y-auto p-3 bg-slate-50 rounded-2xl border text-xs">
                {activeTicket.messages.map((m) => (
                  <div
                    key={m.id}
                    className={`p-3 rounded-xl max-w-xs space-y-1 ${
                      m.sender === "Customer" ? "bg-indigo-600 text-white ml-auto" : "bg-white border text-slate-800 mr-auto"
                    }`}
                  >
                    <div className="font-bold text-[10px] opacity-80">{m.senderName} • {m.createdAt}</div>
                    <p className="text-xs">{m.message}</p>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Type message to support agent..."
                  value={ticketReply}
                  onChange={(e) => setTicketReply(e.target.value)}
                  className="flex-1 border rounded-xl px-4 py-2 text-sm outline-none"
                />
                <button
                  onClick={handleCustomerReply}
                  disabled={!ticketReply.trim()}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-indigo-700 disabled:opacity-50"
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        )}

        {/* PHYSICAL MEMBERSHIP CARD ORDER MODAL */}
        {selectedPlanForOrder && (
          <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
            <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[92vh] flex flex-col">
              {/* Header */}
              <div
                className={`p-5 sm:p-6 text-white flex items-center justify-between shrink-0 ${
                  selectedPlanForOrder.tier === "Platinum"
                    ? "bg-gradient-to-r from-purple-900 via-indigo-950 to-slate-900"
                    : selectedPlanForOrder.tier === "Gold"
                    ? "bg-gradient-to-r from-amber-600 via-yellow-600 to-amber-700 text-slate-950"
                    : "bg-gradient-to-r from-slate-800 to-indigo-900"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-2xl bg-white/20 backdrop-blur-md">
                    <CreditCard className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono uppercase font-black px-2 py-0.5 rounded-full bg-white/30 backdrop-blur-sm">
                        {selectedPlanForOrder.tier} Club Membership
                      </span>
                      <span className="text-xs opacity-90 font-bold">১ বছর মেয়াদ</span>
                    </div>
                    <h3 className="text-lg sm:text-xl font-black mt-0.5">
                      {selectedPlanForOrder.title} কার্ড অর্ডার
                    </h3>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedPlanForOrder(null)}
                  className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
                  title="Close modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Scrollable Form Body */}
              <div className="p-5 sm:p-6 overflow-y-auto space-y-6">
                {/* Live Card Preview */}
                <div
                  className={`rounded-2xl p-4 sm:p-5 text-white shadow-lg relative overflow-hidden border ${
                    selectedPlanForOrder.tier === "Platinum"
                      ? "bg-gradient-to-br from-purple-950 via-slate-900 to-indigo-950 border-purple-500/40"
                      : selectedPlanForOrder.tier === "Gold"
                      ? "bg-gradient-to-br from-amber-500 via-amber-600 to-yellow-600 border-amber-300/40 text-slate-950"
                      : "bg-gradient-to-br from-slate-700 via-slate-800 to-indigo-900 border-slate-600"
                  }`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Crown className="w-5 h-5" />
                      <span className="text-xs font-black tracking-widest uppercase">
                        SMART PRIVILEGE CLUB
                      </span>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-black/20">
                      NFC & CHIP ENABLED
                    </span>
                  </div>

                  <div className="w-10 h-7 rounded-md bg-gradient-to-tr from-amber-300 to-yellow-100 border border-amber-400 mb-4 flex items-center justify-center shadow-inner">
                    <div className="w-6 h-4 border border-amber-500/60 rounded-xs grid grid-cols-2 gap-0.5">
                      <div className="border-r border-amber-500/60" />
                      <div />
                    </div>
                  </div>

                  <div className="font-mono text-sm sm:text-base tracking-[0.25em] font-bold mb-3 drop-shadow-sm">
                    8809 •••• •••• 7712
                  </div>

                  <div className="flex items-end justify-between text-xs pt-1 border-t border-white/20">
                    <div>
                      <div className="text-[9px] uppercase tracking-wider opacity-75 font-semibold">
                        Cardholder
                      </div>
                      <div className="font-black tracking-wide uppercase text-sm">
                        {cardHolderName || "YOUR NAME"}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[9px] uppercase tracking-wider opacity-75 font-semibold">
                        Tier Level
                      </div>
                      <div className="font-black text-sm uppercase">
                        {selectedPlanForOrder.tier}
                      </div>
                    </div>
                  </div>
                </div>

                <form onSubmit={handleExecuteCardOrder} className="space-y-4">
                  {/* Name to Emboss */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      কার্ডে খোদাই করার পূর্ণ নাম (Cardholder Name) *
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                      <input
                        type="text"
                        value={cardHolderName}
                        onChange={(e) => setCardHolderName(e.target.value)}
                        placeholder="আপনার নাম লিখুন (কার্ডে প্রিন্ট হবে)"
                        className="w-full border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 outline-none"
                        required
                      />
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">
                      এই নামটি আপনার ফিজিক্যাল মেম্বারশিপ কার্ডে লেজার খোদাই করা থাকবে।
                    </p>
                  </div>

                  {/* Phone Numbers */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                        ডেলিভারি ফোন নম্বর *
                      </label>
                      <div className="relative">
                        <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                        <input
                          type="tel"
                          value={recipientPhone}
                          onChange={(e) => setRecipientPhone(e.target.value)}
                          placeholder="01XXXXXXXXX"
                          className="w-full border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 outline-none"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                        বিকল্প ফোন নম্বর (ঐচ্ছিক)
                      </label>
                      <input
                        type="tel"
                        value={alternativePhone}
                        onChange={(e) => setAlternativePhone(e.target.value)}
                        placeholder="বিকল্প ফোন (যদি থাকে)"
                        className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:border-indigo-600 outline-none"
                      />
                    </div>
                  </div>

                  {/* Location Division / District / Thana */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                        বিভাগ (Division) *
                      </label>
                      <select
                        value={selectedDivision}
                        onChange={(e) =>
                          setSelectedDivision(e.target.value as typeof selectedDivision)
                        }
                        className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold bg-white focus:border-indigo-600 outline-none"
                      >
                        <option value="Dhaka">Dhaka (ঢাকা)</option>
                        <option value="Chittagong">Chittagong (চট্টগ্রাম)</option>
                        <option value="Rajshahi">Rajshahi (রাজশাহী)</option>
                        <option value="Khulna">Khulna (খুলনা)</option>
                        <option value="Barisal">Barisal (বরিশাল)</option>
                        <option value="Sylhet">Sylhet (সিলেট)</option>
                        <option value="Rangpur">Rangpur (রংপুর)</option>
                        <option value="Mymensingh">Mymensingh (ময়মনসিংহ)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                        জেলা (District) *
                      </label>
                      <input
                        type="text"
                        value={district}
                        onChange={(e) => setDistrict(e.target.value)}
                        placeholder="e.g. Dhaka"
                        className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-xs focus:border-indigo-600 outline-none"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                        থানা বা এরিয়া *
                      </label>
                      <input
                        type="text"
                        value={thanaOrArea}
                        onChange={(e) => setThanaOrArea(e.target.value)}
                        placeholder="e.g. Dhanmondi"
                        className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-xs focus:border-indigo-600 outline-none"
                        required
                      />
                    </div>
                  </div>

                  {/* Full Address */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      পূর্ণ ডেলিভারি ঠিকানা (Full Address) *
                    </label>
                    <div className="relative">
                      <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                      <textarea
                        rows={2}
                        value={fullAddress}
                        onChange={(e) => setFullAddress(e.target.value)}
                        placeholder="বাড়ি নম্বর, রোড নম্বর, এলাকা বা ল্যান্ডমার্ক..."
                        className="w-full border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-sm focus:border-indigo-600 outline-none"
                        required
                      />
                    </div>
                  </div>

                  {/* Payment Method Selection */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-2">
                      পেমেন্ট মাধ্যম বেছে নিন (Payment Method) *
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      <button
                        type="button"
                        onClick={() => setPaymentMethod("bkash")}
                        className={`p-3 rounded-xl border text-center transition flex flex-col items-center gap-1 cursor-pointer ${
                          paymentMethod === "bkash"
                            ? "border-pink-600 bg-pink-50 text-pink-700 font-black shadow-xs ring-1 ring-pink-500"
                            : "border-slate-200 hover:border-slate-300 text-slate-700"
                        }`}
                      >
                        <span className="text-xs font-black">bKash</span>
                        <span className="text-[10px] text-pink-600 font-semibold">ইনস্ট্যান্ট</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPaymentMethod("nagad")}
                        className={`p-3 rounded-xl border text-center transition flex flex-col items-center gap-1 cursor-pointer ${
                          paymentMethod === "nagad"
                            ? "border-orange-600 bg-orange-50 text-orange-700 font-black shadow-xs ring-1 ring-orange-500"
                            : "border-slate-200 hover:border-slate-300 text-slate-700"
                        }`}
                      >
                        <span className="text-xs font-black">Nagad</span>
                        <span className="text-[10px] text-orange-600 font-semibold">ইনস্ট্যান্ট</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPaymentMethod("card")}
                        className={`p-3 rounded-xl border text-center transition flex flex-col items-center gap-1 cursor-pointer ${
                          paymentMethod === "card"
                            ? "border-indigo-600 bg-indigo-50 text-indigo-700 font-black shadow-xs ring-1 ring-indigo-500"
                            : "border-slate-200 hover:border-slate-300 text-slate-700"
                        }`}
                      >
                        <span className="text-xs font-black">কার্ড / নেট</span>
                        <span className="text-[10px] text-indigo-600 font-semibold">Visa/Master</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPaymentMethod("cod")}
                        className={`p-3 rounded-xl border text-center transition flex flex-col items-center gap-1 cursor-pointer ${
                          paymentMethod === "cod"
                            ? "border-emerald-600 bg-emerald-50 text-emerald-700 font-black shadow-xs ring-1 ring-emerald-500"
                            : "border-slate-200 hover:border-slate-300 text-slate-700"
                        }`}
                      >
                        <span className="text-xs font-black">ক্যাশ অন</span>
                        <span className="text-[10px] text-emerald-600 font-semibold">হাতে পেয়ে দিন</span>
                      </button>
                    </div>
                  </div>

                  {/* Financial Summary */}
                  <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-2 text-xs">
                    <div className="flex justify-between text-slate-600">
                      <span>{selectedPlanForOrder.title} ফি (১ বছর)</span>
                      <span className="font-bold font-mono">৳{selectedPlanForOrder.price}</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>নিরাপদ প্যাকেজিং ও এক্সপ্রেস কুরিয়ার চার্জ</span>
                      <span className="font-bold font-mono">
                        {deliveryCharge === 0 ? (
                          <span className="text-emerald-600 font-black">ফ্রি (Platinum Offer)</span>
                        ) : (
                          `৳${deliveryCharge}`
                        )}
                      </span>
                    </div>
                    <div className="pt-2 border-t border-slate-200 flex justify-between text-sm font-black text-slate-900">
                      <span>সর্বমোট প্রদেয় (Total Payable)</span>
                      <span className="text-indigo-600 text-base font-mono">৳{totalPayable}</span>
                    </div>
                  </div>

                  {/* Submit actions */}
                  <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setSelectedPlanForOrder(null)}
                      className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-bold transition cursor-pointer"
                    >
                      বাতিল করুন
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmittingOrder}
                      className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black shadow-md flex items-center gap-2 transition disabled:opacity-50 cursor-pointer"
                    >
                      {isSubmittingOrder ? (
                        <>
                          <Clock className="w-4 h-4 animate-spin" />
                          <span>অর্ডার প্রসেস হচ্ছে...</span>
                        </>
                      ) : (
                        <>
                          <PackageCheck className="w-4 h-4" />
                          <span>ফিজিক্যাল কার্ড নিশ্চিত করুন (৳{totalPayable})</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
