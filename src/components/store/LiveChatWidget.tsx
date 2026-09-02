import React, { useState } from "react";
import { MessageSquare, X, Send, Bot, User, Headphones } from "lucide-react";
import { useStore } from "../../context/StoreContext";

export const LiveChatWidget: React.FC = () => {
  const { currentUser, contactInfo } = useStore();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<
    { id: string; sender: "bot" | "user" | "agent"; text: string; time: string }[]
  >([
    {
      id: "m-1",
      sender: "agent",
      text: `Hello! 👋 Welcome to Smart E-Commerce support. How can I assist you today?`,
      time: "Just now",
    },
  ]);
  const [inputText, setInputText] = useState("");

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const userMsg = {
      id: `u-${Date.now()}`,
      sender: "user" as const,
      text: inputText,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    const currentQuery = inputText.toLowerCase();
    setInputText("");

    // Instant automated smart response
    setTimeout(() => {
      let botResponse = "Thank you for reaching out! A customer care representative will connect shortly.";

      if (currentQuery.includes("return") || currentQuery.includes("refund")) {
        botResponse = "We offer a 7-day hassle-free return policy! You can submit a return claim under Help Center -> Returns.";
      } else if (currentQuery.includes("delivery") || currentQuery.includes("ship")) {
        botResponse = "Dhaka City deliveries take 24-48 hours (৳60). Outside Dhaka takes 2-4 days via Courier (৳120).";
      } else if (currentQuery.includes("payment") || currentQuery.includes("bkash")) {
        botResponse = "We accept bKash, Nagad, Rocket, Credit/Debit cards, and Cash on Delivery (COD)!";
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `b-${Date.now()}`,
          sender: "agent" as const,
          text: botResponse,
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    }, 800);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white p-4 rounded-full shadow-2xl flex items-center gap-2 font-bold text-xs transition transform hover:scale-105 group"
        >
          <Headphones className="w-6 h-6 animate-bounce" />
          <span className="hidden group-hover:inline pr-1">Live Support</span>
        </button>
      )}

      {isOpen && (
        <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-80 sm:w-96 overflow-hidden flex flex-col h-[460px] animate-in fade-in slide-in-from-bottom-4 duration-200">
          {/* Header */}
          <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-9 h-9 bg-indigo-600 rounded-full flex items-center justify-center font-bold text-xs">
                  <Headphones className="w-5 h-5 text-white" />
                </div>
                <span className="w-2.5 h-2.5 bg-emerald-500 border-2 border-slate-900 rounded-full absolute bottom-0 right-0" />
              </div>
              <div>
                <h4 className="font-bold text-sm">Customer Care Chat</h4>
                <p className="text-[10px] text-emerald-400 font-medium">Online • Agents Ready</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-white p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages Body */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50 text-xs">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex gap-2 max-w-[85%] ${
                  m.sender === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
                }`}
              >
                <div
                  className={`p-3 rounded-2xl ${
                    m.sender === "user"
                      ? "bg-indigo-600 text-white rounded-tr-none"
                      : "bg-white border border-slate-200 text-slate-800 rounded-tl-none shadow-2xs"
                  }`}
                >
                  <p className="leading-relaxed">{m.text}</p>
                  <span
                    className={`text-[9px] block text-right mt-1 ${
                      m.sender === "user" ? "text-indigo-200" : "text-slate-400"
                    }`}
                  >
                    {m.time}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Input Footer */}
          <form onSubmit={handleSend} className="p-3 bg-white border-t flex items-center gap-2">
            <input
              type="text"
              placeholder="Ask a question..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="flex-1 border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              type="submit"
              disabled={!inputText.trim()}
              className="bg-indigo-600 hover:bg-indigo-700 text-white p-2 rounded-xl disabled:opacity-50 transition"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
