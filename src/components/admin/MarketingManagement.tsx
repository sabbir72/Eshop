import React, { useState, useMemo } from "react";
import { useStore } from "../../context/StoreContext";
import { Advertisement } from "../../types";
import { exportToCSV, exportToExcel, exportToPDFReport, parseExcelOrCSVFile } from "../../utils/exportUtils";
import {
  Megaphone,
  Plus,
  Search,
  Filter,
  Download,
  Upload,
  FileSpreadsheet,
  FileText,
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
} from "lucide-react";

export const MarketingManagement: React.FC = () => {
  const {
    advertisements,
    addAdvertisement,
    updateAdvertisement,
    deleteAdvertisement,
    hasPermission,
    addToast,
    products,
  } = useStore();

  const [activeSubTab, setActiveSubTab] = useState<
    "slider" | "popup" | "campaign" | "video" | "coupons" | "analytics"
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
  const [offerBadge, setOfferBadge] = useState<"NEW" | "HOT" | "LIMITED TIME" | "FLASH SALE" | "FESTIVAL">("FLASH SALE");
  const [couponCode, setCouponCode] = useState("");
  const [countdownEnd, setCountdownEnd] = useState("");
  const [buttonText, setButtonText] = useState("Shop Now");
  const [buttonLink, setButtonLink] = useState("products");
  const [priority, setPriority] = useState(1);
  const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0]);
  const [endDate, setEndDate] = useState("2026-12-31");
  const [isActive, setIsActive] = useState(true);
  const [termsConditions, setTermsConditions] = useState("");

  // Live Slide Preview State
  const [previewAd, setPreviewAd] = useState<Advertisement | null>(null);

  // Excel / CSV Import Modal State
  const [showImportModal, setShowImportModal] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);

  // Helper to reorder priority
  const handleMovePriority = (adId: string, direction: "up" | "down") => {
    const sliderAds = advertisements.filter((a) => a.type === "slider").sort((a, b) => a.priority - b.priority);
    const index = sliderAds.findIndex((a) => a.id === adId);
    if (index === -1) return;

    if (direction === "up" && index > 0) {
      const prevAd = sliderAds[index - 1];
      updateAdvertisement(adId, { priority: prevAd.priority });
      updateAdvertisement(prevAd.id, { priority: sliderAds[index].priority });
      addToast(`Moved slide "${sliderAds[index].title}" up in priority.`, "info");
    } else if (direction === "down" && index < sliderAds.length - 1) {
      const nextAd = sliderAds[index + 1];
      updateAdvertisement(adId, { priority: nextAd.priority });
      updateAdvertisement(nextAd.id, { priority: sliderAds[index].priority });
      addToast(`Moved slide "${sliderAds[index].title}" down in priority.`, "info");
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
    setType(forcedType || (activeSubTab === "analytics" ? "slider" : activeSubTab));
    setMediaType("image");
    setMediaUrl("https://images.unsplash.com/photo-1512499617640-c74ae3a79d37?w=1200&q=80");
    setVideoUrl("");
    setOfferBadge("FLASH SALE");
    setCouponCode("");
    setCountdownEnd("");
    setButtonText("Shop Now");
    setButtonLink("products");
    setPriority(1);
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

  // Export Analytics to CSV
  const handleExportCSV = () => {
    const exportRows = advertisements.map((ad) => ({
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
      Conversions: ad.conversions,
    }));

    exportToCSV("marketing_campaigns_export", exportRows);
    addToast("Exported campaign report to CSV", "success");
  };

  // Bulk Excel Import
  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportFile(file);
  };

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
            mediaUrl: String(row["Media URL"] || row["mediaUrl"] || "https://images.unsplash.com/photo-1512499617640-c74ae3a79d37?w=1200&q=80"),
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

  return (
    <div className="space-y-6 text-left">
      {/* Header Banner */}
      <div className="bg-[#0F172A] p-6 rounded-3xl border border-slate-800 text-white shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Megaphone className="w-6 h-6 text-indigo-400" />
            <h1 className="text-xl font-extrabold tracking-tight">Marketing & Advertisement System</h1>
          </div>
          <p className="text-xs text-slate-400 max-w-2xl">
            Manage Homepage Promotional Sliders, Visitor Popups, Video Ads, Festival Campaigns, and Campaign Performance Analytics.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleExportExcel}
            className="bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl border border-slate-700 flex items-center gap-1.5 transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" /> Export Excel
          </button>
          <button
            onClick={() => setShowImportModal(true)}
            className="bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl border border-slate-700 flex items-center gap-1.5 transition-colors"
          >
            <Upload className="w-4 h-4 text-sky-400" /> Import Banners
          </button>
          <button
            onClick={() => openCreateModal()}
            className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-md transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> Create Advertisement
          </button>
        </div>
      </div>

      {/* Navigation Subtabs */}
      <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-2xs flex flex-wrap gap-1">
        <button
          onClick={() => setActiveSubTab("slider")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeSubTab === "slider" ? "bg-indigo-600 text-white shadow-xs" : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <ImageIcon className="w-4 h-4" />
          <span>Homepage Slider</span>
          <span className="ml-1 px-1.5 py-0.2 bg-white/20 text-white text-[10px] rounded-md font-mono">
            {advertisements.filter((a) => a.type === "slider").length}
          </span>
        </button>

        <button
          onClick={() => setActiveSubTab("popup")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeSubTab === "popup" ? "bg-indigo-600 text-white shadow-xs" : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>Popup Ads</span>
          <span className="ml-1 px-1.5 py-0.2 bg-white/20 text-white text-[10px] rounded-md font-mono">
            {advertisements.filter((a) => a.type === "popup").length}
          </span>
        </button>

        <button
          onClick={() => setActiveSubTab("campaign")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeSubTab === "campaign" ? "bg-indigo-600 text-white shadow-xs" : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <Flame className="w-4 h-4 text-rose-400" />
          <span>Offer Campaigns</span>
        </button>

        <button
          onClick={() => setActiveSubTab("video")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeSubTab === "video" ? "bg-indigo-600 text-white shadow-xs" : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <Video className="w-4 h-4" />
          <span>Promotional Videos</span>
        </button>

        <button
          onClick={() => setActiveSubTab("analytics")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeSubTab === "analytics" ? "bg-indigo-600 text-white shadow-xs" : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <BarChart3 className="w-4 h-4 text-emerald-400" />
          <span>Banner Analytics</span>
        </button>
      </div>

      {/* Main Content Area */}
      {activeSubTab === "analytics" ? (
        /* Analytics View */
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Total Ad Impressions</span>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-black text-slate-900">
                  {advertisements.reduce((acc, a) => acc + a.views, 0).toLocaleString()}
                </span>
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" /> +18%
                </span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Total Clicks</span>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-black text-slate-900">
                  {advertisements.reduce((acc, a) => acc + a.clicks, 0).toLocaleString()}
                </span>
                <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                  Click Engagement
                </span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Avg. Click Through Rate (CTR)</span>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-black text-indigo-600">
                  {advertisements.reduce((acc, a) => acc + a.views, 0) > 0
                    ? (
                        (advertisements.reduce((acc, a) => acc + a.clicks, 0) /
                          advertisements.reduce((acc, a) => acc + a.views, 0)) *
                        100
                      ).toFixed(2) + "%"
                    : "0%"}
                </span>
                <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md">
                  High Performing
                </span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Conversions</span>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-black text-emerald-600">
                  {advertisements.reduce((acc, a) => acc + a.conversions, 0).toLocaleString()}
                </span>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                  Completed Sales
                </span>
              </div>
            </div>
          </div>

          {/* Detailed Analytics Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm">Campaign Performance Benchmark</h3>
              <button
                onClick={handleExportExcel}
                className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
              >
                <FileSpreadsheet className="w-4 h-4" /> Export Analytics Excel
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="p-3">Campaign / Banner Title</th>
                    <th className="p-3">Type</th>
                    <th className="p-3 text-right">Views (Impressions)</th>
                    <th className="p-3 text-right">Clicks</th>
                    <th className="p-3 text-right">CTR (%)</th>
                    <th className="p-3 text-right">Conversions</th>
                    <th className="p-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {advertisements.map((ad) => {
                    const ctr = ad.views > 0 ? ((ad.clicks / ad.views) * 100).toFixed(2) : "0.00";
                    return (
                      <tr key={ad.id} className="hover:bg-slate-50">
                        <td className="p-3 font-bold text-slate-900">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                            <span>{ad.title}</span>
                          </div>
                        </td>
                        <td className="p-3 capitalize text-slate-600">{ad.type}</td>
                        <td className="p-3 text-right font-mono font-semibold text-slate-800">{ad.views.toLocaleString()}</td>
                        <td className="p-3 text-right font-mono font-semibold text-slate-800">{ad.clicks.toLocaleString()}</td>
                        <td className="p-3 text-right font-mono font-extrabold text-indigo-600">{ctr}%</td>
                        <td className="p-3 text-right font-mono font-bold text-emerald-600">{ad.conversions.toLocaleString()}</td>
                        <td className="p-3 text-center">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              ad.isActive ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-600"
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
      ) : (
        /* Advertisement List Table */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs space-y-4 p-4">
          {/* Controls Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div className="relative flex-1 min-w-[240px]">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search campaign title, description, coupon..."
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={statusFilter}
                onChange={(e: any) => setStatusFilter(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 outline-none"
              >
                <option value="All">All Statuses</option>
                <option value="Active">Active Only</option>
                <option value="Inactive">Inactive Only</option>
              </select>

              <button
                onClick={() => openCreateModal()}
                className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add New Banner
              </button>
            </div>
          </div>

          {/* Cards / Table Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAds.map((ad) => (
              <div
                key={ad.id}
                className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                {/* Media Preview */}
                <div className="relative h-44 bg-slate-900">
                  {ad.mediaType === "video" && ad.videoUrl ? (
                    <video src={ad.videoUrl} className="w-full h-full object-cover" muted loop autoPlay />
                  ) : (
                    <img
                      src={ad.mediaUrl || "https://images.unsplash.com/photo-1512499617640-c74ae3a79d37?w=800&q=80"}
                      alt={ad.title}
                      className="w-full h-full object-cover"
                    />
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent"></div>

                  <div className="absolute top-2 left-2 flex items-center gap-1.5">
                    {ad.offerBadge && (
                      <span className="px-2.5 py-0.5 bg-amber-400 text-slate-950 font-black text-[9px] uppercase rounded-full shadow-xs">
                        {ad.offerBadge}
                      </span>
                    )}
                    <span className="px-2 py-0.5 bg-slate-900/80 text-white font-bold text-[9px] uppercase rounded-full border border-white/20">
                      Priority: {ad.priority}
                    </span>
                  </div>

                  <div className="absolute top-2 right-2">
                    <button
                      onClick={() => updateAdvertisement(ad.id, { isActive: !ad.isActive })}
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                        ad.isActive
                          ? "bg-emerald-500 text-white border-emerald-400"
                          : "bg-slate-700 text-slate-300 border-slate-600"
                      }`}
                    >
                      {ad.isActive ? "Active" : "Disabled"}
                    </button>
                  </div>

                  <div className="absolute bottom-2 left-3 right-3 text-white">
                    <h3 className="font-bold text-sm truncate">{ad.title}</h3>
                  </div>
                </div>

                {/* Body details */}
                <div className="p-4 space-y-3 text-xs flex-1 flex flex-col justify-between">
                  <p className="text-slate-600 line-clamp-2">{ad.description}</p>

                  <div className="space-y-1.5 text-[11px] text-slate-500 pt-2 border-t border-slate-100">
                    {ad.couponCode && (
                      <div className="flex items-center justify-between bg-slate-50 p-2 rounded-lg font-mono font-bold text-indigo-900">
                        <span>Coupon: {ad.couponCode}</span>
                        <Tag className="w-3.5 h-3.5 text-indigo-600" />
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <span>Schedule:</span>
                      <span className="font-semibold text-slate-800">
                        {ad.startDate} to {ad.endDate}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Performance:</span>
                      <span className="font-bold text-slate-800">
                        {ad.views.toLocaleString()} views | {ad.clicks.toLocaleString()} clicks
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-2 flex items-center justify-between gap-1.5 border-t border-slate-100">
                    {ad.type === "slider" && (
                      <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                        <button
                          onClick={() => handleMovePriority(ad.id, "up")}
                          className="px-2 py-1 bg-white hover:bg-slate-200 text-slate-800 font-bold rounded-lg text-[10px] shadow-2xs"
                          title="Increase Priority Rank (Move Up)"
                        >
                          ▲
                        </button>
                        <button
                          onClick={() => handleMovePriority(ad.id, "down")}
                          className="px-2 py-1 bg-white hover:bg-slate-200 text-slate-800 font-bold rounded-lg text-[10px] shadow-2xs"
                          title="Decrease Priority Rank (Move Down)"
                        >
                          ▼
                        </button>
                      </div>
                    )}
                    <button
                      onClick={() => setPreviewAd(ad)}
                      className="px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-xl transition-colors flex items-center gap-1 text-[11px]"
                      title="Preview Slide Layout"
                    >
                      <Eye className="w-3.5 h-3.5" /> Preview
                    </button>
                    <button
                      onClick={() => openEditModal(ad)}
                      className="flex-1 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors flex items-center justify-center gap-1 text-[11px]"
                    >
                      <Edit className="w-3.5 h-3.5" /> Edit
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Are you sure you want to delete advertisement "${ad.title}"?`)) {
                          deleteAdvertisement(ad.id);
                        }
                      }}
                      className="py-1.5 px-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold rounded-xl transition-colors flex items-center justify-center gap-1 text-[11px]"
                      title="Delete Campaign"
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

      {/* Add / Edit Advertisement Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-2xl w-full rounded-3xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                <Megaphone className="w-5 h-5 text-indigo-600" />
                <span>{editingAd ? "Edit Advertisement Campaign" : "Create New Advertisement"}</span>
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAd} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Campaign Title *</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Grand Festival Flash Sale"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Advertisement Placement Type</label>
                  <select
                    value={type}
                    onChange={(e: any) => setType(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                  >
                    <option value="slider">Homepage Banner Slider</option>
                    <option value="popup">Website Popup Advertisement</option>
                    <option value="campaign">Offer Campaign Page</option>
                    <option value="video">Promotional Video</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Short Description</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Summarize the offer discount and highlights..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Media Type</label>
                  <select
                    value={mediaType}
                    onChange={(e: any) => setMediaType(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                  >
                    <option value="image">Promotional Image</option>
                    <option value="video">Promotional Video (MP4)</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Media Banner Image URL *</label>
                  <input
                    type="text"
                    required
                    value={mediaUrl}
                    onChange={(e) => setMediaUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                  />
                </div>
              </div>

              {mediaType === "video" && (
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Video Stream URL (.mp4)</label>
                  <input
                    type="text"
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    placeholder="https://www.w3schools.com/html/mov_bbb.mp4"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                  />
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Offer Badge Tag</label>
                  <select
                    value={offerBadge}
                    onChange={(e: any) => setOfferBadge(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                  >
                    <option value="FLASH SALE">FLASH SALE</option>
                    <option value="HOT">HOT</option>
                    <option value="NEW">NEW</option>
                    <option value="LIMITED TIME">LIMITED TIME</option>
                    <option value="FESTIVAL">FESTIVAL</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Coupon Code (Optional)</label>
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    placeholder="e.g. SUMMER50"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono uppercase outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Display Priority Order</label>
                  <input
                    type="number"
                    min={1}
                    value={priority}
                    onChange={(e) => setPriority(parseInt(e.target.value) || 1)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Start Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">End Date</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Terms & Conditions</label>
                <textarea
                  rows={2}
                  value={termsConditions}
                  onChange={(e) => setTermsConditions(e.target.value)}
                  placeholder="Terms for voucher usage, eligibility, etc."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="adActive"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 rounded border-slate-300"
                />
                <label htmlFor="adActive" className="font-bold text-slate-800 cursor-pointer">
                  Enable & Publish Campaign Immediately
                </label>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md"
                >
                  Save & Publish Campaign
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Import Banners Excel / CSV Modal */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-lg w-full rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-emerald-600" /> Import Advertisements (Excel / CSV)
              </h3>
              <button onClick={() => setShowImportModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="border-2 border-dashed border-slate-300 rounded-2xl p-6 text-center hover:border-indigo-500 transition-colors">
                <p className="font-bold text-slate-800 mb-1">Select Excel (.xlsx) or CSV File</p>
                <input
                  type="file"
                  accept=".xlsx, .xls, .csv"
                  onChange={handleImportFile}
                  className="text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-end gap-2">
                <button
                  onClick={() => setShowImportModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  disabled={!importFile || importing}
                  onClick={handleExecuteImport}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md disabled:opacity-50"
                >
                  {importing ? "Importing..." : "Upload & Process"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Full Interactive Slide Preview Modal */}
      {previewAd && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-3xl w-full rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-indigo-600" />
                <h3 className="font-extrabold text-slate-900 text-sm">
                  Live Homepage Hero Slider Preview
                </h3>
              </div>
              <button onClick={() => setPreviewAd(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="relative rounded-2xl overflow-hidden bg-slate-950 text-white min-h-[300px] sm:min-h-[340px] flex items-center shadow-xl border border-slate-800">
              {previewAd.mediaType === "video" && previewAd.videoUrl ? (
                <video src={previewAd.videoUrl} autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover opacity-75" />
              ) : (
                <img src={previewAd.mediaUrl} alt={previewAd.title} className="absolute inset-0 w-full h-full object-cover opacity-75" />
              )}
              <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-950/70 to-transparent"></div>

              <div className="relative p-6 sm:p-8 space-y-3 max-w-lg z-10">
                <div className="flex items-center gap-2">
                  {previewAd.offerBadge && (
                    <span className="px-3 py-1 bg-amber-400 text-slate-950 font-black text-[10px] uppercase rounded-full shadow-md flex items-center gap-1">
                      <Flame className="w-3.5 h-3.5 text-rose-600" />
                      {previewAd.offerBadge}
                    </span>
                  )}
                  <span className="text-[11px] font-bold uppercase tracking-wider text-sky-300">
                    Priority Rank #{previewAd.priority}
                  </span>
                </div>

                <h1 className="text-xl sm:text-2xl font-black tracking-tight leading-tight">{previewAd.title}</h1>
                <p className="text-xs text-slate-200 line-clamp-2 leading-relaxed">{previewAd.description}</p>

                {previewAd.couponCode && (
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-900/80 border border-indigo-400/40 rounded-xl text-xs font-mono font-bold text-amber-300">
                    <span>Voucher Code: {previewAd.couponCode}</span>
                    <Copy className="w-3.5 h-3.5 cursor-pointer" />
                  </div>
                )}

                <div className="pt-2 flex items-center gap-2">
                  <button className="bg-indigo-600 text-white text-xs font-bold px-5 py-2.5 rounded-xl flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    <span>{previewAd.buttonText || "Shop Now"}</span>
                  </button>
                  <button className="bg-white/10 text-white text-xs font-bold px-4 py-2.5 rounded-xl border border-white/20">
                    Learn More
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs space-y-1">
              <p className="font-bold text-slate-800">Campaign Details & Schedule:</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-slate-600 pt-1">
                <div>Type: <strong className="text-slate-900">{previewAd.type}</strong></div>
                <div>Status: <strong className={previewAd.isActive ? "text-emerald-600" : "text-rose-600"}>{previewAd.isActive ? "Active" : "Disabled"}</strong></div>
                <div>Start: <strong className="text-slate-900">{previewAd.startDate}</strong></div>
                <div>End: <strong className="text-slate-900">{previewAd.endDate}</strong></div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setPreviewAd(null)}
                className="px-5 py-2 bg-slate-900 text-white font-bold rounded-xl text-xs"
              >
                Close Live Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
