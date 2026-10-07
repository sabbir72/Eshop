/**
 * Comprehensive Numeric & Currency Utilities for Smart E-Commerce
 * Ensures accurate decimal and comma handling for inputs, exports, invoices, and calculations.
 */

/**
 * Safely parses any number, numeric string, or localized currency string with commas/decimals.
 * Examples:
 *   "1,250.50" -> 1250.5
 *   "95,000" -> 95000
 *   "1.250,50" -> 1250.5 (European decimal format)
 *   "1250,50" -> 1250.5
 *   "৳ 1,250.00" -> 1250.0
 *   "$99.95" -> 99.95
 */
export function parseSafeNumber(value: any, fallback: number = 0): number {
  if (value === null || value === undefined || value === "") {
    return fallback;
  }

  if (typeof value === "number") {
    return isNaN(value) ? fallback : value;
  }

  const str = String(value).trim();
  if (!str) return fallback;

  // Remove currency symbols (৳, $, €, £, Tk, BDT, etc.) and spaces
  let cleaned = str.replace(/[৳$€£¥\s]|(Tk|BDT|USD|EUR)\.?/gi, "").trim();

  // If empty after stripping symbols
  if (!cleaned) return fallback;

  // Check if string contains both comma and period (e.g. "1,250.50" or "1.250,50")
  const hasComma = cleaned.includes(",");
  const hasDot = cleaned.includes(".");

  if (hasComma && hasDot) {
    const lastComma = cleaned.lastIndexOf(",");
    const lastDot = cleaned.lastIndexOf(".");

    if (lastDot > lastComma) {
      // Standard English format: "1,250.50" -> strip commas
      cleaned = cleaned.replace(/,/g, "");
    } else {
      // European format: "1.250,50" -> strip dots, replace comma with dot
      cleaned = cleaned.replace(/\./g, "").replace(/,/g, ".");
    }
  } else if (hasComma && !hasDot) {
    // String contains comma only: could be "95,000" (thousand separator) or "1250,50" (decimal separator)
    const parts = cleaned.split(",");
    if (parts.length === 2 && parts[1].length <= 2) {
      // e.g. "1250,50" or "99,5" -> decimal comma
      cleaned = cleaned.replace(/,/g, ".");
    } else {
      // e.g. "95,000" or "1,250,000" -> thousand separator
      cleaned = cleaned.replace(/,/g, "");
    }
  }

  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? fallback : parsed;
}

/**
 * Formats a number with comma thousand separators and fixed decimal places.
 * Examples:
 *   formatNumber(1250.5, 2) -> "1,250.50"
 *   formatNumber(95000, 2) -> "95,000.00"
 *   formatNumber(95000, 0) -> "95,000"
 */
export function formatNumber(
  value: any,
  decimals: number = 2,
  useGrouping: boolean = true
): string {
  const num = parseSafeNumber(value, 0);

  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
    useGrouping,
  }).format(num);
}

/**
 * Formats a value as a localized currency string with commas and decimals.
 * Examples:
 *   formatCurrency(1250.5, "৳", 2) -> "৳1,250.50"
 *   formatCurrency(99, "$", 2) -> "$99.00"
 */
export function formatCurrency(
  value: any,
  symbol: string = "৳",
  decimals: number = 2
): string {
  const formatted = formatNumber(value, decimals, true);
  return `${symbol}${formatted}`;
}

/**
 * Sanitizes an object of values for CSV/Excel export, ensuring numbers have consistent decimals
 * and are formatted without corrupted separators.
 */
export function sanitizeExportRow(row: Record<string, any>): Record<string, any> {
  const result: Record<string, any> = {};

  for (const [key, val] of Object.entries(row)) {
    if (typeof val === "number") {
      // Round to 2 decimals for floating point math errors
      result[key] = Math.round(val * 100) / 100;
    } else if (typeof val === "string") {
      const trimmed = val.trim();
      // Check if string is a numeric or currency value (e.g. "1,250.50", "95,000", "৳ 1,200", "$45.99")
      const lowerKey = key.toLowerCase();
      const isMonetaryKey =
        lowerKey.includes("price") ||
        lowerKey.includes("cost") ||
        lowerKey.includes("discount") ||
        lowerKey.includes("total") ||
        lowerKey.includes("amount") ||
        lowerKey.includes("tax") ||
        lowerKey.includes("charge") ||
        lowerKey.includes("revenue") ||
        lowerKey.includes("spent") ||
        lowerKey.includes("subtotal") ||
        lowerKey.includes("balance");

      if (isMonetaryKey && /^[৳$€£¥\sA-Za-z0-9,.-]+$/.test(trimmed) && /[0-9]/.test(trimmed)) {
        const num = parseSafeNumber(trimmed, NaN);
        if (!isNaN(num)) {
          result[key] = Math.round(num * 100) / 100;
          continue;
        }
      }

      if (/^[0-9]+(\.[0-9]+)?$/.test(trimmed)) {
        const num = parseFloat(trimmed);
        result[key] = Math.round(num * 100) / 100;
      } else {
        result[key] = val;
      }
    } else {
      result[key] = val;
    }
  }

  return result;
}
