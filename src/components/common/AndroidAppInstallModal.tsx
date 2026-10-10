import React, { useState, useEffect } from "react";
import { usePWAInstall } from "../../hooks/usePWAInstall";
import {
  Smartphone,
  Download,
  CheckCircle2,
  Share2,
  Copy,
  X,
  ExternalLink,
  ShieldCheck,
  Zap,
  BellRing,
  Sparkles,
  QrCode,
  Check,
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
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<"install" | "features" | "guide">("install");

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
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(
      `স্মার্টশপ অ্যান্ড্রয়েড অ্যাপটি ডাউনলোড করে ব্যবহার করুন: ${currentUrl}`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, "_blank");
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200 cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-slate-900 border border-indigo-500/30 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden text-white relative cursor-default"
      >
        {/* Top glowing ambient effect */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-emerald-500/20 blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="p-6 pb-4 border-b border-slate-800 relative z-10 flex items-start justify-between gap-4">
          <div className="flex items-start gap-4 flex-1 min-w-0">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-emerald-400 p-0.5 shadow-lg shadow-emerald-500/20 flex items-center justify-center">
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

          <div className="space-y-1 flex-1">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 text-[10px] font-black uppercase tracking-wider rounded-md bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                Android App v2.4.0
              </span>
              <span className="text-[11px] text-slate-400">PWA / WebAPK</span>
            </div>
            <h3 className="text-lg font-black text-white">SmartShop Android Mobile App</h3>
            <p className="text-xs text-slate-400">
              {isStandalone
                ? "অ্যাপটি বর্তমানে অ্যান্ড্রয়েড নেটিভ মোডে চলছে।"
                : "আপনার ফোনে ১-ক্লিকে ইনস্টল করে সরাসরি অ্যাপ হিসেবে ব্যবহার করুন।"}
            </p>
          </div>
        </div>

        {/* Close button with high z-index and active click target */}
        <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onClose();
            }}
            aria-label="Close modal"
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 active:bg-white/30 text-slate-300 hover:text-white transition shrink-0 cursor-pointer shadow-md z-30"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex items-center border-b border-slate-800 text-xs font-bold px-6 bg-slate-950/40">
          <button
            onClick={() => setActiveTab("install")}
            className={`py-3 px-3 border-b-2 transition ${
              activeTab === "install"
                ? "border-emerald-500 text-emerald-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            ইনস্টল অপশন
          </button>
          <button
            onClick={() => setActiveTab("features")}
            className={`py-3 px-3 border-b-2 transition ${
              activeTab === "features"
                ? "border-emerald-500 text-emerald-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            অ্যাপ ফিচারসমূহ
          </button>
          <button
            onClick={() => setActiveTab("guide")}
            className={`py-3 px-3 border-b-2 transition ${
              activeTab === "guide"
                ? "border-emerald-500 text-emerald-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            ইনস্টলেশন গাইড
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 max-h-[65vh] overflow-y-auto">
          {activeTab === "install" && (
            <div className="space-y-5">
              {isStandalone ? (
                <div className="p-5 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-emerald-400">অ্যাপটি ইনস্টল রয়েছে!</h4>
                    <p className="text-xs text-slate-300 mt-0.5">
                      আপনি ইতোমধ্যে স্মার্টশপের অ্যান্ড্রয়েড ফুল-স্ক্রিন অ্যাপ ব্যবহার করছেন।
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
                      className="w-full py-3.5 px-4 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-slate-950 font-black rounded-2xl text-sm shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 transition"
                    >
                      <Download className="w-5 h-5 text-slate-950" />
                      <span>অ্যান্ড্রয়েড ফোনে সরাসরি ইনস্টল করুন (Install App)</span>
                    </button>
                  ) : (
                    <div className="p-4 bg-indigo-950/40 border border-indigo-500/30 rounded-2xl space-y-3">
                      <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs">
                        <Smartphone className="w-4 h-4 text-emerald-400" />
                        <span>অ্যান্ড্রয়েড ইনস্টলেশন নির্দেশিকা:</span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        আপনার অ্যান্ড্রয়েড ক্রোম (Chrome) বা স্যামসাং ব্রাউজারের মেনু থেকে <strong>"Add to Home screen"</strong> অথবা <strong>"Install app"</strong> অপশনে ট্যাপ করলেই ফোনের অ্যাপ ড্রয়ারে যুক্ত হয়ে যাবে।
                      </p>
                    </div>
                  )}
                </>
              )}

              {/* QR Code & Mobile Scan Box */}
              <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-2xl flex flex-col sm:flex-row items-center gap-4">
                <div className="w-28 h-28 bg-white p-2 rounded-xl flex items-center justify-center shrink-0 shadow-md">
                  {/* SVG QR Code representation */}
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
                  <QrCode className="w-12 h-12 text-slate-900 hidden" />
                </div>
                <div className="space-y-2 text-center sm:text-left flex-1">
                  <span className="text-[10px] font-black uppercase text-emerald-400 tracking-wider">
                    মোবাইল ক্যামেরা দিয়ে স্ক্যান করুন
                  </span>
                  <h4 className="text-xs font-bold text-white">
                    যেকোনো অ্যান্ড্রয়েড ফোনে সরাসরি খুলুন
                  </h4>
                  <p className="text-[11px] text-slate-400 leading-tight">
                    ফোনের ক্যামেরা বা QR স্ক্যানার দিয়ে স্ক্যান করলেই তাৎক্ষণিকভাবে ইনস্টলেশন পেজ ওপেন হবে।
                  </p>
                </div>
              </div>

              {/* Share and Copy buttons */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleCopyLink}
                  className="py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl border border-slate-700 flex items-center justify-center gap-1.5 transition"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? "লিংক কপি হয়েছে!" : "অ্যাপ লিংক কপি"}</span>
                </button>

                <button
                  onClick={handleShareWhatsApp}
                  className="py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition"
                >
                  <Share2 className="w-4 h-4" />
                  <span>হোয়াটসঅ্যাপে শেয়ার</span>
                </button>
              </div>
            </div>
          )}

          {activeTab === "features" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 bg-slate-800/60 border border-slate-700/60 rounded-xl space-y-1.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <Zap className="w-4 h-4" />
                </div>
                <h4 className="font-bold text-white">তাত্ক্ষণিক লোডিং ও হাই স্পিড</h4>
                <p className="text-[11px] text-slate-400">
                  অ্যান্ড্রয়েড ডিভাইসে নেটিভ অ্যাপের মতো অত্যন্ত দ্রুত ওপেন হয়।
                </p>
              </div>

              <div className="p-3.5 bg-slate-800/60 border border-slate-700/60 rounded-xl space-y-1.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <h4 className="font-bold text-white">AI বিজনেস অপারেটর অ্যাক্সেস</h4>
                <p className="text-[11px] text-slate-400">
                  মোবাইল থেকেই মার্কেটিং, লিড ও সেলস অডিট এক স্পর্শে পরিচালনা করুন।
                </p>
              </div>

              <div className="p-3.5 bg-slate-800/60 border border-slate-700/60 rounded-xl space-y-1.5">
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <h4 className="font-bold text-white">অফলাইন স্টোরেজ সাপোর্ট</h4>
                <p className="text-[11px] text-slate-400">
                  ইন্টারনেট ধীরগতির হলেও পূর্বের ডাটা ব্রাউজ ও পর্যালোচনা করা যায়।
                </p>
              </div>

              <div className="p-3.5 bg-slate-800/60 border border-slate-700/60 rounded-xl space-y-1.5">
                <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                  <BellRing className="w-4 h-4" />
                </div>
                <h4 className="font-bold text-white">পুশ নোটিফিকেশন রেডি</h4>
                <p className="text-[11px] text-slate-400">
                  নতুন অর্ডার, ড্রপ-অফ অ্যালার্ট এবং কাস্টমার ইনকোয়ারি সাথে সাথে জানান।
                </p>
              </div>
            </div>
          )}

          {activeTab === "guide" && (
            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-800/50 rounded-xl border border-slate-700 flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 font-black flex items-center justify-center shrink-0 text-xs">
                  ১
                </span>
                <div>
                  <h4 className="font-bold text-white">গুগল ক্রোম (Google Chrome) এ ওপেন করুন</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    অ্যান্ড্রয়েড ফোনের Chrome বা Samsung Internet ব্রাউজারে লিংকটি প্রবেশ করান।
                  </p>
                </div>
              </div>

              <div className="p-3 bg-slate-800/50 rounded-xl border border-slate-700 flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 font-black flex items-center justify-center shrink-0 text-xs">
                  ২
                </span>
                <div>
                  <h4 className="font-bold text-white">৩-ডট মেনু (⋮) বা ইনস্টল আইকন চাপুন</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    অ্যাড্রেস বারের ডানপাশে থাকা ৩-ডট আইকনে ক্লিক করে <strong>'Install app'</strong> বা <strong>'Add to Home screen'</strong> বেছে নিন।
                  </p>
                </div>
              </div>

              <div className="p-3 bg-slate-800/50 rounded-xl border border-slate-700 flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 font-black flex items-center justify-center shrink-0 text-xs">
                  ৩
                </span>
                <div>
                  <h4 className="font-bold text-white">ইনস্টল নিশ্চিত করুন</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    'Install' বাটনে ট্যাপ করলেই স্বয়ংক্রিয়ভাবে একটি আলাদা অ্যান্ড্রয়েড অ্যাপ হিসেবে আপনার ফোনে সেভ হয়ে যাবে।
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 px-6 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            100% সুরক্ষিত ও ভেরিফাইড অ্যান্ড্রয়েড PWA
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold transition"
          >
            বন্ধ করুন
          </button>
        </div>
      </div>
    </div>
  );
};
