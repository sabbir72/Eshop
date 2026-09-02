import React, { useState } from "react";
import { useStore } from "../../context/StoreContext";
import { Bot, Send, X, Sparkles, User as UserIcon } from "lucide-react";

interface AIChatbotModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AIChatbotModal: React.FC<AIChatbotModalProps> = ({ isOpen, onClose }) => {
  const { products, categories } = useStore();

  const [messages, setMessages] = useState<Array<{ sender: "user" | "bot"; text: string }>>([
    {
      sender: "bot",
      text: "Hello! I am your AI Shopping Assistant. How can I assist you with product recommendations, specification comparisons, or store policies today?",
    },
  ]);
  const [inputMsg, setInputMsg] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  if (!isOpen) return null;

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMsg.trim()) return;

    const userText = inputMsg;
    setInputMsg("");
    setMessages((prev) => [...prev, { sender: "user", text: userText }]);
    setIsTyping(true);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userText,
          context: {
            catalogSummary: products.map((p) => ({ name: p.name, category: p.categoryName, price: p.sellingPrice })),
          },
        }),
      });
      const data = await res.json();
      setMessages((prev) => [...prev, { sender: "bot", text: data.reply || "How else can I assist you?" }]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: "I can help recommend flagship smartphones, gaming laptops, and sports footwear from our catalog!",
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-sm w-full bg-white rounded-3xl shadow-2xl border border-indigo-200 overflow-hidden flex flex-col h-[480px]">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white p-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-indigo-300 animate-pulse" />
          </div>
          <div>
            <h3 className="font-bold text-sm">Smart AI Shopping Assistant</h3>
            <span className="text-[10px] text-indigo-200 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Online • Gemini Powered
            </span>
          </div>
        </div>

        <button onClick={onClose} className="text-slate-300 hover:text-white p-1 rounded-lg">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50 text-xs">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`flex items-start gap-2 ${m.sender === "user" ? "flex-row-reverse" : "flex-row"}`}
          >
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                m.sender === "user" ? "bg-blue-600 text-white" : "bg-indigo-600 text-white"
              }`}
            >
              {m.sender === "user" ? <UserIcon className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
            </div>

            <div
              className={`p-3 rounded-2xl max-w-[80%] leading-relaxed ${
                m.sender === "user"
                  ? "bg-blue-600 text-white rounded-tr-none font-medium"
                  : "bg-white text-slate-800 border border-slate-200 rounded-tl-none shadow-2xs"
              }`}
            >
              {m.text}
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex items-center gap-2 text-slate-400 italic text-[11px]">
            <Bot className="w-3.5 h-3.5 text-indigo-500" /> AI is typing...
          </div>
        )}
      </div>

      {/* Input Form */}
      <form onSubmit={handleSend} className="p-3 bg-white border-t border-slate-200 flex gap-2">
        <input
          type="text"
          value={inputMsg}
          onChange={(e) => setInputMsg(e.target.value)}
          placeholder="Ask AI about products, deals, specs..."
          className="flex-1 bg-slate-100 text-slate-900 text-xs px-3 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <button
          type="submit"
          className="bg-indigo-600 hover:bg-indigo-700 text-white p-2 rounded-xl transition-colors shadow-xs"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
