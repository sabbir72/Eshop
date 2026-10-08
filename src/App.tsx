import React, { useState } from "react";
import { StoreProvider, useStore } from "./context/StoreContext";
import { Header } from "./components/common/Header";
import { Footer } from "./components/common/Footer";
import { NotificationToast } from "./components/common/NotificationToast";
import { Storefront } from "./components/store/Storefront";
import { AdminPanel } from "./components/admin/AdminPanel";
import { CartDrawer } from "./components/store/CartDrawer";
import { AuthModal } from "./components/store/AuthModal";

const MainContent: React.FC = () => {
  const { mode } = useStore();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 flex flex-col font-sans antialiased selection:bg-indigo-600 selection:text-white">
      <Header
        onOpenCart={() => setIsCartOpen(true)}
        onOpenAuth={() => setIsAuthOpen(true)}
      />

      <main className="flex-1 pb-24 md:pb-8">
        {mode === "storefront" ? <Storefront /> : <AdminPanel />}
      </main>

      <Footer />

      {/* Cart Drawer */}
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />

      {/* Auth Modal */}
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />

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
