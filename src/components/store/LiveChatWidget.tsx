import React, { useState, useRef, useEffect } from "react";
import {
  MessageSquare,
  X,
  Send,
  Headphones,
  Sparkles,
  PhoneCall,
  Tag,
  Truck,
  RotateCcw,
  ShieldCheck,
  Check,
  Copy,
} from "lucide-react";
import { useStore } from "../../context/StoreContext";
import { generateRealisticCustomerReply } from "../../services/aiRealisticReplyService";

interface ChatMsg {
  id: string;
  sender: "bot" | "user" | "agent";
  text: string;
  time: string;
  quickAction?: {
    type: "coupon" | "tracking" | "support_hotline" | "product_link";
    value: string;
    label: string;
  };
}

export const LiveChatWidget: React.FC = () => {
  const { currentUser, products, addToast, language } = useStore();
  const [isOpen, setIsOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [copiedCoupon, setCopiedCoupon] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const isBN = language === "BN";

  const [messages, setMessages] = useState<ChatMsg[]>([
    {
      id: "m-1",
      sender: "agent",
      text: isBN
        ? `আসসালামু আলাইকুম${currentUser?.name ? ` ${currentUser.name}` : ""}! 👋 স্মার্টশপ কাস্টমার কেয়ারে স্বাগতম। পণ্য সম্পর্কিত তথ্য, অর্ডার ট্র্যাকিং, ডেলিভারি বা অফার সংক্রান্ত যেকোনো প্রশ্নে আমি সাহায্য করতে প্রস্তুত।`
        : `Hello${currentUser?.name ? ` ${currentUser.name}` : ""}! 👋 Welcome to SmartShop Live Care. I'm your AI Support Agent ready to help with orders, product specs, bKash payments, and deals.`,
      time: "Just now",
      quickAction: {
        type: "coupon",
        value: "WELCOME5",
        label: isBN ? "WELCOME5 কোড ব্যবহার করুন" : "Apply code WELCOME5",
      },
    },
  ]);
  const [inputText, setInputText] = useState("");

  const quickChips = isBN
    ? [
        { label: "📦 অর্ডার ট্র্যাক", query: "আমার অর্ডার ট্র্যাকিং স্ট্যাটাস জানতে চাই" },
        { label: "🚚 ডেলিভারি চার্জ ও সময়", query: "ডেলিভারি চার্জ কত এবং কতদিন সময় লাগে?" },
        { label: "💳 বিকাশ ও পেমেন্ট", query: "বিকাশ বা ক্যাশ অন ডেলিভারিতে পেমেন্ট কীভাবে করব?" },
        { label: "🔄 ৭ দিনের রিটার্ন", query: "পণ্য পছন্দ না হলে বা ত্রুটি থাকলে রিটার্ন পলিসি কী?" },
        { label: "🎁 ডিসকাউন্ট কুপন", query: "বর্তমান কোনো ডিসকাউন্ট অফার বা কুপন কোড আছে কি?" },
        { label: "🛡️ পণ্য আসল তো?", query: "পণ্যগুলো কি ১০০% আসল? অফিসিয়াল ওয়ারেন্টি পাবো?" },
      ]
    : [
        { label: "📦 Track Order", query: "How do I track my current order status?" },
        { label: "🚚 Shipping & Rates", query: "What are your delivery charges and shipping times?" },
        { label: "💳 bKash & Payment", query: "What payment methods are supported including bKash and COD?" },
        { label: "🔄 7-Day Returns", query: "What is your replacement and return policy?" },
        { label: "🎁 Discount Coupons", query: "Are there any promo codes or discount coupons available?" },
        { label: "🛡️ Genuine & Warranty", query: "Are all products original and covered by official warranty?" },
      ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen, isTyping]);

  const executeSend = async (queryText: string) => {
    if (!queryText.trim() || isTyping) return;

    const userMsg: ChatMsg = {
      id: `u-${Date.now()}`,
      sender: "user",
      text: queryText,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText("");
    setIsTyping(true);

    try {
      const res = await fetch("/api/ai/agent/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          task: "customer_handling",
          payload: {
            customerMessage: queryText,
            customerType: currentUser ? "Registered Customer" : "Online Store Shopper",
            customerName: currentUser?.name || (isBN ? "সম্মানিত ক্রেতা" : "Valued Customer"),
            channel: "Storefront Live Support",
            preferredLanguage: isBN ? "bn" : "en",
          },
          storeContext: {
            productsCount: products.length,
            sampleProducts: products.slice(0, 5).map((p) => ({
              name: p.name,
              price: p.price,
              category: p.categoryName,
            })),
            deliveryChargeDhaka: 60,
            deliveryChargeOutside: 120,
            returnDays: 7,
          },
        }),
      });

      const data = await res.json();
      const reply = isBN
        ? (data.suggestedResponseBengali || data.suggestedResponseEnglish || data.reply)
        : (data.suggestedResponseEnglish || data.suggestedResponseBengali || data.reply);

      if (reply) {
        setMessages((prev) => [
          ...prev,
          {
            id: `b-${Date.now()}`,
            sender: "agent",
            text: reply,
            time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            quickAction: data.quickAction,
          },
        ]);
        setIsTyping(false);
        return;
      }
    } catch (_err) {
      // Graceful offline dynamic generation
    }

    // High quality offline fallback using the dynamic realistic engine
    setTimeout(() => {
      const fallbackResult = generateRealisticCustomerReply({
        customerMessage: queryText,
        customerName: currentUser?.name || "সম্মানিত ক্রেতা",
        storeContext: {
          productsCount: products.length,
          sampleProducts: products.slice(0, 5).map((p) => ({
            name: p.name,
            price: p.price,
            category: p.categoryName,
          })),
          deliveryChargeDhaka: 60,
          deliveryChargeOutside: 120,
          returnDays: 7,
        },
      });

      setMessages((prev) => [
        ...prev,
        {
          id: `b-${Date.now()}`,
          sender: "agent",
          text: fallbackResult.suggestedResponseBengali,
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          quickAction: fallbackResult.quickAction,
        },
      ]);
      setIsTyping(false);
    }, 600);
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    executeSend(inputText);
  };

  const copyCoupon = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCoupon(code);
    addToast?.(`Coupon code ${code} copied!`, "success");
    setTimeout(() => setCopiedCoupon(null), 3000);
  };

  return (
    <div className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-40">
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white p-3.5 sm:p-4 rounded-full shadow-2xl flex items-center gap-2.5 font-bold text-xs transition transform hover:scale-105 group border-2 border-white/20"
          title="Customer Care Live Support"
        >
          <div className="relative">
            <Headphones className="w-5 h-5 sm:w-6 sm:h-6" />
            <span className="w-2.5 h-2.5 bg-emerald-400 border-2 border-indigo-600 rounded-full absolute -top-0.5 -right-0.5 animate-pulse" />
          </div>
          <span className="hidden sm:inline-block pr-1 text-xs">Customer Support</span>
        </button>
      )}

      {isOpen && (
        <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-[calc(100vw-2rem)] sm:w-[410px] max-w-sm overflow-hidden flex flex-col h-[520px] max-h-[82vh] animate-in fade-in slide-in-from-bottom-4 duration-200">
          {/* Header */}
          <div className="bg-slate-950 text-white p-4 flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center font-bold text-xs shadow-md">
                  <Headphones className="w-5 h-5 text-white" />
                </div>
                <span className="w-2.5 h-2.5 bg-emerald-400 border-2 border-slate-950 rounded-full absolute -bottom-0.5 -right-0.5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="font-black text-sm">SmartCare AI Support</h4>
                  <span className="px-1.5 py-0.2 bg-emerald-500/20 text-emerald-400 text-[9px] font-bold rounded-md">
                    Live
                  </span>
                </div>
                <p className="text-[10px] text-slate-300 font-medium">
                  {currentUser ? `Hi, ${currentUser.name}` : "Online • Instant Dynamic Replies"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <a
                href="tel:09612888999"
                title="Call Hotline: 09612-888999"
                className="text-slate-400 hover:text-emerald-400 p-1.5 rounded-lg transition"
              >
                <PhoneCall className="w-4 h-4" />
              </a>
              <button
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-white p-1.5 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Quick Prompts Bar */}
          <div className="bg-slate-100/90 border-b border-slate-200 px-3 py-2 overflow-x-auto no-scrollbar flex items-center gap-1.5 text-[10px]">
            {quickChips.map((chip, idx) => (
              <button
                key={idx}
                onClick={() => executeSend(chip.query)}
                disabled={isTyping}
                className="px-2.5 py-1 bg-white hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-300 border border-slate-200 rounded-full font-semibold text-slate-700 whitespace-nowrap transition shadow-2xs shrink-0 disabled:opacity-50"
              >
                {chip.label}
              </button>
            ))}
          </div>

          {/* Messages Body */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/60 text-xs">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex gap-2 max-w-[88%] ${
                  m.sender === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
                }`}
              >
                <div
                  className={`p-3.5 rounded-2xl ${
                    m.sender === "user"
                      ? "bg-indigo-600 text-white rounded-tr-none shadow-xs"
                      : "bg-white border border-slate-200 text-slate-800 rounded-tl-none shadow-xs"
                  }`}
                >
                  <p className="leading-relaxed whitespace-pre-line font-medium text-[11px] sm:text-xs">
                    {m.text}
                  </p>

                  {/* Interactive Quick Action for Agent Responses */}
                  {m.quickAction && m.sender !== "user" && (
                    <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center gap-2">
                      {m.quickAction.type === "coupon" && (
                        <button
                          onClick={() => copyCoupon(m.quickAction?.value || "WELCOME5")}
                          className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-lg text-[10px] flex items-center gap-1.5 transition border border-indigo-200"
                        >
                          <Tag className="w-3 h-3 text-indigo-600" />
                          <span>Code: {m.quickAction.value}</span>
                          {copiedCoupon === m.quickAction.value ? (
                            <Check className="w-3 h-3 text-emerald-600" />
                          ) : (
                            <Copy className="w-3 h-3 text-indigo-400" />
                          )}
                        </button>
                      )}
                      {m.quickAction.type === "support_hotline" && (
                        <a
                          href="tel:09612888999"
                          className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold rounded-lg text-[10px] flex items-center gap-1.5 transition border border-emerald-200"
                        >
                          <PhoneCall className="w-3 h-3 text-emerald-600" />
                          <span>
                            {isBN ? "হটলাইনে কল করুন (09612-888999)" : "Call Hotline (09612-888999)"}
                          </span>
                        </a>
                      )}
                    </div>
                  )}

                  <span
                    className={`text-[9px] block text-right mt-1.5 ${
                      m.sender === "user" ? "text-indigo-200" : "text-slate-400"
                    }`}
                  >
                    {m.time}
                  </span>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex gap-2 max-w-[85%] mr-auto">
                <div className="p-3 bg-white border border-slate-200 text-slate-500 rounded-2xl rounded-tl-none shadow-xs flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-bounce" />
                  <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-bounce [animation-delay:0.2s]" />
                  <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-bounce [animation-delay:0.4s]" />
                  <span className="text-[10px] text-slate-400 ml-1 font-medium">
                    {isBN ? "স্মার্টকেয়ার এআই টাইপ করছে..." : "SmartCare AI is typing..."}
                  </span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Footer */}
          <form onSubmit={handleSend} className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
            <input
              type="text"
              placeholder={
                isBN
                  ? "আপনার প্রশ্নটি লিখুন (যেমন: ডেলিভারি, বিকাশ, কুপন)..."
                  : "Type your query (e.g. delivery, bKash, discount)..."
              }
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 placeholder:text-slate-400"
            />
            <button
              type="submit"
              disabled={!inputText.trim() || isTyping}
              className="bg-indigo-600 hover:bg-indigo-700 text-white p-2.5 rounded-xl disabled:opacity-50 transition shadow-sm"
              title="Send Message"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
