import React, { useState } from "react";
import { useStore } from "../../context/StoreContext";
import { SecurityLabel, HomeBanner } from "../../types";
import {
  ShieldCheck,
  Plus,
  Trash2,
  Edit,
  Power,
  Lock,
  Shield,
  CheckCircle2,
  CreditCard,
  Award,
  RotateCcw,
  PackageCheck,
  Truck,
  Star,
  Headphones,
  Globe,
  Search,
  Check,
  X,
  Image,
  Calendar,
  ExternalLink,
} from "lucide-react";

export const SecurityLabelManagement: React.FC = () => {
  const {
    securityLabels,
    addSecurityLabel,
    updateSecurityLabel,
    deleteSecurityLabel,
    toggleSecurityLabelActive,
    homeBanners,
    addHomeBanner,
    updateHomeBanner,
    deleteHomeBanner,
    addToast,
  } = useStore();

  const [activeTab, setActiveTab] = useState<"security" | "banners">("security");

  // Security Label State
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPlacement, setFilterPlacement] = useState<"all" | "footer" | "checkout">("all");
  const [isLabelModalOpen, setIsLabelModalOpen] = useState(false);
  const [editingLabel, setEditingLabel] = useState<SecurityLabel | null>(null);

  const [labelTitle, setLabelTitle] = useState("");
  const [labelDescription, setLabelDescription] = useState("");
  const [labelIcon, setLabelIcon] = useState("ShieldCheck");
  const [labelPlacement, setLabelPlacement] = useState<("footer" | "checkout" | "product_page")[]>([
    "footer",
    "checkout",
  ]);
  const [labelOrder, setLabelOrder] = useState(1);
  const [labelIsActive, setLabelIsActive] = useState(true);

  // Banner State
  const [isBannerModalOpen, setIsBannerModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<HomeBanner | null>(null);
  const [bannerTitle, setBannerTitle] = useState("");
  const [bannerSubtitle, setBannerSubtitle] = useState("");
  const [bannerImage, setBannerImage] = useState("");
  const [bannerButtonText, setBannerButtonText] = useState("");
  const [bannerButtonLink, setBannerButtonLink] = useState("");
  const [bannerBgGradient, setBannerBgGradient] = useState("from-indigo-900 via-indigo-950 to-slate-900");
  const [bannerIsActive, setBannerIsActive] = useState(true);
  const [bannerExpiry, setBannerExpiry] = useState("");

  const availableIcons = [
    "Lock",
    "ShieldCheck",
    "Shield",
    "CheckCircle2",
    "CreditCard",
    "Award",
    "RefreshCw",
    "PackageCheck",
    "Truck",
    "Star",
    "Headphones",
    "Globe",
  ];

  const filteredLabels = securityLabels
    .filter((l) => {
      const matchesSearch =
        l.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesPlacement =
        filterPlacement === "all" ? true : l.pagePlacement.includes(filterPlacement as any);
      return matchesSearch && matchesPlacement;
    })
    .sort((a, b) => a.displayOrder - b.displayOrder);

  const handleOpenLabelModal = (label?: SecurityLabel) => {
    if (label) {
      setEditingLabel(label);
      setLabelTitle(label.title);
      setLabelDescription(label.description);
      setLabelIcon(label.iconName);
      setLabelPlacement(label.pagePlacement);
      setLabelOrder(label.displayOrder);
      setLabelIsActive(label.isActive);
    } else {
      setEditingLabel(null);
      setLabelTitle("");
      setLabelDescription("");
      setLabelIcon("ShieldCheck");
      setLabelPlacement(["footer", "checkout"]);
      setLabelOrder(securityLabels.length + 1);
      setLabelIsActive(true);
    }
    setIsLabelModalOpen(true);
  };

  const handleSaveLabel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!labelTitle.trim() || !labelDescription.trim()) {
      addToast("Title and Description are required!", "error");
      return;
    }

    if (editingLabel) {
      updateSecurityLabel(editingLabel.id, {
        title: labelTitle,
        description: labelDescription,
        iconName: labelIcon,
        pagePlacement: labelPlacement,
        displayOrder: Number(labelOrder),
        isActive: labelIsActive,
      });
    } else {
      addSecurityLabel({
        title: labelTitle,
        description: labelDescription,
        iconName: labelIcon,
        pagePlacement: labelPlacement,
        displayOrder: Number(labelOrder),
        isActive: labelIsActive,
      });
    }
    setIsLabelModalOpen(false);
  };

  const handleOpenBannerModal = (banner?: HomeBanner) => {
    if (banner) {
      setEditingBanner(banner);
      setBannerTitle(banner.title);
      setBannerSubtitle(banner.subtitle);
      setBannerImage(banner.imageUrl);
      setBannerButtonText(banner.buttonText);
      setBannerButtonLink(banner.buttonLink);
      setBannerBgGradient(banner.bgGradient || "from-indigo-900 via-indigo-950 to-slate-900");
      setBannerIsActive(banner.isActive ?? true);
      setBannerExpiry(banner.expiryDate || "");
    } else {
      setEditingBanner(null);
      setBannerTitle("");
      setBannerSubtitle("");
      setBannerImage("https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1200&q=80");
      setBannerButtonText("Shop Now");
      setBannerButtonLink("#products");
      setBannerBgGradient("from-indigo-900 via-indigo-950 to-slate-900");
      setBannerIsActive(true);
      setBannerExpiry("");
    }
    setIsBannerModalOpen(true);
  };

  const handleSaveBanner = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bannerTitle.trim() || !bannerImage.trim()) {
      addToast("Title and Image URL are required!", "error");
      return;
    }

    if (editingBanner) {
      updateHomeBanner(editingBanner.id, {
        title: bannerTitle,
        subtitle: bannerSubtitle,
        imageUrl: bannerImage,
        buttonText: bannerButtonText,
        buttonLink: bannerButtonLink,
        bgGradient: bannerBgGradient,
        isActive: bannerIsActive,
        expiryDate: bannerExpiry || undefined,
      });
    } else {
      addHomeBanner({
        title: bannerTitle,
        subtitle: bannerSubtitle,
        imageUrl: bannerImage,
        buttonText: bannerButtonText,
        buttonLink: bannerButtonLink,
        bgGradient: bannerBgGradient,
        isActive: bannerIsActive,
        expiryDate: bannerExpiry || undefined,
      });
    }
    setIsBannerModalOpen(false);
  };

  const togglePlacement = (placement: "footer" | "checkout" | "product_page") => {
    if (labelPlacement.includes(placement)) {
      if (labelPlacement.length === 1) {
        addToast("At least one page placement must be selected!", "warning");
        return;
      }
      setLabelPlacement(labelPlacement.filter((p) => p !== placement));
    } else {
      setLabelPlacement([...labelPlacement, placement]);
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* CMS Header */}
      <div className="bg-slate-900 text-white p-6 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-emerald-400" /> Security Labels & CMS Manager
          </h1>
          <p className="text-xs text-slate-300">
            Manage storefront trust badges, SSL security certificates, and homepage hero promotional banners
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-slate-800 p-1 rounded-xl border border-slate-700 text-xs font-bold">
          <button
            onClick={() => setActiveTab("security")}
            className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTab === "security" ? "bg-indigo-600 text-white shadow-xs" : "text-slate-400 hover:text-white"
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Security Labels ({securityLabels.length})</span>
          </button>
          <button
            onClick={() => setActiveTab("banners")}
            className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTab === "banners" ? "bg-indigo-600 text-white shadow-xs" : "text-slate-400 hover:text-white"
            }`}
          >
            <Image className="w-4 h-4" />
            <span>Hero Banners ({homeBanners.length})</span>
          </button>
        </div>
      </div>

      {/* Security Labels Section */}
      {activeTab === "security" && (
        <div className="space-y-4">
          {/* Controls Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              {/* Search Bar */}
              <div className="relative flex-1 sm:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search labels by title..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl pl-9 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Filter Placement */}
              <select
                value={filterPlacement}
                onChange={(e) => setFilterPlacement(e.target.value as any)}
                className="bg-slate-50 border border-slate-200 text-xs rounded-xl px-3 py-2 focus:outline-none font-bold"
              >
                <option value="all">All Placements</option>
                <option value="footer">Footer Only</option>
                <option value="checkout">Checkout Only</option>
              </select>
            </div>

            <button
              onClick={() => handleOpenLabelModal()}
              className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl flex items-center justify-center gap-1.5 shadow-md transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Add Security Label</span>
            </button>
          </div>

          {/* Security Labels Grid / Table */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 font-bold text-slate-700 uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3.5 px-4">Order</th>
                    <th className="py-3.5 px-4">Label Title & Description</th>
                    <th className="py-3.5 px-4">Icon</th>
                    <th className="py-3.5 px-4">Page Placements</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredLabels.map((label) => (
                    <tr key={label.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-black text-slate-500">#{label.displayOrder}</td>
                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="font-extrabold text-slate-900">{label.title}</div>
                        <div className="text-[11px] text-slate-500 line-clamp-1">{label.description}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1.5 bg-slate-100 px-2.5 py-1 rounded-lg font-mono text-[11px] font-bold text-slate-700">
                          {label.iconName}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex flex-wrap gap-1">
                          {label.pagePlacement.map((p) => (
                            <span
                              key={p}
                              className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border border-indigo-100"
                            >
                              {p}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <button
                          onClick={() => toggleSecurityLabelActive(label.id)}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold border transition-colors ${
                            label.isActive
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : "bg-slate-100 text-slate-500 border-slate-200"
                          }`}
                        >
                          <Power className="w-3 h-3" />
                          <span>{label.isActive ? "Active" : "Disabled"}</span>
                        </button>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenLabelModal(label)}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                            title="Edit Security Label"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => deleteSecurityLabel(label.id)}
                            className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors"
                            title="Delete Security Label"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredLabels.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400">
                        No security labels found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Hero Banners Section */}
      {activeTab === "banners" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Storefront Hero Promotional Banners</h3>
              <p className="text-xs text-slate-500">
                Active banners automatically rotate on customer homepage.
              </p>
            </div>
            <button
              onClick={() => handleOpenBannerModal()}
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-1.5 shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Hero Banner</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {homeBanners.map((banner) => (
              <div
                key={banner.id}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs flex flex-col justify-between"
              >
                <div className="relative h-44 overflow-hidden group">
                  <img
                    src={banner.imageUrl}
                    alt={banner.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/60 to-transparent p-4 flex flex-col justify-end text-white">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                      {banner.subtitle}
                    </span>
                    <h4 className="text-lg font-black leading-tight">{banner.title}</h4>
                  </div>
                  <span
                    className={`absolute top-3 right-3 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                      banner.isActive
                        ? "bg-emerald-500/80 text-white border-emerald-400"
                        : "bg-slate-800/80 text-slate-300 border-slate-700"
                    }`}
                  >
                    {banner.isActive ? "Active Banner" : "Disabled"}
                  </span>
                </div>

                <div className="p-4 bg-slate-50 flex items-center justify-between border-t border-slate-100 text-xs">
                  <div className="space-y-1">
                    <p className="font-semibold text-slate-700 flex items-center gap-1">
                      <ExternalLink className="w-3.5 h-3.5 text-indigo-500" />
                      <span>CTA: {banner.buttonText} ({banner.buttonLink})</span>
                    </p>
                    {banner.expiryDate && (
                      <p className="text-[11px] text-amber-600 font-bold flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> Expiration: {banner.expiryDate}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenBannerModal(banner)}
                      className="p-2 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteHomeBanner(banner.id)}
                      className="p-2 rounded-lg bg-rose-50 border border-rose-200 text-rose-600 hover:bg-rose-100"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Security Label Add/Edit Modal */}
      {isLabelModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <span>{editingLabel ? "Edit Security Label" : "Add Security & Trust Label"}</span>
              </h3>
              <button
                onClick={() => setIsLabelModalOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveLabel} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Label Title *</label>
                <input
                  type="text"
                  required
                  value={labelTitle}
                  onChange={(e) => setLabelTitle(e.target.value)}
                  placeholder="e.g. 256-Bit SSL Secured"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Description *</label>
                <input
                  type="text"
                  required
                  value={labelDescription}
                  onChange={(e) => setLabelDescription(e.target.value)}
                  placeholder="e.g. Full bank-grade end-to-end payment encryption"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Icon Graphic</label>
                  <select
                    value={labelIcon}
                    onChange={(e) => setLabelIcon(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold focus:outline-none"
                  >
                    {availableIcons.map((icon) => (
                      <option key={icon} value={icon}>
                        {icon}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Display Order</label>
                  <input
                    type="number"
                    min={1}
                    value={labelOrder}
                    onChange={(e) => setLabelOrder(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold focus:outline-none"
                  />
                </div>
              </div>

              {/* Placement Checkboxes */}
              <div>
                <label className="font-bold text-slate-700 block mb-1.5">Page Placements</label>
                <div className="flex flex-wrap gap-2">
                  {(["footer", "checkout", "product_page"] as const).map((placement) => {
                    const isSelected = labelPlacement.includes(placement);
                    return (
                      <button
                        key={placement}
                        type="button"
                        onClick={() => togglePlacement(placement)}
                        className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all ${
                          isSelected
                            ? "bg-indigo-50 border-indigo-600 text-indigo-700 shadow-xs"
                            : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                        }`}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5 text-indigo-600" />}
                        <span className="capitalize">{placement.replace("_", " ")}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Is Active Toggle */}
              <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                <span className="font-bold text-slate-800">Status: Enable Label</span>
                <button
                  type="button"
                  onClick={() => setLabelIsActive(!labelIsActive)}
                  className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
                    labelIsActive ? "bg-emerald-500" : "bg-slate-300"
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white shadow-md transition-transform ${
                      labelIsActive ? "translate-x-6" : "translate-x-0"
                    }`}
                  ></div>
                </button>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsLabelModalOpen(false)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-4 py-2 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-5 py-2 rounded-xl shadow-md"
                >
                  Save Security Label
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Hero Banner Add/Edit Modal */}
      {isBannerModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
                <Image className="w-5 h-5 text-indigo-600" />
                <span>{editingBanner ? "Edit Hero Banner" : "Create Hero Banner"}</span>
              </h3>
              <button
                onClick={() => setIsBannerModalOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveBanner} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Banner Headline Title *</label>
                <input
                  type="text"
                  required
                  value={bannerTitle}
                  onChange={(e) => setBannerTitle(e.target.value)}
                  placeholder="e.g. Next-Gen Mobile Devices & Flagships"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Subtitle / Tagline</label>
                <input
                  type="text"
                  value={bannerSubtitle}
                  onChange={(e) => setBannerSubtitle(e.target.value)}
                  placeholder="e.g. Up to 35% Off Official Brand Warranty Products"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Background Image URL *</label>
                <input
                  type="text"
                  required
                  value={bannerImage}
                  onChange={(e) => setBannerImage(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-[11px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Button Text</label>
                  <input
                    type="text"
                    value={bannerButtonText}
                    onChange={(e) => setBannerButtonText(e.target.value)}
                    placeholder="e.g. Shop Flagships"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Button Redirect Link</label>
                  <input
                    type="text"
                    value={bannerButtonLink}
                    onChange={(e) => setBannerButtonLink(e.target.value)}
                    placeholder="e.g. #products"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-mono focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Campaign Expiry Date (Optional)</label>
                <input
                  type="date"
                  value={bannerExpiry}
                  onChange={(e) => setBannerExpiry(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold focus:outline-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                <span className="font-bold text-slate-800">Banner Status: Active</span>
                <button
                  type="button"
                  onClick={() => setBannerIsActive(!bannerIsActive)}
                  className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
                    bannerIsActive ? "bg-emerald-500" : "bg-slate-300"
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white shadow-md transition-transform ${
                      bannerIsActive ? "translate-x-6" : "translate-x-0"
                    }`}
                  ></div>
                </button>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsBannerModalOpen(false)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-4 py-2 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-5 py-2 rounded-xl shadow-md"
                >
                  Save Hero Banner
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
