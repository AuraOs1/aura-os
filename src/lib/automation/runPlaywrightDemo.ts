"use server";

import { chromium } from "playwright";
import fs from "fs";
import path from "path";

export async function runPlaywrightGoogleDemo() {
  const logs: string[] = [];
  logs.push("[Playwright Automation] Launching Headless Chromium Browser...");

  try {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();

    logs.push("[Playwright Automation] Navigating to https://www.google.com...");
    await page.goto("https://www.google.com", { waitUntil: "domcontentloaded", timeout: 30000 });

    logs.push("[Playwright Automation] Typing 'ZenBudget' into Google search input...");
    const searchInput = page.locator('textarea[name="q"], input[name="q"]').first();
    await searchInput.fill("ZenBudget");
    await searchInput.press("Enter");

    logs.push("[Playwright Automation] Waiting for Google search results page to load...");
    await page.waitForTimeout(3000);

    const publicDir = path.join(process.cwd(), "public", "screenshots");
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }

    const screenshotPath = path.join(publicDir, "google_zenbudget.png");
    await page.screenshot({ path: screenshotPath });
    logs.push(`[Playwright Automation] Screenshot saved successfully at ${screenshotPath}`);

    await browser.close();
    logs.push("[Playwright Automation] Browser closed cleanly. Automation task SUCCESS!");

    return {
      success: true,
      screenshotUrl: "/screenshots/google_zenbudget.png",
      logs
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Playwright execution error";
    logs.push(`[Playwright Automation ERROR] ${msg}`);
    return {
      success: false,
      logs,
      error: msg
    };
  }
}
