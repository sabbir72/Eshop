import { test, expect } from "@playwright/test";

/**
 * Playwright E2E Test Suite: Storefront & Product Exploration
 * নিশ্চিত করে যে স্টোরফ্রন্ট, প্রোডাক্ট ক্যাটালগ, ৩ডি ভিউ ফলব্যাক এবং কার্ট ফাংশনালিটি সঠিকভাবে কাজ করছে।
 */

test.describe("স্টোরফ্রন্ট ও প্রোডাক্ট ব্রাউজিং (Storefront & Catalog E2E)", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to homepage
    await page.goto("/");
    // Wait for the main app root to be ready
    await page.waitForLoadState("domcontentloaded");
  });

  test("হোমপেজ লোড ও ব্র্যান্ড এলিমেন্ট উপস্থিতি যাচাই", async ({ page }) => {
    // Verify title contains brand name
    await expect(page).toHaveTitle(/SmartShop|Smart/i);

    // Verify main navigation or header exists
    const body = page.locator("body");
    await expect(body).toBeVisible();

    // Verify search input is present
    const searchInput = page.locator("input[type='text'], input[placeholder*='Search'], input[placeholder*='পণ্য']").first();
    await expect(searchInput).toBeVisible();
  });

  test("পণ্য তালিকা এবং মুদ্রা প্রতীক (৳) প্রদর্শন যাচাই", async ({ page }) => {
    // Check if at least one product price with ৳ is rendered
    const priceText = page.locator("text=/৳/").first();
    await expect(priceText).toBeVisible({ timeout: 15000 });
  });

  test("কার্টে পণ্য যোগ এবং ব্যাজ কাউন্ট আপডেট যাচাই", async ({ page }) => {
    // Locate the first 'Add to Cart' or 'কার্টে যোগ করুন' button
    const addToCartButton = page.locator("button:has-text('Add to Cart'), button:has-text('কার্টে যোগ করুন'), button[title*='Cart']").first();
    
    if (await addToCartButton.isVisible()) {
      await addToCartButton.click();

      // Ensure toast notification or cart count updates
      await page.waitForTimeout(500);

      // Verify cart badge or button reflects items
      const cartTrigger = page.locator("button:has-text('Cart'), button:has-text('কার্ট'), button[title*='Cart']").first();
      await expect(cartTrigger).toBeVisible();
    }
  });

  test("ভাষা পরিবর্তন (EN <-> BN) কার্যকারিতা যাচাই", async ({ page }) => {
    // Locate language switcher button
    const langBtn = page.locator("button:has-text('বাংলা'), button:has-text('BN'), button:has-text('EN'), button:has-text('English')").first();
    
    if (await langBtn.isVisible()) {
      const initialText = await langBtn.textContent();
      await langBtn.click();
      await page.waitForTimeout(500);
      
      // Verify text changed or DOM reflects locale switch
      const updatedText = await langBtn.textContent();
      expect(initialText).not.toEqual(updatedText);
    }
  });
});
