import React, { useState, useMemo } from "react";
import { useStore } from "../../context/StoreContext";
import { Product, ProductVariant } from "../../types";
import { downloadSampleBulkUploadTemplate, exportToCSV, exportToExcel, parseExcelOrCSVFile } from "../../utils/exportUtils";
import Papa from "papaparse";
import { ProductImageSuggestions } from "./ProductImageSuggestions";
import { ProductImageEditorModal } from "./ProductImageEditorModal";
import {
  Package,
  Plus,
  Upload,
  Download,
  Search,
  Filter,
  Edit2,
  Trash2,
  AlertCircle,
  CheckCircle,
  FileSpreadsheet,
  X,
  Layers,
  Sparkles,
  Wand2,
  Eye,
  EyeOff,
  History,
  Tag,
  ChevronLeft,
  ChevronRight,
  CheckSquare,
  Square,
  AlertTriangle,
  DollarSign,
  Check,
  TrendingUp,
  Image as ImageIcon,
  Video,
  ListFilter,
  RefreshCw,
} from "lucide-react";

export const ProductManagement: React.FC = () => {
  const {
    products,
    categories,
    brands,
    addProduct,
    updateProduct,
    deleteProduct,
    bulkAddProducts,
    bulkUpdateProductStatus,
    bulkDeleteProducts,
    executeInventoryTransaction,
    inventoryTransactions,
    hasPermission,
    settings,
    addToast,
    recordAuditLog,
    currentUser,
  } = useStore();

  // Filters, Search, Sort & Pagination State
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");
  const [filterBrand, setFilterBrand] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [sortBy, setSortBy] = useState<"name-asc" | "name-desc" | "price-asc" | "price-desc" | "stock-asc" | "stock-desc" | "newest">("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Bulk Selection State
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);

  // Single Product Modal State
  const [showProductModal, setShowProductModal] = useState(false);
  const [activeTab, setActiveTab] = useState<"basic" | "pricing" | "stock" | "media" | "variants">("basic");
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form Fields
  const [formName, setFormName] = useState("");
  const [formSku, setFormSku] = useState("");
  const [formBarcode, setFormBarcode] = useState("");
  const [formCategory, setFormCategory] = useState("");
  const [formSubCategory, setFormSubCategory] = useState("");
  const [formBrand, setFormBrand] = useState("");
  const [formVendor, setFormVendor] = useState("Official Store");
  const [formShortDesc, setFormShortDesc] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formWarranty, setFormWarranty] = useState("1 Year Official Warranty");
  const [formTags, setFormTags] = useState("Smart, Electronics, Top Seller");
  const [formStatus, setFormStatus] = useState<"Active" | "Draft" | "Inactive">("Active");

  // Pricing
  const [formCostPrice, setFormCostPrice] = useState(1000);
  const [formPurchasePrice, setFormPurchasePrice] = useState(1200);
  const [formSellingPrice, setFormSellingPrice] = useState(1500);
  const [formDiscountType, setFormDiscountType] = useState<"Percentage" | "Fixed">("Fixed");
  const [formDiscountValue, setFormDiscountValue] = useState(100);
  const [formDiscountPrice, setFormDiscountPrice] = useState(1400);
  const [formDiscountStartDate, setFormDiscountStartDate] = useState("");
  const [formDiscountEndDate, setFormDiscountEndDate] = useState("");

  // Stock
  const [formTotalStock, setFormTotalStock] = useState(25);
  const [formLowStockThreshold, setFormLowStockThreshold] = useState(5);

  // Media
  const [formMainImage, setFormMainImage] = useState("https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80");
  const [formGalleryImages, setFormGalleryImages] = useState<string[]>([]);
  const [newGalleryUrl, setNewGalleryUrl] = useState("");
  const [formVideoUrl, setFormVideoUrl] = useState("");

  // Product Image Background Editor & Studio Modal State
  const [showImageEditorModal, setShowImageEditorModal] = useState(false);
  const [imageEditorInitial, setImageEditorInitial] = useState("");
  const [imageEditorIndex, setImageEditorIndex] = useState<number>(-1);

  const handleOpenImageEditor = (imageUrl: string, index: number = -1) => {
    if (!imageUrl || imageUrl.trim().length === 0) {
      addToast("Please upload or provide an image first to edit its background.", "error");
      return;
    }
    setImageEditorInitial(imageUrl);
    setImageEditorIndex(index);
    setShowImageEditorModal(true);
  };

  const handleApplyImageEditorResult = (
    editedImageUrl: string,
    targetIndex: number = -1,
    addToGallery: boolean = false
  ) => {
    if (addToGallery) {
      setFormGalleryImages((prev) => [...prev, editedImageUrl]);
      addToast("New background version appended to gallery!", "success");
      return;
    }

    if (targetIndex === -1) {
      setFormMainImage(editedImageUrl);
      addToast("Primary cover image updated with new background!", "success");
    } else if (targetIndex >= 0 && targetIndex < formGalleryImages.length) {
      const next = [...formGalleryImages];
      next[targetIndex] = editedImageUrl;
      setFormGalleryImages(next);
      addToast("Gallery image background updated successfully!", "success");
    }
  };

  // Variants
  const [formColors, setFormColors] = useState("Black, White, Blue");
  const [formSizes, setFormSizes] = useState("128GB, 256GB");
  const [customVariants, setCustomVariants] = useState<ProductVariant[]>([]);

  // Deletion Confirmation Modal
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);

  // Quick Stock Adjustment Modal
  const [stockAdjustProduct, setStockAdjustProduct] = useState<Product | null>(null);
  const [adjustQty, setAdjustQty] = useState(10);
  const [adjustType, setAdjustType] = useState<"Stock In" | "Stock Out" | "Adjustment">("Stock In");
  const [adjustReason, setAdjustReason] = useState("Regular inventory refill");

  // Stock History Log Modal
  const [historyProduct, setHistoryProduct] = useState<Product | null>(null);

  // Bulk Upload Modal State
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkFile, setBulkFile] = useState<File | null>(null);
  const [validating, setValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<{
    totalProcessed: number;
    validCount: number;
    errorCount: number;
    errors: Array<{ rowNumber: number; sku: string; error: string }>;
    validRows: any[];
  } | null>(null);

  // Filtered Subcategories based on selected parent category
  const availableSubCategories = useMemo(() => {
    if (!formCategory) return [];
    return categories.filter((c) => c.parentId === formCategory);
  }, [categories, formCategory]);

  // Derived metrics calculations
  const metrics = useMemo(() => {
    const total = products.length;
    const active = products.filter((p) => p.status === "Active").length;
    const lowStock = products.filter((p) => p.totalStock > 0 && p.totalStock <= (p.lowStockThreshold || 5)).length;
    const outOfStock = products.filter((p) => p.totalStock <= 0).length;
    const totalValuation = products.reduce((acc, p) => acc + p.sellingPrice * p.totalStock, 0);

    return { total, active, lowStock, outOfStock, totalValuation };
  }, [products]);

  // Reset Form
  const resetForm = () => {
    setEditingId(null);
    setActiveTab("basic");
    setFormName("");
    setFormSku(`SKU-${Date.now().toString().slice(-6)}`);
    setFormBarcode(`880${Math.floor(100000000 + Math.random() * 900000000)}`);
    setFormCategory(categories[0]?.id || "");
    setFormSubCategory("");
    setFormBrand(brands[0]?.id || "");
    setFormVendor("Official Brand Store");
    setFormShortDesc("High-performance premium product with official brand warranty.");
    setFormDesc("Engineered for durability, modern aesthetics, and ultimate user experience.");
    setFormWarranty("1 Year Warranty");
    setFormTags("Smart, Gadget, Bestseller");
    setFormStatus("Active");

    setFormCostPrice(8000);
    setFormPurchasePrice(9000);
    setFormSellingPrice(12000);
    setFormDiscountType("Fixed");
    setFormDiscountValue(1000);
    setFormDiscountPrice(11000);
    setFormDiscountStartDate("");
    setFormDiscountEndDate("");

    setFormTotalStock(30);
    setFormLowStockThreshold(5);

    setFormMainImage("https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80");
    setFormGalleryImages([]);
    setNewGalleryUrl("");
    setFormVideoUrl("");

    setFormColors("Black, White, Blue");
    setFormSizes("128GB, 256GB");
    setCustomVariants([]);
  };

  const handleOpenCreateModal = () => {
    resetForm();
    setShowProductModal(true);
  };

  const handleEditProduct = (prod: Product) => {
    setEditingId(prod.id);
    setActiveTab("basic");
    setFormName(prod.name);
    setFormSku(prod.sku);
    setFormBarcode(prod.barcode);
    setFormCategory(prod.categoryId);
    setFormSubCategory(prod.subCategoryId || "");
    setFormBrand(prod.brandId);
    setFormVendor(prod.vendor || "Official Brand Store");
    setFormShortDesc(prod.shortDescription || "");
    setFormDesc(prod.description || "");
    setFormWarranty(prod.warranty || "1 Year Warranty");
    setFormTags(prod.tags ? prod.tags.join(", ") : "Smart, Top Seller");
    setFormStatus(prod.status as any);

    setFormCostPrice(prod.costPrice);
    setFormPurchasePrice(prod.purchasePrice);
    setFormSellingPrice(prod.sellingPrice);
    setFormDiscountPrice(prod.discountPrice);
    setFormDiscountType(prod.discountType || "Fixed");
    setFormDiscountValue(prod.discountValue || 0);
    setFormDiscountStartDate(prod.discountStartDate || "");
    setFormDiscountEndDate(prod.discountEndDate || "");

    setFormTotalStock(prod.totalStock);
    setFormLowStockThreshold(prod.lowStockThreshold || 5);

    setFormMainImage(prod.mainImage);
    setFormGalleryImages(prod.galleryImages || []);
    setFormVideoUrl(prod.videoUrl || "");

    setFormColors(prod.colors ? prod.colors.join(", ") : "");
    setFormSizes(prod.sizes ? prod.sizes.join(", ") : "");
    setCustomVariants(prod.variants || []);

    setShowProductModal(true);
  };

  // Upload Main Image from Computer
  const handleUploadMainImageFromFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      addToast("Please select a valid image file (PNG, JPG, WEBP, etc.)", "warning");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setFormMainImage(e.target.result as string);
        addToast(`Uploaded '${file.name}' as primary product image`, "success");
      }
    };
    reader.readAsDataURL(file);
  };

  // Upload Multiple Gallery Images from Computer
  const handleUploadGalleryImagesFromFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const validFiles = Array.from(files).filter((f) => f.type.startsWith("image/"));
    if (validFiles.length === 0) {
      addToast("Please select valid image files", "warning");
      return;
    }

    let loadedCount = 0;
    const newImages: string[] = [];

    validFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          newImages.push(e.target.result as string);
        }
        loadedCount++;
        if (loadedCount === validFiles.length) {
          setFormGalleryImages((prev) => [...prev, ...newImages]);
          addToast(`Added ${newImages.length} image(s) to product gallery`, "success");
        }
      };
      reader.readAsDataURL(file);
    });
  };

  // Generate variants grid from colors and sizes
  const handleGenerateVariants = () => {
    const colorsArr = formColors.split(",").map((s) => s.trim()).filter(Boolean);
    const sizesArr = formSizes.split(",").map((s) => s.trim()).filter(Boolean);

    if (colorsArr.length === 0 && sizesArr.length === 0) {
      addToast("Please enter at least one Color or Size to generate variants.", "warning");
      return;
    }

    const cList = colorsArr.length > 0 ? colorsArr : ["Standard"];
    const sList = sizesArr.length > 0 ? sizesArr : ["Standard"];

    const generated: ProductVariant[] = [];
    cList.forEach((c) => {
      sList.forEach((s) => {
        generated.push({
          id: `var-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          color: c,
          size: s,
          sku: `${formSku || "SKU"}-${c.substring(0, 3).toUpperCase()}-${s}`,
          barcode: `${formBarcode || "BAR"}-${Math.floor(100 + Math.random() * 900)}`,
          price: formSellingPrice,
          discountPrice: formDiscountPrice,
          stock: Math.floor(formTotalStock / (cList.length * sList.length)) || 5,
          warehouseStock: { "wh-1": Math.floor(formTotalStock / 2) },
          image: formMainImage,
        });
      });
    });

    setCustomVariants(generated);
    addToast(`Generated ${generated.length} product variants`, "success");
  };

  // Save Product Form
  const handleSaveProductForm = (e: React.FormEvent) => {
    e.preventDefault();

    // Business Rules Validations
    if (!formName.trim()) {
      addToast("Product Name is required.", "error");
      return;
    }

    if (!formSku.trim()) {
      addToast("Product SKU is required.", "error");
      return;
    }

    // Check SKU Uniqueness (excluding current editing product)
    const duplicateSku = products.find((p) => p.sku.toLowerCase() === formSku.trim().toLowerCase() && p.id !== editingId);
    if (duplicateSku) {
      addToast(`SKU '${formSku}' is already assigned to another product.`, "error");
      return;
    }

    if (formSellingPrice <= 0) {
      addToast("Selling Price must be greater than 0.", "error");
      return;
    }

    if (formDiscountPrice > formSellingPrice) {
      addToast("Discount Price cannot exceed Selling Price.", "error");
      return;
    }

    if (formTotalStock < 0) {
      addToast("Stock quantity cannot be negative.", "error");
      return;
    }

    const catObj = categories.find((c) => c.id === formCategory) || categories[0];
    const subCatObj = categories.find((c) => c.id === formSubCategory);
    const brandObj = brands.find((b) => b.id === formBrand) || brands[0];

    const tagsArr = formTags.split(",").map((t) => t.trim()).filter(Boolean);
    const colorsArr = formColors.split(",").map((s) => s.trim()).filter(Boolean);
    const sizesArr = formSizes.split(",").map((s) => s.trim()).filter(Boolean);

    const payload = {
      name: formName.trim(),
      sku: formSku.trim(),
      barcode: formBarcode.trim(),
      categoryId: catObj?.id || "cat-1",
      categoryName: catObj?.name || "General",
      subCategoryId: subCatObj?.id,
      subCategoryName: subCatObj?.name,
      brandId: brandObj?.id || "brand-1",
      brandName: brandObj?.name || "Generic",
      vendor: formVendor,
      shortDescription: formShortDesc,
      description: formDesc,
      specifications: { Warranty: formWarranty, Brand: brandObj?.name || "Standard" },
      warranty: formWarranty,
      tags: tagsArr,

      costPrice: formCostPrice,
      purchasePrice: formPurchasePrice,
      sellingPrice: formSellingPrice,
      discountPrice: formDiscountPrice,
      discountType: formDiscountType,
      discountValue: formDiscountValue,
      discountStartDate: formDiscountStartDate,
      discountEndDate: formDiscountEndDate,
      taxPercent: 5,
      vatPercent: 7.5,

      mainImage: formMainImage || "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80",
      galleryImages: formGalleryImages,
      videoUrl: formVideoUrl,

      colors: colorsArr,
      sizes: sizesArr,
      weight: "0.5 KG",
      variants: customVariants,

      totalStock: formTotalStock,
      lowStockThreshold: formLowStockThreshold,
      isLowStock: formTotalStock <= formLowStockThreshold,
      status: formStatus,
    };

    if (editingId) {
      updateProduct(editingId, payload);
      recordAuditLog(`Updated Product details for '${formName}'`, "Product", "", JSON.stringify(payload));
    } else {
      addProduct(payload);
      recordAuditLog(`Created new Product '${formName}'`, "Product", "", JSON.stringify(payload));
    }

    setShowProductModal(false);
  };

  // Toggle Single Product Active Status
  const handleToggleStatus = (p: Product) => {
    const nextStatus = p.status === "Active" ? "Inactive" : "Active";
    updateProduct(p.id, { status: nextStatus });
    recordAuditLog(`Toggled status for Product '${p.name}'`, "Product", p.status, nextStatus);
    addToast(`Product '${p.name}' is now ${nextStatus}`, "info");
  };

  // Single Delete Trigger
  const handleConfirmSingleDelete = () => {
    if (!deletingProduct) return;
    deleteProduct(deletingProduct.id);
    recordAuditLog(`Deleted Product '${deletingProduct.name}' (SKU: ${deletingProduct.sku})`, "Product", deletingProduct.name, "Deleted");
    setDeletingProduct(null);
  };

  // Bulk Actions
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedProductIds(paginatedProducts.map((p) => p.id));
    } else {
      setSelectedProductIds([]);
    }
  };

  const handleSelectRow = (id: string) => {
    setSelectedProductIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleBulkActivate = () => {
    if (selectedProductIds.length === 0) return;
    bulkUpdateProductStatus(selectedProductIds, "Active");
    setSelectedProductIds([]);
  };

  const handleBulkDeactivate = () => {
    if (selectedProductIds.length === 0) return;
    bulkUpdateProductStatus(selectedProductIds, "Inactive");
    setSelectedProductIds([]);
  };

  const handleConfirmBulkDelete = () => {
    if (selectedProductIds.length === 0) return;
    bulkDeleteProducts(selectedProductIds);
    setSelectedProductIds([]);
    setShowBulkDeleteConfirm(false);
  };

  const handleExportSelectedCSV = () => {
    const targets = selectedProductIds.length > 0
      ? products.filter((p) => selectedProductIds.includes(p.id))
      : products;

    const exportRows = targets.map((p) => ({
      ID: p.id,
      Name: p.name,
      SKU: p.sku,
      Barcode: p.barcode,
      Category: p.categoryName,
      Subcategory: p.subCategoryName || "N/A",
      Brand: p.brandName,
      "Selling Price": p.sellingPrice,
      "Discount Price": p.discountPrice,
      Stock: p.totalStock,
      Status: p.status,
      "Created At": p.createdAt,
    }));

    exportToCSV(`product_catalog_export_${Date.now()}`, exportRows);
    addToast(`Exported ${exportRows.length} products to CSV`, "success");
  };

  const handleExportSelectedExcel = () => {
    const targets = selectedProductIds.length > 0
      ? products.filter((p) => selectedProductIds.includes(p.id))
      : products;

    const exportRows = targets.map((p) => ({
      ID: p.id,
      "Product Name": p.name,
      SKU: p.sku,
      Barcode: p.barcode,
      Category: p.categoryName,
      Subcategory: p.subCategoryName || "N/A",
      Brand: p.brandName,
      "Selling Price": p.sellingPrice,
      "Discount Price": p.discountPrice,
      Stock: p.totalStock,
      Status: p.status,
      "Created At": p.createdAt,
    }));

    exportToExcel(`product_catalog_export_${Date.now()}.xlsx`, "Products", exportRows);
    addToast(`Exported ${exportRows.length} products to Excel (.xlsx)`, "success");
  };

  // Execute Quick Stock Adjust
  const handleExecuteStockAdjust = (e: React.FormEvent) => {
    e.preventDefault();
    if (!stockAdjustProduct) return;

    if (adjustQty <= 0) {
      addToast("Quantity must be greater than 0.", "error");
      return;
    }

    executeInventoryTransaction({
      productId: stockAdjustProduct.id,
      productName: stockAdjustProduct.name,
      sku: stockAdjustProduct.sku,
      type: adjustType,
      quantity: adjustQty,
      reason: adjustReason,
    });

    setStockAdjustProduct(null);
  };

  // Bulk File Upload & Excel/CSV Validation
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBulkFile(file);
    setValidating(true);

    try {
      const rows = await parseExcelOrCSVFile(file);
      const existingSkus = products.map((p) => p.sku.toLowerCase());

      const errors: Array<{ rowNumber: number; sku: string; error: string }> = [];
      const validRows: any[] = [];

      rows.forEach((row: any, idx: number) => {
        const rowNum = idx + 1;
        const name = row["Product Name"] || row["Name"] || row["name"];
        const sku = String(row["SKU"] || row["sku"] || "").trim();
        const price = parseFloat(row["Price"] || row["Selling Price"] || row["price"]);
        const stock = parseInt(row["Stock"] || row["totalStock"] || row["stock"]);

        if (!name) {
          errors.push({ rowNumber: rowNum, sku: sku || "N/A", error: "Missing Product Name" });
          return;
        }
        if (!sku) {
          errors.push({ rowNumber: rowNum, sku: "N/A", error: "Missing SKU" });
          return;
        }
        if (existingSkus.includes(sku.toLowerCase())) {
          errors.push({ rowNumber: rowNum, sku, error: "Duplicate SKU already exists in store" });
          return;
        }
        if (isNaN(price) || price <= 0) {
          errors.push({ rowNumber: rowNum, sku, error: "Invalid Price (Must be > 0)" });
          return;
        }
        if (isNaN(stock) || stock < 0) {
          errors.push({ rowNumber: rowNum, sku, error: "Invalid Stock (Cannot be negative)" });
          return;
        }

        validRows.push(row);
      });

      setValidationResult({
        totalProcessed: rows.length,
        validCount: validRows.length,
        errorCount: errors.length,
        errors,
        validRows,
      });
    } catch (err: any) {
      addToast(`Failed to parse file: ${err.message || err}`, "error");
    } finally {
      setValidating(false);
    }
  };

  const handleConfirmBulkImport = () => {
    if (!validationResult || validationResult.validRows.length === 0) return;

    const defaultCat = categories[0] || { id: "cat-1", name: "General" };
    const defaultBrand = brands[0] || { id: "brand-1", name: "Generic" };

    const importedProds: Product[] = validationResult.validRows.map((row, idx) => {
      const name = row["Product Name"] || row["Name"] || "Imported Product";
      const sku = (row["SKU"] || row["sku"] || `SKU-BULK-${idx}`).trim();
      const barcode = row["Barcode"] || `880${Math.floor(100000000 + Math.random() * 900000000)}`;
      const price = parseFloat(row["Price"] || row["Selling Price"]) || 1000;
      const discount = parseFloat(row["DiscountPrice"] || row["Discount Price"]) || price;
      const stock = parseInt(row["Stock"] || row["totalStock"]) || 10;

      return {
        id: `prod-bulk-${Date.now()}-${idx}`,
        name,
        sku,
        barcode,
        categoryId: defaultCat.id,
        categoryName: row["Category"] || defaultCat.name,
        brandId: defaultBrand.id,
        brandName: row["Brand"] || defaultBrand.name,
        vendor: row["Vendor"] || "Bulk Import Vendor",
        shortDescription: row["Description"] || "Imported catalog item",
        description: row["Description"] || "Imported catalog item",
        specifications: { Warranty: "1 Year Standard Warranty" },
        warranty: "1 Year Warranty",
        tags: ["Bulk Imported"],

        costPrice: price * 0.7,
        purchasePrice: price * 0.8,
        sellingPrice: price,
        discountPrice: discount,
        taxPercent: 5,
        vatPercent: 7.5,

        mainImage: row["Images URL"] || "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80",
        galleryImages: [],
        videoUrl: "",

        colors: row["Color"] ? [row["Color"]] : ["Standard"],
        sizes: row["Size"] ? [row["Size"]] : ["Standard"],
        weight: "0.5 KG",
        variants: [],

        totalStock: stock,
        lowStockThreshold: 5,
        isLowStock: stock <= 5,
        status: (row["Status"] === "Inactive" || row["Status"] === "Draft" ? row["Status"] : "Active") as any,
        rating: 5.0,
        reviewsCount: 0,
        createdAt: new Date().toISOString().split("T")[0],
      };
    });

    bulkAddProducts(importedProds);
    setShowBulkModal(false);
    setValidationResult(null);
    setBulkFile(null);
  };

  // Filtered & Sorted Products List Calculation
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // Search
      if (search.trim()) {
        const q = search.toLowerCase().trim();
        const matchName = p.name.toLowerCase().includes(q);
        const matchSku = p.sku.toLowerCase().includes(q);
        const matchBarcode = p.barcode.toLowerCase().includes(q);
        const matchBrand = p.brandName.toLowerCase().includes(q);
        const matchCat = p.categoryName.toLowerCase().includes(q);
        const matchTag = p.tags?.some((t) => t.toLowerCase().includes(q));

        if (!matchName && !matchSku && !matchBarcode && !matchBrand && !matchCat && !matchTag) {
          return false;
        }
      }

      // Category
      if (filterCategory !== "All" && p.categoryName !== filterCategory && p.categoryId !== filterCategory) {
        return false;
      }

      // Brand
      if (filterBrand !== "All" && p.brandName !== filterBrand && p.brandId !== filterBrand) {
        return false;
      }

      // Status
      if (filterStatus !== "All") {
        if (filterStatus === "Out of Stock") {
          if (p.totalStock > 0) return false;
        } else if (filterStatus === "Low Stock") {
          if (p.totalStock <= 0 || p.totalStock > (p.lowStockThreshold || 5)) return false;
        } else if (p.status !== filterStatus) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === "name-asc") return a.name.localeCompare(b.name);
      if (sortBy === "name-desc") return b.name.localeCompare(a.name);
      if (sortBy === "price-asc") return a.sellingPrice - b.sellingPrice;
      if (sortBy === "price-desc") return b.sellingPrice - a.sellingPrice;
      if (sortBy === "stock-asc") return a.totalStock - b.totalStock;
      if (sortBy === "stock-desc") return b.totalStock - a.totalStock;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [products, search, filterCategory, filterBrand, filterStatus, sortBy]);

  // Pagination Math
  const totalPages = Math.ceil(filteredProducts.length / pageSize) || 1;
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredProducts.slice(start, start + pageSize);
  }, [filteredProducts, currentPage, pageSize]);

  return (
    <div className="space-y-6 pb-20">
      {/* Header Banner & Management Actions */}
      <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-md border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Package className="w-6 h-6 text-indigo-400" />
            <h1 className="text-2xl font-black tracking-tight">Enterprise Product Management</h1>
          </div>
          <p className="text-xs text-slate-300 mt-1">
            Manage multi-variant product catalog, pricing, SKUs, inventory thresholds & bulk imports
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {hasPermission("Product", "export") && (
            <>
              <button
                onClick={handleExportSelectedExcel}
                className="bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold px-3 py-2 rounded-xl border border-slate-700 flex items-center gap-1.5 transition-colors"
                title="Export Catalog to Excel (.xlsx)"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-400" /> Export Excel
              </button>
              <button
                onClick={handleExportSelectedCSV}
                className="bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold px-3 py-2 rounded-xl border border-slate-700 flex items-center gap-1.5 transition-colors"
                title="Export Catalog to CSV"
              >
                <Download className="w-4 h-4 text-sky-400" /> Export CSV
              </button>
            </>
          )}

          {hasPermission("Product", "import") && (
            <button
              onClick={() => setShowBulkModal(true)}
              className="bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl border border-slate-700 flex items-center gap-1.5 transition-colors"
            >
              <Upload className="w-4 h-4 text-indigo-400" /> Bulk Upload (Excel/CSV)
            </button>
          )}

          {hasPermission("Product", "add") && (
            <button
              onClick={handleOpenCreateModal}
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-md transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" /> Add Single Product
            </button>
          )}
        </div>
      </div>

      {/* Metric Cards Summary Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Total Catalog</span>
          <div className="text-xl font-black text-slate-900">{metrics.total} Items</div>
          <span className="text-[10px] text-slate-400 font-medium">All registered SKUs</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider block">Active Products</span>
          <div className="text-xl font-black text-emerald-700">{metrics.active} Published</div>
          <span className="text-[10px] text-emerald-600/80 font-medium">Visible on Customer Site</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-[11px] font-bold text-amber-600 uppercase tracking-wider block">Low Stock Alerts</span>
          <div className="text-xl font-black text-amber-600">{metrics.lowStock} SKUs</div>
          <span className="text-[10px] text-amber-700/80 font-medium">Under minimum threshold</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-[11px] font-bold text-rose-600 uppercase tracking-wider block">Out of Stock</span>
          <div className="text-xl font-black text-rose-600">{metrics.outOfStock} SKUs</div>
          <span className="text-[10px] text-rose-700/80 font-medium">0 inventory remaining</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1 col-span-2 sm:col-span-1">
          <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider block">Total Inventory Valuation</span>
          <div className="text-xl font-black text-indigo-900">{settings.currencySymbol}{metrics.totalValuation.toLocaleString()}</div>
          <span className="text-[10px] text-slate-400 font-medium">Estimated store retail value</span>
        </div>
      </div>

      {/* Search, Filter, Sort & Bulk Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 text-xs">
          {/* Search Box */}
          <div className="md:col-span-4 relative">
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search Name, SKU, Barcode, Brand, Tag..."
              className="w-full bg-slate-50 text-slate-900 text-xs pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          </div>

          {/* Category Filter */}
          <div className="md:col-span-2">
            <select
              value={filterCategory}
              onChange={(e) => {
                setFilterCategory(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 font-bold text-slate-800"
            >
              <option value="All">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.name}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Brand Filter */}
          <div className="md:col-span-2">
            <select
              value={filterBrand}
              onChange={(e) => {
                setFilterBrand(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 font-bold text-slate-800"
            >
              <option value="All">All Brands</option>
              {brands.map((b) => (
                <option key={b.id} value={b.name}>{b.name}</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="md:col-span-2">
            <select
              value={filterStatus}
              onChange={(e) => {
                setFilterStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 font-bold text-slate-800"
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active Only</option>
              <option value="Draft">Draft Only</option>
              <option value="Inactive">Inactive Only</option>
              <option value="Low Stock">Low Stock Alert</option>
              <option value="Out of Stock">Out of Stock</option>
            </select>
          </div>

          {/* Sort By */}
          <div className="md:col-span-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 font-bold text-slate-800"
            >
              <option value="newest">Sort: Newest First</option>
              <option value="name-asc">Sort: Name (A-Z)</option>
              <option value="price-asc">Sort: Price (Low to High)</option>
              <option value="price-desc">Sort: Price (High to Low)</option>
              <option value="stock-asc">Sort: Stock (Low to High)</option>
              <option value="stock-desc">Sort: Stock (High to Low)</option>
            </select>
          </div>
        </div>

        {/* Bulk Action Controls Banner (Active when rows are selected) */}
        {selectedProductIds.length > 0 && (
          <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 text-xs animate-fadeIn">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-indigo-900 bg-indigo-200 px-2.5 py-1 rounded-lg">
                {selectedProductIds.length} Selected
              </span>
              <span className="text-indigo-700 font-medium">Bulk Action Operations:</span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleBulkActivate}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 shadow-xs"
              >
                <CheckCircle className="w-3.5 h-3.5" /> Bulk Activate
              </button>

              <button
                onClick={handleBulkDeactivate}
                className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 shadow-xs"
              >
                <EyeOff className="w-3.5 h-3.5" /> Bulk Deactivate
              </button>

              <button
                onClick={() => setShowBulkDeleteConfirm(true)}
                className="bg-rose-600 hover:bg-rose-700 text-white font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 shadow-xs"
              >
                <Trash2 className="w-3.5 h-3.5" /> Bulk Delete
              </button>

              <button
                onClick={() => setSelectedProductIds([])}
                className="text-slate-500 hover:text-slate-800 font-bold px-2 py-1"
              >
                Clear Selection
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Main Product Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-bold uppercase tracking-wider">
              <tr>
                <th className="p-3 w-10 text-center">
                  <input
                    type="checkbox"
                    onChange={handleSelectAll}
                    checked={
                      paginatedProducts.length > 0 &&
                      paginatedProducts.every((p) => selectedProductIds.includes(p.id))
                    }
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                  />
                </th>
                <th className="p-3">Product Info</th>
                <th className="p-3">SKU / Barcode</th>
                <th className="p-3">Category & Brand</th>
                <th className="p-3">Prices</th>
                <th className="p-3">Stock & Status</th>
                <th className="p-3 text-center">Visibility</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-slate-800">
              {paginatedProducts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-12 text-center text-slate-400 space-y-2">
                    <Package className="w-10 h-10 mx-auto text-slate-300" />
                    <p className="font-bold text-slate-600">No products match your filter criteria.</p>
                    <button
                      onClick={() => {
                        setSearch("");
                        setFilterCategory("All");
                        setFilterBrand("All");
                        setFilterStatus("All");
                      }}
                      className="text-indigo-600 hover:underline font-bold text-xs"
                    >
                      Clear Filters
                    </button>
                  </td>
                </tr>
              ) : (
                paginatedProducts.map((p) => {
                  const isSelected = selectedProductIds.includes(p.id);
                  const isLowStock = p.totalStock > 0 && p.totalStock <= (p.lowStockThreshold || 5);
                  const isOutOfStock = p.totalStock <= 0;

                  return (
                    <tr
                      key={p.id}
                      className={`hover:bg-slate-50 transition-colors ${isSelected ? "bg-indigo-50/40" : ""}`}
                    >
                      <td className="p-3 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleSelectRow(p.id)}
                          className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                        />
                      </td>

                      <td className="p-3 flex items-center gap-3">
                        <img
                          src={p.mainImage}
                          alt={p.name}
                          className="w-11 h-11 object-contain bg-slate-50 p-1 border border-slate-200 rounded-xl shrink-0"
                        />
                        <div className="min-w-0">
                          <span className="font-bold text-slate-900 block line-clamp-1 text-xs">
                            {p.name}
                          </span>
                          <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                            <span className="text-[10px] text-slate-400 font-medium">
                              {p.variants?.length || 0} Variants
                            </span>
                            {p.tags?.slice(0, 2).map((tag, idx) => (
                              <span
                                key={idx}
                                className="bg-slate-100 text-slate-600 text-[9px] font-semibold px-1.5 py-0.2 rounded"
                              >
                                #{tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      </td>

                      <td className="p-3 font-mono font-semibold">
                        <div className="text-slate-900">{p.sku}</div>
                        <div className="text-[10px] text-slate-400">{p.barcode}</div>
                      </td>

                      <td className="p-3 font-medium">
                        <div className="text-slate-900 font-bold">{p.categoryName}</div>
                        <div className="text-[10px] text-slate-400">Brand: {p.brandName}</div>
                      </td>

                      <td className="p-3">
                        <div className="font-black text-slate-900">
                          {settings.currencySymbol}{(p.discountPrice || p.sellingPrice).toLocaleString()}
                        </div>
                        {p.discountPrice && p.discountPrice < p.sellingPrice && (
                          <div className="text-[10px] text-slate-400 line-through">
                            {settings.currencySymbol}{p.sellingPrice.toLocaleString()}
                          </div>
                        )}
                        <div className="text-[10px] text-slate-400">Cost: {settings.currencySymbol}{p.costPrice}</div>
                      </td>

                      <td className="p-3">
                        {isOutOfStock ? (
                          <span className="bg-rose-50 text-rose-700 border border-rose-200 font-black px-2.5 py-1 rounded-full text-[10px] inline-flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" /> Out of Stock
                          </span>
                        ) : isLowStock ? (
                          <span className="bg-amber-50 text-amber-800 border border-amber-200 font-bold px-2.5 py-1 rounded-full text-[10px] inline-flex items-center gap-1">
                            <AlertCircle className="w-3 h-3 text-amber-600" /> Low ({p.totalStock})
                          </span>
                        ) : (
                          <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold px-2.5 py-1 rounded-full text-[10px] inline-flex items-center gap-1">
                            <CheckCircle className="w-3 h-3 text-emerald-600" /> {p.totalStock} Units
                          </span>
                        )}
                      </td>

                      <td className="p-3 text-center">
                        <button
                          onClick={() => handleToggleStatus(p)}
                          className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase border transition-all ${
                            p.status === "Active"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100"
                              : p.status === "Draft"
                              ? "bg-amber-50 text-amber-700 border-amber-300 hover:bg-amber-100"
                              : "bg-slate-100 text-slate-600 border-slate-300 hover:bg-slate-200"
                          }`}
                        >
                          {p.status}
                        </button>
                      </td>

                      <td className="p-3 text-right space-x-1.5">
                        <button
                          onClick={() => setStockAdjustProduct(p)}
                          className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          title="Quick Stock Adjust"
                        >
                          <TrendingUp className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => setHistoryProduct(p)}
                          className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                          title="Stock Movement Log"
                        >
                          <History className="w-4 h-4" />
                        </button>

                        {hasPermission("Product", "edit") && (
                          <button
                            onClick={() => handleEditProduct(p)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit Product"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        )}

                        {hasPermission("Product", "delete") && (
                          <button
                            onClick={() => setDeletingProduct(p)}
                            className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Delete Product"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="bg-slate-50 p-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-500 font-medium">
            <span>
              Showing {filteredProducts.length === 0 ? 0 : (currentPage - 1) * pageSize + 1} to{" "}
              {Math.min(currentPage * pageSize, filteredProducts.length)} of {filteredProducts.length} entries
            </span>
            <span className="text-slate-300">|</span>
            <span>Per page:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="bg-white border border-slate-200 rounded-lg px-2 py-1 font-bold"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="p-1.5 bg-white border border-slate-200 rounded-lg disabled:opacity-40 hover:bg-slate-100 font-bold"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .slice(Math.max(0, currentPage - 3), Math.min(totalPages, currentPage + 2))
              .map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-7 h-7 rounded-lg text-xs font-bold transition-colors ${
                    currentPage === page
                      ? "bg-indigo-600 text-white shadow-xs"
                      : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  {page}
                </button>
              ))}

            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-1.5 bg-white border border-slate-200 rounded-lg disabled:opacity-40 hover:bg-slate-100 font-bold"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Comprehensive Single Product Modal */}
      {showProductModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white max-w-3xl w-full rounded-2xl p-6 shadow-2xl space-y-4 max-h-[92vh] flex flex-col my-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-3 shrink-0">
              <div>
                <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                  <Package className="w-5 h-5 text-indigo-600" />
                  {editingId ? "Edit Product Details" : "Add Single Product"}
                </h3>
                <p className="text-[11px] text-slate-400">Configure full product information, pricing, variants & media</p>
              </div>
              <button
                onClick={() => setShowProductModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Navigation Tabs */}
            <div className="flex border-b border-slate-200 gap-2 shrink-0 overflow-x-auto text-xs font-bold">
              <button
                type="button"
                onClick={() => setActiveTab("basic")}
                className={`pb-2.5 px-3 border-b-2 transition-colors ${
                  activeTab === "basic"
                    ? "border-indigo-600 text-indigo-600 font-black"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                1. Basic Info
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("pricing")}
                className={`pb-2.5 px-3 border-b-2 transition-colors ${
                  activeTab === "pricing"
                    ? "border-indigo-600 text-indigo-600 font-black"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                2. Pricing & Discounts
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("stock")}
                className={`pb-2.5 px-3 border-b-2 transition-colors ${
                  activeTab === "stock"
                    ? "border-indigo-600 text-indigo-600 font-black"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                3. Stock & Alerts
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("media")}
                className={`pb-2.5 px-3 border-b-2 transition-colors ${
                  activeTab === "media"
                    ? "border-indigo-600 text-indigo-600 font-black"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                4. Media Gallery
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("variants")}
                className={`pb-2.5 px-3 border-b-2 transition-colors ${
                  activeTab === "variants"
                    ? "border-indigo-600 text-indigo-600 font-black"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                5. Variants ({customVariants.length})
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSaveProductForm} className="space-y-4 text-xs overflow-y-auto flex-1 pr-1">
              {/* TAB 1: BASIC INFO */}
              {activeTab === "basic" && (
                <div className="space-y-4 animate-fadeIn">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="sm:col-span-2">
                      <label className="font-bold text-slate-700 block mb-1">Product Title *</label>
                      <input
                        type="text"
                        required
                        value={formName}
                        onChange={(e) => setFormName(e.target.value)}
                        placeholder="e.g. Men's Black T-Shirt, Apple iPhone 15 Pro, Nike Running Shoes..."
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold text-slate-900 focus:bg-white transition-colors"
                      />

                      {/* AI & Product Image Suggestions Section */}
                      <ProductImageSuggestions
                        productName={formName}
                        currentMainImage={formMainImage}
                        currentGalleryImages={formGalleryImages}
                        onSelectMainImage={(url) => {
                          setFormMainImage(url);
                          addToast("Set selected image as primary cover!", "success");
                        }}
                        onAddGalleryImage={(url) => {
                          if (!formGalleryImages.includes(url)) {
                            setFormGalleryImages((prev) => [...prev, url]);
                            addToast("Added image to product gallery", "success");
                          } else {
                            addToast("Image is already in gallery", "info");
                          }
                        }}
                        onRemoveGalleryImage={(url) => {
                          setFormGalleryImages((prev) => prev.filter((img) => img !== url));
                          addToast("Removed from product gallery", "info");
                        }}
                        onSwitchToMediaTab={() => setActiveTab("media")}
                        className="mt-3"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">SKU (Unique Code) *</label>
                      <input
                        type="text"
                        required
                        value={formSku}
                        onChange={(e) => setFormSku(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-mono font-bold"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Barcode / EAN *</label>
                      <input
                        type="text"
                        required
                        value={formBarcode}
                        onChange={(e) => setFormBarcode(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-mono"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Category *</label>
                      <select
                        value={formCategory}
                        onChange={(e) => {
                          setFormCategory(e.target.value);
                          setFormSubCategory("");
                        }}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold text-slate-800"
                      >
                        {categories.map((c) => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Sub Category</label>
                      <select
                        value={formSubCategory}
                        onChange={(e) => setFormSubCategory(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800"
                      >
                        <option value="">None / Top Level</option>
                        {availableSubCategories.map((sc) => (
                          <option key={sc.id} value={sc.id}>{sc.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Brand *</label>
                      <select
                        value={formBrand}
                        onChange={(e) => setFormBrand(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold text-slate-800"
                      >
                        {brands.map((b) => (
                          <option key={b.id} value={b.id}>{b.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Vendor / Supplier</label>
                      <input
                        type="text"
                        value={formVendor}
                        onChange={(e) => setFormVendor(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Product Status *</label>
                      <select
                        value={formStatus}
                        onChange={(e) => setFormStatus(e.target.value as any)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold text-indigo-700"
                      >
                        <option value="Active">Active (Published on storefront)</option>
                        <option value="Draft">Draft (Hidden in Admin)</option>
                        <option value="Inactive">Inactive (Disabled)</option>
                      </select>
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Warranty Information</label>
                      <input
                        type="text"
                        value={formWarranty}
                        onChange={(e) => setFormWarranty(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="font-bold text-slate-700 block mb-1">Product Tags (Comma Separated)</label>
                      <input
                        type="text"
                        value={formTags}
                        onChange={(e) => setFormTags(e.target.value)}
                        placeholder="e.g. Flagship, Bestseller, Wireless, New"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="font-bold text-slate-700 block mb-1">Short Description</label>
                      <textarea
                        rows={2}
                        value={formShortDesc}
                        onChange={(e) => setFormShortDesc(e.target.value)}
                        placeholder="Brief summary for product card..."
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5"
                      ></textarea>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="font-bold text-slate-700 block mb-1">Full Description</label>
                      <textarea
                        rows={3}
                        value={formDesc}
                        onChange={(e) => setFormDesc(e.target.value)}
                        placeholder="Detailed specifications, feature list and details..."
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5"
                      ></textarea>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: PRICING & DISCOUNTS */}
              {activeTab === "pricing" && (
                <div className="space-y-4 animate-fadeIn">
                  <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl text-indigo-900 font-medium">
                    Selling Price must be greater than 0. Discount Price cannot exceed Selling Price.
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Cost Price ({settings.currencySymbol})</label>
                      <input
                        type="number"
                        min={0}
                        value={formCostPrice}
                        onChange={(e) => setFormCostPrice(Number(e.target.value))}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Purchase / Wholesale Price ({settings.currencySymbol})</label>
                      <input
                        type="number"
                        min={0}
                        value={formPurchasePrice}
                        onChange={(e) => setFormPurchasePrice(Number(e.target.value))}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Selling Price ({settings.currencySymbol}) *</label>
                      <input
                        type="number"
                        required
                        min={1}
                        value={formSellingPrice}
                        onChange={(e) => setFormSellingPrice(Number(e.target.value))}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-black text-slate-900 text-sm"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Discount Price ({settings.currencySymbol}) *</label>
                      <input
                        type="number"
                        required
                        min={0}
                        value={formDiscountPrice}
                        onChange={(e) => setFormDiscountPrice(Number(e.target.value))}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-black text-indigo-600 text-sm"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Discount Type</label>
                      <select
                        value={formDiscountType}
                        onChange={(e) => setFormDiscountType(e.target.value as any)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold"
                      >
                        <option value="Fixed">Fixed Amount Discount ({settings.currencySymbol})</option>
                        <option value="Percentage">Percentage Discount (%)</option>
                      </select>
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Discount Value</label>
                      <input
                        type="number"
                        min={0}
                        value={formDiscountValue}
                        onChange={(e) => setFormDiscountValue(Number(e.target.value))}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Discount Start Date</label>
                      <input
                        type="date"
                        value={formDiscountStartDate}
                        onChange={(e) => setFormDiscountStartDate(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Discount End Date</label>
                      <input
                        type="date"
                        value={formDiscountEndDate}
                        onChange={(e) => setFormDiscountEndDate(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5"
                      />
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 border rounded-xl flex items-center justify-between text-slate-700 font-bold">
                    <span>Estimated Profit Margin:</span>
                    <span className="text-emerald-600 font-black text-sm">
                      {settings.currencySymbol}{(formDiscountPrice - formCostPrice).toLocaleString()} (
                      {formCostPrice > 0 ? Math.round(((formDiscountPrice - formCostPrice) / formCostPrice) * 100) : 0}%)
                    </span>
                  </div>
                </div>
              )}

              {/* TAB 3: STOCK & ALERTS */}
              {activeTab === "stock" && (
                <div className="space-y-4 animate-fadeIn">
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 font-medium">
                    Stock cannot be negative. Setting total stock to 0 will automatically flag product as "Out of Stock" on the customer website.
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Total Stock Quantity *</label>
                      <input
                        type="number"
                        required
                        min={0}
                        value={formTotalStock}
                        onChange={(e) => setFormTotalStock(Number(e.target.value))}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-black text-slate-900 text-sm"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Low Stock Alert Threshold</label>
                      <input
                        type="number"
                        min={1}
                        value={formLowStockThreshold}
                        onChange={(e) => setFormLowStockThreshold(Number(e.target.value))}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold"
                      />
                    </div>
                  </div>

                  <div className="p-4 border border-slate-200 rounded-2xl bg-slate-50 space-y-2">
                    <h4 className="font-bold text-slate-800">Inventory Status Summary:</h4>
                    {formTotalStock <= 0 ? (
                      <p className="text-rose-600 font-bold">Out of Stock (Customers cannot place orders)</p>
                    ) : formTotalStock <= formLowStockThreshold ? (
                      <p className="text-amber-600 font-bold">Low Stock Warning Triggered ({formTotalStock} units left)</p>
                    ) : (
                      <p className="text-emerald-600 font-bold">In Stock & Ready for Fulfillment</p>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 4: MEDIA GALLERY */}
              {activeTab === "media" && (
                <div className="space-y-5 animate-fadeIn">
                  {/* Primary Cover Image Management */}
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="font-extrabold text-slate-900 block text-xs">
                          Primary Cover Image *
                        </label>
                        <p className="text-[11px] text-slate-500">
                          Main display photo visible on store catalog cards & checkout
                        </p>
                      </div>
                      {formMainImage && (
                        <button
                          type="button"
                          onClick={() => setFormMainImage("")}
                          className="text-[11px] text-rose-600 hover:text-rose-700 font-bold"
                        >
                          Clear Image
                        </button>
                      )}
                    </div>

                    <div className="flex flex-col sm:flex-row items-start gap-4">
                      {formMainImage ? (
                        <div className="relative group w-28 h-28 shrink-0 bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
                          <img
                            src={formMainImage}
                            alt="Main Product Cover"
                            className="w-full h-full object-cover object-center"
                          />
                          <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <span className="text-[10px] text-white font-bold bg-slate-900/80 px-2 py-0.5 rounded-md">
                              Primary
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="w-28 h-28 shrink-0 rounded-xl border-2 border-dashed border-slate-300 bg-white flex flex-col items-center justify-center text-slate-400">
                          <ImageIcon className="w-6 h-6 mb-1 text-slate-300" />
                          <span className="text-[10px] font-bold">No Image</span>
                        </div>
                      )}

                      <div className="flex-1 space-y-2 w-full">
                        <div>
                          <label className="text-[11px] font-bold text-slate-600 block mb-1">
                            Paste Image Web URL
                          </label>
                          <input
                            type="text"
                            required
                            value={formMainImage}
                            onChange={(e) => setFormMainImage(e.target.value)}
                            placeholder="https://images.unsplash.com/..."
                            className="w-full bg-white border border-slate-200 rounded-xl p-2 font-mono text-xs text-slate-800"
                          />
                        </div>

                        <div className="flex flex-wrap items-center gap-2 pt-1">
                          <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-bold transition-colors">
                            <Upload className="w-3.5 h-3.5" />
                            <span>Upload from Computer</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                if (e.target.files && e.target.files[0]) {
                                  handleUploadMainImageFromFile(e.target.files[0]);
                                }
                              }}
                            />
                          </label>

                          {/* OPTIONAL BACKGROUND EDITOR ACTIONS */}
                          {formMainImage && (
                            <>
                              <button
                                type="button"
                                onClick={() => handleOpenImageEditor(formMainImage, -1)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl text-xs font-bold shadow-xs shadow-indigo-200 transition-all"
                                title="Remove background and generate transparent cutout"
                              >
                                <Wand2 className="w-3.5 h-3.5" />
                                <span>Remove Background</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => handleOpenImageEditor(formMainImage, -1)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 rounded-xl text-xs font-bold transition-colors"
                                title="Change or add studio / marketplace background"
                              >
                                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                                <span>Add / Change Background</span>
                              </button>
                            </>
                          )}

                          <span className="text-[11px] text-slate-400">PNG, JPG, WEBP up to 10MB</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Product Gallery Images */}
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="font-extrabold text-slate-900 block text-xs">
                          Product Gallery Images ({formGalleryImages.length})
                        </label>
                        <p className="text-[11px] text-slate-500">
                          Additional showcase angles and variant photos
                        </p>
                      </div>

                      <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-[11px] font-bold transition-colors">
                        <Upload className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Upload Multiple</span>
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          className="hidden"
                          onChange={(e) => handleUploadGalleryImagesFromFiles(e.target.files)}
                        />
                      </label>
                    </div>

                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newGalleryUrl}
                        onChange={(e) => setNewGalleryUrl(e.target.value)}
                        placeholder="Paste additional image URL..."
                        className="flex-1 bg-white border border-slate-200 rounded-xl p-2 text-xs font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (newGalleryUrl.trim()) {
                            setFormGalleryImages([...formGalleryImages, newGalleryUrl.trim()]);
                            setNewGalleryUrl("");
                            addToast("Image added to gallery", "success");
                          }
                        }}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 rounded-xl text-xs"
                      >
                        Add to Gallery
                      </button>
                    </div>

                    {formGalleryImages.length > 0 ? (
                      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5 pt-1">
                        {formGalleryImages.map((img, idx) => (
                          <div key={idx} className="relative group aspect-square rounded-xl overflow-hidden bg-white border border-slate-200 shadow-xs">
                            <img
                              src={img}
                              alt={`Gallery ${idx + 1}`}
                              className="w-full h-full object-cover object-center"
                            />

                            <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-1.5">
                              <div className="flex items-center justify-between w-full">
                                <button
                                  type="button"
                                  onClick={() => handleOpenImageEditor(img, idx)}
                                  className="bg-slate-900/90 hover:bg-indigo-600 text-white rounded-md p-1 shadow-xs transition-colors"
                                  title="Edit Background in Studio"
                                >
                                  <Wand2 className="w-3 h-3 text-indigo-300 hover:text-white" />
                                </button>

                                <button
                                  type="button"
                                  onClick={() => setFormGalleryImages(formGalleryImages.filter((_, i) => i !== idx))}
                                  className="bg-rose-600 hover:bg-rose-700 text-white rounded-md p-1 shadow-xs"
                                  title="Remove Image"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>

                              <div className="space-y-1">
                                <button
                                  type="button"
                                  onClick={() => handleOpenImageEditor(img, idx)}
                                  className="w-full py-0.5 bg-indigo-600/90 hover:bg-indigo-600 text-white rounded text-[8px] font-bold flex items-center justify-center gap-0.5"
                                >
                                  <Wand2 className="w-2.5 h-2.5" /> BG Studio
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const oldMain = formMainImage;
                                    setFormMainImage(img);
                                    const nextGallery = [...formGalleryImages];
                                    nextGallery[idx] = oldMain;
                                    setFormGalleryImages(nextGallery.filter(Boolean));
                                    addToast("Promoted to primary cover image", "success");
                                  }}
                                  className="w-full py-0.5 bg-slate-800 hover:bg-slate-700 text-white rounded text-[8px] font-bold"
                                >
                                  Make Main
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[11px] text-slate-400 italic">No gallery images added yet.</p>
                    )}
                  </div>

                  {/* AI & Product Image Suggestions Section in Media Tab */}
                  <ProductImageSuggestions
                    productName={formName}
                    currentMainImage={formMainImage}
                    currentGalleryImages={formGalleryImages}
                    onSelectMainImage={(url) => {
                      setFormMainImage(url);
                      addToast("Set selected image as primary cover!", "success");
                    }}
                    onAddGalleryImage={(url) => {
                      if (!formGalleryImages.includes(url)) {
                        setFormGalleryImages((prev) => [...prev, url]);
                        addToast("Added image to product gallery", "success");
                      } else {
                        addToast("Image is already in gallery", "info");
                      }
                    }}
                    onRemoveGalleryImage={(url) => {
                      setFormGalleryImages((prev) => prev.filter((img) => img !== url));
                      addToast("Removed from product gallery", "info");
                    }}
                  />

                  {/* Video URL */}
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Product Video Embed/URL (Optional)</label>
                    <input
                      type="text"
                      value={formVideoUrl}
                      onChange={(e) => setFormVideoUrl(e.target.value)}
                      placeholder="e.g. https://www.youtube.com/watch?v=..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs"
                    />
                  </div>
                </div>
              )}

              {/* TAB 5: VARIANTS */}
              {activeTab === "variants" && (
                <div className="space-y-4 animate-fadeIn">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Colors (Comma Separated)</label>
                      <input
                        type="text"
                        value={formColors}
                        onChange={(e) => setFormColors(e.target.value)}
                        placeholder="Red, Blue, Titanium"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Sizes / Capacities (Comma Separated)</label>
                      <input
                        type="text"
                        value={formSizes}
                        onChange={(e) => setFormSizes(e.target.value)}
                        placeholder="S, M, L or 128GB, 256GB"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={handleGenerateVariants}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5"
                    >
                      <Sparkles className="w-3.5 h-3.5" /> Auto-Generate Variant Matrix
                    </button>
                  </div>

                  {customVariants.length > 0 && (
                    <div className="border border-slate-200 rounded-xl overflow-x-auto">
                      <table className="w-full text-left text-[11px]">
                        <thead className="bg-slate-100 font-bold border-b text-slate-700">
                          <tr>
                            <th className="p-2">Color</th>
                            <th className="p-2">Size</th>
                            <th className="p-2">Variant SKU</th>
                            <th className="p-2">Price</th>
                            <th className="p-2">Stock</th>
                            <th className="p-2 text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          {customVariants.map((v, idx) => (
                            <tr key={v.id || idx}>
                              <td className="p-2 font-bold">{v.color}</td>
                              <td className="p-2 font-bold">{v.size}</td>
                              <td className="p-2 font-mono">{v.sku}</td>
                              <td className="p-2 font-bold">{settings.currencySymbol}{v.price}</td>
                              <td className="p-2 font-bold">{v.stock}</td>
                              <td className="p-2 text-right">
                                <button
                                  type="button"
                                  onClick={() => setCustomVariants(customVariants.filter((_, i) => i !== idx))}
                                  className="text-rose-600 hover:bg-rose-50 p-1 rounded"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* Form Footer Buttons */}
              <div className="flex justify-end gap-2 pt-4 border-t border-slate-200 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowProductModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-all shadow-md active:scale-95"
                >
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Single Product Confirmation Modal */}
      {deletingProduct && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-600 border-b pb-3">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="font-extrabold text-slate-900 text-base">Confirm Product Deletion</h3>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to permanently delete <strong className="text-slate-900">"{deletingProduct.name}"</strong> (SKU: {deletingProduct.sku})? This action cannot be undone.
            </p>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setDeletingProduct(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 font-bold text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmSingleDelete}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md"
              >
                Delete Product
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Delete Confirmation Modal */}
      {showBulkDeleteConfirm && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-600 border-b pb-3">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="font-extrabold text-slate-900 text-base">Bulk Delete Confirmation</h3>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to permanently delete <strong className="text-rose-600 font-bold">{selectedProductIds.length} selected products</strong>?
            </p>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowBulkDeleteConfirm(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 font-bold text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmBulkDelete}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md"
              >
                Delete {selectedProductIds.length} Items
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Stock Adjust Modal */}
      {stockAdjustProduct && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-slate-900 text-sm">Quick Stock Adjustment</h3>
              <button onClick={() => setStockAdjustProduct(null)} className="text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleExecuteStockAdjust} className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 border rounded-xl">
                <p className="font-bold text-slate-900">{stockAdjustProduct.name}</p>
                <p className="text-[11px] text-slate-400">Current Stock: {stockAdjustProduct.totalStock} units</p>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Transaction Type</label>
                <select
                  value={adjustType}
                  onChange={(e) => setAdjustType(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold"
                >
                  <option value="Stock In">Stock In (+ Add)</option>
                  <option value="Stock Out">Stock Out (- Remove)</option>
                  <option value="Adjustment">Adjustment (Direct Update)</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Quantity</label>
                <input
                  type="number"
                  required
                  min={1}
                  value={adjustQty}
                  onChange={(e) => setAdjustQty(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Reason / Note</label>
                <input
                  type="text"
                  required
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setStockAdjustProduct(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold"
                >
                  Update Stock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Stock History Modal */}
      {historyProduct && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-lg w-full rounded-2xl p-6 shadow-2xl space-y-4 max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <History className="w-4 h-4 text-indigo-600" /> Stock Movement Log: {historyProduct.sku}
              </h3>
              <button onClick={() => setHistoryProduct(null)} className="text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 space-y-2 text-xs">
              {inventoryTransactions.filter((tx) => tx.sku === historyProduct.sku || tx.productId === historyProduct.id).length === 0 ? (
                <p className="text-center text-slate-400 py-8 italic">No recorded inventory transactions yet.</p>
              ) : (
                inventoryTransactions
                  .filter((tx) => tx.sku === historyProduct.sku || tx.productId === historyProduct.id)
                  .map((tx) => (
                    <div key={tx.id} className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
                      <div className="flex justify-between items-center font-bold">
                        <span className={tx.type === "Stock In" ? "text-emerald-600" : "text-rose-600"}>
                          {tx.type}: {tx.quantity} units
                        </span>
                        <span className="text-[10px] text-slate-400">{tx.createdAt}</span>
                      </div>
                      <p className="text-slate-600 text-[11px]">{tx.reason}</p>
                      <p className="text-slate-400 text-[10px]">By: {tx.performedBy}</p>
                    </div>
                  ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Bulk Upload CSV / Excel Modal */}
      {showBulkModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-xl w-full rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-emerald-600" /> Bulk Product Upload (Excel / CSV)
              </h3>
              <button onClick={() => setShowBulkModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-between gap-2">
                <div>
                  <span className="font-bold text-blue-900 block">Download Template</span>
                  <span className="text-[11px] text-blue-700">Columns: Name, SKU, Category, Price, Stock, Color, Description...</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => downloadSampleBulkUploadTemplate("excel")}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-2.5 py-1.5 rounded-lg flex items-center gap-1 shadow-xs transition-colors"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5" /> Sample Excel
                  </button>
                  <button
                    onClick={() => downloadSampleBulkUploadTemplate("csv")}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-2.5 py-1.5 rounded-lg flex items-center gap-1 shadow-xs transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" /> Sample CSV
                  </button>
                </div>
              </div>

              <div className="border-2 border-dashed border-slate-300 rounded-2xl p-6 text-center hover:border-indigo-500 transition-colors">
                <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="font-bold text-slate-800 mb-1">Select or Drag Excel (.xlsx) / CSV File Here</p>
                <p className="text-[11px] text-slate-400 mb-3">Supports .xlsx, .xls, and .csv files up to 10MB</p>
                <input
                  type="file"
                  accept=".xlsx, .xls, .csv"
                  onChange={handleFileUpload}
                  className="text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
                />
              </div>

              {validating && <p className="text-indigo-600 font-bold italic text-center">Validating file rows against business rules...</p>}

              {validationResult && (
                <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div className="flex items-center justify-between font-bold">
                    <span>Validation Summary:</span>
                    <span className="text-emerald-600 font-bold">{validationResult.validCount} Valid Rows</span>
                    <span className="text-rose-600 font-bold">{validationResult.errorCount} Invalid Rows</span>
                  </div>

                  {validationResult.errors.length > 0 && (
                    <div className="space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="text-rose-700 font-bold">Error Report:</span>
                        <button
                          onClick={() => exportToCSV("bulk_upload_error_log", validationResult.errors)}
                          className="text-rose-600 hover:underline font-bold text-[11px] flex items-center gap-1"
                        >
                          <Download className="w-3 h-3" /> Export Error Log
                        </button>
                      </div>

                      <div className="max-h-28 overflow-y-auto bg-white p-2 border rounded-lg space-y-1 text-[11px]">
                        {validationResult.errors.map((err, idx) => (
                          <div key={idx} className="text-rose-600 font-mono">
                            Row #{err.rowNumber} (SKU: {err.sku}): {err.error}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      onClick={handleConfirmBulkImport}
                      disabled={validationResult.validCount === 0}
                      className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold px-4 py-2 rounded-xl shadow-xs"
                    >
                      Import {validationResult.validCount} Valid Products
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* OPTIONAL PRODUCT IMAGE STUDIO & BACKGROUND EDITOR MODAL */}
      {showImageEditorModal && (
        <ProductImageEditorModal
          isOpen={showImageEditorModal}
          onClose={() => setShowImageEditorModal(false)}
          initialImage={imageEditorInitial}
          imageIndex={imageEditorIndex}
          onApplyImage={handleApplyImageEditorResult}
          productName={formName || "Product Image"}
        />
      )}
    </div>
  );
};
