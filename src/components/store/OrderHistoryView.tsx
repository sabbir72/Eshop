import React, { useState } from "react";
import { useStore } from "../../context/StoreContext";
import { Order, OrderStatus } from "../../types";
import { PrintableDocumentData } from "../../types/print";
import { buildOrderInvoiceData } from "../../utils/printDocumentBuilder";
import { EnterprisePrintModal } from "../common/EnterprisePrintModal";
import { formatNumber } from "../../utils/numberUtils";
import {
  PackageCheck,
  Truck,
  CheckCircle2,
  Clock,
  Download,
  Search,
  RotateCcw,
  Star,
  RefreshCw,
  ShoppingBag,
  X,
  FileText,
  Printer,
  Gift,
  MessageSquare,
} from "lucide-react";

export const OrderHistoryView: React.FC = () => {
  const { orders, currentUser, settings, addToCart, products, addReview, addToast, setStoreView, activeRole } = useStore();
  const [filterStatus, setFilterStatus] = useState<string>("All");
  const [searchTracking, setSearchTracking] = useState<string>("");

  const [activePrintData, setActivePrintData] = useState<PrintableDocumentData | null>(null);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState<boolean>(false);

  const openPrintModal = (data: PrintableDocumentData) => {
    setActivePrintData(data);
    setIsPrintModalOpen(true);
  };

  // Return Request Modal State
  const [selectedOrderForReturn, setSelectedOrderForReturn] = useState<Order | null>(null);
  const [returnReason, setReturnReason] = useState<string>("Defective/Damaged item");
  const [returnNotes, setReturnNotes] = useState<string>("");

  // Review Modal State
  const [reviewModalItem, setReviewModalItem] = useState<{ productId: string; productName: string; image: string } | null>(null);
  const [reviewRating, setReviewRating] = useState<number>(5);
  const [reviewComment, setReviewComment] = useState<string>("");

  if (activeRole === "Guest" || currentUser.role === "Guest") {
    return (
      <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center max-w-md mx-auto my-12 space-y-4 shadow-sm">
        <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto">
          <ShoppingBag className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-black text-slate-900">Sign In to View Orders</h2>
        <p className="text-xs text-slate-600 font-medium">
          Please log in to your account to view your purchase history, invoices, and live shipment tracking.
        </p>
        <button
          onClick={() => setStoreView("home")}
          className="bg-indigo-600 text-white font-bold text-xs px-5 py-2.5 rounded-xl hover:bg-indigo-700 transition-colors shadow-sm"
        >
          Return to Home
        </button>
      </div>
    );
  }

  const userOrders = orders.filter((o) => {
    if (filterStatus !== "All" && o.orderStatus !== filterStatus) return false;
    if (searchTracking.trim()) {
      const q = searchTracking.toLowerCase();
      const matchNum = o.orderNumber.toLowerCase().includes(q);
      const matchTrack = (o.trackingNumber || "").toLowerCase().includes(q);
      if (!matchNum && !matchTrack) return false;
    }
    return true;
  });

  const trackingSteps: OrderStatus[] = [
    "Order Placed",
    "Payment Confirmed",
    "Processing",
    "Packed",
    "Shipped",
    "Out for Delivery",
    "Delivered",
  ];

  const getStepProgress = (status: OrderStatus) => {
    switch (status) {
      case "Order Placed":
      case "Pending":
        return 1;
      case "Payment Confirmed":
        return 2;
      case "Processing":
        return 3;
      case "Packed":
        return 4;
      case "Shipped":
        return 5;
      case "Out for Delivery":
        return 6;
      case "Delivered":
      case "Completed":
        return 7;
      default:
        return 0; // Cancelled / Returned
    }
  };

  const handleBuyAgain = (order: Order) => {
    order.items.forEach((item) => {
      const prod = products.find((p) => p.id === item.productId);
      if (prod) {
        addToCart(prod, "", "", item.quantity);
      }
    });
    addToast(`Re-added ${order.items.length} items from ${order.orderNumber} to cart!`, "success");
  };

  const handleReturnSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrderForReturn) return;
    addToast(`Return Request submitted for ${selectedOrderForReturn.orderNumber}! Support will contact you shortly.`, "success");
    setSelectedOrderForReturn(null);
    setReturnNotes("");
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewModalItem || !reviewComment.trim()) return;

    addReview({
      productId: reviewModalItem.productId,
      productName: reviewModalItem.productName,
      productImage: reviewModalItem.image,
      customerName: currentUser.name || "Verified Customer",
      customerAvatar: currentUser.avatar,
      rating: reviewRating,
      comment: reviewComment,
      verifiedBuyer: true,
    });

    addToast(`Thank you! Review published for ${reviewModalItem.productName}`, "success");
    setReviewModalItem(null);
    setReviewComment("");
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header Banner */}
      <div className="bg-slate-900 text-white p-6 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight">Order Tracking & Purchase History</h1>
          <p className="text-xs text-slate-300">Track 7-step delivery status, download tax invoices, reorder & write reviews</p>
        </div>

        {/* Search Order Number or Tracking ID */}
        <div className="relative w-full md:w-72">
          <input
            type="text"
            value={searchTracking}
            onChange={(e) => setSearchTracking(e.target.value)}
            placeholder="Search Order # or Tracking ID..."
            className="w-full bg-slate-800 text-xs text-white placeholder-slate-400 pl-8 pr-3 py-2 rounded-xl border border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-2 text-xs font-bold text-slate-600">
        {["All", "Pending", "Processing", "Shipped", "Out for Delivery", "Delivered", "Cancelled"].map((st) => (
          <button
            key={st}
            onClick={() => setFilterStatus(st)}
            className={`px-3 py-1.5 rounded-xl transition-colors ${
              filterStatus === st ? "bg-indigo-600 text-white" : "bg-white border border-slate-200 hover:bg-slate-50"
            }`}
          >
            {st}
          </button>
        ))}
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {userOrders.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-3">
            <PackageCheck className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-lg font-bold text-slate-800">No Orders Found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              You haven't placed any orders under this filter status yet.
            </p>
            <button
              onClick={() => setStoreView("products")}
              className="bg-indigo-600 text-white font-bold text-xs px-4 py-2 rounded-xl"
            >
              Shop Now
            </button>
          </div>
        ) : (
          userOrders.map((order) => {
            const currentStep = getStepProgress(order.orderStatus);
            const isDelivered = order.orderStatus === "Delivered" || order.orderStatus === "Completed";

            return (
              <div key={order.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                {/* Order Header */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-3 text-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-slate-900 text-sm">{order.orderNumber}</span>
                      {order.isGiftWrapped && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-pink-100 text-pink-700">
                          <Gift className="w-3 h-3 text-pink-600" /> Gift Wrapped (+{settings.currencySymbol}{order.giftWrappingCharge || 50})
                        </span>
                      )}
                    </div>
                    <span className="text-slate-500 text-[11px]">Placed on: {order.createdAt} • Est. Delivery: 2-3 Days</span>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`px-2.5 py-1 rounded-full font-bold text-[11px] ${
                        isDelivered
                          ? "bg-emerald-100 text-emerald-800"
                          : order.orderStatus === "Cancelled"
                          ? "bg-rose-100 text-rose-800"
                          : "bg-indigo-100 text-indigo-800"
                      }`}
                    >
                      Status: {order.orderStatus}
                    </span>

                    <button
                      onClick={() => openPrintModal(buildOrderInvoiceData(order, settings.currencySymbol, "customer"))}
                      className="flex items-center gap-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold px-3 py-1.5 rounded-xl border border-indigo-200 transition-colors"
                    >
                      <Printer className="w-3.5 h-3.5 text-indigo-600" /> Print Invoice
                    </button>

                    <button
                      onClick={() => handleBuyAgain(order)}
                      className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1.5 rounded-xl shadow-xs transition-colors"
                    >
                      <RefreshCw className="w-3.5 h-3.5" /> Buy Again
                    </button>
                  </div>
                </div>

                {/* 7-Step Timeline Progress Bar */}
                {order.orderStatus !== "Cancelled" && order.orderStatus !== "Returned" && (
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-1 text-[10px] font-bold text-slate-600 text-center">
                      {trackingSteps.map((stepName, idx) => (
                        <span
                          key={stepName}
                          className={`${
                            currentStep >= idx + 1 ? "text-indigo-600 font-black" : "text-slate-400"
                          }`}
                        >
                          {idx + 1}. {stepName}
                        </span>
                      ))}
                    </div>

                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-indigo-600 h-full transition-all duration-500"
                        style={{ width: `${(currentStep / 7) * 100}%` }}
                      ></div>
                    </div>

                    {order.trackingNumber && (
                      <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 pt-1">
                        <span className="flex items-center gap-1">
                          <Truck className="w-3.5 h-3.5 text-indigo-600" /> Tracking Number:{" "}
                          <strong className="text-slate-900 font-mono">{order.trackingNumber}</strong>
                        </span>
                        <span className="text-emerald-600 font-bold">SMS & Email Notifications Sent</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Items Breakdown */}
                <div className="space-y-2">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs py-2 border-b border-slate-100">
                      <div className="flex items-center gap-3">
                        <img src={item.image} alt={item.productName} className="w-10 h-10 object-contain bg-slate-50 rounded-md p-1 border" />
                        <div>
                          <span className="font-bold text-slate-900 block">{item.productName}</span>
                          <span className="text-[11px] text-slate-500">{item.variantSummary} • Qty: {item.quantity}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        {isDelivered && (
                          <button
                            onClick={() =>
                              setReviewModalItem({
                                productId: item.productId,
                                productName: item.productName,
                                image: item.image,
                              })
                            }
                            className="text-[11px] font-bold text-amber-600 hover:text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200 flex items-center gap-1"
                          >
                            <Star className="w-3 h-3 fill-amber-400" /> Review
                          </button>
                        )}

                        <span className="font-bold text-slate-900 font-mono">
                          {settings.currencySymbol}{formatNumber(item.total, 2)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Gift Message & Recipient SMS Card if attached */}
                {(order.isGiftWrapped || order.giftMessage) && (
                  <div className="bg-pink-50/70 p-3 rounded-xl border border-pink-200/80 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-pink-700 flex items-center gap-1">
                        <Gift className="w-3.5 h-3.5 text-pink-600" /> Gift Note Attached
                      </span>
                      {order.giftSmsEnabled && order.giftRecipientPhone && (
                        <span className="text-[10px] font-semibold text-purple-700 bg-purple-100/80 px-2 py-0.5 rounded-md flex items-center gap-1">
                          <MessageSquare className="w-3 h-3" /> SMS Dispatched to: {order.giftRecipientPhone} ({order.giftSmsStatus || "Sent"})
                        </span>
                      )}
                    </div>
                    {order.giftMessage && (
                      <p className="text-slate-700 italic font-serif">"{order.giftMessage}"</p>
                    )}
                    {order.giftSenderName && (
                      <p className="text-[10px] text-slate-500 text-right font-medium">From: {order.giftSenderName}</p>
                    )}
                  </div>
                )}

                {/* Order Footer Totals & Return Request Trigger */}
                <div className="flex flex-wrap items-center justify-between text-xs pt-1 font-bold text-slate-800 gap-2">
                  <div>
                    <span>Payment Method: {order.paymentMethod} ({order.paymentStatus})</span>
                    <span className="text-slate-400 mx-2">•</span>
                    <span>Shipping: {order.shippingAddress.street}, {order.shippingAddress.city}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    {isDelivered && (
                      <button
                        onClick={() => setSelectedOrderForReturn(order)}
                        className="text-slate-600 hover:text-rose-600 underline font-semibold text-xs flex items-center gap-1"
                      >
                        <RotateCcw className="w-3.5 h-3.5" /> Return Request
                      </button>
                    )}

                    <span>
                      Grand Total: <strong className="text-indigo-600 text-sm font-mono">{settings.currencySymbol}{formatNumber(order.total, 2)}</strong>
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Return Request Modal */}
      {selectedOrderForReturn && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-rose-600" /> Return Request ({selectedOrderForReturn.orderNumber})
              </h3>
              <button onClick={() => setSelectedOrderForReturn(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleReturnSubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Reason for Return</label>
                <select
                  value={returnReason}
                  onChange={(e) => setReturnReason(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-semibold"
                >
                  <option value="Defective/Damaged item">Defective or Damaged Item</option>
                  <option value="Wrong size/color received">Wrong Size / Color Received</option>
                  <option value="Item not as described">Item Not As Described</option>
                  <option value="Changed mind">Changed Mind (7-Day Policy)</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Additional Notes / Comments</label>
                <textarea
                  rows={3}
                  value={returnNotes}
                  onChange={(e) => setReturnNotes(e.target.value)}
                  placeholder="Describe the issue in detail..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedOrderForReturn(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold shadow-md"
                >
                  Submit Return Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Write Review Modal */}
      {reviewModalItem && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Star className="w-4 h-4 text-amber-500 fill-amber-400" /> Write Product Review
              </h3>
              <button onClick={() => setReviewModalItem(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-3 bg-slate-50 p-2.5 rounded-xl border">
              <img src={reviewModalItem.image} alt="Product" className="w-10 h-10 object-contain" />
              <span className="font-bold text-xs text-slate-900">{reviewModalItem.productName}</span>
            </div>

            <form onSubmit={handleReviewSubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Select Rating</label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewRating(star)}
                      className="p-1 text-amber-400 hover:scale-110 transition-transform"
                    >
                      <Star className={`w-6 h-6 ${star <= reviewRating ? "fill-amber-400" : "text-slate-300"}`} />
                    </button>
                  ))}
                  <span className="font-bold text-slate-900 ml-2">{reviewRating} / 5</span>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Your Review Comment</label>
                <textarea
                  rows={3}
                  required
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Share your experience with this product..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setReviewModalItem(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-md"
                >
                  Post Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {activePrintData && (
        <EnterprisePrintModal
          data={activePrintData}
          isOpen={isPrintModalOpen}
          onClose={() => setIsPrintModalOpen(false)}
        />
      )}
    </div>
  );
};
