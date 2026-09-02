import React, { useState, useMemo } from "react";
import { useStore } from "../../context/StoreContext";
import { Warehouse, Product } from "../../types";
import { PrintableDocumentData } from "../../types/print";
import { buildReportPrintData } from "../../utils/printDocumentBuilder";
import { EnterprisePrintModal } from "../common/EnterprisePrintModal";
import { exportToCSV, exportToExcel, exportToPDFReport, parseExcelOrCSVFile } from "../../utils/exportUtils";
import {
  ArrowLeftRight,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Search,
  Filter,
  Download,
  Upload,
  Printer,
  Plus,
  Edit,
  Trash2,
  Eye,
  Check,
  X,
  Building2,
  Package,
  Calendar,
  FileSpreadsheet,
  FileText,
  User,
  History,
  Paperclip,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  Sparkles,
  Layers,
  BarChart3,
  RefreshCw,
} from "lucide-react";

export interface WarehouseMovementItem {
  id: string;
  referenceNumber: string;
  productId: string;
  productName: string;
  productImage: string;
  sku: string;
  categoryName: string;
  sourceWarehouseId: string;
  sourceWarehouseName: string;
  destinationWarehouseId: string;
  destinationWarehouseName: string;
  movementType: "Transfer" | "Incoming Stock" | "Outgoing Stock" | "Adjustment" | "Return Movement";
  quantity: number;
  status: "Pending" | "In Transit" | "Completed" | "Cancelled" | "Rejected";
  createdBy: string;
  approvedBy?: string;
  movementDate: string;
  lastUpdated: string;
  notes?: string;
  attachments?: string[];
  approvalHistory?: {
    status: string;
    actionBy: string;
    timestamp: string;
    comment: string;
  }[];
  timeline?: {
    title: string;
    description: string;
    timestamp: string;
    user: string;
    status: string;
  }[];
}

const initialWarehouseMovements: WarehouseMovementItem[] = [
  {
    id: "WM-2026-001",
    referenceNumber: "TRF-DH-CTG-901",
    productId: "p-1",
    productName: "iPhone 15 Pro Max 256GB - Natural Titanium",
    productImage: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=300&q=80",
    sku: "APL-IP15PM-256-NT",
    categoryName: "Smartphones",
    sourceWarehouseId: "wh-1",
    sourceWarehouseName: "Central Hub Warehouse (Dhaka)",
    destinationWarehouseId: "wh-2",
    destinationWarehouseName: "Chittagong Port Regional Depot",
    movementType: "Transfer",
    quantity: 25,
    status: "In Transit",
    createdBy: "Inventory Officer - Tanvir",
    approvedBy: "Manager - Rakib",
    movementDate: "2026-07-24 09:30",
    lastUpdated: "2026-07-24 10:15",
    notes: "High priority restock for Chittagong Flagship showroom.",
    attachments: ["Dispatch_manifest_901.pdf"],
    approvalHistory: [
      { status: "Submitted", actionBy: "Tanvir", timestamp: "2026-07-24 09:30", comment: "Request created." },
      { status: "Approved", actionBy: "Rakib", timestamp: "2026-07-24 10:15", comment: "Approved for transit." },
    ],
    timeline: [
      { title: "Created", description: "Movement entry logged in ERP.", timestamp: "2026-07-24 09:30", user: "Tanvir", status: "Submitted" },
      { title: "Approved & Packed", description: "Verified stock & attached tamper seals.", timestamp: "2026-07-24 10:15", user: "Rakib", status: "In Transit" },
    ],
  },
  {
    id: "WM-2026-002",
    referenceNumber: "PO-REC-2026-88",
    productId: "p-2",
    productName: "MacBook Air M3 15-inch 16GB / 512GB",
    productImage: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=300&q=80",
    sku: "APL-MBA-M3-15-512",
    categoryName: "Laptops & Computers",
    sourceWarehouseId: "wh-vendor",
    sourceWarehouseName: "Apple Official Vendor Distribution",
    destinationWarehouseId: "wh-1",
    destinationWarehouseName: "Central Hub Warehouse (Dhaka)",
    movementType: "Incoming Stock",
    quantity: 50,
    status: "Completed",
    createdBy: "Procurement Lead - Farhana",
    approvedBy: "Super Admin",
    movementDate: "2026-07-23 14:20",
    lastUpdated: "2026-07-23 16:40",
    notes: "Direct shipment from Singapore port consignment batch #42.",
    approvalHistory: [
      { status: "Submitted", actionBy: "Farhana", timestamp: "2026-07-23 14:20", comment: "Consignment received." },
      { status: "Completed", actionBy: "Super Admin", timestamp: "2026-07-23 16:40", comment: "Quality check passed. Stock added." },
    ],
    timeline: [
      { title: "Received at Gate", description: "Truck unloaded & barcodes scanned.", timestamp: "2026-07-23 14:20", user: "Farhana", status: "Incoming" },
      { title: "QC Completed", description: "All 50 units in pristine condition.", timestamp: "2026-07-23 16:40", user: "Warehouse Staff", status: "Completed" },
    ],
  },
  {
    id: "WM-2026-003",
    referenceNumber: "ADJ-SYL-004",
    productId: "p-3",
    productName: "Sony WH-1000XM5 Wireless Headphones",
    productImage: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&q=80",
    sku: "SNY-WH1000XM5-BLK",
    categoryName: "Audio",
    sourceWarehouseId: "wh-3",
    sourceWarehouseName: "Sylhet Logistics Facility",
    destinationWarehouseId: "wh-3",
    destinationWarehouseName: "Sylhet Logistics Facility",
    movementType: "Adjustment",
    quantity: 2,
    status: "Completed",
    createdBy: "Sylhet Audit Specialist",
    approvedBy: "Manager - Rakib",
    movementDate: "2026-07-22 11:00",
    lastUpdated: "2026-07-22 11:30",
    notes: "Display demo units damaged during showroom floor rearrangement.",
    approvalHistory: [
      { status: "Approved", actionBy: "Rakib", timestamp: "2026-07-22 11:30", comment: "Scrapped to damaged goods category." },
    ],
    timeline: [
      { title: "Audited", description: "Audit logged damage.", timestamp: "2026-07-22 11:00", user: "Audit Specialist", status: "Adjustment" },
    ],
  },
  {
    id: "WM-2026-004",
    referenceNumber: "TRF-CTG-DH-102",
    productId: "p-4",
    productName: "Samsung Galaxy Watch 6 Classic 47mm",
    productImage: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&q=80",
    sku: "SAM-GW6C-47-SLV",
    categoryName: "Wearables",
    sourceWarehouseId: "wh-2",
    sourceWarehouseName: "Chittagong Port Regional Depot",
    destinationWarehouseId: "wh-1",
    destinationWarehouseName: "Central Hub Warehouse (Dhaka)",
    movementType: "Transfer",
    quantity: 15,
    status: "Pending",
    createdBy: "Chittagong Supervisor",
    movementDate: "2026-07-24 11:45",
    lastUpdated: "2026-07-24 11:45",
    notes: "Inter-city rebalancing for overstock mitigation.",
    approvalHistory: [
      { status: "Pending", actionBy: "Chittagong Supervisor", timestamp: "2026-07-24 11:45", comment: "Awaiting approval." },
    ],
    timeline: [
      { title: "Draft Transfer", description: "Submitted for regional manager review.", timestamp: "2026-07-24 11:45", user: "Supervisor", status: "Pending" },
    ],
  },
  {
    id: "WM-2026-005",
    referenceNumber: "RTN-CUST-409",
    productId: "p-5",
    productName: "Anker MagGo Magnetic Wireless Power Bank",
    productImage: "https://images.unsplash.com/photo-1609592424074-121650b8655c?w=300&q=80",
    sku: "ANK-MAGGO-10K",
    categoryName: "Accessories",
    sourceWarehouseId: "wh-customer",
    sourceWarehouseName: "Customer Return Courier",
    destinationWarehouseId: "wh-1",
    destinationWarehouseName: "Central Hub Warehouse (Dhaka)",
    movementType: "Return Movement",
    quantity: 1,
    status: "Completed",
    createdBy: "Support Executive",
    approvedBy: "QC Manager",
    movementDate: "2026-07-21 16:10",
    lastUpdated: "2026-07-21 17:00",
    notes: "Customer exchange item returned to central quarantine bin.",
    approvalHistory: [
      { status: "Approved", actionBy: "QC Manager", timestamp: "2026-07-21 17:00", comment: "Passed intake inspection." },
    ],
    timeline: [
      { title: "Received Return", description: "Courier item scanned at intake desk.", timestamp: "2026-07-21 16:10", user: "Intake Officer", status: "Completed" },
    ],
  },
];

export const WarehouseMovementManagement: React.FC = () => {
  const { warehouses, products, categories, addToast, addAuditLog, hasPermission, settings } = useStore();

  const [movements, setMovements] = useState<WarehouseMovementItem[]>(initialWarehouseMovements);

  const [activePrintData, setActivePrintData] = useState<PrintableDocumentData | null>(null);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState<boolean>(false);

  const openPrintModal = (data: PrintableDocumentData) => {
    setActivePrintData(data);
    setIsPrintModalOpen(true);
  };

  // Filters State
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedWarehouse, setSelectedWarehouse] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [dateRange, setDateRange] = useState("all");
  const [sortColumn, setSortColumn] = useState<keyof WarehouseMovementItem>("movementDate");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  // Selection & Bulk Actions
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Modals
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [activeMovement, setActiveMovement] = useState<WarehouseMovementItem | null>(null);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingMovement, setEditingMovement] = useState<WarehouseMovementItem | null>(null);

  // Form Fields
  const [formProductId, setFormProductId] = useState("");
  const [formSourceWh, setFormSourceWh] = useState("");
  const [formDestWh, setFormDestWh] = useState("");
  const [formType, setFormType] = useState<WarehouseMovementItem["movementType"]>("Transfer");
  const [formQty, setFormQty] = useState(10);
  const [formNotes, setFormNotes] = useState("");

  // Filtered & Sorted Movements
  const filteredMovements = useMemo(() => {
    return movements.filter((m) => {
      // Search
      if (
        searchTerm &&
        !m.id.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !m.referenceNumber.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !m.productName.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !m.sku.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !m.createdBy.toLowerCase().includes(searchTerm.toLowerCase())
      ) {
        return false;
      }

      // Warehouse
      if (
        selectedWarehouse !== "all" &&
        m.sourceWarehouseId !== selectedWarehouse &&
        m.destinationWarehouseId !== selectedWarehouse
      ) {
        return false;
      }

      // Type
      if (selectedType !== "all" && m.movementType !== selectedType) return false;

      // Status
      if (selectedStatus !== "all" && m.status !== selectedStatus) return false;

      // Category
      if (selectedCategory !== "all" && m.categoryName !== selectedCategory) return false;

      return true;
    }).sort((a, b) => {
      const valA = a[sortColumn] ?? "";
      const valB = b[sortColumn] ?? "";
      if (valA < valB) return sortDirection === "asc" ? -1 : 1;
      if (valA > valB) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
  }, [movements, searchTerm, selectedWarehouse, selectedType, selectedStatus, selectedCategory, sortColumn, sortDirection]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredMovements.length / itemsPerPage) || 1;
  const paginatedMovements = filteredMovements.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Dashboard Summary Metrics
  const stats = useMemo(() => {
    const total = movements.length;
    const incoming = movements.filter((m) => m.movementType === "Incoming Stock").reduce((acc, m) => acc + m.quantity, 0);
    const outgoing = movements.filter((m) => m.movementType === "Outgoing Stock" || m.movementType === "Transfer").reduce((acc, m) => acc + m.quantity, 0);
    const pending = movements.filter((m) => m.status === "Pending" || m.status === "In Transit").length;
    const completed = movements.filter((m) => m.status === "Completed").length;
    const cancelled = movements.filter((m) => m.status === "Cancelled" || m.status === "Rejected").length;
    const todayCount = movements.filter((m) => m.movementDate.startsWith("2026-07-24")).length;

    return { total, incoming, outgoing, pending, completed, cancelled, todayCount };
  }, [movements]);

  // Bulk Handlers
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(paginatedMovements.map((m) => m.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  };

  const handleBulkApprove = () => {
    setMovements((prev) =>
      prev.map((m) => (selectedIds.includes(m.id) ? { ...m, status: "Completed", approvedBy: "Admin", lastUpdated: "2026-07-24 12:00" } : m))
    );
    addToast(`Approved ${selectedIds.length} warehouse transfers.`, "success");
    addAuditLog("Inventory", "Edit", `Bulk approved movements: ${selectedIds.join(", ")}`);
    setSelectedIds([]);
  };

  const handleBulkCancel = () => {
    setMovements((prev) =>
      prev.map((m) => (selectedIds.includes(m.id) ? { ...m, status: "Cancelled", lastUpdated: "2026-07-24 12:00" } : m))
    );
    addToast(`Cancelled ${selectedIds.length} warehouse transfers.`, "info");
    setSelectedIds([]);
  };

  const handleSort = (col: keyof WarehouseMovementItem) => {
    if (sortColumn === col) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortColumn(col);
      setSortDirection("asc");
    }
  };

  // Status Badge Helper
  const getStatusBadge = (status: WarehouseMovementItem["status"]) => {
    switch (status) {
      case "Completed":
        return <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 font-bold text-[10px] rounded-full border border-emerald-200 flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-emerald-600" /> Completed</span>;
      case "In Transit":
        return <span className="px-2.5 py-1 bg-sky-100 text-sky-800 font-bold text-[10px] rounded-full border border-sky-200 flex items-center gap-1"><Clock className="w-3 h-3 text-sky-600" /> In Transit</span>;
      case "Pending":
        return <span className="px-2.5 py-1 bg-amber-100 text-amber-800 font-bold text-[10px] rounded-full border border-amber-200 flex items-center gap-1 font-mono"><AlertTriangle className="w-3 h-3 text-amber-600" /> Pending</span>;
      case "Rejected":
      case "Cancelled":
        return <span className="px-2.5 py-1 bg-rose-100 text-rose-800 font-bold text-[10px] rounded-full border border-rose-200 flex items-center gap-1"><XCircle className="w-3 h-3 text-rose-600" /> {status}</span>;
      default:
        return <span className="px-2 py-1 bg-slate-100 text-slate-700 font-bold text-[10px] rounded-full">{status}</span>;
    }
  };

  // Export handlers
  const handleExportCSV = () => {
    const exportData = filteredMovements.map((m) => ({
      ID: m.id,
      Ref: m.referenceNumber,
      Product: m.productName,
      SKU: m.sku,
      Source: m.sourceWarehouseName,
      Destination: m.destinationWarehouseName,
      Type: m.movementType,
      Quantity: m.quantity,
      Status: m.status,
      CreatedBy: m.createdBy,
      ApprovedBy: m.approvedBy || "N/A",
      Date: m.movementDate,
    }));
    exportToCSV(`warehouse_movements_${new Date().toISOString().split("T")[0]}.csv`, exportData);
    addToast("Exported Warehouse Movement records to CSV", "success");
  };

  const handleExportPDF = () => {
    const exportData = filteredMovements.map((m) => ({
      ID: m.id,
      Ref: m.referenceNumber,
      Product: m.productName,
      SKU: m.sku,
      Type: m.movementType,
      Qty: m.quantity,
      Status: m.status,
      Date: m.movementDate,
    }));
    exportToPDFReport("Warehouse Movement Audit Report", exportData);
    addToast("Generated PDF Movement Audit Log", "success");
  };

  const handleSaveMovement = (e: React.FormEvent) => {
    e.preventDefault();
    const selProd = products.find((p) => p.id === formProductId) || products[0];
    const srcWhObj = warehouses.find((w) => w.id === formSourceWh) || warehouses[0];
    const destWhObj = warehouses.find((w) => w.id === formDestWh) || warehouses[1] || warehouses[0];

    const newObj: WarehouseMovementItem = {
      id: editingMovement ? editingMovement.id : `WM-2026-00${movements.length + 1}`,
      referenceNumber: editingMovement ? editingMovement.referenceNumber : `TRF-${srcWhObj?.code || "WH"}-${destWhObj?.code || "WH"}-${Math.floor(Math.random() * 900 + 100)}`,
      productId: selProd?.id || "p-1",
      productName: selProd?.name || "Official Electronics Item",
      productImage: selProd?.mainImage || "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=300&q=80",
      sku: selProd?.sku || "SKU-PROD-001",
      categoryName: selProd?.categoryName || "Electronics",
      sourceWarehouseId: srcWhObj?.id || "wh-1",
      sourceWarehouseName: srcWhObj?.name || "Main Warehouse",
      destinationWarehouseId: destWhObj?.id || "wh-2",
      destinationWarehouseName: destWhObj?.name || "Regional Depot",
      movementType: formType,
      quantity: Number(formQty),
      status: "Pending",
      createdBy: "Admin User",
      movementDate: new Date().toISOString().replace("T", " ").substring(0, 16),
      lastUpdated: new Date().toISOString().replace("T", " ").substring(0, 16),
      notes: formNotes,
      timeline: [
        { title: "Created", description: "Movement entry registered.", timestamp: new Date().toISOString().substring(0, 16), user: "Admin", status: "Pending" }
      ]
    };

    if (editingMovement) {
      setMovements((prev) => prev.map((m) => (m.id === editingMovement.id ? newObj : m)));
      addToast(`Updated movement record ${newObj.id}`, "success");
    } else {
      setMovements((prev) => [newObj, ...prev]);
      addToast(`Logged new warehouse movement ${newObj.id}`, "success");
      addAuditLog("Inventory", "Add", `Created stock transfer ${newObj.id}`);
    }

    setShowCreateModal(false);
    setEditingMovement(null);
  };

  return (
    <div className="space-y-6 text-left">
      {/* 1. Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <span>Admin Panel</span>
            <span>/</span>
            <span>Inventory</span>
            <span>/</span>
            <span className="font-bold text-slate-900">Warehouse Movement</span>
          </div>
          <h1 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <ArrowLeftRight className="w-6 h-6 text-indigo-600" />
            Warehouse Movement & Stock Transfer Hub
          </h1>
          <p className="text-xs text-slate-500">
            Enterprise-level tracking for inter-city transfers, incoming vendor consignments, and audit logs.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => {
              setEditingMovement(null);
              setFormProductId(products[0]?.id || "");
              setFormSourceWh(warehouses[0]?.id || "");
              setFormDestWh(warehouses[1]?.id || "");
              setFormQty(10);
              setFormNotes("");
              setShowCreateModal(true);
            }}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-2xl shadow-md transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Create Stock Movement</span>
          </button>
        </div>
      </div>

      {/* 2. Dashboard Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total Movements</p>
          <p className="text-xl font-black text-slate-900">{stats.total}</p>
          <span className="text-[10px] text-indigo-600 font-semibold flex items-center gap-0.5">
            <BarChart3 className="w-3 h-3" /> All time logs
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Incoming Stock</p>
          <p className="text-xl font-black text-emerald-600">+{stats.incoming}</p>
          <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-0.5">
            <TrendingUp className="w-3 h-3" /> Units received
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Outgoing Stock</p>
          <p className="text-xl font-black text-sky-600">-{stats.outgoing}</p>
          <span className="text-[10px] text-sky-600 font-semibold flex items-center gap-0.5">
            <TrendingDown className="w-3 h-3" /> Units dispatched
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Pending Transfers</p>
          <p className="text-xl font-black text-amber-600">{stats.pending}</p>
          <span className="text-[10px] text-amber-600 font-semibold flex items-center gap-0.5">
            <Clock className="w-3 h-3" /> In queue / transit
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Completed</p>
          <p className="text-xl font-black text-emerald-700">{stats.completed}</p>
          <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-0.5">
            <CheckCircle2 className="w-3 h-3" /> Verified in bin
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Cancelled / Rejected</p>
          <p className="text-xl font-black text-rose-600">{stats.cancelled}</p>
          <span className="text-[10px] text-rose-600 font-semibold flex items-center gap-0.5">
            <XCircle className="w-3 h-3" /> Voided requests
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1 col-span-2 sm:col-span-1">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Today's Transfers</p>
          <p className="text-xl font-black text-indigo-900">{stats.todayCount}</p>
          <span className="text-[10px] text-indigo-600 font-semibold flex items-center gap-0.5">
            <Calendar className="w-3 h-3" /> Active batch
          </span>
        </div>
      </div>

      {/* 3. Search, Filters & Export Controls */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by Movement ID, Ref Number, SKU, Product or Officer Name..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600">
                Clear
              </button>
            )}
          </div>

          {/* Action Tools */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all flex items-center gap-1.5"
              title="Export to CSV"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" /> Export CSV
            </button>

            <button
              onClick={handleExportPDF}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all flex items-center gap-1.5"
              title="Export to PDF"
            >
              <FileText className="w-4 h-4 text-rose-600" /> Export PDF
            </button>

            <button
              onClick={() => {
                const headers = ["Ref #", "Product", "SKU", "Type", "Source", "Destination", "Qty", "Status", "Date"];
                const rawRows = filteredMovements.map((m) => [
                  m.referenceNumber,
                  m.productName,
                  m.sku,
                  m.movementType,
                  m.sourceWarehouseName,
                  m.destinationWarehouseName,
                  m.quantity,
                  m.status,
                  m.movementDate,
                ]);
                openPrintModal(buildReportPrintData("WAREHOUSE MOVEMENT & TRANSFER LOG", headers, rawRows, "warehouse_movement"));
              }}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all flex items-center gap-1.5"
              title="Print Summary"
            >
              <Printer className="w-4 h-4 text-slate-600" /> Print
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-3 border-t border-slate-100 text-xs">
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Warehouse</label>
            <select
              value={selectedWarehouse}
              onChange={(e) => setSelectedWarehouse(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 font-medium text-slate-800"
            >
              <option value="all">All Warehouses</option>
              {warehouses.map((wh) => (
                <option key={wh.id} value={wh.id}>
                  {wh.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Movement Type</label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 font-medium text-slate-800"
            >
              <option value="all">All Types</option>
              <option value="Transfer">Transfer</option>
              <option value="Incoming Stock">Incoming Stock</option>
              <option value="Outgoing Stock">Outgoing Stock</option>
              <option value="Adjustment">Adjustment</option>
              <option value="Return Movement">Return Movement</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Status</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 font-medium text-slate-800"
            >
              <option value="all">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="In Transit">In Transit</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 font-medium text-slate-800"
            >
              <option value="all">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.name}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Sort By</label>
            <select
              value={sortColumn}
              onChange={(e) => setSortColumn(e.target.value as any)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 font-medium text-slate-800"
            >
              <option value="movementDate">Date (Latest)</option>
              <option value="quantity">Quantity</option>
              <option value="productName">Product Name</option>
              <option value="status">Status</option>
            </select>
          </div>
        </div>
      </div>

      {/* 4. Bulk Action Bar */}
      {selectedIds.length > 0 && (
        <div className="bg-indigo-950 text-white p-4 rounded-2xl shadow-xl flex items-center justify-between animate-in fade-in duration-200">
          <div className="flex items-center gap-3 text-xs font-bold">
            <span className="w-6 h-6 bg-amber-400 text-slate-950 rounded-full flex items-center justify-center text-[10px] font-black">
              {selectedIds.length}
            </span>
            <span>Items Selected for Bulk Warehouse Action</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleBulkApprove}
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1"
            >
              <Check className="w-3.5 h-3.5" /> Approve Selected
            </button>
            <button
              onClick={handleBulkCancel}
              className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1"
            >
              <X className="w-3.5 h-3.5" /> Cancel Selected
            </button>
            <button
              onClick={() => setSelectedIds([])}
              className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-xl"
            >
              Deselect All
            </button>
          </div>
        </div>
      )}

      {/* 5. Responsive Data Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-bold uppercase tracking-wider">
              <tr>
                <th className="p-3.5 text-center w-10">
                  <input
                    type="checkbox"
                    onChange={handleSelectAll}
                    checked={paginatedMovements.length > 0 && selectedIds.length === paginatedMovements.length}
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                </th>
                <th className="p-3.5 cursor-pointer hover:text-slate-900" onClick={() => handleSort("id")}>
                  <div className="flex items-center gap-1">Movement ID & Ref <ArrowUpDown className="w-3 h-3 text-slate-400" /></div>
                </th>
                <th className="p-3.5 cursor-pointer hover:text-slate-900" onClick={() => handleSort("productName")}>
                  <div className="flex items-center gap-1">Product & SKU <ArrowUpDown className="w-3 h-3 text-slate-400" /></div>
                </th>
                <th className="p-3.5">Source → Destination</th>
                <th className="p-3.5">Type</th>
                <th className="p-3.5 text-right cursor-pointer hover:text-slate-900" onClick={() => handleSort("quantity")}>
                  <div className="flex items-center justify-end gap-1">Qty <ArrowUpDown className="w-3 h-3 text-slate-400" /></div>
                </th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5">Logged By</th>
                <th className="p-3.5 cursor-pointer hover:text-slate-900" onClick={() => handleSort("movementDate")}>
                  <div className="flex items-center gap-1">Date <ArrowUpDown className="w-3 h-3 text-slate-400" /></div>
                </th>
                <th className="p-3.5 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-slate-800">
              {paginatedMovements.length === 0 ? (
                <tr>
                  <td colSpan={10} className="p-8 text-center text-slate-500">
                    <div className="max-w-xs mx-auto space-y-2">
                      <ArrowLeftRight className="w-10 h-10 text-slate-300 mx-auto" />
                      <p className="font-bold text-slate-800">No Warehouse Movements Found</p>
                      <p className="text-xs text-slate-400">Try adjusting your search criteria or warehouse filters.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedMovements.map((move) => {
                  const isSelected = selectedIds.includes(move.id);
                  return (
                    <tr key={move.id} className={`hover:bg-slate-50/80 transition-colors ${isSelected ? "bg-indigo-50/40" : ""}`}>
                      <td className="p-3.5 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelect(move.id)}
                          className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                        />
                      </td>

                      <td className="p-3.5">
                        <p className="font-mono font-black text-indigo-900">{move.id}</p>
                        <p className="font-mono text-[10px] text-slate-500">{move.referenceNumber}</p>
                      </td>

                      <td className="p-3.5">
                        <div className="flex items-center gap-2.5">
                          <img src={move.productImage} alt={move.productName} className="w-9 h-9 rounded-xl object-cover bg-slate-100 border p-0.5 shrink-0" />
                          <div>
                            <p className="font-bold text-slate-900 line-clamp-1 max-w-[180px]">{move.productName}</p>
                            <p className="font-mono text-[10px] text-slate-500">SKU: {move.sku}</p>
                          </div>
                        </div>
                      </td>

                      <td className="p-3.5">
                        <div className="text-[11px] space-y-0.5 max-w-[200px]">
                          <p className="text-slate-600 font-medium truncate" title={move.sourceWarehouseName}>
                            <span className="text-slate-400">From:</span> {move.sourceWarehouseName}
                          </p>
                          <p className="text-slate-900 font-bold truncate" title={move.destinationWarehouseName}>
                            <span className="text-slate-400">To:</span> {move.destinationWarehouseName}
                          </p>
                        </div>
                      </td>

                      <td className="p-3.5">
                        <span className="font-bold text-[11px] text-slate-700 bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-200">
                          {move.movementType}
                        </span>
                      </td>

                      <td className="p-3.5 text-right font-mono font-black text-slate-900">
                        {move.quantity} units
                      </td>

                      <td className="p-3.5">{getStatusBadge(move.status)}</td>

                      <td className="p-3.5">
                        <p className="font-bold text-slate-800">{move.createdBy}</p>
                        {move.approvedBy && <p className="text-[10px] text-slate-400">Appr: {move.approvedBy}</p>}
                      </td>

                      <td className="p-3.5 font-mono text-[11px] text-slate-500">{move.movementDate}</td>

                      <td className="p-3.5 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => {
                              setActiveMovement(move);
                              setShowDetailModal(true);
                            }}
                            className="p-1.5 hover:bg-indigo-50 text-indigo-600 rounded-lg transition-colors"
                            title="View Movement Timeline & Slip"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {move.status === "Pending" && (
                            <button
                              onClick={() => {
                                setMovements((prev) =>
                                  prev.map((m) =>
                                    m.id === move.id ? { ...m, status: "Completed", approvedBy: "Admin User", lastUpdated: "2026-07-24 12:00" } : m
                                  )
                                );
                                addToast(`Approved transfer ${move.id}`, "success");
                              }}
                              className="p-1.5 hover:bg-emerald-50 text-emerald-600 rounded-lg transition-colors"
                              title="Approve Transfer"
                            >
                              <Check className="w-4 h-4" />
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

        {/* 6. Pagination Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
          <div>
            Showing <strong className="text-slate-900">{paginatedMovements.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}</strong> to{" "}
            <strong className="text-slate-900">{Math.min(currentPage * itemsPerPage, filteredMovements.length)}</strong> of{" "}
            <strong className="text-slate-900">{filteredMovements.length}</strong> movement records
          </div>

          <div className="flex items-center gap-1.5">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="p-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-100 disabled:opacity-40 transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 font-bold font-mono">
              Page {currentPage} of {totalPages}
            </span>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="p-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-100 disabled:opacity-40 transition-all"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* MODAL 1: Movement Detail View / Timeline & Print Slip */}
      {showDetailModal && activeMovement && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-2xl w-full rounded-3xl shadow-2xl border border-slate-100 overflow-hidden text-left space-y-5 p-6 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-indigo-600 block">Movement Voucher Details</span>
                <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <span>{activeMovement.id}</span>
                  {getStatusBadge(activeMovement.status)}
                </h2>
              </div>
              <button onClick={() => setShowDetailModal(false)} className="p-2 hover:bg-slate-100 rounded-full text-slate-500">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Product Summary */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex items-center gap-4">
              <img src={activeMovement.productImage} alt={activeMovement.productName} className="w-14 h-14 object-cover rounded-xl border bg-white p-0.5" />
              <div className="space-y-0.5">
                <h3 className="font-extrabold text-slate-900 text-sm">{activeMovement.productName}</h3>
                <p className="text-xs text-slate-500 font-mono">SKU: {activeMovement.sku} | Category: {activeMovement.categoryName}</p>
                <p className="text-xs font-black text-indigo-900 font-mono">Transfer Quantity: {activeMovement.quantity} units</p>
              </div>
            </div>

            {/* Warehouse Route */}
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Source Warehouse</span>
                <p className="font-extrabold text-slate-900">{activeMovement.sourceWarehouseName}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Destination Warehouse</span>
                <p className="font-extrabold text-slate-900">{activeMovement.destinationWarehouseName}</p>
              </div>
            </div>

            {/* Timeline */}
            <div className="space-y-2">
              <h4 className="font-black text-xs text-slate-900 uppercase tracking-wider">Audit History & Timeline</h4>
              <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs">
                {activeMovement.timeline?.map((tl, i) => (
                  <div key={i} className="flex gap-3">
                    <div className="w-2 h-2 rounded-full bg-indigo-600 mt-1.5 shrink-0" />
                    <div>
                      <p className="font-bold text-slate-900">{tl.title} — <span className="text-slate-500 font-normal">{tl.description}</span></p>
                      <p className="text-[10px] text-slate-400 font-mono">By {tl.user} at {tl.timestamp}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions Footer */}
            <div className="pt-2 flex items-center justify-between border-t border-slate-100">
              <button
                onClick={() => {
                  if (activeMovement) {
                    openPrintModal({
                      documentType: "warehouse_transfer",
                      documentTitle: "WAREHOUSE TRANSFER & DISPATCH SLIP",
                      documentNumber: activeMovement.referenceNumber || activeMovement.id,
                      status: activeMovement.status,
                      generatedDate: new Date().toLocaleDateString(),
                      generatedTime: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                      generatedBy: activeMovement.createdBy,

                      supplierInfo: {
                        name: activeMovement.sourceWarehouseName,
                        company: "Source Warehouse",
                        contactPerson: "Dispatcher Officer",
                        email: "dispatch@smartecom.com",
                        phone: "+880 1700-000000",
                      },

                      shippingInfo: {
                        recipientName: activeMovement.destinationWarehouseName,
                        phone: "+880 1800-000000",
                        address: activeMovement.destinationWarehouseName,
                        courierName: "Internal Logistics Fleet",
                      },

                      items: [
                        {
                          id: activeMovement.productId,
                          name: activeMovement.productName,
                          sku: activeMovement.sku,
                          quantity: activeMovement.quantity,
                          unitPrice: 0,
                          total: 0,
                          notes: activeMovement.notes,
                        },
                      ],

                      notes: `Approved By: ${activeMovement.approvedBy}. Movement Type: ${activeMovement.movementType}`,
                      signaturesNeeded: ["Prepared By", "Received By", "Approved By"],
                    });
                  }
                }}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl flex items-center gap-1.5"
              >
                <Printer className="w-4 h-4" /> Print Movement Slip
              </button>
              <button
                onClick={() => setShowDetailModal(false)}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md"
              >
                Done
              </button>
            </div>

          </div>
        </div>
      )}

      {/* MODAL 2: Create Stock Movement */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-lg w-full rounded-3xl shadow-2xl border border-slate-100 overflow-hidden text-left space-y-5 p-6 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h2 className="text-lg font-black text-slate-900">Log New Stock Movement</h2>
              <button onClick={() => setShowCreateModal(false)} className="p-2 hover:bg-slate-100 rounded-full text-slate-500">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveMovement} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Select Product</label>
                <select
                  value={formProductId}
                  onChange={(e) => setFormProductId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-medium text-slate-900"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} (SKU: {p.sku}) — Stock: {p.totalStock}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Source Warehouse</label>
                  <select
                    value={formSourceWh}
                    onChange={(e) => setFormSourceWh(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-medium text-slate-900"
                  >
                    {warehouses.map((wh) => (
                      <option key={wh.id} value={wh.id}>
                        {wh.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Destination Warehouse</label>
                  <select
                    value={formDestWh}
                    onChange={(e) => setFormDestWh(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-medium text-slate-900"
                  >
                    {warehouses.map((wh) => (
                      <option key={wh.id} value={wh.id}>
                        {wh.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Movement Type</label>
                  <select
                    value={formType}
                    onChange={(e) => setFormType(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-medium text-slate-900"
                  >
                    <option value="Transfer">Transfer</option>
                    <option value="Incoming Stock">Incoming Stock</option>
                    <option value="Outgoing Stock">Outgoing Stock</option>
                    <option value="Adjustment">Adjustment</option>
                    <option value="Return Movement">Return Movement</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Quantity (Units)</label>
                  <input
                    type="number"
                    min="1"
                    value={formQty}
                    onChange={(e) => setFormQty(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-mono font-bold text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Audit Notes / Reason</label>
                <textarea
                  rows={3}
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="State reason for movement or consignment reference number..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md">
                  Submit Movement Request
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

