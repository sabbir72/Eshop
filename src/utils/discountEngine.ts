import { Coupon, CartItem, Product, Category, User } from "../types";

export interface DiscountValidationResult {
  isValid: boolean;
  coupon?: Coupon;
  discountAmount: number;
  eligibleSubtotal: number;
  totalSubtotal: number;
  eligibleItems: {
    productId: string;
    productName: string;
    itemPrice: number;
    quantity: number;
    itemSubtotal: number;
    itemDiscount: number;
  }[];
  ineligibleItems: {
    productId: string;
    productName: string;
    itemPrice: number;
    quantity: number;
    reason: string;
  }[];
  scopeType: "GLOBAL" | "CATEGORY" | "PRODUCT" | "PRODUCT_GROUP";
  message: string;
  code: string;
}

/**
 * Pure function to check if a specific cart item matches a coupon's configured scope
 */
export function isItemEligibleForCoupon(
  item: CartItem,
  coupon: Coupon,
  allCategories: Category[] = []
): { isEligible: boolean; reason?: string } {
  const scope = (coupon.scopeType || "GLOBAL").toUpperCase();

  // 1. GLOBAL SCOPE - All items eligible
  if (scope === "GLOBAL") {
    return { isEligible: true };
  }

  // 2. PRODUCT SCOPE - Only explicitly selected products
  if (scope === "PRODUCT") {
    const applicableIds = coupon.applicableProductIds || [];
    const prodId = item.product.id;
    const prodSku = item.product.sku;

    const matched = applicableIds.includes(prodId) || (prodSku && applicableIds.includes(prodSku));
    if (matched) {
      return { isEligible: true };
    }
    return {
      isEligible: false,
      reason: `Item '${item.product.name}' is not in the authorized product list for coupon '${coupon.code}'.`,
    };
  }

  // 3. CATEGORY / PRODUCT GROUP SCOPE
  if (scope === "CATEGORY" || scope === "PRODUCT_GROUP") {
    const applicableCatIds = coupon.applicableCategoryIds || [];
    const itemCatId = item.product.categoryId;
    const itemSubCatId = item.product.subCategoryId;
    const itemCatName = item.product.categoryName?.toLowerCase();

    // Check direct category ID or subcategory ID match
    let matched = Boolean(
      (itemCatId && applicableCatIds.includes(itemCatId)) ||
      (itemSubCatId && applicableCatIds.includes(itemSubCatId))
    );

    // Also check category names or parent category relationships
    if (!matched && applicableCatIds.length > 0) {
      for (const catId of applicableCatIds) {
        const targetCat = allCategories.find((c) => c.id === catId || c.name.toLowerCase() === catId.toLowerCase());
        if (targetCat) {
          if (
            targetCat.name.toLowerCase() === itemCatName ||
            targetCat.id === itemCatId ||
            targetCat.id === itemSubCatId
          ) {
            matched = true;
            break;
          }
          // Check if item category is child of target category
          const itemCat = allCategories.find((c) => c.id === itemCatId);
          if (itemCat && itemCat.parentId === targetCat.id) {
            matched = true;
            break;
          }
        }
      }
    }

    if (matched) {
      return { isEligible: true };
    }

    const scopeLabel = coupon.productGroupName || (coupon.applicableCategoryNames?.join(", ")) || "designated category";
    return {
      isEligible: false,
      reason: `Item '${item.product.name}' (${item.product.categoryName || "uncategorized"}) does not belong to the '${scopeLabel}' scope.`,
    };
  }

  return { isEligible: true };
}

/**
 * Enterprise discount evaluation engine
 * Validates validity, dates, quotas, customer rules, and calculates itemized scope discounts.
 */
export function evaluateCouponDiscount(
  code: string,
  coupon: Coupon | null | undefined,
  cart: CartItem[],
  customer?: Partial<User> | null,
  allCategories: Category[] = [],
  currencySymbol: string = "৳"
): DiscountValidationResult {
  const normalizedCode = code.trim().toUpperCase();

  // 1. Check coupon existence
  if (!coupon) {
    return {
      isValid: false,
      discountAmount: 0,
      eligibleSubtotal: 0,
      totalSubtotal: 0,
      eligibleItems: [],
      ineligibleItems: [],
      scopeType: "GLOBAL",
      message: `Coupon code '${normalizedCode}' is not recognized.`,
      code: normalizedCode,
    };
  }

  // 2. Check active status
  if (coupon.status !== "Active") {
    return {
      isValid: false,
      coupon,
      discountAmount: 0,
      eligibleSubtotal: 0,
      totalSubtotal: 0,
      eligibleItems: [],
      ineligibleItems: [],
      scopeType: (coupon.scopeType as any) || "GLOBAL",
      message: `Coupon '${coupon.code}' is ${coupon.status.toLowerCase()} and cannot be used.`,
      code: coupon.code,
    };
  }

  // 3. Date validity checks
  const todayStr = new Date().toISOString().split("T")[0];
  if (coupon.startDate && coupon.startDate > todayStr) {
    return {
      isValid: false,
      coupon,
      discountAmount: 0,
      eligibleSubtotal: 0,
      totalSubtotal: 0,
      eligibleItems: [],
      ineligibleItems: [],
      scopeType: (coupon.scopeType as any) || "GLOBAL",
      message: `Coupon '${coupon.code}' will become active on ${coupon.startDate}.`,
      code: coupon.code,
    };
  }

  const expiry = coupon.endDate || coupon.expiryDate;
  if (expiry && expiry < todayStr) {
    return {
      isValid: false,
      coupon,
      discountAmount: 0,
      eligibleSubtotal: 0,
      totalSubtotal: 0,
      eligibleItems: [],
      ineligibleItems: [],
      scopeType: (coupon.scopeType as any) || "GLOBAL",
      message: `Coupon '${coupon.code}' expired on ${expiry}.`,
      code: coupon.code,
    };
  }

  // 4. Usage limit checks
  if (typeof coupon.usageLimit === "number" && coupon.usageLimit > 0) {
    if (coupon.usageCount >= coupon.usageLimit) {
      return {
        isValid: false,
        coupon,
        discountAmount: 0,
        eligibleSubtotal: 0,
        totalSubtotal: 0,
        eligibleItems: [],
        ineligibleItems: [],
        scopeType: (coupon.scopeType as any) || "GLOBAL",
        message: `Coupon '${coupon.code}' has reached its maximum global usage quota.`,
        code: coupon.code,
      };
    }
  }

  // 5. Customer eligibility rules
  if (coupon.customerEligibility && coupon.customerEligibility !== "ALL") {
    if (coupon.customerEligibility === "NEW_USERS") {
      const ordersCount = customer?.ordersCount ?? 0;
      if (ordersCount > 0) {
        return {
          isValid: false,
          coupon,
          discountAmount: 0,
          eligibleSubtotal: 0,
          totalSubtotal: 0,
          eligibleItems: [],
          ineligibleItems: [],
          scopeType: (coupon.scopeType as any) || "GLOBAL",
          message: `Coupon '${coupon.code}' is exclusively for first-time customers.`,
          code: coupon.code,
        };
      }
    } else if (coupon.customerEligibility === "VIP_CUSTOMERS") {
      const totalPurchased = customer?.totalPurchase ?? 0;
      if (totalPurchased < 20000) {
        return {
          isValid: false,
          coupon,
          discountAmount: 0,
          eligibleSubtotal: 0,
          totalSubtotal: 0,
          eligibleItems: [],
          ineligibleItems: [],
          scopeType: (coupon.scopeType as any) || "GLOBAL",
          message: `Coupon '${coupon.code}' is reserved for VIP account holders.`,
          code: coupon.code,
        };
      }
    }
  }

  // 6. Cart item validation & Scope filtering
  if (!cart || cart.length === 0) {
    return {
      isValid: false,
      coupon,
      discountAmount: 0,
      eligibleSubtotal: 0,
      totalSubtotal: 0,
      eligibleItems: [],
      ineligibleItems: [],
      scopeType: (coupon.scopeType as any) || "GLOBAL",
      message: "Cart is empty. Add products to apply coupon.",
      code: coupon.code,
    };
  }

  let totalSubtotal = 0;
  let eligibleSubtotal = 0;
  const eligibleItems: DiscountValidationResult["eligibleItems"] = [];
  const ineligibleItems: DiscountValidationResult["ineligibleItems"] = [];

  for (const item of cart) {
    const itemPrice = item.selectedVariant?.price || item.product.discountPrice || item.product.sellingPrice;
    const itemSubtotal = itemPrice * item.quantity;
    totalSubtotal += itemSubtotal;

    const { isEligible, reason } = isItemEligibleForCoupon(item, coupon, allCategories);

    if (isEligible) {
      eligibleSubtotal += itemSubtotal;
      eligibleItems.push({
        productId: item.product.id,
        productName: item.product.name,
        itemPrice,
        quantity: item.quantity,
        itemSubtotal,
        itemDiscount: 0, // Will be computed next
      });
    } else {
      ineligibleItems.push({
        productId: item.product.id,
        productName: item.product.name,
        itemPrice,
        quantity: item.quantity,
        reason: reason || "Excluded by scope rule",
      });
    }
  }

  // 7. Check if ANY items in the cart matched the coupon scope
  if (eligibleItems.length === 0) {
    const scope = (coupon.scopeType || "GLOBAL").toUpperCase();
    let scopeDesc = "selected products";
    if (scope === "CATEGORY" || scope === "PRODUCT_GROUP") {
      scopeDesc = coupon.productGroupName || (coupon.applicableCategoryNames?.join(", ")) || "applicable categories";
    } else if (scope === "PRODUCT") {
      scopeDesc = coupon.applicableProductNames?.join(", ") || "specific products";
    }

    return {
      isValid: false,
      coupon,
      discountAmount: 0,
      eligibleSubtotal: 0,
      totalSubtotal,
      eligibleItems: [],
      ineligibleItems,
      scopeType: (coupon.scopeType as any) || "GLOBAL",
      message: `Coupon '${coupon.code}' is only valid for ${scopeDesc}. None of your cart items qualify.`,
      code: coupon.code,
    };
  }

  // 8. Minimum spend / purchase check (on eligible items or total)
  const minRequired = coupon.minSpend ?? coupon.minPurchase ?? 0;
  if (minRequired > 0 && eligibleSubtotal < minRequired) {
    return {
      isValid: false,
      coupon,
      discountAmount: 0,
      eligibleSubtotal,
      totalSubtotal,
      eligibleItems,
      ineligibleItems,
      scopeType: (coupon.scopeType as any) || "GLOBAL",
      message: `Minimum spend of ${currencySymbol}${minRequired.toLocaleString()} on eligible items required for coupon '${coupon.code}' (current: ${currencySymbol}${eligibleSubtotal.toLocaleString()}).`,
      code: coupon.code,
    };
  }

  // 9. Calculate discount value strictly on ELIGIBLE items
  let totalDiscount = 0;
  const isPercentage = coupon.type === "Percentage";

  if (isPercentage) {
    const rawDiscount = (eligibleSubtotal * coupon.discountValue) / 100;
    const maxCap = coupon.maxDiscount || Infinity;
    totalDiscount = Math.min(rawDiscount, maxCap);

    // Distribute proportionally across eligible items
    for (const item of eligibleItems) {
      const proportion = item.itemSubtotal / eligibleSubtotal;
      item.itemDiscount = Math.round(totalDiscount * proportion * 100) / 100;
    }
  } else {
    // Fixed amount discount
    totalDiscount = Math.min(coupon.discountValue, eligibleSubtotal);
    // Distribute fixed discount across eligible items
    for (const item of eligibleItems) {
      const proportion = item.itemSubtotal / eligibleSubtotal;
      item.itemDiscount = Math.round(totalDiscount * proportion * 100) / 100;
    }
  }

  totalDiscount = Math.round(totalDiscount * 100) / 100;

  // Build helpful success message
  let successMsg = `Coupon '${coupon.code}' applied! Saved ${currencySymbol}${totalDiscount.toLocaleString()}`;
  if (coupon.scopeType && coupon.scopeType !== "GLOBAL") {
    if (coupon.scopeType === "CATEGORY" || coupon.scopeType === "PRODUCT_GROUP") {
      const catNames = coupon.productGroupName || coupon.applicableCategoryNames?.join(", ") || "category items";
      successMsg += ` on ${catNames}`;
    } else if (coupon.scopeType === "PRODUCT") {
      successMsg += ` on eligible product(s)`;
    }
    if (ineligibleItems.length > 0) {
      successMsg += ` (${ineligibleItems.length} other item${ineligibleItems.length === 1 ? "" : "s"} not eligible)`;
    }
  }

  return {
    isValid: true,
    coupon,
    discountAmount: totalDiscount,
    eligibleSubtotal,
    totalSubtotal,
    eligibleItems,
    ineligibleItems,
    scopeType: (coupon.scopeType as any) || "GLOBAL",
    message: successMsg,
    code: coupon.code,
  };
}
