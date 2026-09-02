import Papa from "papaparse";
import { jsPDF } from "jspdf";
import * as XLSX from "xlsx";

// CSV Export
export function exportToCSV(filename: string, rows: Record<string, any>[]) {
  const csv = Papa.unparse(rows);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `${filename.replace(/\.csv$/, "")}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Excel Export (.xlsx)
export function exportToExcel(filename: string, sheetName: string, rows: Record<string, any>[]) {
  const worksheet = XLSX.utils.json_to_sheet(rows);

  // Set column widths dynamically
  const colWidths = Object.keys(rows[0] || {}).map((key) => {
    const maxLen = Math.max(
      key.length,
      ...rows.map((r) => (r[key] ? String(r[key]).length : 0))
    );
    return { wch: Math.min(Math.max(maxLen + 3, 12), 40) };
  });
  worksheet["!cols"] = colWidths;

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName || "Data");

  const cleanFilename = filename.endsWith(".xlsx") ? filename : `${filename}.xlsx`;
  XLSX.writeFile(workbook, cleanFilename);
}

// PDF Export
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
      .map(([k, v]) => `${k}: ${String(v).replace(/৳/g, "Tk ")}`)
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
          resolve(json);
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
          resolve(results.data);
        },
        error: (err) => reject(err),
      });
    }
  });
}
