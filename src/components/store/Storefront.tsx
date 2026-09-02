import React, { useState } from "react";
import { useStore } from "../../context/StoreContext";
import { HomeView } from "./HomeView";
import { ProductCatalogView } from "./ProductCatalogView";
import { ProductDetailView } from "./ProductDetailView";
import { CategoryTreeModal } from "./CategoryTreeModal";
import { CheckoutView } from "./CheckoutView";
import { OrderHistoryView } from "./OrderHistoryView";
import { WishlistCompareView } from "./WishlistCompareView";
import { UserProfileView } from "./UserProfileView";
import { QuickViewModal } from "./QuickViewModal";
import { AboutUsView } from "./AboutUsView";
import { ContactUsView } from "./ContactUsView";
import { CareersView } from "./CareersView";
import { PolicyView } from "./PolicyView";
import { HelpCenterView } from "./HelpCenterView";
import { LiveChatWidget } from "./LiveChatWidget";
import { OfferDetailsView } from "./OfferDetailsView";
import { PromotionalPopup } from "../common/PromotionalPopup";
import { Product } from "../../types";

export const Storefront: React.FC = () => {
  const { storeView } = useStore();
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {storeView === "home" && <HomeView onQuickView={(p) => setQuickViewProduct(p)} />}
      {storeView === "products" && <ProductCatalogView onQuickView={(p) => setQuickViewProduct(p)} />}
      {storeView === "categories" && <CategoryTreeModal />}
      {storeView === "product-detail" && <ProductDetailView />}
      {storeView === "checkout" && <CheckoutView />}
      {storeView === "orders" && <OrderHistoryView />}
      {(storeView === "wishlist" || storeView === "compare") && <WishlistCompareView />}
      {storeView === "profile" && <UserProfileView />}
      {storeView === "about-us" && <AboutUsView />}
      {storeView === "contact-us" && <ContactUsView />}
      {storeView === "careers" && <CareersView />}
      {storeView === "privacy-policy" && <PolicyView type="privacy" />}
      {storeView === "terms-conditions" && <PolicyView type="terms" />}
      {storeView === "return-policy" && <PolicyView type="return" />}
      {storeView === "faq" && <HelpCenterView />}
      {storeView === "offer-details" && <OfferDetailsView />}

      {/* Promotional Popup Advertisement */}
      <PromotionalPopup />

      {/* Quick View Modal */}
      <QuickViewModal product={quickViewProduct} onClose={() => setQuickViewProduct(null)} />

      {/* Floating Customer Service Chat Widget */}
      <LiveChatWidget />
    </div>
  );
};
