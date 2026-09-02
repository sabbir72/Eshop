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
} from "lucide-react";
import { AdminView } from "../../context/StoreContext";
import { ModuleName } from "../../types";

export interface CommandCenterFeature {
  id: AdminView;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  module: ModuleName;
  tag?: string;
  isPopular?: boolean;
}

export interface CommandCenterSubcategory {
  id: string;
  name: string;
  description?: string;
  features: CommandCenterFeature[];
}

export interface CommandCenterCategory {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  badgeColor?: string;
  subcategories: CommandCenterSubcategory[];
}

export const COMMAND_CENTER_CATEGORIES: CommandCenterCategory[] = [
  {
    id: "overview",
    name: "Dashboard & Overview",
    description: "Executive sales KPIs, business intelligence & AI copy assistance",
    icon: LayoutDashboard,
    badgeColor: "bg-indigo-50 text-indigo-700 border-indigo-200",
    subcategories: [
      {
        id: "exec-overview",
        name: "Executive Overview",
        description: "High-level performance monitoring and generative AI tools",
        features: [
          {
            id: "dashboard",
            name: "Command Center Dashboard",
            description: "Real-time revenue metrics, order pipeline & alert monitors",
            icon: LayoutDashboard,
            module: "Product",
            tag: "Live KPIs",
            isPopular: true,
          },
          {
            id: "ai-assistant",
            name: "AI Copywriter & Assistant",
            description: "Generative AI copywriting for product listings, campaigns & SEO",
            icon: Sparkles,
            module: "Product",
            tag: "AI Powered",
            isPopular: true,
          },
        ],
      },
      {
        id: "analytics-reports",
        name: "Business Intelligence",
        description: "Deep data visualization and performance reporting",
        features: [
          {
            id: "reports",
            name: "Reports & Analytics",
            description: "Sales analytics, inventory valuation, customer trends & PDF/Excel exports",
            icon: BarChart3,
            module: "Reports",
            tag: "Analytics",
            isPopular: true,
          },
        ],
      },
    ],
  },
  {
    id: "catalog",
    name: "Catalog Management",
    description: "Product catalog, multi-level category taxonomy & vendor relations",
    icon: Package,
    badgeColor: "bg-blue-50 text-blue-700 border-blue-200",
    subcategories: [
      {
        id: "product-catalog",
        name: "Product Operations",
        description: "SKU tracking, variations, pricing and media assets",
        features: [
          {
            id: "products",
            name: "Products Catalog",
            description: "Manage product CRUD, SKU matrix, variants, bulk imports & media",
            icon: Package,
            module: "Product",
            tag: "Catalog",
            isPopular: true,
          },
        ],
      },
      {
        id: "taxonomy-hierarchy",
        name: "Taxonomy & Hierarchy",
        description: "Store navigation categories and search slugs",
        features: [
          {
            id: "categories",
            name: "Category Hierarchy",
            description: "Multi-level category tree, parent-child taxonomy, Bangla names & SEO slugs",
            icon: Layers,
            module: "Category",
            tag: "Taxonomy",
          },
        ],
      },
      {
        id: "procurement-vendors",
        name: "Procurement & Vendors",
        description: "Supply chain partner directory and purchase management",
        features: [
          {
            id: "supplier-management",
            name: "Supplier Management",
            description: "Supplier directory, procurement records, lead times & order histories",
            icon: Truck,
            module: "CMS",
            tag: "Suppliers",
          },
        ],
      },
    ],
  },
  {
    id: "inventory-logistics",
    name: "Inventory & Warehouse",
    description: "Multi-warehouse stock balances, barcode generation & transfer logistics",
    icon: Building2,
    badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
    subcategories: [
      {
        id: "stock-control",
        name: "Stock Control & Valuation",
        description: "Real-time stock quantities and threshold warnings",
        features: [
          {
            id: "inventory",
            name: "Inventory Management",
            description: "Stock balances, low-stock refill triggers, valuations & barcode labels",
            icon: Building2,
            module: "Inventory",
            tag: "Stock Control",
            isPopular: true,
          },
        ],
      },
      {
        id: "warehouse-logistics",
        name: "Logistics & Stock Transfers",
        description: "Inter-facility transfer orders and dispatch logs",
        features: [
          {
            id: "warehouse-movement",
            name: "Warehouse Movement",
            description: "Inter-warehouse transfers, inward consignments, audits & adjustments",
            icon: ArrowLeftRight,
            module: "Inventory",
            tag: "Logistics",
          },
        ],
      },
    ],
  },
  {
    id: "sales-orders",
    name: "Sales & Orders",
    description: "Customer order processing, dispatch status, invoices & discount codes",
    icon: ShoppingBag,
    badgeColor: "bg-amber-50 text-amber-700 border-amber-200",
    subcategories: [
      {
        id: "order-processing",
        name: "Order Processing",
        description: "Customer checkout fulfillment pipeline and invoices",
        features: [
          {
            id: "orders",
            name: "Order Management",
            description: "Order status workflow (Pending → Delivered), invoice receipts & dispatch",
            icon: ShoppingBag,
            module: "Order",
            tag: "Fulfillment",
            isPopular: true,
          },
        ],
      },
      {
        id: "promotions-discounts",
        name: "Discounts & Incentives",
        description: "Promotional voucher management and campaign codes",
        features: [
          {
            id: "coupons",
            name: "Discounts & Promo Vouchers",
            description: "Storewide, category/group & single-product discounts, flash promo codes & limits",
            icon: Tag,
            module: "Coupon",
            tag: "Multi-Scope Engine",
          },
        ],
      },
    ],
  },
  {
    id: "marketing-growth",
    name: "Marketing & Growth",
    description: "Homepage campaigns, slider banners, promotional popups & SEO metadata",
    icon: Megaphone,
    badgeColor: "bg-purple-50 text-purple-700 border-purple-200",
    subcategories: [
      {
        id: "campaigns-promotions",
        name: "Promotional Campaigns",
        description: "Visual storefront advertising and event banners",
        features: [
          {
            id: "marketing",
            name: "Marketing Management",
            description: "Hero banners, slider promotions, flash sales & announcement popups",
            icon: Megaphone,
            module: "CMS",
            tag: "Campaigns",
          },
        ],
      },
      {
        id: "organic-seo",
        name: "Search Engine Optimization",
        description: "Social previews, meta tags and organic search ranking",
        features: [
          {
            id: "seo-marketing",
            name: "SEO & Growth Strategy",
            description: "Meta tags, OpenGraph social cards, sitemap directives & search keywords",
            icon: Search,
            module: "CMS",
            tag: "SEO Strategy",
          },
        ],
      },
    ],
  },
  {
    id: "support-content",
    name: "Support & Content CMS",
    description: "Customer helpdesk, return requests, knowledge base & corporate info",
    icon: Headphones,
    badgeColor: "bg-teal-50 text-teal-700 border-teal-200",
    subcategories: [
      {
        id: "customer-care",
        name: "Helpdesk & Returns",
        description: "Customer issue resolution and return merchandise authorization",
        features: [
          {
            id: "customer-support",
            name: "Customer Support & RMA",
            description: "Support tickets, live chat conversations, return requests & refund management",
            icon: Headphones,
            module: "Support",
            tag: "Helpdesk",
            isPopular: true,
          },
          {
            id: "faq-kb",
            name: "FAQ Knowledge Base",
            description: "Categorized customer help articles, Q&A repository & helpful ratings",
            icon: HelpCircle,
            module: "CMS",
            tag: "Knowledge Base",
          },
        ],
      },
      {
        id: "corporate-cms",
        name: "Corporate Content & Jobs",
        description: "Company profile, vacancies and legal disclosures",
        features: [
          {
            id: "company-cms",
            name: "Company Info & Inquiries",
            description: "About Us, mission/vision, leadership bios, branches & contact inquiries inbox",
            icon: Building,
            module: "CMS",
            tag: "Corporate CMS",
          },
          {
            id: "careers",
            name: "Careers & Recruitment",
            description: "Job vacancies, department openings & candidate application submissions",
            icon: Briefcase,
            module: "Careers",
            tag: "Careers",
          },
          {
            id: "legal-policies",
            name: "Legal Policies & Docs",
            description: "Privacy policy, terms & conditions, refund rules & shipping policies",
            icon: FileText,
            module: "CMS",
            tag: "Policies",
          },
        ],
      },
    ],
  },
  {
    id: "administration-security",
    name: "Administration & Security",
    description: "Role-based access control, activity audit logs, trust badges & configuration",
    icon: ShieldCheck,
    badgeColor: "bg-rose-50 text-rose-700 border-rose-200",
    subcategories: [
      {
        id: "access-governance",
        name: "Identity & Governance",
        description: "Staff credentials and comprehensive activity auditing",
        features: [
          {
            id: "roles",
            name: "RBAC Roles & Users",
            description: "Staff management, custom role creation & granular module permission matrix",
            icon: ShieldCheck,
            module: "User",
            tag: "RBAC Security",
            isPopular: true,
          },
          {
            id: "audit-logs",
            name: "Audit Logs & Activity",
            description: "Tamper-evident activity trail, user timestamps & system event logging",
            icon: Activity,
            module: "Audit",
            tag: "Audit Trail",
          },
        ],
      },
      {
        id: "system-setup",
        name: "System Configuration",
        description: "Core e-commerce settings, website branding, payment gateways and trust seals",
        features: [
          {
            id: "website-profile",
            name: "Website Profile & Logo",
            description: "Store branding, website logo, favicon, store title & tagline (Super Admin exclusive)",
            icon: Globe,
            module: "Settings",
            tag: "Super Admin",
            isPopular: true,
          },
          {
            id: "settings",
            name: "System Settings",
            description: "Currency, tax rates, shipping costs, payment gateways (bKash, Nagad, SSLCommerz) & SMTP",
            icon: Settings,
            module: "Settings",
            tag: "Config",
          },
          {
            id: "cms-security",
            name: "CMS Security Labels",
            description: "Verified security trust badges, SSL/safe payment labels & site-wide placement",
            icon: ShieldCheck,
            module: "Settings",
            tag: "Trust Seals",
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
  categoryId: string;
  subcategoryName: string;
  subcategoryId: string;
})[] = COMMAND_CENTER_CATEGORIES.flatMap((cat) =>
  cat.subcategories.flatMap((sub) =>
    sub.features.map((feat) => ({
      ...feat,
      categoryName: cat.name,
      categoryId: cat.id,
      subcategoryName: sub.name,
      subcategoryId: sub.id,
    }))
  )
);
