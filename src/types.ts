export type UserRole =
  | "Super Admin"
  | "Admin"
  | "Category Manager"
  | "Product Manager"
  | "Order Manager"
  | "Inventory Manager"
  | "Customer Support"
  | "Customer"
  | "Guest";

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  role: UserRole;
  status: "active" | "inactive" | "locked";
  ordersCount: number;
  totalPurchase: number;
  address: string;
  twoFactorEnabled: boolean;
  createdAt: string;
}

export type ModuleName =
  | "Product"
  | "Category"
  | "Brand"
  | "Customer"
  | "User"
  | "Order"
  | "Report"
  | "Reports"
  | "Inventory"
  | "Coupon"
  | "Settings"
  | "Audit"
  | "AuditLog"
  | "CMS"
  | "Careers"
  | "Support";

export type PermissionAction = "view" | "add" | "edit" | "delete" | "export" | "import";

export interface PermissionActions {
  view: boolean;
  add: boolean;
  edit: boolean;
  delete: boolean;
  export: boolean;
  import: boolean;
}

export type RolePermissions = Record<ModuleName, PermissionActions>;

export interface ProductVariant {
  id: string;
  color: string;
  size: string;
  sku: string;
  barcode: string;
  price: number;
  discountPrice: number;
  stock: number;
  warehouseStock: Record<string, number>;
  image: string;
}

export interface Product {
  id: string;
  name: string;
  name_bn?: string;
  sku: string;
  barcode: string;
  categoryId: string;
  categoryName: string;
  subCategoryId?: string;
  subCategoryName?: string;
  brandId: string;
  brandName: string;
  vendor: string;
  shortDescription: string;
  shortDescription_bn?: string;
  description: string;
  description_bn?: string;
  specifications: Record<string, string>;
  warranty: string;
  tags?: string[];

  // Pricing & Discounts
  costPrice: number;
  purchasePrice: number;
  sellingPrice: number;
  discountPrice: number;
  discountType?: "Percentage" | "Fixed";
  discountValue?: number;
  discountStartDate?: string;
  discountEndDate?: string;
  taxPercent: number;
  vatPercent: number;

  // Media
  mainImage: string;
  galleryImages: string[];
  videoUrl: string;
  zoomImage?: string;

  // Attributes & Variants
  colors: string[];
  sizes: string[];
  weight: string;
  variants: ProductVariant[];

  // Stock & Metrics
  totalStock: number;
  lowStockThreshold?: number;
  isLowStock: boolean;
  status: "Active" | "Draft" | "Inactive" | "Archived";
  rating: number;
  reviewsCount: number;
  createdAt: string;
}

export type CouponScopeType = "GLOBAL" | "CATEGORY" | "PRODUCT" | "PRODUCT_GROUP";
export type CustomerEligibilityType = "ALL" | "NEW_USERS" | "VIP_CUSTOMERS";
export type CodeType = "COUPON" | "PROMO" | "DISCOUNT";

export interface Category {
  id: string;
  name: string;
  name_bn?: string;
  slug: string;
  image: string;
  icon?: string;
  banner?: string;
  bannerImage?: string;
  parentId: string | null;
  description: string;
  description_bn?: string;
  status: "Active" | "Inactive";
  displayOrder?: number;
  seoTitle: string;
  seoKeywords: string;
  seoDescription: string;
  children?: Category[];
  discountType?: "Percentage" | "Fixed";
  discountValue?: number;
  discountStartDate?: string;
  discountEndDate?: string;
}

export interface Brand {
  id: string;
  name: string;
  logo: string;
  description: string;
  status: "Active" | "Inactive";
  productCount: number;
}

export interface Warehouse {
  id: string;
  name: string;
  code: string;
  location: string;
  capacity: number;
  manager: string;
}

export interface InventoryTransaction {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  type: "Stock In" | "Stock Out" | "Transfer" | "Adjustment" | "In" | "Out";
  quantity: number;
  fromWarehouse?: string;
  fromWarehouseId?: string;
  fromWarehouseName?: string;
  toWarehouse?: string;
  toWarehouseId?: string;
  toWarehouseName?: string;
  reason: string;
  performedBy: string;
  createdAt?: string;
  timestamp?: string;
}

export type InventoryStockMovement = InventoryTransaction;

export interface CartItem {
  id: string;
  product: Product;
  selectedVariant?: ProductVariant;
  color?: string;
  size?: string;
  quantity: number;
}

export interface Coupon {
  id: string;
  code: string;
  title?: string;
  description?: string;
  type: "Percentage" | "Fixed" | "Fixed Amount";
  codeType?: CodeType; // COUPON, PROMO, DISCOUNT
  discountValue: number;
  scopeType?: CouponScopeType; // GLOBAL, CATEGORY, PRODUCT, PRODUCT_GROUP
  customerEligibility?: CustomerEligibilityType; // ALL, NEW_USERS, VIP_CUSTOMERS
  applicableCategoryIds?: string[];
  applicableCategoryNames?: string[];
  applicableProductIds?: string[];
  applicableProductNames?: string[];
  productGroupName?: string;
  expiryDate?: string;
  startDate?: string;
  endDate?: string;
  minSpend?: number;
  minPurchase?: number;
  maxDiscount: number;
  usageCount: number;
  usageLimit?: number;
  perUserLimit?: number;
  status: "Active" | "Expired" | "Disabled";
  createdAt?: string;
  updatedAt?: string;
}

export type OrderStatus =
  | "Order Placed"
  | "Payment Confirmed"
  | "Pending"
  | "Processing"
  | "Packed"
  | "Shipped"
  | "Out for Delivery"
  | "Delivered"
  | "Completed"
  | "Returned"
  | "Refunded"
  | "Cancelled";

export type PaymentMethod =
  | "Cash On Delivery"
  | "bKash"
  | "Nagad"
  | "Rocket"
  | "SSLCommerz";

export interface OrderLineItem {
  productId: string;
  productName: string;
  variantSummary?: string;
  price: number;
  quantity: number;
  total: number;
  image: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: {
    street: string;
    city: string;
    postalCode: string;
    country: string;
  };
  items: OrderLineItem[];
  subtotal: number;
  discount: number;
  couponCode?: string;
  shippingCharge: number;
  tax: number;
  isGiftWrapped?: boolean;
  giftWrappingCharge?: number;
  giftSmsEnabled?: boolean;
  giftRecipientPhone?: string;
  giftSenderName?: string;
  giftMessage?: string;
  giftSmsStatus?: "Pending" | "Sent" | "Failed" | "Simulated" | "Not Requested";
  total: number;
  paymentMethod: PaymentMethod;
  paymentStatus: "Unpaid" | "Paid" | "Refunded";
  orderStatus: OrderStatus;
  trackingNumber?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  id: string;
  productId: string;
  productName: string;
  productImage: string;
  customerName: string;
  customerAvatar: string;
  rating: number;
  comment: string;
  status: "Pending" | "Approved" | "Rejected";
  verifiedBuyer: boolean;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: string;
  module: ModuleName | "Auth" | "System" | "Bulk Import";
  previousValue?: string;
  newValue?: string;
  ipAddress: string;
  device?: string;
  userAgent?: string;
  timestamp: string;
}

export interface HomeBanner {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  videoUrl?: string;
  mediaType?: "image" | "video";
  link: string;
  buttonText: string;
  buttonLink?: string;
  bgGradient?: string;
  expiryDate?: string;
  isActive?: boolean;
  offerBadge?: "NEW" | "HOT" | "LIMITED TIME" | "FLASH SALE" | "FESTIVAL";
  couponCode?: string;
  countdownEnd?: string;
  priority?: number;
  startDate?: string;
  endDate?: string;
  termsConditions?: string;
  eligibleProductIds?: string[];
  views?: number;
  clicks?: number;
  conversions?: number;
}

export interface Advertisement {
  id: string;
  title: string;
  description: string;
  type: "slider" | "popup" | "campaign" | "video";
  mediaType: "image" | "video";
  mediaUrl: string;
  videoUrl?: string;
  offerBadge?: "NEW" | "HOT" | "LIMITED TIME" | "FLASH SALE" | "FESTIVAL";
  couponCode?: string;
  countdownEnd?: string;
  buttonText: string;
  buttonLink: string;
  priority: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  termsConditions?: string;
  eligibleProductIds?: string[];
  views: number;
  clicks: number;
  conversions: number;
  createdAt?: string;
}

export interface SecurityLabel {
  id: string;
  title: string;
  description: string;
  iconName: string;
  displayOrder: number;
  isActive: boolean;
  pagePlacement: ("footer" | "checkout" | "homepage")[];
}

export interface BlogArticle {
  id: string;
  title: string;
  author: string;
  date: string;
  excerpt: string;
  content: string;
  image: string;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

export interface CoreValue {
  id: string;
  title: string;
  description: string;
}

export interface AwardItem {
  id: string;
  title: string;
  year: string;
  issuer: string;
  image?: string;
}

export interface PartnerItem {
  id: string;
  name: string;
  logo: string;
  website?: string;
}

export interface AboutUsData {
  companyName: string;
  introduction: string;
  history: string;
  mission: string;
  vision: string;
  coreValues: CoreValue[];
  images: string[];
  videoUrl: string;
  ceoMessage: {
    name: string;
    title: string;
    message: string;
    image: string;
  };
  awards: AwardItem[];
  partners: PartnerItem[];
  published: boolean;
  updatedAt: string;
}

export interface ContactInfoData {
  companyName: string;
  officeAddress: string;
  phone: string;
  mobile: string;
  email: string;
  googleMapEmbedUrl: string;
  businessHours: string;
  liveChatAvailable: boolean;
  whatsAppNumber: string;
}

export interface ContactInquiry {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  status: "New" | "In Progress" | "Responded" | "Archived";
  createdAt: string;
  reply?: string;
}

export interface JobPosting {
  id: string;
  title: string;
  department: string;
  location: string;
  employmentType: "Full-time" | "Part-time" | "Contract" | "Remote" | "Hybrid";
  experience: string;
  salaryRange: string;
  deadline: string;
  description: string;
  responsibilities: string[];
  requirements: string[];
  status: "Open" | "Closed" | "Draft";
  createdAt: string;
}

export interface JobApplication {
  id: string;
  jobId: string;
  jobTitle: string;
  fullName: string;
  email: string;
  phone: string;
  resumeUrl: string;
  coverLetter: string;
  status: "Submitted" | "Under Review" | "Shortlisted" | "Rejected" | "Hired";
  appliedAt: string;
}

export interface PolicySection {
  id: string;
  title: string;
  content: string;
}

export interface PolicyVersionHistory {
  version: string;
  updatedAt: string;
  updatedBy: string;
  notes: string;
}

export interface PolicyDocument {
  id: string;
  title: string;
  sections: PolicySection[];
  version: string;
  updatedAt: string;
  history: PolicyVersionHistory[];
}

export interface FAQCategory {
  id: string;
  name: string;
  slug: string;
  icon?: string;
}

export interface FAQItemExt {
  id: string;
  categoryId: string;
  categoryName: string;
  question: string;
  answer: string;
  helpfulCount: number;
  notHelpfulCount: number;
  isPublished: boolean;
}

export interface ReturnRequest {
  id: string;
  requestNumber: string;
  orderId: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  productId: string;
  productName: string;
  productImage: string;
  reason: "Defective/Faulty" | "Wrong Item Received" | "Item Damaged in Transit" | "Mind Changed" | "Size Issue";
  details: string;
  images: string[];
  status: "Requested" | "Approved" | "Product Received" | "Refund Processed" | "Rejected";
  refundAmount: number;
  createdAt: string;
  updatedAt: string;
}

export interface TicketMessage {
  id: string;
  sender: "Customer" | "Support Agent" | "System";
  senderName: string;
  message: string;
  attachments?: string[];
  createdAt: string;
}

export interface SupportTicket {
  id: string;
  ticketNumber: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  subject: string;
  category: "Account" | "Order" | "Payment" | "Coupons" | "Shipping" | "Returns" | "Technical" | "General";
  priority: "Low" | "Medium" | "High" | "Urgent";
  status: "Open" | "In Progress" | "Resolved" | "Closed";
  assignedAgent?: string;
  messages: TicketMessage[];
  isLiveChat?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SystemSettings {
  websiteName?: string;
  siteName?: string;
  tagline?: string;
  currency: "BDT" | "USD" | "EUR" | "GBP" | string;
  currencySymbol: string;
  taxRate: number; // e.g. 5%
  shippingCharge: number; // e.g. 60 BDT
  supportEmail?: string;
  supportPhone?: string;
  logoUrl?: string;
  faviconUrl?: string;
  themeColor?: string;
  enableTwoFactor?: boolean;
  enableStockAlerts?: boolean;
  paymentGateways?: Record<string, boolean>;
  sslCommerzOnlyOnline?: boolean;
  codMinOrderAmount?: number;
  codMaxOrderAmount?: number;
  codAllowedDistricts?: string[];
  smtpHost?: string;
  smtpPort?: number;
  enableGiftWrapping?: boolean;
  giftWrappingCharge?: number;
  enableGiftSms?: boolean;
  giftSmsCharge?: number;
  defaultGiftGreeting?: string;
  updatedBy?: string;
  updatedAt?: string;
}

export interface SalesReportData {
  title: string;
  period: string;
  totalSales: number;
  totalOrders: number;
}
