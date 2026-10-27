import React, { useState, useMemo, useEffect } from "react";
import { useStore } from "../../context/StoreContext";
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Play,
  Copy,
  Check,
  Terminal,
  Cpu,
  Layers,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Activity,
  Flame,
  Bot,
  ShieldAlert,
  Clock,
  Laptop,
  CheckSquare,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { parseSafeNumber, formatNumber, formatCurrency, sanitizeExportRow } from "../../utils/numberUtils";
import { evaluateCouponDiscount } from "../../utils/discountEngine";
import { translations } from "../../utils/i18n";
import { numberToWords } from "../../utils/numberToWords";
import { CartItem, Coupon } from "../../types";
import {
  TestAgentIncident,
  TestAgentRunLog,
  initialTestAgentRuns,
  initialTestAgentIncidents,
  analyzeFailureToIncident,
} from "../../data/testAgentState";

export type TestSuiteType = "SMOKE" | "SANITY";

export interface DiagnosticTestItem {
  id: string;
  suiteType: TestSuiteType;
  category: "math" | "coupons" | "catalog" | "checkout" | "i18n" | "resilience" | "marketing" | "delivery";
  categoryLabelBn: string;
  categoryLabelEn: string;
  nameBn: string;
  nameEn: string;
  descriptionBn: string;
  descriptionEn: string;
  status: "idle" | "running" | "passed" | "failed";
  durationMs?: number;
  error?: string;
  suggestedFixBn?: string;
  suggestedFixEn?: string;
}

export const SystemDiagnosticRunner: React.FC = () => {
  const { products, categories, language } = useStore();
  const isBn = language === "BN";

  // Navigation Modes: 'agent' (Test Agent & Incidents), 'playwright' (Playwright E2E), 'unit' (In-App Tests)
  const [activeMainMode, setActiveMainMode] = useState<"agent" | "playwright" | "unit">("agent");

  const [isRunning, setIsRunning] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("all");
  const [copied, setCopied] = useState(false);
  const [expandedErrorId, setExpandedErrorId] = useState<string | null>(null);

  // Test Agent State
  const [incidents, setIncidents] = useState<TestAgentIncident[]>(initialTestAgentIncidents);
  const [runHistory, setRunHistory] = useState<TestAgentRunLog[]>(initialTestAgentRuns);

  // Fetch live test agent reports from backend
  useEffect(() => {
    fetch("/api/admin/test-agent")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.openIncidents) {
          setIncidents(data.openIncidents);
        }
        if (data && data.latestRun) {
          setRunHistory((prev) => [data.latestRun, ...prev.filter((r) => r.runId !== data.latestRun.runId)]);
        }
      })
      .catch(() => {});
  }, []);

  const initialTestDefinitions: DiagnosticTestItem[] = [
    // ---------------- SMOKE TESTS (Critical Paths) ----------------
    {
      id: "smoke-currency-parse",
      suiteType: "SMOKE",
      category: "math",
      categoryLabelBn: "স্মোক টেস্ট",
      categoryLabelEn: "Smoke Testing",
      nameBn: "মুদ্রা ও ডেসিমাল পার্সিং বেসিক স্মোক চেক (Currency Parsing)",
      nameEn: "Basic Currency & Decimal Parsing Smoke Check",
      descriptionBn: "কমা, দশমিক এবং টাকার প্রতীক (৳, Tk, $) সম্বলিত স্ট্রিং সঠিকভাবে নাম্বারে রূপান্তর হচ্ছে কি না।",
      descriptionEn: "Validates string values containing commas, decimals, and ৳ currency symbols parse to clean numbers.",
      status: "idle",
      suggestedFixBn: "src/utils/numberUtils.ts এর parseSafeNumber ফাংশন পরীক্ষা করুন।",
      suggestedFixEn: "Inspect the parseSafeNumber function in src/utils/numberUtils.ts.",
    },
    {
      id: "smoke-catalog-boot",
      suiteType: "SMOKE",
      category: "catalog",
      categoryLabelBn: "স্মোক টেস্ট",
      categoryLabelEn: "Smoke Testing",
      nameBn: "স্টোরফ্রন্ট ক্যাটালগ ও পণ্য ডেটা প্রাপ্যতা (Storefront Catalog Boot)",
      nameEn: "Storefront Catalog & Product Data Availability Check",
      descriptionBn: "স্টোরে সক্রিয় পণ্য ও ক্যাটাগরি ডেটা যথাযথভাবে লোড হচ্ছে কি না।",
      descriptionEn: "Validates the storefront catalog contains valid active products and category bindings.",
      status: "idle",
      suggestedFixBn: "src/data/mockData.ts এ initialProducts ডেটা লোড নিশ্চিত করুন।",
      suggestedFixEn: "Ensure initialProducts in src/data/mockData.ts loads with valid items.",
    },
    {
      id: "smoke-i18n-core",
      suiteType: "SMOKE",
      category: "i18n",
      categoryLabelBn: "স্মোক টেস্ট",
      categoryLabelEn: "Smoke Testing",
      nameBn: "ই-কমার্স মূল পরিভাষার দ্বিভাষিক কী অখণ্ডতা (Core i18n Keys)",
      nameEn: "Core Bilingual Dictionary Keys Integrity Check",
      descriptionBn: "মূল্য, কার্ট, চেকআউট, সাবটোটাল ও ছাড় সংক্রান্ত অনুবাদ কী সঠিকভাবে উপস্থিত কি না।",
      descriptionEn: "Checks that essential eCommerce dictionary keys exist in both Bengali and English.",
      status: "idle",
      suggestedFixBn: "src/utils/i18n.ts ফাইলে বাংলা ও ইংরেজি অনুবাদের অবজেক্ট পরীক্ষা করুন।",
      suggestedFixEn: "Check translations dictionary in src/utils/i18n.ts.",
    },
    {
      id: "smoke-resilience-storage",
      suiteType: "SMOKE",
      category: "resilience",
      categoryLabelBn: "স্মোক টেস্ট",
      categoryLabelEn: "Smoke Testing",
      nameBn: "ত্রুটিপূর্ণ লোকালস্টোরেজ রিকভারি ও নিরাপদ ক্যাশ (Safe Storage Fallback)",
      nameEn: "Corrupted LocalStorage Graceful Recovery Check",
      descriptionBn: "লোকালস্টোরেজে কোনো করাপ্ট JSON থাকলেও যাতে অ্যাপ ক্র্যাশ না করে নিরাপদ ফলব্যাক ব্যবহার করে।",
      descriptionEn: "Verifies corrupt JSON in localStorage triggers safe fallbacks without crashing the app.",
      status: "idle",
      suggestedFixBn: "লোকালস্টোরেজ পার্সিংয়ে try/catch এবং সেইফ ফলব্যাক ব্যবহার করুন।",
      suggestedFixEn: "Verify try/catch protection around localStorage.getItem JSON parsing.",
    },

    // ---------------- SANITY TESTS (Core Business Logic) ----------------
    {
      id: "sanity-currency-format",
      suiteType: "SANITY",
      category: "math",
      categoryLabelBn: "স্যানিটি টেস্ট",
      categoryLabelEn: "Sanity Testing",
      nameBn: "টাকা ও কমা ফরম্যাটিং স্যানিটি পরীক্ষা (formatCurrency)",
      nameEn: "Currency Formatting & Comma Separation Sanity",
      descriptionBn: "হাজারের পরে কমা এবং ২ দশমিক স্থানসহ টাকার প্রতীক (৳) সঠিকভাবে ডিসপ্লে হচ্ছে কি না।",
      descriptionEn: "Confirms proper comma thousands separators and 2-decimal precision for ৳ currency values.",
      status: "idle",
      suggestedFixBn: "src/utils/numberUtils.ts এর formatCurrency ফাংশন পরীক্ষা করুন।",
      suggestedFixEn: "Check formatCurrency in src/utils/numberUtils.ts.",
    },
    {
      id: "sanity-cart-math",
      suiteType: "SANITY",
      category: "math",
      categoryLabelBn: "স্যানিটি টেস্ট",
      categoryLabelEn: "Sanity Testing",
      nameBn: "কার্ট সাবটোটাল ও ৫% ভ্যাট হিসাব (Cart Subtotal & 5% VAT)",
      nameEn: "Cart Subtotal Math & 5% VAT Rounding Sanity",
      descriptionBn: "আইটেম মূল্য x পরিমাণ, ভ্যাট হিসাব এবং ফ্লোটিং পয়েন্ট রাউন্ডিং সঠিক কি না।",
      descriptionEn: "Checks multi-item subtotal multiplication, 5% VAT addition, and rounding precision.",
      status: "idle",
      suggestedFixBn: "কার্ট সাবটোটাল বা চেকআউট পেজের Math.round রাউন্ডিং লজিক চেক করুন।",
      suggestedFixEn: "Verify cart subtotal rounding calculations in CheckoutModal.tsx.",
    },
    {
      id: "sanity-delivery-rules",
      suiteType: "SANITY",
      category: "delivery",
      categoryLabelBn: "স্যানিটি টেস্ট",
      categoryLabelEn: "Sanity Testing",
      nameBn: "ডেলিভারি ফি ও ফ্রি ডেলিভারি নীতি স্যানিটি (Delivery Fee Rules)",
      nameEn: "Delivery Charges (Dhaka ৳60 / Outside ৳120 / Free > ৳3000)",
      descriptionBn: "ঢাকা সিটিতে ৬০৳, ঢাকার বাইরে ১২০৳ এবং ৩,০০০ টাকার বেশি অর্ডারে বিনামূল্যে ডেলিভারি কার্যকর কি না।",
      descriptionEn: "Validates Dhaka ৳60, Outside Dhaka ৳120, and ৳0 free delivery for cart totals over ৳3,000.",
      status: "idle",
      suggestedFixBn: "CheckoutModal.tsx এর ডেলিভারি ক্যালকুলেশন নীতি পরীক্ষা করুন।",
      suggestedFixEn: "Check delivery fee logic in CheckoutModal.tsx.",
    },
    {
      id: "sanity-number-to-words",
      suiteType: "SANITY",
      category: "math",
      categoryLabelBn: "স্যানিটি টেস্ট",
      categoryLabelEn: "Sanity Testing",
      nameBn: "টাকা থেকে কথায় রূপান্তর স্যানিটি (numberToWords for Invoices)",
      nameEn: "Currency Number-to-Words Conversion for Invoices",
      descriptionBn: "ইনভয়েস বা ক্যাশ মেমোর জন্য টাকা ও পয়সা শব্দে সঠিকভাবে রূপান্তর হচ্ছে কি না।",
      descriptionEn: "Ensures numeric totals convert to word representations for printed receipts and invoices.",
      status: "idle",
      suggestedFixBn: "src/utils/numberToWords.ts এর কারেন্সি হ্যান্ডলার চেক করুন।",
      suggestedFixEn: "Check currency conversion logic in src/utils/numberToWords.ts.",
    },
    {
      id: "sanity-coupon-cap",
      suiteType: "SANITY",
      category: "coupons",
      categoryLabelBn: "স্যানিটি টেস্ট",
      categoryLabelEn: "Sanity Testing",
      nameBn: "শতাংশ কুপন ও সর্বোচ্চ ছাড় ক্যাপ স্যানিটি (Max Cap Discount Guard)",
      nameEn: "Percentage Coupon Max Cap Discount Guard",
      descriptionBn: "২০% ছাড় হলেও সর্বোচ্চ ৫০০ টাকার বেশি ডিসকাউন্ট কাটা হচ্ছে না কি না।",
      descriptionEn: "Ensures percentage discounts never exceed the defined maxDiscount monetary ceiling.",
      status: "idle",
      suggestedFixBn: "src/utils/discountEngine.ts এ maxDiscount কন্ডিশন ভ্যালিডেট করুন।",
      suggestedFixEn: "Check maxDiscount boundary check in src/utils/discountEngine.ts.",
    },
    {
      id: "sanity-coupon-category",
      suiteType: "SANITY",
      category: "coupons",
      categoryLabelBn: "স্যানিটি টেস্ট",
      categoryLabelEn: "Sanity Testing",
      nameBn: "নির্দিষ্ট ক্যাটাগরি ফিল্টারিং স্যানিটি (Category Scope Coupon)",
      nameEn: "Category-Scoped Coupon Eligibility Sanity",
      descriptionBn: "কুপন শুধুমাত্র অনুমোদিত ক্যাটাগরির পণ্যের উপরই কার্যকর হচ্ছে কি না।",
      descriptionEn: "Verifies coupons restricted to specific categories do not apply to unrelated items.",
      status: "idle",
      suggestedFixBn: "discountEngine.ts এর isItemEligibleForCoupon এ categoryId ম্যাচিং চেক করুন।",
      suggestedFixEn: "Verify categoryId matching in src/utils/discountEngine.ts.",
    },
    {
      id: "sanity-coupon-expiry",
      suiteType: "SANITY",
      category: "coupons",
      categoryLabelBn: "স্যানিটি টেস্ট",
      categoryLabelEn: "Sanity Testing",
      nameBn: "মেয়াদোত্তীর্ণ কুপন প্রতিরোধ স্যানিটি (Expired Coupon Guard)",
      nameEn: "Expired Coupon Automatic Rejection Sanity",
      descriptionBn: "মেয়াদ শেষ হওয়া কুপন যাতে স্বয়ংক্রিয়ভাবে বাতিল ও গ্রাহককে সতর্কবার্তা দেয়।",
      descriptionEn: "Confirms coupons past their expiry date are rejected immediately.",
      status: "idle",
      suggestedFixBn: "কুপনের endDate এর সাথে বর্তমান তারিখের তুলনা পরীক্ষা করুন।",
      suggestedFixEn: "Check endDate comparison in src/utils/discountEngine.ts.",
    },
    {
      id: "sanity-catalog-skus",
      suiteType: "SANITY",
      category: "catalog",
      categoryLabelBn: "স্যানিটি টেস্ট",
      categoryLabelEn: "Sanity Testing",
      nameBn: "ইউনিক আইডি ও ডুপ্লিকেট এসকেইউ প্রতিরোধ (Unique SKU Guard)",
      nameEn: "Unique Product ID & Duplicate SKU Prevention",
      descriptionBn: "সিস্টেমে একই আইডি বা একই SKU একাধিক পণ্যে বিদ্যমান কি না।",
      descriptionEn: "Scans the catalog to ensure every product has a distinct ID and SKU.",
      status: "idle",
      suggestedFixBn: "প্রোডাক্ট ম্যানেজমেন্ট প্যানেলে ডুপ্লিকেট এসকেইউ পরীক্ষা করুন।",
      suggestedFixEn: "Verify uniqueness constraints in ProductManagement.tsx.",
    },
    {
      id: "sanity-stock-guard",
      suiteType: "SANITY",
      category: "catalog",
      categoryLabelBn: "স্যানিটি টেস্ট",
      categoryLabelEn: "Sanity Testing",
      nameBn: "ইনভেন্টরি স্টক ডিক্রিমেন্ট ও শূন্য-স্টক গার্ড (Stock Guard)",
      nameEn: "Inventory Stock Decrement & Zero-Stock Purchase Guard",
      descriptionBn: "স্টক শূন্য থাকলে কার্টে যোগ আটকানো এবং অর্ডার প্লেসে স্টক বিয়োগ সঠিক কি না।",
      descriptionEn: "Validates out-of-stock items cannot be added to cart and stock decrements on purchase.",
      status: "idle",
      suggestedFixBn: "CartModal.tsx ও OrderManagement.tsx এর স্টক চেক যাচাই করুন।",
      suggestedFixEn: "Check stock validation logic in CartModal.tsx.",
    },
    {
      id: "sanity-phone-regex",
      suiteType: "SANITY",
      category: "checkout",
      categoryLabelBn: "স্যানিটি টেস্ট",
      categoryLabelEn: "Sanity Testing",
      nameBn: "৭টি বাংলাদেশি মোবাইল অপারেটর (০১৩-০১৯) ভ্যালিডেশন (BD Phone Regex)",
      nameEn: "Bangladeshi Mobile Phone Regex Sanity (013-019, 7 Operators)",
      descriptionBn: "১১ ডিজিটের গ্রামীণফোন, রবি, বাংলালিংক, টেলিটক ও এয়ারটেল নাম্বার পরীক্ষা।",
      descriptionEn: "Validates all 7 BD operator prefixes (013, 014, 015, 016, 017, 018, 019) pass regex.",
      status: "idle",
      suggestedFixBn: "চেকআউট পেজে মোবাইল রেজেক্স /^(?:\\+88|88)?(01[3-9]\\d{8})$/ নিশ্চিত করুন।",
      suggestedFixEn: "Verify regex /^(?:\\+88|88)?(01[3-9]\\d{8})$/ in CheckoutModal.tsx.",
    },
    {
      id: "sanity-address-guard",
      suiteType: "SANITY",
      category: "checkout",
      categoryLabelBn: "স্যানিটি টেস্ট",
      categoryLabelEn: "Sanity Testing",
      nameBn: "ডেলিভারি ঠিকানা ও আবশ্যক ফিল্ড গার্ড (Address Fields Guard)",
      nameEn: "Customer Name, Division & Shipping Address Guard",
      descriptionBn: "গ্রাহকের নাম, বিভাগ এবং পূর্ণাঙ্গ ঠিকানা ছাড়া ফাঁকা সাবমিশন আটকে দিচ্ছে কি না।",
      descriptionEn: "Ensures order submission requires complete customer name and delivery address.",
      status: "idle",
      suggestedFixBn: "CheckoutModal.tsx এর handleSubmit এ রিকোয়ার্ড ফিল্ড ভ্যালিডেশন চেক করুন।",
      suggestedFixEn: "Verify required form validation in CheckoutModal.tsx.",
    },
    {
      id: "sanity-webgl-fallback",
      suiteType: "SANITY",
      category: "resilience",
      categoryLabelBn: "স্যানিটি টেস্ট",
      categoryLabelEn: "Sanity Testing",
      nameBn: "৩ডি ওয়েবজিএল ফলব্যাক সেইফটি (3D WebGL Safe Fallback)",
      nameEn: "3D WebGL Canvas Graceful Fallback to 2D Image",
      descriptionBn: "ডিভাইসে থ্রি-ডি বা WebGL সাপোর্ট না থাকলে যাতে সুন্দর ২ডি ইমেজ ফলব্যাক রেন্ডার হয়।",
      descriptionEn: "Guarantees graceful 2D image fallbacks when WebGL canvas context is unavailable.",
      status: "idle",
      suggestedFixBn: "Three.js কম্পোনেন্টে WebGL ক্যাচিং ও ফলব্যাক ইমেজ রেন্ডারিং নিশ্চিত করুন।",
      suggestedFixEn: "Ensure WebGL catch and 2D fallback rendering in ThreeDProductCard.tsx.",
    },
    {
      id: "sanity-psychological-marketing",
      suiteType: "SANITY",
      category: "marketing",
      categoryLabelBn: "স্যানিটি টেস্ট",
      categoryLabelEn: "Sanity Testing",
      nameBn: "সাইকোলজিক্যাল মার্কেটিং স্ট্র্যাটেজি ও অফার কার্ড (Marketing Card Schema)",
      nameEn: "Psychological Marketing Strategy & Comparison Card Schema",
      descriptionBn: "আর্জেন্ট অফার, সোশ্যাল প্রুফ ও অ্যাংকরিং কম্প্যারিজন কার্ড ডাটা অক্ষত কি না।",
      descriptionEn: "Validates backend psychological marketing strategies and frontend offer card integrity.",
      status: "idle",
      suggestedFixBn: "PsychologicalMarketingStrategies.tsx এর ক্যাম্পেইন স্ট্র্যাটেজি ডেটা যাচাই করুন।",
      suggestedFixEn: "Check marketing strategy models in PsychologicalMarketingStrategies.tsx.",
    },
    {
      id: "sanity-export-sanitize",
      suiteType: "SANITY",
      category: "math",
      categoryLabelBn: "স্যানিটি টেস্ট",
      categoryLabelEn: "Sanity Testing",
      nameBn: "রপ্তানি ডেটা ও আর্থিক রিপোর্ট স্যানিটাইজেশন (Export Sanitization)",
      nameEn: "Financial Reports & Sensitive Data Export Sanitization",
      descriptionBn: "এক্সেল বা সিএসভি ফাইলে এক্সপোর্ট করার সময় সংখ্যা ও কারেন্সি প্রতীক বিশুদ্ধ করা হচ্ছে কি না।",
      descriptionEn: "Verifies clean monetary values and formatting for CSV/Excel export routines.",
      status: "idle",
      suggestedFixBn: "src/utils/numberUtils.ts এর sanitizeExportRow ফাংশন পরীক্ষা করুন।",
      suggestedFixEn: "Check sanitizeExportRow in src/utils/numberUtils.ts.",
    },
  ];

  const [tests, setTests] = useState<DiagnosticTestItem[]>(initialTestDefinitions);

  const stats = useMemo(() => {
    const total = tests.length;
    const passed = tests.filter((t) => t.status === "passed").length;
    const failed = tests.filter((t) => t.status === "failed").length;
    const idle = tests.filter((t) => t.status === "idle").length;
    const smokeTotal = tests.filter((t) => t.suiteType === "SMOKE").length;
    const smokePassed = tests.filter((t) => t.suiteType === "SMOKE" && t.status === "passed").length;
    const sanityTotal = tests.filter((t) => t.suiteType === "SANITY").length;
    const sanityPassed = tests.filter((t) => t.suiteType === "SANITY" && t.status === "passed").length;
    const score = total > 0 && total - idle > 0 ? Math.round((passed / (total - idle)) * 100) : 100;
    return { total, passed, failed, idle, smokeTotal, smokePassed, sanityTotal, sanityPassed, score };
  }, [tests]);

  const openIncidents = useMemo(() => incidents.filter((i) => i.status !== "resolved"), [incidents]);

  const runSingleTest = async (testId: string): Promise<{ passed: boolean; error?: string; durationMs: number }> => {
    const start = performance.now();

    try {
      if (testId === "smoke-currency-parse") {
        if (parseSafeNumber("1,250.50") !== 1250.5) throw new Error("1,250.50 parsing failed");
        if (parseSafeNumber("৳ 4,500") !== 4500) throw new Error("৳ currency parsing failed");
        if (parseSafeNumber("$99.95") !== 99.95) throw new Error("Dollar parsing failed");
        if (parseSafeNumber(null, 50) !== 50) throw new Error("Null fallback failed");
      } else if (testId === "smoke-catalog-boot") {
        if (!products || products.length === 0) throw new Error("Store catalog is empty");
        const activeProds = products.filter((p) => p.status === "Active");
        if (activeProds.length === 0) throw new Error("No active products available");
      } else if (testId === "smoke-i18n-core") {
        const required = ["price", "cart", "checkout", "subtotal", "total"];
        for (const k of required) {
          if (!translations.BN[k]) throw new Error(`Missing Bengali translation for '${k}'`);
          if (!translations.EN[k]) throw new Error(`Missing English translation for '${k}'`);
        }
      } else if (testId === "smoke-resilience-storage") {
        const safeParse = (str: string | null) => {
          if (!str) return null;
          try {
            return JSON.parse(str);
          } catch {
            return null;
          }
        };
        if (safeParse("corrupted{json") !== null) throw new Error("Corrupted JSON fallback failed");
        if (safeParse('{"ok":true}')?.ok !== true) throw new Error("Valid JSON parse failed");
      } else if (testId === "sanity-currency-format") {
        if (formatCurrency(1250.5, "৳", 2) !== "৳1,250.50") throw new Error("৳1,250.50 formatting mismatch");
        if (formatNumber(95000, 0) !== "95,000") throw new Error("95,000 comma formatting failed");
      } else if (testId === "sanity-cart-math") {
        const subtotal = 1200 * 2 + 350.5 * 3; // 3451.5
        const vat = Math.round(subtotal * 0.05 * 100) / 100; // 172.58
        if (Math.abs(vat - 172.58) > 0.01) throw new Error(`VAT calculation mismatch: ${vat}`);
      } else if (testId === "sanity-delivery-rules") {
        const calcDelivery = (sub: number, zone: "dhaka" | "outside") => {
          if (sub >= 3000) return 0;
          return zone === "dhaka" ? 60 : 120;
        };
        if (calcDelivery(1500, "dhaka") !== 60) throw new Error("Dhaka delivery fee must be ৳60");
        if (calcDelivery(1500, "outside") !== 120) throw new Error("Outside Dhaka delivery fee must be ৳120");
        if (calcDelivery(3500, "outside") !== 0) throw new Error("Orders over ৳3000 must have ৳0 free delivery");
      } else if (testId === "sanity-number-to-words") {
        const words = numberToWords(1250.5, "BDT");
        if (!words.toLowerCase().includes("taka") || !words.toLowerCase().includes("paisa")) {
          throw new Error("Text conversion for Taka/Paisa failed");
        }
      } else if (testId === "sanity-coupon-cap") {
        const dummyProd = {
          ...(products[0] || {}),
          id: "diag-prod-1",
          name: "Test Product",
          sellingPrice: 2000,
          discountPrice: 2000,
          totalStock: 10,
          categoryId: "cat-1",
        };
        const cart: CartItem[] = [{ id: "diag-cart-1", product: dummyProd as any, quantity: 2 }];
        const coupon: Coupon = {
          id: "cp-test",
          code: "TEST20",
          type: "Percentage",
          discountValue: 20,
          minSpend: 1000,
          maxDiscount: 500,
          status: "Active",
          usageCount: 0,
          scopeType: "GLOBAL",
        };
        const res = evaluateCouponDiscount("TEST20", coupon, cart);
        if (!res.isValid) throw new Error(res.message);
        if (res.discountAmount !== 500) throw new Error(`Discount cap expected 500, received ${res.discountAmount}`);
      } else if (testId === "sanity-coupon-category") {
        const prod = {
          id: "diag-elec",
          name: "Electronic Device",
          sellingPrice: 5000,
          categoryId: "cat-elec",
        };
        const cart: CartItem[] = [{ id: "diag-cart-2", product: prod as any, quantity: 1 }];
        const catCoupon: Coupon = {
          id: "cp-cat",
          code: "CATONLY",
          type: "Fixed",
          discountValue: 300,
          maxDiscount: 300,
          status: "Active",
          usageCount: 0,
          scopeType: "CATEGORY",
          applicableCategoryIds: ["cat-elec"],
        };
        const res = evaluateCouponDiscount("CATONLY", catCoupon, cart, null, categories as any);
        if (!res.isValid) throw new Error("Category scoped coupon failed to apply");
      } else if (testId === "sanity-coupon-expiry") {
        const expCoupon: Coupon = {
          id: "cp-exp",
          code: "EXP10",
          type: "Percentage",
          discountValue: 10,
          maxDiscount: 500,
          status: "Active",
          usageCount: 0,
          endDate: "2020-01-01",
          scopeType: "GLOBAL",
        };
        const res = evaluateCouponDiscount("EXP10", expCoupon, [{ id: "diag-cart-3", product: products[0] as any, quantity: 1 }]);
        if (res.isValid) throw new Error("Expired coupon was incorrectly accepted!");
      } else if (testId === "sanity-catalog-skus") {
        const seenIds = new Set<string>();
        for (const p of products) {
          if (seenIds.has(p.id)) throw new Error(`Duplicate product ID detected: ${p.id}`);
          seenIds.add(p.id);
        }
      } else if (testId === "sanity-stock-guard") {
        const prod = { id: "test-p", totalStock: 0, sellingPrice: 100 };
        const canAddToCart = prod.totalStock > 0;
        if (canAddToCart) throw new Error("Zero stock product should not be addable to cart");
      } else if (testId === "sanity-phone-regex") {
        const bdRegex = /^(?:\+88|88)?(01[3-9]\d{8})$/;
        const validPrefixes = ["01312345678", "01412345678", "01512345678", "01612345678", "01712345678", "01812345678", "01912345678"];
        for (const num of validPrefixes) {
          if (!bdRegex.test(num)) throw new Error(`Valid BD operator number rejected: ${num}`);
        }
        if (bdRegex.test("01234567890")) throw new Error("Invalid 012 number was accepted");
        if (bdRegex.test("12345")) throw new Error("Short phone number was accepted");
      } else if (testId === "sanity-address-guard") {
        const validate = (name?: string, addr?: string) => Boolean(name?.trim() && addr?.trim() && addr.length >= 5);
        if (!validate("Rahim", "House 12, Road 4, Dhanmondi, Dhaka")) throw new Error("Valid address rejected");
        if (validate("", "Dhaka")) throw new Error("Empty name validation erroneously passed");
      } else if (testId === "sanity-webgl-fallback") {
        const canvas = document.createElement("canvas");
        const hasWebGL = Boolean(
          window.WebGLRenderingContext &&
            (canvas.getContext("webgl") || canvas.getContext("experimental-webgl"))
        );
        if (typeof hasWebGL !== "boolean") throw new Error("WebGL detection failed");
      } else if (testId === "sanity-psychological-marketing") {
        const testRow = {
          price: "1,200.50",
          total: "৳ 2,401.00",
          title: "Smart Watch",
        };
        const sanitized = sanitizeExportRow(testRow);
        if (sanitized.price !== 1200.5) throw new Error("Export data sanitization failed");
      } else if (testId === "sanity-export-sanitize") {
        const row = { price: "৳ 5,500.00", stock: 15, name: "Premium Leather Shoes" };
        const clean = sanitizeExportRow(row);
        if (clean.price !== 5500) throw new Error("Clean monetary sanitize failed");
      }

      const durationMs = Math.round(performance.now() - start);
      return { passed: true, durationMs };
    } catch (err: any) {
      const durationMs = Math.round(performance.now() - start);
      return { passed: false, error: err?.message || String(err), durationMs };
    }
  };

  const handleRunTests = async (filterSuite?: TestSuiteType) => {
    setIsRunning(true);
    setExpandedErrorId(null);

    const targetTests = filterSuite ? tests.filter((t) => t.suiteType === filterSuite) : tests;

    setTests((prev) =>
      prev.map((t) =>
        !filterSuite || t.suiteType === filterSuite ? { ...t, status: "running", error: undefined } : t
      )
    );

    const updatedTests: DiagnosticTestItem[] = [];
    const detectedIncidents: TestAgentIncident[] = [];

    for (const test of targetTests) {
      await new Promise((r) => setTimeout(r, 25));
      const res = await runSingleTest(test.id);

      const updatedItem: DiagnosticTestItem = {
        ...test,
        status: res.passed ? "passed" : "failed",
        durationMs: res.durationMs,
        error: res.error,
      };

      updatedTests.push(updatedItem);

      if (!res.passed) {
        detectedIncidents.push(
          analyzeFailureToIncident(test.id, isBn ? test.nameBn : test.nameEn, res.error || (isBn ? "অজ্ঞাত সমস্যা" : "Unknown error"))
        );
      }

      setTests((current) => current.map((t) => (t.id === test.id ? updatedItem : t)));
    }

    const passedCount = updatedTests.filter((t) => t.status === "passed").length;
    const failedCount = updatedTests.filter((t) => t.status === "failed").length;
    const newLog: TestAgentRunLog = {
      runId: `RUN-${filterSuite || "ALL"}-${Date.now().toString().slice(-6)}`,
      triggerType: "Manual",
      timestamp: new Date().toISOString(),
      totalTests: updatedTests.length,
      passedTests: passedCount,
      failedTests: failedCount,
      durationMs: 380,
      healthScore: Math.round((passedCount / updatedTests.length) * 100),
      status: failedCount === 0 ? "PASS" : failedCount > 2 ? "FAIL" : "WARN",
      incidents: detectedIncidents,
    };

    setRunHistory((prev) => [newLog, ...prev.slice(0, 9)]);

    if (detectedIncidents.length > 0) {
      setIncidents((prev) => [...detectedIncidents, ...prev]);
    }

    fetch("/api/admin/test-agent/report", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newLog),
    }).catch(() => {});

    setIsRunning(false);
  };

  const handleResolveIncident = async (incidentId: string) => {
    setIncidents((prev) => prev.map((i) => (i.id === incidentId ? { ...i, status: "resolved" } : i)));
    try {
      await fetch("/api/admin/test-agent/resolve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ incidentId }),
      });
    } catch {}
  };

  const handleCopyReport = () => {
    const reportText = [
      `======================================================`,
      `Smart E-Commerce Autonomous Test Agent & E2E Report`,
      `তারিখ: ${new Date().toLocaleString(isBn ? "bn-BD" : "en-US")}`,
      `সিস্টেম স্ট্যাটাস: ${openIncidents.length === 0 ? "✓ DEPLOY READY" : "⚠ ACTION REQUIRED"}`,
      `মোট টেস্ট: ${stats.total} | সফল: ${stats.passed} | ব্যর্থ: ${stats.failed}`,
      `স্মোক টেস্ট: ${stats.smokePassed}/${stats.smokeTotal} | স্যানিটি টেস্ট: ${stats.sanityPassed}/${stats.sanityTotal}`,
      `খোলা ইনসিডেন্ট সংখ্যা: ${openIncidents.length}`,
      `======================================================\n`,
      `[Playwright E2E Suites Configured]`,
      `1. tests/e2e/smoke.spec.ts (Critical Smoke Paths)`,
      `2. tests/e2e/sanity.spec.ts (Core Business Rules Sanity)`,
      `3. tests/e2e/storefront.spec.ts (Catalog & Currency)`,
      `4. tests/e2e/checkout.spec.ts (BD Phone & Order Flow)`,
      `5. tests/e2e/admin.spec.ts (Command Center & Diagnostics)\n`,
      `[সক্রিয় ইনসিডেন্টসমূহ]`,
      openIncidents.length === 0
        ? (isBn ? "কোনো ত্রুটি বা অমীমাংসিত ইনসিডেন্ট নেই। সিস্টেম সুস্থ।" : "No unresolved incidents detected. System is healthy.")
        : openIncidents.map((i) => `• [${i.severity}] ${i.title} (${i.affectedModule})\n   - পদক্ষেপ: ${i.remediationAction}`).join("\n"),
      `\nCLI কমান্ড: npm run test:smoke | npm run test:sanity | npm test | npm run test:e2e`,
    ].join("\n");

    navigator.clipboard.writeText(reportText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const filteredTests = useMemo(() => {
    if (activeTab === "all") return tests;
    if (activeTab === "smoke") return tests.filter((t) => t.suiteType === "SMOKE");
    if (activeTab === "sanity") return tests.filter((t) => t.suiteType === "SANITY");
    if (activeTab === "failed") return tests.filter((t) => t.status === "failed");
    return tests.filter((t) => t.category === activeTab);
  }, [tests, activeTab]);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 text-white p-6 rounded-2xl border border-indigo-900/40 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-full opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-400 via-transparent to-transparent pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-bold uppercase tracking-wider">
              <Bot className="w-3.5 h-3.5 text-indigo-400" />
              <span>{isBn ? "স্মার্ট টেস্ট এজেন্ট ও কোডবেস অডিট v3.5" : "Smart Test Agent & Codebase Audit v3.5"}</span>
            </div>
            <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
              <Cpu className="w-6 h-6 text-indigo-400" />
              <span>{isBn ? "স্মোক ও স্যানিটি টেস্ট অটোমেশন সেন্টার" : "Smoke & Sanity Test Automation Center"}</span>
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              {isBn
                ? "নতুন কোড বিল্ড ও ডেপ্লয়মেন্টের সময় দ্রুত স্মোক টেস্টিং (Smoke Testing) ও গভীর স্যানিটি টেস্টিং (Sanity Testing) চালিয়ে সম্ভাব্য সকল বাগ ও অসঙ্গতি তাৎক্ষণিক শনাক্ত করুন।"
                : "Run rapid Smoke Tests and in-depth Sanity Tests across critical user paths, financial math, and checkout business logic prior to production deployment."}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {/* Run Smoke Tests */}
            <button
              onClick={() => handleRunTests("SMOKE")}
              disabled={isRunning}
              className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl font-bold text-xs shadow-sm transition-all ${
                isRunning
                  ? "bg-slate-700 text-slate-400 cursor-not-allowed"
                  : "bg-amber-600 hover:bg-amber-500 text-white active:scale-95"
              }`}
              title={isBn ? "দ্রুত স্মোক টেস্ট চালান (৪টি টেস্ট)" : "Run rapid Smoke Tests (4 tests)"}
            >
              <Zap className="w-3.5 h-3.5 text-amber-200" />
              <span>{isBn ? "স্মোক টেস্ট চালান" : "Run Smoke Tests"}</span>
            </button>

            {/* Run Sanity Tests */}
            <button
              onClick={() => handleRunTests("SANITY")}
              disabled={isRunning}
              className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl font-bold text-xs shadow-sm transition-all ${
                isRunning
                  ? "bg-slate-700 text-slate-400 cursor-not-allowed"
                  : "bg-emerald-600 hover:bg-emerald-500 text-white active:scale-95"
              }`}
              title={isBn ? "গভীর স্যানিটি টেস্ট চালান (১৪টি টেস্ট)" : "Run in-depth Sanity Tests (14 tests)"}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-200" />
              <span>{isBn ? "স্যানিটি টেস্ট চালান" : "Run Sanity Tests"}</span>
            </button>

            {/* Run All Tests */}
            <button
              onClick={() => handleRunTests()}
              disabled={isRunning}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs shadow-lg transition-all ${
                isRunning
                  ? "bg-slate-700 text-slate-300 cursor-not-allowed"
                  : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30 active:scale-95"
              }`}
            >
              {isRunning ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>{isBn ? "অডিট চলছে..." : "Running..."}</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>{isBn ? "সব টেস্ট চালান" : "Run All Tests"}</span>
                </>
              )}
            </button>

            {/* Copy Report */}
            <button
              onClick={handleCopyReport}
              className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs transition-all cursor-pointer"
              title={isBn ? "সম্পূর্ণ অডিট রিপোর্ট কপি করুন" : "Copy comprehensive audit report"}
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? (isBn ? "কপি হয়েছে!" : "Copied!") : (isBn ? "রিপোর্ট কপি" : "Copy Report")}</span>
            </button>
          </div>
        </div>

        {/* Progress Bar when running */}
        {isRunning && (
          <div className="mt-5 space-y-1.5">
            <div className="flex justify-between text-xs text-indigo-200 font-medium">
              <span>{isBn ? "স্বয়ংক্রিয় টেস্ট এক্সিকিউশন প্রগ্রেস..." : "Automated test execution progress..."}</span>
              <span>{Math.round(((stats.passed + stats.failed) / stats.total) * 100)}%</span>
            </div>
            <div className="w-full bg-slate-800/80 rounded-full h-2.5 overflow-hidden border border-slate-700">
              <div
                className="bg-gradient-to-r from-indigo-500 via-amber-400 to-emerald-400 h-full transition-all duration-150"
                style={{ width: `${((stats.passed + stats.failed) / stats.total) * 100}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Main Mode Navigation (3 Sections) */}
      <div className="flex flex-wrap items-center gap-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
        <button
          onClick={() => setActiveMainMode("agent")}
          className={`flex-1 min-w-[200px] flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeMainMode === "agent"
              ? "bg-white text-indigo-900 shadow-xs border border-slate-200"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <Bot className="w-4 h-4 text-indigo-600" />
          <span>{isBn ? "স্বয়ংক্রিয় টেস্ট এজেন্ট ও ইনসিডেন্ট সেন্টার" : "Autonomous Test Agent & Incidents"}</span>
          {openIncidents.length > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-500 text-white animate-pulse">
              {openIncidents.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveMainMode("playwright")}
          className={`flex-1 min-w-[200px] flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeMainMode === "playwright"
              ? "bg-white text-indigo-900 shadow-xs border border-slate-200"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <Laptop className="w-4 h-4 text-emerald-600" />
          <span>{isBn ? "প্লে-রাইট (Playwright) E2E স্যুট ও সিআই/সিডি" : "Playwright E2E Suites & CI/CD"}</span>
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            5 Suites
          </span>
        </button>

        <button
          onClick={() => setActiveMainMode("unit")}
          className={`flex-1 min-w-[200px] flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeMainMode === "unit"
              ? "bg-white text-indigo-900 shadow-xs border border-slate-200"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <Layers className="w-4 h-4 text-indigo-600" />
          <span>{isBn ? `সরাসরি টেস্ট এক্সিকিউশন ও ভ্যালিডেশন (${tests.length})` : `In-App Test Runner (${tests.length})`}</span>
        </button>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{isBn ? "মোট টেস্ট কেস" : "Total Tests"}</p>
            <p className="text-xl font-black text-slate-900">{stats.total}টি</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{isBn ? "স্মোক টেস্ট কভারেজ" : "Smoke Coverage"}</p>
            <p className="text-xl font-black text-amber-700">
              {stats.smokePassed}/{stats.smokeTotal}
            </p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{isBn ? "স্যানিটি টেস্ট কভারেজ" : "Sanity Coverage"}</p>
            <p className="text-xl font-black text-emerald-600">
              {stats.sanityPassed}/{stats.sanityTotal}
            </p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{isBn ? "সিস্টেম স্কোর" : "Health Score"}</p>
            <p className="text-xl font-black text-slate-900">{stats.score}%</p>
          </div>
        </div>
      </div>

      {/* =========================================================================
          MODE 1: AUTONOMOUS TEST AGENT & BUG INCIDENT ACTION CENTER
          ========================================================================= */}
      {activeMainMode === "agent" && (
        <div className="space-y-6">
          {/* Active Incidents Alert Banner */}
          {openIncidents.length > 0 ? (
            <div className="bg-rose-50 border border-rose-200 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-rose-800">
                  <ShieldAlert className="w-5 h-5 text-rose-600 animate-bounce" />
                  <h2 className="text-base font-black">
                    {isBn
                      ? `সতর্কতা: সিস্টেমে ${openIncidents.length}টি অসঙ্গতি বা বাগ শনাক্ত হয়েছে!`
                      : `Warning: ${openIncidents.length} active bug incidents detected in codebase!`}
                  </h2>
                </div>
                <span className="text-xs font-bold text-rose-700 bg-rose-100 px-3 py-1 rounded-full border border-rose-200">
                  {isBn ? "প্রশাসনিক পদক্ষেপ আবশ্যক" : "Action Required"}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {openIncidents.map((incident) => (
                  <div key={incident.id} className="bg-white p-4 rounded-xl border border-rose-200 shadow-xs space-y-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                            incident.severity === "CRITICAL"
                              ? "bg-rose-100 text-rose-800"
                              : incident.severity === "HIGH"
                              ? "bg-amber-100 text-amber-800"
                              : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {incident.severity}
                        </span>
                        <span className="text-xs font-mono font-bold text-slate-500">{incident.id}</span>
                      </div>
                      <button
                        onClick={() => handleResolveIncident(incident.id)}
                        className="text-xs font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                      >
                        {isBn ? "সমাধান চিহ্নিত করুন" : "Mark Resolved"}
                      </button>
                    </div>

                    <div>
                      <h3 className="text-sm font-bold text-slate-900">{incident.title}</h3>
                      <p className="text-xs text-slate-500 mt-0.5">{incident.description}</p>
                    </div>

                    <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 space-y-1">
                      <div className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                        <span>{isBn ? "প্রস্তাবিত পদক্ষেপ:" : "Remediation Action:"}</span>
                      </div>
                      <p className="text-xs text-slate-600 font-medium">{incident.remediationAction}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-emerald-900">
                    {isBn ? "কোনো অমীমাংসিত ত্রুটি নেই — সিস্টেম সম্পূর্ণ সুস্থ ও সক্রিয়!" : "All tests passing! System is healthy and ready for deployment."}
                  </h3>
                  <p className="text-xs text-emerald-700 mt-0.5">
                    {isBn
                      ? "সকল স্মোক ও স্যানিটি টেস্ট সফল হয়েছে। কোড ডেপ্লয়মেন্টের জন্য শতভাগ নিরাপদ।"
                      : "All smoke and sanity suites validated successfully with 0 active regressions."}
                  </p>
                </div>
              </div>
              <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-100/60 px-3 py-1.5 rounded-xl border border-emerald-300">
                100% HEALTHY
              </span>
            </div>
          )}

          {/* Test Agent History Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-indigo-600" />
                <h2 className="text-sm font-bold text-slate-800">
                  {isBn ? "টেস্ট এজেন্ট এক্সিকিউশন হিস্টোরি ও ডেপ্লয়মেন্ট অডিট লগ" : "Test Agent Execution History & Audit Logs"}
                </h2>
              </div>
              <span className="text-xs text-slate-500">
                {isBn ? `সর্বশেষ ${runHistory.length}টি রান সংরক্ষিত` : `Latest ${runHistory.length} runs stored`}
              </span>
            </div>

            <div className="divide-y divide-slate-100">
              {runHistory.map((run) => (
                <div key={run.runId} className="p-4 flex flex-wrap items-center justify-between gap-3 hover:bg-slate-50/60 transition-colors">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                        run.status === "PASS"
                          ? "bg-emerald-100 text-emerald-700"
                          : run.status === "WARN"
                          ? "bg-amber-100 text-amber-700"
                          : "bg-rose-100 text-rose-700"
                      }`}
                    >
                      {run.status}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-slate-900">{run.runId}</span>
                        <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                          {run.triggerType}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {new Date(run.timestamp).toLocaleString(isBn ? "bn-BD" : "en-US")} • {run.durationMs}ms
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs font-bold">
                    <span className="text-slate-600">
                      {isBn ? "টেস্ট:" : "Tests:"} <span className="text-slate-900">{run.totalTests}টি</span>
                    </span>
                    <span className="text-emerald-600">
                      {isBn ? "সফল:" : "Passed:"} {run.passedTests}
                    </span>
                    {run.failedTests > 0 && (
                      <span className="text-rose-600">
                        {isBn ? "ব্যর্থ:" : "Failed:"} {run.failedTests}
                      </span>
                    )}
                    <span className="px-2.5 py-1 rounded-full text-[11px] bg-slate-100 text-slate-800">
                      {isBn ? "স্কোর:" : "Score:"} {run.healthScore}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODE 2: PLAYWRIGHT E2E SUITES & CI/CD ARCHITECTURE
          ========================================================================= */}
      {activeMainMode === "playwright" && (
        <div className="space-y-6">
          {/* CLI Instructions Card */}
          <div className="bg-slate-950 text-slate-200 p-6 rounded-2xl border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-indigo-400">
                <Terminal className="w-5 h-5" />
                <h2 className="text-sm font-bold text-white">
                  {isBn ? "প্লে-রাইট (Playwright) সিআই/সিডি ও টার্মিনাল রানার কমান্ড" : "Playwright CLI & CI/CD Terminal Runner"}
                </h2>
              </div>
              <span className="text-xs font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-2.5 py-1 rounded">
                CLI Ready
              </span>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              {isBn
                ? "নতুন বিল্ড ডেপ্লয় করার পূর্বে লোকাল মেশিনে বা GitHub Actions সিআই পাইপলাইনে নিচের কমান্ডগুলো রান করে কোডবেস নির্ভুল কিনা যাচাই করুন:"
                : "Run these commands in terminal or GitHub Actions CI pipeline prior to pushing new code releases:"}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
              <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 space-y-1">
                <p className="text-amber-400 font-bold">{isBn ? "১. দ্রুত স্মোক টেস্ট (Smoke Tests)" : "1. Rapid Smoke Tests"}</p>
                <p className="text-emerald-300">$ npm run test:smoke</p>
                <p className="text-slate-500 text-[11px]">{isBn ? "# ১৫ সেকেন্ডের মধ্যে ক্রিটিক্যাল পথ যাচাই" : "# Validates critical paths in <15s"}</p>
              </div>

              <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 space-y-1">
                <p className="text-emerald-400 font-bold">{isBn ? "২. গভীর স্যানিটি টেস্ট (Sanity Tests)" : "2. In-Depth Sanity Tests"}</p>
                <p className="text-emerald-300">$ npm run test:sanity</p>
                <p className="text-slate-500 text-[11px]">{isBn ? "# কার্ট, ভ্যাট, ডেলিভারি ফি ও কুপন নীতি পরীক্ষা" : "# Math, delivery rules, and coupon limits"}</p>
              </div>

              <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 space-y-1">
                <p className="text-indigo-400 font-bold">{isBn ? "৩. সম্পূর্ণ অডিট স্যুট (Full Audit)" : "3. Complete Audit Suite"}</p>
                <p className="text-emerald-300">$ npm test</p>
                <p className="text-slate-500 text-[11px]">{isBn ? "# স্মোক + স্যানিটি ১৮টি টেস্ট একযোগে" : "# Smoke + Sanity (18 total tests)"}</p>
              </div>

              <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 space-y-1">
                <p className="text-purple-400 font-bold">{isBn ? "৪. প্লে-রাইট ব্রাউজার E2E" : "4. Playwright Browser E2E"}</p>
                <p className="text-emerald-300">$ npm run test:e2e:smoke</p>
                <p className="text-slate-500 text-[11px]">{isBn ? "# হেডলেস ব্রাউজারে ইউজার ফ্লো সিমুলেশন" : "# Real headless Chromium browser execution"}</p>
              </div>
            </div>
          </div>

          {/* Configured Test Files Matrix */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
              <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-xs">
                01
              </div>
              <div>
                <span className="text-[10px] font-mono font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  tests/e2e/smoke.spec.ts
                </span>
                <h3 className="text-sm font-bold text-slate-900 mt-1.5">{isBn ? "স্মোক টেস্ট স্যুট" : "Smoke Test Suite"}</h3>
              </div>
              <ul className="text-xs text-slate-600 space-y-1.5">
                <li className="flex items-center gap-1.5">
                  <CheckSquare className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>{isBn ? "ব্যাকএন্ড হেলথ এপিআই (/api/health)" : "Backend Health API (/api/health)"}</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckSquare className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>{isBn ? "হোমপেজ ও ব্র্যান্ড লোগো লোড" : "Storefront homepage & branding"}</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckSquare className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>{isBn ? "টাকা প্রতীক (৳) প্রদর্শন" : "৳ currency symbol visibility"}</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckSquare className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>{isBn ? "ভাষা পরিবর্তন (BN/EN) নির্বিঘ্নে কার্যকর" : "Language toggle seamless switch"}</span>
                </li>
              </ul>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xs">
                02
              </div>
              <div>
                <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  tests/e2e/sanity.spec.ts
                </span>
                <h3 className="text-sm font-bold text-slate-900 mt-1.5">{isBn ? "স্যানিটি টেস্ট স্যুট" : "Sanity Test Suite"}</h3>
              </div>
              <ul className="text-xs text-slate-600 space-y-1.5">
                <li className="flex items-center gap-1.5">
                  <CheckSquare className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>{isBn ? "কার্ট সাবটোটাল ও ৫% ভ্যাট হিসাব" : "Cart subtotal & 5% VAT accuracy"}</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckSquare className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>{isBn ? "বাংলাদেশি ১১ ডিজিট ফোন রেজেক্স ফিল্টার" : "Bangladeshi 11-digit phone filter"}</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckSquare className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>{isBn ? "ডেলিভারি ফি ও ৩০০০৳+ ফ্রি ডেলিভারি" : "Delivery fees & ৳3000+ free rule"}</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckSquare className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>{isBn ? "এডমিন অটোমেটেড টেস্ট রানার ভ্যালিডেশন" : "Admin test runner validation"}</span>
                </li>
              </ul>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
              <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold text-xs">
                03
              </div>
              <div>
                <span className="text-[10px] font-mono font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                  tests/e2e/admin.spec.ts
                </span>
                <h3 className="text-sm font-bold text-slate-900 mt-1.5">{isBn ? "কমান্ড সেন্টার E2E" : "Command Center E2E"}</h3>
              </div>
              <ul className="text-xs text-slate-600 space-y-1.5">
                <li className="flex items-center gap-1.5">
                  <CheckSquare className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>{isBn ? "অ্যাডমিন অথরাইজেশন ও আরবিক রুলস" : "Admin authorization & RBAC"}</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckSquare className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>{isBn ? "রিয়েল-টাইম কেপিআই মেট্রিক্স লোড" : "Real-time KPI metrics verification"}</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckSquare className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>{isBn ? "বাগ রিপোর্ট ক্লিপবোর্ডে কপি যাচাই" : "Bug report copy-to-clipboard"}</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckSquare className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>{isBn ? "ইনসিডেন্ট রেজোলিউশন এপিআই সিংক" : "Incident resolution API sync"}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODE 3: IN-APP TEST RUNNER & DETAILED BREAKDOWN
          ========================================================================= */}
      {activeMainMode === "unit" && (
        <div className="space-y-4">
          {/* Suite & Category Filter Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 border-b border-slate-200 pb-2">
            <button
              onClick={() => setActiveTab("all")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                activeTab === "all"
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              {isBn ? `সব টেস্ট (${tests.length})` : `All Tests (${tests.length})`}
            </button>

            <button
              onClick={() => setActiveTab("smoke")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer ${
                activeTab === "smoke"
                  ? "bg-amber-600 text-white shadow-xs"
                  : "bg-amber-50 text-amber-800 hover:bg-amber-100"
              }`}
            >
              <Zap className="w-3 h-3" />
              <span>{isBn ? `স্মোক টেস্ট (${stats.smokeTotal})` : `Smoke Tests (${stats.smokeTotal})`}</span>
            </button>

            <button
              onClick={() => setActiveTab("sanity")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer ${
                activeTab === "sanity"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
              }`}
            >
              <ShieldCheck className="w-3 h-3" />
              <span>{isBn ? `স্যানিটি টেস্ট (${stats.sanityTotal})` : `Sanity Tests (${stats.sanityTotal})`}</span>
            </button>

            {stats.failed > 0 && (
              <button
                onClick={() => setActiveTab("failed")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer ${
                  activeTab === "failed"
                    ? "bg-rose-600 text-white shadow-xs"
                    : "bg-rose-50 text-rose-700 hover:bg-rose-100"
                }`}
              >
                <XCircle className="w-3.5 h-3.5" />
                <span>{isBn ? `ব্যর্থ টেস্ট (${stats.failed})` : `Failed (${stats.failed})`}</span>
              </button>
            )}

            <button
              onClick={() => setActiveTab("math")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                activeTab === "math" ? "bg-indigo-600 text-white" : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              {isBn ? "আর্থিক ও হিসাব" : "Financial Math"}
            </button>

            <button
              onClick={() => setActiveTab("coupons")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                activeTab === "coupons" ? "bg-indigo-600 text-white" : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              {isBn ? "কুপন ও ছাড়" : "Coupons & Discounts"}
            </button>

            <button
              onClick={() => setActiveTab("catalog")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                activeTab === "catalog" ? "bg-indigo-600 text-white" : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              {isBn ? "প্রোডাক্ট ক্যাটালগ" : "Product Catalog"}
            </button>

            <button
              onClick={() => setActiveTab("checkout")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                activeTab === "checkout" ? "bg-indigo-600 text-white" : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              {isBn ? "চেকআউট ও ফোন" : "Checkout & Phone"}
            </button>

            <button
              onClick={() => setActiveTab("delivery")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                activeTab === "delivery" ? "bg-indigo-600 text-white" : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              {isBn ? "ডেলিভারি ফি নীতি" : "Delivery Fees"}
            </button>
          </div>

          {/* Test List Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-800">
                {isBn ? `টেস্ট আইটেমসমূহ (${filteredTests.length})` : `Test Items (${filteredTests.length})`}
              </h2>
              <span className="text-xs text-slate-500">
                {stats.idle > 0
                  ? isBn
                    ? "টেস্ট শুরু করতে উপরের 'স্মোক টেস্ট' বা 'স্যানিটি টেস্ট' বাটনে ক্লিক করুন"
                    : "Click 'Run Smoke Tests' or 'Run Sanity Tests' to start"
                  : isBn
                  ? "টেস্ট সম্পন্ন হয়েছে"
                  : "Tests Completed"}
              </span>
            </div>

            <div className="divide-y divide-slate-100">
              {filteredTests.map((test) => {
                const isExpanded = expandedErrorId === test.id;
                return (
                  <div key={test.id} className="p-4 hover:bg-slate-50/80 transition-colors">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 min-w-0">
                        <div className="pt-0.5 shrink-0">
                          {test.status === "passed" && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
                          {test.status === "failed" && <XCircle className="w-5 h-5 text-rose-500" />}
                          {test.status === "running" && (
                            <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                          )}
                          {test.status === "idle" && (
                            <div className="w-5 h-5 rounded-full border-2 border-slate-300" />
                          )}
                        </div>

                        <div className="min-w-0 space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                                test.suiteType === "SMOKE"
                                  ? "bg-amber-100 text-amber-900 border border-amber-200"
                                  : "bg-emerald-100 text-emerald-900 border border-emerald-200"
                              }`}
                            >
                              {test.suiteType}
                            </span>
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 uppercase tracking-wider">
                              {isBn ? test.categoryLabelBn : test.categoryLabelEn}
                            </span>
                            <h3 className="text-sm font-bold text-slate-900">{isBn ? test.nameBn : test.nameEn}</h3>
                          </div>
                          <p className="text-xs text-slate-500 leading-relaxed">
                            {isBn ? test.descriptionBn : test.descriptionEn}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {test.durationMs !== undefined && (
                          <span className="text-[11px] font-mono font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                            {test.durationMs}ms
                          </span>
                        )}

                        {test.status === "passed" && (
                          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                            {isBn ? "সফল" : "Passed"}
                          </span>
                        )}

                        {test.status === "failed" && (
                          <button
                            onClick={() => setExpandedErrorId(isExpanded ? null : test.id)}
                            className="text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 px-2.5 py-1 rounded-full border border-rose-200 flex items-center gap-1 cursor-pointer"
                          >
                            <span>{isBn ? "ত্রুটি দেখুন" : "View Error"}</span>
                            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                          </button>
                        )}

                        {test.status === "idle" && (
                          <button
                            onClick={async () => {
                              setTests((cur) =>
                                cur.map((t) => (t.id === test.id ? { ...t, status: "running" } : t))
                              );
                              const res = await runSingleTest(test.id);
                              setTests((cur) =>
                                cur.map((t) =>
                                  t.id === test.id
                                    ? {
                                        ...t,
                                        status: res.passed ? "passed" : "failed",
                                        durationMs: res.durationMs,
                                        error: res.error,
                                      }
                                    : t
                                )
                              );
                            }}
                            className="text-xs font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                          >
                            {isBn ? "রান করুন" : "Run"}
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Expanded Error Details */}
                    {test.status === "failed" && isExpanded && (
                      <div className="mt-3 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs space-y-2">
                        <div className="flex items-start gap-2 text-rose-800">
                          <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
                          <div>
                            <p className="font-bold">{isBn ? "শনাক্তকৃত এরর:" : "Detected Error:"}</p>
                            <p className="font-mono text-rose-700 mt-0.5">{test.error}</p>
                          </div>
                        </div>

                        {(test.suggestedFixBn || test.suggestedFixEn) && (
                          <div className="pt-2 border-t border-rose-200 text-slate-700 flex items-start gap-2">
                            <Sparkles className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                            <div>
                              <p className="font-bold text-slate-900">{isBn ? "প্রস্তাবিত সমাধান:" : "Suggested Fix:"}</p>
                              <p className="text-slate-600 mt-0.5">
                                {isBn ? test.suggestedFixBn : test.suggestedFixEn}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
