import React, { useState, useMemo } from "react";
import { useStore } from "../../context/StoreContext";
import {
  SupportTicket,
  Order,
  ReturnRequest,
  PriceCompromiseOffer,
  MembershipCardOrder,
  ContactInquiry,
} from "../../types";
import {
  User,
  MessageSquare,
  ShoppingBag,
  RotateCcw,
  FileText,
  ShieldCheck,
  Crown,
  Phone,
  Mail,
  Calendar,
  DollarSign,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Plus,
  Send,
  Sparkles,
  Lock,
  Clock,
  CheckCircle2,
  AlertCircle,
  Truck,
  Tag,
} from "lucide-react";

interface CustomerHistoryIntelligencePanelProps {
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  currentTicketId?: string;
  onSelectTicket?: (ticket: SupportTicket) => void;
  className?: string;
}

export const CustomerHistoryIntelligencePanel: React.FC<
  CustomerHistoryIntelligencePanelProps
> = ({
  customerName = "",
  customerEmail = "",
  customerPhone = "",
  currentTicketId,
  onSelectTicket,
  className = "",
}) => {
  const {
    currentUser,
    users = [],
    orders = [],
    supportTickets = [],
    returnRequests = [],
    priceCompromiseOffers = [],
    membershipCardOrders = [],
    contactInquiries = [],
    addToast,
    updateSupportTicket,
  } = useStore();

  // STRICT ACCESS CONTROL: Only admins, managers, and support agents can view customer intelligence
  const isAuthorized =
    currentUser &&
    currentUser.role !== "Customer" &&
    currentUser.role !== "Guest";

  const [activeTab, setActiveTab] = useState<
    "chats" | "orders" | "documents" | "notes"
  >("chats");

  const [expandedTicketId, setExpandedTicketId] = useState<string | null>(null);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [newStaffNote, setNewStaffNote] = useState("");

  // Clean customer identifiers for robust matching
  const cleanEmail = customerEmail.trim().toLowerCase();
  const cleanPhone = customerPhone.replace(/\D/g, "");
  const cleanName = customerName.trim().toLowerCase();

  // 1. Resolve User Profile
  const matchedUser = useMemo(() => {
    return users.find((u) => {
      if (cleanEmail && u.email?.toLowerCase() === cleanEmail) return true;
      if (cleanPhone && u.phone && u.phone.replace(/\D/g, "").includes(cleanPhone.slice(-8))) return true;
      if (cleanName && u.name?.toLowerCase() === cleanName) return true;
      return false;
    });
  }, [users, cleanEmail, cleanPhone, cleanName]);

  // 2. Resolve Past Support Tickets & Chats
  const pastTickets = useMemo(() => {
    return supportTickets
      .filter((t) => {
        const matchesEmail = cleanEmail && t.customerEmail?.toLowerCase() === cleanEmail;
        const matchesPhone = cleanPhone && t.customerPhone && t.customerPhone.replace(/\D/g, "").includes(cleanPhone.slice(-8));
        const matchesName = cleanName && t.customerName?.toLowerCase() === cleanName;
        return matchesEmail || matchesPhone || matchesName;
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [supportTickets, cleanEmail, cleanPhone, cleanName]);

  // 3. Resolve Past Orders
  const customerOrders = useMemo(() => {
    return orders
      .filter((o) => {
        const matchesEmail = cleanEmail && o.customerEmail?.toLowerCase() === cleanEmail;
        const matchesPhone = cleanPhone && o.customerPhone && o.customerPhone.replace(/\D/g, "").includes(cleanPhone.slice(-8));
        const matchesName = cleanName && o.customerName?.toLowerCase() === cleanName;
        const matchesUserId = matchedUser && o.userId === matchedUser.id;
        return matchesEmail || matchesPhone || matchesName || matchesUserId;
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [orders, cleanEmail, cleanPhone, cleanName, matchedUser]);

  // 4. Resolve Returns & RMA Requests
  const customerReturns = useMemo(() => {
    return returnRequests.filter((r) => {
      const matchesPhone = cleanPhone && r.customerPhone && r.customerPhone.replace(/\D/g, "").includes(cleanPhone.slice(-8));
      const matchesName = cleanName && r.customerName?.toLowerCase() === cleanName;
      return matchesPhone || matchesName;
    });
  }, [returnRequests, cleanPhone, cleanName]);

  // 5. Resolve Price Compromise / Bargaining Offers
  const customerCompromises = useMemo(() => {
    return priceCompromiseOffers.filter((p) => {
      const matchesPhone = cleanPhone && p.userPhone && p.userPhone.replace(/\D/g, "").includes(cleanPhone.slice(-8));
      const matchesName = cleanName && p.userName?.toLowerCase() === cleanName;
      const matchesUserId = matchedUser && p.userId === matchedUser.id;
      return matchesPhone || matchesName || matchesUserId;
    });
  }, [priceCompromiseOffers, cleanPhone, cleanName, matchedUser]);

  // 6. Resolve Membership Card Orders & VIP Club
  const customerMembershipOrders = useMemo(() => {
    return membershipCardOrders.filter((m) => {
      const matchesName = cleanName && m.cardHolderName?.toLowerCase() === cleanName;
      const matchesUserId = matchedUser && m.userId === matchedUser.id;
      return matchesName || matchesUserId;
    });
  }, [membershipCardOrders, cleanName, matchedUser]);

  // 7. Resolve Web Contact Form Inquiries
  const customerInquiries = useMemo(() => {
    return contactInquiries.filter((c) => {
      const matchesEmail = cleanEmail && c.email?.toLowerCase() === cleanEmail;
      const matchesPhone = cleanPhone && c.phone && c.phone.replace(/\D/g, "").includes(cleanPhone.slice(-8));
      const matchesName = cleanName && c.fullName?.toLowerCase() === cleanName;
      return matchesEmail || matchesPhone || matchesName;
    });
  }, [contactInquiries, cleanEmail, cleanPhone, cleanName]);

  // Aggregate Metrics
  const totalLifetimeSpent = customerOrders.reduce((acc, o) => acc + (o.totalAmount || 0), 0);
  const totalOrdersCount = customerOrders.length || matchedUser?.ordersCount || 0;
  const userTier = matchedUser?.membershipTier || (totalLifetimeSpent > 100000 ? "Platinum" : totalLifetimeSpent > 30000 ? "Gold" : "Customer");

  // Cumulative Staff Internal Notes
  const allInternalNotes = useMemo(() => {
    const notes: { ticketNumber: string; note: string; date: string }[] = [];
    pastTickets.forEach((t) => {
      (t.internalNotes || []).forEach((n) => {
        notes.push({
          ticketNumber: t.ticketNumber,
          note: n,
          date: t.createdAt,
        });
      });
    });
    return notes;
  }, [pastTickets]);

  // Add staff note to current ticket or latest ticket
  const handleAddStaffNote = () => {
    if (!newStaffNote.trim()) return;
    const targetTicket =
      (currentTicketId ? supportTickets.find((t) => t.id === currentTicketId) : null) ||
      pastTickets[0];

    if (!targetTicket) {
      addToast("নোট যুক্ত করার জন্য কোনো সক্রিয় টিকেট পাওয়া যায়নি", "warning");
      return;
    }

    const stamp = `${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} - ${currentUser?.name || "Agent"}: ${newStaffNote.trim()}`;
    const updatedNotes = [...(targetTicket.internalNotes || []), stamp];
    updateSupportTicket(targetTicket.id, { internalNotes: updatedNotes });
    setNewStaffNote("");
    addToast("গ্রাহক হিস্টোরিতে ইন্টারনাল স্টাফ নোট যুক্ত হয়েছে!", "success");
  };

  if (!isAuthorized) {
    return (
      <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-center space-y-2">
        <Lock className="w-5 h-5 text-slate-400 mx-auto" />
        <p className="text-xs font-bold text-slate-600">
          গ্রাহকের হিস্টোরি ও ইন্টারনাল ডকুমেন্টেশন শুধুমাত্র অ্যাডমিন প্যানেলে সংরক্ষিত।
        </p>
      </div>
    );
  }

  return (
    <div
      className={`bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col overflow-hidden text-left ${className}`}
    >
      {/* ------------------------------------------------------------- */}
      {/* TOP HEADER: CUSTOMER 360° PROFILE CARD */}
      {/* ------------------------------------------------------------- */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-4 text-white space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-black text-sm uppercase shadow-inner">
                {customerName ? customerName.slice(0, 2) : "CU"}
              </div>
              <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-slate-900" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h4 className="font-black text-white text-sm truncate">
                  {customerName || matchedUser?.name || "সম্মানিত গ্রাহক"}
                </h4>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1">
                  <Crown className="w-3 h-3 text-amber-300" />
                  {userTier}
                </span>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-slate-300 truncate">
                {customerPhone && (
                  <span className="flex items-center gap-1 font-mono">
                    <Phone className="w-3 h-3 text-indigo-400" />
                    {customerPhone}
                  </span>
                )}
                {customerEmail && (
                  <span className="flex items-center gap-1 truncate">
                    <Mail className="w-3 h-3 text-indigo-400" />
                    {customerEmail}
                  </span>
                )}
              </div>
            </div>
          </div>

          <span className="text-[10px] font-bold text-indigo-300 bg-indigo-900/60 border border-indigo-700/50 px-2.5 py-1 rounded-lg shrink-0 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
            <span>অ্যাডমিন ভিউ</span>
          </span>
        </div>

        {/* Lifetime Quick Metrics */}
        <div className="grid grid-cols-3 gap-2 bg-slate-950/70 p-2.5 rounded-xl border border-indigo-900/60 text-center">
          <div>
            <span className="text-[10px] text-slate-400 block font-semibold">লাইফটাইম স্পেন্ড</span>
            <strong className="text-emerald-400 text-xs font-mono font-black">
              ৳{totalLifetimeSpent.toLocaleString()}
            </strong>
          </div>
          <div className="border-l border-slate-800">
            <span className="text-[10px] text-slate-400 block font-semibold">মোট অর্ডার</span>
            <strong className="text-indigo-300 text-xs font-black font-mono">
              {totalOrdersCount}টি
            </strong>
          </div>
          <div className="border-l border-slate-800">
            <span className="text-[10px] text-slate-400 block font-semibold">পূর্বের চ্যাট/টিকেট</span>
            <strong className="text-purple-300 text-xs font-black font-mono">
              {pastTickets.length}টি
            </strong>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* NAVIGATION TABS */}
      {/* ------------------------------------------------------------- */}
      <div className="flex items-center border-b border-slate-200 bg-slate-50/80 px-2 pt-2 gap-1 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab("chats")}
          className={`px-3 py-2 text-xs font-bold rounded-t-xl transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
            activeTab === "chats"
              ? "bg-white text-indigo-600 border-t-2 border-indigo-600 shadow-2xs font-black"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>পূর্বের চ্যাট ({pastTickets.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("orders")}
          className={`px-3 py-2 text-xs font-bold rounded-t-xl transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
            activeTab === "orders"
              ? "bg-white text-indigo-600 border-t-2 border-indigo-600 shadow-2xs font-black"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <ShoppingBag className="w-3.5 h-3.5" />
          <span>পূর্বের অর্ডার ({customerOrders.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("documents")}
          className={`px-3 py-2 text-xs font-bold rounded-t-xl transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
            activeTab === "documents"
              ? "bg-white text-indigo-600 border-t-2 border-indigo-600 shadow-2xs font-black"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>
            ডকুমেন্টস (
            {customerReturns.length +
              customerCompromises.length +
              customerMembershipOrders.length +
              customerInquiries.length}
            )
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("notes")}
          className={`px-3 py-2 text-xs font-bold rounded-t-xl transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
            activeTab === "notes"
              ? "bg-white text-amber-600 border-t-2 border-amber-600 shadow-2xs font-black"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>স্টাফ নোটস ({allInternalNotes.length})</span>
        </button>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* TAB CONTENT PANELS */}
      {/* ------------------------------------------------------------- */}
      <div className="p-3.5 flex-1 overflow-y-auto max-h-[460px] space-y-3">
        {/* TAB 1: PREVIOUS CHATS & TICKETS */}
        {activeTab === "chats" && (
          <div className="space-y-2.5">
            {pastTickets.length === 0 ? (
              <div className="text-center py-8 text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <MessageSquare className="w-6 h-6 mx-auto mb-1 opacity-50" />
                <p className="text-xs font-bold">এই গ্রাহকের কোনো পূর্ববর্তী চ্যাট বা টিকেট নেই</p>
                <span className="text-[10px]">এটি তার প্রথম যোগাযোগ হতে পারে</span>
              </div>
            ) : (
              pastTickets.map((t) => {
                const isCurrent = t.id === currentTicketId;
                const isExpanded = expandedTicketId === t.id;
                const channelColor =
                  t.channel === "Live Chat"
                    ? "bg-cyan-50 text-cyan-700 border-cyan-200"
                    : t.channel === "WhatsApp"
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : t.channel === "Phone"
                    ? "bg-purple-50 text-purple-700 border-purple-200"
                    : "bg-indigo-50 text-indigo-700 border-indigo-200";

                return (
                  <div
                    key={t.id}
                    className={`p-3 rounded-xl border transition-all ${
                      isCurrent
                        ? "bg-indigo-50/70 border-indigo-300 ring-1 ring-indigo-400/40"
                        : "bg-white border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-mono text-[10px] font-black text-indigo-600 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                            {t.ticketNumber}
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${channelColor}`}>
                            {t.channel || "Web Ticket"}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              t.status === "Resolved" || t.status === "Closed"
                                ? "bg-emerald-100 text-emerald-800"
                                : t.status === "In Progress"
                                ? "bg-amber-100 text-amber-800"
                                : "bg-blue-100 text-blue-800"
                            }`}
                          >
                            {t.status}
                          </span>
                          {isCurrent && (
                            <span className="text-[10px] font-black bg-indigo-600 text-white px-1.5 py-0.5 rounded">
                              বর্তমান সক্রিয়
                            </span>
                          )}
                        </div>

                        <h5 className="font-bold text-slate-900 text-xs mt-1 line-clamp-1">
                          {t.subject}
                        </h5>

                        <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                          <span>{t.createdAt}</span>
                          <span>•</span>
                          <span>মেসেজ: {t.messages?.length || 0}টি</span>
                          {t.csatRating && (
                            <span className="text-amber-500 font-bold">
                              ★ {t.csatRating}/5
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => setExpandedTicketId(isExpanded ? null : t.id)}
                          className="p-1 rounded-lg hover:bg-slate-100 text-slate-500 transition cursor-pointer"
                          title="চ্যাট হিস্টোরি দেখুন"
                        >
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* EXPANDED MESSAGE TRANSCRIPT */}
                    {isExpanded && (
                      <div className="mt-2.5 pt-2 border-t border-slate-200/80 space-y-2 text-xs">
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">
                          চ্যাট ট্রান্সক্রিপ্ট ও বার্তা লগ:
                        </span>
                        <div className="max-h-48 overflow-y-auto space-y-1.5 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                          {t.messages && t.messages.length > 0 ? (
                            t.messages.map((m) => (
                              <div
                                key={m.id}
                                className={`p-2 rounded-lg text-[11px] leading-relaxed ${
                                  m.sender === "Customer"
                                    ? "bg-white border border-slate-200 text-slate-800"
                                    : "bg-indigo-600 text-white"
                                }`}
                              >
                                <div className="flex justify-between items-center text-[9px] font-bold opacity-80 mb-0.5">
                                  <span>{m.senderName || m.sender}</span>
                                  <span>{m.createdAt}</span>
                                </div>
                                <p className="whitespace-pre-line">{m.message}</p>
                              </div>
                            ))
                          ) : (
                            <p className="text-[11px] text-slate-400 text-center py-2">
                              কোনো বার্তা সংরক্ষিত নেই
                            </p>
                          )}
                        </div>

                        {onSelectTicket && !isCurrent && (
                          <button
                            type="button"
                            onClick={() => onSelectTicket(t)}
                            className="w-full py-1.5 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-lg transition flex items-center justify-center gap-1.5"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span>এই টিকেটটি ওপেন করুন</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* TAB 2: PREVIOUS ORDERS */}
        {activeTab === "orders" && (
          <div className="space-y-2.5">
            {customerOrders.length === 0 ? (
              <div className="text-center py-8 text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <ShoppingBag className="w-6 h-6 mx-auto mb-1 opacity-50" />
                <p className="text-xs font-bold">এই গ্রাহকের পূর্বের কোনো অর্ডার পাওয়া যায়নি</p>
              </div>
            ) : (
              customerOrders.map((o) => {
                const isExpanded = expandedOrderId === o.id;
                return (
                  <div
                    key={o.id}
                    className="p-3 bg-white rounded-xl border border-slate-200 hover:border-slate-300 transition-all space-y-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-mono text-xs font-black text-indigo-700">
                            #{o.id}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              o.status === "Delivered"
                                ? "bg-emerald-100 text-emerald-800"
                                : o.status === "Shipped"
                                ? "bg-blue-100 text-blue-800"
                                : o.status === "Cancelled"
                                ? "bg-rose-100 text-rose-800"
                                : "bg-amber-100 text-amber-800"
                            }`}
                          >
                            {o.status}
                          </span>
                          <span className="text-[10px] bg-slate-100 text-slate-700 font-bold px-1.5 py-0.5 rounded">
                            {o.paymentMethod}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-1">
                          <span>{o.createdAt}</span>
                          <span>•</span>
                          <span>পণ্য সংখ্যা: {o.items?.length || 1}টি</span>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="font-mono font-black text-xs text-slate-900">
                          ৳{o.totalAmount?.toLocaleString()}
                        </div>
                        <button
                          type="button"
                          onClick={() => setExpandedOrderId(isExpanded ? null : o.id)}
                          className="text-[10px] text-indigo-600 hover:underline font-bold mt-0.5 block"
                        >
                          {isExpanded ? "সংক্ষেপ" : "আইটেমস ↓"}
                        </button>
                      </div>
                    </div>

                    {/* Expandable Item List */}
                    {isExpanded && o.items && o.items.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-slate-100 space-y-1.5 text-xs bg-slate-50 p-2 rounded-lg">
                        {o.items.map((item, idx) => (
                          <div key={idx} className="flex justify-between items-center text-[11px]">
                            <span className="font-medium text-slate-800 truncate max-w-[200px]">
                              {item.productName || item.name} × {item.quantity}
                            </span>
                            <span className="font-mono font-bold text-slate-700">
                              ৳{(item.price * item.quantity).toLocaleString()}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* TAB 3: DOCUMENTATION, RETURNS, COMPROMISES & INQUIRIES */}
        {activeTab === "documents" && (
          <div className="space-y-3">
            {/* 1. Return Requests Section */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-black uppercase text-slate-500 tracking-wider flex items-center gap-1">
                <RotateCcw className="w-3.5 h-3.5 text-rose-500" />
                <span>রিটার্ন ও রিফান্ড ডকুমেন্টস ({customerReturns.length})</span>
              </span>
              {customerReturns.length === 0 ? (
                <p className="text-[11px] text-slate-400 bg-slate-50 p-2 rounded-lg border border-slate-200">
                  কোনো রিটার্ন বা ক্ষতিপূরণ আবেদন নেই
                </p>
              ) : (
                customerReturns.map((r) => (
                  <div key={r.id} className="p-2.5 bg-rose-50/60 border border-rose-200 rounded-xl text-xs space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-rose-900 font-mono">#{r.id}</span>
                      <span className="text-[10px] font-bold bg-white text-rose-700 px-2 py-0.5 rounded border border-rose-200">
                        {r.status}
                      </span>
                    </div>
                    <p className="text-slate-800 text-[11px]">
                      <strong>পণ্য:</strong> {r.productName} · অর্ডার #{r.orderNumber}
                    </p>
                    <p className="text-slate-600 text-[10px]">
                      <strong>কারণ:</strong> {r.reason}
                    </p>
                    {r.adminNotes && (
                      <p className="text-emerald-700 text-[10px] font-semibold">
                        অ্যাডমিন নোট: {r.adminNotes}
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* 2. Price Compromise Negotiations */}
            <div className="space-y-1.5 pt-2 border-t border-slate-100">
              <span className="text-[11px] font-black uppercase text-slate-500 tracking-wider flex items-center gap-1">
                <Tag className="w-3.5 h-3.5 text-amber-500" />
                <span>প্রাইস কম্প্রোমাইজ / দরদাম রেকর্ড ({customerCompromises.length})</span>
              </span>
              {customerCompromises.length === 0 ? (
                <p className="text-[11px] text-slate-400 bg-slate-50 p-2 rounded-lg border border-slate-200">
                  কোনো পূর্ববর্তী দরদাম রেকর্ড নেই
                </p>
              ) : (
                customerCompromises.map((p) => (
                  <div key={p.id} className="p-2.5 bg-amber-50/60 border border-amber-200 rounded-xl text-xs space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-amber-900 truncate max-w-[180px]">{p.productName}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        p.status === "Approved" ? "bg-emerald-100 text-emerald-800" : "bg-white text-slate-700"
                      }`}>
                        {p.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-slate-600">
                      <span>মূল্য: ৳{p.originalPrice.toLocaleString()}</span>
                      <span>➔</span>
                      <span>অনুরোধ: ৳{p.requestedPrice.toLocaleString()}</span>
                      {p.approvedPrice && (
                        <span className="text-emerald-700 font-bold">
                          অনুমোদিত: ৳{p.approvedPrice.toLocaleString()}
                        </span>
                      )}
                    </div>
                    {p.adminNote && (
                      <p className="text-[10px] text-amber-800 italic">
                        নোট: {p.adminNote}
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* 3. Membership Card Orders */}
            {customerMembershipOrders.length > 0 && (
              <div className="space-y-1.5 pt-2 border-t border-slate-100">
                <span className="text-[11px] font-black uppercase text-slate-500 tracking-wider flex items-center gap-1">
                  <Crown className="w-3.5 h-3.5 text-indigo-500" />
                  <span>মেম্বারশিপ ফিজিক্যাল কার্ড ডেলিভারি ({customerMembershipOrders.length})</span>
                </span>
                {customerMembershipOrders.map((m) => (
                  <div key={m.id} className="p-2.5 bg-indigo-50/60 border border-indigo-200 rounded-xl text-xs space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-indigo-900">{m.tier} কার্ড ক্লাব</span>
                      <span className="text-[10px] font-bold bg-white text-indigo-700 px-2 py-0.5 rounded border border-indigo-200">
                        {m.cardStatus}
                      </span>
                    </div>
                    {m.courierTrackingCode && (
                      <p className="text-[10px] font-mono text-indigo-800">
                        ট্র্যাকিং কোড: {m.courierTrackingCode}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* 4. Contact Us Inquiries */}
            {customerInquiries.length > 0 && (
              <div className="space-y-1.5 pt-2 border-t border-slate-100">
                <span className="text-[11px] font-black uppercase text-slate-500 tracking-wider flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-blue-500" />
                  <span>ওয়েবসাইট যোগাযোগ বার্তা ({customerInquiries.length})</span>
                </span>
                {customerInquiries.map((c) => (
                  <div key={c.id} className="p-2.5 bg-blue-50/60 border border-blue-200 rounded-xl text-xs space-y-1">
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="font-bold text-blue-900 truncate">{c.subject}</span>
                      <span className="text-slate-400">{c.createdAt}</span>
                    </div>
                    <p className="text-[11px] text-slate-700 line-clamp-2">{c.message}</p>
                    {c.reply && (
                      <p className="text-[10px] text-emerald-700 bg-white p-1 rounded">
                        উওর: {c.reply}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: INTERNAL STAFF NOTES & AUDIT TRAIL */}
        {activeTab === "notes" && (
          <div className="space-y-3">
            {/* Input to add staff note */}
            <div className="p-2.5 bg-amber-50/80 border border-amber-200 rounded-xl space-y-2">
              <span className="text-[10px] font-black text-amber-900 uppercase tracking-wider block">
                এই গ্রাহকের জন্য গোপন স্টাফ নোট যোগ করুন (Private):
              </span>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newStaffNote}
                  onChange={(e) => setNewStaffNote(e.target.value)}
                  placeholder="যেমন: VIP গ্রাহক, দ্রুত সমাধান চান, বিশেষ যত্ন নিন..."
                  className="flex-1 bg-white border border-amber-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleAddStaffNote();
                  }}
                />
                <button
                  type="button"
                  onClick={handleAddStaffNote}
                  className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-lg transition shrink-0 cursor-pointer"
                >
                  যোগ করুন
                </button>
              </div>
            </div>

            {/* List of past notes */}
            <div className="space-y-2">
              {allInternalNotes.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-6 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  এই গ্রাহকের জন্য এখনো কোনো গোপন নোট সংরক্ষিত হয়নি
                </p>
              ) : (
                allInternalNotes.map((n, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1"
                  >
                    <div className="flex justify-between items-center text-[10px] text-slate-400">
                      <span className="font-mono font-bold text-indigo-600">
                        টিকেট: {n.ticketNumber}
                      </span>
                      <span>{n.date}</span>
                    </div>
                    <p className="text-slate-800 font-medium text-[11px]">{n.note}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
