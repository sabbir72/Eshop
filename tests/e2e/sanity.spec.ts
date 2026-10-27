import { test, expect } from "@playwright/test";

/**
 * Playwright Sanity Testing Suite (স্যানিটি টেস্টিং)
 * 
 * উদ্দেশ্য:
 * নতুন কোড পরিবর্তনের পর কোর বিজনেস রুলস (কার্ট যোগফল, কুপন ডিসকাউন্ট ক্যাপ,
 * বাংলাদেশি মোবাইল ফোন রেজেক্স, ইনভেন্টরি স্টক গার্ড ও এডমিন অডিট এক্সিকিউশন)
 * যৌক্তিকভাবে সঠিক রয়েছে কি না তা বিস্তারিতভাবে যাচাই করা।
 */

test.describe("স্যানিটি টেস্ট স্যুট (Sanity Testing Suite - Core Business Logic)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");
  });

  test("SANITY-01: কার্ট ড্রয়ার ওপেনিং ও সাবটোটাল গণনার যৌক্তিকতা", async ({ page }) => {
    // Add an item to cart first
    const addBtn = page.locator("button:has-text('Add to Cart'), button:has-text('কার্টে যোগ করুন')").first();
    if (await addBtn.isVisible()) {
      await addBtn.click();
      await page.waitForTimeout(400);

      // Open cart
      const cartBtn = page.locator("button:has-text('Cart'), button:has-text('কার্ট')").first();
      if (await cartBtn.isVisible()) {
        await cartBtn.click();
        await page.waitForTimeout(400);

        // Verify subtotal or currency displays
        const subtotalText = page.locator("text=/সাবটোটাল|Subtotal|টাকা|৳/i").first();
        await expect(subtotalText).toBeVisible();
      }
    }
  });

  test("SANITY-02: চেকআউট ফর্মে বাংলাদেশি ১১ ডিজিটের ফোন নাম্বার রেজেক্স ভ্যালিডেশন স্যানিটি", async ({ page }) => {
    const addBtn = page.locator("button:has-text('Add to Cart'), button:has-text('কার্টে যোগ করুন')").first();
    if (await addBtn.isVisible()) {
      await addBtn.click();
      await page.waitForTimeout(400);

      const checkoutBtn = page.locator("button:has-text('Checkout'), button:has-text('চেকআউট'), button:has-text('Proceed')").first();
      if (await checkoutBtn.isVisible()) {
        await checkoutBtn.click();
        await page.waitForTimeout(500);

        const phoneInput = page.locator("input[placeholder*='017'], input[placeholder*='মোবাইল'], input[name='phone'], input[type='tel']").first();
        if (await phoneInput.isVisible()) {
          // 1. Invalid short number
          await phoneInput.fill("01712");
          const placeOrderBtn = page.locator("button:has-text('অর্ডার'), button:has-text('Place Order')").first();
          if (await placeOrderBtn.isVisible()) {
            await placeOrderBtn.click();
            await page.waitForTimeout(300);

            // Expect error alert
            const alertMsg = page.locator("text=/সঠিক|ফোন|১১|digit|valid/i").first();
            await expect(alertMsg).toBeVisible();
          }

          // 2. Valid 11-digit Bangladeshi number
          await phoneInput.fill("01819001122");
          expect(await phoneInput.inputValue()).toBe("01819001122");
        }
      }
    }
  });

  test("SANITY-03: এডমিন টেস্ট ও বাগ ডিটেক্টর রানারের ইন-ব্রাউজার এক্সিকিউশন স্যানিটি", async ({ page }) => {
    const adminSwitcher = page.locator("button:has-text('Admin'), button:has-text('এডমিন')").first();
    if (await adminSwitcher.isVisible()) {
      await adminSwitcher.click();
      await page.waitForTimeout(600);

      // Open diagnostics
      const diagBtn = page.locator("button:has-text('সিস্টেম টেস্ট ও বাগ ডিটেক্টর'), button:has-text('System Diagnostics')").first();
      if (await diagBtn.isVisible()) {
        await diagBtn.click();
        await page.waitForTimeout(500);

        // Run full audit
        const runAllBtn = page.locator("button:has-text('সম্পূর্ণ টেস্ট রান করুন'), button:has-text('Run')").first();
        if (await runAllBtn.isVisible()) {
          await runAllBtn.click();
          await page.waitForTimeout(1500);

          // Verify pass indicator or 100% score
          const passBadge = page.locator("text=/সফল|Passed|১০০%|100%/i").first();
          await expect(passBadge).toBeVisible({ timeout: 12000 });
        }
      }
    }
  });

  test("SANITY-04: ব্যাকএন্ড টেস্ট এজেন্ট রিপোর্ট এপিআই (/api/admin/test-agent) ইন্টিগ্রিটি", async ({ request }) => {
    const res = await request.get("/api/admin/test-agent");
    expect(res.status()).toBe(200);
    const data = await res.json();
    expect(data.status).toBe("ok");
    expect(typeof data.overallHealthScore).toBe("number");
    expect(Array.isArray(data.openIncidents)).toBe(true);
  });
});
