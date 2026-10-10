import React, { useState, useEffect } from "react";
import { StoreProvider, useStore } from "./context/StoreContext";
import { Header } from "./components/common/Header";
import { Footer } from "./components/common/Footer";
import { NotificationToast } from "./components/common/NotificationToast";
import { Storefront } from "./components/store/Storefront";
import { AdminPanel } from "./components/admin/AdminPanel";
import { CartDrawer } from "./components/store/CartDrawer";
import { AuthModal } from "./components/store/AuthModal";
import { AndroidAppInstallModal } from "./components/common/AndroidAppInstallModal";
import { OfflineIndicator } from "./components/common/OfflineIndicator";

const MainContent: React.FC = () => {
  const { mode, setMode, setStoreView, setAdminView } = useStore();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isAndroidModalOpen, setIsAndroidModalOpen] = useState(false);

  // Handle Android App launcher shortcuts & deep links
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get("tab");
      const view = params.get("view");
      const appInstall = params.get("install");

      if (tab === "ai-agent") {
        setMode("admin");
        setAdminView("ai-agent");
      } else if (view === "products") {
        setMode("storefront");
        setStoreView("products");
      } else if (view === "cart") {
        setIsCartOpen(true);
      }

      if (appInstall === "android") {
        setIsAndroidModalOpen(true);
      }
    } catch {
      // ignore
    }

    const handleOpenAndroid = () => setIsAndroidModalOpen(true);
    window.addEventListener("open-android-install", handleOpenAndroid);
    return () => window.removeEventListener("open-android-install", handleOpenAndroid);
  }, [setMode, setStoreView, setAdminView]);

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 flex flex-col font-sans antialiased selection:bg-indigo-600 selection:text-white">
      <Header
        onOpenCart={() => setIsCartOpen(true)}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenAndroidAppModal={() => setIsAndroidModalOpen(true)}
      />

      <main className="flex-1 pb-24 md:pb-8">
        {mode === "storefront" ? <Storefront /> : <AdminPanel />}
      </main>

      <Footer />

      {/* Cart Drawer */}
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />

      {/* Auth Modal */}
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />

      {/* Android Mobile App Install & Hub Modal */}
      <AndroidAppInstallModal
        isOpen={isAndroidModalOpen}
        onClose={() => setIsAndroidModalOpen(false)}
      />

      {/* Offline Status Connectivity Indicator */}
      <OfflineIndicator />

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
