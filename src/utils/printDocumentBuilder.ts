import { Order, Product, SalesReportData } from "../types";
import { PrintableDocumentData, PrintableDocumentType, DocumentCopyType } from "../types/print";

/**
 * Helper utility to build standard Enterprise Printable Document objects for any application entity.
 */

export function buildOrderInvoiceData(
  order: Order,
  currencySymbol: string = "৳",
  copyType: DocumentCopyType = "customer"
): PrintableDocumentData {
  let documentTitle = "OFFICIAL TAX INVOICE & CASH MEMO";
  let copyLabel = "CUSTOMER COPY (গ্রাহক কপি)";
  let notes = order.isGiftWrapped
    ? "🎁 GIFT ORDER: Handcrafted premium gift wrap applied. Thank you for shopping with us!"
    : "Thank you for shopping with SmartShop! 7-day return policy applicable. Retain this customer copy for warranty.";
  let signaturesNeeded = ["Customer Signature", "Authorized Signature & Seal"];

  if (copyType === "office") {
    documentTitle = "ACCOUNTS & AUDIT INVOICE";
    copyLabel = "OFFICE / ACCOUNTS COPY (অফিস ও হিসাব কপি)";
    notes = "Official Office Record. Retain in company sales & VAT tax archive. Validated by Accounts Division.";
    signaturesNeeded = ["Prepared By (Sales)", "Verified By (Accounts)", "Authorized Managing Director"];
  } else if (copyType === "shipment") {
    documentTitle = "DELIVERY CHALLAN & COURIER DISPATCH";
    copyLabel = "SHIPMENT & COURIER COPY (শিপমেন্ট ও ডেলিভারি চালান)";
    notes = "Logistics Dispatch Slip. Rider must verify sealed condition, package contents, and collect COD amount.";
    signaturesNeeded = ["Warehouse Dispatch Officer", "Courier / Delivery Rider", "Receiver Signature & Contact"];
  }

  return {
    documentType: "invoice",
    documentTitle,
    documentNumber: order.orderNumber,
    referenceNumber: order.trackingNumber || `REF-${order.id.slice(0, 6).toUpperCase()}`,
    copyType,
    copyLabel,
    status: order.orderStatus,
    watermark:
      order.paymentStatus === "Paid"
        ? "PAID"
        : order.orderStatus === "Cancelled"
        ? "CANCELLED"
        : copyType === "customer"
        ? "CUSTOMER COPY"
        : copyType === "office"
        ? "OFFICE COPY"
        : "SHIPMENT COPY",
    generatedDate: new Date().toLocaleDateString(),
    generatedTime: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    generatedBy: "Authorized Billing System",

    customerInfo: {
      name: order.customerName,
      phone: order.customerPhone,
      email: order.customerEmail,
      address: `${order.shippingAddress.street}, ${order.shippingAddress.city} ${order.shippingAddress.postalCode}`,
    },

    shippingInfo: {
      recipientName: order.customerName,
      phone: order.customerPhone,
      address: `${order.shippingAddress.street}, ${order.shippingAddress.city}`,
      city: order.shippingAddress.city,
      postalCode: order.shippingAddress.postalCode,
      courierName: "Express Courier Network",
      trackingNumber: order.trackingNumber || order.orderNumber,
    },

    items: order.items.map((item) => ({
      id: item.productId,
      name: item.productName,
      sku: item.variantSummary || `SKU-${item.productId.slice(0, 6)}`,
      quantity: item.quantity,
      unitPrice: item.price,
      total: item.total,
    })),

    subtotal: order.subtotal,
    discountTotal: order.discount,
    taxTotal: order.tax,
    shippingCharge: order.shippingCharge,
    isGiftWrapped: order.isGiftWrapped,
    giftWrappingCharge: order.giftWrappingCharge,
    giftMessage: order.giftMessage,
    giftSenderName: order.giftSenderName,
    giftRecipientPhone: order.giftRecipientPhone,
    grandTotal: order.total,
    currencySymbol,
    paymentMethod: order.paymentMethod,
    paymentStatus: order.paymentStatus,

    notes,
    signaturesNeeded,
  };
}

export function buildAllOrderCopies(order: Order, currencySymbol: string = "৳"): PrintableDocumentData[] {
  return [
    buildOrderInvoiceData(order, currencySymbol, "customer"),
    buildOrderInvoiceData(order, currencySymbol, "office"),
    buildOrderInvoiceData(order, currencySymbol, "shipment"),
  ];
}

export function buildPackingSlipData(order: Order): PrintableDocumentData {
  return {
    documentType: "packing_slip",
    documentTitle: order.isGiftWrapped ? "WAREHOUSE PACKING SLIP (🎁 GIFT ORDER)" : "WAREHOUSE PACKING SLIP",
    documentNumber: `PS-${order.orderNumber.replace("ORD-", "")}`,
    referenceNumber: order.orderNumber,
    status: order.orderStatus,
    watermark: "DRAFT",
    generatedDate: new Date().toLocaleDateString(),
    generatedTime: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    generatedBy: "Warehouse Fulfillment Team",

    customerInfo: {
      name: order.customerName,
      phone: order.customerPhone,
      address: `${order.shippingAddress.street}, ${order.shippingAddress.city}`,
    },

    shippingInfo: {
      recipientName: order.giftRecipientPhone ? (order.giftSenderName ? `${order.customerName} (For: ${order.giftRecipientPhone})` : order.customerName) : order.customerName,
      phone: order.giftRecipientPhone || order.customerPhone,
      address: `${order.shippingAddress.street}, ${order.shippingAddress.city}`,
      courierName: "Pathao Courier / Steadfast",
      trackingNumber: order.trackingNumber || order.orderNumber,
    },

    items: order.items.map((item) => ({
      id: item.productId,
      name: item.productName,
      sku: item.variantSummary || `SKU-${item.productId.slice(0, 6)}`,
      quantity: item.quantity,
      unitPrice: item.price,
      total: item.total,
      notes: order.isGiftWrapped ? "🎁 Gift Wrap Item" : "Verify seal before dispatch",
    })),

    isGiftWrapped: order.isGiftWrapped,
    giftWrappingCharge: order.giftWrappingCharge,
    giftMessage: order.giftMessage,
    giftSenderName: order.giftSenderName,
    giftRecipientPhone: order.giftRecipientPhone,

    notes: order.isGiftWrapped
      ? `🎁 ATTENTION PACKERS: Wrap order in premium gift wrap with satin ribbon. Insert greeting card: "${order.giftMessage || "Warmest wishes!"}"`
      : "Pack carefully with bubble wrap. Attach shipping label on outer box.",
    signaturesNeeded: ["Prepared By", "Received By"],
  };
}

export function buildShippingLabelData(order: Order): PrintableDocumentData {
  return {
    documentType: "shipping_label",
    documentTitle: "COURIER DISPATCH LABEL",
    documentNumber: order.orderNumber,
    status: order.orderStatus,
    generatedDate: new Date().toLocaleDateString(),
    generatedTime: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    generatedBy: "Dispatch Station #1",

    customerInfo: {
      name: order.customerName,
      phone: order.customerPhone,
    },

    shippingInfo: {
      recipientName: order.customerName,
      phone: order.customerPhone,
      address: `${order.shippingAddress.street}, ${order.shippingAddress.city}`,
      city: order.shippingAddress.city,
      postalCode: order.shippingAddress.postalCode,
      courierName: "EXPRESS DELIVERY NETWORK",
      trackingNumber: order.trackingNumber || order.orderNumber,
    },

    items: order.items.map((item) => ({
      id: item.productId,
      name: item.productName,
      quantity: item.quantity,
      unitPrice: item.price,
      total: item.total,
    })),

    grandTotal: order.total,
    paymentStatus: order.paymentStatus,
  };
}

export function buildBarcodeLabelsData(products: Product[]): PrintableDocumentData {
  return {
    documentType: "barcode_labels",
    documentTitle: "PRODUCT BARCODE & PRICE STICKERS",
    documentNumber: `LBL-${Date.now().toString().slice(-6)}`,
    status: "APPROVED",
    generatedDate: new Date().toLocaleDateString(),
    generatedTime: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    generatedBy: "Inventory Manager",

    items: products.map((p) => ({
      id: p.id,
      name: p.name,
      sku: p.sku,
      barcode: p.barcode || p.sku,
      quantity: (p as any).stock || (p as any).stockQuantity || 1,
      unitPrice: p.sellingPrice,
      total: p.sellingPrice,
    })),
  };
}

export function buildReportPrintData(
  title: string,
  headers: string[],
  rawRows: (string | number)[][],
  docType: PrintableDocumentType = "system_report"
): PrintableDocumentData {
  return {
    documentType: docType,
    documentTitle: title.toUpperCase(),
    documentNumber: `REP-${Date.now().toString().slice(-6)}`,
    status: "APPROVED",
    generatedDate: new Date().toLocaleDateString(),
    generatedTime: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    generatedBy: "System Analytics Engine",

    headers,
    rawRows,

    notes: "Confidential Enterprise Management Report. For internal company use only.",
    signaturesNeeded: ["Prepared By", "Approved By"],
  };
}
