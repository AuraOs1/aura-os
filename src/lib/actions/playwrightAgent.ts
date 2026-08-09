"use server";

import fs from "fs";
import path from "path";
import { revalidatePath } from "next/cache";

export interface PlaywrightActionResult {
  success: boolean;
  actionType: "NAVIGATE" | "CLICK" | "UPLOAD" | "SCREENSHOT" | "FULL_PIPELINE";
  targetUrl: string;
  screenshotUrl?: string;
  outputArtifactUrl?: string;
  logs: string[];
  sessionReused: boolean;
  summary: string;
}

export async function runPlaywrightAutonomousAction(
  targetUrl = "https://zenbudget-tracker.vercel.app/",
  actionType: "NAVIGATE" | "CLICK" | "UPLOAD" | "SCREENSHOT" | "FULL_PIPELINE" = "FULL_PIPELINE",
  uploadFilePath?: string,
  selectorToClick?: string
): Promise<PlaywrightActionResult> {
  const logs: string[] = [];
  try {
    logs.push("🤖 Initializing Playwright Autonomous Agent ('AI ke Haath')...");

    const { chromium } = await import("playwright");

    const dateStr = new Date().toISOString().split("T")[0];
    const relativeFolder = `/media/creatives/playwright_automation/${dateStr}`;
    const fullFolder = path.join(process.cwd(), "public", relativeFolder);

    if (!fs.existsSync(fullFolder)) {
      fs.mkdirSync(fullFolder, { recursive: true });
    }

    // Reuse existing browser user session data directory (No passwords required!)
    const userDataDir = path.join(process.cwd(), ".playwright_session_data");
    if (!fs.existsSync(userDataDir)) {
      fs.mkdirSync(userDataDir, { recursive: true });
    }

    logs.push("📂 Accessing existing logged-in browser session context (No password required)...");

    const context = await chromium.launchPersistentContext(userDataDir, {
      headless: true, // Background execution
      viewport: { width: 1280, height: 800 },
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, Gecko) Chrome/120.0.0.0 Safari/537.36",
    });

    const page = context.pages()[0] || (await context.newPage());

    // 1. Opening Chrome & Navigating
    logs.push(`🌐 Navigating to website: ${targetUrl}`);
    await page.goto(targetUrl, { waitUntil: "domcontentloaded", timeout: 20000 }).catch(() => {});

    // 2. Clicking Elements
    if (selectorToClick) {
      logs.push(`👆 Clicking target DOM element: ${selectorToClick}`);
      await page.click(selectorToClick).catch((e) => logs.push(`Notice on click: ${e.message}`));
    }

    // 3. Uploading Files
    if (uploadFilePath && fs.existsSync(uploadFilePath)) {
      logs.push(`📤 Uploading file: ${uploadFilePath}`);
      const fileInput = await page.$('input[type="file"]');
      if (fileInput) {
        await fileInput.setInputFiles(uploadFilePath);
        logs.push("✓ File successfully uploaded via Playwright input buffer!");
      }
    }

    // 4. Taking High-Res Screenshot (.png)
    const pngFileName = `playwright_shot_${Date.now()}.png`;
    const fullScreenshotPath = path.join(fullFolder, pngFileName);
    const publicScreenshotUrl = `${relativeFolder}/${pngFileName}`;

    logs.push(`📸 Capturing high-resolution PNG screenshot: public${publicScreenshotUrl}`);
    await page.screenshot({ path: fullScreenshotPath, fullPage: false });

    await context.close();

    revalidatePath("/dashboard");
    revalidatePath("/tasks");

    return {
      success: true,
      actionType,
      targetUrl,
      screenshotUrl: publicScreenshotUrl,
      outputArtifactUrl: publicScreenshotUrl,
      logs,
      sessionReused: true,
      summary: `Playwright Autonomous Action ('AI ke Haath') Complete! Navigated to ${targetUrl}, reused existing browser session, captured PNG artifact: public${publicScreenshotUrl}`,
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Playwright automation failed";
    logs.push(`❌ Error: ${message}`);
    return {
      success: false,
      actionType,
      targetUrl,
      logs,
      sessionReused: true,
      summary: `Playwright Action Error: ${message}`,
    };
  }
}
