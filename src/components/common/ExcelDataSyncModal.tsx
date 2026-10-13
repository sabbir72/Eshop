import React, { useState, useEffect, useRef } from "react";
import { useStore } from "../../context/StoreContext";
import {
  exportToExcel,
  exportToCSV,
  exportToMultiSheetExcel,
  downloadSampleBulkUploadTemplate,
  downloadOrdersTemplate,
  downloadCustomerLeadsTemplate,
  parseExcelOrCSVFile,
  parseSafeNumber,
} from "../../utils/exportUtils";
import { Product } from "../../types";
import {
  FileSpreadsheet,
  Download,
  Upload,
  CheckCircle2,
  AlertTriangle,
  X,
  FileText,
  Smartphone,
  RefreshCw,
  ShoppingBag,
  Truck,
  Users,
  Layers,
  Tag,
  ShoppingCart,
  Database,
  ArrowRight,
  Eye,
  Check,
} from "lucide-react";

interface ExcelDataSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExcelDataSyncModal: React.FC<ExcelDataSyncModalProps> = ({ isOpen, onClose }) => {
  const { products, orders, coupons, categories, brands, bulkAddProducts, addToast } = useStore();

  const [activeTab, setActiveTab] = useState<"template_upload" | "export_all" | "android_sync">(
    "template_upload"
  );

  // File upload state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [parsing, setParsing] = useState(false);
  const [parsedRows, setParsedRows] = useState<any[]>([]);
  const [validRows, setValidRows] = useState<any[]>([]);
  const [errorRows, setErrorRows] = useState<{ row: number; error: string; raw: any }[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Process uploaded Excel / CSV file
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setParsing(true);
    setParsedRows([]);
    setValidRows([]);
    setErrorRows([]);

    try {
      const rows = await parseExcelOrCSVFile(file);
      setParsedRows(rows);

      // Validate rows against product requirements
      const valids: any[] = [];
      const errors: { row: number; error: string; raw: any }[] = [];

      rows.forEach((row, idx) => {
        const rowNum = idx + 2; // header is row 1
        const name = (row["Product Name"] || row["Name"] || row["name"] || "").trim();
        const sku = (row["SKU"] || row["sku"] || "").trim();
        const price = parseSafeNumber(row["Price"] || row["price"] || row["Selling Price"]);

        if (!name) {
          errors.push({ row: rowNum, error: "পণ্যের নাম (Product Name) অনুপস্থিত", raw: row });
        } else if (!sku) {
          errors.push({ row: rowNum, error: "এসকেইউ কোড (SKU) অনুপস্থিত", raw: row });
        } else if (price <= 0) {
          errors.push({ row: rowNum, error: "সঠিক বিক্রয় মূল্য (Price) পাওয়া যায়নি", raw: row });
        } else {
          valids.push(row);
        }
      });

      setValidRows(valids);
      setErrorRows(errors);
      addToast(
        `এক্সেল ফাইল থেকে ${rows.length}টি রো প্রসেস হয়েছে (${valids.length}টি ভ্যালিড)`,
        valids.length > 0 ? "success" : "warning"
      );
    } catch (err: any) {
      addToast(`এক্সেল ফাইল রিড করতে ব্যর্থ: ${err.message}`, "error");
    } finally {
      setParsing(false);
    }
  };

  // Confirm Import into dynamic store database
  const handleConfirmImport = () => {
    if (validRows.length === 0) return;

    const defaultCat = categories[0] || { id: "cat-1", name: "Electronics" };
    const defaultBrand = brands[0] || { id: "brand-1", name: "Generic" };

    const newProducts: Product[] = validRows.map((row, idx) => {
      const name = row["Product Name"] || row["Name"] || "Imported Product";
      const sku = (row["SKU"] || row["sku"] || `SKU-XL-${Date.now()}-${idx}`).trim();
      const barcode = String(
        row["Barcode"] || `880${Math.floor(100000000 + Math.random() * 900000000)}`
      );
      const catName = row["Category"] || row["category"] || defaultCat.name;
      const brandName = row["Brand"] || row["brand"] || defaultBrand.name;
      const price = parseSafeNumber(row["Price"] || row["price"]) || 1000;
      const discount = parseSafeNumber(row["DiscountPrice"] || row["Discount Price"]) || price;
      const stock = Math.floor(parseSafeNumber(row["Stock"] || row["stock"])) || 20;
      const size = row["Size"] || row["size"] || "";
      const color = row["Color"] || row["color"] || "";
      const desc = row["Description"] || row["description"] || "Premium quality product";
      const img =
        row["Images URL"] ||
        row["Image"] ||
        "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=600&q=80";

      return {
        id: `prod-xl-${Date.now()}-${idx}`,
        name,
        sku,
        barcode,
        categoryId: defaultCat.id,
        categoryName: catName,
        brandId: defaultBrand.id,
        brandName: brandName,
        vendor: row["Vendor"] || "Direct Supplier",
        shortDescription: desc.slice(0, 100),
        description: desc,
        specifications: {
          Brand: brandName,
          Warranty: "1 Year Official Warranty",
        },
        warranty: "1 Year Warranty",
        tags: ["Excel Imported"],
        costPrice: Math.round(price * 0.75),
        purchasePrice: Math.round(price * 0.8),
        sellingPrice: price,
        discountPrice: discount,
        taxPercent: 5,
        vatPercent: 7.5,
        mainImage: img,
        galleryImages: [img],
        videoUrl: "",
        colors: color ? [color] : ["Black"],
        sizes: size ? [size] : ["Standard"],
        weight: "500g",
        variants: [],
        totalStock: stock,
        isLowStock: stock < 5,
        status: row["Status"] === "Draft" ? "Draft" : "Active",
      };
    });

    bulkAddProducts(newProducts);
    addToast(`${newProducts.length}টি নতুন পণ্য স্টোরে সফলভাবে যোগ করা হয়েছে!`, "success");

    // Reset upload form
    setSelectedFile(null);
    setParsedRows([]);
    setValidRows([]);
    setErrorRows([]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // -------------------------------------------------------------------------
  // EXPORT HANDLERS FOR ALL STORE MODULES
  // -------------------------------------------------------------------------
  const exportProducts = (format: "excel" | "csv") => {
    const data = products.map((p) => ({
      "Product ID": p.id,
      "Product Name": p.name,
      SKU: p.sku,
      Barcode: p.barcode,
      Category: p.categoryName,
      Brand: p.brandName,
      Vendor: p.vendor,
      "Price (BDT)": p.sellingPrice,
      "Discount Price": p.discountPrice,
      "Total Stock": p.totalStock,
      Status: p.status,
      "Created Date": p.id,
    }));
    if (format === "excel") {
      exportToExcel(`SmartShop_Products_${new Date().toISOString().slice(0, 10)}.xlsx`, "Products", data);
    } else {
      exportToCSV(`SmartShop_Products_${new Date().toISOString().slice(0, 10)}.csv`, data);
    }
    addToast(`${data.length}টি পণ্যের ডাটা সফলভাবে এক্সপোর্ট হয়েছে!`, "success");
  };

  const exportOrders = (format: "excel" | "csv") => {
    const data = orders.map((o) => {
      let city = "Dhaka";
      if (typeof o.shippingAddress === "object" && o.shippingAddress) {
        city = `${o.shippingAddress.city || "Dhaka"} - ${o.shippingAddress.street || ""}`;
      } else if (typeof o.shippingAddress === "string") {
        city = o.shippingAddress;
      }
      return {
        "Order ID": o.id,
        "Customer Name": o.customerName || "Customer",
        "Customer Phone": o.customerPhone || "N/A",
        "Shipping Address": city,
        "Total Amount (BDT)": o.total,
        "Payment Method": o.paymentMethod || "bKash / COD",
        "Order Status": o.orderStatus || o.status || "Processing",
        "Order Items": (o.items || []).map((i) => i.productName || i.name).join(", "),
        Date: o.createdAt || new Date().toISOString().slice(0, 10),
      };
    });
    if (format === "excel") {
      exportToExcel(`SmartShop_Orders_${new Date().toISOString().slice(0, 10)}.xlsx`, "Orders", data);
    } else {
      exportToCSV(`SmartShop_Orders_${new Date().toISOString().slice(0, 10)}.csv`, data);
    }
    addToast(`${data.length}টি অর্ডারের ডাটা সফলভাবে এক্সপোর্ট হয়েছে!`, "success");
  };

  const exportCustomers = (format: "excel" | "csv") => {
    const custMap = new Map<string, any>();
    orders.forEach((o, i) => {
      const key = (o.customerPhone || o.customerName || `c-${i}`).toLowerCase();
      if (!custMap.has(key)) {
        custMap.set(key, {
          "Customer Name": o.customerName || "গ্রাহক",
          Phone: o.customerPhone || "+880 1700-000000",
          Address: typeof o.shippingAddress === "object" ? o.shippingAddress?.city || "Dhaka" : String(o.shippingAddress || "Dhaka"),
          "Total Orders": 1,
          "Lifetime Value (BDT)": Number(o.total) || 0,
          "Last Payment": o.paymentMethod || "bKash",
          "Customer Tier": Number(o.total) >= 50000 ? "VIP Platinum" : Number(o.total) >= 15000 ? "VIP Gold" : "Regular Buyer",
        });
      } else {
        const ex = custMap.get(key);
        ex["Total Orders"] += 1;
        ex["Lifetime Value (BDT)"] += Number(o.total) || 0;
      }
    });

    const data = Array.from(custMap.values());
    if (format === "excel") {
      exportToExcel(`SmartShop_Customers_${new Date().toISOString().slice(0, 10)}.xlsx`, "Customers", data);
    } else {
      exportToCSV(`SmartShop_Customers_${new Date().toISOString().slice(0, 10)}.csv`, data);
    }
    addToast(`${data.length} জন গ্রাহকের ডাটা এক্সপোর্ট হয়েছে!`, "success");
  };

  const exportInventory = (format: "excel" | "csv") => {
    const data = products.map((p) => ({
      SKU: p.sku,
      "Product Name": p.name,
      Category: p.categoryName,
      "Current Stock": p.totalStock,
      "Unit Cost (BDT)": p.costPrice || Math.round(p.sellingPrice * 0.75),
      "Selling Price (BDT)": p.sellingPrice,
      "Stock Value (BDT)": p.totalStock * p.sellingPrice,
      "Inventory Alert": p.totalStock < 5 ? "LOW STOCK (পুনরায় অর্ডার করুন)" : "HEALTHY",
    }));
    if (format === "excel") {
      exportToExcel(`SmartShop_Inventory_${new Date().toISOString().slice(0, 10)}.xlsx`, "Inventory", data);
    } else {
      exportToCSV(`SmartShop_Inventory_${new Date().toISOString().slice(0, 10)}.csv`, data);
    }
    addToast(`ইনভেন্টরি রিপোর্ট সফলভাবে এক্সপোর্ট হয়েছে!`, "success");
  };

  const exportCoupons = (format: "excel" | "csv") => {
    const data = coupons.map((c) => ({
      "Coupon Code": c.code,
      "Discount Type": c.discountType,
      "Discount Value": c.discountValue,
      "Min Purchase Amount": c.minPurchaseAmount || 500,
      "Usage Limit": c.usageLimit || 100,
      "Used Count": c.usedCount || 0,
      Status: c.status,
      "Valid Until": c.endDate || "N/A",
    }));
    if (format === "excel") {
      exportToExcel(`SmartShop_Coupons_${new Date().toISOString().slice(0, 10)}.xlsx`, "Coupons", data);
    } else {
      exportToCSV(`SmartShop_Coupons_${new Date().toISOString().slice(0, 10)}.csv`, data);
    }
    addToast(`কুপন ডাটা এক্সপোর্ট হয়েছে!`, "success");
  };

  // Full Master Multi-Sheet Backup (.xlsx)
  const exportFullMasterBackup = () => {
    const prodData = products.map((p) => ({
      ID: p.id,
      Name: p.name,
      SKU: p.sku,
      Category: p.categoryName,
      Price: p.sellingPrice,
      DiscountPrice: p.discountPrice,
      Stock: p.totalStock,
      Status: p.status,
    }));

    const ordData = orders.map((o) => ({
      OrderID: o.id,
      Customer: o.customerName,
      Phone: o.customerPhone,
      Total: o.total,
      Status: o.orderStatus || o.status,
      Payment: o.paymentMethod,
    }));

    const invData = products.map((p) => ({
      SKU: p.sku,
      Product: p.name,
      Stock: p.totalStock,
      Value: p.totalStock * p.sellingPrice,
    }));

    const coupData = coupons.map((c) => ({
      Code: c.code,
      Type: c.discountType,
      Value: c.discountValue,
      Status: c.status,
    }));

    exportToMultiSheetExcel(`SmartShop_Full_Master_Backup_${new Date().toISOString().slice(0, 10)}.xlsx`, [
      { sheetName: "All_Products", rows: prodData },
      { sheetName: "All_Orders", rows: ordData },
      { sheetName: "Inventory_Report", rows: invData },
      { sheetName: "Coupons", rows: coupData },
    ]);

    addToast("সম্পূর্ণ স্টোরের অল-ইন-ওয়ান মাল্টি-শীট এক্সেল ব্যাকআপ সফলভাবে ডাউনলোড হয়েছে!", "success");
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200 cursor-pointer overflow-y-auto"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-slate-900 border border-emerald-500/30 rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden text-white relative cursor-default my-auto"
      >
        {/* Top ambient aura */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-32 bg-emerald-500/15 blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="p-6 pb-4 border-b border-slate-800 relative z-10 flex items-start justify-between gap-4">
          <div className="flex items-start gap-3.5 flex-1 min-w-0">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-indigo-600 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-emerald-500/20 shrink-0">
              <FileSpreadsheet className="w-6 h-6" />
            </div>

            <div className="space-y-0.5 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2 py-0.5 text-[10px] font-black uppercase tracking-wider rounded-md bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Universal Excel & Data Hub
                </span>
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Web & Android v2.5.0
                </span>
              </div>
              <h2 className="text-lg font-black text-white truncate">
                স্মার্টশপ এক্সেল ডাটা সিস্টেম (Excel Export & Template Upload)
              </h2>
              <p className="text-xs text-slate-400">
                ওয়েব ও মোবাইল উভয়ের জন্য সম্পূর্ণ ডাইনামিক এক্সেল (.xlsx) ইনপুট, টেমপ্লেট ও এক্সপোর্ট সমাধান
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onClose();
            }}
            aria-label="Close modal"
            className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 active:bg-white/30 text-slate-300 hover:text-white transition shrink-0 cursor-pointer shadow-md z-30"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center border-b border-slate-800 text-xs font-bold px-6 bg-slate-950/40 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab("template_upload")}
            className={`py-3 px-3.5 border-b-2 shrink-0 transition flex items-center gap-2 ${
              activeTab === "template_upload"
                ? "border-emerald-500 text-emerald-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>টেমপ্লেট ডাউনলোড ও আপলোড (Input Template)</span>
          </button>

          <button
            onClick={() => setActiveTab("export_all")}
            className={`py-3 px-3.5 border-b-2 shrink-0 transition flex items-center gap-2 ${
              activeTab === "export_all"
                ? "border-emerald-500 text-emerald-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Download className="w-4 h-4" />
            <span>সকল ডাটা এক্সপোর্ট (Export All Data)</span>
          </button>

          <button
            onClick={() => setActiveTab("android_sync")}
            className={`py-3 px-3.5 border-b-2 shrink-0 transition flex items-center gap-2 ${
              activeTab === "android_sync"
                ? "border-emerald-500 text-emerald-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Smartphone className="w-4 h-4 text-emerald-400" />
            <span>অ্যান্ড্রয়েড অফলাইন সিঙ্ক (Android Backup)</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* ======================================================== */}
          {/* TAB 1: TEMPLATE DOWNLOAD & BULK UPLOAD                   */}
          {/* ======================================================== */}
          {activeTab === "template_upload" && (
            <div className="space-y-6">
              {/* 3-Step Visual Workflow Guide */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="p-3.5 bg-slate-950/70 border border-emerald-500/30 rounded-2xl flex items-start gap-3">
                  <span className="w-7 h-7 rounded-xl bg-emerald-500/20 text-emerald-400 font-black text-xs flex items-center justify-center shrink-0">
                    ১
                  </span>
                  <div>
                    <h4 className="text-xs font-black text-white">টেমপ্লেট ডাউনলোড করুন</h4>
                    <p className="text-[11px] text-slate-300 mt-0.5">
                      নিচের পছন্দসই এক্সেল (.xlsx) টেমপ্লেট বাটনে ক্লিক করে ফাইলটি ডাউনলোড করুন।
                    </p>
                  </div>
                </div>

                <div className="p-3.5 bg-slate-950/70 border border-indigo-500/30 rounded-2xl flex items-start gap-3">
                  <span className="w-7 h-7 rounded-xl bg-indigo-500/20 text-indigo-400 font-black text-xs flex items-center justify-center shrink-0">
                    ২
                  </span>
                  <div>
                    <h4 className="text-xs font-black text-white">এক্সেলে ডাটা পূরণ করুন</h4>
                    <p className="text-[11px] text-slate-300 mt-0.5">
                      এক্সেল ফাইলে আপনার পণ্যের নাম, দাম, SKU, স্টক ইত্যাদি কলামে লিখে সেভ করুন।
                    </p>
                  </div>
                </div>

                <div className="p-3.5 bg-slate-950/70 border border-teal-500/30 rounded-2xl flex items-start gap-3">
                  <span className="w-7 h-7 rounded-xl bg-teal-500/20 text-teal-400 font-black text-xs flex items-center justify-center shrink-0">
                    ৩
                  </span>
                  <div>
                    <h4 className="text-xs font-black text-white">ফাইল আপলোড করে ইমপোর্ট</h4>
                    <p className="text-[11px] text-slate-300 mt-0.5">
                      পূরণ করা এক্সেল ফাইলটি আপলোড করলেই তাৎক্ষণিকভাবে স্টোরে যুক্ত হয়ে যাবে।
                    </p>
                  </div>
                </div>
              </div>

              {/* Template Download Grid (Multiple Formats) */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center gap-2">
                    <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                    <span>উপলব্ধ এক্সেল ইনপুট টেমপ্লেট ফরম্যাটসমূহ (Download Input Templates)</span>
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {/* Template 1: Products */}
                  <div className="p-4 bg-slate-950/80 border border-emerald-500/30 rounded-2xl space-y-3 flex flex-col justify-between">
                    <div className="space-y-1">
                      <span className="px-2 py-0.5 text-[9px] font-black uppercase rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        Products Catalog
                      </span>
                      <h4 className="text-xs font-black text-white">পণ্য বাল্ক আপলোড টেমপ্লেট</h4>
                      <p className="text-[11px] text-slate-400 leading-tight">
                        Product Name, SKU, Barcode, Category, Price, DiscountPrice, Stock, Description কলামসহ।
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <button
                        onClick={() => downloadSampleBulkUploadTemplate("excel")}
                        className="py-2 px-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-[11px] rounded-xl flex items-center justify-center gap-1 transition shadow-xs cursor-pointer"
                        title="Download Products Excel Template"
                      >
                        <FileSpreadsheet className="w-3.5 h-3.5" /> .xlsx টেমপ্লেট
                      </button>
                      <button
                        onClick={() => downloadSampleBulkUploadTemplate("csv")}
                        className="py-2 px-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-[11px] rounded-xl flex items-center justify-center gap-1 transition border border-slate-700 cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" /> CSV
                      </button>
                    </div>
                  </div>

                  {/* Template 2: Orders */}
                  <div className="p-4 bg-slate-950/80 border border-indigo-500/30 rounded-2xl space-y-3 flex flex-col justify-between">
                    <div className="space-y-1">
                      <span className="px-2 py-0.5 text-[9px] font-black uppercase rounded bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                        Orders & Courier
                      </span>
                      <h4 className="text-xs font-black text-white">অর্ডার ও ডেলিভারি টেমপ্লেট</h4>
                      <p className="text-[11px] text-slate-400 leading-tight">
                        Order ID, Customer Name, Phone, Address, City, Amount, Payment Method ফরম্যাট।
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <button
                        onClick={() => downloadOrdersTemplate("excel")}
                        className="py-2 px-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-[11px] rounded-xl flex items-center justify-center gap-1 transition shadow-xs cursor-pointer"
                        title="Download Orders Excel Template"
                      >
                        <FileSpreadsheet className="w-3.5 h-3.5" /> .xlsx টেমপ্লেট
                      </button>
                      <button
                        onClick={() => downloadOrdersTemplate("csv")}
                        className="py-2 px-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-[11px] rounded-xl flex items-center justify-center gap-1 transition border border-slate-700 cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" /> CSV
                      </button>
                    </div>
                  </div>

                  {/* Template 3: Customer Leads */}
                  <div className="p-4 bg-slate-950/80 border border-teal-500/30 rounded-2xl space-y-3 flex flex-col justify-between">
                    <div className="space-y-1">
                      <span className="px-2 py-0.5 text-[9px] font-black uppercase rounded bg-teal-500/20 text-teal-400 border border-teal-500/30">
                        Leads & Prospects
                      </span>
                      <h4 className="text-xs font-black text-white">কাস্টমার লিড ও CRM টেমপ্লেট</h4>
                      <p className="text-[11px] text-slate-400 leading-tight">
                        Customer Name, Phone, City, Interested Product, Budget, Lead Status ফরম্যাট।
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <button
                        onClick={() => downloadCustomerLeadsTemplate("excel")}
                        className="py-2 px-2.5 bg-teal-600 hover:bg-teal-500 text-white font-black text-[11px] rounded-xl flex items-center justify-center gap-1 transition shadow-xs cursor-pointer"
                        title="Download Leads Excel Template"
                      >
                        <FileSpreadsheet className="w-3.5 h-3.5" /> .xlsx টেমপ্লেট
                      </button>
                      <button
                        onClick={() => downloadCustomerLeadsTemplate("csv")}
                        className="py-2 px-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-[11px] rounded-xl flex items-center justify-center gap-1 transition border border-slate-700 cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" /> CSV
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Upload Box */}
              <div className="border-2 border-dashed border-emerald-500/40 hover:border-emerald-400 bg-slate-950/50 rounded-2xl p-6 sm:p-8 text-center transition-colors">
                <Upload className="w-10 h-10 text-emerald-400 mx-auto mb-2 animate-bounce" />
                <h4 className="font-bold text-white text-sm mb-1">
                  পূরণ করা এক্সেল (.xlsx) বা CSV ফাইল এখানে দিন
                </h4>
                <p className="text-xs text-slate-400 max-w-md mx-auto mb-4">
                  অ্যান্ড্রয়েড ফোন বা কম্পিউটার থেকে এক্সেল ফাইল ড্রপ করুন অথবা নির্বাচন করুন (সমর্থিত: .xlsx, .xls, .csv)
                </p>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx, .xls, .csv"
                  onChange={handleFileChange}
                  className="hidden"
                  id="excel-file-input"
                />

                <label
                  htmlFor="excel-file-input"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition cursor-pointer"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>ফাইল নির্বাচন করুন (Choose File)</span>
                </label>

                {selectedFile && (
                  <p className="text-xs text-emerald-400 font-mono mt-3">
                    📄 নির্বাচিত ফাইল: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
                  </p>
                )}
              </div>

              {/* Parsing status */}
              {parsing && (
                <div className="p-4 bg-slate-800/80 rounded-xl border border-slate-700 flex items-center justify-center gap-3 text-xs text-slate-300">
                  <RefreshCw className="w-4 h-4 animate-spin text-emerald-400" />
                  <span>এক্সেল ফাইলের ডাটা ও ফিল্ড ভ্যালিডেশন করা হচ্ছে...</span>
                </div>
              )}

              {/* Preview and Validation Result */}
              {parsedRows.length > 0 && !parsing && (
                <div className="space-y-4 bg-slate-950/70 p-5 rounded-2xl border border-slate-800">
                  <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-300">ভ্যালিডেশন ফলাফল:</span>
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        ✓ {validRows.length}টি সঠিক রো
                      </span>
                      {errorRows.length > 0 && (
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-rose-500/20 text-rose-400 border border-rose-500/30">
                          ✕ {errorRows.length}টি ত্রুটিযুক্ত
                        </span>
                      )}
                    </div>

                    <button
                      onClick={handleConfirmImport}
                      disabled={validRows.length === 0}
                      className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 transition disabled:opacity-40 cursor-pointer"
                    >
                      <Check className="w-4 h-4 text-slate-950" />
                      <span>{validRows.length}টি পণ্য স্টোরে ইমপোর্ট নিশ্চিত করুন</span>
                    </button>
                  </div>

                  {/* Errors if any */}
                  {errorRows.length > 0 && (
                    <div className="p-3 bg-rose-950/40 border border-rose-500/30 rounded-xl space-y-1 text-xs text-rose-300">
                      <div className="font-bold flex items-center gap-1 text-rose-400">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>নিম্নলিখিত রো-গুলোতে তথ্য ঘাটতি আছে (এগুলো বাদ যাবে):</span>
                      </div>
                      <div className="max-h-24 overflow-y-auto space-y-0.5 text-[11px] font-mono text-rose-200">
                        {errorRows.slice(0, 5).map((err, i) => (
                          <div key={i}>
                            রো #{err.row}: {err.error}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Preview Table */}
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-black uppercase text-slate-400 tracking-wider">
                      ইমপোর্ট হতে যাওয়া পণ্যের প্রিভিউ ({validRows.length}টি)
                    </span>
                    <div className="overflow-x-auto max-h-56 overflow-y-auto border border-slate-800 rounded-xl">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-900 text-slate-400 text-[10px] uppercase font-bold sticky top-0 border-b border-slate-800">
                          <tr>
                            <th className="py-2 px-3">Product Name</th>
                            <th className="py-2 px-3">SKU</th>
                            <th className="py-2 px-3">Category</th>
                            <th className="py-2 px-3">Price (৳)</th>
                            <th className="py-2 px-3">Stock</th>
                            <th className="py-2 px-3">Brand</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60 text-slate-200">
                          {validRows.slice(0, 10).map((r, idx) => (
                            <tr key={idx} className="hover:bg-slate-800/40 transition">
                              <td className="py-2 px-3 font-semibold text-white">
                                {r["Product Name"] || r["Name"]}
                              </td>
                              <td className="py-2 px-3 font-mono text-indigo-400 text-[11px]">
                                {r["SKU"] || r["sku"]}
                              </td>
                              <td className="py-2 px-3">{r["Category"] || "General"}</td>
                              <td className="py-2 px-3 font-bold text-emerald-400">
                                ৳{parseSafeNumber(r["Price"] || r["price"]).toLocaleString()}
                              </td>
                              <td className="py-2 px-3">{r["Stock"] || r["stock"] || 20}</td>
                              <td className="py-2 px-3">{r["Brand"] || "Generic"}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 2: EXPORT ALL STORE DATA IN EXCEL                    */}
          {/* ======================================================== */}
          {activeTab === "export_all" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div>
                  <h3 className="text-sm font-black text-white">
                    সকল স্টোর মডিউলের এক্সেল ও CSV এক্সপোর্ট
                  </h3>
                  <p className="text-xs text-slate-400">
                    একটি ক্লিকেই আপনার পণ্যের ডাটা, অর্ডার ও গ্রাহকদের পূর্ণাঙ্গ এক্সেল ফাইল ডাউনলোড করুন
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {/* 1. Products */}
                <div className="p-4 bg-slate-950/60 border border-slate-800 hover:border-emerald-500/40 rounded-2xl space-y-3 transition">
                  <div className="flex items-center justify-between">
                    <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                      <ShoppingBag className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-black text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                      {products.length}টি পণ্য
                    </span>
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-xs">পণ্য তালিকা ক্যাটালগ (Products)</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      নাম, SKU, বারকোড, বিক্রয়মূল্য, ছাড় ও স্টক সংখ্যা
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      onClick={() => exportProducts("excel")}
                      className="py-1.5 px-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs flex items-center justify-center gap-1 transition"
                    >
                      <FileSpreadsheet className="w-3.5 h-3.5" /> .xlsx
                    </button>
                    <button
                      onClick={() => exportProducts("csv")}
                      className="py-1.5 px-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-bold text-xs flex items-center justify-center gap-1 transition border border-slate-700"
                    >
                      <Download className="w-3.5 h-3.5" /> .csv
                    </button>
                  </div>
                </div>

                {/* 2. Orders */}
                <div className="p-4 bg-slate-950/60 border border-slate-800 hover:border-indigo-500/40 rounded-2xl space-y-3 transition">
                  <div className="flex items-center justify-between">
                    <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                      <Truck className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-black text-indigo-400 bg-indigo-500/10 px-2.5 py-0.5 rounded-full border border-indigo-500/20">
                      {orders.length}টি অর্ডার
                    </span>
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-xs">অর্ডার ও ডেলিভারি ডাটা (Orders)</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      অর্ডার নম্বর, গ্রাহকের নাম, ফোন, ঠিকানা, মূল্য ও পেমেন্ট
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      onClick={() => exportOrders("excel")}
                      className="py-1.5 px-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold text-xs flex items-center justify-center gap-1 transition"
                    >
                      <FileSpreadsheet className="w-3.5 h-3.5" /> .xlsx
                    </button>
                    <button
                      onClick={() => exportOrders("csv")}
                      className="py-1.5 px-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-bold text-xs flex items-center justify-center gap-1 transition border border-slate-700"
                    >
                      <Download className="w-3.5 h-3.5" /> .csv
                    </button>
                  </div>
                </div>

                {/* 3. Customers */}
                <div className="p-4 bg-slate-950/60 border border-slate-800 hover:border-cyan-500/40 rounded-2xl space-y-3 transition">
                  <div className="flex items-center justify-between">
                    <div className="w-9 h-9 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                      <Users className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-black text-cyan-400 bg-cyan-500/10 px-2.5 py-0.5 rounded-full border border-cyan-500/20">
                      লাইভ বায়ার্স
                    </span>
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-xs">গ্রাহক ও VIP টায়ার (Customers)</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      গ্রাহকের ফোন, মোট অর্ডার, লাইফটাইম ভ্যালু ও VIP স্ট্যাটাস
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      onClick={() => exportCustomers("excel")}
                      className="py-1.5 px-2.5 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg font-bold text-xs flex items-center justify-center gap-1 transition"
                    >
                      <FileSpreadsheet className="w-3.5 h-3.5" /> .xlsx
                    </button>
                    <button
                      onClick={() => exportCustomers("csv")}
                      className="py-1.5 px-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-bold text-xs flex items-center justify-center gap-1 transition border border-slate-700"
                    >
                      <Download className="w-3.5 h-3.5" /> .csv
                    </button>
                  </div>
                </div>

                {/* 4. Inventory */}
                <div className="p-4 bg-slate-950/60 border border-slate-800 hover:border-amber-500/40 rounded-2xl space-y-3 transition">
                  <div className="flex items-center justify-between">
                    <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                      <Layers className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-black text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
                      ইনভেন্টরি
                    </span>
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-xs">স্টক লেভেল অডিট (Inventory)</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      স্টক সংখ্যা, মোট ভ্যালু ও লো-স্টক সতর্কতা রিস্টক তালিকা
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      onClick={() => exportInventory("excel")}
                      className="py-1.5 px-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold text-xs flex items-center justify-center gap-1 transition"
                    >
                      <FileSpreadsheet className="w-3.5 h-3.5" /> .xlsx
                    </button>
                    <button
                      onClick={() => exportInventory("csv")}
                      className="py-1.5 px-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-bold text-xs flex items-center justify-center gap-1 transition border border-slate-700"
                    >
                      <Download className="w-3.5 h-3.5" /> .csv
                    </button>
                  </div>
                </div>

                {/* 5. Coupons */}
                <div className="p-4 bg-slate-950/60 border border-slate-800 hover:border-purple-500/40 rounded-2xl space-y-3 transition">
                  <div className="flex items-center justify-between">
                    <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
                      <Tag className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-black text-purple-400 bg-purple-500/10 px-2.5 py-0.5 rounded-full border border-purple-500/20">
                      {coupons.length}টি কুপন
                    </span>
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-xs">কুপন ও ডিসকাউন্ট (Coupons)</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      কুপন কোড, ডিসকাউন্ট %, মেয়াদ ও ব্যবহারের পরিসংখ্যান
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      onClick={() => exportCoupons("excel")}
                      className="py-1.5 px-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-bold text-xs flex items-center justify-center gap-1 transition"
                    >
                      <FileSpreadsheet className="w-3.5 h-3.5" /> .xlsx
                    </button>
                    <button
                      onClick={() => exportCoupons("csv")}
                      className="py-1.5 px-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-bold text-xs flex items-center justify-center gap-1 transition border border-slate-700"
                    >
                      <Download className="w-3.5 h-3.5" /> .csv
                    </button>
                  </div>
                </div>

                {/* 6. All-In-One Master */}
                <div className="p-4 bg-gradient-to-tr from-slate-950 to-indigo-950/70 border border-indigo-500/50 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-9 h-9 rounded-xl bg-emerald-500 text-slate-950 flex items-center justify-center font-black">
                      <Database className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-black uppercase text-emerald-400">Master Backup</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-xs">অল-ইন-ওয়ান মাল্টি-শীট এক্সেল</h4>
                    <p className="text-[11px] text-slate-300 mt-0.5">
                      সবগুলো মডিউলের ডাটা একটিমাত্র পূর্ণাঙ্গ এক্সেল ফাইলে
                    </p>
                  </div>
                  <button
                    onClick={exportFullMasterBackup}
                    className="w-full py-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-slate-950 font-black text-xs rounded-xl shadow-md transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <FileSpreadsheet className="w-4 h-4" />
                    <span>মাস্টার এক্সেল ব্যাকআপ (.xlsx)</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 3: ANDROID MOBILE OFFLINE SYNC                       */}
          {/* ======================================================== */}
          {activeTab === "android_sync" && (
            <div className="space-y-5">
              <div className="p-5 bg-gradient-to-r from-emerald-950/50 via-slate-900 to-indigo-950/50 rounded-2xl border border-emerald-500/40 space-y-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500 text-slate-950 flex items-center justify-center font-bold">
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="px-2 py-0.5 text-[10px] font-black uppercase bg-emerald-500/20 text-emerald-400 rounded-md border border-emerald-500/30">
                      Android v2.5.0 Mobile Sync
                    </span>
                    <h3 className="text-sm font-black text-white mt-0.5">
                      অ্যান্ড্রয়েড ফোনের সাথে এক্সেল অফলাইন সিঙ্ক্রোনাইজেশন
                    </h3>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  আপনার অ্যান্ড্রয়েড ফোনে ইন্টারনেট সংযোগ না থাকলেও স্টোরের সমস্ত ডাটা নিরাপদে এক্সেল ফরম্যাটে ব্যাকআপ নিয়ে রাখা যায়। পরবর্তীতে গুগল ড্রাইভ বা ফোন স্টোরেজ থেকে যেকোনো সময় রিস্টোর বা আপডেট করতে পারবেন।
                </p>

                <div className="pt-2 flex flex-wrap gap-2.5">
                  <button
                    onClick={exportFullMasterBackup}
                    className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-xs rounded-xl flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>ফোনে সম্পূর্ণ স্টোর এক্সেল ব্যাকআপ সেভ করুন (.xlsx)</span>
                  </button>
                </div>
              </div>

              {/* 3 Step Android Workflow Guide */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl space-y-1.5">
                  <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 font-black flex items-center justify-center text-xs">
                    ১
                  </span>
                  <h4 className="font-bold text-white">টেমপ্লেট ডাউনলোড</h4>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    অ্যান্ড্রয়েড ফোনের Chrome ব্রাউজারে 'এক্সেল টেমপ্লেট' বাটনে চাপ দিন। ফাইলটি সরাসরি আপনার ফোন স্টোরেজে সেভ হবে।
                  </p>
                </div>

                <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl space-y-1.5">
                  <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 font-black flex items-center justify-center text-xs">
                    ২
                  </span>
                  <h4 className="font-bold text-white">ফোনে ডাটা এন্ট্রি</h4>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    অ্যান্ড্রয়েডে থাকা Google Sheets বা Microsoft Excel অ্যাপ দিয়ে পণ্যের বিবরণ ও দাম লিখে ফাইলটি সেভ করুন।
                  </p>
                </div>

                <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl space-y-1.5">
                  <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 font-black flex items-center justify-center text-xs">
                    ৩
                  </span>
                  <h4 className="font-bold text-white">১-ট্যাপে আপলোড</h4>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    স্মার্টশপ অ্যাপে ফিরে এসে ফাইলটি আপলোড করলেই তাৎক্ষণিকভাবে সব প্রোডাক্ট স্টোরে যুক্ত হয়ে যাবে।
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 px-6 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-1.5 text-[11px]">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            UTF-8 এনকোডেড বাংলা ও ইংরেজি উভয় ভাষায় নির্ভুল এক্সেল আউটপুট
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
