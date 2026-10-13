import Papa from "papaparse";
import { jsPDF } from "jspdf";
import * as XLSX from "xlsx";
import { parseSafeNumber, formatNumber, formatCurrency, sanitizeExportRow } from "./numberUtils";

export { parseSafeNumber, formatNumber, formatCurrency, sanitizeExportRow };

// CSV Export with UTF-8 BOM for Excel compatibility
export function exportToCSV(filename: string, rows: Record<string, any>[]) {
  const sanitizedRows = rows.map((r) => sanitizeExportRow(r));
  const csv = Papa.unparse(sanitizedRows, {
    quotes: true,
  });
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `${filename.replace(/\.csv$/, "")}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Single-sheet Excel Export (.xlsx)
export function exportToExcel(filename: string, sheetName: string, rows: Record<string, any>[]) {
  const sanitizedRows = rows.map((r) => sanitizeExportRow(r));
  const worksheet = XLSX.utils.json_to_sheet(sanitizedRows);

  const range = XLSX.utils.decode_range(worksheet["!ref"] || "A1:A1");
  for (let R = range.s.r + 1; R <= range.e.r; ++R) {
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
      const cell = worksheet[cellAddress];
      if (cell && cell.t === "n") {
        if (cell.v % 1 !== 0) {
          cell.z = "#,##0.00";
        } else {
          cell.z = "#,##0";
        }
      }
    }
  }

  const colWidths = Object.keys(sanitizedRows[0] || {}).map((key) => {
    const maxLen = Math.max(
      key.length,
      ...sanitizedRows.map((r) => (r[key] !== undefined && r[key] !== null ? String(r[key]).length : 0))
    );
    return { wch: Math.min(Math.max(maxLen + 4, 14), 45) };
  });
  worksheet["!cols"] = colWidths;

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName || "Data");

  const cleanFilename = filename.endsWith(".xlsx") ? filename : `${filename}.xlsx`;
  XLSX.writeFile(workbook, cleanFilename);
}

// Multi-sheet Excel Export (.xlsx)
export function exportToMultiSheetExcel(
  filename: string,
  sheets: { sheetName: string; rows: Record<string, any>[] }[]
) {
  const workbook = XLSX.utils.book_new();

  sheets.forEach(({ sheetName, rows }) => {
    const sanitizedRows = (rows || []).map((r) => sanitizeExportRow(r));
    const worksheet = XLSX.utils.json_to_sheet(sanitizedRows);

    if (sanitizedRows.length > 0) {
      const range = XLSX.utils.decode_range(worksheet["!ref"] || "A1:A1");
      for (let R = range.s.r + 1; R <= range.e.r; ++R) {
        for (let C = range.s.c; C <= range.e.c; ++C) {
          const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
          const cell = worksheet[cellAddress];
          if (cell && cell.t === "n") {
            cell.z = cell.v % 1 !== 0 ? "#,##0.00" : "#,##0";
          }
        }
      }

      const colWidths = Object.keys(sanitizedRows[0] || {}).map((key) => {
        const maxLen = Math.max(
          key.length,
          ...sanitizedRows.map((r) => (r[key] !== undefined && r[key] !== null ? String(r[key]).length : 0))
        );
        return { wch: Math.min(Math.max(maxLen + 4, 14), 45) };
      });
      worksheet["!cols"] = colWidths;
    }

    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName.slice(0, 31));
  });

  const cleanFilename = filename.endsWith(".xlsx") ? filename : `${filename}.xlsx`;
  XLSX.writeFile(workbook, cleanFilename);
}

// PDF Export with clean typography
export function exportToPDFReport(title: string, rows: Record<string, any>[]) {
  const doc = new jsPDF();
  doc.setFontSize(16);
  doc.text(title, 14, 20);

  doc.setFontSize(10);
  doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 28);

  let y = 38;
  rows.forEach((row, i) => {
    if (y > 270) {
      doc.addPage();
      y = 20;
    }
    const text = Object.entries(row)
      .map(([k, v]) => {
        let valStr = String(v);
        if (typeof v === "number") {
          valStr = formatNumber(v, v % 1 !== 0 ? 2 : 0);
        }
        return `${k}: ${valStr.replace(/৳/g, "Tk ")}`;
      })
      .join("  |  ");
    doc.text(`${i + 1}. ${text}`, 14, y);
    y += 8;
  });

  doc.save(`${title.toLowerCase().replace(/\s+/g, "_")}.pdf`);
}

// Standard Excel Template Download (.xlsx & .csv) with Field Guide
export function downloadSampleBulkUploadTemplate(format: "excel" | "csv" = "excel") {
  const templateRows = [
    {
      "Product Name": "Samsung Galaxy Tab S9 Ultra",
      SKU: "SAM-TABS9U-128",
      Barcode: "880609511111",
      Category: "Electronics",
      Brand: "Samsung",
      Vendor: "Samsung Tech Ltd",
      Price: "95000",
      DiscountPrice: "89900",
      Stock: "25",
      Size: "128GB",
      Color: "Graphite",
      Description: "Flagship AMOLED Android Tablet with S Pen support",
      "Images URL": "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0",
      Status: "Active",
    },
    {
      "Product Name": "Sony PlayStation 5 Slim Edition",
      SKU: "SNY-PS5-SLIM",
      Barcode: "027242999888",
      Category: "Electronics",
      Brand: "Sony",
      Vendor: "Sony Gaming Direct",
      Price: "68000",
      DiscountPrice: "64900",
      Stock: "15",
      Size: "1TB SSD",
      Color: "White",
      Description: "Next-gen 4K 120Hz console gaming system",
      "Images URL": "https://images.unsplash.com/photo-1606813907291-d86efa9b94db",
      Status: "Active",
    },
    {
      "Product Name": "Apple MacBook Pro 16 M3 Max",
      SKU: "APL-MBP16-M3",
      Barcode: "194253000111",
      Category: "Laptops & Computers",
      Brand: "Apple",
      Vendor: "Apple Premium Reseller",
      Price: "349000",
      DiscountPrice: "339000",
      Stock: "8",
      Size: "36GB / 1TB",
      Color: "Space Black",
      Description: "Liquid Retina XDR display laptop with extreme performance",
      "Images URL": "https://images.unsplash.com/photo-1517336714731-489689fd1ca8",
      Status: "Active",
    },
    {
      "Product Name": "Nike Air Zoom Pegasus 40",
      SKU: "NKE-PEG40-BLK",
      Barcode: "196607888222",
      Category: "Fashion & Footwear",
      Brand: "Nike",
      Vendor: "Nike BD Official",
      Price: "16500",
      DiscountPrice: "14900",
      Stock: "40",
      Size: "EU 42 / US 9",
      Color: "Black/White",
      Description: "Responsive cushioning road running shoes",
      "Images URL": "https://images.unsplash.com/photo-1542291026-7eec264c27ff",
      Status: "Active",
    },
    {
      "Product Name": "Anker 737 Power Bank 24000mAh",
      SKU: "ANK-737-24K",
      Barcode: "084806100333",
      Category: "Accessories",
      Brand: "Anker",
      Vendor: "Anker Hub",
      Price: "14500",
      DiscountPrice: "13500",
      Stock: "30",
      Size: "24,000mAh 140W",
      Color: "Silver Grey",
      Description: "140W ultra-fast charging multi-device power bank with smart digital display",
      "Images URL": "https://images.unsplash.com/photo-1609592424364-7729f27c3ee7",
      Status: "Active",
    },
  ];

  const fieldInstructions = [
    {
      "Column Name": "Product Name",
      Requirement: "REQUIRED (আবশ্যক)",
      "Allowed Values": "যেকোনো টেক্সট",
      Example: "iPhone 15 Pro Max",
      Description: "পণ্যের পূর্ণ শিরোনাম বা নাম",
    },
    {
      "Column Name": "SKU",
      Requirement: "REQUIRED (আবশ্যক)",
      "Allowed Values": "অনন্য আলফানিউমেরিক কোড",
      Example: "IPH-15PM-256",
      Description: "প্রতিটি পণ্যের আলাদা ইনভেন্টরি কোড",
    },
    {
      "Column Name": "Barcode",
      Requirement: "OPTIONAL (ঐচ্ছিক)",
      "Allowed Values": "সংখ্যার কোড (EAN/UPC)",
      Example: "880609511111",
      Description: "পণ্য স্ক্যান করার বারকোড নম্বর",
    },
    {
      "Column Name": "Category",
      Requirement: "REQUIRED (আবশ্যক)",
      "Allowed Values": "ক্যাটাগরি নাম",
      Example: "Electronics",
      Description: "স্টোরের ক্যাটাগরি নাম (অটোমেটিক ম্যাচ হবে)",
    },
    {
      "Column Name": "Brand",
      Requirement: "OPTIONAL (ঐচ্ছিক)",
      "Allowed Values": "ব্র্যান্ড নাম",
      Example: "Apple / Samsung / Nike",
      Description: "পণ্যের ব্র্যান্ড বা প্রস্তুতকারক",
    },
    {
      "Column Name": "Price",
      Requirement: "REQUIRED (আবশ্যক)",
      "Allowed Values": "শুধুমাত্র সংখ্যা (টাকা)",
      Example: "95000",
      Description: "মূল বিক্রয় মূল্য (টাকার সংখ্যা)",
    },
    {
      "Column Name": "DiscountPrice",
      Requirement: "OPTIONAL (ঐচ্ছিক)",
      "Allowed Values": "সংখ্যা (Price এর সমান বা কম)",
      Example: "89900",
      Description: "ডিসকাউন্ট বা অফার মূল্য",
    },
    {
      "Column Name": "Stock",
      Requirement: "REQUIRED (আবশ্যক)",
      "Allowed Values": "পূর্ণসংখ্যা (পিস)",
      Example: "25",
      Description: "গুদামে থাকা বর্তমান পণ্যের পরিমাণ",
    },
    {
      "Column Name": "Size",
      Requirement: "OPTIONAL (ঐচ্ছিক)",
      "Allowed Values": "টেক্সট (সাইজ/র‍্যাম/স্টোরেজ)",
      Example: "128GB / XL / 42",
      Description: "সাইজ বা স্টোরেজ ভ্যারিয়েন্ট",
    },
    {
      "Column Name": "Color",
      Requirement: "OPTIONAL (ঐচ্ছিক)",
      "Allowed Values": "রঙের নাম",
      Example: "Space Black / Blue",
      Description: "পণ্যের প্রাথমিক রং",
    },
    {
      "Column Name": "Description",
      Requirement: "OPTIONAL (ঐচ্ছিক)",
      "Allowed Values": "বিবরণ টেক্সট",
      Example: "অরিজিনাল গ্যারান্টিযুক্ত পণ্য...",
      Description: "গ্রাহকদের দেখানোর জন্য পণ্যের বর্ণনা",
    },
    {
      "Column Name": "Status",
      Requirement: "OPTIONAL (ঐচ্ছিক)",
      "Allowed Values": "Active / Draft",
      Example: "Active",
      Description: "স্টোরে সরাসরি লাইভ রাখতে Active লিখুন",
    },
  ];

  if (format === "excel") {
    exportToMultiSheetExcel("SmartShop_Product_Import_Template.xlsx", [
      { sheetName: "Product_Upload_Template", rows: templateRows },
      { sheetName: "Field_Instructions", rows: fieldInstructions },
    ]);
  } else {
    exportToCSV("SmartShop_Product_Import_Template.csv", templateRows);
  }
}

// Parse either CSV or XLSX File automatically
export function parseExcelOrCSVFile(file: File): Promise<any[]> {
  return new Promise((resolve, reject) => {
    const filename = file.name.toLowerCase();

    if (filename.endsWith(".xlsx") || filename.endsWith(".xls")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: "array" });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          const json = XLSX.utils.sheet_to_json(worksheet, { defval: "" });
          const cleanJson = (json as any[]).map((row) => {
            const cleanedRow: Record<string, any> = {};
            for (const [k, v] of Object.entries(row)) {
              cleanedRow[k.trim()] = typeof v === "string" ? v.trim() : v;
            }
            return cleanedRow;
          });
          resolve(cleanJson);
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = (err) => reject(err);
      reader.readAsArrayBuffer(file);
    } else {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          const cleanData = (results.data as any[]).map((row) => {
            const cleanedRow: Record<string, any> = {};
            for (const [k, v] of Object.entries(row)) {
              cleanedRow[k.trim()] = typeof v === "string" ? v.trim() : v;
            }
            return cleanedRow;
          });
          resolve(cleanData);
        },
        error: (err) => reject(err),
      });
    }
  });
}

// Orders Bulk Import Template (.xlsx & .csv)
export function downloadOrdersTemplate(format: "excel" | "csv" = "excel") {
  const sampleOrders = [
    {
      "Order ID": "ORD-2026-9001",
      "Customer Name": "Ayesha Rahman",
      "Customer Phone": "+880 1711-234567",
      "Shipping Address": "House 12, Road 5, Dhanmondi",
      City: "Dhaka",
      "Product Name": "Samsung Galaxy Tab S9 Ultra",
      SKU: "SAM-TABS9U-128",
      Quantity: "1",
      "Total Amount": "89900",
      "Payment Method": "bKash",
      "Order Status": "Confirmed",
    },
    {
      "Order ID": "ORD-2026-9002",
      "Customer Name": "Tanvir Hasan",
      "Customer Phone": "+880 1822-987654",
      "Shipping Address": "Agrabad Commercial Area",
      City: "Chittagong",
      "Product Name": "Sony PlayStation 5 Slim Edition",
      SKU: "SNY-PS5-SLIM",
      Quantity: "1",
      "Total Amount": "64900",
      "Payment Method": "Cash on Delivery",
      "Order Status": "Shipped",
    },
  ];

  if (format === "excel") {
    exportToExcel("SmartShop_Orders_Import_Template.xlsx", "Orders_Template", sampleOrders);
  } else {
    exportToCSV("SmartShop_Orders_Import_Template.csv", sampleOrders);
  }
}

// Customer Leads & CRM Template (.xlsx & .csv)
export function downloadCustomerLeadsTemplate(format: "excel" | "csv" = "excel") {
  const sampleLeads = [
    {
      "Customer Name": "Kamrul Islam",
      Phone: "+880 1911-554433",
      Email: "kamrul.islam@gmail.com",
      City: "Sylhet",
      "Interested Product": "Apple MacBook Pro 16 M3 Max",
      "Estimated Budget": "350000",
      "Lead Source": "Website Cart Drop-off",
      "Follow-up Status": "Hot Lead (অর্ডার প্রস্তুত)",
    },
    {
      "Customer Name": "Nusrat Jahan",
      Phone: "+880 1712-887766",
      Email: "nusrat.jahan@yahoo.com",
      City: "Rajshahi",
      "Interested Product": "Nike Air Zoom Pegasus 40",
      "Estimated Budget": "15000",
      "Lead Source": "WhatsApp Inquiry",
      "Follow-up Status": "Called - Promised Order Today",
    },
  ];

  if (format === "excel") {
    exportToExcel("SmartShop_Customer_Leads_Template.xlsx", "Leads_Template", sampleLeads);
  } else {
    exportToCSV("SmartShop_Customer_Leads_Template.csv", sampleLeads);
  }
}

