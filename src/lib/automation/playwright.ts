"use server";

import { chromium } from "playwright";
import fs from "fs";
import path from "path";

export interface AutomationResult {
  success: boolean;
  screenshotPath?: string;
  logs: string[];
  error?: string;
}

export async function executePlaywrightBrowserTask(
  targetUrl: string,
  taskDescription: string
): Promise<AutomationResult> {
  const logs: string[] = [];
  logs.push(`[Playwright Engine] Launching Chromium browser for task: "${taskDescription}"`);

  try {
    const browser = await chromium.launch({
      headless: true,
    });

    const context = await browser.newContext({
      viewport: { width: 1280, height: 720 },
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    });

    const page = await context.newPage();
    logs.push(`[Playwright Engine] Navigating to ${targetUrl}...`);
    
    await page.goto(targetUrl, { waitUntil: "domcontentloaded", timeout: 30000 });
    const pageTitle = await page.title();
    logs.push(`[Playwright Engine] Page loaded successfully. Title: "${pageTitle}"`);

    // Capture screenshot artifact
    const artifactsDir = path.join(process.cwd(), "public", "screenshots");
    if (!fs.existsSync(artifactsDir)) {
      fs.mkdirSync(artifactsDir, { recursive: true });
    }

    const filename = `automation_${Date.now()}.png`;
    const screenshotPath = path.join(artifactsDir, filename);
    await page.screenshot({ path: screenshotPath, fullPage: false });
    logs.push(`[Playwright Engine] Execution screenshot captured at /screenshots/${filename}`);

    await browser.close();
    logs.push(`[Playwright Engine] Browser closed cleanly. Task complete.`);

    return {
      success: true,
      screenshotPath: `/screenshots/${filename}`,
      logs,
    };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Playwright execution failed";
    logs.push(`[Playwright Engine ERROR] ${errorMessage}`);
    return {
      success: false,
      logs,
      error: errorMessage,
    };
  }
}
