import React, { useState } from "react";
import { StoreProvider, useStore } from "./context/StoreContext";
import { Header } from "./components/common/Header";
import { Footer } from "./components/common/Footer";
import { NotificationToast } from "./components/common/NotificationToast";
import { Storefront } from "./components/store/Storefront";
import { AdminPanel } from "./components/admin/AdminPanel";
import { CartDrawer } from "./components/store/CartDrawer";
import { AIChatbotModal } from "./components/store/AIChatbotModal";
import { AuthModal } from "./components/store/AuthModal";
import { Bot, Sparkles } from "lucide-react";

const MainContent: React.FC = () => {
  const { mode } = useStore();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 flex flex-col font-sans antialiased selection:bg-indigo-600 selection:text-white">
      <Header
        onOpenCart={() => setIsCartOpen(true)}
        onOpenAIChat={() => setIsChatOpen(true)}
        onOpenAuth={() => setIsAuthOpen(true)}
      />

      <main className="flex-1 pb-16 md:pb-0">
        {mode === "storefront" ? <Storefront /> : <AdminPanel />}
      </main>

      <Footer />

      {/* Cart Drawer */}
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />

      {/* Auth Modal */}
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />

      {/* Floating AI Assistant Trigger Button */}
      {mode === "storefront" && (
        <button
          onClick={() => setIsChatOpen(!isChatOpen)}
          className="fixed bottom-6 left-6 z-40 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-bold p-3.5 rounded-full shadow-2xl flex items-center gap-2 border-2 border-white/20 hover:scale-105 transition-all group"
          title="Open AI Shopping Assistant"
        >
          <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
          <span className="text-xs hidden sm:inline pr-1">Ask AI</span>
        </button>
      )}

      {/* AI Chatbot Floating Box */}
      <AIChatbotModal isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />

      {/* Toast Notifications */}
      <NotificationToast />
    </div>
  );
};

export default function App() {
  return (
    <StoreProvider>
      <MainContent />
    </StoreProvider>
  );
}
