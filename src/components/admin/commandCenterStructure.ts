import React from "react";
import {
  LayoutDashboard,
  Package,
  Layers,
  Building2,
  ShoppingBag,
  Tag,
  BarChart3,
  ShieldCheck,
  Activity,
  Sparkles,
  Settings,
  Briefcase,
  HelpCircle,
  Headphones,
  FileText,
  Building,
  Truck,
  Megaphone,
  ArrowLeftRight,
  Search,
  Globe,
  Bot,
  FileSpreadsheet,
  Wallet,
  DollarSign,
  Crown,
  Cpu,
} from "lucide-react";
import { AdminView } from "../../context/StoreContext";
import { ModuleName } from "../../types";

export interface CommandCenterFeature {
  id: AdminView;
  name: string;
  name_bn?: string;
  description: string;
  description_bn?: string;
  icon: React.ComponentType<{ className?: string }>;
  module: ModuleName;
  tag?: string;
  tag_bn?: string;
  isPopular?: boolean;
}

export interface CommandCenterSubcategory {
  id: string;
  name: string;
  name_bn?: string;
  description?: string;
  description_bn?: string;
  features: CommandCenterFeature[];
}

export interface CommandCenterCategory {
  id: string;
  name: string;
  name_bn?: string;
  description: string;
  description_bn?: string;
  icon: React.ComponentType<{ className?: string }>;
  badgeColor?: string;
  subcategories: CommandCenterSubcategory[];
}

export function getFeatureName(feat: CommandCenterFeature, lang: "EN" | "BN" = "EN"): string {
  if (lang === "BN" && feat.name_bn) return feat.name_bn;
  return feat.name;
}

export function getFeatureDesc(feat: CommandCenterFeature, lang: "EN" | "BN" = "EN"): string {
  if (lang === "BN" && feat.description_bn) return feat.description_bn;
  return feat.description;
}

export function getCategoryName(cat: CommandCenterCategory | CommandCenterSubcategory, lang: "EN" | "BN" = "EN"): string {
  if (lang === "BN" && cat.name_bn) return cat.name_bn;
  return cat.name;
}

export function getCategoryDesc(cat: CommandCenterCategory | CommandCenterSubcategory, lang: "EN" | "BN" = "EN"): string {
  if (lang === "BN" && cat.description_bn) return cat.description_bn;
  return cat.description || "";
}

export const COMMAND_CENTER_CATEGORIES: CommandCenterCategory[] = [
  {
    id: "overview",
    name: "Dashboard & Overview",
    name_bn: "ড্যাশবোর্ড ও সার্বিক পরিসংখ্যান",
    description: "Executive sales KPIs, business intelligence & AI copy assistance",
    description_bn: "ব্যবসা পরিচালন কেপিআই, বিক্রয় মেট্রিক্স এবং এআই সহায়তা",
    icon: LayoutDashboard,
    badgeColor: "bg-indigo-50 text-indigo-700 border-indigo-200",
    subcategories: [
      {
        id: "exec-overview",
        name: "Executive Overview",
        name_bn: "নির্বাহী নিয়ন্ত্রণ",
        description: "High-level performance monitoring and generative AI tools",
        description_bn: "শীর্ষ পর্যায়ের পারফরম্যান্স ও এআই টুলস",
        features: [
          {
            id: "dashboard",
            name: "Command Center Dashboard",
            name_bn: "কমান্ড সেন্টার ড্যাশবোর্ড",
            description: "Real-time revenue metrics, order pipeline & alert monitors",
            description_bn: "রিয়েল-টাইম আয়, অর্ডার ট্র্যাকিং এবং লাইভ অ্যালার্ট মনিটর",
            icon: LayoutDashboard,
            module: "Product",
            tag: "Live KPIs",
            tag_bn: "লাইভ কেপিআই",
            isPopular: true,
          },
          {
            id: "ai-agent",
            name: "AI Business Agent",
            name_bn: "এআই বিজনেস এজেন্ট",
            description: "Autonomous Agent for Marketing, Leads, Sales Oversight & 24/7 Customer Service",
            description_bn: "মার্কেটিং, লিড জেনারেশন ও সার্বক্ষণিক কাস্টমার কেয়ারের অটোনোমাস এজেন্ট",
            icon: Bot,
            module: "Product",
            tag: "Autonomous AI",
            tag_bn: "অটোনোমাস এআই",
            isPopular: true,
          },
          {
            id: "ai-assistant",
            name: "AI Copywriter & Assistant",
            name_bn: "এআই কপিরাইটার ও সহকারী",
            description: "Generative AI copywriting for product listings, campaigns & SEO",
            description_bn: "পণ্য বিবরণী, ক্যাম্পেইন ও এসইওর জন্য এআই কন্টেন্ট প্রস্তুতকারক",
            icon: Sparkles,
            module: "Product",
            tag: "AI Powered",
            tag_bn: "এআই চালিত",
            isPopular: true,
          },
        ],
      },
      {
        id: "analytics-reports",
        name: "Business Intelligence & Data",
        name_bn: "বিজনেস ইন্টেলিজেন্স ও ডাটা",
        description: "Deep data visualization, Excel synchronization and performance reporting",
        description_bn: "গভীর ডাটা বিশ্লেষণ, এক্সেল সমন্বয় ও পারফরম্যান্স রিপোর্ট",
        features: [
          {
            id: "reports",
            name: "Reports & Analytics",
            name_bn: "রিপোর্ট ও বিশ্লেষণ",
            description: "Sales analytics, inventory valuation, customer trends & PDF/Excel exports",
            description_bn: "বিক্রয় বিশ্লেষণ, স্টক মূল্যায়ন ও এক্সেল/পিডিএফ ডাউনলোড",
            icon: BarChart3,
            module: "Reports",
            tag: "Analytics",
            tag_bn: "বিশ্লেষণ",
            isPopular: true,
          },
          {
            id: "excel-hub",
            name: "Excel Data Hub",
            name_bn: "এক্সেল ডাটা হাব",
            description: "Universal Excel & CSV data sync, bulk product upload & multi-sheet master backup",
            description_bn: "এক্সেল ও সিএসভি ডেটা সিঙ্ক, বাল্ক পণ্য আপলোড এবং মাস্টার ব্যাকআপ",
            icon: FileSpreadsheet,
            module: "Product",
            tag: "Excel System",
            tag_bn: "এক্সেল সিস্টেম",
            isPopular: true,
          },
          {
            id: "cash-calculation",
            name: "Cash Reconciliation Log",
            name_bn: "ক্যাশ হিসাব ও রিকনসিলিয়েশন লগ",
            description: "Real-time COD cash-in-hand, courier remittance, cash drawer denomination tally & balance",
            description_bn: "ক্যাশ অন ডেলিভারি হিসাব, কুরিয়ার রসিদ ও দৈনিক ব্যালেন্স হিসাব",
            icon: Wallet,
            module: "Reports",
            tag: "Cash Audit",
            tag_bn: "ক্যাশ অডিট",
            isPopular: true,
          },
        ],
      },
    ],
  },
  {
    id: "catalog",
    name: "Catalog Management",
    name_bn: "ক্যাটালগ ও পণ্য ব্যবস্থাপনা",
    description: "Product catalog, multi-level category taxonomy & vendor relations",
    description_bn: "পণ্য ক্যাটালগ, ক্যাটাগরি শ্রেণিবিন্যাস এবং সরবরাহকারী সম্পর্ক",
    icon: Package,
    badgeColor: "bg-blue-50 text-blue-700 border-blue-200",
    subcategories: [
      {
        id: "product-catalog",
        name: "Product Operations",
        name_bn: "পণ্য পরিচালনা",
        description: "SKU tracking, variations, pricing and media assets",
        description_bn: "এসকেইউ ট্র্যাকিং, ভ্যারিয়েশন, মূল্য নির্ধারণ এবং পণ্যের ছবি",
        features: [
          {
            id: "products",
            name: "Products Catalog",
            name_bn: "পণ্য ক্যাটালগ",
            description: "Manage product CRUD, SKU matrix, variants, bulk imports & media",
            description_bn: "পণ্য তৈরি ও সম্পাদনা, এসকেইউ ম্যাট্রিক্স এবং স্টক নিয়ন্ত্রণ",
            icon: Package,
            module: "Product",
            tag: "Catalog",
            tag_bn: "ক্যাটালগ",
            isPopular: true,
          },
        ],
      },
      {
        id: "taxonomy-hierarchy",
        name: "Taxonomy & Hierarchy",
        name_bn: "ক্যাটাগরি ও শ্রেণিবিন্যাস",
        description: "Store navigation categories and search slugs",
        description_bn: "স্টোরের ক্যাটাগরি ট্রি এবং সার্চ স্লাগসমূহ",
        features: [
          {
            id: "categories",
            name: "Category Hierarchy",
            name_bn: "ক্যাটাগরি বিন্যাস",
            description: "Multi-level category tree, parent-child taxonomy, Bangla names & SEO slugs",
            description_bn: "বহুস্তর বিশিষ্ট ক্যাটাগরি ট্রি, বাংলা নাম এবং এসইও স্লাগ",
            icon: Layers,
            module: "Category",
            tag: "Taxonomy",
            tag_bn: "শ্রেণিবিন্যাস",
          },
        ],
      },
      {
        id: "procurement-vendors",
        name: "Procurement & Vendors",
        name_bn: "সরবরাহকারী ও সংগ্রহ",
        description: "Supply chain partner directory and purchase management",
        description_bn: "সরবরাহকারী তালিকা এবং ক্রয়ের ইতিহাস",
        features: [
          {
            id: "supplier-management",
            name: "Supplier Management",
            name_bn: "সরবরাহকারী ব্যবস্থাপনা",
            description: "Supplier directory, procurement records, lead times & order histories",
            description_bn: "সরবরাহকারী ডিরেক্টরি, সংগ্রহ ও ক্রয়ের রেকর্ড এবং সরবরাহ সময়কাল",
            icon: Truck,
            module: "CMS",
            tag: "Suppliers",
            tag_bn: "সরবরাহকারী",
          },
        ],
      },
    ],
  },
  {
    id: "inventory-logistics",
    name: "Inventory & Warehouse",
    name_bn: "ইনভেন্টরি ও ওয়্যারহাউস",
    description: "Multi-warehouse stock balances, barcode generation & transfer logistics",
    description_bn: "ওয়্য়ারহাউস স্টক ব্যালেন্স, বারকোড ও লজিস্টিকস ব্যবস্থাপনা",
    icon: Building2,
    badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
    subcategories: [
      {
        id: "stock-control",
        name: "Stock Control & Valuation",
        name_bn: "স্টক নিয়ন্ত্রণ ও মূল্যায়ন",
        description: "Real-time stock quantities and threshold warnings",
        description_bn: "রিয়েল-টাইম স্টক সংখ্যা ও লো-স্টক সতর্কতা",
        features: [
          {
            id: "inventory",
            name: "Inventory Management",
            name_bn: "ইনভেন্টরি ব্যবস্থাপনা",
            description: "Stock balances, low-stock refill triggers, valuations & barcode labels",
            description_bn: "স্টক ব্যালেন্স, রিফিল অ্যালার্ট, বারকোড লেবেল এবং স্টক মূল্যায়ন",
            icon: Building2,
            module: "Inventory",
            tag: "Stock Control",
            tag_bn: "স্টক নিয়ন্ত্রণ",
            isPopular: true,
          },
        ],
      },
      {
        id: "warehouse-logistics",
        name: "Logistics & Stock Transfers",
        name_bn: "লজিস্টিকস ও পণ্য স্থানান্তর",
        description: "Inter-facility transfer orders and dispatch logs",
        description_bn: "ওয়্যারহাউসগুলোর মধ্যে পণ্য স্থানান্তর লগ",
        features: [
          {
            id: "warehouse-movement",
            name: "Warehouse Movement",
            name_bn: "ওয়্যারহাউস মুভমেন্ট",
            description: "Inter-warehouse transfers, inward consignments, audits & adjustments",
            description_bn: "ওয়্যারহাউস স্থানান্তর, পণ্য গ্রহণ, নিরীক্ষা ও স্টক সমন্বয়",
            icon: ArrowLeftRight,
            module: "Inventory",
            tag: "Logistics",
            tag_bn: "লজিস্টিকস",
          },
        ],
      },
    ],
  },
  {
    id: "sales-orders",
    name: "Sales & Orders",
    name_bn: "বিক্রয় ও অর্ডার",
    description: "Customer order processing, dispatch status, invoices & discount codes",
    description_bn: "অর্ডার প্রসেসিং, ডেলিভারি স্ট্যাটাস, ইনভয়েস এবং কুপন কোড",
    icon: ShoppingBag,
    badgeColor: "bg-amber-50 text-amber-700 border-amber-200",
    subcategories: [
      {
        id: "order-processing",
        name: "Order Processing",
        name_bn: "অর্ডার প্রক্রিয়াকরণ",
        description: "Customer checkout fulfillment pipeline and invoices",
        description_bn: "গ্রাহকের অর্ডার সম্পন্নকরণ এবং ইনভয়েস তৈরি",
        features: [
          {
            id: "orders",
            name: "Order Management",
            name_bn: "অর্ডার ব্যবস্থাপনা",
            description: "Order status workflow (Pending → Delivered), invoice receipts & dispatch",
            description_bn: "অর্ডার স্ট্যাটাস (অপেক্ষমাণ → ডেলিভার্ড), চালান রসিদ ও কুরিয়ার ট্র্যাকিং",
            icon: ShoppingBag,
            module: "Order",
            tag: "Fulfillment",
            tag_bn: "ডেলিভারি",
            isPopular: true,
          },
        ],
      },
      {
        id: "membership-club-ops",
        name: "Membership & VIP Club",
        name_bn: "মেম্বারশিপ ও ভিআইপি ক্লাব",
        description: "3 Membership tiers, physical card delivery orders & price compromise negotiation",
        description_bn: "৩টি মেম্বারশিপ টায়ার, ফিজিক্যাল কার্ড ডেলিভারি এবং মূল্য সমঝোতা",
        features: [
          {
            id: "memberships",
            name: "Membership Club & Offers",
            name_bn: "মেম্বারশিপ ও বিশেষ মূল্য অফার",
            description: "3 Membership tiers (Silver, Gold, Platinum), physical card dispatch & price compromise approvals",
            description_bn: "সিলভার, গোল্ড ও প্ল্যাটিনাম মেম্বারশিপ, কার্ড প্রিন্টিং ও মূল্য সমঝোতা অনুমোদন",
            icon: Crown,
            module: "CMS",
            tag: "VIP Club",
            tag_bn: "ভিআইপি ক্লাব",
            isPopular: true,
          },
        ],
      },
      {
        id: "promotions-discounts",
        name: "Discounts & Incentives",
        name_bn: "ছাড় ও প্রোমোশন",
        description: "Promotional voucher management and campaign codes",
        description_bn: "প্রোমোশনাল ভাউচার ও ক্যাম্পেইন ডিসকাউন্ট কোড",
        features: [
          {
            id: "coupons",
            name: "Discounts & Promo Vouchers",
            name_bn: "ডিসকাউন্ট ও প্রোমো ভাউচার",
            description: "Storewide, category/group & single-product discounts, flash promo codes & limits",
            description_bn: "সাইটওয়াইড, নির্দিষ্ট ক্যাটাগরি ও পণ্যের জন্য কুপন ও কোটা নির্ধারণ",
            icon: Tag,
            module: "Coupon",
            tag: "Coupons",
            tag_bn: "কুপন",
          },
        ],
      },
    ],
  },
  {
    id: "marketing-growth",
    name: "Marketing & Growth",
    name_bn: "মার্কেটিং ও প্রবৃদ্ধি",
    description: "Homepage campaigns, slider banners, promotional popups & SEO metadata",
    description_bn: "হোমপেজ ক্যাম্পেইন, স্লাইডার ব্যানার, বিশেষ অফার ও এসইও",
    icon: Megaphone,
    badgeColor: "bg-purple-50 text-purple-700 border-purple-200",
    subcategories: [
      {
        id: "campaigns-promotions",
        name: "Promotional Campaigns",
        name_bn: "প্রচারণা ক্যাম্পেইন",
        description: "Visual storefront advertising and event banners",
        description_bn: "বিজ্ঞাপন ব্যানার ও মনোবিজ্ঞানভিত্তিক বিপণন কৌশল",
        features: [
          {
            id: "marketing",
            name: "Psychological Marketing & Campaigns",
            name_bn: "মনোবিজ্ঞানভিত্তিক মার্কেটিং ও অফার",
            description: "Special offers, 3 psychological triggers (urgency, social proof, anchoring) & hero banners",
            description_bn: "বিশেষ অফার, ৩টি নির্ভরযোগ্য প্রচার কৌশল (আর্জেন্ট অফার, সোশ্যাল প্রুফ, অ্যাঙ্করিং) ও ব্যানার",
            icon: Megaphone,
            module: "CMS",
            tag: "Campaigns",
            tag_bn: "ক্যাম্পেইন",
            isPopular: true,
          },
        ],
      },
      {
        id: "organic-seo",
        name: "Search Engine Optimization",
        name_bn: "সার্চ ইঞ্জিন অপ্টিমাইজেশন (SEO)",
        description: "Social previews, meta tags and organic search ranking",
        description_bn: "সোশ্যাল শেয়ার কার্ড, মেটা ট্যাগ এবং সার্চ র‍্যাংকিং",
        features: [
          {
            id: "seo-marketing",
            name: "SEO & Growth Strategy",
            name_bn: "এসইও ও সার্চ কৌশল",
            description: "Meta tags, OpenGraph social cards, sitemap directives & search keywords",
            description_bn: "মেটা ট্যাগ, ওপেনগ্রাফ কার্ড, সাইটম্যাপ নির্দেশনা এবং সার্চ কি-ওয়ার্ডস",
            icon: Search,
            module: "CMS",
            tag: "SEO Strategy",
            tag_bn: "এসইও কৌশল",
          },
        ],
      },
    ],
  },
  {
    id: "support-content",
    name: "Support & Content CMS",
    name_bn: "গ্রাহক সহায়তা ও কন্টেন্ট",
    description: "Customer helpdesk, return requests, knowledge base & corporate info",
    description_bn: "কাস্টমার হেল্পডেস্ক, রিটার্ন রিকোয়েস্ট, তথ্যভাণ্ডার ও কর্পোরেট তথ্য",
    icon: Headphones,
    badgeColor: "bg-teal-50 text-teal-700 border-teal-200",
    subcategories: [
      {
        id: "customer-care",
        name: "Helpdesk & Returns",
        name_bn: "হেল্পডেস্ক ও রিটার্ন",
        description: "Customer issue resolution and return merchandise authorization",
        description_bn: "গ্রাহক সমস্যার সমাধান এবং রিটার্ন প্রক্রিয়াকরণ",
        features: [
          {
            id: "customer-support",
            name: "Customer Support Desk",
            name_bn: "কাস্টমার সাপোর্ট ডেস্ক",
            description: "Omnichannel service desk, SLA tracking, AI resolution, RMA return audit & live conversations",
            description_bn: "সার্ভিস ডেস্ক, এসএলএ ট্র্যাকিং, এআই রেজোলিউশন ও রিটার্ন রিকোয়েস্ট",
            icon: Headphones,
            module: "Support",
            tag: "Service Desk",
            tag_bn: "সার্ভিস ডেস্ক",
            isPopular: true,
          },
          {
            id: "faq-kb",
            name: "FAQ Knowledge Base",
            name_bn: "সাধারণ প্রশ্নোত্তর ও তথ্যভাণ্ডার",
            description: "Categorized customer help articles, Q&A repository & helpful ratings",
            description_bn: "ক্যাটাগরিভিত্তিক প্রশ্নোত্তর, সহায়তা আর্টিকেল এবং রেটিং",
            icon: HelpCircle,
            module: "CMS",
            tag: "Knowledge Base",
            tag_bn: "তথ্যভাণ্ডার",
          },
        ],
      },
      {
        id: "corporate-cms",
        name: "Corporate Content & Jobs",
        name_bn: "কোম্পানি তথ্য ও ক্যারিয়ার",
        description: "Company profile, vacancies and legal disclosures",
        description_bn: "কোম্পানি প্রোফাইল, চাকরির সুযোগ এবং আইনি নীতিমালা",
        features: [
          {
            id: "company-cms",
            name: "Company Info & Inquiries",
            name_bn: "আমাদের সম্পর্কে ও বার্তা",
            description: "About Us, mission/vision, leadership bios, branches & contact inquiries inbox",
            description_bn: "আমাদের লক্ষ্য, নেতৃত্ব, শাখা এবং ইনকোয়ারি ইনবক্স",
            icon: Building,
            module: "CMS",
            tag: "Corporate CMS",
            tag_bn: "কোম্পানি কন্টেন্ট",
          },
          {
            id: "careers",
            name: "Careers & Recruitment",
            name_bn: "ক্যারিয়ার ও নিয়োগ",
            description: "Job vacancies, department openings & candidate application submissions",
            description_bn: "চাকরির বিজ্ঞপ্তি, বিভাগের শূন্যপদ এবং আবেদন ব্যবস্থাপনা",
            icon: Briefcase,
            module: "Careers",
            tag: "Careers",
            tag_bn: "ক্যারিয়ার",
          },
          {
            id: "legal-policies",
            name: "Legal Policies & Terms",
            name_bn: "আইনি নীতিমালা ও শর্তাবলী",
            description: "Privacy policy, terms & conditions, refund rules & shipping policies",
            description_bn: "গোপনীয়তা নীতি, শর্তাবলী, রিফান্ড পলিসি ও ডেলিভারি নির্দেশিকা",
            icon: FileText,
            module: "CMS",
            tag: "Policies",
            tag_bn: "নীতিমালা",
          },
        ],
      },
    ],
  },
  {
    id: "administration-security",
    name: "Administration & Security",
    name_bn: "প্রশাসন ও নিরাপত্তা",
    description: "Role-based access control, activity audit logs, trust badges & configuration",
    description_bn: "রোল ভিত্তিক প্রবেশাধিকার, অডিট লগ, ট্রাস্ট সিল ও সিস্টেম কনফিগারেশন",
    icon: ShieldCheck,
    badgeColor: "bg-rose-50 text-rose-700 border-rose-200",
    subcategories: [
      {
        id: "access-governance",
        name: "Identity & Governance",
        name_bn: "ইউজার ও ভূমিকা",
        description: "Staff credentials and comprehensive activity auditing",
        description_bn: "কর্মকর্তা তালিকা এবং কার্যকলাপ নিরীক্ষা",
        features: [
          {
            id: "roles",
            name: "RBAC Roles & Permissions",
            name_bn: "ভূমিকা ও অনুমতি (RBAC)",
            description: "Staff management, custom role creation & granular module permission matrix",
            description_bn: "কর্মকর্তা পরিচালনা, ভূমিকা তৈরি ও মডিউল পারমিশন ম্যাট্রিক্স",
            icon: ShieldCheck,
            module: "User",
            tag: "RBAC Security",
            tag_bn: "নিরাপত্তা ভূমিকা",
            isPopular: true,
          },
          {
            id: "audit-logs",
            name: "Audit Logs & Activity",
            name_bn: "অডিট লগ ও কার্যকলাপ",
            description: "Tamper-evident activity trail, user timestamps & system event logging",
            description_bn: "নিরাপদ কার্যকলাপ লগ, টাইমস্ট্যাম্প এবং সিস্টেম ইভেন্ট হিস্ট্রি",
            icon: Activity,
            module: "Audit",
            tag: "Audit Trail",
            tag_bn: "অডিট ট্রেইল",
          },
        ],
      },
      {
        id: "system-setup",
        name: "System Configuration",
        name_bn: "সিস্টেম কনফিগারেশন",
        description: "Core e-commerce settings, website branding, payment gateways and trust seals",
        description_bn: "ওয়েবসাইট ব্র্যান্ডিং, পেমেন্ট গেটওয়ে, টেস্ট ও সিস্টেম সেটিংস",
        features: [
          {
            id: "website-profile",
            name: "Website Profile & Logo",
            name_bn: "ওয়েবসাইট প্রোফাইল ও লোগো",
            description: "Store branding, website logo, favicon, store title & tagline (Super Admin exclusive)",
            description_bn: "স্টোরের লোগো, ফ্যাভিকন, শিরোনাম এবং ব্র্যান্ডিং পরিচয়",
            icon: Globe,
            module: "Settings",
            tag: "Super Admin",
            tag_bn: "সুপার এডমিন",
            isPopular: true,
          },
          {
            id: "settings",
            name: "System Settings",
            name_bn: "সিস্টেম সেটিংস",
            description: "Currency, tax rates, shipping costs, payment gateways (bKash, Nagad, SSLCommerz) & SMTP",
            description_bn: "মুদ্রা, ট্যাক্স রেট, শিপিং চার্জ এবং বিকাশ/নগদ পেমেন্ট গেটওয়ে",
            icon: Settings,
            module: "Settings",
            tag: "Config",
            tag_bn: "কনফিগ",
          },
          {
            id: "cms-security",
            name: "CMS Security Labels",
            name_bn: "নিরাপত্তা ট্রাস্ট লেবেল",
            description: "Verified security trust badges, SSL/safe payment labels & site-wide placement",
            description_bn: "যাচাইকৃত সিকিউরিটি ট্রাস্ট ব্যাজ এবং নিরাপদ পেমেন্ট সিল",
            icon: ShieldCheck,
            module: "Settings",
            tag: "Trust Seals",
            tag_bn: "ট্রাস্ট সিল",
          },
          {
            id: "system-diagnostics",
            name: "System Health & Test Audit",
            name_bn: "সিস্টেম টেস্ট ও বাগ ডিটেক্টর",
            description: "Automated regression testing, smoke/sanity audits & Playwright E2E suites",
            description_bn: "নতুন বিল্ড বা কোড পরিবর্তনের পর স্বয়ংক্রিয় অডিট ও বাগ চেকার (Automated Tests)",
            icon: Cpu,
            module: "Settings",
            tag: "Quality Audit",
            tag_bn: "কোয়ালিটি অডিট",
            isPopular: true,
          },
        ],
      },
    ],
  },
];

// Helper to find breadcrumb trail for any active view
export interface BreadcrumbTrail {
  category: CommandCenterCategory;
  subcategory: CommandCenterSubcategory;
  feature: CommandCenterFeature;
}

export function findBreadcrumbsForView(viewId: AdminView): BreadcrumbTrail | null {
  for (const category of COMMAND_CENTER_CATEGORIES) {
    for (const subcategory of category.subcategories) {
      for (const feature of subcategory.features) {
        if (feature.id === viewId) {
          return { category, subcategory, feature };
        }
      }
    }
  }
  return null;
}

// Flat list of all features for quick lookup and search
export const ALL_COMMAND_CENTER_FEATURES: (CommandCenterFeature & {
  categoryName: string;
  categoryName_bn?: string;
  categoryId: string;
  subcategoryName: string;
  subcategoryName_bn?: string;
  subcategoryId: string;
})[] = COMMAND_CENTER_CATEGORIES.flatMap((cat) =>
  cat.subcategories.flatMap((sub) =>
    sub.features.map((feat) => ({
      ...feat,
      categoryName: cat.name,
      categoryName_bn: cat.name_bn,
      categoryId: cat.id,
      subcategoryName: sub.name,
      subcategoryName_bn: sub.name_bn,
      subcategoryId: sub.id,
    }))
  )
);
