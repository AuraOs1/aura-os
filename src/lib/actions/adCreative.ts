"use server";

import fs from "fs";
import path from "path";
import { revalidatePath } from "next/cache";

export interface GeneratedAdAsset {
  id: string;
  brandName: string;
  platform: "INSTAGRAM_POST" | "INSTAGRAM_STORY" | "LINKEDIN_BANNER" | "TWITTER_HEADER";
  headline: string;
  caption: string;
  imageUrl: string;
  dimensions: string;
  folderPath: string;
  createdAt: string;
  watermarkFree: boolean;
}

// Ensure local media folder exists
function getCreativeFolder(brandName: string): string {
  const dateStr = new Date().toISOString().split("T")[0];
  const relativePath = `/media/creatives/${brandName.toLowerCase().replace(/[^a-z0-9]/g, "_")}/${dateStr}`;
  const fullPath = path.join(process.cwd(), "public", relativePath);

  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
  }

  return relativePath;
}

export async function generateAdCreative(
  brandName = "ZenBudget",
  platform: "INSTAGRAM_POST" | "INSTAGRAM_STORY" | "LINKEDIN_BANNER" | "TWITTER_HEADER" = "INSTAGRAM_POST",
  prompt = "Create high-converting ad for ZenBudget expense tracker"
) {
  try {
    const folderPath = getCreativeFolder(brandName);

    // Determine dimensions
    let dimensions = "1080x1080";
    let width = 1080;
    let height = 1080;
    if (platform === "INSTAGRAM_STORY") {
      dimensions = "1080x1920";
      width = 1080;
      height = 1920;
    } else if (platform === "LINKEDIN_BANNER") {
      dimensions = "1584x396";
      width = 1584;
      height = 396;
    } else if (platform === "TWITTER_HEADER") {
      dimensions = "1500x500";
      width = 1500;
      height = 500;
    }

    // High-Resolution SVG Watermark-Free Ad Canvas Template matching https://zenbudget-tracker.vercel.app/
    const fileName = `ad_${platform.toLowerCase()}_${Date.now()}.svg`;
    const fullFilePath = path.join(process.cwd(), "public", folderPath, fileName);
    const publicUrl = `${folderPath}/${fileName}`;

    const brandColors: Record<string, { bg1: string; bg2: string; text: string; accent: string }> = {
      ZenBudget: { bg1: "#0a0f1e", bg2: "#052e16", text: "#f0fdf4", accent: "#22c55e" },
      "AURA OS": { bg1: "#1e1b4b", bg2: "#0f172a", text: "#f5f3ff", accent: "#6366f1" },
      "LeadFlow AI": { bg1: "#1e3a8a", bg2: "#172554", text: "#eff6ff", accent: "#3b82f6" },
      "CS Design": { bg1: "#701a75", bg2: "#4a044e", text: "#fdf4ff", accent: "#d946ef" },
    };

    const palette = brandColors[brandName] || brandColors["ZenBudget"];

    const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${palette.bg1}" />
      <stop offset="100%" stop-color="${palette.bg2}" />
    </linearGradient>
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="20" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
  </defs>

  <!-- Background -->
  <rect width="100%" height="100%" fill="url(#bgGrad)" />

  <!-- Decorative Glowing Orbs -->
  <circle cx="${width * 0.82}" cy="${height * 0.2}" r="${width * 0.25}" fill="${palette.accent}" opacity="0.2" filter="url(#glow)" />
  <circle cx="${width * 0.15}" cy="${height * 0.85}" r="${width * 0.2}" fill="${palette.accent}" opacity="0.12" filter="url(#glow)" />

  <!-- Brand Header Badge -->
  <rect x="60" y="60" width="240" height="52" rx="26" fill="rgba(255,255,255,0.06)" stroke="${palette.accent}" stroke-opacity="0.5" stroke-width="1.5" />
  <text x="180" y="93" font-family="'Manrope', 'Inter', sans-serif" font-size="16" font-weight="800" fill="${palette.accent}" text-anchor="middle" letter-spacing="2">ZENBUDGET AI</text>

  <!-- Main Headline from Live Site -->
  <text x="60" y="${height * 0.38}" font-family="'Manrope', 'Inter', sans-serif" font-size="${height > 600 ? 46 : 28}" font-weight="800" fill="${palette.text}">
    Track Every Rupee.
  </text>
  <text x="60" y="${height * 0.38 + (height > 600 ? 58 : 36)}" font-family="'Manrope', 'Inter', sans-serif" font-size="${height > 600 ? 46 : 28}" font-weight="800" fill="${palette.accent}">
    Save Every Month.
  </text>

  <!-- Key Features Bullet List -->
  <text x="60" y="${height * 0.58}" font-family="'Manrope', sans-serif" font-size="${height > 600 ? 20 : 14}" font-weight="600" fill="rgba(255,255,255,0.85)">
    ✓ Daily Smart Spending Limit Warning
  </text>
  <text x="60" y="${height * 0.58 + 35}" font-family="'Manrope', sans-serif" font-size="${height > 600 ? 20 : 14}" font-weight="600" fill="rgba(255,255,255,0.85)">
    ✓ Impulse Buy Blocker (48-Hour Pause)
  </text>
  <text x="60" y="${height * 0.58 + 70}" font-family="'Manrope', sans-serif" font-size="${height > 600 ? 20 : 14}" font-weight="600" fill="rgba(255,255,255,0.85)">
    ✓ Shared Couples &amp; Family Budgeting
  </text>

  <!-- Call to Action Button -->
  <rect x="60" y="${height * 0.78}" width="${height > 600 ? 320 : 220}" height="${height > 600 ? 68 : 46}" rx="20" fill="${palette.accent}" />
  <text x="${60 + (height > 600 ? 160 : 110)}" y="${height * 0.78 + (height > 600 ? 41 : 28)}" font-family="'Manrope', sans-serif" font-size="${height > 600 ? 18 : 14}" font-weight="800" fill="#000000" text-anchor="middle">
    TRY ZENBUDGET FREE 🚀
  </text>
</svg>`;

    fs.writeFileSync(fullFilePath, svgContent, "utf-8");

    const asset: GeneratedAdAsset = {
      id: `ad-${Date.now()}`,
      brandName,
      platform,
      headline: "Track Every Rupee, Save Every Month.",
      caption: `💚 Stop overspending! ZenBudget is India's top-rated AI Expense Tracker & Daily Budget Planner App.\n\n✨ Features:\n• Daily Smart Spending Limits\n• 48-Hour Impulse Buy Blocker\n• Shared Couples Budgeting\n• Weekly Spotify-Style Money Wrapped\n\n👉 Try live now: https://zenbudget-tracker.vercel.app/\n\n#ZenBudget #KharchaTracker #HisabKitab #ExpenseTracker #SaveMoneyIndia`,
      imageUrl: publicUrl,
      dimensions,
      folderPath,
      createdAt: new Date().toISOString(),
      watermarkFree: true,
    };

    revalidatePath("/dashboard");
    revalidatePath("/knowledge");

    return {
      success: true,
      message: `Live Brand Tailored Ad Asset created for ${brandName} and saved into folder: public${folderPath}/${fileName}`,
      asset,
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to generate ad creative";
    return { success: false, error: message };
  }
}
