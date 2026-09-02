import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { Language } from "../utils/i18n";
import { testFirestoreConnection } from "../lib/firebase";
import {
  User,
  UserRole,
  RolePermissions,
  Product,
  Category,
  Brand,
  Warehouse,
  Order,
  OrderStatus,
  Coupon,
  Review,
  AuditLog,
  CartItem,
  SystemSettings,
  InventoryTransaction,
  HomeBanner,
  BlogArticle,
  FAQItem,
  ModuleName,
  SecurityLabel,
  AboutUsData,
  ContactInfoData,
  ContactInquiry,
  JobPosting,
  JobApplication,
  PolicyDocument,
  FAQCategory,
  FAQItemExt,
  ReturnRequest,
  TicketMessage,
  SupportTicket,
  Advertisement,
} from "../types";
import { evaluateCouponDiscount, DiscountValidationResult } from "../utils/discountEngine";
import {
  initialProducts,
  initialCategories,
  initialBrands,
  initialWarehouses,
  initialUsers,
  initialOrders,
  initialCoupons,
  initialReviews,
  initialAuditLogs,
  initialHomeBanners,
  initialBlogs,
  initialFAQs,
  initialSettings,
  defaultPermissions,
  initialSecurityLabels,
  initialAboutUs,
  initialContactInfo,
  initialContactInquiries,
  initialJobPostings,
  initialJobApplications,
  initialPrivacyPolicy,
  initialTermsConditions,
  initialReturnPolicy,
  initialFAQCategories,
  initialFAQsExt,
  initialReturnRequests,
  initialSupportTickets,
  initialAdvertisements,
} from "../data/mockData";

export type ViewMode = "storefront" | "admin";
export type StoreView =
  | "home"
  | "products"
  | "categories"
  | "product-detail"
  | "cart"
  | "checkout"
  | "orders"
  | "wishlist"
  | "compare"
  | "profile"
  | "about-us"
  | "contact-us"
  | "careers"
  | "privacy-policy"
  | "terms-conditions"
  | "return-policy"
  | "help-center"
  | "support-tickets"
  | "faq"
  | "offer-details";

export type AdminView =
  | "dashboard"
  | "users"
  | "roles"
  | "products"
  | "categories"
  | "brands"
  | "inventory"
  | "orders"
  | "coupons"
  | "reviews"
  | "reports"
  | "settings"
  | "cms"
  | "notifications"
  | "audit-logs"
  | "ai-assistant"
  | "doc-pack"
  | "cms-security"
  | "company-cms"
  | "supplier-management"
  | "contact-inquiries"
  | "careers-mgmt"
  | "careers"
  | "legal-policies"
  | "faq-mgmt"
  | "faq-kb"
  | "return-requests"
  | "support-tickets"
  | "customer-support"
  | "marketing"
  | "warehouse-movement"
  | "seo-marketing"
  | "website-profile";

interface ToastNotification {
  id: string;
  type: "success" | "error" | "info" | "warning";
  message: string;
}

interface StoreContextType {
  mode: ViewMode;
  setMode: (mode: ViewMode) => void;
  storeView: StoreView;
  setStoreView: (view: StoreView) => void;
  adminView: AdminView;
  setAdminView: (view: AdminView) => void;

  language: Language;
  setLanguage: (lang: Language) => void;

  // Active User & RBAC
  currentUser: User;
  setCurrentUser: (user: User) => void;
  activeRole: UserRole;
  switchRole: (role: UserRole) => void;
  loginUser: (user: User, token?: string, rememberMe?: boolean) => void;
  logoutUser: (isExpired?: boolean) => void;
  permissions: RolePermissions;
  updateRolePermission: (role: UserRole, module: ModuleName, action: string, value: boolean) => void;
  hasPermission: (module: ModuleName, action: "view" | "add" | "edit" | "delete" | "export" | "import") => boolean;

  // Search & Catalog Filter State
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategoryId: string | null;
  setSelectedCategoryId: (id: string | null) => void;
  selectedBrandId: string | null;
  setSelectedBrandId: (id: string | null) => void;
  selectedProduct: Product | null;
  setSelectedProduct: (p: Product | null) => void;

  // Entities Data
  products: Product[];
  categories: Category[];
  brands: Brand[];
  warehouses: Warehouse[];
  users: User[];
  orders: Order[];
  coupons: Coupon[];
  reviews: Review[];
  auditLogs: AuditLog[];
  inventoryTransactions: InventoryTransaction[];
  settings: SystemSettings;
  homeBanners: HomeBanner[];
  securityLabels: SecurityLabel[];
  blogs: BlogArticle[];
  faqs: FAQItem[];

  // Cart, Wishlist, Compare
  cart: CartItem[];
  addToCart: (product: Product, color?: string, size?: string, quantity?: number) => void;
  updateCartQuantity: (itemId: string, quantity: number) => void;
  removeFromCart: (itemId: string) => void;
  clearCart: () => void;
  appliedCoupon: Coupon | null;
  applyCoupon: (code: string) => { success: boolean; message: string; discountResult?: DiscountValidationResult };
  removeCoupon: () => void;
  getCouponEvaluation: (coupon?: Coupon | null) => DiscountValidationResult;

  wishlist: Product[];
  toggleWishlist: (p: Product) => void;
  compareList: Product[];
  toggleCompare: (p: Product) => void;

  // CRUD Actions
  addProduct: (product: Omit<Product, "id" | "createdAt" | "rating" | "reviewsCount">) => void;
  updateProduct: (id: string, updated: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  bulkAddProducts: (newProds: Product[]) => void;
  bulkUpdateProductStatus: (ids: string[], status: "Active" | "Draft" | "Inactive") => void;
  bulkDeleteProducts: (ids: string[]) => void;

  addCategory: (cat: Omit<Category, "id">) => void;
  updateCategory: (id: string, cat: Partial<Category>) => void;
  deleteCategory: (id: string) => void;

  addBrand: (b: Omit<Brand, "id">) => void;
  updateBrand: (id: string, b: Partial<Brand>) => void;
  deleteBrand: (id: string) => void;

  placeOrder: (orderData: Omit<Order, "id" | "orderNumber" | "createdAt" | "updatedAt">) => Order;
  updateOrderStatus: (orderId: string, newStatus: OrderStatus, trackingNo?: string) => void;

  addCoupon: (c: Omit<Coupon, "id" | "usageCount">) => void;
  updateCoupon: (id: string, c: Partial<Coupon>) => void;
  deleteCoupon: (id: string) => void;

  approveReview: (id: string) => void;
  rejectReview: (id: string) => void;
  addReview: (r: Omit<Review, "id" | "createdAt" | "status">) => void;

  // Inventory Stock Adjustment & Transfer
  executeInventoryTransaction: (tx: Omit<InventoryTransaction, "id" | "createdAt" | "performedBy">) => void;

  // Settings & CMS Updates
  updateSettings: (s: Partial<SystemSettings>) => void;
  updateWebsiteBranding: (branding: {
    websiteName?: string;
    tagline?: string;
    logoUrl?: string | null;
    faviconUrl?: string | null;
  }) => Promise<{ success: boolean; error?: string }>;
  updateHomeBanner: (id: string, banner: Partial<HomeBanner>) => void;
  addHomeBanner: (banner: Omit<HomeBanner, "id">) => void;
  deleteHomeBanner: (id: string) => void;

  // Security Labels CRUD
  addSecurityLabel: (label: Omit<SecurityLabel, "id">) => void;
  updateSecurityLabel: (id: string, label: Partial<SecurityLabel>) => void;
  deleteSecurityLabel: (id: string) => void;
  toggleSecurityLabelActive: (id: string) => void;

  // Company & Customer Care State & Actions
  aboutUs: AboutUsData;
  updateAboutUs: (data: Partial<AboutUsData>) => void;
  contactInfo: ContactInfoData;
  updateContactInfo: (data: Partial<ContactInfoData>) => void;
  contactInquiries: ContactInquiry[];
  addContactInquiry: (inquiry: Omit<ContactInquiry, "id" | "createdAt" | "status">) => void;
  updateContactInquiry: (id: string, updates: Partial<ContactInquiry>) => void;
  deleteContactInquiry: (id: string) => void;

  jobPostings: JobPosting[];
  addJobPosting: (job: Omit<JobPosting, "id" | "createdAt">) => void;
  updateJobPosting: (id: string, updates: Partial<JobPosting>) => void;
  deleteJobPosting: (id: string) => void;

  jobApplications: JobApplication[];
  addJobApplication: (app: Omit<JobApplication, "id" | "appliedAt" | "status">) => void;
  updateJobApplication: (id: string, updates: Partial<JobApplication>) => void;
  deleteJobApplication: (id: string) => void;

  privacyPolicy: PolicyDocument;
  updatePrivacyPolicy: (data: Partial<PolicyDocument>, notes?: string) => void;
  termsConditions: PolicyDocument;
  updateTermsConditions: (data: Partial<PolicyDocument>, notes?: string) => void;
  returnPolicy: PolicyDocument;
  updateReturnPolicy: (data: Partial<PolicyDocument>, notes?: string) => void;

  faqCategories: FAQCategory[];
  addFAQCategory: (cat: Omit<FAQCategory, "id">) => void;
  updateFAQCategory: (id: string, updates: Partial<FAQCategory>) => void;
  deleteFAQCategory: (id: string) => void;

  faqItemsExt: FAQItemExt[];
  addFAQExt: (item: Omit<FAQItemExt, "id" | "helpfulCount" | "notHelpfulCount">) => void;
  updateFAQExt: (id: string, updates: Partial<FAQItemExt>) => void;
  deleteFAQExt: (id: string) => void;
  voteFAQ: (id: string, helpful: boolean) => void;

  returnRequests: ReturnRequest[];
  addReturnRequest: (req: Omit<ReturnRequest, "id" | "requestNumber" | "createdAt" | "updatedAt" | "status">) => void;
  updateReturnRequest: (id: string, updates: Partial<ReturnRequest>) => void;
  deleteReturnRequest: (id: string) => void;

  supportTickets: SupportTicket[];
  addSupportTicket: (ticket: Omit<SupportTicket, "id" | "ticketNumber" | "createdAt" | "updatedAt" | "status" | "messages">, initialMessage: string) => void;
  updateSupportTicket: (id: string, updates: Partial<SupportTicket>) => void;
  addTicketMessage: (ticketId: string, sender: "Customer" | "Support Agent" | "System", senderName: string, message: string, attachments?: string[]) => void;
  escalateTicket: (ticketId: string, priority: "Low" | "Medium" | "High" | "Urgent", note?: string) => void;
  deleteSupportTicket: (id: string) => void;

  liveChatOpen: boolean;
  setLiveChatOpen: (open: boolean) => void;

  // Advertisements & Marketing
  advertisements: Advertisement[];
  selectedOffer: Advertisement | null;
  setSelectedOffer: (ad: Advertisement | null) => void;
  addAdvertisement: (ad: Omit<Advertisement, "id" | "views" | "clicks" | "conversions">) => void;
  updateAdvertisement: (id: string, ad: Partial<Advertisement>) => void;
  deleteAdvertisement: (id: string) => void;
  trackAdImpression: (id: string) => void;
  trackAdClick: (id: string) => void;

  // Notifications & Audit Logging
  toasts: ToastNotification[];
  addToast: (message: string, type?: "success" | "error" | "info" | "warning") => void;
  removeToast: (id: string) => void;
  recordAuditLog: (action: string, module: ModuleName | "Auth" | "System" | "Bulk Import", prevVal?: string, newVal?: string) => void;
}

export const guestUser: User = {
  id: "guest",
  name: "Guest Visitor",
  email: "",
  phone: "",
  avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80",
  role: "Guest",
  status: "active",
  ordersCount: 0,
  totalPurchase: 0,
  address: "",
  twoFactorEnabled: false,
  createdAt: "2026-01-01",
};

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setMode] = useState<ViewMode>("storefront");
  const [storeView, setStoreView] = useState<StoreView>("home");
  const [adminView, setAdminView] = useState<AdminView>("dashboard");

  const [language, setLanguageState] = useState<Language>(() => {
    return (localStorage.getItem("app_language") as Language) || "EN";
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("app_language", lang);
  };

  const [users, setUsers] = useState<User[]>(initialUsers);

  // Unauthenticated Guest State by Default - No auto-login
  const [currentUser, setCurrentUser] = useState<User>(() => {
    try {
      const saved = localStorage.getItem("auth_user") || sessionStorage.getItem("auth_user");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.role && parsed.role !== "Guest") {
          return parsed;
        }
      }
    } catch (_e) {
      // Ignore parse error
    }
    return guestUser;
  });

  const [activeRole, setActiveRole] = useState<UserRole>(() => {
    if (currentUser && currentUser.role) {
      return currentUser.role;
    }
    return "Guest";
  });
  const [permissions, setPermissions] = useState<RolePermissions>(defaultPermissions);

  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [selectedBrandId, setSelectedBrandId] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(initialProducts[0]);

  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [brands, setBrands] = useState<Brand[]>(initialBrands);
  const [warehouses, setWarehouses] = useState<Warehouse[]>(initialWarehouses);
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [coupons, setCoupons] = useState<Coupon[]>(initialCoupons);
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(initialAuditLogs);
  const [inventoryTransactions, setInventoryTransactions] = useState<InventoryTransaction[]>([]);
  const [settings, setSettings] = useState<SystemSettings>(initialSettings);

  const [homeBanners, setHomeBanners] = useState<HomeBanner[]>(initialHomeBanners);
  const [securityLabels, setSecurityLabels] = useState<SecurityLabel[]>(initialSecurityLabels);
  const [blogs] = useState<BlogArticle[]>(initialBlogs);
  const [faqs] = useState<FAQItem[]>(initialFAQs);

  // Company & Customer Care State
  const [aboutUs, setAboutUs] = useState<AboutUsData>(initialAboutUs);

  useEffect(() => {
    testFirestoreConnection();
  }, []);

  // Sync website branding from API on initial mount
  useEffect(() => {
    async function fetchWebsiteProfile() {
      try {
        const res = await fetch("/api/settings/website-profile");
        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            setSettings((prev) => ({
              ...prev,
              websiteName: data.websiteName || prev.websiteName,
              siteName: data.siteName || prev.siteName,
              tagline: data.tagline !== undefined ? data.tagline : prev.tagline,
              logoUrl: data.logoUrl !== undefined ? data.logoUrl : prev.logoUrl,
              faviconUrl: data.faviconUrl !== undefined ? data.faviconUrl : prev.faviconUrl,
              updatedAt: data.updatedAt,
              updatedBy: data.updatedBy,
            }));
          }
        }
      } catch (e) {
        console.warn("[Website Profile Sync Note]:", e);
      }
    }
    fetchWebsiteProfile();
  }, []);

  // Synchronize browser document title and favicon dynamically
  useEffect(() => {
    const siteTitle = settings.websiteName || settings.siteName || "Smart Shop";
    if (siteTitle) {
      document.title = settings.tagline ? `${siteTitle} | ${settings.tagline}` : siteTitle;
    }

    if (settings.faviconUrl) {
      let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
      if (!link) {
        link = document.createElement("link");
        link.rel = "icon";
        document.getElementsByTagName("head")[0].appendChild(link);
      }
      link.href = settings.faviconUrl;
    }
  }, [settings.websiteName, settings.siteName, settings.tagline, settings.faviconUrl]);
  const [contactInfo, setContactInfo] = useState<ContactInfoData>(initialContactInfo);
  const [contactInquiries, setContactInquiries] = useState<ContactInquiry[]>(initialContactInquiries);
  const [jobPostings, setJobPostings] = useState<JobPosting[]>(initialJobPostings);
  const [jobApplications, setJobApplications] = useState<JobApplication[]>(initialJobApplications);
  const [privacyPolicy, setPrivacyPolicy] = useState<PolicyDocument>(initialPrivacyPolicy);
  const [termsConditions, setTermsConditions] = useState<PolicyDocument>(initialTermsConditions);
  const [returnPolicy, setReturnPolicy] = useState<PolicyDocument>(initialReturnPolicy);
  const [faqCategories, setFaqCategories] = useState<FAQCategory[]>(initialFAQCategories);
  const [faqItemsExt, setFaqItemsExt] = useState<FAQItemExt[]>(initialFAQsExt);
  const [returnRequests, setReturnRequests] = useState<ReturnRequest[]>(initialReturnRequests);
  const [supportTickets, setSupportTickets] = useState<SupportTicket[]>(initialSupportTickets);
  const [liveChatOpen, setLiveChatOpen] = useState<boolean>(false);

  // Advertisements State & Handlers
  const [advertisements, setAdvertisements] = useState<Advertisement[]>(initialAdvertisements);
  const [selectedOffer, setSelectedOffer] = useState<Advertisement | null>(null);

  const addAdvertisement = (ad: Omit<Advertisement, "id" | "views" | "clicks" | "conversions">) => {
    const newAd: Advertisement = {
      ...ad,
      id: `ad-${Date.now()}`,
      views: 0,
      clicks: 0,
      conversions: 0,
      createdAt: new Date().toISOString().split("T")[0],
    };
    setAdvertisements((prev) => [newAd, ...prev]);
    recordAuditLog(`Created Advertisement "${newAd.title}"`, "CMS");
    addToast(`Campaign "${newAd.title}" published successfully!`, "success");
  };

  const updateAdvertisement = (id: string, adUpdates: Partial<Advertisement>) => {
    setAdvertisements((prev) =>
      prev.map((a) => (a.id === id ? { ...a, ...adUpdates } : a))
    );
    recordAuditLog(`Updated Advertisement ID "${id}"`, "CMS");
    addToast("Advertisement updated successfully", "success");
  };

  const deleteAdvertisement = (id: string) => {
    const target = advertisements.find((a) => a.id === id);
    setAdvertisements((prev) => prev.filter((a) => a.id !== id));
    recordAuditLog(`Deleted Advertisement "${target?.title || id}"`, "CMS");
    addToast("Advertisement removed", "info");
  };

  const trackAdImpression = useCallback((id: string) => {
    setAdvertisements((prev) => {
      let changed = false;
      const next = prev.map((a) => {
        if (a.id === id) {
          changed = true;
          return { ...a, views: a.views + 1 };
        }
        return a;
      });
      return changed ? next : prev;
    });
  }, []);

  const trackAdClick = useCallback((id: string) => {
    setAdvertisements((prev) => {
      let changed = false;
      const next = prev.map((a) => {
        if (a.id === id) {
          changed = true;
          return { ...a, clicks: a.clicks + 1 };
        }
        return a;
      });
      return changed ? next : prev;
    });
  }, []);

  // Cart & Discount
  const [cart, setCart] = useState<CartItem[]>([
    {
      id: "cart-init-1",
      product: initialProducts[0],
      selectedVariant: initialProducts[0].variants[0],
      color: "Natural Titanium",
      size: "256GB",
      quantity: 1,
    },
  ]);
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);

  const [wishlist, setWishlist] = useState<Product[]>([initialProducts[1]]);
  const [compareList, setCompareList] = useState<Product[]>([initialProducts[0], initialProducts[1]]);

  const [toasts, setToasts] = useState<ToastNotification[]>([]);

  const addToast = (message: string, type: "success" | "error" | "info" | "warning" = "info") => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 5);
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  // Check for any flash toast message after page reload (e.g. after logout or session reset)
  useEffect(() => {
    try {
      const flash = sessionStorage.getItem("flash_toast");
      if (flash) {
        sessionStorage.removeItem("flash_toast");
        const parsed = JSON.parse(flash);
        if (parsed && parsed.message) {
          addToast(parsed.message, parsed.type || "info");
        }
      }
    } catch (_e) {
      // Ignore flash toast read error
    }
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const recordAuditLog = (
    action: string,
    module: ModuleName | "Auth" | "System" | "Bulk Import",
    prevVal?: string,
    newVal?: string
  ) => {
    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: activeRole,
      action,
      module,
      previousValue: prevVal,
      newValue: newVal,
      ipAddress: "127.0.0.1",
      device: "Web Browser",
      timestamp: new Date().toISOString().replace("T", " ").substring(0, 19),
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  // -------------------------------------------------------------------
  // SESSION & USER INACTIVITY TIMEOUT (5 MINUTES)
  // -------------------------------------------------------------------
  const lastActivityRef = useRef<number>(Date.now());

  // Listen to user activity to reset 5-minute session timer
  useEffect(() => {
    const updateActivity = () => {
      lastActivityRef.current = Date.now();
    };

    const activityEvents = ["mousemove", "mousedown", "keydown", "scroll", "touchstart", "click"];
    activityEvents.forEach((evt) => window.addEventListener(evt, updateActivity, { passive: true }));

    return () => {
      activityEvents.forEach((evt) => window.removeEventListener(evt, updateActivity));
    };
  }, []);

  const loginUser = (user: User, token?: string, rememberMe: boolean = true) => {
    setCurrentUser(user);
    setActiveRole(user.role);
    lastActivityRef.current = Date.now();

    const storage = rememberMe ? localStorage : sessionStorage;
    storage.setItem("auth_user", JSON.stringify(user));
    if (token) {
      storage.setItem("auth_token", token);
    }
    storage.setItem("auth_role", user.role);
    storage.setItem("auth_login_time", Date.now().toString());

    recordAuditLog(`User Authenticated (${user.email || user.name})`, "Auth");
    addToast(`Welcome back, ${user.name}!`, "success");
  };

  const logoutUser = useCallback(async (isExpired: boolean = false) => {
    // 1. Audit log if user was authenticated
    if (currentUser && currentUser.role !== "Guest") {
      try {
        recordAuditLog(`User Logged Out (${currentUser.email || currentUser.name})`, "Auth");
      } catch (_e) {
        // Ignore audit log error during logout
      }
    }

    // 2. Call backend logout API endpoint to cleanly terminate server-side session
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
    } catch (_e) {
      // Gracefully continue even if network/backend is unreachable
    }

    // 3. Clear all authentication-related storage (tokens, roles, user details, timestamps)
    const authKeysToRemove = [
      "auth_user",
      "auth_token",
      "auth_role",
      "auth_login_time",
      "auth_refresh_token",
      "access_token",
      "refresh_token",
      "user",
      "token",
      "role",
      "jwt_token",
      "current_user",
      "active_role",
    ];

    authKeysToRemove.forEach((k) => {
      try {
        localStorage.removeItem(k);
      } catch (_e) {}
      try {
        sessionStorage.removeItem(k);
      } catch (_e) {}
    });

    // 4. Reset in-memory Context State to Clean Guest
    setCurrentUser(guestUser);
    setActiveRole("Guest");
    setMode("storefront");
    setStoreView("home");
    setAdminView("dashboard");

    // 5. Store a flash message in sessionStorage to display on the freshly reloaded public Home page
    try {
      if (isExpired) {
        sessionStorage.setItem(
          "flash_toast",
          JSON.stringify({ message: "Your session has expired. Please login again.", type: "warning" })
        );
      } else {
        sessionStorage.setItem(
          "flash_toast",
          JSON.stringify({ message: "Logged out successfully.", type: "info" })
        );
      }
    } catch (_e) {}

    // 6. Reset browser history state so Back button cannot expose protected routes
    try {
      window.history.replaceState(null, "", window.location.pathname);
    } catch (_e) {}

    // 7. Automatically reload the website and land cleanly on the public Home page in logged-out Guest state
    window.location.replace(window.location.origin + window.location.pathname);
  }, [currentUser]);

  // Inactivity Interval Check (5 Minutes = 300,000ms)
  useEffect(() => {
    const INACTIVITY_LIMIT_MS = 5 * 60 * 1000; // 5 minutes
    const interval = setInterval(() => {
      if (currentUser && currentUser.role !== "Guest") {
        const inactiveMs = Date.now() - lastActivityRef.current;
        if (inactiveMs >= INACTIVITY_LIMIT_MS) {
          logoutUser(true);
        }
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [currentUser, logoutUser]);

  const switchRole = (role: UserRole) => {
    if (currentUser.role === "Guest" && role !== "Guest") {
      addToast("403 Forbidden: Guest users must log in to access administrative roles.", "error");
      return;
    }
    setActiveRole(role);
    setCurrentUser((prev) => ({ ...prev, role }));
    recordAuditLog(`Switched Role to ${role}`, "Auth");
    addToast(`Active session role set to '${role}'`, "info");
  };

  const updateRolePermission = (role: UserRole, module: ModuleName, action: string, value: boolean) => {
    setPermissions((prev) => ({
      ...prev,
      [module]: {
        ...prev[module],
        [action]: value,
      },
    }));
    recordAuditLog(`Updated RBAC Permission: ${role} - ${module}.${action} = ${value}`, "Auth");
    addToast(`Updated permission for ${module}`, "success");
  };

  const hasPermission = (module: ModuleName, action: "view" | "add" | "edit" | "delete" | "export" | "import") => {
    if (activeRole === "Super Admin") return true;
    if (activeRole === "Guest") return action === "view" && (module === "Product" || module === "Category");
    if (activeRole === "Customer") return action === "view" && (module === "Product" || module === "Category" || module === "Order");
    if (activeRole === "Admin") return true;

    // Role specific defaults
    if (activeRole === "Product Manager" && (module === "Product" || module === "Category")) return true;
    if (activeRole === "Inventory Manager" && (module === "Inventory" || module === "Product")) return true;
    if (activeRole === "Order Manager" && module === "Order") return true;
    if (activeRole === "Customer Support" && (module === "Order" || module === "Customer")) return true;

    return permissions[module]?.[action] ?? false;
  };

  // Cart Handlers
  const addToCart = (product: Product, color?: string, size?: string, quantity: number = 1) => {
    const matchedVariant = product.variants.find(
      (v) => (color ? v.color === color : true) && (size ? v.size === size : true)
    ) || product.variants[0];

    const existingIndex = cart.findIndex(
      (ci) => ci.product.id === product.id && ci.color === color && ci.size === size
    );

    if (existingIndex > -1) {
      const updatedCart = [...cart];
      updatedCart[existingIndex].quantity += quantity;
      setCart(updatedCart);
    } else {
      setCart((prev) => [
        ...prev,
        {
          id: `cart-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
          product,
          selectedVariant: matchedVariant,
          color: color || matchedVariant?.color,
          size: size || matchedVariant?.size,
          quantity,
        },
      ]);
    }
    addToast(`Added '${product.name}' to Cart!`, "success");
  };

  const updateCartQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }
    setCart((prev) => prev.map((item) => (item.id === itemId ? { ...item, quantity } : item)));
  };

  const removeFromCart = (itemId: string) => {
    setCart((prev) => prev.filter((item) => item.id !== itemId));
    addToast("Item removed from cart", "warning");
  };

  const clearCart = () => {
    setCart([]);
    setAppliedCoupon(null);
  };

  const getCouponEvaluation = useCallback(
    (couponToCheck?: Coupon | null): DiscountValidationResult => {
      const coupon = couponToCheck !== undefined ? couponToCheck : appliedCoupon;
      if (!coupon) {
        const totalSubtotal = cart.reduce(
          (acc, item) => acc + (item.selectedVariant?.price || item.product.discountPrice || item.product.sellingPrice) * item.quantity,
          0
        );
        return {
          isValid: false,
          discountAmount: 0,
          eligibleSubtotal: 0,
          totalSubtotal,
          eligibleItems: [],
          ineligibleItems: [],
          scopeType: "GLOBAL",
          message: "No coupon applied.",
          code: "",
        };
      }
      return evaluateCouponDiscount(
        coupon.code,
        coupon,
        cart,
        currentUser,
        categories,
        settings.currencySymbol
      );
    },
    [appliedCoupon, cart, currentUser, categories, settings.currencySymbol]
  );

  const applyCoupon = (code: string) => {
    const normalized = code.trim().toUpperCase();
    const found = coupons.find((c) => c.code.toUpperCase() === normalized);
    const result = evaluateCouponDiscount(
      normalized,
      found,
      cart,
      currentUser,
      categories,
      settings.currencySymbol
    );

    if (!result.isValid) {
      return { success: false, message: result.message, discountResult: result };
    }

    setAppliedCoupon(result.coupon || found || null);
    addToast(result.message, "success");
    return { success: true, message: result.message, discountResult: result };
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    addToast("Coupon removed", "info");
  };

  const toggleWishlist = (product: Product) => {
    if (wishlist.some((p) => p.id === product.id)) {
      setWishlist((prev) => prev.filter((p) => p.id !== product.id));
      addToast("Removed from Wishlist", "info");
    } else {
      setWishlist((prev) => [...prev, product]);
      addToast("Saved to Wishlist!", "success");
    }
  };

  const toggleCompare = (product: Product) => {
    if (compareList.some((p) => p.id === product.id)) {
      setCompareList((prev) => prev.filter((p) => p.id !== product.id));
      addToast("Removed from Compare list", "info");
    } else {
      if (compareList.length >= 4) {
        addToast("Compare list full (maximum 4 items)", "warning");
        return;
      }
      setCompareList((prev) => [...prev, product]);
      addToast("Added to Product Comparison matrix", "success");
    }
  };

  // Product CRUD
  const addProduct = (pData: Omit<Product, "id" | "createdAt" | "rating" | "reviewsCount">) => {
    const newId = `prod-${Date.now()}`;
    const newProd: Product = {
      ...pData,
      id: newId,
      rating: 5.0,
      reviewsCount: 0,
      createdAt: new Date().toISOString().split("T")[0],
    };
    setProducts((prev) => [newProd, ...prev]);
    recordAuditLog(`Created Product '${newProd.name}' (SKU: ${newProd.sku})`, "Product", "", JSON.stringify({ name: newProd.name, price: newProd.sellingPrice }));
    addToast(`Product '${newProd.name}' created!`, "success");
  };

  const updateProduct = (id: string, updated: Partial<Product>) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          const newP = { ...p, ...updated };
          recordAuditLog(`Updated Product '${p.name}'`, "Product", p.name, newP.name);
          return newP;
        }
        return p;
      })
    );
    addToast("Product updated successfully", "success");
  };

  const deleteProduct = (id: string) => {
    const target = products.find((p) => p.id === id);
    setProducts((prev) => prev.filter((p) => p.id !== id));
    if (target) {
      recordAuditLog(`Deleted Product '${target.name}'`, "Product", target.name, "Deleted");
    }
    addToast("Product deleted", "warning");
  };

  const bulkAddProducts = (newProds: Product[]) => {
    setProducts((prev) => [...newProds, ...prev]);
    recordAuditLog(`Bulk Imported ${newProds.length} Products`, "Bulk Import", "", `${newProds.length} rows inserted`);
    addToast(`Successfully imported ${newProds.length} products!`, "success");
  };

  const bulkUpdateProductStatus = (ids: string[], status: "Active" | "Draft" | "Inactive") => {
    setProducts((prev) =>
      prev.map((p) => (ids.includes(p.id) ? { ...p, status } : p))
    );
    recordAuditLog(`Bulk Updated Status of ${ids.length} products to '${status}'`, "Product");
    addToast(`Updated ${ids.length} products to '${status}'`, "success");
  };

  const bulkDeleteProducts = (ids: string[]) => {
    setProducts((prev) => prev.filter((p) => !ids.includes(p.id)));
    recordAuditLog(`Bulk Deleted ${ids.length} products`, "Product");
    addToast(`Deleted ${ids.length} products`, "warning");
  };

  // Category CRUD
  const addCategory = (cat: Omit<Category, "id">) => {
    const newCat: Category = { ...cat, id: `cat-${Date.now()}` };
    setCategories((prev) => [...prev, newCat]);
    recordAuditLog(`Created Category '${newCat.name}'`, "Category");
    addToast(`Category '${newCat.name}' created`, "success");
  };

  const updateCategory = (id: string, cat: Partial<Category>) => {
    setCategories((prev) => prev.map((c) => (c.id === id ? { ...c, ...cat } : c)));
    recordAuditLog(`Updated Category ID ${id}`, "Category");
    addToast("Category updated", "success");
  };

  const deleteCategory = (id: string) => {
    setCategories((prev) => prev.filter((c) => c.id !== id));
    recordAuditLog(`Deleted Category ID ${id}`, "Category");
    addToast("Category deleted", "warning");
  };

  // Brand CRUD
  const addBrand = (b: Omit<Brand, "id">) => {
    const newB: Brand = { ...b, id: `brand-${Date.now()}` };
    setBrands((prev) => [...prev, newB]);
    recordAuditLog(`Created Brand '${newB.name}'`, "Product");
    addToast(`Brand '${newB.name}' added`, "success");
  };

  const updateBrand = (id: string, b: Partial<Brand>) => {
    setBrands((prev) => prev.map((item) => (item.id === id ? { ...item, ...b } : item)));
    addToast("Brand updated", "success");
  };

  const deleteBrand = (id: string) => {
    setBrands((prev) => prev.filter((b) => b.id !== id));
    addToast("Brand deleted", "warning");
  };

  // Orders
  const placeOrder = (orderData: Omit<Order, "id" | "orderNumber" | "createdAt" | "updatedAt">) => {
    const ordNum = `ORD-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const now = new Date().toISOString().replace("T", " ").substring(0, 19);

    // Enforce backend/settings-driven Gift Wrapping calculation security
    const isGiftWrapped = Boolean(orderData.isGiftWrapped && settings.enableGiftWrapping !== false);
    const validGiftWrappingCharge = isGiftWrapped ? (settings.giftWrappingCharge ?? 50) : 0;

    // Recalculate grand total securely
    const subtotal = orderData.subtotal;
    const discount = orderData.discount || 0;
    const shippingCharge = orderData.shippingCharge;
    const tax = orderData.tax;
    const calculatedTotal = Math.max(0, subtotal - discount + shippingCharge + tax + validGiftWrappingCharge);

    const isGiftSms = Boolean(orderData.giftSmsEnabled && orderData.giftRecipientPhone?.trim());

    const newOrder: Order = {
      ...orderData,
      id: `ord-${Date.now()}`,
      orderNumber: ordNum,
      isGiftWrapped,
      giftWrappingCharge: validGiftWrappingCharge,
      giftSmsEnabled: isGiftSms,
      giftRecipientPhone: orderData.giftRecipientPhone?.trim(),
      giftSenderName: orderData.giftSenderName?.trim() || orderData.customerName,
      giftMessage: orderData.giftMessage?.trim(),
      giftSmsStatus: isGiftSms ? "Pending" : "Not Requested",
      total: calculatedTotal,
      createdAt: now,
      updatedAt: now,
    };

    // Increment coupon usage count if applied
    if (orderData.couponCode) {
      setCoupons((prev) =>
        prev.map((c) =>
          c.code.toUpperCase() === orderData.couponCode?.toUpperCase()
            ? { ...c, usageCount: (c.usageCount || 0) + 1 }
            : c
        )
      );
    }

    setOrders((prev) => [newOrder, ...prev]);
    clearCart();

    // Audit log
    const auditExtra = [
      `Total: ${settings.currencySymbol}${newOrder.total}`,
      isGiftWrapped ? `Gift Wrapped (+${settings.currencySymbol}${validGiftWrappingCharge})` : null,
      isGiftSms ? `Gift SMS to: ${newOrder.giftRecipientPhone}` : null,
    ].filter(Boolean).join(" | ");

    recordAuditLog(`New Order #${ordNum} placed by ${newOrder.customerName}`, "Order", "", auditExtra);
    addToast(`Order #${ordNum} placed successfully!`, "success");

    // Asynchronous Fail-Safe Gift SMS Dispatch (Never cancels or fails customer order)
    if (isGiftSms && newOrder.giftRecipientPhone) {
      fetch("/api/orders/gift-sms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderNumber: ordNum,
          recipientPhone: newOrder.giftRecipientPhone,
          senderName: newOrder.giftSenderName || newOrder.customerName,
          customerName: newOrder.customerName,
          message: newOrder.giftMessage,
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          const newStatus = (data.status === "Sent" || data.status === "Simulated") ? data.status : "Failed";
          setOrders((prev) =>
            prev.map((o) => (o.id === newOrder.id ? { ...o, giftSmsStatus: newStatus } : o))
          );
          if (newStatus === "Sent" || newStatus === "Simulated") {
            console.log(`[GIFT SMS SUCCESS] Dispatched for Order #${ordNum}`);
          } else {
            console.warn(`[GIFT SMS NOTICE] SMS delivery logged as failed for Order #${ordNum}, order remains valid.`);
          }
        })
        .catch((smsErr) => {
          console.warn("[GIFT SMS FAIL-SAFE]: SMS dispatch network error; customer order remains confirmed.", smsErr);
          setOrders((prev) =>
            prev.map((o) => (o.id === newOrder.id ? { ...o, giftSmsStatus: "Failed" } : o))
          );
        });
    }

    return newOrder;
  };

  const updateOrderStatus = (orderId: string, newStatus: OrderStatus, trackingNo?: string) => {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id === orderId) {
          const oldStatus = o.orderStatus;
          const updated = {
            ...o,
            orderStatus: newStatus,
            trackingNumber: trackingNo || o.trackingNumber,
            updatedAt: new Date().toISOString().replace("T", " ").substring(0, 19),
          };
          recordAuditLog(`Order #${o.orderNumber} status changed`, "Order", oldStatus, newStatus);
          return updated;
        }
        return o;
      })
    );
    addToast(`Order status updated to '${newStatus}'`, "success");
  };

  // Coupons
  const addCoupon = (c: Omit<Coupon, "id" | "usageCount">) => {
    const newC: Coupon = { ...c, id: `cpn-${Date.now()}`, usageCount: 0 };
    setCoupons((prev) => [...prev, newC]);
    recordAuditLog(`Created Coupon '${newC.code}'`, "Coupon");
    addToast(`Coupon '${newC.code}' created`, "success");
  };

  const updateCoupon = (id: string, c: Partial<Coupon>) => {
    setCoupons((prev) => prev.map((item) => (item.id === id ? { ...item, ...c } : item)));
    addToast("Coupon updated", "success");
  };

  const deleteCoupon = (id: string) => {
    setCoupons((prev) => prev.filter((item) => item.id !== id));
    addToast("Coupon deleted", "warning");
  };

  // Reviews
  const approveReview = (id: string) => {
    setReviews((prev) => prev.map((r) => (r.id === id ? { ...r, status: "Approved" } : r)));
    recordAuditLog(`Approved Review ID ${id}`, "Product");
    addToast("Review approved", "success");
  };

  const rejectReview = (id: string) => {
    setReviews((prev) => prev.map((r) => (r.id === id ? { ...r, status: "Rejected" } : r)));
    recordAuditLog(`Rejected Review ID ${id}`, "Product");
    addToast("Review rejected", "warning");
  };

  const addReview = (rData: Omit<Review, "id" | "createdAt" | "status">) => {
    const newR: Review = {
      ...rData,
      id: `rev-${Date.now()}`,
      status: "Approved",
      createdAt: new Date().toISOString().replace("T", " ").substring(0, 19),
    };
    setReviews((prev) => [newR, ...prev]);
    addToast("Review submitted successfully!", "success");
  };

  // Inventory
  const executeInventoryTransaction = (txData: Omit<InventoryTransaction, "id" | "createdAt" | "performedBy">) => {
    const now = new Date().toISOString().replace("T", " ").substring(0, 19);
    const newTx: InventoryTransaction = {
      ...txData,
      id: `inv-${Date.now()}`,
      createdAt: now,
      performedBy: currentUser.name,
    };
    setInventoryTransactions((prev) => [newTx, ...prev]);

    // Adjust product stock
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === txData.productId || p.sku === txData.sku) {
          let stockDiff = 0;
          if (txData.type === "Stock In") stockDiff = txData.quantity;
          else if (txData.type === "Stock Out") stockDiff = -txData.quantity;
          else if (txData.type === "Adjustment") stockDiff = txData.quantity;

          const updatedStock = Math.max(0, p.totalStock + stockDiff);
          return {
            ...p,
            totalStock: updatedStock,
            isLowStock: updatedStock <= 5,
          };
        }
        return p;
      })
    );

    recordAuditLog(`Inventory ${txData.type}: ${txData.quantity} units for SKU ${txData.sku}`, "Inventory");
    addToast(`Inventory transaction logged: ${txData.type}`, "success");
  };

  // Settings & CMS
  const updateSettings = (s: Partial<SystemSettings>) => {
    setSettings((prev) => ({ ...prev, ...s }));
    recordAuditLog("Updated System Settings", "Settings");
    addToast("System settings saved!", "success");
  };

  const updateWebsiteBranding = async (branding: {
    websiteName?: string;
    tagline?: string;
    logoUrl?: string | null;
    faviconUrl?: string | null;
  }): Promise<{ success: boolean; error?: string }> => {
    const token = localStorage.getItem("auth_token") || sessionStorage.getItem("auth_token");
    try {
      const res = await fetch("/api/settings/website-profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(branding),
      });

      const data = await res.json();
      if (!res.ok) {
        const errMsg = data.error || "Failed to update website branding";
        addToast(errMsg, "error");
        return { success: false, error: errMsg };
      }

      setSettings((prev) => ({
        ...prev,
        websiteName: data.data.websiteName,
        siteName: data.data.siteName,
        tagline: data.data.tagline,
        logoUrl: data.data.logoUrl,
        faviconUrl: data.data.faviconUrl,
        updatedAt: data.data.updatedAt,
        updatedBy: data.data.updatedBy,
      }));

      recordAuditLog(
        "Updated Website Profile & Branding Settings",
        "Settings",
        "",
        data.changedFields ? data.changedFields.join("; ") : "Branding updated"
      );
      addToast("Website branding saved successfully!", "success");
      return { success: true };
    } catch (err: any) {
      const errorMsg = err.message || "Network error while saving branding";
      addToast(errorMsg, "error");
      return { success: false, error: errorMsg };
    }
  };

  const updateHomeBanner = (id: string, banner: Partial<HomeBanner>) => {
    setHomeBanners((prev) => prev.map((b) => (b.id === id ? { ...b, ...banner } : b)));
    recordAuditLog(`Updated Home Banner ID ${id}`, "Settings");
    addToast("Home Banner updated", "success");
  };

  const addHomeBanner = (bannerData: Omit<HomeBanner, "id">) => {
    const newBanner: HomeBanner = {
      ...bannerData,
      id: `ban-${Date.now()}`,
      isActive: bannerData.isActive ?? true,
    };
    setHomeBanners((prev) => [...prev, newBanner]);
    addToast("New Hero Banner created successfully!", "success");
    recordAuditLog(`Added new Hero Banner: ${bannerData.title}`, "Settings");
  };

  const deleteHomeBanner = (id: string) => {
    setHomeBanners((prev) => prev.filter((b) => b.id !== id));
    addToast("Hero Banner deleted!", "info");
    recordAuditLog(`Deleted Hero Banner: ${id}`, "Settings");
  };

  // Security Labels CRUD
  const addSecurityLabel = (labelData: Omit<SecurityLabel, "id">) => {
    const newLabel: SecurityLabel = {
      ...labelData,
      id: `sec-${Date.now()}`,
    };
    setSecurityLabels((prev) => [...prev, newLabel]);
    addToast("Security label added successfully!", "success");
    recordAuditLog(`Added Security Label: ${labelData.title}`, "Settings");
  };

  const updateSecurityLabel = (id: string, updated: Partial<SecurityLabel>) => {
    setSecurityLabels((prev) => prev.map((l) => (l.id === id ? { ...l, ...updated } : l)));
    addToast("Security label updated!", "success");
    recordAuditLog(`Updated Security Label: ${id}`, "Settings");
  };

  const deleteSecurityLabel = (id: string) => {
    setSecurityLabels((prev) => prev.filter((l) => l.id !== id));
    addToast("Security label deleted!", "info");
    recordAuditLog(`Deleted Security Label: ${id}`, "Settings");
  };

  const toggleSecurityLabelActive = (id: string) => {
    setSecurityLabels((prev) =>
      prev.map((l) => (l.id === id ? { ...l, isActive: !l.isActive } : l))
    );
    addToast("Security label active status toggled!", "info");
  };

  // Company & Customer Care Action Implementations
  const updateAboutUs = (data: Partial<AboutUsData>) => {
    setAboutUs((prev) => ({
      ...prev,
      ...data,
      updatedAt: new Date().toISOString().split("T")[0],
    }));
    addToast("About Us content updated successfully!", "success");
    recordAuditLog("Updated About Us CMS page", "CMS");
  };

  const updateContactInfo = (data: Partial<ContactInfoData>) => {
    setContactInfo((prev) => ({ ...prev, ...data }));
    addToast("Contact information updated successfully!", "success");
    recordAuditLog("Updated Contact Info CMS settings", "CMS");
  };

  const addContactInquiry = (inquiry: Omit<ContactInquiry, "id" | "createdAt" | "status">) => {
    const newInquiry: ContactInquiry = {
      ...inquiry,
      id: `inq-${Date.now()}`,
      status: "New",
      createdAt: new Date().toISOString().replace("T", " ").substring(0, 16),
    };
    setContactInquiries((prev) => [newInquiry, ...prev]);
    addToast("Thank you! Your message has been sent to our customer care team.", "success");
  };

  const updateContactInquiry = (id: string, updates: Partial<ContactInquiry>) => {
    setContactInquiries((prev) => prev.map((inq) => (inq.id === id ? { ...inq, ...updates } : inq)));
    addToast("Inquiry status updated!", "info");
    recordAuditLog(`Updated Contact Inquiry ${id}`, "CMS");
  };

  const deleteContactInquiry = (id: string) => {
    setContactInquiries((prev) => prev.filter((inq) => inq.id !== id));
    addToast("Inquiry deleted", "info");
    recordAuditLog(`Deleted Contact Inquiry ${id}`, "CMS");
  };

  const addJobPosting = (job: Omit<JobPosting, "id" | "createdAt">) => {
    const newJob: JobPosting = {
      ...job,
      id: `job-${Date.now()}`,
      createdAt: new Date().toISOString().split("T")[0],
    };
    setJobPostings((prev) => [newJob, ...prev]);
    addToast("New Job Vacancy created successfully!", "success");
    recordAuditLog(`Created Job Posting '${job.title}'`, "Careers");
  };

  const updateJobPosting = (id: string, updates: Partial<JobPosting>) => {
    setJobPostings((prev) => prev.map((j) => (j.id === id ? { ...j, ...updates } : j)));
    addToast("Job posting updated!", "success");
    recordAuditLog(`Updated Job Posting ${id}`, "Careers");
  };

  const deleteJobPosting = (id: string) => {
    setJobPostings((prev) => prev.filter((j) => j.id !== id));
    addToast("Job vacancy deleted", "info");
    recordAuditLog(`Deleted Job Posting ${id}`, "Careers");
  };

  const addJobApplication = (app: Omit<JobApplication, "id" | "appliedAt" | "status">) => {
    const newApp: JobApplication = {
      ...app,
      id: `app-${Date.now()}`,
      status: "Submitted",
      appliedAt: new Date().toISOString().replace("T", " ").substring(0, 16),
    };
    setJobApplications((prev) => [newApp, ...prev]);
    addToast("Application submitted successfully! Our HR team will contact you soon.", "success");
  };

  const updateJobApplication = (id: string, updates: Partial<JobApplication>) => {
    setJobApplications((prev) => prev.map((a) => (a.id === id ? { ...a, ...updates } : a)));
    addToast("Job application status updated!", "info");
    recordAuditLog(`Updated Job Application ${id}`, "Careers");
  };

  const deleteJobApplication = (id: string) => {
    setJobApplications((prev) => prev.filter((a) => a.id !== id));
    addToast("Job application record deleted", "info");
    recordAuditLog(`Deleted Job Application ${id}`, "Careers");
  };

  const updatePrivacyPolicy = (data: Partial<PolicyDocument>, notes?: string) => {
    setPrivacyPolicy((prev) => {
      const nextVer = (parseFloat(prev.version) + 0.1).toFixed(1);
      const newHistory = notes
        ? [{ version: nextVer, updatedAt: new Date().toISOString().split("T")[0], updatedBy: currentUser.name, notes }, ...prev.history]
        : prev.history;

      return {
        ...prev,
        ...data,
        version: nextVer,
        updatedAt: new Date().toISOString().split("T")[0],
        history: newHistory,
      };
    });
    addToast("Privacy Policy updated successfully!", "success");
    recordAuditLog("Updated Privacy Policy document", "CMS");
  };

  const updateTermsConditions = (data: Partial<PolicyDocument>, notes?: string) => {
    setTermsConditions((prev) => {
      const nextVer = (parseFloat(prev.version) + 0.1).toFixed(1);
      const newHistory = notes
        ? [{ version: nextVer, updatedAt: new Date().toISOString().split("T")[0], updatedBy: currentUser.name, notes }, ...prev.history]
        : prev.history;

      return {
        ...prev,
        ...data,
        version: nextVer,
        updatedAt: new Date().toISOString().split("T")[0],
        history: newHistory,
      };
    });
    addToast("Terms & Conditions updated successfully!", "success");
    recordAuditLog("Updated Terms & Conditions document", "CMS");
  };

  const updateReturnPolicy = (data: Partial<PolicyDocument>, notes?: string) => {
    setReturnPolicy((prev) => {
      const nextVer = (parseFloat(prev.version) + 0.1).toFixed(1);
      const newHistory = notes
        ? [{ version: nextVer, updatedAt: new Date().toISOString().split("T")[0], updatedBy: currentUser.name, notes }, ...prev.history]
        : prev.history;

      return {
        ...prev,
        ...data,
        version: nextVer,
        updatedAt: new Date().toISOString().split("T")[0],
        history: newHistory,
      };
    });
    addToast("Return Policy updated successfully!", "success");
    recordAuditLog("Updated Return Policy document", "CMS");
  };

  const addFAQCategory = (cat: Omit<FAQCategory, "id">) => {
    const newCat: FAQCategory = { ...cat, id: `faq-cat-${Date.now()}` };
    setFaqCategories((prev) => [...prev, newCat]);
    addToast("FAQ Category added!", "success");
    recordAuditLog(`Added FAQ Category '${cat.name}'`, "CMS");
  };

  const updateFAQCategory = (id: string, updates: Partial<FAQCategory>) => {
    setFaqCategories((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)));
    addToast("FAQ Category updated!", "info");
    recordAuditLog(`Updated FAQ Category ${id}`, "CMS");
  };

  const deleteFAQCategory = (id: string) => {
    setFaqCategories((prev) => prev.filter((c) => c.id !== id));
    addToast("FAQ Category deleted!", "info");
    recordAuditLog(`Deleted FAQ Category ${id}`, "CMS");
  };

  const addFAQExt = (item: Omit<FAQItemExt, "id" | "helpfulCount" | "notHelpfulCount">) => {
    const newItem: FAQItemExt = {
      ...item,
      id: `faq-ext-${Date.now()}`,
      helpfulCount: 0,
      notHelpfulCount: 0,
    };
    setFaqItemsExt((prev) => [...prev, newItem]);
    addToast("FAQ Question added!", "success");
    recordAuditLog(`Added FAQ Question '${item.question}'`, "CMS");
  };

  const updateFAQExt = (id: string, updates: Partial<FAQItemExt>) => {
    setFaqItemsExt((prev) => prev.map((f) => (f.id === id ? { ...f, ...updates } : f)));
    addToast("FAQ Question updated!", "info");
    recordAuditLog(`Updated FAQ Question ${id}`, "CMS");
  };

  const deleteFAQExt = (id: string) => {
    setFaqItemsExt((prev) => prev.filter((f) => f.id !== id));
    addToast("FAQ Question deleted!", "info");
    recordAuditLog(`Deleted FAQ Question ${id}`, "CMS");
  };

  const voteFAQ = (id: string, helpful: boolean) => {
    setFaqItemsExt((prev) =>
      prev.map((f) => {
        if (f.id === id) {
          return {
            ...f,
            helpfulCount: helpful ? f.helpfulCount + 1 : f.helpfulCount,
            notHelpfulCount: !helpful ? f.notHelpfulCount + 1 : f.notHelpfulCount,
          };
        }
        return f;
      })
    );
    addToast(helpful ? "Thank you for your feedback!" : "Feedback recorded. We will improve this answer.", "info");
  };

  const addReturnRequest = (req: Omit<ReturnRequest, "id" | "requestNumber" | "createdAt" | "updatedAt" | "status">) => {
    const newReq: ReturnRequest = {
      ...req,
      id: `ret-${Date.now()}`,
      requestNumber: `RET-2026-${Math.floor(100 + Math.random() * 900)}`,
      status: "Requested",
      createdAt: new Date().toISOString().split("T")[0],
      updatedAt: new Date().toISOString().split("T")[0],
    };
    setReturnRequests((prev) => [newReq, ...prev]);
    addToast("Return request submitted successfully! Tracking number generated.", "success");
  };

  const updateReturnRequest = (id: string, updates: Partial<ReturnRequest>) => {
    setReturnRequests((prev) =>
      prev.map((r) =>
        r.id === id
          ? {
              ...r,
              ...updates,
              updatedAt: new Date().toISOString().split("T")[0],
            }
          : r
      )
    );
    addToast("Return request status updated!", "info");
    recordAuditLog(`Updated Return Request ${id}`, "Support");
  };

  const deleteReturnRequest = (id: string) => {
    setReturnRequests((prev) => prev.filter((r) => r.id !== id));
    addToast("Return request record deleted", "info");
    recordAuditLog(`Deleted Return Request ${id}`, "Support");
  };

  const addSupportTicket = (
    ticket: Omit<SupportTicket, "id" | "ticketNumber" | "createdAt" | "updatedAt" | "status" | "messages">,
    initialMessage: string
  ) => {
    const ticketId = `tick-${Date.now()}`;
    const newTicket: SupportTicket = {
      ...ticket,
      id: ticketId,
      ticketNumber: `TCK-${Math.floor(1000 + Math.random() * 9000)}`,
      status: "Open",
      createdAt: new Date().toISOString().replace("T", " ").substring(0, 16),
      updatedAt: new Date().toISOString().replace("T", " ").substring(0, 16),
      messages: [
        {
          id: `msg-${Date.now()}`,
          sender: "Customer",
          senderName: ticket.customerName,
          message: initialMessage,
          createdAt: new Date().toISOString().replace("T", " ").substring(0, 16),
        },
      ],
    };
    setSupportTickets((prev) => [newTicket, ...prev]);
    addToast("Support ticket created! Agent will respond shortly.", "success");
  };

  const updateSupportTicket = (id: string, updates: Partial<SupportTicket>) => {
    setSupportTickets((prev) =>
      prev.map((t) =>
        t.id === id
          ? {
              ...t,
              ...updates,
              updatedAt: new Date().toISOString().replace("T", " ").substring(0, 16),
            }
          : t
      )
    );
    addToast("Support ticket updated", "info");
  };

  const addTicketMessage = (
    ticketId: string,
    sender: "Customer" | "Support Agent" | "System",
    senderName: string,
    message: string,
    attachments: string[] = []
  ) => {
    const newMsg: TicketMessage = {
      id: `msg-${Date.now()}`,
      sender,
      senderName,
      message,
      attachments,
      createdAt: new Date().toISOString().replace("T", " ").substring(0, 16),
    };

    setSupportTickets((prev) =>
      prev.map((t) =>
        t.id === ticketId
          ? {
              ...t,
              messages: [...t.messages, newMsg],
              updatedAt: new Date().toISOString().replace("T", " ").substring(0, 16),
              status: sender === "Support Agent" && t.status === "Open" ? "In Progress" : t.status,
            }
          : t
      )
    );
  };

  const escalateTicket = (ticketId: string, priority: "Low" | "Medium" | "High" | "Urgent", note?: string) => {
    setSupportTickets((prev) =>
      prev.map((t) => {
        if (t.id === ticketId) {
          const sysMsg: TicketMessage = {
            id: `msg-${Date.now()}`,
            sender: "System",
            senderName: "System Escalate",
            message: `Ticket escalated to ${priority} Priority. Note: ${note || "Manager review requested"}`,
            createdAt: new Date().toISOString().replace("T", " ").substring(0, 16),
          };
          return {
            ...t,
            priority,
            messages: [...t.messages, sysMsg],
            updatedAt: new Date().toISOString().replace("T", " ").substring(0, 16),
          };
        }
        return t;
      })
    );
    addToast(`Ticket escalated to ${priority} priority!`, "warning");
    recordAuditLog(`Escalated Support Ticket ${ticketId} to ${priority}`, "Support");
  };

  const deleteSupportTicket = (id: string) => {
    setSupportTickets((prev) => prev.filter((t) => t.id !== id));
    addToast("Support ticket deleted", "info");
    recordAuditLog(`Deleted Support Ticket ${id}`, "Support");
  };

  return (
    <StoreContext.Provider
      value={{
        language,
        setLanguage,
        mode,
        setMode,
        storeView,
        setStoreView,
        adminView,
        setAdminView,
        currentUser,
        setCurrentUser,
        activeRole,
        switchRole,
        loginUser,
        logoutUser,
        permissions,
        updateRolePermission,
        hasPermission,
        searchQuery,
        setSearchQuery,
        selectedCategoryId,
        setSelectedCategoryId,
        selectedBrandId,
        setSelectedBrandId,
        selectedProduct,
        setSelectedProduct,
        products,
        categories,
        brands,
        warehouses,
        users,
        orders,
        coupons,
        reviews,
        auditLogs,
        inventoryTransactions,
        settings,
        homeBanners,
        securityLabels,
        blogs,
        faqs,
        cart,
        addToCart,
        updateCartQuantity,
        removeFromCart,
        clearCart,
        appliedCoupon,
        applyCoupon,
        removeCoupon,
        getCouponEvaluation,
        wishlist,
        toggleWishlist,
        compareList,
        toggleCompare,
        addProduct,
        updateProduct,
        deleteProduct,
        bulkAddProducts,
        bulkUpdateProductStatus,
        bulkDeleteProducts,
        addCategory,
        updateCategory,
        deleteCategory,
        addBrand,
        updateBrand,
        deleteBrand,
        placeOrder,
        updateOrderStatus,
        addCoupon,
        updateCoupon,
        deleteCoupon,
        approveReview,
        rejectReview,
        addReview,
        executeInventoryTransaction,
        updateSettings,
        updateWebsiteBranding,
        updateHomeBanner,
        addHomeBanner,
        deleteHomeBanner,
        addSecurityLabel,
        updateSecurityLabel,
        deleteSecurityLabel,
        toggleSecurityLabelActive,
        aboutUs,
        updateAboutUs,
        contactInfo,
        updateContactInfo,
        contactInquiries,
        addContactInquiry,
        updateContactInquiry,
        deleteContactInquiry,
        jobPostings,
        addJobPosting,
        updateJobPosting,
        deleteJobPosting,
        jobApplications,
        addJobApplication,
        updateJobApplication,
        deleteJobApplication,
        privacyPolicy,
        updatePrivacyPolicy,
        termsConditions,
        updateTermsConditions,
        returnPolicy,
        updateReturnPolicy,
        faqCategories,
        addFAQCategory,
        updateFAQCategory,
        deleteFAQCategory,
        faqItemsExt,
        addFAQExt,
        updateFAQExt,
        deleteFAQExt,
        voteFAQ,
        returnRequests,
        addReturnRequest,
        updateReturnRequest,
        deleteReturnRequest,
        supportTickets,
        addSupportTicket,
        updateSupportTicket,
        addTicketMessage,
        escalateTicket,
        deleteSupportTicket,
        liveChatOpen,
        setLiveChatOpen,
        advertisements,
        selectedOffer,
        setSelectedOffer,
        addAdvertisement,
        updateAdvertisement,
        deleteAdvertisement,
        trackAdImpression,
        trackAdClick,
        toasts,
        addToast,
        removeToast,
        recordAuditLog,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error("useStore must be used within a StoreProvider");
  }
  return context;
};
