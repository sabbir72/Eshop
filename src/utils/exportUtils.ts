import Papa from "papaparse";
import { jsPDF } from "jspdf";
import * as XLSX from "xlsx";
import { parseSafeNumber, formatNumber, formatCurrency, sanitizeExportRow } from "./numberUtils";

export { parseSafeNumber, formatNumber, formatCurrency, sanitizeExportRow };

// CSV Export with proper escaping and numeric normalization
export function exportToCSV(filename: string, rows: Record<string, any>[]) {
  // Ensure rows are sanitized and numbers are formatted
  const sanitizedRows = rows.map((r) => sanitizeExportRow(r));
  const csv = Papa.unparse(sanitizedRows, {
    quotes: true, // Quote fields to prevent commas in formatted numbers from breaking columns
  });
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" }); // Add UTF-8 BOM for Excel compatibility
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `${filename.replace(/\.csv$/, "")}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Excel Export (.xlsx) with proper numeric formatting and number formats
export function exportToExcel(filename: string, sheetName: string, rows: Record<string, any>[]) {
  const sanitizedRows = rows.map((r) => sanitizeExportRow(r));
  const worksheet = XLSX.utils.json_to_sheet(sanitizedRows);

  // Apply number formatting to numeric cells
  const range = XLSX.utils.decode_range(worksheet["!ref"] || "A1:A1");
  for (let R = range.s.r + 1; R <= range.e.r; ++R) {
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
      const cell = worksheet[cellAddress];
      if (cell && cell.t === "n") {
        // Format decimal numbers with 2 decimal places and commas
        if (cell.v % 1 !== 0) {
          cell.z = "#,##0.00";
        } else {
          cell.z = "#,##0";
        }
      }
    }
  }

  // Set column widths dynamically
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

// PDF Export with clean typography and formatted numbers
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

// Download Sample Product Import Template (Both Excel & CSV)
export function downloadSampleBulkUploadTemplate(format: "excel" | "csv" = "excel") {
  const templateData = [
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
    }
  ];

  if (format === "excel") {
    exportToExcel("sample_product_bulk_import_template.xlsx", "ProductTemplate", templateData);
  } else {
    exportToCSV("sample_product_bulk_import_template", templateData);
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
          // Normalize row keys and trim string values
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
