import React from "react";
import { useStore } from "../../context/StoreContext";
import { t } from "../../utils/i18n";
import {
  ShieldCheck,
  Shield,
  Lock,
  CheckCircle2,
  CreditCard,
  Award,
  RotateCcw,
  PackageCheck,
  Truck,
  Star,
  Headphones,
  Globe,
  Mail,
  Phone,
  MapPin,
  Facebook,
  Instagram,
  Youtube,
  Linkedin,
  Twitter,
  Smartphone,
  Download,
} from "lucide-react";

export const SHOW_SECURITY_TRUST_SECTION = false;
export const SHOW_PAYMENT_METHODS_FOOTER = false;

export const SecurityTrustSection: React.FC<{ securityLabels?: any[] }> = ({ securityLabels = [] }) => {
  const activeFooterLabels = securityLabels
    .filter((lbl) => lbl.isActive && lbl.pagePlacement.includes("footer"))
    .sort((a, b) => a.displayOrder - b.displayOrder);

  const getLabelIcon = (iconName: string) => {
    switch (iconName) {
      case "Lock":
        return <Lock className="w-5 h-5 text-emerald-400" />;
      case "ShieldCheck":
        return <ShieldCheck className="w-5 h-5 text-indigo-400" />;
      case "Shield":
        return <Shield className="w-5 h-5 text-blue-400" />;
      case "CheckCircle2":
        return <CheckCircle2 className="w-5 h-5 text-teal-400" />;
      case "CreditCard":
        return <CreditCard className="w-5 h-5 text-purple-400" />;
      case "Award":
        return <Award className="w-5 h-5 text-amber-400" />;
      case "RefreshCw":
        return <RotateCcw className="w-5 h-5 text-sky-400" />;
      case "PackageCheck":
        return <PackageCheck className="w-5 h-5 text-emerald-400" />;
      case "Truck":
        return <Truck className="w-5 h-5 text-blue-400" />;
      case "Star":
        return <Star className="w-5 h-5 text-amber-400 fill-amber-400/20" />;
      case "Headphones":
        return <Headphones className="w-5 h-5 text-indigo-400" />;
      case "Globe":
        return <Globe className="w-5 h-5 text-cyan-400" />;
      default:
        return <ShieldCheck className="w-5 h-5 text-indigo-400" />;
    }
  };

  return (
    <div className="border-b border-slate-800 bg-slate-950/80 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <h3 className="text-white text-sm font-extrabold uppercase tracking-wider">
              Verified Security & Trust Guarantees
            </h3>
          </div>
          <span className="text-[11px] text-slate-400 font-medium">
            100% Encrypted & Authenticated Storefront
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {activeFooterLabels.map((label) => (
            <div
              key={label.id}
              className="bg-slate-900/90 p-3.5 rounded-xl border border-slate-800 hover:border-slate-700 transition-all flex items-center gap-3 group"
            >
              <div className="p-2 rounded-lg bg-slate-800/80 group-hover:scale-110 transition-transform shrink-0">
                {getLabelIcon(label.iconName)}
              </div>
              <div className="overflow-hidden">
                <h4 className="text-white font-bold text-xs truncate group-hover:text-indigo-300 transition-colors">
                  {label.title}
                </h4>
                <p className="text-[10px] text-slate-400 line-clamp-1 leading-snug">
                  {label.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const PaymentMethodsFooter: React.FC = () => {
  return (
    <div className="flex items-center gap-2.5 text-slate-400 font-bold">
      <span className="px-2.5 py-1 bg-slate-900 rounded-lg border border-slate-800 text-pink-400 text-[11px]">
        bKash
      </span>
      <span className="px-2.5 py-1 bg-slate-900 rounded-lg border border-slate-800 text-orange-400 text-[11px]">
        Nagad
      </span>
      <span className="px-2.5 py-1 bg-slate-900 rounded-lg border border-slate-800 text-indigo-400 text-[11px]">
        Rocket
      </span>
      <span className="px-2.5 py-1 bg-slate-900 rounded-lg border border-slate-800 text-blue-400 text-[11px]">
        SSLCommerz
      </span>
      <span className="px-2.5 py-1 bg-slate-900 rounded-lg border border-slate-800 text-emerald-400 text-[11px]">
        Stripe 256-Bit
      </span>
    </div>
  );
};

export const Footer: React.FC = () => {
  const { setStoreView, setMode, securityLabels, language, settings } = useStore();

  const siteName = settings.websiteName || settings.siteName || "SmartShop";
  const tagline = settings.tagline || "Premium E-Commerce";

  return (
    <footer className="bg-slate-900 text-slate-400 text-sm border-t border-slate-800">
      {/* Security & Trust section hidden via feature flag */}
      {SHOW_SECURITY_TRUST_SECTION && <SecurityTrustSection securityLabels={securityLabels} />}

      {/* Main Footer Navigation Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center gap-2.5">
            {settings.logoUrl ? (
              <img
                src={settings.logoUrl}
                alt={siteName}
                className="h-9 max-w-[160px] object-contain"
              />
            ) : (
              <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-extrabold text-lg shadow-sm">
                {siteName.substring(0, 1).toUpperCase()}
              </div>
            )}
            <div>
              <span className="text-lg font-extrabold text-white tracking-tight block leading-none">
                {siteName}
              </span>
              <span className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase">
                {tagline}
              </span>
            </div>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
            {language === "BN"
              ? `${siteName} বাংলাদেশের অন্যতম বিশ্বস্ত ই-কমার্স প্ল্যাটফর্ম। সেরা মূল্যে অরিজিনাল গ্যাজেট, ফ্যাশন এবং হোম অ্যাপ্লায়েন্স কিনুন।`
              : `${siteName} is Bangladesh's premium e-commerce platform offering verified electronic gadgets, fashion apparel, home appliances, and lifestyle goods with nationwide fast delivery.`}
          </p>

          <div className="space-y-2 text-xs text-slate-400 pt-1">
            <p className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-indigo-400 shrink-0" />
              <span>Tejgaon Industrial Area, Dhaka-1208, Bangladesh</span>
            </p>
            <p className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{settings.supportPhone || "+880 1700-000000"}</span>
            </p>
            <p className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-amber-400 shrink-0" />
              <span>{settings.supportEmail || "support@smartshop.com"}</span>
            </p>
          </div>

          {/* Social Media Links */}
          <div className="pt-2 flex items-center gap-3">
            <a
              href="#facebook"
              onClick={(e) => e.preventDefault()}
              className="w-8 h-8 rounded-full bg-slate-800 hover:bg-indigo-600 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
              title="Facebook"
            >
              <Facebook className="w-4 h-4" />
            </a>
            <a
              href="#instagram"
              onClick={(e) => e.preventDefault()}
              className="w-8 h-8 rounded-full bg-slate-800 hover:bg-rose-600 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
              title="Instagram"
            >
              <Instagram className="w-4 h-4" />
            </a>
            <a
              href="#youtube"
              onClick={(e) => e.preventDefault()}
              className="w-8 h-8 rounded-full bg-slate-800 hover:bg-red-600 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
              title="YouTube"
            >
              <Youtube className="w-4 h-4" />
            </a>
            <a
              href="#linkedin"
              onClick={(e) => e.preventDefault()}
              className="w-8 h-8 rounded-full bg-slate-800 hover:bg-blue-600 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
              title="LinkedIn"
            >
              <Linkedin className="w-4 h-4" />
            </a>
            <a
              href="#twitter"
              onClick={(e) => e.preventDefault()}
              className="w-8 h-8 rounded-full bg-slate-800 hover:bg-sky-500 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
              title="Twitter"
            >
              <Twitter className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Company Links */}
        <div>
          <h4 className="text-white font-bold text-sm mb-4">{t("company", language)}</h4>
          <ul className="space-y-2 text-xs">
            <li>
              <button onClick={() => setStoreView("about-us")} className="hover:text-indigo-400 transition-colors">
                {t("about_us", language)}
              </button>
            </li>
            <li>
              <button onClick={() => setStoreView("contact-us")} className="hover:text-indigo-400 transition-colors">
                {t("contact_us", language)}
              </button>
            </li>
            <li>
              <button onClick={() => setStoreView("careers")} className="hover:text-indigo-400 transition-colors">
                {t("careers", language)}
              </button>
            </li>
            <li>
              <button onClick={() => setStoreView("privacy-policy")} className="hover:text-indigo-400 transition-colors">
                {t("privacy_policy", language)}
              </button>
            </li>
            <li>
              <button onClick={() => setStoreView("terms-conditions")} className="hover:text-indigo-400 transition-colors">
                {t("terms_conditions", language)}
              </button>
            </li>
          </ul>
        </div>

        {/* Customer Links */}
        <div>
          <h4 className="text-white font-bold text-sm mb-4">{t("customer_care", language)}</h4>
          <ul className="space-y-2 text-xs">
            <li>
              <button onClick={() => setStoreView("profile")} className="hover:text-indigo-400 transition-colors">
                {t("my_account", language)}
              </button>
            </li>
            <li>
              <button onClick={() => setStoreView("orders")} className="hover:text-indigo-400 transition-colors">
                {t("my_orders", language)}
              </button>
            </li>
            <li>
              <button onClick={() => setStoreView("wishlist")} className="hover:text-indigo-400 transition-colors">
                {t("wishlist", language)}
              </button>
            </li>
            <li>
              <button onClick={() => setStoreView("return-policy")} className="hover:text-indigo-400 transition-colors">
                {t("return_policy", language)}
              </button>
            </li>
          </ul>
        </div>

        {/* Admin Portal Gateway */}
        <div>
          <h4 className="text-white font-bold text-sm mb-4">{t("admin_center", language)}</h4>
          <p className="text-xs text-slate-400 mb-3 leading-relaxed">
            Authorized management console for catalog, orders, and system settings.
          </p>
          <button
            onClick={() => setMode("admin")}
            className="w-full bg-slate-800 hover:bg-slate-700 text-indigo-400 font-bold text-xs py-2.5 px-3 rounded-xl border border-slate-700 transition-colors shadow-xs"
          >
            {t("launch_admin", language)}
          </button>
        </div>
      </div>

      {/* Android App Showcase Banner */}
      <div className="border-t border-slate-800/80 bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 py-5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-center sm:text-left">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-600 flex items-center justify-center text-slate-950 shadow-md shadow-emerald-500/20 shrink-0">
              <Smartphone className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <h4 className="text-sm font-black text-white">SmartShop Android Mobile App</h4>
                <span className="px-2 py-0.2 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold rounded-md">
                  v2.4.0 Live
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                আপনার অ্যান্ড্রয়েড ফোনে সরাসরি অ্যাপ হিসেবে ইনস্টল করুন — কোনো স্টোর ঝামেলা ছাড়া ১-ক্লিকে ইনস্টল ও অফলাইন সুবিধা।
              </p>
            </div>
          </div>

          <button
            onClick={() => window.dispatchEvent(new CustomEvent("open-android-install"))}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-slate-950 font-black text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition shrink-0"
          >
            <Download className="w-4 h-4 text-slate-950" />
            <span>অ্যান্ড্রয়েড অ্যাপ ইনস্টল (Install App)</span>
          </button>
        </div>
      </div>

      {/* Copyright Bar */}
      <div className="border-t border-slate-800 bg-slate-950 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-center sm:text-left">
          <p>© 2026 SmartShop E-Commerce System. All rights reserved.</p>
          {SHOW_PAYMENT_METHODS_FOOTER && <PaymentMethodsFooter />}
        </div>
      </div>
    </footer>
  );
};
