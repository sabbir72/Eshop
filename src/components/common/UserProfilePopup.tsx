import React, { useEffect, useRef } from "react";
import { useStore } from "../../context/StoreContext";
import { UserRole } from "../../types";
import {
  User as UserIcon,
  Shield,
  ShoppingBag,
  Heart,
  LayoutDashboard,
  Store,
  FileSpreadsheet,
  Smartphone,
  LogOut,
  X,
  Mail,
  Phone,
  CheckCircle,
  ExternalLink,
  ChevronRight,
  Settings,
  Sparkles,
  Download,
  Crown,
} from "lucide-react";

interface UserProfilePopupProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenExcelModal?: () => void;
  onOpenAndroidModal?: () => void;
}

export const UserProfilePopup: React.FC<UserProfilePopupProps> = ({
  isOpen,
  onClose,
  onOpenExcelModal,
  onOpenAndroidModal,
}) => {
  const {
    currentUser,
    activeRole,
    switchRole,
    logoutUser,
    mode,
    setMode,
    setStoreView,
    setAdminView,
    addToast,
    orders,
    wishlist,
    cart,
    language,
  } = useStore();

  const isBN = language === "BN";

  const popupRef = useRef<HTMLDivElement>(null);

  // Auto-hide popup when clicking anywhere outside or pressing Escape
  useEffect(() => {
    if (!isOpen) return;

    const handleOutsideClick = (e: MouseEvent | TouchEvent) => {
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("touchstart", handleOutsideClick);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("touchstart", handleOutsideClick);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const isAdminRole = activeRole !== "Customer" && activeRole !== "Guest";

  const allRoles: UserRole[] = [
    "Super Admin",
    "Admin",
    "Category Manager",
    "Product Manager",
    "Order Manager",
    "Customer Support",
    "Customer",
  ];

  const handleRoleChange = (role: UserRole) => {
    switchRole(role);
    addToast(`ব্যবহারকারী রোল পরিবর্তন করা হয়েছে: ${role}`, "info");
  };

  const handleNavigate = (action: () => void) => {
    action();
    onClose();
  };

  // User orders count
  const userOrdersCount = orders.filter(
    (o) =>
      o.customerId === currentUser.id ||
      o.customerEmail === currentUser.email ||
      o.customerPhone === currentUser.phone
  ).length || orders.length;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150 cursor-pointer"
    >
      <div
        ref={popupRef}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-slate-200 overflow-hidden text-slate-900 cursor-default animate-in zoom-in-95 duration-200 relative my-auto"
      >
        {/* Header Background Gradient */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 text-white relative">
          {/* Close Button */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close Profile Popup"
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 active:bg-white/30 text-slate-200 hover:text-white transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          {/* User Info Card */}
          <div className="flex items-center gap-4">
            <div className="relative shrink-0">
              {currentUser.avatar ? (
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-indigo-400 shadow-md"
                />
              ) : (
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-500 to-emerald-400 text-white font-black text-2xl flex items-center justify-center border-2 border-indigo-300 shadow-md">
                  {currentUser.name ? currentUser.name[0].toUpperCase() : "U"}
                </div>
              )}
              <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-slate-900" />
            </div>

            <div className="min-w-0 flex-1 space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2 py-0.5 text-[10px] font-black uppercase tracking-wider rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {activeRole}
                </span>
                <span className="flex items-center gap-1 text-[11px] text-slate-300">
                  <CheckCircle className="w-3 h-3 text-emerald-400" /> {isBN ? "ভেরিফাইড" : "Verified"}
                </span>
              </div>
              <h3 className="text-base font-black text-white truncate">
                {currentUser.name || "Sabbir Hossain"}
              </h3>
              <p className="text-xs text-slate-300 truncate flex items-center gap-1.5">
                <Mail className="w-3 h-3 text-indigo-400 shrink-0" />
                <span className="truncate">{currentUser.email || "sabbircse72@gmail.com"}</span>
              </p>
              {currentUser.phone && (
                <p className="text-[11px] text-slate-400 truncate flex items-center gap-1.5">
                  <Phone className="w-3 h-3 text-emerald-400 shrink-0" />
                  <span>{currentUser.phone}</span>
                </p>
              )}
            </div>
          </div>

          {/* User Fast Stats */}
          <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-white/10 text-center">
            <div className="bg-white/5 p-2 rounded-xl">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">{isBN ? "মোট অর্ডার" : "Total Orders"}</span>
              <span className="text-sm font-black text-white">{userOrdersCount}{isBN ? "টি" : ""}</span>
            </div>
            <div className="bg-white/5 p-2 rounded-xl">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">{isBN ? "পছন্দের তালিকা" : "Wishlist"}</span>
              <span className="text-sm font-black text-rose-400">{wishlist.length}{isBN ? "টি" : ""}</span>
            </div>
            <div className="bg-white/5 p-2 rounded-xl">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">{isBN ? "কার্ট আইটেম" : "Cart Items"}</span>
              <span className="text-sm font-black text-amber-400">{cart.length}{isBN ? "টি" : ""}</span>
            </div>
          </div>
        </div>

        {/* Interactive Action Menu & Features */}
        <div className="p-4 space-y-3 max-h-[55vh] overflow-y-auto">
          {/* Quick RBAC Role Switcher (Admin / Staff Only) */}
          {isAdminRole && (
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <Shield className="w-3 h-3 text-indigo-600" /> দ্রুত রোল পরিবর্তন (RBAC Switcher)
                </span>
                <span className="text-indigo-600 font-bold">{activeRole}</span>
              </label>
              <select
                value={activeRole}
                onChange={(e) => handleRoleChange(e.target.value as UserRole)}
                className="w-full bg-white border border-slate-300 text-slate-800 text-xs font-bold py-1.5 px-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer shadow-2xs"
              >
                {allRoles.map((r) => (
                  <option key={r} value={r}>
                    {r} {r === "Super Admin" ? "👑 (পূর্ণ ক্ষমতা)" : ""}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Core Feature Buttons Grid */}
          <div className="space-y-1.5 text-xs font-bold text-slate-700">
            {/* 1. Universal Excel System (Admin / Staff Only) */}
            {isAdminRole && (
              <button
                onClick={() => {
                  onClose();
                  setMode("admin");
                  setAdminView("excel-hub");
                }}
                className="w-full flex items-center justify-between p-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100/80 text-emerald-900 border border-emerald-200 transition cursor-pointer group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <FileSpreadsheet className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <p className="font-extrabold text-xs text-emerald-950">এক্সেল ডাটা হাব ও টেমপ্লেট (Excel System)</p>
                    <p className="text-[10px] text-emerald-700 font-medium">ইনপুট টেমপ্লেট ডাউনলোড, বাল্ক আপলোড ও এক্সপোর্ট</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-emerald-600 group-hover:translate-x-0.5 transition-transform" />
              </button>
            )}

            {/* 2. Android App Hub */}
            <button
              onClick={() => {
                onClose();
                onOpenAndroidModal?.();
              }}
              className="w-full flex items-center justify-between p-2.5 rounded-xl bg-teal-50 hover:bg-teal-100/80 text-teal-900 border border-teal-200 transition cursor-pointer group"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-teal-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Smartphone className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <p className="font-extrabold text-xs text-teal-950">
                    {isBN ? "অ্যান্ড্রয়েড মোবাইল অ্যাপ (v2.5.0)" : "Android Mobile App (v2.5.0)"}
                  </p>
                  <p className="text-[10px] text-teal-700 font-medium">
                    {isBN ? "১-ক্লিক অ্যান্ড্রয়েড ইনস্টল, PWA ও অফলাইন সুবিধা" : "1-Click install, WebAPK & offline mode"}
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-teal-600 group-hover:translate-x-0.5 transition-transform" />
            </button>

            {/* 3. Admin / Storefront Toggle */}
            {isAdminRole ? (
              <button
                onClick={() =>
                  handleNavigate(() => {
                    if (mode === "storefront") {
                      setMode("admin");
                      setAdminView("dashboard");
                      addToast(
                        isBN ? "অ্যাডমিন কমান্ড সেন্টারে প্রবেশ করা হয়েছে" : "Entered Admin Command Center",
                        "success"
                      );
                    } else {
                      setMode("storefront");
                      setStoreView("home");
                      addToast(
                        isBN ? "কাস্টমার স্টোরফ্রন্টে ফিরে এসেছেন" : "Switched to Storefront View",
                        "info"
                      );
                    }
                  })
                }
                className="w-full flex items-center justify-between p-2.5 rounded-xl bg-indigo-50 hover:bg-indigo-100/80 text-indigo-900 border border-indigo-200 transition cursor-pointer group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                    {mode === "storefront" ? (
                      <LayoutDashboard className="w-4 h-4" />
                    ) : (
                      <Store className="w-4 h-4" />
                    )}
                  </div>
                  <div className="text-left">
                    <p className="font-extrabold text-xs text-indigo-950">
                      {mode === "storefront"
                        ? isBN
                          ? "অ্যাডমিন কমান্ড সেন্টার (Admin Portal)"
                          : "Admin Command Center (Portal)"
                        : isBN
                        ? "কাস্টমার স্টোরফ্রন্ট ভিউ (Storefront)"
                        : "Customer Storefront View"}
                    </p>
                    <p className="text-[10px] text-indigo-700 font-medium">
                      {mode === "storefront"
                        ? isBN
                          ? "পণ্য, ইনভেন্টরি, অর্ডার ও এআই অপারেটর"
                          : "Manage products, inventory, orders & AI"
                        : isBN
                        ? "সাধারণ ক্রেতা হিসেবে ওয়েবসাইট ব্রাউজ করুন"
                        : "Browse website as regular customer"}
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-indigo-600 group-hover:translate-x-0.5 transition-transform" />
              </button>
            ) : null}

            {/* 4. Full Profile View & Account Center */}
            <button
              onClick={() =>
                handleNavigate(() => {
                  setStoreView("profile");
                })
              }
              className="w-full flex items-center justify-between p-2.5 rounded-xl bg-gradient-to-r from-indigo-50 to-purple-50 hover:from-indigo-100 hover:to-purple-100 text-indigo-950 border border-indigo-200 transition cursor-pointer group"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <UserIcon className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <div className="flex items-center gap-1.5">
                    <span className="font-extrabold text-xs text-indigo-950">
                      {isBN ? "পূর্ণাঙ্গ ইউজার ভিউ ও প্রোফাইল" : "Full User Account Profile"}
                    </span>
                    <span className="text-[9px] font-black bg-indigo-200 text-indigo-800 px-1.5 py-0.2 rounded">
                      {isBN ? "আপডেট" : "PRO"}
                    </span>
                  </div>
                  <p className="text-[10px] text-indigo-700 font-medium">
                    {isBN
                      ? "অর্ডার ড্যাশবোর্ড, লয়ালটি পয়েন্ট, ঠিকানা বই ও নিরাপত্তা"
                      : "Orders dashboard, points, address book & security"}
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-indigo-600 group-hover:translate-x-0.5 transition-transform" />
            </button>

            {/* VIP Membership & Card Club */}
            <button
              onClick={() =>
                handleNavigate(() => {
                  setStoreView("membership");
                })
              }
              className="w-full flex items-center justify-between p-2.5 rounded-xl bg-gradient-to-r from-amber-500/10 via-yellow-500/10 to-amber-500/10 hover:from-amber-500/20 hover:to-yellow-500/20 text-slate-900 border border-amber-300/80 transition cursor-pointer group"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-500 to-yellow-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Crown className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <div className="flex items-center gap-1.5">
                    <span className="font-extrabold text-xs text-amber-950">
                      {isBN ? "ভিআইপি মেম্বারশিপ কার্ড ও ক্লাব" : "VIP Membership & Card"}
                    </span>
                    <span className="text-[9px] font-black bg-amber-200 text-amber-900 px-1.5 py-0.2 rounded">
                      {currentUser?.membership?.status === "active" ? currentUser.membership.tier : (isBN ? "৩টি টিয়ার" : "3 Tiers")}
                    </span>
                  </div>
                  <p className="text-[10px] text-amber-800 font-medium">
                    {isBN
                      ? "ফিজিক্যাল কার্ড ডেলিভারি, মেম্বার ডিসকাউন্ট ও প্রাইস কম্প্রোমাইজ"
                      : "Card delivery, exclusive discounts & price compromise"}
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-amber-600 group-hover:translate-x-0.5 transition-transform" />
            </button>

            {/* 5. My Orders */}
            <button
              onClick={() =>
                handleNavigate(() => {
                  setStoreView("orders");
                })
              }
              className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-100 text-slate-800 transition cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-slate-200 text-slate-700 flex items-center justify-center shrink-0">
                  <ShoppingBag className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <span className="font-bold text-xs block">
                    {isBN ? "আমার সকল অর্ডার ও ট্র্যাকিং" : "My Orders & Tracking"}
                  </span>
                  <span className="text-[10px] text-slate-500 font-medium">
                    {isBN
                      ? "অর্ডার স্টেটাস, রিসিট ও ডেলিভারি হিস্ট্রি"
                      : "Order status, receipts & tracking"}
                  </span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>
          </div>
        </div>

        {/* Footer with Logout */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={() => {
              onClose();
              logoutUser();
              addToast(isBN ? "সফলভাবে লগআউট করা হয়েছে" : "Logged out successfully", "info");
            }}
            className="px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer border border-rose-200 active:scale-95"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>{isBN ? "লগআউট (Sign Out)" : "Sign Out"}</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs transition cursor-pointer active:scale-95"
          >
            {isBN ? "বন্ধ করুন (Close)" : "Close"}
          </button>
        </div>
      </div>
    </div>
  );
};
