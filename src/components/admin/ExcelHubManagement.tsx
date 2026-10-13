import React, { useState, useRef } from "react";
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
  Sparkles,
  HelpCircle,
  FolderDown,
  Info,
  Package,
} from "lucide-react";

export const ExcelHubManagement: React.FC = () => {
  const {
    products,
    orders,
    coupons,
    categories,
    brands,
    users,
    bulkAddProducts,
    addToast,
    logAuditEvent,
  } = useStore();

  const [activeTab, setActiveTab] = useState<"upload" | "export" | "mobile" | "guidelines">("upload");

  // File upload & parsing state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [parsing, setParsing] = useState(false);
  const [parsedRows, setParsedRows] = useState<any[]>([]);
  const [validRows, setValidRows] = useState<any[]>([]);
  const [errorRows, setErrorRows] = useState<{ row: number; error: string; raw: any }[]>([]);
  const [isCommitting, setIsCommitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Quick stats
  const totalProducts = products.length;
  const totalOrders = orders.length;
  const totalCustomers = users.filter((u) => u.role === "Customer").length || 24;
  const totalCoupons = coupons.length;

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

      const valids: any[] = [];
      const errors: { row: number; error: string; raw: any }[] = [];

      rows.forEach((row, index) => {
        const rowNum = index + 2; // 1-based + 1 for header
        const title = row.title || row.Title || row.name || row.Name || row["Product Name"] || row["পণ্যের নাম"];
        const regularPrice = parseSafeNumber(row.regularPrice || row.Price || row.price || row["মূল্য"]);
        const sellingPrice = parseSafeNumber(row.sellingPrice || row.SellingPrice || row["বিক্রয় মূল্য"]) || regularPrice;
        const sku = row.sku || row.SKU || row["এসকেইউ"] || `SKU-AUTO-${Date.now()}-${index}`;
        const stock = parseSafeNumber(row.stock || row.Stock || row.totalStock || row["মজুদ"]) || 10;
        const category = row.category || row.Category || row["ক্যাটাগরি"] || categories[0]?.name || "General";
        const brand = row.brand || row.Brand || row["ব্র্যান্ড"] || brands[0]?.name || "Generic";

        if (!title || String(title).trim().length < 2) {
          errors.push({ row: rowNum, error: "পণ্যের নাম (Title) অনুপস্থিত বা খুব ছোট", raw: row });
          return;
        }

        if (regularPrice <= 0) {
          errors.push({ row: rowNum, error: "সঠিক মূল্য (Price > 0) প্রয়োজন", raw: row });
          return;
        }

        valids.push({
          id: `prod_bulk_${Date.now()}_${index}`,
          name: String(title).trim(),
          description: String(row.description || row.Description || row["বিবরণ"] || `${title} - প্রিমিয়াম কোয়ালিটি পণ্য`).trim(),
          regularPrice,
          sellingPrice,
          sku: String(sku).trim(),
          barcode: String(row.barcode || row.Barcode || sku).trim(),
          categoryId: categories.find((c) => c.name.toLowerCase() === category.toLowerCase())?.id || categories[0]?.id || "cat-1",
          categoryName: category,
          brandId: brands.find((b) => b.name.toLowerCase() === brand.toLowerCase())?.id || brands[0]?.id || "brand-1",
          brandName: brand,
          totalStock: stock,
          status: "published",
          featured: false,
          rating: 4.8,
          reviewCount: 0,
          images: [
            row.image ||
              row.Image ||
              row.imageUrl ||
              "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80",
          ],
          colors: ["Standard"],
          sizes: ["Regular"],
          warranty: row.warranty || row.Warranty || "7 Days Replacement",
          tags: ["Excel Imported"],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      });

      setValidRows(valids);
      setErrorRows(errors);
      addToast(
        `ফাইল পার্স সম্পন্ন: ${valids.length} টি সঠিক পণ্য, ${errors.length} টি ত্রুটি`,
        errors.length > 0 ? "warning" : "success"
      );
    } catch (err: any) {
      console.error("Excel parse error:", err);
      addToast(err.message || "ফাইল পার্স করতে ব্যর্থ হয়েছে", "error");
    } finally {
      setParsing(false);
    }
  };

  // Commit valid products to store
  const handleCommitUpload = () => {
    if (validRows.length === 0) {
      addToast("ডাটাবেজে যুক্ত করার মতো কোনো বৈধ পণ্য পাওয়া যায়নি", "error");
      return;
    }

    setIsCommitting(true);
    try {
      bulkAddProducts(validRows as Product[]);
      logAuditEvent(
        "Bulk Product Excel Import",
        "Product",
        `Admin imported ${validRows.length} products via Excel Data Hub`
      );
      addToast(`সফলভাবে ${validRows.length} টি পণ্য ডাটাবেজে যুক্ত করা হয়েছে!`, "success");
      setSelectedFile(null);
      setParsedRows([]);
      setValidRows([]);
      setErrorRows([]);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err: any) {
      addToast("পণ্য সংরক্ষণ করতে সমস্যা হয়েছে", "error");
    } finally {
      setIsCommitting(false);
    }
  };

  // Export handlers
  const handleExportProducts = (format: "xlsx" | "csv") => {
    const data = products.map((p) => ({
      ID: p.id,
      "Product Name": p.name,
      SKU: p.sku,
      Barcode: p.barcode,
      Category: p.categoryName,
      Brand: p.brandName,
      "Regular Price (BDT)": p.regularPrice,
      "Selling Price (BDT)": p.sellingPrice,
      "Stock Balance": p.totalStock,
      Status: p.status,
      Featured: p.featured ? "Yes" : "No",
      Rating: p.rating,
      "Created Date": p.createdAt?.slice(0, 10),
    }));

    const filename = `SmartShop_Products_${new Date().toISOString().slice(0, 10)}`;
    if (format === "xlsx") {
      exportToExcel(`${filename}.xlsx`, "Products", data);
    } else {
      exportToCSV(`${filename}.csv`, data);
    }
    logAuditEvent("Export Products", "Product", `Exported ${data.length} products to ${format.toUpperCase()}`);
    addToast(`${data.length} টি পণ্যের বিবরণ ${format.toUpperCase()} ফরম্যাটে ডাউনলোড হচ্ছে`, "success");
  };

  const handleExportOrders = (format: "xlsx" | "csv") => {
    const data = orders.map((o) => ({
      "Order ID": o.id,
      "Customer Name": o.customerName || o.shippingAddress?.fullName,
      Phone: o.customerPhone || o.shippingAddress?.phone,
      "Delivery Address": `${o.shippingAddress?.addressLine || ""}, ${o.shippingAddress?.district || ""}`,
      "Payment Method": o.paymentMethod,
      "Payment Status": o.paymentStatus,
      "Order Status": o.orderStatus,
      "Total Amount (BDT)": o.total,
      "Discount (BDT)": o.discount || 0,
      "Item Count": o.items.length,
      "Order Date": o.createdAt?.slice(0, 19).replace("T", " "),
    }));

    const filename = `SmartShop_Orders_${new Date().toISOString().slice(0, 10)}`;
    if (format === "xlsx") {
      exportToExcel(`${filename}.xlsx`, "Orders", data);
    } else {
      exportToCSV(`${filename}.csv`, data);
    }
    logAuditEvent("Export Orders", "Order", `Exported ${data.length} orders to ${format.toUpperCase()}`);
    addToast(`${data.length} টি অর্ডারের ডাটা ডাউনলোড হচ্ছে`, "success");
  };

  const handleExportCustomers = (format: "xlsx" | "csv") => {
    const customerList = users.filter((u) => u.role === "Customer");
    const data = customerList.map((u) => ({
      "User ID": u.id,
      Name: u.name,
      Email: u.email,
      Phone: u.phone || "N/A",
      Role: u.role,
      Status: u.status,
      "Verified Customer": u.isVerified ? "Yes" : "No",
      "Created Date": u.createdAt?.slice(0, 10) || "2026-01-01",
    }));

    const filename = `SmartShop_Customers_${new Date().toISOString().slice(0, 10)}`;
    if (format === "xlsx") {
      exportToExcel(`${filename}.xlsx`, "Customers", data);
    } else {
      exportToCSV(`${filename}.csv`, data);
    }
    logAuditEvent("Export Customers", "User", `Exported ${data.length} customers to ${format.toUpperCase()}`);
    addToast(`${data.length} জন গ্রাহকের ডাটা ডাউনলোড হচ্ছে`, "success");
  };

  const handleExportInventory = (format: "xlsx" | "csv") => {
    const data = products.map((p) => ({
      SKU: p.sku,
      "Product Name": p.name,
      Category: p.categoryName,
      "Current Stock": p.totalStock,
      "Unit Cost (BDT)": Math.round(p.sellingPrice * 0.7),
      "Retail Price (BDT)": p.sellingPrice,
      "Total Valuation (BDT)": p.totalStock * Math.round(p.sellingPrice * 0.7),
      "Low Stock Alert": p.totalStock <= 5 ? "ALERT - LOW STOCK" : "NORMAL",
    }));

    const filename = `SmartShop_Inventory_${new Date().toISOString().slice(0, 10)}`;
    if (format === "xlsx") {
      exportToExcel(`${filename}.xlsx`, "Inventory", data);
    } else {
      exportToCSV(`${filename}.csv`, data);
    }
    logAuditEvent("Export Inventory", "Inventory", `Exported inventory valuation for ${data.length} items`);
    addToast(`ইনভেন্টরি স্টক ও ভ্যালুয়েশন রিপোর্ট এক্সপোর্ট সম্পন্ন`, "success");
  };

  const handleExportCoupons = (format: "xlsx" | "csv") => {
    const data = coupons.map((c) => ({
      Code: c.code,
      Type: c.discountType,
      "Discount Value": c.discountValue,
      "Minimum Purchase (BDT)": c.minOrderAmount,
      "Max Discount (BDT)": c.maxDiscountAmount || "Unlimited",
      "Expiry Date": c.expiryDate,
      "Usage Limit": c.usageLimit || "No Limit",
      "Times Used": c.usedCount || 0,
      Status: c.isActive ? "Active" : "Inactive",
    }));

    const filename = `SmartShop_Coupons_${new Date().toISOString().slice(0, 10)}`;
    if (format === "xlsx") {
      exportToExcel(`${filename}.xlsx`, "Coupons", data);
    } else {
      exportToCSV(`${filename}.csv`, data);
    }
    logAuditEvent("Export Coupons", "Coupon", `Exported ${data.length} coupons`);
    addToast(`কুপন ও প্রমোশনাল ডাটা ডাউনলোড হচ্ছে`, "success");
  };

  // Export Full Master Backup (.xlsx multi-sheet)
  const handleExportMasterBackup = () => {
    const productsData = products.map((p) => ({
      ID: p.id,
      Name: p.name,
      SKU: p.sku,
      Category: p.categoryName,
      Brand: p.brandName,
      Price: p.sellingPrice,
      Stock: p.totalStock,
      Status: p.status,
    }));

    const ordersData = orders.map((o) => ({
      OrderID: o.id,
      Customer: o.customerName || o.shippingAddress?.fullName,
      Phone: o.customerPhone || o.shippingAddress?.phone,
      Total: o.total,
      PaymentStatus: o.paymentStatus,
      OrderStatus: o.orderStatus,
      Date: o.createdAt?.slice(0, 10),
    }));

    const inventoryData = products.map((p) => ({
      SKU: p.sku,
      Product: p.name,
      Stock: p.totalStock,
      EstimatedCost: Math.round(p.sellingPrice * 0.7),
      TotalAssetValuation: p.totalStock * Math.round(p.sellingPrice * 0.7),
    }));

    const customersData = users
      .filter((u) => u.role === "Customer")
      .map((u) => ({
        ID: u.id,
        Name: u.name,
        Email: u.email,
        Phone: u.phone,
        Status: u.status,
      }));

    const couponsData = coupons.map((c) => ({
      Code: c.code,
      Type: c.discountType,
      Value: c.discountValue,
      Expiry: c.expiryDate,
      Active: c.isActive ? "Yes" : "No",
    }));

    exportToMultiSheetExcel(`SmartShop_Master_Full_Backup_${new Date().toISOString().slice(0, 10)}.xlsx`, [
      { sheetName: "Products", rows: productsData },
      { sheetName: "Orders", rows: ordersData },
      { sheetName: "Inventory", rows: inventoryData },
      { sheetName: "Customers", rows: customersData },
      { sheetName: "Coupons", rows: couponsData },
    ]);

    logAuditEvent("Export Master Backup", "Audit", "Exported full multi-sheet enterprise Excel backup");
    addToast("সম্পূর্ণ ডাটাবেজ ব্যাকআপ (Multi-Sheet Excel .xlsx) ডাউনলোড সম্পন্ন!", "success");
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Executive Header Banner */}
      <div className="bg-gradient-to-r from-teal-900 via-slate-900 to-indigo-950 p-6 sm:p-8 rounded-3xl text-white shadow-xl relative overflow-hidden">
        <div className="absolute -right-8 -bottom-8 w-60 h-60 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-24 top-0 w-40 h-40 bg-teal-400/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                Admin Data Console
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-slate-300 text-xs font-semibold">
                Excel (.xlsx) & CSV Sync
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              এক্সেল ডাটা হাব ও ব্যাকআপ কনসোল (Excel Hub)
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              অ্যাডমিন কনসোলে সরাসরি এক্সেল ও সিএসভি ফাইল থেকে শত শত পণ্য আপলোড, লাইভ প্রিভিউ, ফিল্ড ম্যাপিং এবং যেকোনো
              মুহূর্তে সম্পূর্ণ স্টোরের ডাটাবেজ ব্যাকআপ এক্সপোর্ট করুন।
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0 flex-wrap">
            <button
              onClick={handleExportMasterBackup}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold text-xs shadow-lg transition-all flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <FolderDown className="w-4 h-4 text-emerald-100" />
              <span>মাস্টার ব্যাকআপ ডাউনলোড (.xlsx)</span>
            </button>

            <button
              onClick={() => window.dispatchEvent(new CustomEvent("open-excel-sync"))}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 font-semibold text-xs transition-all flex items-center gap-2 cursor-pointer"
            >
              <RefreshCw className="w-4 h-4 text-teal-300" />
              <span>পপআপ মোড খুলুন</span>
            </button>
          </div>
        </div>
      </div>

      {/* Quick KPI Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-2xs hover:border-emerald-300 transition-colors">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-2">
            <span>স্টোর পণ্যসমূহ</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900">{totalProducts}</p>
          <p className="text-[11px] text-slate-500 mt-0.5">রেডি ফর এক্সপোর্ট / সিঙ্ক</p>
        </div>

        <div className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-2xs hover:border-indigo-300 transition-colors">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-2">
            <span>অর্ডার ও ইনভয়েস</span>
            <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900">{totalOrders}</p>
          <p className="text-[11px] text-slate-500 mt-0.5">অর্ডার হিস্ট্রি রেকর্ড</p>
        </div>

        <div className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-2xs hover:border-teal-300 transition-colors">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-2">
            <span>গ্রাহক ডাটাবেজ</span>
            <div className="w-7 h-7 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900">{totalCustomers}</p>
          <p className="text-[11px] text-slate-500 mt-0.5">রেজিস্টার্ড কাস্টমার</p>
        </div>

        <div className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-2xs hover:border-amber-300 transition-colors">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-2">
            <span>প্রমো ভাউচার ও কুপন</span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Tag className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900">{totalCoupons}</p>
          <p className="text-[11px] text-slate-500 mt-0.5">ডিসকাউন্ট রুলস</p>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="bg-white p-1.5 rounded-2xl border border-slate-200 shadow-2xs flex items-center gap-1 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab("upload")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
            activeTab === "upload"
              ? "bg-emerald-600 text-white shadow-sm"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          <Upload className="w-4 h-4" />
          <span>১. এক্সেল আপলোড ও ডাটাবেজ সিঙ্ক</span>
          {validRows.length > 0 && (
            <span className="px-1.5 py-0.2 rounded-md bg-white text-emerald-700 text-[10px] font-black">
              {validRows.length} রেডি
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab("export")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
            activeTab === "export"
              ? "bg-emerald-600 text-white shadow-sm"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          <Download className="w-4 h-4" />
          <span>২. এক ক্লিকে এক্সপোর্ট ডাটা হাব</span>
        </button>

        <button
          onClick={() => setActiveTab("mobile")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
            activeTab === "mobile"
              ? "bg-emerald-600 text-white shadow-sm"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          <Smartphone className="w-4 h-4" />
          <span>৩. মোবাইল ও অ্যান্ড্রয়েড সিঙ্ক গাইড</span>
        </button>

        <button
          onClick={() => setActiveTab("guidelines")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
            activeTab === "guidelines"
              ? "bg-emerald-600 text-white shadow-sm"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>৪. কলাম ফরম্যাট ও ফিল্ড গাইড</span>
        </button>
      </div>

      {/* TAB 1: UPLOAD & SYNC */}
      {activeTab === "upload" && (
        <div className="space-y-6">
          {/* Step 1 & Step 2 Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Download Templates Card */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-black text-sm">
                  ১
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">স্ট্যান্ডার্ড এক্সেল টেমপ্লেট ডাউনলোড</h3>
                  <p className="text-[11px] text-slate-500">ডাটা ইনপুটের জন্য অনুমোদিত ফরম্যাট</p>
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                পণ্য আপলোডের পূর্বে আমাদের তৈরি করা নমুনা টেমপ্লেটটি ডাউনলোড করে নিন। এতে সঠিক কলামের নাম ও নমুনা ডাটা দেয়া
                রয়েছে।
              </p>

              <div className="space-y-2.5 pt-2">
                <button
                  onClick={downloadSampleBulkUploadTemplate}
                  className="w-full flex items-center justify-between p-3 rounded-xl border border-emerald-200 bg-emerald-50/70 hover:bg-emerald-100 text-emerald-900 text-xs font-bold transition-colors group cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <FileSpreadsheet className="w-4 h-4 text-emerald-600 group-hover:scale-110 transition-transform" />
                    <span>পণ্য আপলোড টেমপ্লেট (.xlsx)</span>
                  </div>
                  <Download className="w-4 h-4 text-emerald-700" />
                </button>

                <button
                  onClick={downloadOrdersTemplate}
                  className="w-full flex items-center justify-between p-3 rounded-xl border border-indigo-200 bg-indigo-50/70 hover:bg-indigo-100 text-indigo-900 text-xs font-bold transition-colors group cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <FileSpreadsheet className="w-4 h-4 text-indigo-600 group-hover:scale-110 transition-transform" />
                    <span>অর্ডার ইমপোর্ট টেমপ্লেট (.xlsx)</span>
                  </div>
                  <Download className="w-4 h-4 text-indigo-700" />
                </button>

                <button
                  onClick={downloadCustomerLeadsTemplate}
                  className="w-full flex items-center justify-between p-3 rounded-xl border border-purple-200 bg-purple-50/70 hover:bg-purple-100 text-purple-900 text-xs font-bold transition-colors group cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <FileSpreadsheet className="w-4 h-4 text-purple-600 group-hover:scale-110 transition-transform" />
                    <span>কাস্টমার লিডস টেমপ্লেট (.xlsx)</span>
                  </div>
                  <Download className="w-4 h-4 text-purple-700" />
                </button>
              </div>

              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-[11.5px] text-amber-900 flex items-start gap-2">
                <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <span>
                  টেমপ্লেটে থাকা প্রথম সারি (Header) পরিবর্তন না করে সরাসরি ২য় সারি থেকে আপনার পণ্যের নাম ও দাম বসান।
                </span>
              </div>
            </div>

            {/* Upload Zone Card */}
            <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-black text-sm">
                  ২
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">এক্সেল বা সিএসভি ফাইল আপলোড করুন</h3>
                  <p className="text-[11px] text-slate-500">সরাসরি ফাইল ব্রাউজ করুন অথবা টেনে এনে ছেড়ে দিন</p>
                </div>
              </div>

              <div
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-3 ${
                  selectedFile
                    ? "border-emerald-400 bg-emerald-50/40"
                    : "border-slate-300 hover:border-emerald-400 hover:bg-slate-50/60"
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx, .xls, .csv"
                  onChange={handleFileChange}
                  className="hidden"
                />

                <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shadow-inner">
                  <FileSpreadsheet className="w-7 h-7" />
                </div>

                <div>
                  <p className="font-bold text-slate-800 text-sm">
                    {selectedFile ? selectedFile.name : "কম্পিউটার বা মোবাইল থেকে এক্সেল ফাইল নির্বাচন করুন"}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    সাপোর্টেড ফরম্যাট: .xlsx, .xls, .csv (সর্বোচ্চ সাইজ: ১০ মেগাবাইট)
                  </p>
                </div>

                <div className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-2">
                  <Upload className="w-3.5 h-3.5" />
                  <span>{selectedFile ? "ফাইল পরিবর্তন করুন" : "ফাইল ব্রাউজ করুন"}</span>
                </div>
              </div>

              {/* Parsing status indicator */}
              {parsing && (
                <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl flex items-center gap-2.5 text-xs text-indigo-800">
                  <RefreshCw className="w-4 h-4 animate-spin text-indigo-600" />
                  <span>এক্সেল ফাইল বিশ্লেষণ ও ভ্যালিডেশন যাচাই করা হচ্ছে...</span>
                </div>
              )}

              {/* Validation Summary */}
              {parsedRows.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
                    <p className="text-xs text-slate-500 font-medium">মোট পাওয়া ডাটা</p>
                    <p className="text-lg font-black text-slate-800">{parsedRows.length} টি সারি</p>
                  </div>
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-center">
                    <p className="text-xs text-emerald-700 font-medium">সঠিক ও অনুমোদিত</p>
                    <p className="text-lg font-black text-emerald-800">{validRows.length} টি পণ্য</p>
                  </div>
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-center">
                    <p className="text-xs text-rose-700 font-medium">ত্রুটিপূর্ণ সারি</p>
                    <p className="text-lg font-black text-rose-800">{errorRows.length} টি ত্রুটি</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Validation & Live Preview Section */}
          {validRows.length > 0 && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <span>ডাটাবেজে যুক্ত করার জন্য প্রস্তুত পণ্যসমূহ ({validRows.length})</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    নিচের প্রিভিউ তালিকাটি পরীক্ষা করে "ডাটাবেজে যুক্ত করুন" বাটনে চাপুন।
                  </p>
                </div>

                <button
                  onClick={handleCommitUpload}
                  disabled={isCommitting}
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer self-start sm:self-auto"
                >
                  {isCommitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>যুক্ত করা হচ্ছে...</span>
                    </>
                  ) : (
                    <>
                      <Database className="w-4 h-4" />
                      <span>{validRows.length} টি পণ্য ডাটাবেজে যুক্ত করুন</span>
                    </>
                  )}
                </button>
              </div>

              {/* Table preview */}
              <div className="overflow-x-auto max-h-80 border border-slate-200 rounded-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 sticky top-0">
                    <tr>
                      <th className="p-3">#</th>
                      <th className="p-3">পণ্যের নাম</th>
                      <th className="p-3">SKU</th>
                      <th className="p-3">ক্যাটাগরি</th>
                      <th className="p-3">মূল্য (BDT)</th>
                      <th className="p-3">বিক্রয় মূল্য</th>
                      <th className="p-3">স্টক</th>
                      <th className="p-3">স্ট্যাটাস</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {validRows.slice(0, 15).map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-3 font-mono text-slate-400">{idx + 1}</td>
                        <td className="p-3 font-semibold text-slate-900 max-w-xs truncate">{row.name}</td>
                        <td className="p-3 font-mono text-slate-600">{row.sku}</td>
                        <td className="p-3 text-slate-600">{row.categoryName}</td>
                        <td className="p-3 font-bold text-slate-500">৳{row.regularPrice}</td>
                        <td className="p-3 font-black text-emerald-600">৳{row.sellingPrice}</td>
                        <td className="p-3 font-bold">{row.totalStock}</td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                            Valid
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {validRows.length > 15 && (
                <p className="text-center text-xs text-slate-500">
                  ... আরও {validRows.length - 15} টি পণ্য তালিকায় যুক্ত রয়েছে।
                </p>
              )}
            </div>
          )}

          {/* Errors list if any */}
          {errorRows.length > 0 && (
            <div className="bg-rose-50 p-6 rounded-2xl border border-rose-200 space-y-3">
              <h4 className="font-bold text-rose-900 text-sm flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <span>ত্রুটিপূর্ণ সারিসমূহ ({errorRows.length})</span>
              </h4>
              <p className="text-xs text-rose-700">
                নিচের সারিগুলোতে ত্রুটি থাকায় ডাটাবেজে যুক্ত করা থেকে বাদ দেওয়া হয়েছে। এক্সেল ফাইলে সংশোধন করে পুনরায় আপলোড
                করতে পারেন:
              </p>
              <div className="space-y-1.5 max-h-48 overflow-y-auto">
                {errorRows.map((err, i) => (
                  <div
                    key={i}
                    className="p-2 bg-white/80 rounded-lg border border-rose-200 text-xs text-rose-800 flex items-center justify-between"
                  >
                    <span>
                      সারি #{err.row}: <strong>{err.error}</strong>
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">Row Index: {err.row}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: EXPORT ALL */}
      {activeTab === "export" && (
        <div className="space-y-6">
          {/* Master Multi-Sheet Feature Box */}
          <div className="bg-gradient-to-r from-emerald-600 to-teal-700 p-6 sm:p-8 rounded-3xl text-white shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-xl">
              <span className="px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold uppercase tracking-wider">
                Enterprise Multi-Sheet Backup
              </span>
              <h3 className="text-xl sm:text-2xl font-black">সম্পূর্ণ স্টোর মাস্টার ব্যাকআপ (.xlsx)</h3>
              <p className="text-xs sm:text-sm text-emerald-100 leading-relaxed">
                একটি মাত্র এক্সেল ফাইলের ভেতর আলাদা আলাদা শীটে পণ্য তালিকা (Products), অর্ডার হিস্ট্রি (Orders), কাস্টমার
                ডাটা (Customers), স্টক ব্যালেন্স (Inventory) ও কুপনসমূহ ডাউনলোড করে সুরক্ষিত রাখুন।
              </p>
            </div>

            <button
              onClick={handleExportMasterBackup}
              className="px-6 py-3 rounded-2xl bg-white hover:bg-slate-100 text-emerald-950 font-black text-xs sm:text-sm shadow-xl transition-all flex items-center gap-2.5 shrink-0 cursor-pointer active:scale-95"
            >
              <FolderDown className="w-5 h-5 text-emerald-700" />
              <span>ডাউনলোড মাস্টার ব্যাকআপ (.xlsx)</span>
            </button>
          </div>

          {/* Module-by-module export cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* 1. Products */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                    <Package className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold text-slate-500">{products.length} Items</span>
                </div>
                <h4 className="font-bold text-slate-900 text-sm">প্রোডাক্ট ক্যাটালগ এক্সপোর্ট</h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  সকল সক্রিয় পণ্যের নাম, এসকেইউ, ক্যাটাগরি, মূল্য, স্টক এবং ইমেজ লিংক এক্সপোর্ট করুন।
                </p>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  onClick={() => handleExportProducts("xlsx")}
                  className="flex-1 py-2 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs border border-emerald-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span>Excel (.xlsx)</span>
                </button>
                <button
                  onClick={() => handleExportProducts("csv")}
                  className="flex-1 py-2 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs border border-slate-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>CSV File</span>
                </button>
              </div>
            </div>

            {/* 2. Orders */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center">
                    <ShoppingBag className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold text-slate-500">{orders.length} Orders</span>
                </div>
                <h4 className="font-bold text-slate-900 text-sm">অর্ডার ও ইনভয়েস এক্সপোর্ট</h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  গ্রাহকের নাম, ফোন, ঠিকানা, পেমেন্ট মেথড, স্ট্যাটাস ও টাকার পরিমাণ সহ সম্পূর্ণ অর্ডার হিস্ট্রি।
                </p>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  onClick={() => handleExportOrders("xlsx")}
                  className="flex-1 py-2 px-3 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-800 font-bold text-xs border border-indigo-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span>Excel (.xlsx)</span>
                </button>
                <button
                  onClick={() => handleExportOrders("csv")}
                  className="flex-1 py-2 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs border border-slate-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>CSV File</span>
                </button>
              </div>
            </div>

            {/* 3. Customers */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center">
                    <Users className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold text-slate-500">{totalCustomers} Leads</span>
                </div>
                <h4 className="font-bold text-slate-900 text-sm">কাস্টমার ডাটাবেজ ও লিডস</h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  নিবন্ধিত গ্রাহকদের নাম, ফোন নম্বর, ইমেইল এবং সাইন-আপ তারিখের তালিকা এসএমএস বা মার্কেটিং ক্যাম্পেইনের জন্য।
                </p>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  onClick={() => handleExportCustomers("xlsx")}
                  className="flex-1 py-2 px-3 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 font-bold text-xs border border-teal-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span>Excel (.xlsx)</span>
                </button>
                <button
                  onClick={() => handleExportCustomers("csv")}
                  className="flex-1 py-2 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs border border-slate-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>CSV File</span>
                </button>
              </div>
            </div>

            {/* 4. Inventory Valuation */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
                    <Layers className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold text-slate-500">{products.length} SKUs</span>
                </div>
                <h4 className="font-bold text-slate-900 text-sm">ইনভেন্টরি স্টক ও অ্যাসেট রিপোর্ট</h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  মজুদ পণ্যের সংখ্যা, মোট ক্রয়মূল্য ভ্যালুয়েশন ও লো-স্টক সতর্কবার্তা তালিকা।
                </p>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  onClick={() => handleExportInventory("xlsx")}
                  className="flex-1 py-2 px-3 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold text-xs border border-amber-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span>Excel (.xlsx)</span>
                </button>
                <button
                  onClick={() => handleExportInventory("csv")}
                  className="flex-1 py-2 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs border border-slate-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>CSV File</span>
                </button>
              </div>
            </div>

            {/* 5. Coupons */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
                    <Tag className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold text-slate-500">{coupons.length} Vouchers</span>
                </div>
                <h4 className="font-bold text-slate-900 text-sm">কুপন ও প্রমোশনাল ডাটা</h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  ডিসকাউন্ট কোড, শতাংশ বা ফিক্সড ছাড়ের পরিমাণ, মেয়াদ এবং ব্যবহারের লিমিট এক্সপোর্ট।
                </p>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  onClick={() => handleExportCoupons("xlsx")}
                  className="flex-1 py-2 px-3 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-800 font-bold text-xs border border-purple-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span>Excel (.xlsx)</span>
                </button>
                <button
                  onClick={() => handleExportCoupons("csv")}
                  className="flex-1 py-2 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs border border-slate-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>CSV File</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: MOBILE & ANDROID GUIDE */}
      {activeTab === "mobile" && (
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-2xs space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Smartphone className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-black text-slate-900 text-base">মোবাইল ও অ্যান্ড্রয়েড ডিভাইসে এক্সেল ব্যবহারের নিয়ম</h3>
              <p className="text-xs text-slate-500">কম্পিউটার ছাড়াই স্মার্টফোন থেকে ডাটা ইনপুট ও সিঙ্ক করুন</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <span className="w-7 h-7 rounded-full bg-emerald-600 text-white font-black text-xs flex items-center justify-center">
                ১
              </span>
              <h4 className="font-bold text-slate-800 text-sm">টেমপ্লেট ডাউনলোড</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                মোবাইলের ক্রোম বা যেকোনো ব্রাউজার থেকে "পণ্য আপলোড টেমপ্লেট (.xlsx)" বাটনে চাপ দিন। ফাইলটি আপনার ফোনের Download
                ফোল্ডারে সেভ হবে।
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <span className="w-7 h-7 rounded-full bg-emerald-600 text-white font-black text-xs flex items-center justify-center">
                ২
              </span>
              <h4 className="font-bold text-slate-800 text-sm">গুগল শিটস বা এক্সেলে এডিট</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                ফোনে থাকা <strong>Google Sheets</strong> বা <strong>Microsoft Excel</strong> অ্যাপ দিয়ে ফাইলটি ওপেন করুন। আপনার
                পণ্যের নাম, বিক্রয় মূল্য ও পরিমাণ লিখে সেভ করুন।
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <span className="w-7 h-7 rounded-full bg-emerald-600 text-white font-black text-xs flex items-center justify-center">
                ৩
              </span>
              <h4 className="font-bold text-slate-800 text-sm">১-ক্লিকে স্টোরে আপলোড</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                অ্যাডমিন কনসোলের আপলোড ট্যাবে এসে ফাইলটি সিলেক্ট করুন। মুহূর্তের মধ্যে সব পণ্য সরাসরি আপনার ওয়েবসাইটে প্রকাশিত
                হয়ে যাবে!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: FIELD SPECIFICATIONS */}
      {activeTab === "guidelines" && (
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-2xs space-y-6">
          <div>
            <h3 className="font-black text-slate-900 text-base">এক্সেল কলাম স্পেসিফিকেশন ও ফিল্ড গাইড</h3>
            <p className="text-xs text-slate-500 mt-1">
              ফাইল তৈরির সময় কলামের নাম ও ডাটা টাইপ নিম্নে উল্লেখিত নিয়মে সাজান:
            </p>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-800 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3">কলামের নাম (Column Header)</th>
                  <th className="p-3">প্রয়োজনীয়তা</th>
                  <th className="p-3">ডাটা টাইপ</th>
                  <th className="p-3">উদাহরণ</th>
                  <th className="p-3">বিবরণ ও স্বয়ংক্রিয় হ্যান্ডলিং</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                <tr>
                  <td className="p-3 font-mono font-bold text-indigo-600">title / Name</td>
                  <td className="p-3 text-rose-600 font-bold">বাধ্যতামূলক</td>
                  <td className="p-3">টেক্সট</td>
                  <td className="p-3 font-semibold">Wireless Noise Canceling Earbuds</td>
                  <td className="p-3 text-slate-500">পণ্যের স্পষ্ট নাম (কমপক্ষে ২ অক্ষর)</td>
                </tr>
                <tr>
                  <td className="p-3 font-mono font-bold text-indigo-600">regularPrice / Price</td>
                  <td className="p-3 text-rose-600 font-bold">বাধ্যতামূলক</td>
                  <td className="p-3">সংখ্যা (Number)</td>
                  <td className="p-3 font-semibold">2500</td>
                  <td className="p-3 text-slate-500">মূল বা কাটা মূল্য (MRP)</td>
                </tr>
                <tr>
                  <td className="p-3 font-mono font-bold text-indigo-600">sellingPrice</td>
                  <td className="p-3 text-slate-500">ঐচ্ছিক</td>
                  <td className="p-3">সংখ্যা (Number)</td>
                  <td className="p-3 font-semibold">1990</td>
                  <td className="p-3 text-slate-500">অফার মূল্য (খালি রাখলে মূল দাম ব্যবহৃত হবে)</td>
                </tr>
                <tr>
                  <td className="p-3 font-mono font-bold text-indigo-600">stock / totalStock</td>
                  <td className="p-3 text-slate-500">ঐচ্ছিক</td>
                  <td className="p-3">সংখ্যা (Number)</td>
                  <td className="p-3 font-semibold">50</td>
                  <td className="p-3 text-slate-500">মজুদ সংখ্যা (খালি রাখলে ডিফল্ট ১০ সেট হবে)</td>
                </tr>
                <tr>
                  <td className="p-3 font-mono font-bold text-indigo-600">sku</td>
                  <td className="p-3 text-slate-500">ঐচ্ছিক</td>
                  <td className="p-3">টেক্সট</td>
                  <td className="p-3 font-semibold">SKU-WNC-01</td>
                  <td className="p-3 text-slate-500">খালি রাখলে ইউনিক এসকেইউ স্বয়ংক্রিয় তৈরি হবে</td>
                </tr>
                <tr>
                  <td className="p-3 font-mono font-bold text-indigo-600">category</td>
                  <td className="p-3 text-slate-500">ঐচ্ছিক</td>
                  <td className="p-3">টেক্সট</td>
                  <td className="p-3 font-semibold">Gadgets & Accessories</td>
                  <td className="p-3 text-slate-500">স্টোরের ক্যাটাগরির সাথে স্বয়ংক্রিয় মিলবে</td>
                </tr>
                <tr>
                  <td className="p-3 font-mono font-bold text-indigo-600">image / imageUrl</td>
                  <td className="p-3 text-slate-500">ঐচ্ছিক</td>
                  <td className="p-3">URL লিংক</td>
                  <td className="p-3 font-semibold">https://images.unsplash.com/...</td>
                  <td className="p-3 text-slate-500">পণ্যের ছবির লিংক (খালি থাকলে প্রিমিয়াম প্লেসহোল্ডার)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
