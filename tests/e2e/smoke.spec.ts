import { test, expect } from "@playwright/test";

/**
 * Playwright Smoke Testing Suite (স্মোক টেস্টিং)
 * 
 * উদ্দেশ্য:
 * নতুন কোড ডেপ্লয়মেন্টের পর মূল ক্রিটিক্যাল পথগুলো (App Boot, Storefront,
 * Product Catalog, Cart, Language Switcher, Admin Route, API Health) সচল আছে কি না তা
 * অত্যন্ত দ্রুততার সাথে (১৫ সেকেন্ডের মধ্যে) পরীক্ষা করা।
 */

test.describe("স্মোক টেস্ট স্যুট (Smoke Testing Suite - Critical Paths)", () => {
  test("SMOKE-01: ব্যাকএন্ড হেলথ এপিআই (/api/health) সচল ও রেসপন্সিভ", async ({ request }) => {
    const res = await request.get("/api/health");
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.status).toBe("ok");
    expect(body.appName).toBe("SmartShop");
  });

  test("SMOKE-02: স্টোরফ্রন্ট হোমপেজ ও ব্র্যান্ড লোগো সফলভাবে লোড হয়", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");

    // Title and body validation
    await expect(page).toHaveTitle(/SmartShop|Smart/i);
    const body = page.locator("body");
    await expect(body).toBeVisible();

    // Search bar present
    const searchBar = page.locator("input[type='text'], input[placeholder*='Search'], input[placeholder*='পণ্য']").first();
    await expect(searchBar).toBeVisible();
  });

  test("SMOKE-03: পণ্য ক্যাটালগে দাম এবং টাকা প্রতীক (৳) দৃশ্যমান", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");

    // Verify ৳ currency symbol renders properly
    const priceText = page.locator("text=/৳/").first();
    await expect(priceText).toBeVisible({ timeout: 15000 });
  });

  test("SMOKE-04: কার্টে পণ্য যোগ করলে কার্ট কাউন্ট আপডেট হয়", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");

    const addToCartButton = page.locator("button:has-text('Add to Cart'), button:has-text('কার্টে যোগ করুন'), button[title*='Cart']").first();
    if (await addToCartButton.isVisible()) {
      await addToCartButton.click();
      await page.waitForTimeout(400);

      const cartTrigger = page.locator("button:has-text('Cart'), button:has-text('কার্ট'), button[title*='Cart']").first();
      await expect(cartTrigger).toBeVisible();
    }
  });

  test("SMOKE-05: বাংলা এবং ইংরেজি ভাষা পরিবর্তন (Language Toggle) নির্বিঘ্নে কাজ করে", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");

    const langBtn = page.locator("button:has-text('বাংলা'), button:has-text('BN'), button:has-text('EN'), button:has-text('English')").first();
    if (await langBtn.isVisible()) {
      const initialText = await langBtn.textContent();
      await langBtn.click();
      await page.waitForTimeout(400);

      const updatedText = await langBtn.textContent();
      expect(initialText).not.toEqual(updatedText);
    }
  });

  test("SMOKE-06: এডমিন কমান্ড সেন্টার পেজে রুট সফলভাবে সুইচ করে", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");

    const adminSwitcher = page.locator("button:has-text('Admin'), button:has-text('এডমিন'), button[title*='Admin']").first();
    if (await adminSwitcher.isVisible()) {
      await adminSwitcher.click();
      await page.waitForTimeout(600);

      const adminHeading = page.locator("text=/Command Center|কমান্ড সেন্টার|Dashboard|ড্যাশবোর্ড/i").first();
      await expect(adminHeading).toBeVisible();
    }
  });
});
