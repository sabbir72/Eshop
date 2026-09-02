import React, { useState, useMemo } from "react";
import { useStore } from "../../context/StoreContext";
import { Product, Warehouse } from "../../types";
import { PrintableDocumentData } from "../../types/print";
import { buildBarcodeLabelsData, buildReportPrintData } from "../../utils/printDocumentBuilder";
import { EnterprisePrintModal } from "../common/EnterprisePrintModal";
import {
  Package,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Search,
  Filter,
  RefreshCw,
  FileSpreadsheet,
  FileText,
  Printer,
  Plus,
  Edit,
  Trash2,
  Eye,
  ArrowLeftRight,
  Building2,
  QrCode,
  Copy,
  Upload,
  Download,
  Layers,
  Sparkles,
  DollarSign,
  Tag,
  Clock,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  Check,
  X,
  Boxes,
  Percent,
  Warehouse as WarehouseIcon,
  BarChart3,
  ShieldCheck,
} from "lucide-react";

export const InventoryManagement: React.FC = () => {
  const {
    products,
    categories,
    brands,
    warehouses,
    stockMovements,
    updateStockMovement,
    updateProduct,
    deleteProduct,
    addProduct,
    bulkAddProducts,
    bulkUpdateProductStatus,
    bulkDeleteProducts,
    settings,
    hasPermission,
    addToast,
    addAuditLog,
  } = useStore();

  const [activePrintData, setActivePrintData] = useState<PrintableDocumentData | null>(null);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState<boolean>(false);

  const openPrintModal = (data: PrintableDocumentData) => {
    setActivePrintData(data);
    setIsPrintModalOpen(true);
  };

  // Active Tab
  const [activeSubTab, setActiveSubTab] = useState<"master" | "low-stock" | "transfers" | "barcodes" | "reports">("master");

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedBrand, setSelectedBrand] = useState<string>("all");
  const [selectedProductStatus, setSelectedProductStatus] = useState<string>("all");
  const [selectedStockStatus, setSelectedStockStatus] = useState<string>("all");
  const [selectedWarehouse, setSelectedWarehouse] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"newest" | "stock-desc" | "stock-asc" | "price-desc" | "price-asc" | "name">("newest");

  // Selection for Bulk Actions
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Modals
  const [showStockModal, setShowStockModal] = useState(false);
  const [stockModalProduct, setStockModalProduct] = useState<Product | null>(null);
  const [stockAdjustmentQty, setStockAdjustmentQty] = useState<number>(10);
  const [stockAdjustmentMode, setStockAdjustmentMode] = useState<"add" | "set" | "subtract">("add");
  const [stockReason, setStockReason] = useState<string>("Restock");
  const [stockNotes, setStockNotes] = useState<string>("");

  const [showPriceModal, setShowPriceModal] = useState(false);
  const [priceModalProduct, setPriceModalProduct] = useState<Product | null>(null);
  const [newSellingPrice, setNewSellingPrice] = useState<number>(0);
  const [newDiscountPrice, setNewDiscountPrice] = useState<number>(0);

  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailProduct, setDetailProduct] = useState<Product | null>(null);

  const [showBarcodeModal, setShowBarcodeModal] = useState(false);
  const [barcodeProduct, setBarcodeProduct] = useState<Product | null>(null);

  const [showTransferModal, setShowTransferModal] = useState(false);
  const [transferProductId, setTransferProductId] = useState(products[0]?.id || "");
  const [fromWarehouse, setFromWarehouse] = useState(warehouses[0]?.id || "");
  const [toWarehouse, setToWarehouse] = useState(warehouses[1]?.id || "");
  const [transferQty, setTransferQty] = useState(10);
  const [transferReason, setTransferReason] = useState("Warehouse Stock Balancing");

  const [showImportModal, setShowImportModal] = useState(false);
  const [importFileContent, setImportFileContent] = useState<string>("");
  const [importPreviewData, setImportPreviewData] = useState<any[]>([]);

  const [showBulkStockModal, setShowBulkStockModal] = useState(false);
  const [bulkStockQty, setBulkStockQty] = useState(10);

  // Helper for Auto Document Number
  const getDocumentNumber = (p: Product, index?: number) => {
    if ((p as any).docNumber) return (p as any).docNumber;
    const pad = String((index !== undefined ? index + 1 : 1) + 100).padStart(6, "0");
    return `PRD-2026-${pad}`;
  };

  // Helper for Barcode formatting
  const getBarcodeNumber = (p: Product) => {
    return p.barcode || `880${p.sku.replace(/\D/g, "").slice(0, 9).padEnd(9, "0")}`;
  };

  // Summary Metrics
  const totalProducts = products.length;
  const activeProducts = products.filter((p) => p.status === "Active").length;
  const draftProducts = products.filter((p) => p.status === "Draft").length;
  const inStockCount = products.filter((p) => p.totalStock > 0).length;
  const lowStockThresholdDefault = 10;
  const lowStockCount = products.filter(
    (p) => p.totalStock > 0 && p.totalStock <= (p.lowStockThreshold || lowStockThresholdDefault)
  ).length;
  const outOfStockCount = products.filter((p) => p.totalStock === 0).length;
  const totalInventoryValue = products.reduce((acc, p) => acc + p.sellingPrice * p.totalStock, 0);

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        const docNum = getDocumentNumber(p);
        const barNum = getBarcodeNumber(p);
        const matchesSearch =
          p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
          docNum.toLowerCase().includes(searchTerm.toLowerCase()) ||
          barNum.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.brandName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.categoryName.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesCat = selectedCategory === "all" || p.categoryId === selectedCategory;
        const matchesBrand = selectedBrand === "all" || p.brandId === selectedBrand;
        const matchesProdStatus = selectedProductStatus === "all" || p.status === selectedProductStatus;

        let matchesStockStatus = true;
        const threshold = p.lowStockThreshold || lowStockThresholdDefault;
        if (selectedStockStatus === "instock") {
          matchesStockStatus = p.totalStock > threshold;
        } else if (selectedStockStatus === "lowstock") {
          matchesStockStatus = p.totalStock > 0 && p.totalStock <= threshold;
        } else if (selectedStockStatus === "outofstock") {
          matchesStockStatus = p.totalStock === 0;
        }

        return matchesSearch && matchesCat && matchesBrand && matchesProdStatus && matchesStockStatus;
      })
      .sort((a, b) => {
        if (sortBy === "stock-desc") return b.totalStock - a.totalStock;
        if (sortBy === "stock-asc") return a.totalStock - b.totalStock;
        if (sortBy === "price-desc") return b.sellingPrice - a.sellingPrice;
        if (sortBy === "price-asc") return a.sellingPrice - b.sellingPrice;
        if (sortBy === "name") return a.name.localeCompare(b.name);
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [products, searchTerm, selectedCategory, selectedBrand, selectedProductStatus, selectedStockStatus, sortBy]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage) || 1;
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredProducts.slice(start, start + itemsPerPage);
  }, [filteredProducts, currentPage]);

  // Handle Multi-Select Checkboxes
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedProductIds(paginatedProducts.map((p) => p.id));
    } else {
      setSelectedProductIds([]);
    }
  };

  const handleSelectProduct = (id: string) => {
    setSelectedProductIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };

  // Stock Adjustment Submission
  const handleStockAdjustmentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!stockModalProduct) return;

    let newStock = stockModalProduct.totalStock;
    if (stockAdjustmentMode === "add") {
      newStock += stockAdjustmentQty;
    } else if (stockAdjustmentMode === "subtract") {
      newStock = Math.max(0, newStock - stockAdjustmentQty);
    } else {
      newStock = Math.max(0, stockAdjustmentQty);
    }

    const isLow = newStock <= (stockModalProduct.lowStockThreshold || lowStockThresholdDefault);

    updateProduct(stockModalProduct.id, {
      totalStock: newStock,
      isLowStock: isLow,
    });

    updateStockMovement({
      type: stockAdjustmentMode === "subtract" ? "Out" : "In",
      productId: stockModalProduct.id,
      productName: stockModalProduct.name,
      sku: stockModalProduct.sku,
      quantity: Math.abs(newStock - stockModalProduct.totalStock) || stockAdjustmentQty,
      reason: `${stockReason} ${stockNotes ? `(${stockNotes})` : ""}`,
      performedBy: "Inventory Manager",
    });

    addAuditLog(
      "Inventory Manager",
      "Stock Adjustment",
      `Adjusted stock for ${stockModalProduct.name} (${stockModalProduct.sku}) to ${newStock} units.`
    );

    addToast(`Stock for ${stockModalProduct.name} updated to ${newStock} units`, "success");
    setShowStockModal(false);
  };

  // Price Update Submission
  const handlePriceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!priceModalProduct) return;

    updateProduct(priceModalProduct.id, {
      sellingPrice: Number(newSellingPrice),
      discountPrice: Number(newDiscountPrice) || 0,
    });

    addAuditLog(
      "Inventory Manager",
      "Price Update",
      `Updated pricing for ${priceModalProduct.name}: Selling=${newSellingPrice}, Discount=${newDiscountPrice}`
    );

    addToast(`Updated price for ${priceModalProduct.name}`, "success");
    setShowPriceModal(false);
  };

  // Warehouse Transfer Submission
  const handleTransferSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const prod = products.find((p) => p.id === transferProductId);
    const fromWh = warehouses.find((w) => w.id === fromWarehouse);
    const toWh = warehouses.find((w) => w.id === toWarehouse);

    if (!prod || !fromWh || !toWh) return;

    updateStockMovement({
      type: "Transfer",
      productId: prod.id,
      productName: prod.name,
      sku: prod.sku,
      quantity: transferQty,
      fromWarehouseId: fromWh.id,
      fromWarehouseName: fromWh.name,
      toWarehouseId: toWh.id,
      toWarehouseName: toWh.name,
      reason: transferReason,
      performedBy: "Inventory Manager",
    });

    addToast(`Transferred ${transferQty} units of ${prod.name} from ${fromWh.name} to ${toWh.name}`, "success");
    setShowTransferModal(false);
  };

  // Duplicate Product Action
  const handleDuplicateProduct = (p: Product) => {
    const copySKU = `${p.sku}-COPY-${Math.floor(100 + Math.random() * 900)}`;
    const copyProduct: Omit<Product, "id" | "createdAt" | "rating" | "reviewsCount"> = {
      ...p,
      name: `${p.name} (Copy)`,
      sku: copySKU,
      barcode: `880${Math.floor(100000000 + Math.random() * 900000000)}`,
      totalStock: Math.max(5, p.totalStock),
    };

    addProduct(copyProduct);
    addToast(`Duplicated ${p.name} with new SKU ${copySKU}`, "success");
  };

  // Export to Excel / CSV
  const handleExportCSV = () => {
    const headers = [
      "Document Number",
      "SKU",
      "Barcode",
      "Product Name",
      "Category",
      "Brand",
      "Purchase Price",
      "Selling Price",
      "Discount Price",
      "Stock Quantity",
      "Status",
    ];

    const rows = filteredProducts.map((p, idx) => [
      `"${getDocumentNumber(p, idx)}"`,
      `"${p.sku}"`,
      `"${getBarcodeNumber(p)}"`,
      `"${p.name.replace(/"/g, '""')}"`,
      `"${p.categoryName}"`,
      `"${p.brandName}"`,
      p.purchasePrice || p.sellingPrice * 0.7,
      p.sellingPrice,
      p.discountPrice || 0,
      p.totalStock,
      `"${p.status}"`,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Inventory_Export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    addToast("Exported Inventory data to CSV/Excel file", "success");
  };

  // Print Inventory Table or Barcodes
  const handlePrint = () => {
    if (activeSubTab === "barcodes") {
      openPrintModal(buildBarcodeLabelsData(products));
    } else {
      const headers = ["SKU", "Product Title", "Category", "Brand", "Selling Price", "Stock Qty", "Total Valuation"];
      const rawRows = products.map((p) => [
        p.sku,
        p.name,
        p.categoryName,
        p.brandName,
        `${settings.currencySymbol}${p.sellingPrice.toLocaleString()}`,
        p.totalStock,
        `${settings.currencySymbol}${(p.sellingPrice * p.totalStock).toLocaleString()}`,
      ]);

      openPrintModal(buildReportPrintData("INVENTORY MASTER STOCK REPORT", headers, rawRows, "stock_report"));
    }
  };

  // Bulk Actions
  const handleBulkStatusChange = (status: "Active" | "Draft" | "Inactive") => {
    if (selectedProductIds.length === 0) return;
    bulkUpdateProductStatus(selectedProductIds, status);
    addToast(`Updated ${selectedProductIds.length} products to status: ${status}`, "success");
    setSelectedProductIds([]);
  };

  const handleBulkDelete = () => {
    if (selectedProductIds.length === 0) return;
    if (window.confirm(`Are you sure you want to delete ${selectedProductIds.length} selected products?`)) {
      bulkDeleteProducts(selectedProductIds);
      addToast(`Deleted ${selectedProductIds.length} products`, "warning");
      setSelectedProductIds([]);
    }
  };

  const handleBulkStockSubmit = () => {
    selectedProductIds.forEach((id) => {
      const p = products.find((prod) => prod.id === id);
      if (p) {
        updateProduct(id, { totalStock: p.totalStock + bulkStockQty });
      }
    });
    addToast(`Added +${bulkStockQty} stock to ${selectedProductIds.length} products`, "success");
    setShowBulkStockModal(false);
    setSelectedProductIds([]);
  };

  // Demo CSV Import Handler
  const handleSampleImport = () => {
    const demoItems: Product[] = [
      {
        id: `imp-${Date.now()}-1`,
        name: "Pro Gaming Mechanical Keyboard RGB",
        sku: "KEY-RGB-PRO-101",
        barcode: "8809988112233",
        categoryId: categories[0]?.id || "cat-1",
        categoryName: categories[0]?.name || "Electronics",
        brandId: brands[0]?.id || "b-1",
        brandName: brands[0]?.name || "TechPro",
        vendor: "Tech Vendor Direct",
        shortDescription: "Ultra-fast tactile mechanical gaming keyboard",
        description: "Full mechanical RGB keyboard with customizable macro keys.",
        specifications: { Switch: "Red Linear", Connectivity: "Type-C" },
        warranty: "1 Year",
        costPrice: 45,
        purchasePrice: 50,
        sellingPrice: 89,
        discountPrice: 75,
        taxPercent: 5,
        vatPercent: 0,
        mainImage: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&q=80",
        galleryImages: [],
        videoUrl: "",
        colors: ["Black", "White"],
        sizes: ["Standard"],
        weight: "0.9 kg",
        variants: [],
        totalStock: 45,
        isLowStock: false,
        status: "Active",
        rating: 4.8,
        reviewsCount: 32,
        createdAt: new Date().toISOString(),
      },
      {
        id: `imp-${Date.now()}-2`,
        name: "Ergonomic Mesh Swivel Desk Chair",
        sku: "CHR-ERG-MSH-202",
        barcode: "8809988112244",
        categoryId: categories[1]?.id || "cat-2",
        categoryName: categories[1]?.name || "Home & Living",
        brandId: brands[1]?.id || "b-2",
        brandName: brands[1]?.name || "ComfortHome",
        vendor: "Global Furniture Inc",
        shortDescription: "Breathable lumbar support ergonomic chair",
        description: "Heavy-duty mesh office swivel chair with adjustable headrest.",
        specifications: { Material: "Mesh & Steel", MaxWeight: "150 kg" },
        warranty: "2 Years",
        costPrice: 110,
        purchasePrice: 120,
        sellingPrice: 199,
        discountPrice: 179,
        taxPercent: 5,
        vatPercent: 0,
        mainImage: "https://images.unsplash.com/photo-1580481072645-022f9a6d8310?w=800&q=80",
        galleryImages: [],
        videoUrl: "",
        colors: ["Black", "Gray"],
        sizes: ["Universal"],
        weight: "14.5 kg",
        variants: [],
        totalStock: 18,
        isLowStock: false,
        status: "Active",
        rating: 4.7,
        reviewsCount: 19,
        createdAt: new Date().toISOString(),
      },
    ];

    bulkAddProducts(demoItems);
    addToast("Successfully imported 2 sample products with generated Document Numbers!", "success");
    setShowImportModal(false);
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Top Header & Quick Sub-Nav */}
      <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-4 border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-extrabold text-[10px] uppercase rounded-full tracking-wider">
              Inventory Command Center
            </span>
            <span className="text-xs text-slate-400 font-mono">v3.2 Real-time Sync</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white mt-1">Inventory & Stock Control</h1>
          <p className="text-xs text-slate-300 mt-0.5">
            Manage multi-warehouse stock levels, SKU barcodes, document numbers, low stock alerts & bulk updates.
          </p>
        </div>

        {/* Action Controls & Subtabs */}
        <div className="flex flex-wrap items-center gap-2">
          {hasPermission("Inventory", "import") && (
            <button
              onClick={() => setShowImportModal(true)}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl border border-slate-700 transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <Upload className="w-4 h-4 text-emerald-400" />
              <span>Import Excel/CSV</span>
            </button>
          )}

          {hasPermission("Inventory", "export") && (
            <button
              onClick={handleExportCSV}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl border border-slate-700 transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <Download className="w-4 h-4 text-sky-400" />
              <span>Export All</span>
            </button>
          )}

          {hasPermission("Inventory", "add") && (
            <button
              onClick={() => setShowTransferModal(true)}
              className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-md transition-colors flex items-center gap-1.5"
            >
              <ArrowLeftRight className="w-4 h-4" />
              <span>Stock Transfer</span>
            </button>
          )}
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveSubTab("master")}
          className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 whitespace-nowrap ${
            activeSubTab === "master"
              ? "bg-slate-900 text-white shadow-md"
              : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
          }`}
        >
          <Boxes className="w-4 h-4 text-indigo-400" />
          <span>Stock Master Table</span>
          <span className="ml-1 px-2 py-0.5 bg-indigo-100 text-indigo-800 text-[10px] font-bold rounded-full">
            {products.length}
          </span>
        </button>

        <button
          onClick={() => setActiveSubTab("low-stock")}
          className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 whitespace-nowrap ${
            activeSubTab === "low-stock"
              ? "bg-amber-600 text-white shadow-md"
              : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
          }`}
        >
          <AlertTriangle className="w-4 h-4 text-amber-300" />
          <span>Low Stock & Reorders</span>
          {lowStockCount + outOfStockCount > 0 && (
            <span className="ml-1 px-2 py-0.5 bg-rose-500 text-white text-[10px] font-bold rounded-full animate-pulse">
              {lowStockCount + outOfStockCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveSubTab("transfers")}
          className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 whitespace-nowrap ${
            activeSubTab === "transfers"
              ? "bg-slate-900 text-white shadow-md"
              : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
          }`}
        >
          <WarehouseIcon className="w-4 h-4 text-sky-400" />
          <span>Warehouses & Movements</span>
          <span className="ml-1 px-2 py-0.5 bg-sky-100 text-sky-800 text-[10px] font-bold rounded-full">
            {warehouses.length}
          </span>
        </button>

        <button
          onClick={() => setActiveSubTab("barcodes")}
          className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 whitespace-nowrap ${
            activeSubTab === "barcodes"
              ? "bg-slate-900 text-white shadow-md"
              : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
          }`}
        >
          <QrCode className="w-4 h-4 text-emerald-400" />
          <span>Barcode & QR Generator</span>
        </button>

        <button
          onClick={() => setActiveSubTab("reports")}
          className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 whitespace-nowrap ${
            activeSubTab === "reports"
              ? "bg-slate-900 text-white shadow-md"
              : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
          }`}
        >
          <BarChart3 className="w-4 h-4 text-purple-400" />
          <span>Inventory Reports</span>
        </button>
      </div>

      {/* 9 Summary Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-9 gap-3">
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Total Products</p>
          <p className="text-xl font-black text-slate-900">{totalProducts}</p>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-emerald-100 bg-emerald-50/30 shadow-xs space-y-1">
          <p className="text-[10px] font-black text-emerald-700 uppercase tracking-wider">Active</p>
          <p className="text-xl font-black text-emerald-700">{activeProducts}</p>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Draft / Inactive</p>
          <p className="text-xl font-black text-slate-700">{draftProducts}</p>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-blue-100 bg-blue-50/30 shadow-xs space-y-1">
          <p className="text-[10px] font-black text-blue-700 uppercase tracking-wider">In Stock</p>
          <p className="text-xl font-black text-blue-700">{inStockCount}</p>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-amber-200 bg-amber-50/50 shadow-xs space-y-1">
          <p className="text-[10px] font-black text-amber-800 uppercase tracking-wider">Low Stock</p>
          <p className="text-xl font-black text-amber-800">{lowStockCount}</p>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-rose-200 bg-rose-50/50 shadow-xs space-y-1">
          <p className="text-[10px] font-black text-rose-700 uppercase tracking-wider">Out of Stock</p>
          <p className="text-xl font-black text-rose-700">{outOfStockCount}</p>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-indigo-200 bg-indigo-50/40 shadow-xs col-span-2 space-y-1">
          <p className="text-[10px] font-black text-indigo-700 uppercase tracking-wider">Total Inventory Value</p>
          <p className="text-xl font-black text-indigo-950 font-mono">
            {settings.currencySymbol}
            {totalInventoryValue.toLocaleString()}
          </p>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Categories / Brands</p>
          <p className="text-sm font-black text-slate-900">
            {categories.length} / {brands.length}
          </p>
        </div>
      </div>

      {/* SUB-TAB 1: STOCK MASTER TABLE & FILTERS */}
      {activeSubTab === "master" && (
        <div className="space-y-4">
          {/* Advanced Filter Panel */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-col md:flex-row items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 font-black text-sm text-slate-900">
                <Filter className="w-4 h-4 text-indigo-600" />
                <span>Search & Advanced Inventory Filters</span>
              </div>

              <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                <span>
                  Showing <strong className="text-slate-900">{filteredProducts.length}</strong> of {products.length} items
                </span>
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedCategory("all");
                    setSelectedBrand("all");
                    setSelectedProductStatus("all");
                    setSelectedStockStatus("all");
                    setSortBy("newest");
                    setCurrentPage(1);
                  }}
                  className="px-2.5 py-1 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-lg transition-colors flex items-center gap-1 font-extrabold"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Reset
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 text-xs">
              {/* Instant Search Bar */}
              <div className="lg:col-span-2 relative">
                <label className="font-bold text-slate-700 block mb-1">Instant Search</label>
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search Name, SKU, Barcode, Document No..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Category Filter */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => {
                    setSelectedCategory(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:outline-none"
                >
                  <option value="all">All Categories ({categories.length})</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Brand Filter */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">Brand</label>
                <select
                  value={selectedBrand}
                  onChange={(e) => {
                    setSelectedBrand(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:outline-none"
                >
                  <option value="all">All Brands ({brands.length})</option>
                  {brands.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Stock Status Filter */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">Stock Status</label>
                <select
                  value={selectedStockStatus}
                  onChange={(e) => {
                    setSelectedStockStatus(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:outline-none"
                >
                  <option value="all">All Stock Statuses</option>
                  <option value="instock">In Stock ({inStockCount})</option>
                  <option value="lowstock">Low Stock Alert ({lowStockCount})</option>
                  <option value="outofstock">Out of Stock ({outOfStockCount})</option>
                </select>
              </div>

              {/* Sorting Filter */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">Sort By</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:outline-none"
                >
                  <option value="newest">Newest First</option>
                  <option value="stock-desc">Stock: High to Low</option>
                  <option value="stock-asc">Stock: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="name">Product Name (A-Z)</option>
                </select>
              </div>
            </div>

            {/* Print & Action Bar */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs">
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrint}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl transition-colors flex items-center gap-1"
                >
                  <Printer className="w-3.5 h-3.5" /> Print Sheet
                </button>
                <button
                  onClick={handleExportCSV}
                  className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold rounded-xl border border-emerald-200 transition-colors flex items-center gap-1"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" /> Export Excel
                </button>
              </div>

              {selectedProductIds.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 bg-indigo-50 border border-indigo-200 p-2 rounded-2xl animate-fade-in">
                  <span className="font-black text-indigo-900 px-2">
                    {selectedProductIds.length} Selected
                  </span>
                  <button
                    onClick={() => setShowBulkStockModal(true)}
                    className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg shadow-xs"
                  >
                    + Bulk Add Stock
                  </button>
                  <button
                    onClick={() => handleBulkStatusChange("Active")}
                    className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-xs"
                  >
                    Set Active
                  </button>
                  <button
                    onClick={() => handleBulkStatusChange("Draft")}
                    className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg shadow-xs"
                  >
                    Set Draft
                  </button>
                  <button
                    onClick={handleBulkDelete}
                    className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg shadow-xs"
                  >
                    Delete Selected
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Product Inventory Responsive Table */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead className="bg-slate-900 text-white border-b border-slate-800 font-bold uppercase tracking-wider sticky top-0 z-10">
                  <tr>
                    <th className="p-3.5 w-10 text-center">
                      <input
                        type="checkbox"
                        checked={
                          paginatedProducts.length > 0 &&
                          paginatedProducts.every((p) => selectedProductIds.includes(p.id))
                        }
                        onChange={handleSelectAll}
                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                      />
                    </th>
                    <th className="p-3.5">Product</th>
                    <th className="p-3.5">Doc Number</th>
                    <th className="p-3.5">SKU & Barcode</th>
                    <th className="p-3.5">Category & Brand</th>
                    <th className="p-3.5 text-right">Selling Price</th>
                    <th className="p-3.5 text-center">Stock Breakdown</th>
                    <th className="p-3.5 text-center">Stock Status</th>
                    <th className="p-3.5 text-center">Product Status</th>
                    <th className="p-3.5 text-right pr-4">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-200 text-slate-800 font-medium">
                  {paginatedProducts.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="p-12 text-center text-slate-400">
                        <Package className="w-12 h-12 mx-auto text-slate-300 mb-2" />
                        <p className="font-bold text-slate-600 text-sm">No inventory records match your query.</p>
                        <p className="text-xs">Try resetting filters or searching with a different term.</p>
                      </td>
                    </tr>
                  ) : (
                    paginatedProducts.map((p, index) => {
                      const isSelected = selectedProductIds.includes(p.id);
                      const docNo = getDocumentNumber(p, (currentPage - 1) * itemsPerPage + index);
                      const barNo = getBarcodeNumber(p);
                      const threshold = p.lowStockThreshold || lowStockThresholdDefault;
                      const isOut = p.totalStock === 0;
                      const isLow = p.totalStock > 0 && p.totalStock <= threshold;

                      const reservedStock = Math.min(3, Math.floor(p.totalStock * 0.1));
                      const availableStock = Math.max(0, p.totalStock - reservedStock);

                      return (
                        <tr
                          key={p.id}
                          className={`hover:bg-indigo-50/40 transition-colors ${
                            isSelected ? "bg-indigo-50/70" : index % 2 === 0 ? "bg-white" : "bg-slate-50/50"
                          }`}
                        >
                          {/* Checkbox */}
                          <td className="p-3.5 text-center">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleSelectProduct(p.id)}
                              className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                            />
                          </td>

                          {/* Product Image & Title */}
                          <td className="p-3.5">
                            <div className="flex items-center gap-3">
                              <img
                                src={p.mainImage}
                                alt={p.name}
                                className="w-11 h-11 object-contain rounded-xl bg-slate-100 border border-slate-200 p-1 flex-shrink-0"
                              />
                              <div className="space-y-0.5">
                                <h4
                                  onClick={() => {
                                    setDetailProduct(p);
                                    setShowDetailModal(true);
                                  }}
                                  className="font-bold text-slate-900 line-clamp-1 hover:text-indigo-600 cursor-pointer"
                                >
                                  {p.name}
                                </h4>
                                <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono">
                                  <span>Rating: ⭐ {p.rating || 4.5}</span>
                                  <span>•</span>
                                  <span>Sold: {(p.reviewsCount || 5) * 3 + 12} units</span>
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Document Number */}
                          <td className="p-3.5 font-mono text-slate-900 font-bold whitespace-nowrap">
                            <span className="px-2 py-0.5 bg-slate-100 border border-slate-200 rounded-md">
                              {docNo}
                            </span>
                          </td>

                          {/* SKU & Barcode */}
                          <td className="p-3.5 space-y-0.5">
                            <div className="font-mono font-extrabold text-indigo-950 text-xs">{p.sku}</div>
                            <div className="font-mono text-[10px] text-slate-500">{barNo}</div>
                          </td>

                          {/* Category & Brand */}
                          <td className="p-3.5 space-y-0.5">
                            <div className="font-bold text-slate-900">{p.categoryName}</div>
                            <div className="text-[10px] text-slate-500">{p.brandName}</div>
                          </td>

                          {/* Pricing */}
                          <td className="p-3.5 text-right font-mono">
                            <div className="font-black text-slate-950">
                              {settings.currencySymbol}
                              {p.sellingPrice.toLocaleString()}
                            </div>
                            {p.discountPrice && p.discountPrice < p.sellingPrice ? (
                              <div className="text-[10px] text-emerald-600 font-bold">
                                Disc: {settings.currencySymbol}
                                {p.discountPrice.toLocaleString()}
                              </div>
                            ) : null}
                          </td>

                          {/* Stock Breakdown */}
                          <td className="p-3.5 text-center font-mono">
                            <div className="font-black text-sm text-slate-900">{p.totalStock} units</div>
                            <div className="text-[10px] text-slate-500 flex justify-center gap-2 mt-0.5">
                              <span title="Available Stock" className="text-emerald-700 font-bold">
                                Avail: {availableStock}
                              </span>
                              <span>|</span>
                              <span title="Reserved Stock" className="text-amber-700">
                                Res: {reservedStock}
                              </span>
                            </div>
                          </td>

                          {/* Stock Alert Badge */}
                          <td className="p-3.5 text-center">
                            {isOut ? (
                              <span className="px-2.5 py-1 bg-rose-100 text-rose-800 font-black text-[10px] rounded-full border border-rose-200 uppercase tracking-wider inline-flex items-center gap-1">
                                <XCircle className="w-3 h-3" /> Out of Stock
                              </span>
                            ) : isLow ? (
                              <span className="px-2.5 py-1 bg-amber-100 text-amber-900 font-black text-[10px] rounded-full border border-amber-300 uppercase tracking-wider inline-flex items-center gap-1">
                                <AlertTriangle className="w-3 h-3 text-amber-600" /> Low Stock ({p.totalStock})
                              </span>
                            ) : (
                              <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 font-bold text-[10px] rounded-full border border-emerald-200 uppercase tracking-wider inline-flex items-center gap-1">
                                <CheckCircle className="w-3 h-3" /> In Stock
                              </span>
                            )}
                          </td>

                          {/* Product Status */}
                          <td className="p-3.5 text-center">
                            <span
                              className={`px-2.5 py-1 rounded-full font-bold text-[10px] uppercase ${
                                p.status === "Active"
                                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                  : p.status === "Draft"
                                  ? "bg-amber-50 text-amber-700 border border-amber-200"
                                  : "bg-slate-100 text-slate-600 border border-slate-200"
                              }`}
                            >
                              {p.status}
                            </span>
                          </td>

                          {/* Action Buttons */}
                          <td className="p-3.5 text-right pr-4">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                title="View Product Specs"
                                onClick={() => {
                                  setDetailProduct(p);
                                  setShowDetailModal(true);
                                }}
                                className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>

                              <button
                                title="Update Stock"
                                onClick={() => {
                                  setStockModalProduct(p);
                                  setStockAdjustmentQty(10);
                                  setStockAdjustmentMode("add");
                                  setShowStockModal(true);
                                }}
                                className="p-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg transition-colors"
                              >
                                <Boxes className="w-3.5 h-3.5" />
                              </button>

                              <button
                                title="Update Price"
                                onClick={() => {
                                  setPriceModalProduct(p);
                                  setNewSellingPrice(p.sellingPrice);
                                  setNewDiscountPrice(p.discountPrice || 0);
                                  setShowPriceModal(true);
                                }}
                                className="p-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-lg transition-colors"
                              >
                                <DollarSign className="w-3.5 h-3.5" />
                              </button>

                              <button
                                title="Barcode & QR Code"
                                onClick={() => {
                                  setBarcodeProduct(p);
                                  setShowBarcodeModal(true);
                                }}
                                className="p-1.5 bg-sky-50 hover:bg-sky-100 text-sky-700 rounded-lg transition-colors"
                              >
                                <QrCode className="w-3.5 h-3.5" />
                              </button>

                              <button
                                title="Duplicate Product"
                                onClick={() => handleDuplicateProduct(p)}
                                className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
                              >
                                <Copy className="w-3.5 h-3.5" />
                              </button>

                              {hasPermission("Inventory", "delete") && (
                                <button
                                  title="Delete Product"
                                  onClick={() => {
                                    if (window.confirm(`Delete product ${p.name}?`)) {
                                      deleteProduct(p.id);
                                      addToast(`Deleted ${p.name}`, "warning");
                                    }
                                  }}
                                  className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg transition-colors"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs font-bold text-slate-600">
                <div>
                  Page {currentPage} of {totalPages}
                </div>
                <div className="flex items-center gap-1">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    className="p-2 bg-white border border-slate-200 rounded-xl disabled:opacity-40"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-8 h-8 rounded-xl font-black ${
                        currentPage === page ? "bg-indigo-600 text-white" : "bg-white text-slate-700 border border-slate-200"
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    className="p-2 bg-white border border-slate-200 rounded-xl disabled:opacity-40"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUB-TAB 2: LOW STOCK & REORDER ALERTS */}
      {activeSubTab === "low-stock" && (
        <div className="space-y-4">
          <div className="bg-amber-500/10 border border-amber-500/30 p-5 rounded-3xl flex items-center justify-between gap-4 text-amber-950">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-black">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-black text-lg">Low Stock & Critical Inventory Monitor</h3>
                <p className="text-xs text-amber-800">
                  Items requiring urgent supplier reorders to prevent stockouts and revenue losses.
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                // Reorder all low stock items by adding +50 units
                const lowStockProds = products.filter((p) => p.totalStock <= (p.lowStockThreshold || lowStockThresholdDefault));
                lowStockProds.forEach((p) => {
                  updateProduct(p.id, { totalStock: p.totalStock + 50, isLowStock: false });
                });
                addToast(`Batch reordered +50 units for ${lowStockProds.length} items!`, "success");
              }}
              className="px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs rounded-2xl shadow-md transition-colors"
            >
              Batch Reorder All (+50 Units)
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {products
              .filter((p) => p.totalStock <= (p.lowStockThreshold || lowStockThresholdDefault))
              .map((p) => {
                const isOut = p.totalStock === 0;
                return (
                  <div
                    key={`low-${p.id}`}
                    className={`bg-white p-5 rounded-3xl border shadow-xs space-y-3 ${
                      isOut ? "border-rose-300 bg-rose-50/20" : "border-amber-300 bg-amber-50/20"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <img
                        src={p.mainImage}
                        alt={p.name}
                        className="w-14 h-14 object-contain bg-white border rounded-xl p-1 shadow-xs"
                      />
                      <span
                        className={`px-2.5 py-1 text-[10px] font-black rounded-full uppercase ${
                          isOut ? "bg-rose-100 text-rose-800" : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {isOut ? "CRITICAL OUT OF STOCK" : `LOW STOCK (${p.totalStock} left)`}
                      </span>
                    </div>

                    <div>
                      <h4 className="font-bold text-slate-900 text-sm line-clamp-1">{p.name}</h4>
                      <p className="text-xs text-slate-500 font-mono mt-0.5">
                        SKU: {p.sku} • {p.categoryName}
                      </p>
                    </div>

                    <div className="p-3 bg-white rounded-2xl border border-slate-200 text-xs flex items-center justify-between">
                      <div>
                        <span className="text-slate-500 text-[10px] block">Supplier Vendor</span>
                        <strong className="text-slate-900 font-bold">{p.vendor || "Direct Factory"}</strong>
                      </div>
                      <div className="text-right">
                        <span className="text-slate-500 text-[10px] block">Selling Price</span>
                        <strong className="text-slate-900 font-mono font-black">
                          {settings.currencySymbol}
                          {p.sellingPrice}
                        </strong>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <button
                        onClick={() => {
                          setStockModalProduct(p);
                          setStockAdjustmentQty(50);
                          setStockAdjustmentMode("add");
                          setShowStockModal(true);
                        }}
                        className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-2 rounded-xl transition-colors flex items-center justify-center gap-1.5"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Reorder +50 Stock</span>
                      </button>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* SUB-TAB 3: WAREHOUSES & STOCK TRANSFERS */}
      {activeSubTab === "transfers" && (
        <div className="space-y-6">
          {/* Warehouses Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {warehouses.map((wh) => (
              <div key={wh.id} className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-indigo-600" />
                    <h3 className="font-extrabold text-slate-900 text-sm">{wh.name}</h3>
                  </div>
                  <span className="bg-emerald-50 text-emerald-700 font-bold text-[10px] px-2.5 py-0.5 rounded-full border border-emerald-200">
                    {wh.code}
                  </span>
                </div>

                <div className="text-xs space-y-1 text-slate-600">
                  <p>
                    Location: <strong className="text-slate-900">{wh.address}, {wh.city}</strong>
                  </p>
                  <p>
                    Manager: <strong className="text-slate-900">{wh.managerName}</strong>
                  </p>
                  <div className="flex justify-between items-center pt-2">
                    <span>Capacity Utilized:</span>
                    <strong className="text-slate-900">
                      {wh.currentCapacity} / {wh.totalCapacity} units
                    </strong>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div
                      className="bg-indigo-600 h-full"
                      style={{ width: `${(wh.currentCapacity / wh.totalCapacity) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Movement Log */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="font-extrabold text-slate-900 text-sm border-b border-slate-200 pb-3">
              Stock Movement History & Audit Log
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="p-3">Type</th>
                    <th className="p-3">Product Name & SKU</th>
                    <th className="p-3">Quantity</th>
                    <th className="p-3">From / To Location</th>
                    <th className="p-3">Reason</th>
                    <th className="p-3">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-slate-800">
                  {stockMovements.map((move) => (
                    <tr key={move.id} className="hover:bg-slate-50">
                      <td className="p-3">
                        <span
                          className={`px-2.5 py-1 rounded-full font-black text-[10px] ${
                            move.type === "In"
                              ? "bg-emerald-100 text-emerald-800"
                              : move.type === "Out"
                              ? "bg-rose-100 text-rose-800"
                              : "bg-indigo-100 text-indigo-800"
                          }`}
                        >
                          {move.type}
                        </span>
                      </td>
                      <td className="p-3 font-bold">
                        {move.productName} ({move.sku})
                      </td>
                      <td className="p-3 font-black text-slate-900">{move.quantity} units</td>
                      <td className="p-3 text-slate-600 font-medium">
                        {move.fromWarehouseName || "Vendor Direct"} → {move.toWarehouseName || "Main Retail Store"}
                      </td>
                      <td className="p-3 text-slate-500">{move.reason}</td>
                      <td className="p-3 text-slate-400 font-mono">{move.timestamp}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 4: BARCODE & QR GENERATOR */}
      {activeSubTab === "barcodes" && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 pb-4">
            <div>
              <h3 className="font-black text-lg text-slate-900">Printable Barcode & QR Code Label Studio</h3>
              <p className="text-xs text-slate-500">
                Generate standard Code128 barcodes and QR sticker labels for shelf placement and POS scanning.
              </p>
            </div>
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-2xl shadow-md transition-colors flex items-center gap-1.5"
            >
              <Printer className="w-4 h-4" /> Print Sticker Sheet
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {products.slice(0, 8).map((p) => {
              const bar = getBarcodeNumber(p);
              const doc = getDocumentNumber(p);
              return (
                <div
                  key={`bc-${p.id}`}
                  className="p-4 bg-slate-50 border border-slate-300 rounded-2xl space-y-2 text-center shadow-xs"
                >
                  <p className="text-[11px] font-black text-slate-900 line-clamp-1">{p.name}</p>
                  <p className="text-[10px] font-mono text-slate-500">
                    SKU: {p.sku} | {doc}
                  </p>

                  {/* Simulated Code128 Barcode lines */}
                  <div className="bg-white p-3 rounded-xl border border-slate-200 flex flex-col items-center justify-center gap-1">
                    <div className="flex items-center justify-center gap-0.5 h-10 w-full px-2">
                      {Array.from({ length: 32 }).map((_, i) => (
                        <span
                          key={i}
                          className={`h-full ${i % 3 === 0 ? "w-1 bg-slate-900" : i % 2 === 0 ? "w-0.5 bg-slate-800" : "w-0.5 bg-white"}`}
                        ></span>
                      ))}
                    </div>
                    <span className="text-[10px] font-mono font-bold tracking-widest text-slate-900">{bar}</span>
                  </div>

                  <p className="text-xs font-black text-indigo-900 font-mono">
                    {settings.currencySymbol}
                    {p.sellingPrice}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SUB-TAB 5: INVENTORY REPORTS */}
      {activeSubTab === "reports" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
              <h3 className="font-extrabold text-sm text-slate-900 border-b border-slate-200 pb-3">
                Category Stock Valuation Distribution
              </h3>

              <div className="space-y-3 text-xs">
                {categories.map((c) => {
                  const catProds = products.filter((p) => p.categoryId === c.id);
                  const catVal = catProds.reduce((acc, p) => acc + p.sellingPrice * p.totalStock, 0);
                  const pct = totalInventoryValue ? Math.round((catVal / totalInventoryValue) * 100) : 0;

                  return (
                    <div key={c.id} className="space-y-1">
                      <div className="flex justify-between font-bold text-slate-800">
                        <span>{c.name}</span>
                        <span className="font-mono">
                          {settings.currencySymbol}
                          {catVal.toLocaleString()} ({pct}%)
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div className="bg-indigo-600 h-full" style={{ width: `${pct}%` }}></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
              <h3 className="font-extrabold text-sm text-slate-900 border-b border-slate-200 pb-3">
                Top Value Inventory Items
              </h3>

              <div className="space-y-2 text-xs">
                {[...products]
                  .sort((a, b) => b.sellingPrice * b.totalStock - a.sellingPrice * a.totalStock)
                  .slice(0, 5)
                  .map((p) => (
                    <div key={`top-${p.id}`} className="p-3 bg-slate-50 rounded-2xl flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <img src={p.mainImage} alt={p.name} className="w-8 h-8 rounded-lg object-contain bg-white border p-0.5" />
                        <div>
                          <p className="font-bold text-slate-900 line-clamp-1">{p.name}</p>
                          <p className="text-[10px] text-slate-500 font-mono">Stock: {p.totalStock} units</p>
                        </div>
                      </div>
                      <span className="font-mono font-black text-indigo-900 text-xs">
                        {settings.currencySymbol}
                        {(p.sellingPrice * p.totalStock).toLocaleString()}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STOCK ADJUSTMENT MODAL */}
      {showStockModal && stockModalProduct && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full rounded-3xl p-6 shadow-2xl space-y-4 border border-slate-200 animate-scale-up">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Boxes className="w-5 h-5 text-indigo-600" />
                <h3 className="font-extrabold text-slate-900 text-sm">Update Inventory Stock</h3>
              </div>
              <button onClick={() => setShowStockModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-slate-50 rounded-2xl flex items-center gap-3">
              <img
                src={stockModalProduct.mainImage}
                alt={stockModalProduct.name}
                className="w-12 h-12 object-contain rounded-xl bg-white border p-1"
              />
              <div className="text-xs">
                <p className="font-bold text-slate-900">{stockModalProduct.name}</p>
                <p className="text-slate-500 font-mono">
                  SKU: {stockModalProduct.sku} • Current Stock:{" "}
                  <strong className="text-indigo-600">{stockModalProduct.totalStock} units</strong>
                </p>
              </div>
            </div>

            <form onSubmit={handleStockAdjustmentSubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Adjustment Action</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setStockAdjustmentMode("add")}
                    className={`p-2 rounded-xl font-bold border ${
                      stockAdjustmentMode === "add"
                        ? "bg-emerald-600 text-white border-emerald-600"
                        : "bg-slate-50 text-slate-700 border-slate-200"
                    }`}
                  >
                    + Add Stock
                  </button>
                  <button
                    type="button"
                    onClick={() => setStockAdjustmentMode("subtract")}
                    className={`p-2 rounded-xl font-bold border ${
                      stockAdjustmentMode === "subtract"
                        ? "bg-rose-600 text-white border-rose-600"
                        : "bg-slate-50 text-slate-700 border-slate-200"
                    }`}
                  >
                    - Deduct Stock
                  </button>
                  <button
                    type="button"
                    onClick={() => setStockAdjustmentMode("set")}
                    className={`p-2 rounded-xl font-bold border ${
                      stockAdjustmentMode === "set"
                        ? "bg-indigo-600 text-white border-indigo-600"
                        : "bg-slate-50 text-slate-700 border-slate-200"
                    }`}
                  >
                    Set Fixed
                  </button>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Quantity</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={stockAdjustmentQty}
                  onChange={(e) => setStockAdjustmentQty(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-mono font-black text-sm text-slate-900"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Reason</label>
                <select
                  value={stockReason}
                  onChange={(e) => setStockReason(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold"
                >
                  <option value="Restock">Supplier Restock Shipment</option>
                  <option value="Damaged">Damaged / Expired Goods</option>
                  <option value="Audit Adjustment">Physical Count Audit Correction</option>
                  <option value="Customer Return">Customer Return to Stock</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Notes / Remarks (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. PO #8891 shipment arrived"
                  value={stockNotes}
                  onChange={(e) => setStockNotes(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowStockModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 font-bold"
                >
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold">
                  Save Stock Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PRICE UPDATE MODAL */}
      {showPriceModal && priceModalProduct && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full rounded-3xl p-6 shadow-2xl space-y-4 border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-amber-600" />
                <h3 className="font-extrabold text-slate-900 text-sm">Update Product Pricing</h3>
              </div>
              <button onClick={() => setShowPriceModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs font-bold text-slate-800">{priceModalProduct.name}</p>

            <form onSubmit={handlePriceSubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Selling Price ({settings.currencySymbol})</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  required
                  value={newSellingPrice}
                  onChange={(e) => setNewSellingPrice(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-mono font-bold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Discount Price ({settings.currencySymbol})</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={newDiscountPrice}
                  onChange={(e) => setNewDiscountPrice(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-mono font-bold"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowPriceModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 font-bold"
                >
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold">
                  Save New Price
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PRODUCT DETAILS MODAL */}
      {showDetailModal && detailProduct && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-2xl w-full rounded-3xl p-6 shadow-2xl space-y-5 border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="px-2.5 py-0.5 bg-indigo-100 text-indigo-800 font-mono font-bold text-[10px] rounded-full">
                  {getDocumentNumber(detailProduct)}
                </span>
                <h3 className="font-black text-slate-900 text-base mt-1">{detailProduct.name}</h3>
              </div>
              <button onClick={() => setShowDetailModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <img
                src={detailProduct.mainImage}
                alt={detailProduct.name}
                className="w-full h-40 object-contain rounded-2xl bg-slate-50 border p-2"
              />

              <div className="sm:col-span-2 space-y-2 text-xs">
                <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 rounded-2xl">
                  <div>
                    <span className="text-slate-400 text-[10px] block">SKU</span>
                    <strong className="font-mono text-slate-900">{detailProduct.sku}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">Barcode</span>
                    <strong className="font-mono text-slate-900">{getBarcodeNumber(detailProduct)}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">Category</span>
                    <strong className="text-slate-900">{detailProduct.categoryName}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">Brand</span>
                    <strong className="text-slate-900">{detailProduct.brandName}</strong>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 p-3 bg-indigo-50/50 rounded-2xl">
                  <div>
                    <span className="text-slate-500 text-[10px] block">Selling Price</span>
                    <strong className="font-mono font-black text-indigo-950 text-sm">
                      {settings.currencySymbol}
                      {detailProduct.sellingPrice}
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] block">Current Stock</span>
                    <strong className="font-mono font-black text-emerald-700 text-sm">
                      {detailProduct.totalStock} units
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] block">Status</span>
                    <strong className="text-slate-900 font-bold">{detailProduct.status}</strong>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-2 text-xs text-slate-600">
              <h4 className="font-bold text-slate-900">Description</h4>
              <p className="bg-slate-50 p-3 rounded-2xl leading-relaxed">{detailProduct.description}</p>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <button
                onClick={() => setShowDetailModal(false)}
                className="px-5 py-2 bg-slate-900 text-white font-bold text-xs rounded-xl"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BARCODE STUDIO MODAL */}
      {showBarcodeModal && barcodeProduct && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-sm w-full rounded-3xl p-6 shadow-2xl space-y-4 border border-slate-200 text-center">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="font-black text-slate-900 text-sm">Barcode & QR Label Preview</h3>
              <button onClick={() => setShowBarcodeModal(false)} className="text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-300 rounded-2xl space-y-2">
              <p className="font-black text-xs text-slate-900">{barcodeProduct.name}</p>
              <p className="font-mono text-[10px] text-slate-500">
                SKU: {barcodeProduct.sku} | {getDocumentNumber(barcodeProduct)}
              </p>

              <div className="bg-white p-3 rounded-xl border border-slate-200 flex flex-col items-center gap-1">
                <div className="flex items-center justify-center gap-0.5 h-12 w-full px-2">
                  {Array.from({ length: 36 }).map((_, i) => (
                    <span
                      key={i}
                      className={`h-full ${i % 3 === 0 ? "w-1 bg-slate-900" : i % 2 === 0 ? "w-0.5 bg-slate-800" : "w-0.5 bg-white"}`}
                    ></span>
                  ))}
                </div>
                <span className="text-xs font-mono font-bold text-slate-900">{getBarcodeNumber(barcodeProduct)}</span>
              </div>

              <p className="text-sm font-black text-indigo-900 font-mono">
                {settings.currencySymbol}
                {barcodeProduct.sellingPrice}
              </p>
            </div>

            <button
              onClick={handlePrint}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-2.5 rounded-xl flex items-center justify-center gap-1.5 shadow-md"
            >
              <Printer className="w-4 h-4" />
              <span>Print Sticker Label</span>
            </button>
          </div>
        </div>
      )}

      {/* IMPORT MODAL */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-lg w-full rounded-3xl p-6 shadow-2xl space-y-4 border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Upload className="w-5 h-5 text-indigo-600" />
                <h3 className="font-extrabold text-slate-900 text-sm">Excel / CSV Inventory Import</h3>
              </div>
              <button onClick={() => setShowImportModal(false)} className="text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Bulk upload new product items or update stock quantities. Automatic unique Document Numbers will be generated for all imported records.
            </p>

            <div className="p-6 border-2 border-dashed border-indigo-200 bg-indigo-50/30 rounded-2xl text-center space-y-2">
              <Upload className="w-8 h-8 text-indigo-600 mx-auto" />
              <p className="font-bold text-xs text-slate-800">Drag & Drop Inventory Excel or CSV file here</p>
              <p className="text-[10px] text-slate-500">Supports .xlsx, .csv formats up to 10MB</p>
              <button
                type="button"
                onClick={handleSampleImport}
                className="mt-2 px-4 py-2 bg-indigo-600 text-white font-bold text-xs rounded-xl shadow-xs"
              >
                Run Demo Import (2 Products)
              </button>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button onClick={() => setShowImportModal(false)} className="px-4 py-2 rounded-xl bg-slate-100 font-bold text-xs">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BULK STOCK MODAL */}
      {showBulkStockModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-sm w-full rounded-3xl p-6 shadow-2xl space-y-4 border border-slate-200">
            <h3 className="font-black text-slate-900 text-sm">Bulk Add Stock to {selectedProductIds.length} Items</h3>

            <div>
              <label className="font-bold text-slate-700 block text-xs mb-1">Add Stock Quantity per Product</label>
              <input
                type="number"
                min="1"
                value={bulkStockQty}
                onChange={(e) => setBulkStockQty(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold text-sm"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setShowBulkStockModal(false)} className="px-4 py-2 bg-slate-100 font-bold text-xs rounded-xl">
                Cancel
              </button>
              <button
                onClick={handleBulkStockSubmit}
                className="px-4 py-2 bg-indigo-600 text-white font-bold text-xs rounded-xl shadow-md"
              >
                Apply Bulk Stock
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TRANSFER MODAL */}
      {showTransferModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full rounded-3xl p-6 shadow-2xl space-y-4 border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <ArrowLeftRight className="w-5 h-5 text-indigo-600" />
                <h3 className="font-extrabold text-slate-900 text-sm">Stock Transfer Between Warehouses</h3>
              </div>
              <button onClick={() => setShowTransferModal(false)} className="text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleTransferSubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Select Product SKU</label>
                <select
                  value={transferProductId}
                  onChange={(e) => setTransferProductId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.sku})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">From Warehouse</label>
                  <select
                    value={fromWarehouse}
                    onChange={(e) => setFromWarehouse(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold"
                  >
                    {warehouses.map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">To Warehouse</label>
                  <select
                    value={toWarehouse}
                    onChange={(e) => setToWarehouse(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold"
                  >
                    {warehouses.map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Transfer Quantity</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={transferQty}
                  onChange={(e) => setTransferQty(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Transfer Reason</label>
                <input
                  type="text"
                  value={transferReason}
                  onChange={(e) => setTransferReason(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowTransferModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 font-bold"
                >
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold">
                  Execute Transfer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {activePrintData && (
        <EnterprisePrintModal
          data={activePrintData}
          isOpen={isPrintModalOpen}
          onClose={() => setIsPrintModalOpen(false)}
        />
      )}
    </div>
  );
};

