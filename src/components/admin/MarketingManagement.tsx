import React, { useState, useMemo, useEffect } from "react";
import { useStore } from "../../context/StoreContext";
import { Advertisement, Coupon } from "../../types";
import {
  exportToCSV,
  exportToExcel,
  parseExcelOrCSVFile,
} from "../../utils/exportUtils";
import {
  Megaphone,
  Plus,
  Search,
  Filter,
  Download,
  Upload,
  FileSpreadsheet,
  Trash2,
  Edit,
  Eye,
  CheckCircle2,
  XCircle,
  BarChart3,
  Video,
  Image as ImageIcon,
  Flame,
  Clock,
  Sparkles,
  ArrowUpDown,
  Tag,
  Copy,
  Layers,
  X,
  Play,
  TrendingUp,
  Send,
  MessageSquare,
  Smartphone,
  Share2,
  QrCode,
  RefreshCw,
  ExternalLink,
  Zap,
  Gift,
  ShoppingBag,
  Check,
  AlertCircle,
  Percent,
  Users,
  Globe,
  ArrowRight,
  Laptop,
  MousePointer,
  HelpCircle,
  Volume2,
  VolumeX,
} from "lucide-react";

// Curated high quality presets for Bangladesh e-commerce
const CURATED_BANNER_PRESETS = [
  {
    name: "Mega Electronics & Gadgets",
    category: "Gadgets",
    url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1200&q=80",
    badge: "FLASH SALE",
    title: "স্মার্ট গ্যাজেটস মেগা অফার - ৫০% পর্যন্ত ছাড়!",
    desc: "প্রিমিয়াম ব্র্যান্ডের অরিজিনাল হেডফোন, স্মার্টওয়াচ এবং স্পিকার কিনুন বিশেষ ছাড়ে।",
  },
  {
    name: "Eid Festival & Festive Wear",
    category: "Fashion",
    url: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1200&q=80",
    badge: "FESTIVAL",
    title: "ঈদ এক্সক্লুসিভ কালেকশন ২০২৬",
    desc: "নতুন ডিজাইনের প্রিমিয়াম পাঞ্জাবি, শাড়ি ও ট্রেন্ডি ড্রেসে থাকছে আকর্ষণীয় ক্যাশব্যাক!",
  },
  {
    name: "Cosmetics & Skincare Glow",
    category: "Beauty",
    url: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=1200&q=80",
    badge: "HOT",
    title: "১০০% অথেনটিক স্কিনকেয়ার ও মেকআপ ফেস্ট",
    desc: "কোরিয়ান এবং ইন্টারন্যাশনাল টপ বিউটি ব্র্যান্ডের প্রোডাক্টে ফ্রি গিফট ভাউচার।",
  },
  {
    name: "Weekend Super Saver",
    category: "Deals",
    url: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1200&q=80",
    badge: "LIMITED TIME",
    title: "উইকেন্ড সুপার ডিলস - ফ্রি হোম ডেলিভারি",
    desc: "যেকোনো ৩টি বা তার বেশি পণ্য কিনলেই পুরো বাংলাদেশে ফ্রি ক্যাশ অন ডেলিভারি!",
  },
  {
    name: "Smart Watch & Fitness Tech",
    category: "Gadgets",
    url: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1200&q=80",
    badge: "NEW",
    title: "লেটেস্ট অ্যামোলেড স্মার্টওয়াচ কালেকশন",
    desc: "অফিসিয়াল ১ বছরের ওয়ারেন্টি ও ওয়াটারপ্রুফ গ্যাজেটে স্পেশাল প্রমোশনাল ছাড়।",
  },
];

// Pre-built Bengali & English Marketing Hook Templates
const SMART_COPY_TEMPLATES = [
  {
    category: "Bangla Flash Sale Hooks",
    items: [
      {
        title: "সীমিত সময়ের ধামাকা অফার",
        text: "🔥 সীমিত সময়ের জন্য সকল জনপ্রিয় গ্যাজেট ও লাইফস্টাইল প্রোডাক্টে সর্বোচ্চ ৫০% পর্যন্ত ছাড়! স্টক ফুরিয়ে যাওয়ার আগেই এখনই অর্ডার করুন।",
      },
      {
        title: "ঈদ উৎসবের স্পেশাল ছাড়",
        text: "🌙 ঈদ মোবারক! উৎসবের আমেজে পরিবারের সবার জন্য শপিং করুন বিশেষ ছাড়ে। কুপন কোড EID2026 ব্যবহারে অতিরিক্ত ২০% ক্যাশব্যাক!",
      },
      {
        title: "ফ্রি হোম ডেলিভারি ক্যাম্পেইন",
        text: "🚚 দেশজুড়ে ক্যাশ অন ডেলিভারি এখন সম্পূর্ণ ফ্রি! যেকোনো ১০০০ টাকার অর্ডারে হোম ডেলিভারি চার্জ একদম ফ্রি। কোড: FREEDEL",
      },
      {
        title: "বাই ওয়ান গেট ওয়ান (১ কিনলে ১ ফ্রি)",
        text: "🎁 ধামাকা ডাবল অফার! পছন্দের ক্যাটাগরির পণ্য কিনলেই সাথে পাচ্ছেন আকর্ষণীয় সারপ্রাইজ গিফট একদম ফ্রি!",
      },
    ],
  },
  {
    category: "Social Media & Facebook Ad Captions",
    items: [
      {
        title: "অরিজিনাল প্রোডাক্ট গ্যারান্টি",
        text: "✨ ফেক প্রোডাক্ট নিয়ে চিন্তিত? আমরা দিচ্ছি ১০০% অরিজিনাল ব্র্যান্ডের নিশ্চয়তা এবং দ্রুততম ডেলিভারি সার্ভিস। চেক করে দেখে নেওয়ার সুবিধা!",
      },
      {
        title: "উইকেন্ড ক্রেজি ডিলস",
        text: "⚡ এই সপ্তাহের সেরা ডিল এখন লাইভ! অবিশ্বাস্য মূল্যে সংগ্রহ করুন আপনার পছন্দের পণ্য। অফারটি চলবে রবিবার রাত ১২টা পর্যন্ত।",
      },
      {
        title: "কার্ট রিকভারি পুশ",
        text: "🛒 আপনার কার্টে থাকা পণ্যটির স্টক দ্রুত শেষ হয়ে যাচ্ছে! এখনই অর্ডার কনফার্ম করুন আর বুঝে নিন স্পেশাল ডিসকাউন্ট।",
      },
    ],
  },
  {
    category: "SMS & WhatsApp Direct Push",
    items: [
      {
        title: "ভিআইপি কাস্টমার অফার",
        text: "প্রিয় গ্রাহক, আপনার জন্য বিশেষ গিফট ভাউচার! কোড VIP500 ব্যবহারে ৫০০ টাকা ইনস্ট্যান্ট ছাড়। মেয়াদ আজ রাত পর্যন্ত: smartshop.bd",
      },
      {
        title: "নতুন স্টক এলার্ট",
        text: "সবচেয়ে বেশি কাঙ্ক্ষিত নতুন কালেকশন এখন স্টকে এসেছে! দ্রুত ভিজিট করে আপনার সাইজটি বুক করুন: smartshop.bd/new",
      },
      {
        title: "অর্ডার আপডেট ও রিভিউ গিফট",
        text: "আপনার অর্ডারের প্রোডাক্টটি পেয়েছেন? রিভিউ দিলেই পরবর্তী অর্ডারে থাকছে নিশ্চিত ১০০ টাকা ক্যাশব্যাক!",
      },
    ],
  },
];

interface BroadcastHistoryItem {
  id: string;
  channel: "SMS" | "WhatsApp";
  audience: string;
  recipientCount: number;
  message: string;
  sentAt: string;
  status: "Delivered" | "Pending" | "Failed";
}

export const MarketingManagement: React.FC = () => {
  const {
    advertisements,
    addAdvertisement,
    updateAdvertisement,
    deleteAdvertisement,
    coupons,
    addCoupon,
    customers,
    products,
    categories,
    settings,
    addToast,
    setAdminView,
  } = useStore();

  const [activeSubTab, setActiveSubTab] = useState<
    | "slider"
    | "popup"
    | "campaign"
    | "video"
    | "sms-whatsapp"
    | "coupons"
    | "utm-tracking"
    | "ai-copywriter"
    | "analytics"
  >("slider");

  // Filters & Search State
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | "Active" | "Inactive">("All");

  // Add / Edit Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingAd, setEditingAd] = useState<Advertisement | null>(null);

  // Form Fields
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<"slider" | "popup" | "campaign" | "video">("slider");
  const [mediaType, setMediaType] = useState<"image" | "video">("image");
  const [mediaUrl, setMediaUrl] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [offerBadge, setOfferBadge] = useState<
    "NEW" | "HOT" | "LIMITED TIME" | "FLASH SALE" | "FESTIVAL"
  >("FLASH SALE");
  const [couponCode, setCouponCode] = useState("");
  const [countdownEnd, setCountdownEnd] = useState("");
  const [buttonText, setButtonText] = useState("Shop Now");
  const [buttonLink, setButtonLink] = useState("products");
  const [priority, setPriority] = useState(1);
  const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0]);
  const [endDate, setEndDate] = useState("2026-12-31");
  const [isActive, setIsActive] = useState(true);
  const [termsConditions, setTermsConditions] = useState("");
  const [modalPreviewDevice, setModalPreviewDevice] = useState<"desktop" | "mobile">("desktop");

  // Live Ad Preview Modal
  const [previewAd, setPreviewAd] = useState<Advertisement | null>(null);

  // Excel / CSV Import Modal State
  const [showImportModal, setShowImportModal] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);

  // SMS & WhatsApp State
  const [smsChannel, setSmsChannel] = useState<"SMS" | "WhatsApp">("SMS");
  const [smsAudience, setSmsAudience] = useState<"all" | "vip" | "inactive" | "custom">("all");
  const [smsCustomNumbers, setSmsCustomNumbers] = useState("");
  const [smsMessage, setSmsMessage] = useState(
    "🔥 দারুন খবর! SmartShop-এ সকল গ্যাজেটে চলছে ৩০% মেগা ছাড়! কুপন কোড: SALE30। এখনই অর্ডার করুন: smartshop.bd"
  );
  const [isSendingBroadcast, setIsSendingBroadcast] = useState(false);
  const [broadcastHistory, setBroadcastHistory] = useState<BroadcastHistoryItem[]>([
    {
      id: "bc-1",
      channel: "SMS",
      audience: "All Registered Customers",
      recipientCount: 1420,
      message: "🔥 ঈদ স্পেশাল মেগা ডিল শুরু হয়েছে! সেরা ব্র্যান্ডের পণ্যে সর্বোচ্চ ৫০% ছাড়। কুপন: EID2026",
      sentAt: "2026-03-28 14:30",
      status: "Delivered",
    },
    {
      id: "bc-2",
      channel: "WhatsApp",
      audience: "VIP Spenders (>৳5,000)",
      recipientCount: 380,
      message: "⭐ প্রিয় VIP গ্রাহক, আপনার জন্য নতুন কালেকশনে স্পেশাল গিফট ভাউচার অপেক্ষা করছে!",
      sentAt: "2026-04-02 18:15",
      status: "Delivered",
    },
  ]);

  // UTM Link Generator State
  const [utmBaseUrl, setUtmBaseUrl] = useState("https://smartshop.bd");
  const [utmSource, setUtmSource] = useState<"facebook" | "instagram" | "tiktok" | "google" | "whatsapp" | "sms">(
    "facebook"
  );
  const [utmMedium, setUtmMedium] = useState("cpc");
  const [utmCampaign, setUtmCampaign] = useState("eid_mega_sale_2026");
  const [utmTerm, setUtmTerm] = useState("smart_gadgets");
  const [utmContent, setUtmContent] = useState("banner_hero_v1");

  const generatedUtmUrl = useMemo(() => {
    const params = new URLSearchParams();
    if (utmSource) params.set("utm_source", utmSource);
    if (utmMedium) params.set("utm_medium", utmMedium);
    if (utmCampaign) params.set("utm_campaign", utmCampaign);
    if (utmTerm) params.set("utm_term", utmTerm);
    if (utmContent) params.set("utm_content", utmContent);
    return `${utmBaseUrl}?${params.toString()}`;
  }, [utmBaseUrl, utmSource, utmMedium, utmCampaign, utmTerm, utmContent]);

  // Priority Reorder Handler
  const handleMovePriority = (adId: string, direction: "up" | "down") => {
    const sliderAds = advertisements
      .filter((a) => a.type === "slider")
      .sort((a, b) => a.priority - b.priority);
    const index = sliderAds.findIndex((a) => a.id === adId);
    if (index === -1) return;

    if (direction === "up" && index > 0) {
      const prevAd = sliderAds[index - 1];
      const curPriority = sliderAds[index].priority;
      updateAdvertisement(adId, { priority: prevAd.priority });
      updateAdvertisement(prevAd.id, { priority: curPriority });
      addToast(`Moved banner "${sliderAds[index].title}" up in priority.`, "info");
    } else if (direction === "down" && index < sliderAds.length - 1) {
      const nextAd = sliderAds[index + 1];
      const curPriority = sliderAds[index].priority;
      updateAdvertisement(adId, { priority: nextAd.priority });
      updateAdvertisement(nextAd.id, { priority: curPriority });
      addToast(`Moved banner "${sliderAds[index].title}" down in priority.`, "info");
    }
  };

  // Filtered List
  const filteredAds = useMemo(() => {
    return advertisements.filter((ad) => {
      // Subtab filter
      if (activeSubTab === "slider" && ad.type !== "slider") return false;
      if (activeSubTab === "popup" && ad.type !== "popup") return false;
      if (activeSubTab === "campaign" && ad.type !== "campaign") return false;
      if (activeSubTab === "video" && ad.mediaType !== "video") return false;

      // Search term
      if (
        searchTerm &&
        !ad.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !ad.description.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !(ad.couponCode || "").toLowerCase().includes(searchTerm.toLowerCase())
      ) {
        return false;
      }

      // Status
      if (statusFilter === "Active" && !ad.isActive) return false;
      if (statusFilter === "Inactive" && ad.isActive) return false;

      return true;
    });
  }, [advertisements, activeSubTab, searchTerm, statusFilter]);

  const openCreateModal = (forcedType?: "slider" | "popup" | "campaign" | "video") => {
    setEditingAd(null);
    setTitle("");
    setDescription("");
    setType(forcedType || (activeSubTab === "slider" || activeSubTab === "popup" || activeSubTab === "campaign" || activeSubTab === "video" ? activeSubTab : "slider"));
    setMediaType("image");
    setMediaUrl("https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1200&q=80");
    setVideoUrl("");
    setOfferBadge("FLASH SALE");
    setCouponCode("");
    setCountdownEnd("");
    setButtonText("Shop Now");
    setButtonLink("products");
    setPriority(advertisements.length + 1);
    setStartDate(new Date().toISOString().split("T")[0]);
    setEndDate("2026-12-31");
    setIsActive(true);
    setTermsConditions("");
    setShowModal(true);
  };

  const openEditModal = (ad: Advertisement) => {
    setEditingAd(ad);
    setTitle(ad.title);
    setDescription(ad.description);
    setType(ad.type);
    setMediaType(ad.mediaType);
    setMediaUrl(ad.mediaUrl);
    setVideoUrl(ad.videoUrl || "");
    setOfferBadge(ad.offerBadge || "FLASH SALE");
    setCouponCode(ad.couponCode || "");
    setCountdownEnd(ad.countdownEnd || "");
    setButtonText(ad.buttonText);
    setButtonLink(ad.buttonLink);
    setPriority(ad.priority);
    setStartDate(ad.startDate);
    setEndDate(ad.endDate);
    setIsActive(ad.isActive);
    setTermsConditions(ad.termsConditions || "");
    setShowModal(true);
  };

  const handleDuplicateAd = (ad: Advertisement) => {
    addAdvertisement({
      title: `${ad.title} (Copy)`,
      description: ad.description,
      type: ad.type,
      mediaType: ad.mediaType,
      mediaUrl: ad.mediaUrl,
      videoUrl: ad.videoUrl,
      offerBadge: ad.offerBadge,
      couponCode: ad.couponCode,
      countdownEnd: ad.countdownEnd,
      buttonText: ad.buttonText,
      buttonLink: ad.buttonLink,
      priority: ad.priority + 1,
      startDate: ad.startDate,
      endDate: ad.endDate,
      isActive: true,
      termsConditions: ad.termsConditions,
    });
    addToast(`Duplicated campaign "${ad.title}" successfully.`, "success");
  };

  const handleSaveAd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !mediaUrl.trim()) {
      addToast("Please fill in campaign title and media image/video URL", "warning");
      return;
    }

    if (editingAd) {
      updateAdvertisement(editingAd.id, {
        title,
        description,
        type,
        mediaType,
        mediaUrl,
        videoUrl,
        offerBadge,
        couponCode,
        countdownEnd,
        buttonText,
        buttonLink,
        priority,
        startDate,
        endDate,
        isActive,
        termsConditions,
      });
      addToast(`Updated advertisement "${title}"`, "success");
    } else {
      addAdvertisement({
        title,
        description,
        type,
        mediaType,
        mediaUrl,
        videoUrl,
        offerBadge,
        couponCode,
        countdownEnd,
        buttonText,
        buttonLink,
        priority,
        startDate,
        endDate,
        isActive,
        termsConditions,
      });
    }
    setShowModal(false);
  };

  // Export Analytics to Excel
  const handleExportExcel = () => {
    const exportRows = advertisements.map((ad) => {
      const ctr = ad.views > 0 ? ((ad.clicks / ad.views) * 100).toFixed(2) + "%" : "0%";
      const convRate = ad.clicks > 0 ? ((ad.conversions / ad.clicks) * 100).toFixed(2) + "%" : "0%";
      return {
        ID: ad.id,
        Title: ad.title,
        Type: ad.type,
        "Media Type": ad.mediaType,
        Badge: ad.offerBadge || "N/A",
        "Coupon Code": ad.couponCode || "None",
        Priority: ad.priority,
        "Start Date": ad.startDate,
        "End Date": ad.endDate,
        Status: ad.isActive ? "Active" : "Inactive",
        Views: ad.views,
        Clicks: ad.clicks,
        "CTR (%)": ctr,
        Conversions: ad.conversions,
        "Conv Rate": convRate,
      };
    });

    exportToExcel(`marketing_campaigns_analytics_${Date.now()}.xlsx`, "Campaign Analytics", exportRows);
    addToast(`Exported ${exportRows.length} campaign records to Excel (.xlsx)`, "success");
  };

  // Bulk Excel Import
  const handleExecuteImport = async () => {
    if (!importFile) return;
    setImporting(true);
    try {
      const rows = await parseExcelOrCSVFile(importFile);
      let count = 0;
      rows.forEach((row: any) => {
        const adTitle = row["Title"] || row["title"] || row["Campaign Title"];
        if (adTitle) {
          addAdvertisement({
            title: String(adTitle),
            description: String(row["Description"] || row["description"] || "Promotional offer campaign"),
            type: (row["Type"] as any) || "slider",
            mediaType: row["Media Type"] === "video" ? "video" : "image",
            mediaUrl: String(
              row["Media URL"] ||
                row["mediaUrl"] ||
                "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1200&q=80"
            ),
            videoUrl: String(row["Video URL"] || ""),
            offerBadge: (row["Badge"] as any) || "FLASH SALE",
            couponCode: String(row["Coupon Code"] || row["couponCode"] || ""),
            buttonText: String(row["Button Text"] || "Shop Now"),
            buttonLink: String(row["Button Link"] || "products"),
            priority: parseInt(row["Priority"] || "1"),
            startDate: String(row["Start Date"] || new Date().toISOString().split("T")[0]),
            endDate: String(row["End Date"] || "2026-12-31"),
            isActive: true,
          });
          count++;
        }
      });
      addToast(`Successfully imported ${count} marketing advertisements!`, "success");
      setShowImportModal(false);
      setImportFile(null);
    } catch (err: any) {
      addToast(`Import failed: ${err.message || err}`, "error");
    } finally {
      setImporting(false);
    }
  };

  // Send Broadcast Simulation
  const handleSendBroadcast = () => {
    if (!smsMessage.trim()) {
      addToast("Please enter a message text to broadcast.", "warning");
      return;
    }

    setIsSendingBroadcast(true);
    setTimeout(() => {
      const recipientCount =
        smsAudience === "all"
          ? 1850
          : smsAudience === "vip"
          ? 420
          : smsAudience === "inactive"
          ? 610
          : (smsCustomNumbers.split(",").filter((n) => n.trim().length > 0).length || 1);

      const audienceName =
        smsAudience === "all"
          ? "All Registered Customers"
          : smsAudience === "vip"
          ? "VIP Spenders (>৳5,000)"
          : smsAudience === "inactive"
          ? "Inactive Customers (30+ days)"
          : "Custom Mobile Numbers";

      const newHistory: BroadcastHistoryItem = {
        id: `bc-${Date.now()}`,
        channel: smsChannel,
        audience: audienceName,
        recipientCount,
        message: smsMessage,
        sentAt: new Date().toISOString().replace("T", " ").slice(0, 16),
        status: "Delivered",
      };

      setBroadcastHistory((prev) => [newHistory, ...prev]);
      setIsSendingBroadcast(false);
      addToast(
        `Successfully broadcasted ${smsChannel} campaign to ${recipientCount.toLocaleString()} recipients!`,
        "success"
      );
    }, 1200);
  };

  // Calculate Character count & SMS parts
  const isUnicode = useMemo(() => /[^\u0000-\u007F]/.test(smsMessage), [smsMessage]);
  const maxPerSms = isUnicode ? 70 : 160;
  const smsParts = Math.ceil((smsMessage.length || 1) / maxPerSms);

  return (
    <div className="space-y-6 text-left">
      {/* Executive Command Header */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 p-6 rounded-3xl border border-slate-800 text-white shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-600/30 border border-indigo-500/40 rounded-xl text-indigo-400">
              <Megaphone className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold tracking-tight flex items-center gap-2">
                মার্কেটিং ও বিজ্ঞাপন কমান্ড সেন্টার
                <span className="text-[11px] font-semibold text-indigo-300 bg-indigo-950/80 px-2.5 py-0.5 rounded-full border border-indigo-700/50">
                  Universal Marketing Engine
                </span>
              </h1>
              <p className="text-xs text-slate-300 max-w-2xl">
                হোমপেজ স্লাইডার ব্যানার, পপ-আপ অফার, ফেস্টিভ্যাল ক্যাম্পেইন, এসএমএস ও হোয়াটসঅ্যাপ ব্রডকাস্ট এবং ডিজিটাল এডস ট্র্যাকিং।
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveSubTab("ai-copywriter")}
            className="bg-purple-900/60 hover:bg-purple-800/80 text-purple-200 text-xs font-bold px-3.5 py-2 rounded-xl border border-purple-700/50 flex items-center gap-1.5 transition-colors"
          >
            <Sparkles className="w-4 h-4 text-purple-300" /> এআই কপিরাইটার
          </button>

          <button
            onClick={handleExportExcel}
            className="bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl border border-slate-700 flex items-center gap-1.5 transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" /> এক্সেল এক্সপোর্ট
          </button>

          <button
            onClick={() => setShowImportModal(true)}
            className="bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl border border-slate-700 flex items-center gap-1.5 transition-colors"
          >
            <Upload className="w-4 h-4 text-sky-400" /> ব্যানার ইমপোর্ট
          </button>

          <button
            onClick={() => openCreateModal()}
            className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> নতুন ব্যানার বা ক্যাম্পেইন
          </button>
        </div>
      </div>

      {/* High-Level Overview Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            সক্রিয় ব্যানার
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-black text-slate-900">
              {advertisements.filter((a) => a.isActive).length}
            </span>
            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
              লাইভ
            </span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            মোট ভিউজ (ইমপ্রেশন)
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-black text-slate-900">
              {advertisements.reduce((acc, a) => acc + a.views, 0).toLocaleString()}
            </span>
            <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded flex items-center gap-0.5">
              <Eye className="w-3 h-3" />
            </span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            মোট ক্লিকস
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-black text-slate-900">
              {advertisements.reduce((acc, a) => acc + a.clicks, 0).toLocaleString()}
            </span>
            <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded flex items-center gap-0.5">
              <MousePointer className="w-3 h-3" />
            </span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            ক্লিক রেট (CTR)
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-black text-indigo-600">
              {advertisements.reduce((acc, a) => acc + a.views, 0) > 0
                ? (
                    (advertisements.reduce((acc, a) => acc + a.clicks, 0) /
                      advertisements.reduce((acc, a) => acc + a.views, 0)) *
                    100
                  ).toFixed(1) + "%"
                : "0%"}
            </span>
            <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">
              হাই
            </span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            সরাসরি কনভার্সন
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-black text-emerald-600">
              {advertisements.reduce((acc, a) => acc + a.conversions, 0).toLocaleString()}
            </span>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
              অর্ডার
            </span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            প্রভাবিত রেভিনিউ (আনুমানিক)
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-black text-purple-700">
              ৳{(advertisements.reduce((acc, a) => acc + a.conversions, 0) * 1250).toLocaleString()}
            </span>
            <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded">
              ROAS
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Subtabs Bar */}
      <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-2xs flex flex-wrap gap-1">
        <button
          onClick={() => setActiveSubTab("slider")}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
            activeSubTab === "slider"
              ? "bg-indigo-600 text-white shadow-xs"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <ImageIcon className="w-4 h-4" />
          <span>হোমপেজ স্লাইডার ব্যানার</span>
          <span className="ml-1 px-1.5 py-0.2 bg-white/20 text-white text-[10px] rounded-md font-mono">
            {advertisements.filter((a) => a.type === "slider").length}
          </span>
        </button>

        <button
          onClick={() => setActiveSubTab("popup")}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
            activeSubTab === "popup"
              ? "bg-indigo-600 text-white shadow-xs"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>পপ-আপ অফার মোডাল</span>
          <span className="ml-1 px-1.5 py-0.2 bg-white/20 text-white text-[10px] rounded-md font-mono">
            {advertisements.filter((a) => a.type === "popup").length}
          </span>
        </button>

        <button
          onClick={() => setActiveSubTab("campaign")}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
            activeSubTab === "campaign"
              ? "bg-indigo-600 text-white shadow-xs"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <Flame className="w-4 h-4 text-rose-400" />
          <span>ফ্ল্যাশ সেল ও ফেস্টিভ্যাল</span>
          <span className="ml-1 px-1.5 py-0.2 bg-white/20 text-white text-[10px] rounded-md font-mono">
            {advertisements.filter((a) => a.type === "campaign").length}
          </span>
        </button>

        <button
          onClick={() => setActiveSubTab("video")}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
            activeSubTab === "video"
              ? "bg-indigo-600 text-white shadow-xs"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <Video className="w-4 h-4 text-sky-400" />
          <span>ভিডিও ও রিলস প্রমো</span>
        </button>

        <button
          onClick={() => setActiveSubTab("sms-whatsapp")}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
            activeSubTab === "sms-whatsapp"
              ? "bg-emerald-600 text-white shadow-xs"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <Send className="w-4 h-4 text-emerald-300" />
          <span>এসএমএস ও হোয়াটসঅ্যাপ ব্রডকাস্ট</span>
        </button>

        <button
          onClick={() => setActiveSubTab("coupons")}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
            activeSubTab === "coupons"
              ? "bg-indigo-600 text-white shadow-xs"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <Tag className="w-4 h-4 text-amber-500" />
          <span>কুপন ও ভাউচার হাব</span>
          <span className="ml-1 px-1.5 py-0.2 bg-white/20 text-white text-[10px] rounded-md font-mono">
            {coupons.length}
          </span>
        </button>

        <button
          onClick={() => setActiveSubTab("utm-tracking")}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
            activeSubTab === "utm-tracking"
              ? "bg-indigo-600 text-white shadow-xs"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <Share2 className="w-4 h-4 text-blue-400" />
          <span>ডিজিটাল এডস লিংক ও কিউআর বিল্ডার</span>
        </button>

        <button
          onClick={() => setActiveSubTab("ai-copywriter")}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
            activeSubTab === "ai-copywriter"
              ? "bg-purple-600 text-white shadow-xs"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <Sparkles className="w-4 h-4 text-purple-400" />
          <span>স্মার্ট কপিরাইটার</span>
        </button>

        <button
          onClick={() => setActiveSubTab("analytics")}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
            activeSubTab === "analytics"
              ? "bg-indigo-600 text-white shadow-xs"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <BarChart3 className="w-4 h-4 text-emerald-400" />
          <span>এনালিটিক্স ও আরওএএস</span>
        </button>
      </div>

      {/* TAB 1: SMS & WHATSAPP MARKETING HUB */}
      {activeSubTab === "sms-whatsapp" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm">
                    বাল্ক এসএমএস ও হোয়াটসঅ্যাপ ব্রডকাস্ট ইঞ্জিন
                  </h3>
                  <p className="text-xs text-slate-400">
                    এক ক্লিকে আপনার সকল কাস্টমার বা ভিআইপি ক্রেতাদের কাছে প্রমোশনাল অফার পাঠান।
                  </p>
                </div>
              </div>

              {/* Channel Selector */}
              <div className="flex bg-slate-100 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setSmsChannel("SMS")}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    smsChannel === "SMS"
                      ? "bg-white text-emerald-700 shadow-2xs"
                      : "text-slate-600"
                  }`}
                >
                  ব্র্যান্ড এসএমএস
                </button>
                <button
                  type="button"
                  onClick={() => setSmsChannel("WhatsApp")}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    smsChannel === "WhatsApp"
                      ? "bg-emerald-600 text-white shadow-2xs"
                      : "text-slate-600"
                  }`}
                >
                  WhatsApp
                </button>
              </div>
            </div>

            {/* Target Audience */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">টার্গেট অডিয়েন্স (Target Audience)</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => setSmsAudience("all")}
                  className={`p-2.5 rounded-xl border text-xs font-bold text-left transition-all ${
                    smsAudience === "all"
                      ? "border-emerald-500 bg-emerald-50/60 text-emerald-900"
                      : "border-slate-200 bg-white hover:bg-slate-50 text-slate-700"
                  }`}
                >
                  <span>সকল ক্রেতা</span>
                  <span className="block text-[10px] text-slate-500 font-normal">
                    {customers.length > 0 ? customers.length : 1850} জন গ্রাহক
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setSmsAudience("vip")}
                  className={`p-2.5 rounded-xl border text-xs font-bold text-left transition-all ${
                    smsAudience === "vip"
                      ? "border-emerald-500 bg-emerald-50/60 text-emerald-900"
                      : "border-slate-200 bg-white hover:bg-slate-50 text-slate-700"
                  }`}
                >
                  <span>ভিআইপি ক্রেতা</span>
                  <span className="block text-[10px] text-slate-500 font-normal">&gt; ৳৫,০০০ অর্ডার</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSmsAudience("inactive")}
                  className={`p-2.5 rounded-xl border text-xs font-bold text-left transition-all ${
                    smsAudience === "inactive"
                      ? "border-emerald-500 bg-emerald-50/60 text-emerald-900"
                      : "border-slate-200 bg-white hover:bg-slate-50 text-slate-700"
                  }`}
                >
                  <span>নিষ্ক্রিয় কাস্টমার</span>
                  <span className="block text-[10px] text-slate-500 font-normal">গত ৩০ দিন অর্ডার নেই</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSmsAudience("custom")}
                  className={`p-2.5 rounded-xl border text-xs font-bold text-left transition-all ${
                    smsAudience === "custom"
                      ? "border-emerald-500 bg-emerald-50/60 text-emerald-900"
                      : "border-slate-200 bg-white hover:bg-slate-50 text-slate-700"
                  }`}
                >
                  <span>কাস্টম নম্বর</span>
                  <span className="block text-[10px] text-slate-500 font-normal">নম্বর পেস্ট করুন</span>
                </button>
              </div>
            </div>

            {smsAudience === "custom" && (
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  মোবাইল নম্বর লিখুন (কমা দিয়ে একাধিক)
                </label>
                <textarea
                  rows={2}
                  value={smsCustomNumbers}
                  onChange={(e) => setSmsCustomNumbers(e.target.value)}
                  placeholder="01711000000, 01822000000, 01933000000..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                />
              </div>
            )}

            {/* Quick Templates */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">
                রেডিমেড প্রমোশনাল টেমপ্লেট নির্বাচন করুন
              </label>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() =>
                    setSmsMessage(
                      "🔥 ফ্ল্যাশ সেল শুরু হয়েছে! SmartShop-এ সকল গ্যাজেটে চলছে সর্বোচ্চ ৫০% ছাড়! কুপন কোড: FLASH50। এখনই ভিজিট করুন: smartshop.bd"
                    )
                  }
                  className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 text-[11px] font-semibold rounded-lg"
                >
                  🔥 ফ্ল্যাশ সেল ৫০% ছাড়
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setSmsMessage(
                      "🌙 ঈদ মোবারক! উৎসবের কেনাকাটায় ২০% ক্যাশব্যাক ভাউচার EID2026। প্রিয়জনের জন্য সেরা উপহার বুক করুন এখনই: smartshop.bd"
                    )
                  }
                  className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 text-[11px] font-semibold rounded-lg"
                >
                  🌙 ঈদ মেগা ডিসকাউন্ট
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setSmsMessage(
                      "🚚 দেশজুড়ে ক্যাশ অন ডেলিভারি এখন সম্পূর্ণ ফ্রি! যেকোনো অর্ডারে ফ্রি ডেলিভারি পেতে কুপন কোড FREEDEL ব্যবহার করুন: smartshop.bd"
                    )
                  }
                  className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 text-[11px] font-semibold rounded-lg"
                >
                  🚚 ফ্রি হোম ডেলিভারি
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setSmsMessage(
                      "🛒 আপনার কার্টে থাকা পছন্দের পণ্যটির স্টক দ্রুত শেষ হয়ে যাচ্ছে! এখনই অর্ডার সম্পন্ন করে বিশেষ ছাড় উপভোগ করুন: smartshop.bd/cart"
                    )
                  }
                  className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 text-[11px] font-semibold rounded-lg"
                >
                  🛒 কার্ট রিকভারি রিমাইন্ডার
                </button>
              </div>
            </div>

            {/* Message Body Input */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 block">
                  ক্যাম্পেইন মেসেজ বডি (Message Body)
                </label>
                <span className="text-[11px] font-mono font-bold text-slate-500">
                  {smsMessage.length} অক্ষর | {smsParts} পার্ট ({isUnicode ? "বাংলা/ইউনিকোড" : "ইংরেজি GSM"})
                </span>
              </div>
              <textarea
                rows={4}
                value={smsMessage}
                onChange={(e) => setSmsMessage(e.target.value)}
                placeholder="মেসেজ লিখুন..."
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs outline-none focus:ring-2 focus:ring-emerald-500 leading-relaxed font-sans"
              />
            </div>

            {/* Shortcodes helper */}
            <div className="flex items-center gap-2 text-[11px] text-slate-500">
              <span className="font-bold text-slate-600">ডায়নামিক ট্যাগ:</span>
              <button
                type="button"
                onClick={() => setSmsMessage((prev) => prev + " {name}")}
                className="px-1.5 py-0.5 bg-slate-100 hover:bg-slate-200 rounded text-slate-700 font-mono"
              >
                {"{name}"}
              </button>
              <button
                type="button"
                onClick={() => setSmsMessage((prev) => prev + " {coupon_code}")}
                className="px-1.5 py-0.5 bg-slate-100 hover:bg-slate-200 rounded text-slate-700 font-mono"
              >
                {"{coupon_code}"}
              </button>
              <button
                type="button"
                onClick={() => setSmsMessage((prev) => prev + " smartshop.bd")}
                className="px-1.5 py-0.5 bg-slate-100 hover:bg-slate-200 rounded text-slate-700 font-mono"
              >
                {"smartshop.bd"}
              </button>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex items-center justify-between border-t border-slate-100">
              <span className="text-[11px] text-slate-500">
                আনুমানিক ব্যয়: <strong className="text-slate-800">৳{(smsParts * 0.35 * (smsAudience === "vip" ? 420 : 1850)).toFixed(0)}</strong> (৳০.৩৫/এসএমএস)
              </span>

              <button
                type="button"
                disabled={isSendingBroadcast}
                onClick={handleSendBroadcast}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isSendingBroadcast ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" /> ব্রডকাস্ট পাঠানো হচ্ছে...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" /> ক্যাম্পেইন ব্রডকাস্ট করুন
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Right Column: Live Mobile SMS / WhatsApp Preview & History */}
          <div className="lg:col-span-5 space-y-4">
            {/* Phone Screen Mockup */}
            <div className="bg-slate-900 rounded-3xl p-4 border border-slate-800 shadow-xl text-white">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
                  <span className="font-bold">লাইভ ফোন ডিসপ্লে প্রিভিউ</span>
                </div>
                <span className="text-[10px] text-slate-400">
                  {smsChannel === "SMS" ? "Sender: SmartShop" : "WhatsApp Business"}
                </span>
              </div>

              <div className="py-6 px-3 flex flex-col items-center">
                <div className="w-full max-w-[280px] bg-slate-800 rounded-2xl p-4 border border-slate-700 space-y-2 shadow-inner">
                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span className="font-bold text-emerald-400">{smsChannel === "SMS" ? "SmartShop BD" : "SmartShop Official"}</span>
                    <span>Just now</span>
                  </div>
                  <p className="text-xs text-slate-100 whitespace-pre-wrap leading-relaxed">
                    {smsMessage || "আপনার ক্যাম্পেইন মেসেজ এখানে প্রদর্শিত হবে..."}
                  </p>
                  <div className="pt-2 flex items-center justify-between text-[9px] text-slate-400 border-t border-slate-700">
                    <span>Reply STOP to opt out</span>
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  </div>
                </div>
              </div>
            </div>

            {/* Broadcast Logs */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3">
              <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-indigo-600" /> সাম্প্রতিক ব্রডকাস্ট হিস্টোরি
              </h4>

              <div className="space-y-2 max-h-56 overflow-y-auto">
                {broadcastHistory.map((item) => (
                  <div
                    key={item.id}
                    className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between font-bold">
                      <span className="text-slate-800 flex items-center gap-1">
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            item.channel === "SMS" ? "bg-emerald-500" : "bg-sky-500"
                          }`}
                        ></span>
                        {item.channel} - {item.audience}
                      </span>
                      <span className="text-[10px] text-emerald-600 bg-emerald-50 px-1.5 py-0.2 rounded font-semibold">
                        {item.status} ({item.recipientCount.toLocaleString()})
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 truncate">{item.message}</p>
                    <div className="text-[10px] text-slate-400 flex items-center justify-between">
                      <span>{item.sentAt}</span>
                      <button
                        onClick={() => {
                          setSmsMessage(item.message);
                          addToast("Copied template to compose box", "info");
                        }}
                        className="text-indigo-600 hover:text-indigo-700 font-bold"
                      >
                        পুনরায় ব্যবহার করুন
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: COUPONS & VOUCHER HUB */}
      {activeSubTab === "coupons" && (
        <div className="space-y-5">
          <div className="bg-gradient-to-r from-amber-500 to-amber-600 p-5 rounded-3xl text-white shadow-md flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-1">
              <h3 className="text-base font-extrabold flex items-center gap-2">
                <Tag className="w-5 h-5 text-amber-200" /> কুপন ও ভাউচার ম্যানেজমেন্ট হাব
              </h3>
              <p className="text-xs text-amber-100 max-w-xl">
                গ্রাহকদের জন্য ডিসকাউন্ট কোড, শতাংশ বা নির্দিষ্ট টাকার ছাড় এবং ব্যবহারের সীমাবদ্ধতা নিয়ন্ত্রণ করুন।
              </p>
            </div>
            <button
              onClick={() => setAdminView("coupons")}
              className="bg-white hover:bg-amber-50 text-amber-900 font-bold text-xs px-4 py-2 rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              সম্পূর্ণ কুপন কনসোল খুলুন <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {coupons.map((coupon) => (
              <div
                key={coupon.id}
                className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs hover:shadow-md transition-all space-y-3 relative overflow-hidden"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 bg-amber-100 text-amber-900 font-mono font-black text-sm rounded-lg border border-amber-200 flex items-center gap-1">
                      {coupon.code}
                    </span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(coupon.code);
                        addToast(`Copied coupon code ${coupon.code}`, "success");
                      }}
                      className="p-1 hover:bg-slate-100 rounded-md text-slate-400 hover:text-slate-600"
                      title="কপি করুন"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      coupon.status === "Active"
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {coupon.status}
                  </span>
                </div>

                <div className="space-y-1">
                  <h4 className="font-bold text-slate-900 text-xs">
                    {coupon.title || `${coupon.discountValue}${coupon.type === "Percentage" ? "%" : "৳"} ছাড়`}
                  </h4>
                  <p className="text-[11px] text-slate-500 line-clamp-1">{coupon.description || "সকল পণ্যে প্রযোজ্য"}</p>
                </div>

                <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-2 text-[11px] text-slate-600">
                  <div>
                    <span className="block text-slate-400 text-[10px]">ছাড়ের পরিমাণ</span>
                    <strong className="text-indigo-600 font-black">
                      {coupon.type === "Percentage" ? `${coupon.discountValue}%` : `৳${coupon.discountValue}`}
                    </strong>
                  </div>
                  <div>
                    <span className="block text-slate-400 text-[10px]">ব্যবহার হয়েছে</span>
                    <strong className="text-slate-800">
                      {coupon.usageCount} {coupon.usageLimit ? `/ ${coupon.usageLimit}` : "বার"}
                    </strong>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between text-[11px]">
                  <span className="text-slate-400 text-[10px]">
                    মেয়াদ: {coupon.expiryDate || coupon.endDate || "আনলিমিটেড"}
                  </span>
                  <button
                    onClick={() => {
                      // Apply coupon to new campaign modal
                      setCouponCode(coupon.code);
                      openCreateModal("slider");
                    }}
                    className="text-indigo-600 hover:text-indigo-700 font-bold text-xs"
                  >
                    ব্যানারে যুক্ত করুন →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: UTM DIGITAL AD LINK BUILDER */}
      {activeSubTab === "utm-tracking" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                <Share2 className="w-5 h-5 text-indigo-600" /> ডিজিটাল এডভার্টাইজিং UTM ট্র্যাকিং লিংক বিল্ডার
              </h3>
              <p className="text-xs text-slate-400">
                Facebook Ads, TikTok, Google Ads বা SMS ক্যাম্পেইনের জন্য প্রিসাইজ ট্র্যাকিং URL জেনারেট করুন।
              </p>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">ল্যান্ডিং পেজ URL (Base Website URL)</label>
                <input
                  type="text"
                  value={utmBaseUrl}
                  onChange={(e) => setUtmBaseUrl(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">ক্যাম্পেইন সোর্স (utm_source)</label>
                  <select
                    value={utmSource}
                    onChange={(e: any) => setUtmSource(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none capitalize"
                  >
                    <option value="facebook">Facebook Ads</option>
                    <option value="instagram">Instagram Ads / Reels</option>
                    <option value="tiktok">TikTok Ads</option>
                    <option value="google">Google Ads</option>
                    <option value="whatsapp">WhatsApp Message</option>
                    <option value="sms">SMS Marketing</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">মার্কেটিং মিডিয়াম (utm_medium)</label>
                  <input
                    type="text"
                    value={utmMedium}
                    onChange={(e) => setUtmMedium(e.target.value)}
                    placeholder="cpc, stories, reels, banner..."
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">ক্যাম্পেইন নাম (utm_campaign)</label>
                  <input
                    type="text"
                    value={utmCampaign}
                    onChange={(e) => setUtmCampaign(e.target.value)}
                    placeholder="eid_mega_sale_2026"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">টার্গেট টার্ম (utm_term)</label>
                  <input
                    type="text"
                    value={utmTerm}
                    onChange={(e) => setUtmTerm(e.target.value)}
                    placeholder="smart_watches"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">এড কনটেন্ট ভেরিয়েন্ট (utm_content)</label>
                  <input
                    type="text"
                    value={utmContent}
                    onChange={(e) => setUtmContent(e.target.value)}
                    placeholder="banner_v1"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Generated Output */}
            <div className="pt-2 space-y-2">
              <label className="text-xs font-bold text-slate-800 flex items-center justify-between">
                <span>জেনারেটেড ফুল ট্র্যাকিং লিংক</span>
                <span className="text-indigo-600 font-semibold text-[11px]">Ready to copy</span>
              </label>

              <div className="p-3 bg-slate-900 rounded-2xl border border-slate-800 text-white space-y-2">
                <p className="font-mono text-xs text-indigo-300 break-all select-all leading-relaxed">
                  {generatedUtmUrl}
                </p>

                <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(generatedUtmUrl);
                      addToast("Copied UTM tracking link to clipboard!", "success");
                    }}
                    className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" /> লিংক কপি করুন
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: QR Code & Campaign Quick Test */}
          <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4 flex flex-col justify-between">
            <div className="space-y-2">
              <h4 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                <QrCode className="w-4 h-4 text-emerald-600" /> প্রিন্ট ও সোশ্যাল কিউআর কোড
              </h4>
              <p className="text-xs text-slate-500">
                প্যাকেজিং বক্স, ফ্লায়ার বা প্রিন্ট ব্যানারে এই কিউআর কোড প্রিন্ট করে সরাসরি ট্র্যাক করতে পারেন।
              </p>
            </div>

            <div className="py-6 flex flex-col items-center justify-center space-y-3 bg-slate-50 rounded-2xl border border-slate-100 p-4">
              <div className="p-4 bg-white rounded-2xl shadow-sm border border-slate-200">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
                    generatedUtmUrl
                  )}`}
                  alt="QR Code"
                  className="w-40 h-40 object-contain"
                />
              </div>
              <span className="text-[11px] font-mono text-slate-500 text-center max-w-xs truncate">
                {generatedUtmUrl}
              </span>
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
              <div className="flex items-center justify-between text-slate-600">
                <span>সোর্স প্ল্যাটফর্ম:</span>
                <strong className="text-slate-900 uppercase font-mono">{utmSource}</strong>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span>ক্যাম্পেইন নেম:</span>
                <strong className="text-slate-900 font-mono">{utmCampaign}</strong>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: AI SMART COPYWRITER & MARKETING HOOKS */}
      {activeSubTab === "ai-copywriter" && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 p-6 rounded-3xl text-white shadow-lg space-y-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-purple-300" />
              <h3 className="text-lg font-black tracking-tight">
                স্মার্ট এআই মার্কেটিং কপিরাইটার ও হুক জেনারেটর
              </h3>
            </div>
            <p className="text-xs text-purple-200 max-w-2xl">
              বাংলাদেশি ই-কমার্স গ্রাহকদের জন্য আকর্ষণীয় বাংলা ও ইংরেজি মার্কেটিং ক্যাপশন, ফেসবুক পোস্টের হুক এবং এসএমএস টেক্সট এক ক্লিকে ব্যবহার করুন।
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {SMART_COPY_TEMPLATES.map((section, idx) => (
              <div
                key={idx}
                className="bg-white rounded-3xl border border-slate-200 p-5 shadow-2xs space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <h4 className="font-extrabold text-slate-900 text-sm border-b border-slate-100 pb-2 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-purple-600"></span>
                    {section.category}
                  </h4>

                  <div className="space-y-3">
                    {section.items.map((item, itemIdx) => (
                      <div
                        key={itemIdx}
                        className="p-3 bg-slate-50 hover:bg-purple-50/50 border border-slate-200 rounded-2xl transition-colors space-y-1.5"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-purple-950">{item.title}</span>
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(item.text);
                              addToast(`Copied "${item.title}" to clipboard!`, "success");
                            }}
                            className="p-1 text-slate-400 hover:text-purple-600 rounded"
                            title="কপি করুন"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <p className="text-[11px] text-slate-600 leading-relaxed">{item.text}</p>
                        <div className="pt-1 flex items-center justify-end">
                          <button
                            type="button"
                            onClick={() => {
                              setTitle(item.title);
                              setDescription(item.text);
                              openCreateModal("slider");
                              addToast("Applied copy to new campaign modal", "info");
                            }}
                            className="text-[10px] font-bold text-purple-600 hover:text-purple-700"
                          >
                            ব্যানারে ব্যবহার করুন →
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: ANALYTICS & ROAS VIEW */}
      {activeSubTab === "analytics" && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">
                  ক্যাম্পেইন পারফরম্যান্স ও আরওএএস মেট্রিক্স (Campaign Benchmark)
                </h3>
                <p className="text-xs text-slate-400">
                  কোন ব্যানার কত বেশি ক্লিক ও বিক্রয় কনভার্সন এনে দিয়েছে তার রিয়েলটাইম ডাটা।
                </p>
              </div>
              <button
                onClick={handleExportExcel}
                className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 rounded-xl"
              >
                <FileSpreadsheet className="w-4 h-4" /> এক্সেল ডাউনলোড (.xlsx)
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="p-3">ক্যাম্পেইন / ব্যানার টাইটেল</th>
                    <th className="p-3">টাইপ</th>
                    <th className="p-3">ব্যাজ / কুপন</th>
                    <th className="p-3 text-right">ইমপ্রেশন (Views)</th>
                    <th className="p-3 text-right">ক্লিকস (Clicks)</th>
                    <th className="p-3 text-right">ক্লিক রেট (CTR)</th>
                    <th className="p-3 text-right">কনভার্সন</th>
                    <th className="p-3 text-right">আনুমানিক সেলস</th>
                    <th className="p-3 text-center">স্ট্যাটাস</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {advertisements.map((ad) => {
                    const ctr =
                      ad.views > 0 ? ((ad.clicks / ad.views) * 100).toFixed(2) : "0.00";
                    const estSales = ad.conversions * 1250;
                    return (
                      <tr key={ad.id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-3 font-bold text-slate-900">
                          <div className="flex items-center gap-2.5">
                            <img
                              src={ad.mediaUrl}
                              alt=""
                              className="w-10 h-7 object-cover rounded-md border border-slate-200"
                            />
                            <div>
                              <span className="block truncate max-w-xs">{ad.title}</span>
                              <span className="text-[10px] text-slate-400 font-normal">
                                Priority: {ad.priority}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="p-3 capitalize text-slate-600 font-semibold">{ad.type}</td>
                        <td className="p-3">
                          <div className="flex items-center gap-1">
                            {ad.offerBadge && (
                              <span className="px-1.5 py-0.2 bg-amber-100 text-amber-800 text-[10px] font-bold rounded">
                                {ad.offerBadge}
                              </span>
                            )}
                            {ad.couponCode && (
                              <span className="px-1.5 py-0.2 bg-indigo-50 text-indigo-700 font-mono text-[10px] font-bold rounded">
                                {ad.couponCode}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="p-3 text-right font-mono font-semibold text-slate-800">
                          {ad.views.toLocaleString()}
                        </td>
                        <td className="p-3 text-right font-mono font-semibold text-slate-800">
                          {ad.clicks.toLocaleString()}
                        </td>
                        <td className="p-3 text-right font-mono font-extrabold text-indigo-600">
                          {ctr}%
                        </td>
                        <td className="p-3 text-right font-mono font-bold text-emerald-600">
                          {ad.conversions.toLocaleString()}
                        </td>
                        <td className="p-3 text-right font-mono font-bold text-purple-700">
                          ৳{estSales.toLocaleString()}
                        </td>
                        <td className="p-3 text-center">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              ad.isActive
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            {ad.isActive ? "Active" : "Inactive"}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TABS: SLIDER, POPUP, CAMPAIGN, VIDEO (Grid list of cards) */}
      {(activeSubTab === "slider" ||
        activeSubTab === "popup" ||
        activeSubTab === "campaign" ||
        activeSubTab === "video") && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs space-y-4 p-5">
          {/* Controls Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div className="relative flex-1 min-w-[240px]">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="ক্যাম্পেইন নাম, ডেসক্রিপশন বা কুপন খুঁজুন..."
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={statusFilter}
                onChange={(e: any) => setStatusFilter(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 outline-none"
              >
                <option value="All">সকল স্ট্যাটাস</option>
                <option value="Active">সক্রিয় ব্যানার</option>
                <option value="Inactive">নিষ্ক্রিয় ব্যানার</option>
              </select>

              <button
                onClick={() => openCreateModal()}
                className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> নতুন ব্যানার যোগ করুন
              </button>
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredAds.map((ad) => (
              <div
                key={ad.id}
                className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                {/* Media Preview Box */}
                <div className="relative h-44 bg-slate-900 overflow-hidden group">
                  {ad.mediaType === "video" && ad.videoUrl ? (
                    <video
                      src={ad.videoUrl}
                      className="w-full h-full object-cover"
                      muted
                      loop
                      autoPlay
                    />
                  ) : (
                    <img
                      src={ad.mediaUrl || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80"}
                      alt={ad.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-transparent to-transparent"></div>

                  <div className="absolute top-2 left-2 flex items-center gap-1.5">
                    {ad.offerBadge && (
                      <span className="px-2.5 py-0.5 bg-amber-400 text-slate-950 font-black text-[9px] uppercase rounded-full shadow-xs">
                        {ad.offerBadge}
                      </span>
                    )}
                    <span className="px-2 py-0.5 bg-slate-900/80 text-white font-bold text-[9px] uppercase rounded-full border border-white/20">
                      অগ্রাধিকার: {ad.priority}
                    </span>
                  </div>

                  <div className="absolute top-2 right-2">
                    <button
                      onClick={() => updateAdvertisement(ad.id, { isActive: !ad.isActive })}
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border transition-colors cursor-pointer ${
                        ad.isActive
                          ? "bg-emerald-500 text-white border-emerald-400"
                          : "bg-slate-700 text-slate-300 border-slate-600"
                      }`}
                    >
                      {ad.isActive ? "সক্রিয় (Active)" : "বন্ধ (Disabled)"}
                    </button>
                  </div>

                  <div className="absolute bottom-2 left-3 right-3 text-white">
                    <h3 className="font-bold text-sm truncate">{ad.title}</h3>
                  </div>
                </div>

                {/* Details Section */}
                <div className="p-4 space-y-3 text-xs flex-1 flex flex-col justify-between">
                  <p className="text-slate-600 line-clamp-2 leading-relaxed">{ad.description}</p>

                  <div className="space-y-1.5 text-[11px] text-slate-500 pt-2 border-t border-slate-100">
                    {ad.couponCode && (
                      <div className="flex items-center justify-between bg-indigo-50/70 p-2 rounded-xl font-mono font-bold text-indigo-900">
                        <span>কুপন কোড: {ad.couponCode}</span>
                        <Tag className="w-3.5 h-3.5 text-indigo-600" />
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <span>ক্যাম্পেইন শিডিউল:</span>
                      <span className="font-semibold text-slate-800">
                        {ad.startDate} থেকে {ad.endDate}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>পারফরম্যান্স:</span>
                      <span className="font-bold text-slate-800">
                        {ad.views.toLocaleString()} ভিউজ | {ad.clicks.toLocaleString()} ক্লিকস |{" "}
                        {ad.conversions.toLocaleString()} সেলস
                      </span>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="pt-2 flex items-center justify-between gap-1.5 border-t border-slate-100">
                    {ad.type === "slider" && (
                      <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                        <button
                          onClick={() => handleMovePriority(ad.id, "up")}
                          className="px-2 py-1 bg-white hover:bg-slate-200 text-slate-800 font-bold rounded-lg text-[10px] shadow-2xs cursor-pointer"
                          title="অগ্রাধিকার বৃদ্ধি (উপরে নিন)"
                        >
                          ▲
                        </button>
                        <button
                          onClick={() => handleMovePriority(ad.id, "down")}
                          className="px-2 py-1 bg-white hover:bg-slate-200 text-slate-800 font-bold rounded-lg text-[10px] shadow-2xs cursor-pointer"
                          title="অগ্রাধিকার হ্রাস (নিচে নিন)"
                        >
                          ▼
                        </button>
                      </div>
                    )}
                    <button
                      onClick={() => setPreviewAd(ad)}
                      className="px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-xl transition-colors flex items-center gap-1 text-[11px] cursor-pointer"
                      title="লাইভ প্রিভিউ দেখুন"
                    >
                      <Eye className="w-3.5 h-3.5" /> প্রিভিউ
                    </button>
                    <button
                      onClick={() => handleDuplicateAd(ad)}
                      className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-xl transition-colors text-[11px] cursor-pointer"
                      title="ডুপ্লিকেট ব্যানার"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => openEditModal(ad)}
                      className="flex-1 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors flex items-center justify-center gap-1 text-[11px] cursor-pointer"
                    >
                      <Edit className="w-3.5 h-3.5" /> এডিট
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`আপনি কি "${ad.title}" বিজ্ঞাপনটি মুছে ফেলতে চান?`)) {
                          deleteAdvertisement(ad.id);
                          addToast(`Deleted campaign "${ad.title}"`, "info");
                        }
                      }}
                      className="py-1.5 px-2 bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold rounded-xl transition-colors flex items-center justify-center gap-1 text-[11px] cursor-pointer"
                      title="মুছে ফেলুন"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CREATE / EDIT CAMPAIGN MODAL (With Live Side-by-Side Responsive Preview) */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-4xl w-full rounded-3xl p-6 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                <Megaphone className="w-5 h-5 text-indigo-600" />
                <span>
                  {editingAd ? "বিজ্ঞাপন ক্যাম্পেইন এডিট করুন" : "নতুন প্রমোশনাল ব্যানার তৈরি করুন"}
                </span>
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Curated One-Click Presets */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
              <span className="text-[11px] font-bold text-slate-600 block flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" /> দ্রুত ব্যানার প্রিসেট সিলেক্ট করুন (One-Click Auto Fill):
              </span>
              <div className="flex flex-wrap gap-1.5">
                {CURATED_BANNER_PRESETS.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setTitle(p.title);
                      setDescription(p.desc);
                      setMediaUrl(p.url);
                      setOfferBadge(p.badge as any);
                    }}
                    className="px-2.5 py-1 bg-white hover:bg-indigo-50 border border-slate-200 text-slate-800 text-[11px] font-semibold rounded-lg transition-colors cursor-pointer"
                  >
                    {p.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Live Responsive Preview Card Inside Modal */}
            <div className="bg-slate-900 rounded-2xl p-4 border border-slate-800 text-white space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-indigo-400 flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5" /> লাইভ ব্যানার প্রিভিউ (Live Preview)
                </span>
                <div className="flex bg-slate-800 p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setModalPreviewDevice("desktop")}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 ${
                      modalPreviewDevice === "desktop"
                        ? "bg-indigo-600 text-white"
                        : "text-slate-400"
                    }`}
                  >
                    <Laptop className="w-3 h-3" /> ডেস্কটপ (Desktop)
                  </button>
                  <button
                    type="button"
                    onClick={() => setModalPreviewDevice("mobile")}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 ${
                      modalPreviewDevice === "mobile"
                        ? "bg-indigo-600 text-white"
                        : "text-slate-400"
                    }`}
                  >
                    <Smartphone className="w-3 h-3" /> মোবাইল (Mobile)
                  </button>
                </div>
              </div>

              {/* Mockup Display */}
              <div
                className={`relative mx-auto rounded-2xl overflow-hidden border border-slate-700 transition-all ${
                  modalPreviewDevice === "desktop" ? "w-full h-44 sm:h-52" : "w-72 h-48"
                }`}
              >
                <img
                  src={mediaUrl || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1200&q=80"}
                  alt=""
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-slate-950/85 via-slate-950/40 to-transparent p-5 flex flex-col justify-center max-w-md space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 bg-amber-400 text-slate-950 text-[10px] font-black uppercase rounded-full">
                      {offerBadge}
                    </span>
                    {couponCode && (
                      <span className="px-2 py-0.5 bg-indigo-900/80 border border-indigo-400/50 text-indigo-200 text-[10px] font-mono font-bold rounded-full">
                        কোড: {couponCode}
                      </span>
                    )}
                  </div>
                  <h4 className="text-white font-extrabold text-sm sm:text-base leading-tight line-clamp-2">
                    {title || "ব্যানার টাইটেল এখানে প্রদর্শিত হবে"}
                  </h4>
                  <p className="text-slate-300 text-[11px] line-clamp-2">
                    {description || "ক্যাম্পেইনের ডেসক্রিপশন এখানে দেখা যাবে..."}
                  </p>
                  <div>
                    <span className="inline-block px-3 py-1 bg-indigo-600 text-white text-[10px] font-bold rounded-lg shadow-sm">
                      {buttonText || "Shop Now"} →
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Form Fields */}
            <form onSubmit={handleSaveAd} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">ক্যাম্পেইন টাইটেল *</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="যেমন: গ্র্যান্ড ফেস্টিভ্যাল মেগা অফার"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-semibold"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">বিজ্ঞাপনের প্লেসমেন্ট টাইপ</label>
                  <select
                    value={type}
                    onChange={(e: any) => setType(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none font-semibold"
                  >
                    <option value="slider">হোমপেজ স্লাইডার ব্যানার (Hero Slider)</option>
                    <option value="popup">ওয়েবসাইট পপ-আপ অফার (Visitor Popup)</option>
                    <option value="campaign">স্পেশাল অফার ক্যাম্পেইন পেজ (Deal Page)</option>
                    <option value="video">প্রমোশনাল ভিডিও এড (Video Ad)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">সংক্ষিপ্ত ডেসক্রিপশন</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="ছাড় ও আকর্ষণীয় অফারের বিস্তারিত লিখুন..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">মিডিয়া টাইপ</label>
                  <select
                    value={mediaType}
                    onChange={(e: any) => setMediaType(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                  >
                    <option value="image">প্রমোশনাল ইমেজ (Image)</option>
                    <option value="video">ভিডিও স্ট্রিম (MP4)</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">ব্যানার ইমেজ URL *</label>
                  <input
                    type="text"
                    required
                    value={mediaUrl}
                    onChange={(e) => setMediaUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none font-mono"
                  />
                </div>
              </div>

              {mediaType === "video" && (
                <div>
                  <label className="font-bold text-slate-700 block mb-1">ভিডিও লিংক URL (.mp4)</label>
                  <input
                    type="text"
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    placeholder="https://...mp4"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none font-mono"
                  />
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">অফার ব্যাজ ট্যাগ</label>
                  <select
                    value={offerBadge}
                    onChange={(e: any) => setOfferBadge(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold text-amber-700"
                  >
                    <option value="FLASH SALE">FLASH SALE (ফ্ল্যাশ সেল)</option>
                    <option value="HOT">HOT (জনপ্রিয়)</option>
                    <option value="NEW">NEW (নতুন)</option>
                    <option value="LIMITED TIME">LIMITED TIME (সীমিত সময়)</option>
                    <option value="FESTIVAL">FESTIVAL (উৎসব স্পেশাল)</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">কুপন কোড (ঐচ্ছিক)</label>
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    placeholder="যেমন: EID2026"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono uppercase outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">বাটন টেক্সট</label>
                  <input
                    type="text"
                    value={buttonText}
                    onChange={(e) => setButtonText(e.target.value)}
                    placeholder="Shop Now"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">ডিসপ্লে ক্রমানুসার (Priority)</label>
                  <input
                    type="number"
                    min={1}
                    value={priority}
                    onChange={(e) => setPriority(parseInt(e.target.value) || 1)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">শুরুর তারিখ</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">শেষের তারিখ</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">শর্তাবলি (Terms & Conditions)</label>
                <textarea
                  rows={2}
                  value={termsConditions}
                  onChange={(e) => setTermsConditions(e.target.value)}
                  placeholder="ভাউচার ব্যবহারের শর্ত..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="adActive"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 rounded border-slate-300 cursor-pointer"
                />
                <label htmlFor="adActive" className="font-bold text-slate-800 cursor-pointer">
                  তৎক্ষণাৎ পাবলিশ করুন ও সক্রিয় রাখুন (Enable & Publish)
                </label>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md cursor-pointer"
                >
                  সেভ ও পাবলিশ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* LIVE AD PREVIEW MODAL */}
      {previewAd && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 max-w-2xl w-full rounded-3xl p-6 shadow-2xl text-white space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-indigo-400" />
                <h3 className="font-extrabold text-sm">ব্যানার লাইভ প্রিভিউ (Customer Storefront View)</h3>
              </div>
              <button
                onClick={() => setPreviewAd(null)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="relative rounded-2xl overflow-hidden border border-slate-700 h-64 sm:h-72">
              <img
                src={previewAd.mediaUrl}
                alt={previewAd.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/40 to-transparent p-6 flex flex-col justify-center max-w-md space-y-2.5">
                <div className="flex items-center gap-2">
                  {previewAd.offerBadge && (
                    <span className="px-2.5 py-0.5 bg-amber-400 text-slate-950 text-[10px] font-black uppercase rounded-full">
                      {previewAd.offerBadge}
                    </span>
                  )}
                  {previewAd.couponCode && (
                    <span className="px-2.5 py-0.5 bg-indigo-900/90 border border-indigo-400/50 text-indigo-200 text-[10px] font-mono font-bold rounded-full">
                      কুপন: {previewAd.couponCode}
                    </span>
                  )}
                </div>

                <h3 className="text-xl font-extrabold text-white leading-tight">
                  {previewAd.title}
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {previewAd.description}
                </p>

                <div>
                  <button
                    onClick={() => {
                      setPreviewAd(null);
                      addToast(`Clicked banner CTA "${previewAd.buttonText}"`, "info");
                    }}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition-colors inline-flex items-center gap-1.5"
                  >
                    {previewAd.buttonText} →
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center text-xs pt-2 border-t border-slate-800 text-slate-400">
              <div>
                <span className="block text-[10px]">মোট ভিউজ</span>
                <strong className="text-white font-mono">{previewAd.views.toLocaleString()}</strong>
              </div>
              <div>
                <span className="block text-[10px]">মোট ক্লিকস</span>
                <strong className="text-indigo-400 font-mono">{previewAd.clicks.toLocaleString()}</strong>
              </div>
              <div>
                <span className="block text-[10px]">মোট কনভার্সন</span>
                <strong className="text-emerald-400 font-mono">{previewAd.conversions.toLocaleString()}</strong>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* EXCEL IMPORT MODAL */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-lg w-full rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-emerald-600" /> এক্সেল বা CSV ফাইল থেকে ব্যানার ইমপোর্ট
              </h3>
              <button
                onClick={() => setShowImportModal(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              একসাথে একাধিক ব্যানার আপলোড করতে আপনার তৈরি করা Excel (.xlsx) অথবা CSV ফাইল আপলোড করুন। কলামসমূহ: Title, Description, Type, Media URL, Badge, Coupon Code, Priority।
            </p>

            <div className="border-2 border-dashed border-slate-300 rounded-2xl p-6 flex flex-col items-center justify-center space-y-2 bg-slate-50">
              <Upload className="w-8 h-8 text-indigo-500" />
              <label className="cursor-pointer font-bold text-xs text-indigo-600 hover:text-indigo-700">
                <span>ফাইল সিলেক্ট করুন (.xlsx বা .csv)</span>
                <input
                  type="file"
                  accept=".xlsx,.csv"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) setImportFile(f);
                  }}
                  className="hidden"
                />
              </label>
              {importFile && (
                <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                  {importFile.name} ({(importFile.size / 1024).toFixed(1)} KB)
                </span>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowImportModal(false)}
                className="px-4 py-2 bg-slate-100 text-slate-700 font-bold text-xs rounded-xl"
              >
                বাতিল
              </button>
              <button
                type="button"
                disabled={!importFile || importing}
                onClick={handleExecuteImport}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-xs"
              >
                {importing ? "ইমপোর্ট হচ্ছে..." : "ইমপোর্ট সম্পন্ন করুন"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
