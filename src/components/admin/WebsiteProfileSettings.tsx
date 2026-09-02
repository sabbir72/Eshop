import React, { useState, useRef, useEffect } from "react";
import { useStore } from "../../context/StoreContext";
import {
  ShieldAlert,
  ShieldCheck,
  Upload,
  Trash2,
  Save,
  RotateCcw,
  Image as ImageIcon,
  Globe,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  Info,
  Layers,
  Sparkles,
  Eye,
  FileCheck,
  XCircle,
  Clock,
  UserCheck,
} from "lucide-react";

export const WebsiteProfileSettings: React.FC = () => {
  const {
    settings,
    activeRole,
    currentUser,
    updateWebsiteBranding,
    addToast,
    recordAuditLog,
    setAdminView,
  } = useStore();

  // Check Super Admin privilege strictly
  const isSuperAdmin =
    activeRole === "Super Admin" ||
    (currentUser && currentUser.role === "Super Admin");

  // Form states
  const [websiteName, setWebsiteName] = useState(settings.websiteName || settings.siteName || "Smart Shop");
  const [tagline, setTagline] = useState(settings.tagline || "Your trusted online store");
  const [logoUrl, setLogoUrl] = useState<string | null>(settings.logoUrl || null);
  const [faviconUrl, setFaviconUrl] = useState<string | null>(settings.faviconUrl || "/favicon.ico");

  // Staged logo preview state (before saving)
  const [stagedLogo, setStagedLogo] = useState<{
    dataUrl: string;
    fileName: string;
    fileSize: number;
    mimeType: string;
    width?: number;
    height?: number;
  } | null>(null);

  // Staged favicon preview state
  const [stagedFavicon, setStagedFavicon] = useState<{
    dataUrl: string;
    fileName: string;
    fileSize: number;
  } | null>(null);

  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const faviconInputRef = useRef<HTMLInputElement>(null);

  // Keep form in sync if external settings change
  useEffect(() => {
    setWebsiteName(settings.websiteName || settings.siteName || "Smart Shop");
    setTagline(settings.tagline || "Your trusted online store");
    setLogoUrl(settings.logoUrl || null);
    setFaviconUrl(settings.faviconUrl || "/favicon.ico");
  }, [settings]);

  // Compute if there are unsaved modifications
  const currentEffectiveLogo = stagedLogo ? stagedLogo.dataUrl : logoUrl;
  const currentEffectiveFavicon = stagedFavicon ? stagedFavicon.dataUrl : faviconUrl;

  const hasChanges =
    websiteName !== (settings.websiteName || settings.siteName || "Smart Shop") ||
    tagline !== (settings.tagline || "Your trusted online store") ||
    currentEffectiveLogo !== (settings.logoUrl || null) ||
    currentEffectiveFavicon !== (settings.faviconUrl || "/favicon.ico");

  // Process file upload on client with validation and call backend API
  const handleLogoFileProcess = async (file: File) => {
    setValidationError(null);

    // 1. Validate file format
    const allowedMimeTypes = [
      "image/png",
      "image/jpeg",
      "image/jpg",
      "image/webp",
      "image/svg+xml",
    ];
    if (!allowedMimeTypes.includes(file.type)) {
      const err = "Unsupported file type. Please upload a PNG, JPG, JPEG, WEBP, or SVG file.";
      setValidationError(err);
      addToast(err, "error");
      return;
    }

    // 2. Validate file size (max 5MB)
    const maxSizeBytes = 5 * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      const err = `File size too large (${(file.size / (1024 * 1024)).toFixed(2)} MB). Max limit is 5MB.`;
      setValidationError(err);
      addToast(err, "error");
      return;
    }

    setIsUploading(true);

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const dataUrl = e.target?.result as string;

        // Perform SVG safety check
        if (file.type === "image/svg+xml" || file.name.endsWith(".svg")) {
          const textContent = atob(dataUrl.split(",")[1] || "");
          const suspicious = [
            "<script",
            "javascript:",
            "onload=",
            "onerror=",
            "onclick=",
          ];
          for (const s of suspicious) {
            if (textContent.toLowerCase().includes(s)) {
              setIsUploading(false);
              const err = "Security check failed: Disallowed script detected inside SVG file.";
              setValidationError(err);
              addToast(err, "error");
              return;
            }
          }
        }

        // Measure image dimensions
        const img = new Image();
        img.src = dataUrl;
        img.onload = () => {
          setStagedLogo({
            dataUrl,
            fileName: file.name,
            fileSize: file.size,
            mimeType: file.type,
            width: img.width,
            height: img.height,
          });
          setIsUploading(false);
          addToast("Logo staged for preview. Click 'Save Changes' to apply store-wide.", "info");
        };
        img.onerror = () => {
          // If svg or format without image decode width
          setStagedLogo({
            dataUrl,
            fileName: file.name,
            fileSize: file.size,
            mimeType: file.type,
          });
          setIsUploading(false);
          addToast("Logo staged for preview.", "info");
        };
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      setIsUploading(false);
      setValidationError(err.message || "Failed to process logo file.");
      addToast("Failed to process logo file", "error");
    }
  };

  // Process Favicon upload
  const handleFaviconFileProcess = (file: File) => {
    const allowedTypes = [
      "image/x-icon",
      "image/vnd.microsoft.icon",
      "image/png",
      "image/svg+xml",
      "image/webp",
    ];
    if (!allowedTypes.includes(file.type) && !file.name.endsWith(".ico")) {
      addToast("Please upload an ICO, PNG, SVG, or WEBP favicon file.", "error");
      return;
    }
    if (file.size > 1024 * 1024) {
      addToast("Favicon size must be under 1MB.", "error");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setStagedFavicon({
        dataUrl,
        fileName: file.name,
        fileSize: file.size,
      });
      addToast("Favicon staged for preview. Click 'Save Changes' to apply.", "info");
    };
    reader.readAsDataURL(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (!isSuperAdmin) return;
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleLogoFileProcess(e.dataTransfer.files[0]);
    }
  };

  const handleRemoveLogo = () => {
    if (!isSuperAdmin) return;
    setStagedLogo(null);
    setLogoUrl(null);
    addToast("Website logo removed. Default branded icon will be displayed.", "info");
  };

  const handleResetFavicon = () => {
    if (!isSuperAdmin) return;
    setStagedFavicon(null);
    setFaviconUrl("/favicon.ico");
    addToast("Favicon reset to default.", "info");
  };

  const handleDiscardChanges = () => {
    setWebsiteName(settings.websiteName || settings.siteName || "Smart Shop");
    setTagline(settings.tagline || "Your trusted online store");
    setLogoUrl(settings.logoUrl || null);
    setFaviconUrl(settings.faviconUrl || "/favicon.ico");
    setStagedLogo(null);
    setStagedFavicon(null);
    setValidationError(null);
    addToast("Reverted all unsaved changes.", "info");
  };

  // Submit and save changes via backend API
  const handleSaveChanges = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isSuperAdmin) {
      addToast("Forbidden: Only Super Admin is authorized to update branding.", "error");
      return;
    }

    if (!websiteName.trim()) {
      addToast("Website Name cannot be empty.", "error");
      return;
    }

    setIsSaving(true);

    const finalLogo = stagedLogo ? stagedLogo.dataUrl : logoUrl;
    const finalFavicon = stagedFavicon ? stagedFavicon.dataUrl : faviconUrl;

    const result = await updateWebsiteBranding({
      websiteName: websiteName.trim(),
      tagline: tagline.trim(),
      logoUrl: finalLogo,
      faviconUrl: finalFavicon,
    });

    setIsSaving(false);

    if (result.success) {
      setStagedLogo(null);
      setStagedFavicon(null);
      setLogoUrl(finalLogo);
      setFaviconUrl(finalFavicon);
    }
  };

  return (
    <div id="website-profile-settings-container" className="space-y-6 pb-20">
      {/* Top Banner & Super Admin Status Indicator */}
      <div
        id="branding-header-card"
        className="bg-slate-900 text-white p-6 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm border border-slate-800"
      >
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
              <Globe className="w-6 h-6 text-indigo-400" />
              Website Profile & Brand Settings
            </h1>
          </div>
          <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
            Centralized brand identity governance. Manage your official website logo, store name,
            search tagline, and browser favicon across the storefront, mobile header, invoices, and auth views.
          </p>
        </div>

        {/* RBAC Badge */}
        <div className="shrink-0 flex items-center gap-2">
          {isSuperAdmin ? (
            <div
              id="super-admin-badge"
              className="flex items-center gap-2 bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 px-3.5 py-2 rounded-xl text-xs font-bold shadow-xs"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <div>
                <span className="block text-[11px] leading-tight text-emerald-200">Super Admin Authorized</span>
                <span className="block text-[10px] text-emerald-400 font-normal">Full Edit & Asset Rights</span>
              </div>
            </div>
          ) : (
            <div
              id="readonly-role-badge"
              className="flex items-center gap-2 bg-amber-500/15 text-amber-300 border border-amber-500/30 px-3.5 py-2 rounded-xl text-xs font-bold shadow-xs"
            >
              <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
              <div>
                <span className="block text-[11px] leading-tight text-amber-200">Read-Only Mode ({activeRole})</span>
                <span className="block text-[10px] text-amber-400 font-normal">Super Admin required to edit</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Read-Only Notice for Non-Super Admin */}
      {!isSuperAdmin && (
        <div
          id="readonly-callout-banner"
          className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3 text-xs text-amber-900 shadow-2xs"
        >
          <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-bold text-amber-950">Security Policy: Read-Only Brand Access</h4>
            <p className="text-amber-800 leading-relaxed">
              Your active role (<strong className="font-semibold">{activeRole}</strong>) is permitted to inspect website branding configuration,
              but brand modifications (logo upload/removal, website renaming, favicon change) are restricted exclusively to <strong className="font-semibold">Super Admin</strong> accounts.
            </p>
          </div>
        </div>
      )}

      {/* Main Settings Form */}
      <form onSubmit={handleSaveChanges} className="space-y-6">
        {/* ========================================================================= */}
        {/* SECTION 1: WEBSITE LOGO MANAGEMENT */}
        {/* ========================================================================= */}
        <div
          id="logo-management-card"
          className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
            <div className="space-y-0.5">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-indigo-600" />
                Website Logo
              </h3>
              <p className="text-xs text-slate-500">
                Primary visual brand asset displayed across website header, invoices, and login screens.
              </p>
            </div>
            <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md self-start sm:self-auto">
              PNG, JPG, WEBP, SVG • Max 5MB
            </span>
          </div>

          {/* Logo Comparison & Live Preview Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Current Active Logo Card */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col justify-between space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  Active Website Logo
                </span>
                <span className="text-[10px] font-mono text-slate-500">
                  {settings.logoUrl ? "Custom Asset" : "Default System Icon"}
                </span>
              </div>

              {/* Logo Display Canvas with transparency checkerboard background */}
              <div
                id="current-logo-canvas"
                className="h-32 rounded-lg border border-slate-200 bg-white flex items-center justify-center p-4 relative overflow-hidden"
              >
                {logoUrl ? (
                  <img
                    src={logoUrl}
                    alt="Active Website Logo"
                    className="max-h-24 max-w-full object-contain filter drop-shadow-xs"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-slate-400 space-y-1.5">
                    <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center font-black text-sm border border-indigo-200">
                      {(websiteName || "SS").substring(0, 2).toUpperCase()}
                    </div>
                    <span className="text-[11px] font-medium text-slate-500">
                      No custom logo uploaded
                    </span>
                  </div>
                )}
              </div>

              {/* Logo Details / Remove action */}
              <div className="flex items-center justify-between pt-1 text-[11px] text-slate-500">
                <span className="truncate max-w-[200px]">
                  {logoUrl ? "Current production logo" : "Using standard typography mark"}
                </span>
                {isSuperAdmin && logoUrl && (
                  <button
                    type="button"
                    id="btn-remove-logo"
                    onClick={handleRemoveLogo}
                    className="text-rose-600 hover:text-rose-700 font-bold flex items-center gap-1 text-[11px] hover:underline"
                  >
                    <Trash2 className="w-3 h-3" />
                    Remove Logo
                  </button>
                )}
              </div>
            </div>

            {/* Staged / New Logo Preview Card */}
            <div
              className={`border rounded-xl p-4 flex flex-col justify-between space-y-3 transition-colors ${
                stagedLogo
                  ? "bg-indigo-50/50 border-indigo-300 ring-2 ring-indigo-500/20"
                  : "bg-slate-50/70 border-dashed border-slate-300"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-950 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                  New Logo Preview (Staged)
                </span>
                {stagedLogo && (
                  <span className="text-[10px] font-bold bg-indigo-600 text-white px-2 py-0.5 rounded-full">
                    Ready to Save
                  </span>
                )}
              </div>

              {/* Preview canvas */}
              <div className="h-32 rounded-lg border border-slate-200 bg-white flex items-center justify-center p-4 relative overflow-hidden">
                {stagedLogo ? (
                  <img
                    src={stagedLogo.dataUrl}
                    alt="Staged New Logo Preview"
                    className="max-h-24 max-w-full object-contain filter drop-shadow-xs"
                  />
                ) : (
                  <div className="text-center text-slate-400 space-y-1">
                    <ImageIcon className="w-7 h-7 mx-auto opacity-40" />
                    <p className="text-[11px] text-slate-500 font-medium">
                      Upload or drag a new image file to preview changes
                    </p>
                  </div>
                )}
              </div>

              {/* File stats & Cancel Staging */}
              <div className="flex items-center justify-between pt-1 text-[11px]">
                {stagedLogo ? (
                  <>
                    <span className="text-slate-600 truncate max-w-[200px]">
                      {stagedLogo.fileName} ({(stagedLogo.fileSize / 1024).toFixed(1)} KB)
                    </span>
                    <button
                      type="button"
                      onClick={() => setStagedLogo(null)}
                      className="text-slate-500 hover:text-slate-700 font-bold flex items-center gap-1 hover:underline"
                    >
                      <RotateCcw className="w-3 h-3" /> Cancel
                    </button>
                  </>
                ) : (
                  <span className="text-slate-400 text-[10px]">
                    Preview will update instantly upon selection
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Drag & Drop Upload Zone (Super Admin only) */}
          {isSuperAdmin && (
            <div className="space-y-2">
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/png,image/jpeg,image/jpg,image/webp,image/svg+xml"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleLogoFileProcess(e.target.files[0]);
                  }
                }}
              />

              <div
                id="logo-dropzone"
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`p-6 border-2 border-dashed rounded-xl cursor-pointer text-center transition-all flex flex-col items-center justify-center gap-2 ${
                  dragActive
                    ? "border-indigo-600 bg-indigo-50/70 scale-[1.005]"
                    : "border-slate-300 hover:border-indigo-400 hover:bg-slate-50/80"
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Upload className="w-5 h-5" />
                </div>
                <div className="text-xs">
                  <span className="font-bold text-slate-900 hover:underline">
                    Click to browse files
                  </span>{" "}
                  <span className="text-slate-500">or drag & drop your logo image here</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Recommended size: 250×60px or vector SVG. Transparent PNG or WEBP works best.
                </p>
              </div>

              {validationError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{validationError}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* SECTION 2: WEBSITE INFORMATION (NAME & TAGLINE) */}
        {/* ========================================================================= */}
        <div
          id="website-info-card"
          className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6"
        >
          <div className="border-b border-slate-100 pb-4">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Globe className="w-4 h-4 text-blue-600" />
              Website Information & Title
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Defines the official brand name shown in browser title bars, email receipts, SEO metadata, and footer copyright.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
            {/* Website Name */}
            <div className="space-y-1.5">
              <label htmlFor="input-website-name" className="font-bold text-slate-800 block">
                Website / Store Name <span className="text-rose-500">*</span>
              </label>
              <input
                id="input-website-name"
                type="text"
                required
                disabled={!isSuperAdmin}
                value={websiteName}
                onChange={(e) => setWebsiteName(e.target.value)}
                maxLength={100}
                placeholder="e.g., Smart Shop"
                className={`w-full border rounded-xl p-3 font-semibold text-slate-900 transition-all focus:outline-none ${
                  isSuperAdmin
                    ? "bg-slate-50 border-slate-300 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    : "bg-slate-100 border-slate-200 text-slate-600 cursor-not-allowed"
                }`}
              />
              <p className="text-[11px] text-slate-500">
                Appears as the primary storefront heading and invoice emitter.
              </p>
            </div>

            {/* Website Tagline */}
            <div className="space-y-1.5">
              <label htmlFor="input-website-tagline" className="font-bold text-slate-800 block">
                Website Tagline / Slogan
              </label>
              <input
                id="input-website-tagline"
                type="text"
                disabled={!isSuperAdmin}
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                maxLength={200}
                placeholder="e.g., Your trusted online store"
                className={`w-full border rounded-xl p-3 font-medium text-slate-900 transition-all focus:outline-none ${
                  isSuperAdmin
                    ? "bg-slate-50 border-slate-300 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    : "bg-slate-100 border-slate-200 text-slate-600 cursor-not-allowed"
                }`}
              />
              <p className="text-[11px] text-slate-500">
                Shown beside the logo or in browser title tags and social meta cards.
              </p>
            </div>
          </div>

          {/* Browser Tab & Search Result Preview Mockup */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-blue-600" />
                Live Browser Tab & SERP Preview
              </span>
              <span className="text-[10px] text-slate-400">Dynamic Title Tag Simulation</span>
            </div>

            {/* Mock browser tab */}
            <div className="bg-slate-200/80 rounded-lg p-2 flex items-center gap-2 max-w-sm border border-slate-300 shadow-2xs">
              <div className="w-4 h-4 rounded-full overflow-hidden bg-white shrink-0 flex items-center justify-center border border-slate-300">
                {currentEffectiveFavicon ? (
                  <img src={currentEffectiveFavicon} alt="Favicon" className="w-3.5 h-3.5 object-contain" />
                ) : (
                  <span className="text-[9px] font-black text-indigo-600">S</span>
                )}
              </div>
              <span className="text-xs font-medium text-slate-800 truncate">
                {websiteName || "Smart Shop"} {tagline ? `| ${tagline}` : ""}
              </span>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* SECTION 3: WEBSITE FAVICON */}
        {/* ========================================================================= */}
        <div
          id="favicon-management-card"
          className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
            <div className="space-y-0.5">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-emerald-600" />
                Website Favicon
              </h3>
              <p className="text-xs text-slate-500">
                Small icon displayed on browser tabs, bookmarks, and mobile shortcut icons.
              </p>
            </div>
            <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md self-start sm:self-auto">
              ICO, PNG, SVG • Max 1MB
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-6">
            {/* Favicon Previews in different sizes */}
            <div className="flex items-center gap-4 p-4 bg-slate-50 border border-slate-200 rounded-xl">
              <div className="text-center space-y-1">
                <div className="w-12 h-12 rounded-xl bg-white border border-slate-300 flex items-center justify-center shadow-2xs p-1">
                  {currentEffectiveFavicon ? (
                    <img
                      src={currentEffectiveFavicon}
                      alt="Favicon 32x32"
                      className="w-8 h-8 object-contain"
                    />
                  ) : (
                    <span className="text-xs font-bold text-indigo-600">ICO</span>
                  )}
                </div>
                <span className="text-[10px] text-slate-500 font-mono">32×32</span>
              </div>

              <div className="text-center space-y-1">
                <div className="w-8 h-8 rounded-lg bg-white border border-slate-300 flex items-center justify-center shadow-2xs p-0.5">
                  {currentEffectiveFavicon ? (
                    <img
                      src={currentEffectiveFavicon}
                      alt="Favicon 16x16"
                      className="w-5 h-5 object-contain"
                    />
                  ) : (
                    <span className="text-[8px] font-bold text-indigo-600">S</span>
                  )}
                </div>
                <span className="text-[10px] text-slate-500 font-mono">16×16</span>
              </div>
            </div>

            {/* Favicon Actions (Super Admin only) */}
            {isSuperAdmin && (
              <div className="space-y-2 flex-1">
                <input
                  type="file"
                  ref={faviconInputRef}
                  className="hidden"
                  accept=".ico,image/x-icon,image/png,image/svg+xml,image/webp"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleFaviconFileProcess(e.target.files[0]);
                    }
                  }}
                />
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    id="btn-upload-favicon"
                    onClick={() => faviconInputRef.current?.click()}
                    className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-xs transition-all active:scale-95"
                  >
                    <Upload className="w-3.5 h-3.5" /> Upload New Favicon
                  </button>
                  <button
                    type="button"
                    id="btn-reset-favicon"
                    onClick={handleResetFavicon}
                    className="text-slate-600 hover:text-slate-900 font-bold text-xs px-3 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 transition-all"
                  >
                    Reset to Default
                  </button>
                </div>
                <p className="text-[11px] text-slate-400">
                  Select a square 1:1 ratio image for optimal browser tab crispness.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* SECTION 4: STOREFRONT HEADER & FOOTER MOCKUP PREVIEW */}
        {/* ========================================================================= */}
        <div
          id="mockup-preview-card"
          className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4"
        >
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Layers className="w-4 h-4 text-purple-600" />
              Live Storefront Header Mockup
            </h3>
            <span className="text-[11px] text-slate-500 font-medium">Real-Time UI Preview</span>
          </div>

          <div className="bg-slate-900 text-white rounded-xl p-4 border border-slate-800 shadow-inner space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              {/* Header Logo Simulation */}
              <div className="flex items-center gap-3">
                {currentEffectiveLogo ? (
                  <img
                    src={currentEffectiveLogo}
                    alt="Logo Mockup"
                    className="h-9 max-w-[160px] object-contain"
                  />
                ) : (
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-indigo-500 text-white font-black text-xs flex items-center justify-center">
                      {(websiteName || "SS").substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <span className="font-black text-sm text-white tracking-tight block leading-none">
                        {websiteName || "Smart Shop"}
                      </span>
                      {tagline && (
                        <span className="text-[10px] text-slate-400 block leading-tight mt-0.5">
                          {tagline}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Mock Navigation links */}
              <div className="hidden sm:flex items-center gap-4 text-xs text-slate-300">
                <span>Products</span>
                <span>Categories</span>
                <span>Special Offers</span>
                <span>Help Desk</span>
              </div>
            </div>
            <p className="text-[10px] text-slate-400 italic">
              When changes are saved, all customer pages, search engine cards, and admin screens will update automatically.
            </p>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* BOTTOM ACTION BAR (SUPER ADMIN ONLY) */}
        {/* ========================================================================= */}
        <div
          id="branding-action-bar"
          className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 sticky bottom-4 z-10"
        >
          <div className="flex items-center gap-3 text-xs text-slate-600">
            {hasChanges ? (
              <span className="flex items-center gap-1.5 font-bold text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1 rounded-lg">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                You have unsaved branding changes
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-slate-500">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                All branding assets are synced with production
              </span>
            )}

            {settings.updatedBy && (
              <span className="hidden md:inline-flex items-center gap-1 text-[11px] text-slate-400">
                <UserCheck className="w-3 h-3 text-slate-400" />
                Last updated by: {settings.updatedBy}
              </span>
            )}
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            {isSuperAdmin ? (
              <>
                <button
                  type="button"
                  id="btn-revert-branding"
                  disabled={!hasChanges || isSaving}
                  onClick={handleDiscardChanges}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  Discard Changes
                </button>

                <button
                  type="submit"
                  id="btn-save-branding"
                  disabled={isSaving || !isSuperAdmin}
                  className="bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-bold text-xs px-6 py-2.5 rounded-xl flex items-center gap-2 shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSaving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Saving to Server...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" /> Save Website Profile
                    </>
                  )}
                </button>
              </>
            ) : (
              <span className="text-xs font-semibold text-slate-400 italic">
                Modifications restricted to Super Admin
              </span>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};
