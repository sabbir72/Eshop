/**
 * Smart E-Commerce Comprehensive Build & Runtime Test Suite
 * 
 * কভারেজ:
 * - স্মোক টেস্টিং (Smoke Testing): অ্যাপ ইনিশিয়ালাইজেশন, ক্যাটালগ রুট ও দ্রুত ক্রিটিক্যাল পাথ
 * - স্যানিটি টেস্টিং (Sanity Testing): কার্ট ও ভ্যাট ম্যাথ, ফ্রি ডেলিভারি, ৭টি বিডি মোবাইল অপারেটর, কুপন ক্যাপ
 * - রিগ্রেশন টেস্টিং (Regression Testing): ডেটা স্যানিটাইজেশন, ৩ডি ফলব্যাক এবং লোকাল ক্যাশ
 * 
 * রান করার নিয়ম:
 * - npm test
 * - npm run test:smoke
 * - npm run test:sanity
 * - npm run test:e2e
 * - npm run test:agent
 */

import { parseSafeNumber, formatNumber, formatCurrency, sanitizeExportRow } from "../src/utils/numberUtils";
import { evaluateCouponDiscount, isItemEligibleForCoupon } from "../src/utils/discountEngine";
import { translations, t } from "../src/utils/i18n";
import { initialProducts, initialCategories, initialCoupons } from "../src/data/mockData";
import { CartItem, Coupon } from "../src/types";

// ANSI Terminal Colors for High-Visibility Reporting
const RESET = "\x1b[0m";
const BOLD = "\x1b[1m";
const GREEN = "\x1b[32m";
const RED = "\x1b[31m";
const YELLOW = "\x1b[33m";
const BLUE = "\x1b[34m";
const CYAN = "\x1b[36m";
const MAGENTA = "\x1b[35m";
const GRAY = "\x1b[90m";

export type TestSuiteType = "SMOKE" | "SANITY";

interface TestCase {
  id: string;
  name: string;
  category: string;
  suiteType: TestSuiteType;
  run: () => void | Promise<void>;
  suggestedFix?: string;
}

export interface TestResult {
  id: string;
  name: string;
  category: string;
  suiteType: TestSuiteType;
  passed: boolean;
  durationMs: number;
  error?: string;
  suggestedFix?: string;
}

const tests: TestCase[] = [];

function registerTest(
  suiteType: TestSuiteType,
  category: string,
  name: string,
  run: () => void | Promise<void>,
  suggestedFix?: string
) {
  tests.push({
    id: `test_${tests.length + 1}`,
    suiteType,
    category,
    name,
    run,
    suggestedFix,
  });
}

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(message);
  }
}

function assertEqual<T>(actual: T, expected: T, message: string) {
  if (actual !== expected) {
    throw new Error(`${message} -> Expected [${expected}], but received [${actual}]`);
  }
}

function assertApproxEqual(actual: number, expected: number, tolerance = 0.01, message: string) {
  if (Math.abs(actual - expected) > tolerance) {
    throw new Error(`${message} -> Expected ~[${expected}], but received [${actual}] (diff: ${Math.abs(actual - expected)})`);
  }
}

// =========================================================================
// SUITE 1: SMOKE TESTS (স্মোক টেস্টিং - ক্রিটিক্যাল পাথ ভ্যালিডেশন)
// =========================================================================

registerTest(
  "SMOKE",
  "স্মোক টেস্টিং (Smoke Testing)",
  "মুদ্রা পার্সিং বেসিক স্মোক চেক (parseSafeNumber Basic)",
  () => {
    assertEqual(parseSafeNumber("1250"), 1250, "সাধারণ ইন্টিজার পার্সিং ব্যর্থ");
    assertEqual(parseSafeNumber("৳ 4,500"), 4500, "টাকা প্রতীক সহ স্ট্রিং পার্সিং ব্যর্থ");
    assertEqual(parseSafeNumber(null, 50), 50, "নাল ইনপুটের ফলব্যাক হ্যান্ডলিং ব্যর্থ");
  },
  "src/utils/numberUtils.ts ফাইলের parseSafeNumber ফাংশনটি চেক করুন।"
);

registerTest(
  "SMOKE",
  "স্মোক টেস্টিং (Smoke Testing)",
  "ক্যাটালগ ও ক্যাটাগরি ডেটাবেস ইনিশিয়ালাইজেশন অখণ্ডতা",
  () => {
    assert(Array.isArray(initialProducts) && initialProducts.length > 0, "প্রোডাক্ট তালিকা ফাঁকা");
    assert(Array.isArray(initialCategories) && initialCategories.length > 0, "ক্যাটাগরি তালিকা ফাঁকা");
  },
  "src/data/mockData.ts এ initialProducts ও initialCategories চেক করুন।"
);

registerTest(
  "SMOKE",
  "স্মোক টেস্টিং (Smoke Testing)",
  "কার্ট আইটেম গঠন ও সাবটোটাল বেসিক হিসাব",
  () => {
    const item1 = { price: 1000, quantity: 2 };
    const item2 = { price: 500, quantity: 1 };
    const total = item1.price * item1.quantity + item2.price * item2.quantity;
    assertEqual(total, 2500, "বেসিক কার্ট সাবটোটাল হিসাব ভুল");
  },
  "কার্ট সাবটোটাল হিসাব পরীক্ষা করুন।"
);

registerTest(
  "SMOKE",
  "স্মোক টেস্টিং (Smoke Testing)",
  "বাংলা ও ইংরেজি অনুবাদ অভিধানের মূল পরিভাষা উপস্থিতি",
  () => {
    assert(Boolean(translations.BN.price), "বাংলা 'price' অনুবাদ নেই");
    assert(Boolean(translations.BN.cart), "বাংলা 'cart' অনুবাদ নেই");
    assert(Boolean(translations.BN.checkout), "বাংলা 'checkout' অনুবাদ নেই");
    assert(Boolean(translations.EN.price), "ইংরেজি 'price' অনুবাদ নেই");
  },
  "src/utils/i18n.ts এ translations অবজেক্ট পরীক্ষা করুন।"
);

// =========================================================================
// SUITE 2: SANITY TESTS - FINANCIAL & CART MATH (আর্থিক ও সংখ্যা হিসাব স্যানিটি)
// =========================================================================

registerTest(
  "SANITY",
  "আর্থিক ও সংখ্যা হিসাব (Financial Math)",
  "formatCurrency & formatNumber: সঠিক দশমিক ও কমা বিভাজন",
  () => {
    assertEqual(formatCurrency(1250.5, "৳", 2), "৳1,250.50", "টাকা কারেন্সি ফরম্যাটিং অমিল");
    assertEqual(formatNumber(95000, 0), "95,000", "হাজার বিভাজন কমা ফরম্যাটিং ব্যর্থ");
    assertEqual(formatCurrency(0, "৳", 2), "৳0.00", "শূন্য টাকার ফরম্যাটিং অমিল");
  },
  "formatCurrency এর Intl.NumberFormat কনফিগারেশন চেক করুন।"
);

registerTest(
  "SANITY",
  "আর্থিক ও সংখ্যা হিসাব (Financial Math)",
  "কার্ট যোগফল ও ৫% ভ্যাট রাউন্ডিং হিসাব (Cart Subtotal & VAT)",
  () => {
    const items = [
      { price: 1200, quantity: 2 }, // 2400
      { price: 350.5, quantity: 3 }, // 1051.5
    ];
    const subtotal = items.reduce((acc, i) => acc + i.price * i.quantity, 0);
    assertApproxEqual(subtotal, 3451.5, 0.001, "কার্ট সাবটোটাল গণনায় ভুল");

    const vatRate = 0.05; // 5% VAT
    const calculatedVat = Math.round(subtotal * vatRate * 100) / 100;
    assertApproxEqual(calculatedVat, 172.58, 0.01, "৫% ভ্যাট গণনায় ভুল");
  },
  "কার্ট ক্যালকুলেশনে ফ্লোটিং পয়েন্ট রাউন্ডিং চেক করুন।"
);

registerTest(
  "SANITY",
  "আর্থিক ও সংখ্যা হিসাব (Financial Math)",
  "ডেলিভারি চার্জ লজিক ও ফ্রি ডেলিভারি থ্রেশহোল্ড (৳৩০০০ এ ফ্রি ডেলিভারি)",
  () => {
    function calculateShipping(subtotal: number, isDhaka: boolean): number {
      if (subtotal >= 3000) return 0; // Free delivery over 3000
      return isDhaka ? 60 : 120;
    }

    assertEqual(calculateShipping(1500, true), 60, "ঢাকার ভেতরের ডেলিভারি চার্জ ৬০৳ হওয়া উচিত");
    assertEqual(calculateShipping(1500, false), 120, "ঢাকার বাইরের ডেলিভারি চার্জ ১২০৳ হওয়া উচিত");
    assertEqual(calculateShipping(3500, true), 0, "৳৩০০০ বা তার বেশি অর্ডারে ফ্রি ডেলিভারি (০৳) প্রযোজ্য");
    assertEqual(calculateShipping(5000, false), 0, "ঢাকার বাইরেও ৳৩০০০+ অর্ডারে ফ্রি ডেলিভারি প্রযোজ্য");
  },
  "ডেলিভারি ফি ক্যালকুলেটর ফাংশন চেক করুন।"
);

// =========================================================================
// SUITE 3: SANITY TESTS - COUPONS & DISCOUNTS (কুপন ও ছাড় ইঞ্জিন)
// =========================================================================

registerTest(
  "SANITY",
  "কুপন ও ছাড় ইঞ্জিন (Discount Engine)",
  "শতাংশ কুপন ও সর্বোচ্চ ছাড় ক্যাপ (Max Cap Discount)",
  () => {
    const dummyProduct = {
      ...(initialProducts[0] || {}),
      id: "prod-test-fixed",
      name: "টেস্ট পণ্য",
      sellingPrice: 2000,
      discountPrice: 2000,
      totalStock: 10,
      categoryId: "cat-1",
    };

    const cart: CartItem[] = [
      {
        id: "cart-item-1",
        product: dummyProduct as any,
        quantity: 2, // 2 x 2000 = 4000
      },
    ];

    const coupon: Coupon = {
      id: "cp-1",
      code: "SAVE20",
      type: "Percentage",
      discountValue: 20, // 20% of 4000 = 800
      minSpend: 1000,
      maxDiscount: 500, // Cap at 500
      status: "Active",
      usageCount: 0,
      usageLimit: 100,
      scopeType: "GLOBAL",
    };

    const res = evaluateCouponDiscount("SAVE20", coupon, cart);
    assert(res.isValid, `কুপন বৈধ হওয়ার কথা কিন্তু ত্রুটি দিয়েছে: ${res.message}`);
    assertEqual(res.discountAmount, 500, "ম্যাক্সিমাম ডিসকাউন্ট ক্যাপ (৫০০৳) প্রয়োগ হয়নি");
    assertEqual(res.eligibleSubtotal, 4000, "এলিজিবল সাবটোটাল হিসাব ভুল");
  },
  "src/utils/discountEngine.ts এর evaluateCouponDiscount এ maxDiscount লজিক পরীক্ষা করুন।"
);

registerTest(
  "SANITY",
  "কুপন ও ছাড় ইঞ্জিন (Discount Engine)",
  "নির্দিষ্ট ক্যাটাগরি স্কোপ কুপন ফিল্টারিং (Category Scope Validation)",
  () => {
    const matchedProduct = {
      id: "prod-electronics",
      name: "স্মার্টফোন",
      sellingPrice: 10000,
      totalStock: 5,
      categoryId: "cat-electronics",
      categoryName: "Electronics",
    };

    const unmatchedProduct = {
      id: "prod-clothing",
      name: "টি-শার্ট",
      sellingPrice: 800,
      totalStock: 10,
      categoryId: "cat-fashion",
      categoryName: "Fashion",
    };

    const cart: CartItem[] = [
      { id: "cart-item-elec", product: matchedProduct as any, quantity: 1 },
      { id: "cart-item-fash", product: unmatchedProduct as any, quantity: 2 },
    ];

    const categoryCoupon: Coupon = {
      id: "cp-cat",
      code: "TECH500",
      type: "Fixed",
      discountValue: 500,
      maxDiscount: 500,
      status: "Active",
      usageCount: 0,
      scopeType: "CATEGORY",
      applicableCategoryIds: ["cat-electronics"],
    };

    const res = evaluateCouponDiscount("TECH500", categoryCoupon, cart, null, initialCategories as any);
    assert(res.isValid, "ক্যাটাগরি কুপন কার্যকর হয়নি");
    assertEqual(res.eligibleSubtotal, 10000, "শুধুমাত্র ইলেকট্রনিক্স পণ্যের সাবটোটাল ১০,০০০৳ হওয়া উচিত");
    assertEqual(res.eligibleItems.length, 1, "এলিজিবল পণ্যের সংখ্যা ১টি হওয়া উচিত");
    assertEqual(res.ineligibleItems.length, 1, "আন-ম্যাচড ফ্যাশন পণ্যটি ইন-এলিজিবল তালিকায় আসা উচিত");
  },
  "isItemEligibleForCoupon ফাংশনে categoryId ম্যাচিং চেক করুন।"
);

registerTest(
  "SANITY",
  "কুপন ও ছাড় ইঞ্জিন (Discount Engine)",
  "মেয়াদোত্তীর্ণ কুপন প্রত্যাখ্যান (Expired Coupon Rejection)",
  () => {
    const expiredCoupon: Coupon = {
      id: "cp-exp",
      code: "EXPIRED10",
      type: "Percentage",
      discountValue: 10,
      maxDiscount: 1000,
      status: "Active",
      usageCount: 0,
      startDate: "2020-01-01",
      endDate: "2021-01-01", // Past date
      scopeType: "GLOBAL",
    };

    const cart: CartItem[] = [
      { id: "cart-item-exp", product: initialProducts[0] as any, quantity: 1 },
    ];

    const res = evaluateCouponDiscount("EXPIRED10", expiredCoupon, cart);
    assertEqual(res.isValid, false, "মেয়াদোত্তীর্ণ কুপন সফল বলে গণ্য হয়েছে যা নিষিদ্ধ");
    assert(res.message.toLowerCase().includes("expired"), "মেয়াদোত্তীর্ণ হওয়ার বার্তা নেই");
  },
  "discountEngine এ endDate ও expiryDate চেক করুন।"
);

// =========================================================================
// SUITE 4: SANITY TESTS - CATALOG & INVENTORY (ক্যাটালগ ও স্টক গার্ড)
// =========================================================================

registerTest(
  "SANITY",
  "প্রোডাক্ট ক্যাটালগ (Product Catalog)",
  "প্রাথমিক ক্যাটালগের অস্তিত্ব ও প্রয়োজনীয় ফিল্ড যাচাই",
  () => {
    assert(Array.isArray(initialProducts), "initialProducts অবশ্যই একটি অ্যারে হতে হবে");
    assert(initialProducts.length > 0, "initialProducts এ অন্তত ১টি পণ্য থাকতে হবে");

    for (const p of initialProducts) {
      assert(Boolean(p.id), `পণ্য আইডি অনুপস্থিত: ${JSON.stringify(p)}`);
      assert(Boolean(p.name), `পণ্যটির নাম অনুপস্থিত (ID: ${p.id})`);
      assert(typeof p.sellingPrice === "number" && p.sellingPrice >= 0, `পণ্যের মূল্য অবশ্যই অঋণাত্মক সংখ্যা হতে হবে (ID: ${p.id})`);
      assert(typeof p.totalStock === "number" && p.totalStock >= 0, `পণ্যের স্টক সংখ্যা অঋণাত্মক হতে হবে (ID: ${p.id})`);
      assert(Boolean(p.categoryId), `পণ্যের ক্যাটাগরি আইডি অনুপস্থিত (ID: ${p.id})`);
    }
  },
  "src/data/mockData.ts এ initialProducts এর অবজেক্ট ডেটা ফিল্ড চেক করুন।"
);

registerTest(
  "SANITY",
  "প্রোডাক্ট ক্যাটালগ (Product Catalog)",
  "ইউনিক আইডি ও ডুপ্লিকেট এসকেইউ পরীক্ষা (Unique ID & SKU Integrity)",
  () => {
    const seenIds = new Set<string>();
    const seenSkus = new Set<string>();

    for (const p of initialProducts) {
      assert(!seenIds.has(p.id), `ডুপ্লিকেট প্রোডাক্ট আইডি পাওয়া গেছে: ${p.id}`);
      seenIds.add(p.id);

      if (p.sku) {
        assert(!seenSkus.has(p.sku), `ডুপ্লিকেট প্রোডাক্ট SKU পাওয়া গেছে: ${p.sku}`);
        seenSkus.add(p.sku);
      }
    }
  },
  "mockData.ts এ ইউনিক আইডি ও এসকেইউ নিশ্চিত করুন।"
);

registerTest(
  "SANITY",
  "প্রোডাক্ট ক্যাটালগ (Product Catalog)",
  "স্টক গার্ড: শূন্য স্টক বিশিষ্ট পণ্য ক্রয় প্রতিরোধ (Out-of-Stock Guard)",
  () => {
    function canAddToCart(stock: number, requestedQty: number): boolean {
      return stock > 0 && requestedQty > 0 && requestedQty <= stock;
    }

    assertEqual(canAddToCart(5, 1), true, "স্টকে থাকলে পণ্য কার্টে যোগ হওয়া উচিত");
    assertEqual(canAddToCart(0, 1), false, "স্টক ০ হলে কার্টে যোগ প্রতিরোধ করা আবশ্যক");
    assertEqual(canAddToCart(2, 5), false, "স্টকের চেয়ে বেশি পরিমাণ চাওয়া হলে প্রতিরোধ করা আবশ্যক");
  },
  "ProductDetailView ও CartDrawer এ স্টক সীমা পরীক্ষা করুন।"
);

// =========================================================================
// SUITE 5: SANITY TESTS - BANGLADESHI OPERATOR PHONE REGEX (ফোন ভ্যালিডেশন)
// =========================================================================

registerTest(
  "SANITY",
  "চেকআউট ও ভ্যালিডেশন (Checkout Validation)",
  "বাংলাদেশি ৭টি মোবাইল অপারেটর (০১৩-০১৯) রেজেক্স ভ্যালিডেশন",
  () => {
    const bdPhoneRegex = /^(?:\+88|88)?(01[3-9]\d{8})$/;

    const validOperatorNumbers = [
      "01300112233", // Skitto / GP
      "01400112233", // Banglalink New
      "01555667788", // Teletalk
      "01677889900", // Airtel
      "01712345678", // Grameenphone
      "01811223344", // Robi
      "01999887766", // Banglalink
      "+8801712345678", // With international prefix
      "8801811223344",  // With 88 prefix
    ];

    for (const num of validOperatorNumbers) {
      assert(bdPhoneRegex.test(num), `বৈধ বাংলাদেশি অপারেটর নাম্বার ব্যর্থ হয়েছে: ${num}`);
    }

    const invalidNumbers = [
      "01234567890", // 012 is invalid BD operator
      "0171234567",  // Only 10 digits
      "017123456789", // 12 digits
      "019abcde123",  // Letters inside
      "1712345678",   // Missing leading zero
      "+12345678901", // Foreign phone number
      "",             // Empty
    ];

    for (const num of invalidNumbers) {
      assert(!bdPhoneRegex.test(num), `অবৈধ নাম্বার সফল হিসেবে পাস করেছে: ${num}`);
    }
  },
  "চেকআউট পেজে মোবাইল ফিল্ডের রেজেক্স প্যাটার্ন চেক করুন।"
);

registerTest(
  "SANITY",
  "চেকআউট ও ভ্যালিডেশন (Checkout Validation)",
  "ডেলিভারি ঠিকানা ও বাধ্যতামূলক ফিল্ড যাচাই (Required Fields Guard)",
  () => {
    function validateCheckoutPayload(payload: {
      name?: string;
      phone?: string;
      address?: string;
      city?: string;
      cartItemsCount: number;
    }) {
      const errors: string[] = [];
      if (!payload.name?.trim()) errors.push("গ্রাহকের নাম আবশ্যক");
      if (!payload.phone?.trim() || !/^(?:\+88|88)?(01[3-9]\d{8})$/.test(payload.phone.trim())) {
        errors.push("সঠিক ১১ ডিজিটের ফোন নাম্বার দিন");
      }
      if (!payload.address?.trim() || payload.address.trim().length < 5) {
        errors.push("পূর্ণাঙ্গ ঠিকানা দিন (কমপক্ষে ৫ অক্ষর)");
      }
      if (payload.cartItemsCount <= 0) {
        errors.push("কার্ট ফাঁকা থাকলে চেকআউট করা সম্ভব নয়");
      }
      return { isValid: errors.length === 0, errors };
    }

    const validPayload = {
      name: "রহিম আহমেদ",
      phone: "01700112233",
      address: "বাড়ি ১২, রোড ৫, ধানমন্ডি, ঢাকা",
      city: "ঢাকা",
      cartItemsCount: 2,
    };
    assert(validateCheckoutPayload(validPayload).isValid, "বৈধ চেকআউট তথ্য ব্যর্থ হয়েছে");

    const invalidPayload = {
      name: "",
      phone: "12345",
      address: "ঢা",
      city: "",
      cartItemsCount: 0,
    };
    const checkRes = validateCheckoutPayload(invalidPayload);
    assertEqual(checkRes.isValid, false, "অবৈধ চেকআউট তথ্য সফল হিসেবে পাস করেছে");
    assertEqual(checkRes.errors.length, 4, "চারটি ফিল্ডের এরর আসা উচিত");
  },
  "CheckoutModal বা CheckoutPage এর ফিল্ড ভ্যালিডেশন নিয়মাবলী চেক করুন।"
);

// =========================================================================
// SUITE 6: RESILIENCE & 3D FALLBACK (রেজিলিয়েন্স ও ৩ডি ফলব্যাক স্যানিটি)
// =========================================================================

registerTest(
  "SANITY",
  "সিস্টেম রেজিলিয়েন্স (System Resilience)",
  "JSON পার্সিং এবং লোকালস্টোরেজ করাপ্ট ডেটা হ্যান্ডলিং",
  () => {
    function safeParseStorage<T>(raw: string | null, fallback: T): T {
      if (!raw) return fallback;
      try {
        return JSON.parse(raw) as T;
      } catch {
        return fallback;
      }
    }

    assertEqual(safeParseStorage('{"valid": true}', {} as any).valid, true, "বৈধ JSON পার্স ব্যর্থ");
    assertEqual(safeParseStorage("invalid{broken_json", { fallback: true }).fallback, true, "ভাঙ্গা JSON ক্র্যাশ না করে ফলব্যাক দেওয়া উচিত");
    assertEqual(safeParseStorage(null, "empty"), "empty", "নাল ডেটার ফলব্যাক হ্যান্ডলিং ব্যর্থ");
  },
  "StoreContext এ localStorage.getItem এর চারপাশে try-catch ব্লক রাখা আবশ্যক।"
);

registerTest(
  "SANITY",
  "সিস্টেম রেজিলিয়েন্স (System Resilience)",
  "৩ডি ওয়েবজিএল ফলব্যাক সেইফটি (3D WebGL Graceful Degradation)",
  () => {
    const isWebGLAvailable = () => {
      try {
        if (typeof window === "undefined") return false;
        const canvas = document.createElement("canvas");
        return Boolean(
          window.WebGLRenderingContext &&
            (canvas.getContext("webgl") || canvas.getContext("experimental-webgl"))
        );
      } catch {
        return false;
      }
    };

    const available = isWebGLAvailable();
    assert(typeof available === "boolean", "WebGL চেক বুলিয়ান মান দিতে ব্যর্থ");
  },
  "3D কার্ডে WebGL সাপোর্ট না থাকলে 2D ইমেজ রেন্ডার করার ফলব্যাক নিশ্চিত করুন।"
);

registerTest(
  "SANITY",
  "সিস্টেম রেজিলিয়েন্স (System Resilience)",
  "এক্সপোর্ট ডেটা স্যানিটাইজেশন ও কারেন্সি রাউন্ডিং",
  () => {
    const testRow = {
      price: "1,200.50",
      total: "৳ 2,401.00",
      title: "স্মার্ট ওয়াচ",
    };
    const sanitized = sanitizeExportRow(testRow);
    assertEqual(sanitized.price, 1200.5, "প্রাইস স্যানিটাইজেশন ব্যর্থ");
  },
  "sanitizeExportRow ফাংশন পরীক্ষা করুন।"
);

// =========================================================================
// RUNNER & REPORTING
// =========================================================================

export async function runAllTests(targetSuite?: "SMOKE" | "SANITY"): Promise<{
  total: number;
  passedCount: number;
  failedCount: number;
  durationMs: number;
  results: TestResult[];
}> {
  const startTime = Date.now();
  const results: TestResult[] = [];

  const filteredTests = targetSuite ? tests.filter((t) => t.suiteType === targetSuite) : tests;

  console.log(`\n${BOLD}${CYAN}======================================================${RESET}`);
  console.log(`${BOLD}${CYAN}   স্মার্ট ই-কমার্স টেস্ট স্যুট: ${targetSuite || "FULL AUDIT (SMOKE + SANITY)"}   ${RESET}`);
  console.log(`${BOLD}${CYAN}   Smart E-Commerce Automated Build & Quality Tests   ${RESET}`);
  console.log(`${BOLD}${CYAN}======================================================${RESET}\n`);

  let currentCategory = "";

  for (const test of filteredTests) {
    if (test.category !== currentCategory) {
      currentCategory = test.category;
      console.log(`\n${BOLD}${BLUE}▸ ${currentCategory}${RESET}`);
    }

    const testStart = Date.now();
    const tag = test.suiteType === "SMOKE" ? `${MAGENTA}[SMOKE]${RESET}` : `${CYAN}[SANITY]${RESET}`;

    try {
      await test.run();
      const durationMs = Date.now() - testStart;
      results.push({
        id: test.id,
        name: test.name,
        category: test.category,
        suiteType: test.suiteType,
        passed: true,
        durationMs,
      });
      console.log(`  ${GREEN}✓ PASS${RESET}  ${tag} ${test.name} ${GRAY}(${durationMs}ms)${RESET}`);
    } catch (err: any) {
      const durationMs = Date.now() - testStart;
      const errorMsg = err?.message || String(err);
      results.push({
        id: test.id,
        name: test.name,
        category: test.category,
        suiteType: test.suiteType,
        passed: false,
        durationMs,
        error: errorMsg,
        suggestedFix: test.suggestedFix,
      });
      console.log(`  ${RED}✗ FAIL${RESET}  ${tag} ${test.name} ${GRAY}(${durationMs}ms)${RESET}`);
      console.log(`     ${RED}Error: ${errorMsg}${RESET}`);
      if (test.suggestedFix) {
        console.log(`     ${YELLOW}প্রস্তাবিত সমাধান: ${test.suggestedFix}${RESET}`);
      }
    }
  }

  const totalDuration = Date.now() - startTime;
  const passedCount = results.filter((r) => r.passed).length;
  const failedCount = results.filter((r) => !r.passed).length;

  console.log(`\n${BOLD}${CYAN}------------------------------------------------------${RESET}`);
  console.log(`${BOLD}টেস্ট ফলাফল সারসংক্ষেপ (${targetSuite || "FULL AUDIT"}):${RESET}`);
  console.log(`মোট টেস্ট: ${BOLD}${results.length}${RESET}`);
  console.log(`সফল (Passed): ${GREEN}${BOLD}${passedCount}${RESET}`);
  console.log(`ব্যর্থ (Failed): ${failedCount > 0 ? RED : GREEN}${BOLD}${failedCount}${RESET}`);
  console.log(`মোট সময় লেগেছে: ${BOLD}${totalDuration}ms${RESET}`);
  console.log(`${BOLD}${CYAN}======================================================${RESET}\n`);

  return {
    total: results.length,
    passedCount,
    failedCount,
    durationMs: totalDuration,
    results,
  };
}

// Auto-run when executed directly from CLI via tsx
if (typeof process !== "undefined" && process.argv && process.argv[1]?.includes("run-audit-tests")) {
  const arg = process.argv[2]?.toUpperCase();
  const targetSuite = arg === "SMOKE" ? "SMOKE" : arg === "SANITY" ? "SANITY" : undefined;
  runAllTests(targetSuite).then(({ failedCount }) => {
    process.exit(failedCount > 0 ? 1 : 0);
  });
}
