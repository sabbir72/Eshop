import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright E2E Testing Configuration for Smart E-Commerce Platform
 * 
 * রানিং গাইড:
 * - npx playwright test
 * - npm run test:e2e
 * - npm run test:agent (স্বয়ংক্রিয় টেস্ট এজেন্ট এবং অ্যাডমিন অ্যালার্ট সিঙ্ক)
 */
export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 45000,
  expect: {
    timeout: 10000,
  },
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 1,
  workers: 1, // Single worker prevents database/state contention
  reporter: [
    ["list"],
    ["html", { outputFolder: "playwright-report", open: "never" }],
    ["json", { outputFile: "test-results/playwright-results.json" }],
  ],
  use: {
    baseURL: process.env.BASE_URL || "http://localhost:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    headless: true,
    viewport: { width: 1280, height: 720 },
    ignoreHTTPSErrors: true,
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "mobile-chrome",
      use: { ...devices["Pixel 5"] },
    },
  ],
  webServer: process.env.CI
    ? undefined
    : {
        command: "npm run dev",
        url: "http://localhost:3000",
        reuseExistingServer: true,
        timeout: 60000,
      },
});
