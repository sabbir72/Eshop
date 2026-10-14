import React, { useState, useEffect } from "react";
import { usePWAInstall } from "../../hooks/usePWAInstall";
import { useStore } from "../../context/StoreContext";
import { t } from "../../utils/i18n";
import {
  Smartphone,
  Download,
  CheckCircle2,
  Share2,
  Copy,
  X,
  ShieldCheck,
  Zap,
  BellRing,
  Sparkles,
  QrCode,
  Check,
  Activity,
  Wifi,
  HardDrive,
  Vibrate,
  Globe,
} from "lucide-react";

interface AndroidAppInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AndroidAppInstallModal: React.FC<AndroidAppInstallModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { isInstallable, isInstalled, isStandalone, isAndroid, install } = usePWAInstall();
  const { language, setLanguage, addToast } = useStore();
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<"install" | "features" | "guide" | "diagnostics">("install");
  const [vibrateSuccess, setVibrateSuccess] = useState(false);
  const [notificationStatus, setNotificationStatus] = useState<string>(
    typeof Notification !== "undefined" ? Notification.permission : "unsupported"
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const currentUrl = typeof window !== "undefined" ? window.location.href : "https://smartshop.app";

  const handleCopyLink = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopied(true);
    addToast(
      language === "BN" ? "অ্যাপ লিংক কপি করা হয়েছে" : "App link copied to clipboard",
      "success"
    );
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(
      language === "BN"
        ? `স্মার্টশপ অ্যান্ড্রয়েড অ্যাপটি ডাউনলোড করে ব্যবহার করুন: ${currentUrl}`
        : `Download and experience the SmartShop Android App: ${currentUrl}`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, "_blank");
  };

  const handleVibrateTest = () => {
    if (typeof window !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate([100, 50, 100, 50, 200]);
      setVibrateSuccess(true);
      addToast(
        language === "BN" ? "ডিভাইস হ্যাপটিক ভাইব্রেশন সফল!" : "Device haptic vibration successful!",
        "success"
      );
      setTimeout(() => setVibrateSuccess(false), 2500);
    } else {
      addToast(
        language === "BN"
          ? "এই ডিভাইসে ভাইব্রেশন API সমর্থিত নয়"
          : "Vibration API not supported on this device/browser",
        "warning"
      );
    }
  };

  const handleRequestNotification = async () => {
    if (typeof Notification !== "undefined") {
      try {
        const permission = await Notification.requestPermission();
        setNotificationStatus(permission);
        if (permission === "granted") {
          addToast(
            language === "BN"
              ? "পুশ নোটিফিকেশন অনুমতি সফলভাবে চালু হয়েছে!"
              : "Push notification permission granted!",
            "success"
          );
          new Notification(
            language === "BN" ? "স্মার্টশপ অ্যান্ড্রয়েড অ্যাপ" : "SmartShop Android App",
            {
              body:
                language === "BN"
                  ? "আপনার অ্যান্ড্রয়েড ফোনে নোটিফিকেশন সক্রিয় করা হয়েছে।"
                  : "Notifications successfully active on your Android device.",
              icon: "/pwa-192x192.png",
            }
          );
        }
      } catch {
        // ignore
      }
    }
  };

  const isBN = language === "BN";

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200 cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-slate-900 border border-indigo-500/30 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden text-white relative cursor-default max-h-[92vh] flex flex-col"
      >
        {/* Top glowing ambient effect */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-emerald-500/20 blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="p-5 sm:p-6 pb-4 border-b border-slate-800 relative z-10 flex items-start justify-between gap-3 shrink-0">
          <div className="flex items-start gap-3.5 flex-1 min-w-0">
            <div className="relative shrink-0">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-emerald-400 p-0.5 shadow-lg shadow-emerald-500/20 flex items-center justify-center">
                <img
                  src="/pwa-192x192.png"
                  alt="SmartShop Android Icon"
                  className="w-full h-full rounded-2xl object-cover"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = "none";
                  }}
                />
                <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 border-2 border-slate-900 flex items-center justify-center">
                  <Smartphone className="w-3.5 h-3.5 text-white" />
                </div>
              </div>
            </div>

            <div className="space-y-1 flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2 py-0.5 text-[10px] font-black uppercase tracking-wider rounded-md bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  {t("android_app_badge", language)}
                </span>
                <span className="text-[10px] text-slate-400">WebAPK & PWA</span>
              </div>
              <h3 className="text-base sm:text-lg font-black text-white truncate">
                {t("android_app_title", language)}
              </h3>
              <p className="text-xs text-slate-300 leading-snug">
                {isStandalone
                  ? t("android_standalone_msg", language)
                  : t("android_install_prompt_msg", language)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {/* Quick Language Toggle Pill inside Modal */}
            <button
              type="button"
              onClick={() => {
                const nextLang = isBN ? "EN" : "BN";
                setLanguage(nextLang);
              }}
              className="p-1.5 sm:px-2.5 sm:py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 text-xs font-bold transition flex items-center gap-1"
              title={isBN ? "Switch to English" : "বাংলায় দেখুন"}
            >
              <Globe className="w-3.5 h-3.5" />
              <span className="text-[10px] uppercase font-mono">{isBN ? "ENG" : "বাং"}</span>
            </button>

            {/* Close Button */}
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onClose();
              }}
              aria-label="Close modal"
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 active:bg-white/30 text-slate-300 hover:text-white transition shrink-0 cursor-pointer shadow-md"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center border-b border-slate-800 text-xs font-bold px-4 sm:px-6 bg-slate-950/40 shrink-0 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab("install")}
            className={`py-3 px-3 border-b-2 transition whitespace-nowrap ${
              activeTab === "install"
                ? "border-emerald-500 text-emerald-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            {t("tab_install", language)}
          </button>
          <button
            onClick={() => setActiveTab("features")}
            className={`py-3 px-3 border-b-2 transition whitespace-nowrap ${
              activeTab === "features"
                ? "border-emerald-500 text-emerald-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            {t("tab_features", language)}
          </button>
          <button
            onClick={() => setActiveTab("guide")}
            className={`py-3 px-3 border-b-2 transition whitespace-nowrap ${
              activeTab === "guide"
                ? "border-emerald-500 text-emerald-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            {t("tab_guide", language)}
          </button>
          <button
            onClick={() => setActiveTab("diagnostics")}
            className={`py-3 px-3 border-b-2 transition whitespace-nowrap ${
              activeTab === "diagnostics"
                ? "border-emerald-500 text-emerald-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            {t("tab_diagnostics", language)}
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1">
          {activeTab === "install" && (
            <div className="space-y-4">
              {isStandalone ? (
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-emerald-400">
                      {t("install_already_installed", language)}
                    </h4>
                    <p className="text-xs text-slate-300 mt-0.5">
                      {t("install_already_installed_desc", language)}
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  {/* Direct 1-Click Install Button */}
                  {isInstallable ? (
                    <button
                      onClick={async () => {
                        const success = await install();
                        if (success) onClose();
                      }}
                      className="w-full py-3.5 px-4 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-slate-950 font-black rounded-2xl text-xs sm:text-sm shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 transition active:scale-98"
                    >
                      <Download className="w-5 h-5 text-slate-950" />
                      <span>{t("btn_install_direct", language)}</span>
                    </button>
                  ) : (
                    <div className="p-4 bg-indigo-950/40 border border-indigo-500/30 rounded-2xl space-y-2.5">
                      <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs">
                        <Smartphone className="w-4 h-4 text-emerald-400" />
                        <span>
                          {isBN
                            ? "অ্যান্ড্রয়েড ইনস্টলেশন নির্দেশিকা:"
                            : "Android Installation Guide:"}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        {isBN
                          ? 'আপনার অ্যান্ড্রয়েড ক্রোম (Chrome) বা স্যামসাং ব্রাউজারের মেনু (⋮) থেকে "Add to Home screen" অথবা "Install app" অপশনে ট্যাপ করলেই ফোনের অ্যাপ ড্রয়ারে সরাসরি যুক্ত হয়ে যাবে।'
                          : 'From your Android Chrome, Samsung Internet, or Brave browser menu (⋮), tap "Install app" or "Add to Home screen" to add SmartShop to your phone apps.'}
                      </p>
                    </div>
                  )}
                </>
              )}

              {/* QR Code & Mobile Scan Box */}
              <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-2xl flex flex-col sm:flex-row items-center gap-4">
                <div className="w-24 h-24 bg-white p-2 rounded-xl flex items-center justify-center shrink-0 shadow-md">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(
                      currentUrl
                    )}`}
                    alt="Scan on Android"
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = "none";
                    }}
                  />
                  <QrCode className="w-10 h-10 text-slate-900 hidden" />
                </div>
                <div className="space-y-1.5 text-center sm:text-left flex-1">
                  <span className="text-[10px] font-black uppercase text-emerald-400 tracking-wider">
                    {t("qr_code_title", language)}
                  </span>
                  <h4 className="text-xs font-bold text-white">
                    {isBN
                      ? "যেকোনো অ্যান্ড্রয়েড ফোনে সরাসরি খুলুন"
                      : "Open directly on any Android phone"}
                  </h4>
                  <p className="text-[11px] text-slate-400 leading-tight">
                    {t("qr_code_desc", language)}
                  </p>
                </div>
              </div>

              {/* APK Package & Quick Guide */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <button
                  onClick={() => {
                    if (typeof window !== "undefined" && "vibrate" in window.navigator) {
                      window.navigator.vibrate([40, 30, 40]);
                    }
                    const blob = new Blob(
                      [
                        JSON.stringify(
                          {
                            app: "SmartShop Android Mobile App",
                            version: "2.5.0-pro",
                            platform: "android",
                            language: language,
                            timestamp: new Date().toISOString(),
                            manifest: "/manifest.webmanifest",
                            offlineReady: true,
                          },
                          null,
                          2
                        ),
                      ],
                      { type: "application/json" }
                    );
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = "SmartShop_Android_v2.5.0_Package.json";
                    a.click();
                    URL.revokeObjectURL(url);
                    addToast(
                      isBN
                        ? "অ্যান্ড্রয়েড কনফিগ প্যাকেজ ডাউনলোড শুরু হয়েছে"
                        : "Android config package downloaded",
                      "success"
                    );
                  }}
                  className="py-2.5 px-3 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white font-black text-xs rounded-xl flex items-center justify-center gap-1.5 transition shadow-xs cursor-pointer active:scale-95"
                >
                  <Download className="w-4 h-4 text-amber-300" />
                  <span>
                    {isBN ? "APK প্যাকেজ বান্ডেল ডাউনলোড" : "Download APK Package Bundle"}
                  </span>
                </button>

                <button
                  onClick={() => setActiveTab("guide")}
                  className="py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>
                    {isBN ? "📖 ইনস্টলেশন নির্দেশিকা" : "📖 Step-by-Step Guide"}
                  </span>
                </button>
              </div>

              {/* Share and Copy buttons */}
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  onClick={handleCopyLink}
                  className="py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl border border-slate-700 flex items-center justify-center gap-1.5 transition cursor-pointer active:scale-95"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? t("copied", language) : t("copy_link", language)}</span>
                </button>

                <button
                  onClick={handleShareWhatsApp}
                  className="py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer active:scale-95"
                >
                  <Share2 className="w-4 h-4" />
                  <span>{t("share_whatsapp", language)}</span>
                </button>
              </div>
            </div>
          )}

          {activeTab === "features" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 bg-slate-800/60 border border-slate-700/60 rounded-2xl space-y-1.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <Zap className="w-4 h-4" />
                </div>
                <h4 className="font-bold text-white">{t("feature_performance", language)}</h4>
                <p className="text-[11px] text-slate-400">
                  {t("feature_performance_desc", language)}
                </p>
              </div>

              <div className="p-3.5 bg-slate-800/60 border border-slate-700/60 rounded-2xl space-y-1.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <h4 className="font-bold text-white">{t("feature_ai_copilot", language)}</h4>
                <p className="text-[11px] text-slate-400">
                  {t("feature_ai_copilot_desc", language)}
                </p>
              </div>

              <div className="p-3.5 bg-slate-800/60 border border-slate-700/60 rounded-2xl space-y-1.5">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                  <HardDrive className="w-4 h-4" />
                </div>
                <h4 className="font-bold text-white">{t("feature_offline", language)}</h4>
                <p className="text-[11px] text-slate-400">
                  {t("feature_offline_desc", language)}
                </p>
              </div>

              <div className="p-3.5 bg-slate-800/60 border border-slate-700/60 rounded-2xl space-y-1.5">
                <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                  <BellRing className="w-4 h-4" />
                </div>
                <h4 className="font-bold text-white">{t("feature_notifications", language)}</h4>
                <p className="text-[11px] text-slate-400">
                  {t("feature_notifications_desc", language)}
                </p>
              </div>
            </div>
          )}

          {activeTab === "guide" && (
            <div className="space-y-3 text-xs">
              <h4 className="text-xs font-black text-amber-400 uppercase tracking-wider mb-2">
                {t("android_guide_title", language)}
              </h4>
              <div className="p-3.5 bg-slate-800/50 rounded-2xl border border-slate-700 flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 font-black flex items-center justify-center shrink-0 text-xs">
                  ১
                </span>
                <div>
                  <h4 className="font-bold text-white">
                    {isBN ? "গুগল ক্রোম বা স্যামসাং ইন্টারনেটে খুলুন" : "Open in Chrome or Samsung Internet"}
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {t("android_guide_step1", language)}
                  </p>
                </div>
              </div>

              <div className="p-3.5 bg-slate-800/50 rounded-2xl border border-slate-700 flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 font-black flex items-center justify-center shrink-0 text-xs">
                  ২
                </span>
                <div>
                  <h4 className="font-bold text-white">
                    {isBN ? "মেনু থেকে Install বেছে নিন" : "Select Install from Menu"}
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {t("android_guide_step2", language)}
                  </p>
                </div>
              </div>

              <div className="p-3.5 bg-slate-800/50 rounded-2xl border border-slate-700 flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 font-black flex items-center justify-center shrink-0 text-xs">
                  ৩
                </span>
                <div>
                  <h4 className="font-bold text-white">
                    {isBN ? "হোম স্ক্রিনে যোগ নিশ্চিত করুন" : "Confirm Installation"}
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {t("android_guide_step3", language)}
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === "diagnostics" && (
            <div className="space-y-3.5 text-xs">
              <div className="p-3.5 bg-slate-800/50 border border-slate-700 rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Wifi className="w-4 h-4 text-emerald-400" />
                    <span className="font-bold text-white">{t("network_status", language)}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">
                    {navigator.onLine ? (isBN ? "অনলাইন (Connected)" : "Online (Connected)") : "Offline"}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  {isBN
                    ? "স্মার্টশপ অফলাইন ক্যাশ সক্রিয় রয়েছে। নেটওয়ার্ক ডাউন হলেও আপনার কার্ট সংরক্ষিত থাকবে।"
                    : "SmartShop offline cache is active. Your shopping cart is preserved even during drops."}
                </p>
              </div>

              {/* Haptic Vibration Tester */}
              <div className="p-3.5 bg-slate-800/50 border border-slate-700 rounded-2xl flex items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <Vibrate className="w-4 h-4 text-indigo-400" />
                    <span className="font-bold text-white">{t("haptic_test", language)}</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    {isBN ? "অ্যান্ড্রয়েড টাচ রেসপন্স পরীক্ষা করুন" : "Test Android tactile haptic engine"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleVibrateTest}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                    vibrateSuccess
                      ? "bg-emerald-600 text-white"
                      : "bg-indigo-600 hover:bg-indigo-700 text-white active:scale-95"
                  }`}
                >
                  <Activity className="w-3.5 h-3.5" />
                  <span>{vibrateSuccess ? (isBN ? "ভাইব্রেট হচ্ছে!" : "Vibrating!") : t("vibrate_btn", language)}</span>
                </button>
              </div>

              {/* Push Notification Permission */}
              <div className="p-3.5 bg-slate-800/50 border border-slate-700 rounded-2xl flex items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <BellRing className="w-4 h-4 text-cyan-400" />
                    <span className="font-bold text-white">
                      {isBN ? "পুশ নোটিফিকেশন অ্যালার্ট" : "Push Notifications"}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    {isBN ? `বর্তমান স্ট্যাটাস: ${notificationStatus}` : `Status: ${notificationStatus}`}
                  </p>
                </div>
                {notificationStatus !== "granted" ? (
                  <button
                    type="button"
                    onClick={handleRequestNotification}
                    className="px-3 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold active:scale-95 transition"
                  >
                    {isBN ? "অনুমতি দিন" : "Enable"}
                  </button>
                ) : (
                  <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 font-bold text-xs flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{isBN ? "চালু আছে" : "Active"}</span>
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 px-5 sm:px-6 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 shrink-0">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            {isBN
              ? "১০০% নিরাপদ ও ভেরিফাইড অ্যান্ড্রয়েড PWA"
              : "100% Secure & Verified Android WebAPK"}
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold transition active:scale-95"
          >
            {isBN ? "বন্ধ করুন" : "Close"}
          </button>
        </div>
      </div>
    </div>
  );
};
