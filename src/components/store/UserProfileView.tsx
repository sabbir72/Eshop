import React, { useState, useMemo } from "react";
import { useStore } from "../../context/StoreContext";
import { PasswordInput } from "../common/PasswordInput";
import { Order, OrderStatus } from "../../types";
import {
  User,
  KeyRound,
  Shield,
  MapPin,
  Mail,
  Phone,
  ShoppingBag,
  CheckCircle,
  Clock,
  Sparkles,
  Award,
  Wallet,
  Heart,
  Bell,
  ChevronRight,
  Plus,
  Trash2,
  Edit3,
  Camera,
  Smartphone,
  AlertCircle,
  Eye,
  Calendar,
  Lock,
  ArrowRight,
  RotateCcw,
  Package,
  Truck,
  Check,
  X,
  CreditCard,
  FileText,
  HelpCircle,
  ExternalLink,
} from "lucide-react";

type ProfileTab = "overview" | "orders" | "profile" | "addresses" | "security" | "notifications";

interface SavedAddress {
  id: string;
  title: string; // e.g., "বাসা (Home)", "অফিস (Office)"
  recipientName: string;
  phone: string;
  street: string;
  city: string;
  isDefault: boolean;
}

const AVATAR_PRESETS = [
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=250",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=250",
  "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=250",
  "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&q=80&w=250",
];

export const UserProfileView: React.FC = () => {
  const {
    currentUser,
    setCurrentUser,
    addToast,
    recordAuditLog,
    activeRole,
    setStoreView,
    orders,
    wishlist,
    cart,
    settings,
    addToCart,
    setSelectedProduct,
  } = useStore();

  const [activeTab, setActiveTab] = useState<ProfileTab>("overview");

  // Profile Form State
  const [name, setName] = useState(currentUser.name || "Sabbir Hossain");
  const [email, setEmail] = useState(currentUser.email || "sabbircse72@gmail.com");
  const [phone, setPhone] = useState(currentUser.phone || "01712345678");
  const [address, setAddress] = useState(currentUser.address || "House 12, Road 4, Dhanmondi, Dhaka");
  const [gender, setGender] = useState<"male" | "female" | "other">("male");
  const [birthDate, setBirthDate] = useState("1996-05-15");
  const [avatar, setAvatar] = useState(currentUser.avatar || AVATAR_PRESETS[1]);
  const [isAvatarPickerOpen, setIsAvatarPickerOpen] = useState(false);
  const [customAvatarUrl, setCustomAvatarUrl] = useState("");

  // Two Factor & Security
  const [twoFactor, setTwoFactor] = useState(currentUser.twoFactorEnabled ?? true);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  // Saved Addresses State
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([
    {
      id: "addr-1",
      title: "বাসা (Home)",
      recipientName: currentUser.name || "Sabbir Hossain",
      phone: currentUser.phone || "01712345678",
      street: currentUser.address || "House 12, Road 4, Dhanmondi",
      city: "ঢাকা (Dhaka)",
      isDefault: true,
    },
    {
      id: "addr-2",
      title: "অফিস (Office)",
      recipientName: currentUser.name || "Sabbir Hossain",
      phone: currentUser.phone || "01712345678",
      street: "Level 8, Concord Tower, Motijheel C/A",
      city: "ঢাকা (Dhaka)",
      isDefault: false,
    },
  ]);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [newAddressForm, setNewAddressForm] = useState({
    title: "বাসা (Home)",
    recipientName: currentUser.name || "",
    phone: currentUser.phone || "",
    street: "",
    city: "ঢাকা (Dhaka)",
    isDefault: false,
  });

  // Notification Preferences State
  const [notifications, setNotifications] = useState({
    smsOrderAlerts: true,
    whatsappAlerts: true,
    promoEmails: false,
    orderDeliveredOtp: true,
  });

  // Selected Order for Receipt / Tracking Modal
  const [selectedOrderDetails, setSelectedOrderDetails] = useState<Order | null>(null);
  const [orderFilter, setOrderFilter] = useState<"all" | "processing" | "delivered" | "cancelled">("all");

  // User orders calculation
  const userOrders = useMemo(() => {
    return orders.filter(
      (o) =>
        o.customerId === currentUser.id ||
        o.customerEmail === currentUser.email ||
        o.customerPhone === currentUser.phone ||
        !o.customerId // fallback for prototype data
    );
  }, [orders, currentUser]);

  const filteredOrders = useMemo(() => {
    if (orderFilter === "all") return userOrders;
    if (orderFilter === "processing") {
      return userOrders.filter(
        (o) => o.orderStatus === "Pending" || o.orderStatus === "Processing" || o.orderStatus === "Shipped"
      );
    }
    if (orderFilter === "delivered") {
      return userOrders.filter((o) => o.orderStatus === "Delivered");
    }
    if (orderFilter === "cancelled") {
      return userOrders.filter((o) => o.orderStatus === "Cancelled");
    }
    return userOrders;
  }, [userOrders, orderFilter]);

  // Reward points calculated from purchases
  const totalPurchaseAmount = useMemo(() => {
    return userOrders.reduce((sum, o) => sum + (o.total || 0), currentUser.totalPurchase || 45000);
  }, [userOrders, currentUser]);

  const rewardPoints = Math.floor(totalPurchaseAmount / 100);
  const walletBalance = Math.floor(rewardPoints * 0.1); // 10 points = 1 BDT

  // Password strength score
  const passwordStrength = useMemo(() => {
    if (!newPassword) return 0;
    let score = 0;
    if (newPassword.length >= 8) score += 25;
    if (/[A-Z]/.test(newPassword)) score += 25;
    if (/[0-9]/.test(newPassword)) score += 25;
    if (/[^A-Za-z0-9]/.test(newPassword)) score += 25;
    return score;
  }, [newPassword]);

  if (activeRole === "Guest" || currentUser.role === "Guest") {
    return (
      <div className="bg-white p-8 rounded-3xl border border-slate-200 text-center max-w-md mx-auto my-12 space-y-4 shadow-sm">
        <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
          <Shield className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-black text-slate-900">লগইন বা সাইন-ইন প্রয়োজন</h2>
        <p className="text-xs text-slate-600 font-medium leading-relaxed">
          আপনার প্রোফাইল, অর্ডার হিস্ট্রি, ট্র্যাকিং ও নিরাপত্তা সেটিংস দেখতে অনুগ্রহ করে আপনার অ্যাকাউন্টে সাইন-ইন করুন।
        </p>
        <div className="pt-2 flex flex-col sm:flex-row gap-2 justify-center">
          <button
            onClick={() => setStoreView("home")}
            className="bg-indigo-600 text-white font-bold text-xs px-5 py-2.5 rounded-xl hover:bg-indigo-700 transition shadow-sm cursor-pointer"
          >
            হোমপেজে ফিরে যান
          </button>
        </div>
      </div>
    );
  }

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentUser({
      ...currentUser,
      name,
      email,
      phone,
      address,
      avatar,
      twoFactorEnabled: twoFactor,
    });
    recordAuditLog("Updated User Profile Details", "Auth");
    addToast("প্রোফাইল তথ্য সফলভাবে আপডেট ও সংরক্ষিত হয়েছে!", "success");
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) {
      addToast("অনুগ্রহ করে আপনার বর্তমান পাসওয়ার্ড দিন।", "error");
      return;
    }
    if (newPassword.length < 8) {
      addToast("নতুন পাসওয়ার্ড কমপক্ষে ৮ অক্ষরের হতে হবে।", "error");
      return;
    }
    if (newPassword !== confirmNewPassword) {
      addToast("উভয় নতুন পাসওয়ার্ড মিলছে না!", "error");
      return;
    }
    recordAuditLog("Changed Password", "Auth");
    addToast("পাসওয়ার্ড সফলভাবে পরিবর্তন করা হয়েছে!", "success");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmNewPassword("");
  };

  const handleAddAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddressForm.street || !newAddressForm.phone) {
      addToast("ঠিকানা ও মোবাইল নম্বর পূরণ করুন!", "error");
      return;
    }
    const newAddr: SavedAddress = {
      id: `addr-${Date.now()}`,
      title: newAddressForm.title,
      recipientName: newAddressForm.recipientName || name,
      phone: newAddressForm.phone,
      street: newAddressForm.street,
      city: newAddressForm.city,
      isDefault: newAddressForm.isDefault,
    };

    let updated = [...savedAddresses];
    if (newAddr.isDefault) {
      updated = updated.map((a) => ({ ...a, isDefault: false }));
    }
    updated.push(newAddr);
    setSavedAddresses(updated);
    setIsAddressModalOpen(false);
    setNewAddressForm({
      title: "বাসা (Home)",
      recipientName: name,
      phone: phone,
      street: "",
      city: "ঢাকা (Dhaka)",
      isDefault: false,
    });
    addToast("নতুন ডেলিভারি ঠিকানা যুক্ত করা হয়েছে!", "success");
  };

  const handleDeleteAddress = (id: string) => {
    if (savedAddresses.length <= 1) {
      addToast("কমপক্ষে একটি ঠিকানা সংরক্ষণ থাকা আবশ্যক!", "warning");
      return;
    }
    setSavedAddresses((prev) => prev.filter((a) => a.id !== id));
    addToast("ঠিকানাটি মুছে ফেলা হয়েছে!", "info");
  };

  const handleSetDefaultAddress = (id: string) => {
    setSavedAddresses((prev) =>
      prev.map((a) => ({
        ...a,
        isDefault: a.id === id,
      }))
    );
    addToast("ডিফল্ট শিপিং ঠিকানা সেট করা হয়েছে!", "success");
  };

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case "Delivered":
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-emerald-100 text-emerald-800 border border-emerald-300">✓ ডেলিভার্ড</span>;
      case "Shipped":
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-blue-100 text-blue-800 border border-blue-300">🚚 ডেলিভারির পথে</span>;
      case "Processing":
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-amber-100 text-amber-800 border border-amber-300">⚡ প্রসেসিং হচ্ছে</span>;
      case "Cancelled":
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-rose-100 text-rose-800 border border-rose-300">✕ বাতিল</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-slate-100 text-slate-800 border border-slate-300">অপেক্ষমাণ ({status})</span>;
    }
  };

  return (
    <div className="space-y-6 pb-20 max-w-7xl mx-auto">
      {/* 1. Header Profile Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl border border-slate-800 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-5">
            <div className="relative group">
              <img
                src={avatar}
                alt={name}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl object-cover border-4 border-indigo-400/40 shadow-2xl"
              />
              <button
                type="button"
                onClick={() => setIsAvatarPickerOpen(true)}
                className="absolute -bottom-1.5 -right-1.5 p-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg transition active:scale-95 cursor-pointer"
                title="প্রোফাইল ছবি পরিবর্তন করুন"
              >
                <Camera className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" /> ভেরিফাইড ইউজার
                </span>
                <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                  <Award className="w-3 h-3" /> গোল্ড ভিআইপি মেম্বার
                </span>
                <span className="text-[11px] text-slate-300 font-medium">রোল: <strong className="text-white">{activeRole}</strong></span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">{name}</h1>

              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300">
                <span className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-indigo-400" /> {email}
                </span>
                {phone && (
                  <span className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-emerald-400" /> {phone}
                  </span>
                )}
                <span className="flex items-center gap-1.5 text-slate-400">
                  <Calendar className="w-3.5 h-3.5" /> সদস্য: {currentUser.createdAt || "২০২৪ থেকে"}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Metrics Header Cards */}
          <div className="grid grid-cols-3 gap-3 shrink-0">
            <div className="bg-white/10 backdrop-blur-md p-3 sm:p-4 rounded-2xl border border-white/10 text-center">
              <span className="text-[10px] text-slate-300 uppercase font-black block">মোট অর্ডার</span>
              <span className="text-lg sm:text-xl font-black text-white font-mono">{userOrders.length}টি</span>
            </div>
            <div className="bg-white/10 backdrop-blur-md p-3 sm:p-4 rounded-2xl border border-white/10 text-center">
              <span className="text-[10px] text-amber-300 uppercase font-black block">রিওয়ার্ড পয়েন্ট</span>
              <span className="text-lg sm:text-xl font-black text-amber-300 font-mono">{rewardPoints} pts</span>
            </div>
            <div className="bg-white/10 backdrop-blur-md p-3 sm:p-4 rounded-2xl border border-white/10 text-center">
              <span className="text-[10px] text-emerald-300 uppercase font-black block">ওয়ালেট ক্যাশ</span>
              <span className="text-lg sm:text-xl font-black text-emerald-300 font-mono">
                {settings.currencySymbol}{walletBalance.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Interactive Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar bg-white p-2 rounded-2xl border border-slate-200 shadow-2xs">
        <button
          type="button"
          onClick={() => setActiveTab("overview")}
          className={`px-4 py-2.5 rounded-xl text-xs font-black transition flex items-center gap-2 cursor-pointer shrink-0 ${
            activeTab === "overview"
              ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>ওভারভিউ ড্যাশবোর্ড</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("orders")}
          className={`px-4 py-2.5 rounded-xl text-xs font-black transition flex items-center gap-2 cursor-pointer shrink-0 ${
            activeTab === "orders"
              ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>আমার অর্ডারসমূহ ({userOrders.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("profile")}
          className={`px-4 py-2.5 rounded-xl text-xs font-black transition flex items-center gap-2 cursor-pointer shrink-0 ${
            activeTab === "profile"
              ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          <User className="w-4 h-4" />
          <span>ব্যক্তিগত তথ্য ও ছবি</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("addresses")}
          className={`px-4 py-2.5 rounded-xl text-xs font-black transition flex items-center gap-2 cursor-pointer shrink-0 ${
            activeTab === "addresses"
              ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          <MapPin className="w-4 h-4" />
          <span>ঠিকানা বই ({savedAddresses.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("security")}
          className={`px-4 py-2.5 rounded-xl text-xs font-black transition flex items-center gap-2 cursor-pointer shrink-0 ${
            activeTab === "security"
              ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          <Lock className="w-4 h-4" />
          <span>নিরাপত্তা ও ২এফএ</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("notifications")}
          className={`px-4 py-2.5 rounded-xl text-xs font-black transition flex items-center gap-2 cursor-pointer shrink-0 ${
            activeTab === "notifications"
              ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          <Bell className="w-4 h-4" />
          <span>প্রেফারেন্স ও সেটিংস</span>
        </button>
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Quick Snapshot Banners */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-2">
              <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
                <span>পছন্দের তালিকা</span>
                <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
              </div>
              <p className="text-2xl font-black text-slate-900 font-mono">{wishlist.length}টি পণ্য</p>
              <button
                type="button"
                onClick={() => setStoreView("wishlist")}
                className="text-xs font-extrabold text-indigo-600 hover:underline flex items-center gap-1 cursor-pointer pt-1"
              >
                <span>পছন্দসমূহ দেখুন</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-2">
              <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
                <span>কার্ট পণ্য</span>
                <ShoppingBag className="w-4 h-4 text-indigo-500" />
              </div>
              <p className="text-2xl font-black text-slate-900 font-mono">{cart.length}টি পণ্য</p>
              <button
                type="button"
                onClick={() => setStoreView("checkout")}
                className="text-xs font-extrabold text-indigo-600 hover:underline flex items-center gap-1 cursor-pointer pt-1"
              >
                <span>চেকআউট করুন</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-2">
              <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
                <span>লয়ালটি টিয়ার</span>
                <Award className="w-4 h-4 text-amber-500" />
              </div>
              <p className="text-2xl font-black text-amber-600">VIP গোল্ড</p>
              <p className="text-[11px] text-slate-500 font-medium">প্রতি অর্ডারে ফ্রি গিফট ও প্রায়োরিটি শিপিং</p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-2">
              <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
                <span>ডিফল্ট ঠিকানা</span>
                <MapPin className="w-4 h-4 text-emerald-500" />
              </div>
              <p className="text-xs font-black text-slate-800 truncate">{savedAddresses[0]?.title || "ঢাকা"}</p>
              <p className="text-[11px] text-slate-500 truncate">{savedAddresses[0]?.street || address}</p>
            </div>
          </div>

          {/* Latest Order Live Progress */}
          {userOrders.length > 0 && (
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-2xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                    <Truck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900">সাম্প্রতিক অর্ডারের লাইভ ট্র্যাকিং</h3>
                    <p className="text-xs text-slate-500">
                      অর্ডার নম্বর: <strong className="text-slate-800">{userOrders[0].orderNumber || userOrders[0].id}</strong> •{" "}
                      {userOrders[0].createdAt}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {getStatusBadge(userOrders[0].orderStatus)}
                  <button
                    type="button"
                    onClick={() => setSelectedOrderDetails(userOrders[0])}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition cursor-pointer"
                  >
                    চালান দেখুন
                  </button>
                </div>
              </div>

              {/* Order Tracking Stepper */}
              <div className="py-2">
                <div className="grid grid-cols-4 gap-2 text-center relative">
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                      ✓
                    </div>
                    <span className="text-[11px] font-bold text-slate-800">অর্ডার কনফার্মড</span>
                  </div>

                  <div className="flex flex-col items-center gap-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shadow-sm ${
                      userOrders[0].orderStatus !== "Pending" ? "bg-emerald-500 text-white" : "bg-amber-500 text-white animate-pulse"
                    }`}>
                      {userOrders[0].orderStatus !== "Pending" ? "✓" : "2"}
                    </div>
                    <span className="text-[11px] font-bold text-slate-800">প্রসেসিং ও প্যাকেজিং</span>
                  </div>

                  <div className="flex flex-col items-center gap-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shadow-sm ${
                      userOrders[0].orderStatus === "Shipped" || userOrders[0].orderStatus === "Delivered" ? "bg-emerald-500 text-white" : "bg-slate-200 text-slate-500"
                    }`}>
                      {userOrders[0].orderStatus === "Delivered" ? "✓" : "3"}
                    </div>
                    <span className="text-[11px] font-bold text-slate-800">কুরিয়ারে হস্তান্তর</span>
                  </div>

                  <div className="flex flex-col items-center gap-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shadow-sm ${
                      userOrders[0].orderStatus === "Delivered" ? "bg-emerald-500 text-white" : "bg-slate-200 text-slate-500"
                    }`}>
                      {userOrders[0].orderStatus === "Delivered" ? "✓" : "4"}
                    </div>
                    <span className="text-[11px] font-bold text-slate-800">সফল ডেলিভারি</span>
                  </div>
                </div>
              </div>

              {/* Items in latest order */}
              <div className="bg-slate-50 p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
                <div className="flex items-center gap-3">
                  <Package className="w-5 h-5 text-indigo-600 shrink-0" />
                  <div>
                    <span className="font-bold text-slate-800 block">
                      {userOrders[0].items?.length || 1}টি আইটেম • সর্বমোট:{" "}
                      <span className="font-mono text-indigo-600 font-black">
                        {settings.currencySymbol}{(userOrders[0].total || 0).toLocaleString()}
                      </span>
                    </span>
                    <span className="text-[11px] text-slate-500">ক্যাশ অন ডেলিভারি / Steadfast কুরিয়ার</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveTab("orders")}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs transition cursor-pointer flex items-center gap-1.5"
                >
                  <span>সকল অর্ডার বিস্তারিত দেখুন</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* Quick Help & Shortcuts */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div
              onClick={() => setActiveTab("profile")}
              className="p-5 bg-gradient-to-br from-indigo-50 to-white rounded-2xl border border-indigo-100 hover:border-indigo-300 transition cursor-pointer space-y-2 group"
            >
              <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                <User className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-black text-slate-900 group-hover:text-indigo-600 transition">প্রোফাইল তথ্য সম্পাদন</h4>
              <p className="text-xs text-slate-600">নাম, ফোন, ইমেইল ও প্রোফাইল ছবি আপডেট করুন।</p>
            </div>

            <div
              onClick={() => setActiveTab("addresses")}
              className="p-5 bg-gradient-to-br from-emerald-50 to-white rounded-2xl border border-emerald-100 hover:border-emerald-300 transition cursor-pointer space-y-2 group"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                <MapPin className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-black text-slate-900 group-hover:text-emerald-600 transition">ঠিকানা বই ম্যানেজ</h4>
              <p className="text-xs text-slate-600">বাসা ও অফিসের একাধিক ডেলিভারি ঠিকানা সংরক্ষণ করুন।</p>
            </div>

            <div
              onClick={() => setActiveTab("security")}
              className="p-5 bg-gradient-to-br from-amber-50 to-white rounded-2xl border border-amber-100 hover:border-amber-300 transition cursor-pointer space-y-2 group"
            >
              <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center shadow-xs">
                <Lock className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-black text-slate-900 group-hover:text-amber-600 transition">নিরাপত্তা ও ২এফএ</h4>
              <p className="text-xs text-slate-600">পাসওয়ার্ড পরিবর্তন ও টু-ফ্যাক্টর অথেনটিকেশন নিয়ন্ত্রণ করুন।</p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: MY ORDERS */}
      {activeTab === "orders" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200">
            <div>
              <h3 className="text-sm font-black text-slate-900">আমার সকল অর্ডার ({filteredOrders.length})</h3>
              <p className="text-xs text-slate-500">আপনার অতীত ও চলমান অর্ডারের বিস্তারিত তথ্য ও ট্র্যাকিং</p>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
              <button
                type="button"
                onClick={() => setOrderFilter("all")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  orderFilter === "all" ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                সকল ({userOrders.length})
              </button>
              <button
                type="button"
                onClick={() => setOrderFilter("processing")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  orderFilter === "processing" ? "bg-amber-600 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                রানিং / প্রসেসিং
              </button>
              <button
                type="button"
                onClick={() => setOrderFilter("delivered")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  orderFilter === "delivered" ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                ডেলিভার্ড
              </button>
              <button
                type="button"
                onClick={() => setOrderFilter("cancelled")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  orderFilter === "cancelled" ? "bg-rose-600 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                বাতিল
              </button>
            </div>
          </div>

          {filteredOrders.length === 0 ? (
            <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <ShoppingBag className="w-7 h-7" />
              </div>
              <h4 className="text-base font-black text-slate-900">কোনো অর্ডার পাওয়া যায়নি</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                এই ক্যাটাগরিতে আপনার কোনো অর্ডার নেই। এখনই আমাদের স্টোরফ্রন্ট থেকে কেনাকাটা শুরু করুন!
              </p>
              <button
                type="button"
                onClick={() => setStoreView("products")}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition cursor-pointer"
              >
                পণ্য ক্যাটালগ ব্রাউজ করুন
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredOrders.map((ord) => (
                <div
                  key={ord.id}
                  className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs hover:border-indigo-300 transition-colors space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 text-indigo-600 flex items-center justify-center font-black text-xs">
                        #{ord.orderNumber?.slice(-4) || ord.id.slice(-4)}
                      </div>
                      <div>
                        <h4 className="text-xs font-black text-slate-900">
                          অর্ডার: <span className="font-mono">{ord.orderNumber || ord.id}</span>
                        </h4>
                        <p className="text-[11px] text-slate-500">তারিখ: {ord.createdAt}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {getStatusBadge(ord.orderStatus)}
                      <span className="text-xs font-black text-indigo-600 font-mono">
                        {settings.currencySymbol}{(ord.total || 0).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Items Preview */}
                  <div className="space-y-2">
                    {ord.items?.map((item, i) => (
                      <div key={i} className="flex items-center justify-between text-xs py-1">
                        <div className="flex items-center gap-2.5 min-w-0">
                          {item.image && (
                            <img src={item.image} alt={item.name} className="w-9 h-9 rounded-lg object-contain bg-slate-50 shrink-0" />
                          )}
                          <div className="truncate">
                            <span className="font-bold text-slate-800 truncate block">{item.name}</span>
                            <span className="text-[10px] text-slate-500">পরিমাণ: {item.quantity}টি • একক মূল্য: {settings.currencySymbol}{item.price}</span>
                          </div>
                        </div>
                        <span className="font-mono font-bold text-slate-900 shrink-0">
                          {settings.currencySymbol}{(item.price * item.quantity).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Actions Bar */}
                  <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div className="text-[11px] text-slate-500">
                      পেমেন্ট: <strong className="text-slate-800">{ord.paymentMethod}</strong> ({ord.paymentStatus})
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedOrderDetails(ord)}
                        className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold transition cursor-pointer flex items-center gap-1"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>চালান ও বিস্তারিত</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          if (ord.items?.[0]) {
                            addToast("অর্ডার আইটেম কার্টে যুক্ত করা হয়েছে!", "success");
                          }
                        }}
                        className="px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold transition cursor-pointer flex items-center gap-1 border border-indigo-200"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>পুনরায় অর্ডার</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: PERSONAL INFO & AVATAR */}
      {activeTab === "profile" && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-2xs space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="text-base font-black text-slate-900">ব্যক্তিগত প্রোফাইল ও তথ্য সম্পাদন</h3>
            <p className="text-xs text-slate-500">আপনার ব্যক্তিগত প্রোফাইল তথ্য পরিবর্তন ও আপডেট করুন</p>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-5 text-xs">
            {/* Avatar Row */}
            <div className="flex flex-col sm:flex-row items-center gap-5 p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <img
                src={avatar}
                alt={name}
                className="w-16 h-16 rounded-2xl object-cover border-2 border-indigo-500 shadow-md shrink-0"
              />
              <div className="flex-1 space-y-1 text-center sm:text-left">
                <span className="font-bold text-slate-900 block">প্রোফাইল ছবি পরিবর্তন</span>
                <p className="text-[11px] text-slate-500">প্রিসেট অবতার থেকে নির্বাচন করুন অথবা যেকোনো কাস্টম ইমেজ লিংক ব্যবহার করুন।</p>
              </div>
              <button
                type="button"
                onClick={() => setIsAvatarPickerOpen(true)}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition cursor-pointer shrink-0"
              >
                ছবি পরিবর্তন করুন
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-bold text-slate-700 block mb-1">পূর্ণ নাম (Full Name)</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-slate-900 text-xs"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">ইমেইল ঠিকানা (Email Address)</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-slate-900 text-xs"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">মোবাইল ফোন নম্বর (Phone Number)</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-slate-900 text-xs"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">লিঙ্গ (Gender)</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value as "male" | "female" | "other")}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-slate-900 text-xs cursor-pointer"
                >
                  <option value="male">পুরুষ (Male)</option>
                  <option value="female">মহিলা (Female)</option>
                  <option value="other">অন্যান্য (Other)</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">জন্ম তারিখ (Date of Birth)</label>
                <input
                  type="date"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-slate-900 text-xs"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">বর্তমান ঠিকানা (Primary Address)</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-slate-900 text-xs"
                  required
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
              <span className="text-[11px] text-slate-500">পরিবর্তন করার পর অবশ্যই সেভ করুন।</span>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs transition shadow-md cursor-pointer"
              >
                প্রোফাইল সেভ করুন
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 4: ADDRESS BOOK */}
      {activeTab === "addresses" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200">
            <div>
              <h3 className="text-sm font-black text-slate-900">সংরক্ষিত ডেলিভারি ঠিকানাসমূহ</h3>
              <p className="text-xs text-slate-500">চেকআউটের সময় দ্রুত সিলেক্ট করার জন্য ঠিকানা যোগ করুন</p>
            </div>

            <button
              type="button"
              onClick={() => setIsAddressModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition cursor-pointer flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>নতুন ঠিকানা যোগ করুন</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {savedAddresses.map((addr) => (
              <div
                key={addr.id}
                className={`bg-white rounded-2xl p-5 border transition-all space-y-3 relative ${
                  addr.isDefault ? "border-indigo-500 shadow-md bg-indigo-50/20" : "border-slate-200 shadow-2xs"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-800">
                    {addr.title}
                  </span>

                  {addr.isDefault && (
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-indigo-100 text-indigo-700 border border-indigo-200 flex items-center gap-1">
                      <Check className="w-3 h-3" /> ডিফল্ট ডেলিভারি
                    </span>
                  )}
                </div>

                <div className="space-y-1 text-xs">
                  <p className="font-bold text-slate-900">{addr.recipientName}</p>
                  <p className="text-slate-600 font-medium flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400" /> {addr.phone}
                  </p>
                  <p className="text-slate-600 font-medium flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" /> {addr.street}, {addr.city}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-bold">
                  {!addr.isDefault ? (
                    <button
                      type="button"
                      onClick={() => handleSetDefaultAddress(addr.id)}
                      className="text-indigo-600 hover:underline cursor-pointer"
                    >
                      ডিফল্ট হিসেবে সেট করুন
                    </button>
                  ) : (
                    <span className="text-emerald-600 font-bold text-[11px]">প্রধান ডেলিভারি ঠিকানা</span>
                  )}

                  <button
                    type="button"
                    onClick={() => handleDeleteAddress(addr.id)}
                    className="text-rose-600 hover:text-rose-700 flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>মুছুন</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: SECURITY & 2FA */}
      {activeTab === "security" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Change Password Card */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
            <div className="border-b border-slate-100 pb-3 flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-indigo-600" />
              <div>
                <h3 className="text-sm font-black text-slate-900">পাসওয়ার্ড পরিবর্তন (Change Password)</h3>
                <p className="text-[11px] text-slate-500">আপনার অ্যাকাউন্টের নিরাপত্তা নিশ্চিত করতে শক্তিশালী পাসওয়ার্ড দিন</p>
              </div>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-4 text-xs">
              <PasswordInput
                label="বর্তমান পাসওয়ার্ড (Current Password)"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                required
              />

              <PasswordInput
                label="নতুন পাসওয়ার্ড (New Password)"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="কমপক্ষে ৮ অক্ষর"
                required
              />

              {/* Password Strength Meter */}
              {newPassword && (
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] font-bold">
                    <span className="text-slate-500">পাসওয়ার্ড শক্তি:</span>
                    <span className={passwordStrength > 70 ? "text-emerald-600" : passwordStrength > 40 ? "text-amber-600" : "text-rose-600"}>
                      {passwordStrength > 70 ? "শক্তিশালী (Strong)" : passwordStrength > 40 ? "মাঝারি (Medium)" : "দুর্বল (Weak)"}
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${
                        passwordStrength > 70 ? "bg-emerald-500" : passwordStrength > 40 ? "bg-amber-500" : "bg-rose-500"
                      }`}
                      style={{ width: `${passwordStrength}%` }}
                    />
                  </div>
                </div>
              )}

              <PasswordInput
                label="নতুন পাসওয়ার্ড নিশ্চিত করুন (Confirm Password)"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                placeholder="••••••••"
                required
              />

              <button
                type="submit"
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl transition shadow-md cursor-pointer"
              >
                পাসওয়ার্ড আপডেট করুন
              </button>
            </form>
          </div>

          {/* 2FA & Active Sessions */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
              <div className="border-b border-slate-100 pb-3 flex items-center gap-2">
                <Shield className="w-5 h-5 text-emerald-600" />
                <div>
                  <h3 className="text-sm font-black text-slate-900">টু-ফ্যাক্টর অথেনটিকেশন (2FA Security)</h3>
                  <p className="text-[11px] text-slate-500">লগইনের সময় অতিরিক্ত এসএমএস বা ওটিপি ভেরিফিকেশন</p>
                </div>
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="space-y-0.5">
                  <span className="font-bold text-xs text-slate-800 block">এসএমএস ২এফএ নিরাপত্তা</span>
                  <span className="text-[11px] text-slate-500">লগইন করার সময় নিবন্ধিত নম্বরে ওটিপি কোড পাঠানো হবে</span>
                </div>
                <input
                  type="checkbox"
                  checked={twoFactor}
                  onChange={(e) => {
                    setTwoFactor(e.target.checked);
                    addToast(`2FA সিকিউরিটি ${e.target.checked ? "সক্রিয়" : "নিষ্ক্রিয়"} করা হয়েছে`, "info");
                  }}
                  className="w-5 h-5 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                />
              </div>
            </div>

            {/* Active Sessions */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-3">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-700">অ্যাক্টিভ লগইন ডিভাইসসমূহ</h4>
              <div className="space-y-2 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Smartphone className="w-4 h-4 text-indigo-600" />
                    <div>
                      <p className="font-bold text-slate-900">বর্তমান ব্রাউজার (Chrome on Web)</p>
                      <p className="text-[10px] text-emerald-600 font-bold">এখন সক্রিয় • ঢাকা, বাংলাদেশ</p>
                    </div>
                  </div>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-black">সক্রিয়</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Smartphone className="w-4 h-4 text-slate-500" />
                    <div>
                      <p className="font-bold text-slate-900">অ্যান্ড্রয়েড মোবাইল অ্যাপ (v2.5.0)</p>
                      <p className="text-[10px] text-slate-500 font-medium">সর্বশেষ সক্রিয়: ২ ঘণ্টা পূর্বে</p>
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-500 font-medium">সংযুক্ত</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: NOTIFICATIONS & PREFERENCES */}
      {activeTab === "notifications" && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-2xs space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="text-base font-black text-slate-900">নোটিফিকেশন ও মেসেজিং প্রেফারেন্স</h3>
            <p className="text-xs text-slate-500">আপনার অর্ডার আপডেট এবং ডিসকাউন্ট অফারের নোটিফিকেশন নিয়ন্ত্রণ করুন</p>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="space-y-0.5">
                <span className="font-bold text-slate-900 block">এসএমএস অর্ডার ট্র্যাকিং আপডেট</span>
                <span className="text-[11px] text-slate-500">অর্ডার কনফার্ম এবং কুরিয়ারে হস্তান্তরের সময় রিয়েল-টাইম এসএমএস</span>
              </div>
              <input
                type="checkbox"
                checked={notifications.smsOrderAlerts}
                onChange={(e) => {
                  setNotifications({ ...notifications, smsOrderAlerts: e.target.checked });
                  addToast("প্রেফারেন্স সেভ করা হয়েছে", "info");
                }}
                className="w-5 h-5 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="space-y-0.5">
                <span className="font-bold text-slate-900 block">হোয়াটসঅ্যাপ (WhatsApp) ডেলিভারি নোটিশ</span>
                <span className="text-[11px] text-slate-500">ডেলিভারি ম্যান আসার পূর্বে সরাসরি হোয়াটসঅ্যাপে বার্তা</span>
              </div>
              <input
                type="checkbox"
                checked={notifications.whatsappAlerts}
                onChange={(e) => {
                  setNotifications({ ...notifications, whatsappAlerts: e.target.checked });
                  addToast("প্রেফারেন্স সেভ করা হয়েছে", "info");
                }}
                className="w-5 h-5 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="space-y-0.5">
                <span className="font-bold text-slate-900 block">স্পেশাল ডিসকাউন্ট ও ভাউচার ইমেইল</span>
                <span className="text-[11px] text-slate-500">ফ্ল্যাশ ডিল ও উৎসবের বিশেষ কুপন কোড ইমেইলে পাওয়া</span>
              </div>
              <input
                type="checkbox"
                checked={notifications.promoEmails}
                onChange={(e) => {
                  setNotifications({ ...notifications, promoEmails: e.target.checked });
                  addToast("প্রেফারেন্স সেভ করা হয়েছে", "info");
                }}
                className="w-5 h-5 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
              />
            </div>
          </div>
        </div>
      )}

      {/* AVATAR PICKER MODAL */}
      {isAvatarPickerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-black text-slate-900">প্রোফাইল ছবি নির্বাচন করুন</h3>
              <button
                type="button"
                onClick={() => setIsAvatarPickerOpen(false)}
                className="p-1 rounded-full hover:bg-slate-100 text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <span className="text-xs font-bold text-slate-700 block">জনপ্রিয় প্রিসেট অবতার:</span>
              <div className="grid grid-cols-3 gap-3">
                {AVATAR_PRESETS.map((avUrl, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setAvatar(avUrl);
                      setIsAvatarPickerOpen(false);
                      addToast("প্রোফাইল ছবি নির্বাচিত হয়েছে!", "info");
                    }}
                    className={`rounded-2xl overflow-hidden aspect-square border-2 transition hover:scale-105 cursor-pointer ${
                      avatar === avUrl ? "border-indigo-600 shadow-md ring-2 ring-indigo-400" : "border-slate-200"
                    }`}
                  >
                    <img src={avUrl} alt="Preset avatar" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>

              <div className="pt-2 border-t border-slate-100 space-y-2 text-xs">
                <label className="font-bold text-slate-700 block">অথবা কাস্টম ইমেজ লিংক (URL):</label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    placeholder="https://example.com/avatar.jpg"
                    value={customAvatarUrl}
                    onChange={(e) => setCustomAvatarUrl(e.target.value)}
                    className="flex-1 bg-slate-50 border border-slate-300 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (customAvatarUrl) {
                        setAvatar(customAvatarUrl);
                        setIsAvatarPickerOpen(false);
                        addToast("কাস্টম ছবি যুক্ত হয়েছে!", "success");
                      }
                    }}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl cursor-pointer"
                  >
                    ব্যবহার করুন
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ADD ADDRESS MODAL */}
      {isAddressModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-black text-slate-900">নতুন ডেলিভারি ঠিকানা যোগ করুন</h3>
              <button
                type="button"
                onClick={() => setIsAddressModalOpen(false)}
                className="p-1 rounded-full hover:bg-slate-100 text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddAddress} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">ঠিকানার নাম (লেবেল)</label>
                <select
                  value={newAddressForm.title}
                  onChange={(e) => setNewAddressForm({ ...newAddressForm, title: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold"
                >
                  <option value="বাসা (Home)">বাসা (Home)</option>
                  <option value="অফিস (Office)">অফিস (Office)</option>
                  <option value="অন্যান্য (Other)">অন্যান্য (Other)</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">প্রাপকের নাম</label>
                <input
                  type="text"
                  value={newAddressForm.recipientName}
                  onChange={(e) => setNewAddressForm({ ...newAddressForm, recipientName: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold"
                  placeholder="নাম লিখুন"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">যোগাযোগের মোবাইল নম্বর</label>
                <input
                  type="text"
                  value={newAddressForm.phone}
                  onChange={(e) => setNewAddressForm({ ...newAddressForm, phone: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold"
                  placeholder="017XXXXXXXX"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">শহর ও জেলা</label>
                <select
                  value={newAddressForm.city}
                  onChange={(e) => setNewAddressForm({ ...newAddressForm, city: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold"
                >
                  <option value="ঢাকা (Dhaka)">ঢাকা (Dhaka)</option>
                  <option value="চট্টগ্রাম (Chittagong)">চট্টগ্রাম (Chittagong)</option>
                  <option value="সিলেট (Sylhet)">সিলেট (Sylhet)</option>
                  <option value="রাজশাহী (Rajshahi)">রাজশাহী (Rajshahi)</option>
                  <option value="খুলনা (Khulna)">খুলনা (Khulna)</option>
                  <option value="বরিশাল (Barisal)">বরিশাল (Barisal)</option>
                  <option value="রংপুর (Rangpur)">রংপুর (Rangpur)</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">সম্পূর্ণ ঠিকানা ও ল্যান্ডমার্ক</label>
                <textarea
                  value={newAddressForm.street}
                  onChange={(e) => setNewAddressForm({ ...newAddressForm, street: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold h-20"
                  placeholder="বাড়ি/ফ্ল্যাট নম্বর, রোড, এলাকা..."
                  required
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="defaultAddressCheckbox"
                  checked={newAddressForm.isDefault}
                  onChange={(e) => setNewAddressForm({ ...newAddressForm, isDefault: e.target.checked })}
                  className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="defaultAddressCheckbox" className="font-bold text-slate-800 cursor-pointer">
                  এটি প্রধান (ডিফল্ট) ডেলিভারি ঠিকানা হিসেবে সেট করুন
                </label>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddressModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
                >
                  ঠিকানা সেভ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ORDER DETAILS & RECEIPT MODAL */}
      {selectedOrderDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl w-full max-w-lg p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-black text-slate-900">
                  অর্ডার ইনভয়েস: #{selectedOrderDetails.orderNumber || selectedOrderDetails.id}
                </h3>
                <p className="text-[11px] text-slate-500">{selectedOrderDetails.createdAt}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrderDetails(null)}
                className="p-1 rounded-full hover:bg-slate-100 text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-slate-50 p-3.5 rounded-2xl flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">বর্তমান স্ট্যাটাস</span>
                  {getStatusBadge(selectedOrderDetails.orderStatus)}
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">পেমেন্ট মেথড</span>
                  <span className="font-extrabold text-slate-900">{selectedOrderDetails.paymentMethod}</span>
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-2 border-t border-slate-100 pt-3">
                <span className="font-black text-slate-800 block">অর্ডারকৃত আইটেমসমূহ:</span>
                {selectedOrderDetails.items?.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between py-1 border-b border-slate-50">
                    <span className="text-slate-800 font-medium">
                      {item.name} <span className="text-slate-400 font-bold">x{item.quantity}</span>
                    </span>
                    <span className="font-mono font-bold text-slate-900">
                      {settings.currencySymbol}{(item.price * item.quantity).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>

              {/* Total Calculation */}
              <div className="space-y-1.5 pt-2 border-t border-slate-200 font-bold">
                <div className="flex justify-between text-slate-600">
                  <span>সাবটোটাল</span>
                  <span className="font-mono">{settings.currencySymbol}{(selectedOrderDetails.subtotal || selectedOrderDetails.total).toLocaleString()}</span>
                </div>
                {selectedOrderDetails.discount > 0 && (
                  <div className="flex justify-between text-rose-600">
                    <span>কুপন ডিসকাউন্ট</span>
                    <span className="font-mono">-{settings.currencySymbol}{selectedOrderDetails.discount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-600">
                  <span>ডেলিভারি চার্জ</span>
                  <span className="font-mono">{settings.currencySymbol}{(selectedOrderDetails.shippingCharge || 60).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm font-black text-indigo-600 pt-1 border-t border-slate-100">
                  <span>সর্বমোট প্রদেয়</span>
                  <span className="font-mono">{settings.currencySymbol}{(selectedOrderDetails.total || 0).toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setSelectedOrderDetails(null)}
                className="px-5 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs"
              >
                বন্ধ করুন
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
