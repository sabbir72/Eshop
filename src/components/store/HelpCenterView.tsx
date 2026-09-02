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
} from "lucide-react";
import { ReturnRequest, SupportTicket } from "../../types";

export const HelpCenterView: React.FC = () => {
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
  } = useStore();

  const [activeTab, setActiveTab] = useState<"faq" | "returns" | "tickets">("faq");
  const [selectedCatId, setSelectedCatId] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [openFaqId, setOpenFaqId] = useState<string | null>(null);

  // New Return Form Modal
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(orders[0]?.id || "");
  const [returnReason, setReturnReason] = useState<ReturnRequest["reason"]>("Defective/Faulty");
  const [returnDetails, setReturnDetails] = useState("");
  const [returnProofImage, setReturnProofImage] = useState("");
  const [returnSubmitted, setReturnSubmitted] = useState(false);

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

  const handleReturnSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const targetOrder = orders.find((o) => o.id === selectedOrderId) || orders[0];
    const targetProduct = targetOrder?.items[0]?.product;

    addReturnRequest({
      orderId: targetOrder?.id || "ord-1",
      orderNumber: targetOrder?.orderNumber || "ORD-2026-1001",
      customerName: currentUser.name,
      customerEmail: currentUser.email,
      customerPhone: currentUser.phone,
      productId: targetProduct?.id || "prod-1",
      productName: targetProduct?.title || "Purchased Product",
      productImage: targetProduct?.images[0] || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80",
      reason: returnReason,
      details: returnDetails,
      images: [returnProofImage || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=400&q=80"],
      refundAmount: targetOrder?.totalAmount || 1500,
    });

    setReturnSubmitted(true);
    setReturnDetails("");
    setReturnProofImage("");
  };

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

        {/* Navigation Tabs */}
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => setActiveTab("faq")}
            className={`px-5 py-2.5 rounded-2xl text-sm font-bold transition-all flex items-center gap-2 ${
              activeTab === "faq"
                ? "bg-indigo-600 text-white shadow-md"
                : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            <HelpCircle className="w-4 h-4" /> FAQs & Articles
          </button>
          <button
            onClick={() => setActiveTab("returns")}
            className={`px-5 py-2.5 rounded-2xl text-sm font-bold transition-all flex items-center gap-2 ${
              activeTab === "returns"
                ? "bg-indigo-600 text-white shadow-md"
                : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            <RotateCcw className="w-4 h-4" /> 7-Day Returns & Claims
          </button>
          <button
            onClick={() => setActiveTab("tickets")}
            className={`px-5 py-2.5 rounded-2xl text-sm font-bold transition-all flex items-center gap-2 ${
              activeTab === "tickets"
                ? "bg-indigo-600 text-white shadow-md"
                : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            <MessageSquare className="w-4 h-4" /> Support Tickets
          </button>
        </div>

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

        {/* TAB 2: RETURNS & CLAIMS */}
        {activeTab === "returns" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
              <div>
                <h3 className="font-bold text-slate-900 text-lg">7-Day Hassle-Free Returns</h3>
                <p className="text-xs text-slate-500">Submit return claims for damaged, incorrect, or defective products.</p>
              </div>
              <button
                onClick={() => {
                  setReturnSubmitted(false);
                  setShowReturnModal(true);
                }}
                className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-indigo-700 transition flex items-center gap-2"
              >
                <Plus className="w-4 h-4" /> Submit Return Request
              </button>
            </div>

            {/* My Return Requests Table */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="p-5 border-b font-bold text-slate-900 text-sm">My Active Return Requests</div>
              <div className="divide-y">
                {returnRequests.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 text-sm">No return claims submitted.</div>
                ) : (
                  returnRequests.map((ret) => (
                    <div key={ret.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <img src={ret.productImage} alt={ret.productName} className="w-12 h-12 object-cover rounded-xl border" />
                        <div>
                          <div className="font-bold text-slate-900 text-sm">{ret.productName}</div>
                          <div className="text-xs text-slate-500">
                            Claim #{ret.requestNumber} • Order #{ret.orderNumber}
                          </div>
                          <div className="text-xs text-red-600 font-semibold mt-0.5">Reason: {ret.reason}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <span className="text-xs text-slate-400 block">Refund Amount</span>
                          <span className="font-bold text-slate-900 text-sm">৳{ret.refundAmount.toLocaleString()}</span>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold ${
                            ret.status === "Refund Processed"
                              ? "bg-emerald-100 text-emerald-800"
                              : ret.status === "Approved"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {ret.status}
                        </span>
                      </div>
                    </div>
                  ))
                )}
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

        {/* RETURN CLAIM MODAL */}
        {showReturnModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b pb-3">
                <h3 className="font-bold text-slate-900 text-lg">Submit Return & Refund Claim</h3>
                <button
                  onClick={() => setShowReturnModal(false)}
                  className="text-slate-400 hover:text-slate-600 text-2xl font-bold"
                >
                  &times;
                </button>
              </div>

              {returnSubmitted ? (
                <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-3">
                  <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                  <h4 className="font-bold text-emerald-900 text-lg">Return Claim Created</h4>
                  <p className="text-xs text-emerald-700">
                    Our quality team will review your photos and approve free door-step pickup within 24 hours.
                  </p>
                  <button
                    onClick={() => setShowReturnModal(false)}
                    className="px-5 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold"
                  >
                    Close
                  </button>
                </div>
              ) : (
                <form onSubmit={handleReturnSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Select Order</label>
                    <select
                      value={selectedOrderId}
                      onChange={(e) => setSelectedOrderId(e.target.value)}
                      className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm bg-white"
                    >
                      {orders.map((o) => (
                        <option key={o.id} value={o.id}>
                          Order {o.orderNumber} - ৳{o.totalAmount.toLocaleString()}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Return Reason</label>
                    <select
                      value={returnReason}
                      onChange={(e) => setReturnReason(e.target.value as ReturnRequest["reason"])}
                      className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm bg-white"
                    >
                      <option value="Defective/Faulty">Defective/Faulty Product</option>
                      <option value="Wrong Item Received">Wrong Item Received</option>
                      <option value="Item Damaged in Transit">Item Damaged in Transit</option>
                      <option value="Size Issue">Size Issue</option>
                      <option value="Mind Changed">Mind Changed</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Details & Problem Description</label>
                    <textarea
                      rows={3}
                      value={returnDetails}
                      onChange={(e) => setReturnDetails(e.target.value)}
                      placeholder="Describe the issue in detail..."
                      className="w-full border border-slate-200 rounded-xl p-3 text-sm outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Defect Proof Image URL</label>
                    <input
                      type="url"
                      value={returnProofImage}
                      onChange={(e) => setReturnProofImage(e.target.value)}
                      placeholder="https://..."
                      className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none"
                    />
                  </div>

                  <div className="flex justify-end gap-3 pt-3 border-t">
                    <button
                      type="button"
                      onClick={() => setShowReturnModal(false)}
                      className="px-4 py-2 border text-slate-600 rounded-xl text-xs font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700"
                    >
                      Submit Return Claim
                    </button>
                  </div>
                </form>
              )}
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
      </div>
    </div>
  );
};
