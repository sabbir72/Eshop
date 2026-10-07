import React, { useState } from "react";
import { useStore } from "../../context/StoreContext";
import { Settings, Save, Globe, CreditCard, ShieldCheck, Truck, AlertCircle, ArrowRight, Image as ImageIcon, Gift, MessageSquare, Sparkles } from "lucide-react";
import { parseSafeNumber } from "../../utils/numberUtils";

export const SettingsCMS: React.FC = () => {
  const { settings, updateSettings, addToast, recordAuditLog, setAdminView, activeRole } = useStore();

  const [siteName, setSiteName] = useState(settings.siteName || "Smart E-Commerce");
  const [currency, setCurrency] = useState(settings.currency || "BDT");
  const [currencySymbol, setCurrencySymbol] = useState(settings.currencySymbol || "৳");
  const [taxRate, setTaxRate] = useState(settings.taxRate ?? 5);
  const [shippingCharge, setShippingCharge] = useState(settings.shippingCharge ?? 60);
  const [supportEmail, setSupportEmail] = useState(settings.supportEmail || "support@smartecom.com");
  const [supportPhone, setSupportPhone] = useState(settings.supportPhone || "+880 1700-000000");

  // Gift Wrapping & Messaging configuration
  const [enableGiftWrapping, setEnableGiftWrapping] = useState<boolean>(
    settings.enableGiftWrapping !== false
  );
  const [giftWrappingCharge, setGiftWrappingCharge] = useState<number>(
    settings.giftWrappingCharge ?? 50
  );
  const [enableGiftSms, setEnableGiftSms] = useState<boolean>(
    settings.enableGiftSms !== false
  );
  const [giftSmsCharge, setGiftSmsCharge] = useState<number>(
    settings.giftSmsCharge ?? 0
  );
  const [defaultGiftGreeting, setDefaultGiftGreeting] = useState<string>(
    settings.defaultGiftGreeting || "Warmest wishes from Smart Shop!"
  );

  // Payment Gateways configuration
  const supportedGateways = ["bKash", "Nagad", "Rocket", "SSLCommerz", "Cash On Delivery"];
  const [paymentGateways, setPaymentGateways] = useState<Record<string, boolean>>(
    settings.paymentGateways || {
      "bKash": true,
      "Nagad": true,
      "Rocket": true,
      "SSLCommerz": true,
      "Cash On Delivery": true,
    }
  );

  const [sslCommerzOnlyOnline, setSslCommerzOnlyOnline] = useState<boolean>(
    settings.sslCommerzOnlyOnline ?? false
  );

  // COD Configuration
  const [codMinOrderAmount, setCodMinOrderAmount] = useState<number>(
    settings.codMinOrderAmount ?? 100
  );
  const [codMaxOrderAmount, setCodMaxOrderAmount] = useState<number>(
    settings.codMaxOrderAmount ?? 50000
  );
  const [codAllowedDistricts, setCodAllowedDistricts] = useState<string>(
    (settings.codAllowedDistricts || [
      "Dhaka",
      "Chittagong",
      "Sylhet",
      "Gazipur",
      "Narayanganj",
      "Rajshahi",
      "Khulna",
      "Barishal",
      "Rangpur",
      "Mymensingh",
      "Cumilla",
    ]).join(", ")
  );

  const handleToggleGateway = (gateway: string) => {
    const isCurrentlyActive = paymentGateways[gateway] !== false;
    const activeCount = Object.entries(paymentGateways).filter(
      ([key, val]) => supportedGateways.includes(key) && val !== false
    ).length;

    // Rule: At least one payment gateway must always remain active
    if (isCurrentlyActive && activeCount <= 1) {
      addToast(
        "Business Rule Violation: At least one payment gateway must always remain active!",
        "warning"
      );
      return;
    }

    setPaymentGateways((prev) => ({
      ...prev,
      [gateway]: !isCurrentlyActive,
    }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    // Verify at least one active gateway
    const activeCount = supportedGateways.filter((g) => paymentGateways[g] !== false).length;
    if (activeCount < 1) {
      addToast("Error: At least one payment gateway must remain active!", "error");
      return;
    }

    const districtsList = codAllowedDistricts
      .split(",")
      .map((d) => d.trim())
      .filter((d) => d.length > 0);

    updateSettings({
      siteName,
      currency,
      currencySymbol,
      taxRate,
      shippingCharge,
      supportEmail,
      supportPhone,
      enableGiftWrapping,
      giftWrappingCharge,
      enableGiftSms,
      giftSmsCharge,
      defaultGiftGreeting,
      paymentGateways,
      sslCommerzOnlyOnline,
      codMinOrderAmount,
      codMaxOrderAmount,
      codAllowedDistricts: districtsList,
    });

    recordAuditLog("Updated Store System, Gift Wrapping & Payment Gateway Settings", "Settings");
    addToast("System, Gift Services & Payment settings saved successfully!", "success");
  };

  return (
    <div className="space-y-6 pb-16">
      <div className="bg-slate-900 text-white p-6 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-md">
        <div>
          <h1 className="text-2xl font-black tracking-tight">System Settings & Payment Configuration</h1>
          <p className="text-xs text-slate-300">
            Configure store branding, payment gateways, Cash On Delivery rules & security settings
          </p>
        </div>

        <button
          type="button"
          onClick={() => setAdminView("website-profile")}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-xs transition-all active:scale-95 shrink-0"
        >
          <ImageIcon className="w-4 h-4" />
          <span>Website Logo & Profile</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Section 1: Store Branding & Financial Configuration */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="font-bold text-slate-900 text-sm border-b border-slate-200 pb-3 flex items-center gap-2">
            <Globe className="w-4 h-4 text-blue-600" /> Store Branding & Financial Configuration
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">E-Commerce Brand Name</label>
              <input
                type="text"
                required
                value={siteName}
                onChange={(e) => setSiteName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Currency Code</label>
              <input
                type="text"
                required
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-mono focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Currency Symbol</label>
              <input
                type="text"
                required
                value={currencySymbol}
                onChange={(e) => setCurrencySymbol(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-mono font-bold focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Default Tax / VAT Rate (%)</label>
              <input
                type="number"
                step="any"
                required
                min={0}
                value={taxRate}
                onChange={(e) => setTaxRate(parseSafeNumber(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Flat Shipping Charge ({currencySymbol})</label>
              <input
                type="number"
                step="any"
                required
                min={0}
                value={shippingCharge}
                onChange={(e) => setShippingCharge(parseSafeNumber(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Customer Support Email</label>
              <input
                type="email"
                required
                value={supportEmail}
                onChange={(e) => setSupportEmail(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Payment Gateways Configuration */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-emerald-600" /> Payment Gateways & Processing
            </h3>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              Configurable Gateways
            </span>
          </div>

          <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-xl text-xs text-blue-900 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <p>
              <strong>Business Rules Enforced:</strong> Disabled gateways will be hidden from customer checkout immediately. At least one payment method must remain active at all times.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {supportedGateways.map((gateway) => {
              const isActive = paymentGateways[gateway] !== false;
              return (
                <div
                  key={gateway}
                  className={`p-4 rounded-xl border transition-all flex items-center justify-between ${
                    isActive
                      ? "bg-slate-50 border-slate-300 shadow-2xs"
                      : "bg-slate-100/60 border-slate-200 opacity-60"
                  }`}
                >
                  <div>
                    <h4 className="font-bold text-slate-900 text-xs">{gateway}</h4>
                    <p className="text-[11px] text-slate-500">
                      {isActive ? "Active on Checkout" : "Disabled for Customers"}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleToggleGateway(gateway)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      isActive ? "bg-emerald-600" : "bg-slate-300"
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                        isActive ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
              );
            })}
          </div>

          {/* Primary Gateway Option for SSLCommerz */}
          <div className="pt-3 border-t border-slate-100 space-y-2">
            <label className="flex items-start gap-3 cursor-pointer p-3.5 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100/70 transition-colors">
              <input
                type="checkbox"
                checked={sslCommerzOnlyOnline}
                onChange={(e) => setSslCommerzOnlyOnline(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-blue-500 mt-0.5"
              />
              <div className="text-xs">
                <span className="font-bold text-slate-900 block">
                  Process Online Payments Through SSLCommerz Primary Gateway Only
                </span>
                <span className="text-slate-500 block text-[11px] mt-0.5">
                  When enabled, direct mobile banking options (bKash, Nagad, Rocket) are hidden from checkout and all online digital payments are consolidated securely through SSLCommerz.
                </span>
              </div>
            </label>
          </div>
        </div>

        {/* Section 3: Gift Wrapping & Gift SMS / Greeting Card Settings */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-3">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Gift className="w-4 h-4 text-pink-600" /> Gift Wrapping & SMS Greeting Service
            </h3>
            <span className="text-[11px] font-semibold text-pink-700 bg-pink-50 border border-pink-200 px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-pink-500" /> Premium Checkout Feature
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {/* Gift Wrapping Toggle & Fee */}
            <div className="p-4 bg-pink-50/50 rounded-xl border border-pink-100 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Gift className="w-4 h-4 text-pink-600" />
                  <span className="font-bold text-slate-900">Enable Gift Wrapping at Checkout</span>
                </div>
                <button
                  type="button"
                  onClick={() => setEnableGiftWrapping(!enableGiftWrapping)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    enableGiftWrapping ? "bg-pink-600" : "bg-slate-300"
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                      enableGiftWrapping ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
              <p className="text-[11px] text-slate-500">
                Allows customers to select premium handcrafted gift wrapping with custom ribbons during checkout.
              </p>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Gift Wrapping Charge ({currencySymbol})
                </label>
                <input
                  type="number"
                  min={0}
                  step="any"
                  disabled={!enableGiftWrapping}
                  value={giftWrappingCharge}
                  onChange={(e) => setGiftWrappingCharge(Math.max(0, parseSafeNumber(e.target.value)))}
                  className="w-full bg-white border border-slate-200 rounded-xl p-2.5 font-bold focus:ring-2 focus:ring-pink-500/20 focus:outline-none disabled:opacity-50"
                  placeholder="50"
                />
                <p className="text-[10px] text-slate-400 mt-1">Fee automatically added to grand total when selected.</p>
              </div>
            </div>

            {/* Gift SMS & Message Service */}
            <div className="p-4 bg-purple-50/50 rounded-xl border border-purple-100 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-purple-600" />
                  <span className="font-bold text-slate-900">Enable Recipient Gift SMS & Note</span>
                </div>
                <button
                  type="button"
                  onClick={() => setEnableGiftSms(!enableGiftSms)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    enableGiftSms ? "bg-purple-600" : "bg-slate-300"
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                      enableGiftSms ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
              <p className="text-[11px] text-slate-500">
                Sends personalized SMS notifications to the gift recipient and prints greeting note on packing slips.
              </p>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Default Gift Greeting Note
                </label>
                <input
                  type="text"
                  disabled={!enableGiftSms}
                  value={defaultGiftGreeting}
                  onChange={(e) => setDefaultGiftGreeting(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl p-2.5 font-medium focus:ring-2 focus:ring-purple-500/20 focus:outline-none disabled:opacity-50"
                  placeholder="Warmest wishes from Smart Shop!"
                />
                <p className="text-[10px] text-slate-400 mt-1">Pre-filled greeting inspiration for customers.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Section 4: Cash On Delivery (COD) Rules */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="font-bold text-slate-900 text-sm border-b border-slate-200 pb-3 flex items-center gap-2">
            <Truck className="w-4 h-4 text-indigo-600" /> Cash On Delivery (COD) Region & Order Rules
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Minimum Order Amount for COD ({currencySymbol})
              </label>
              <input
                type="number"
                step="any"
                min={0}
                value={codMinOrderAmount}
                onChange={(e) => setCodMinOrderAmount(parseSafeNumber(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
              />
              <p className="text-[10px] text-slate-500 mt-1">Orders below this amount must pay online.</p>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Maximum Order Amount for COD ({currencySymbol})
              </label>
              <input
                type="number"
                step="any"
                min={0}
                value={codMaxOrderAmount}
                onChange={(e) => setCodMaxOrderAmount(parseSafeNumber(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
              />
              <p className="text-[10px] text-slate-500 mt-1">Orders above this limit require online payment.</p>
            </div>

            <div className="sm:col-span-2">
              <label className="font-bold text-slate-700 block mb-1">
                Allowed Districts for Cash On Delivery (Comma Separated)
              </label>
              <textarea
                rows={2}
                value={codAllowedDistricts}
                onChange={(e) => setCodAllowedDistricts(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-medium focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                placeholder="Dhaka, Chittagong, Sylhet, Gazipur, Narayanganj..."
              />
              <p className="text-[10px] text-slate-500 mt-1">
                COD will only be accepted if the customer city matches one of these districts.
              </p>
            </div>
          </div>
        </div>

        {/* Submit Bar */}
        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold text-xs px-6 py-3 rounded-xl flex items-center gap-2 shadow-lg transition-all"
          >
            <Save className="w-4 h-4" /> Save System & Payment Configuration
          </button>
        </div>
      </form>
    </div>
  );
};
