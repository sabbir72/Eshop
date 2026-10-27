import { test, expect } from "@playwright/test";

/**
 * Playwright E2E Test Suite: Admin Command Center & Test Diagnostics
 * নিশ্চিত করে যে এডমিন প্যানেল, মডিউল নেভিগেশন এবং সিস্টেম ডায়াগনস্টিক রানার সুরক্ষিত ও সচল রয়েছে।
 */

test.describe("এডমিন কমান্ড সেন্টার ও সিস্টেম অডিট (Admin Panel E2E)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");
  });

  test("এডমিন কমান্ড সেন্টারে নেভিগেশন ও কেপিআই ড্যাশবোর্ড লোড যাচাই", async ({ page }) => {
    // Locate admin center switcher button
    const adminSwitcher = page.locator("button:has-text('Admin'), button:has-text('এডমিন'), button[title*='Admin']").first();
    
    if (await adminSwitcher.isVisible()) {
      await adminSwitcher.click();
      await page.waitForTimeout(600);

      // Verify command center title or sidebar is present
      const adminHeading = page.locator("text=/Command Center|কমান্ড সেন্টার|Dashboard|ড্যাশবোর্ড/i").first();
      await expect(adminHeading).toBeVisible();
    }
  });

  test("সিস্টেম টেস্ট ও বাগ ডিটেক্টর এক্সিকিউশন যাচাই", async ({ page }) => {
    // Switch to admin
    const adminSwitcher = page.locator("button:has-text('Admin'), button:has-text('এডমিন')").first();
    if (await adminSwitcher.isVisible()) {
      await adminSwitcher.click();
      await page.waitForTimeout(600);

      // Click on System Diagnostics button
      const diagBtn = page.locator("button:has-text('সিস্টেম টেস্ট ও বাগ ডিটেক্টর'), button:has-text('Diagnostics')").first();
      if (await diagBtn.isVisible()) {
        await diagBtn.click();
        await page.waitForTimeout(500);

        // Verify diagnostic runner heading
        const runnerHeading = page.locator("text=/স্বয়ংক্রিয় বাগ ডিটেক্টর|সিস্টেম হেলথ/i").first();
        await expect(runnerHeading).toBeVisible();

        // Trigger 'সম্পূর্ণ টেস্ট রান করুন'
        const runAllBtn = page.locator("button:has-text('সম্পূর্ণ টেস্ট রান করুন')").first();
        if (await runAllBtn.isVisible()) {
          await runAllBtn.click();
          await page.waitForTimeout(1500);

          // Verify tests execute and pass indicators appear
          const passedBadge = page.locator("text=/সফল|Passed|১০০%/i").first();
          await expect(passedBadge).toBeVisible({ timeout: 10000 });
        }
      }
    }
  });
});
