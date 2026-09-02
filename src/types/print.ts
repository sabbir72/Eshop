export type PrintableDocumentType =
  | "invoice"
  | "money_receipt"
  | "quotation"
  | "purchase_order"
  | "sales_order"
  | "packing_slip"
  | "shipping_label"
  | "courier_label"
  | "delivery_challan"
  | "return_slip"
  | "refund_slip"
  | "inventory_report"
  | "warehouse_transfer"
  | "warehouse_movement"
  | "barcode_labels"
  | "qr_labels"
  | "product_labels"
  | "stock_report"
  | "sales_report"
  | "purchase_report"
  | "customer_report"
  | "supplier_report"
  | "audit_log_report"
  | "audit_log"
  | "careers_report"
  | "applicants_report"
  | "support_tickets"
  | "support_ticket_report"
  | "rma_report"
  | "coupon_report"
  | "employee_report"
  | "applicant_report"
  | "system_report";

export type DocumentWatermark =
  | "ORIGINAL"
  | "COPY"
  | "REPRINT"
  | "DRAFT"
  | "PAID"
  | "UNPAID"
  | "CANCELLED"
  | "CONFIDENTIAL"
  | "APPROVED";

export type PaperSize = "A4" | "A5" | "Letter" | "Thermal-4x6" | "Thermal-80mm";
export type PageOrientation = "portrait" | "landscape";
export type PrintMargin = "normal" | "compact" | "borderless";

export interface PrintSettings {
  paperSize: PaperSize;
  orientation: PageOrientation;
  margin: PrintMargin;
  showHeader: boolean;
  showFooter: boolean;
  showWatermark: boolean;
  showSignatures: boolean;
  watermarkText: DocumentWatermark | string;
  logoSize: "small" | "medium" | "large";
  copies: number;
}

export interface PrintableItem {
  id: string;
  name: string;
  sku?: string;
  barcode?: string;
  quantity: number;
  unit?: string;
  unitPrice: number;
  discount?: number;
  tax?: number;
  total: number;
  notes?: string;
}

export interface PrintableDocumentData {
  documentType: PrintableDocumentType;
  documentTitle: string;
  documentNumber: string;
  referenceNumber?: string;

  // Status & Watermark
  status: string;
  watermark?: DocumentWatermark | string;

  // Header Info
  generatedDate: string;
  generatedTime: string;
  generatedBy: string;

  // Party Details
  companyInfo?: {
    name: string;
    address: string;
    phone: string;
    email: string;
    website: string;
    tradeLicense?: string;
    binVat?: string;
    tin?: string;
    logo?: string;
  };

  customerInfo?: {
    name: string;
    phone: string;
    email?: string;
    address?: string;
  };

  shippingInfo?: {
    recipientName: string;
    phone: string;
    address: string;
    city?: string;
    postalCode?: string;
    courierName?: string;
    trackingNumber?: string;
  };

  supplierInfo?: {
    name: string;
    company: string;
    contactPerson: string;
    email: string;
    phone: string;
    address?: string;
  };

  // Table Data
  headers?: string[];
  items?: PrintableItem[];
  rawRows?: (string | number)[][];

  // Financial Breakdown
  subtotal?: number;
  discountTotal?: number;
  taxTotal?: number;
  shippingCharge?: number;
  isGiftWrapped?: boolean;
  giftWrappingCharge?: number;
  giftMessage?: string;
  giftSenderName?: string;
  giftRecipientPhone?: string;
  grandTotal?: number;
  currencySymbol?: string;
  paymentMethod?: string;
  paymentStatus?: string;

  // Notes & Signatures
  notes?: string;
  termsConditions?: string;
  signaturesNeeded?: ("Authorized" | "Customer" | "Received By" | "Prepared By" | "Approved By" | string)[];
}

export interface PrintLogRecord {
  id: string;
  documentType: PrintableDocumentType;
  documentNumber: string;
  printedBy: string;
  printedByRole: string;
  printCount: number;
  timestamp: string;
  reprintReason?: string;
  paperSize: PaperSize;
}
