/**
 * Utility to convert numeric currency values into English words for enterprise invoices and receipts.
 */

const ones = [
  "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
  "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen",
  "Seventeen", "Eighteen", "Nineteen"
];

const tens = [
  "", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"
];

function convertLessThanThousand(num: number): string {
  if (num === 0) return "";
  if (num < 20) return ones[num] + " ";
  if (num < 100) return tens[Math.floor(num / 10)] + " " + (num % 10 !== 0 ? ones[num % 10] + " " : "");
  return ones[Math.floor(num / 100)] + " Hundred " + convertLessThanThousand(num % 100);
}

export function numberToWords(amount: number, currencyName: string = "USD"): string {
  if (isNaN(amount) || amount === 0) return `Zero ${currencyName}`;

  const integerPart = Math.floor(Math.abs(amount));
  const decimalPart = Math.round((Math.abs(amount) - integerPart) * 100);

  if (integerPart === 0 && decimalPart === 0) return `Zero ${currencyName}`;

  let words = "";

  const billions = Math.floor(integerPart / 1000000000);
  const millions = Math.floor((integerPart % 1000000000) / 1000000);
  const thousands = Math.floor((integerPart % 1000000) / 1000);
  const remainder = integerPart % 1000;

  if (billions > 0) {
    words += convertLessThanThousand(billions) + "Billion ";
  }
  if (millions > 0) {
    words += convertLessThanThousand(millions) + "Million ";
  }
  if (thousands > 0) {
    words += convertLessThanThousand(thousands) + "Thousand ";
  }
  if (remainder > 0) {
    words += convertLessThanThousand(remainder);
  }

  words = words.trim() + ` ${currencyName}`;

  if (decimalPart > 0) {
    words += ` and ${decimalPart}/100 Cents`;
  } else {
    words += " Only";
  }

  return words;
}
