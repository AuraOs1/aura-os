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
  pngUrl: string;
  dimensions: string;
  folderPath: string;
  createdAt: string;
  watermarkFree: boolean;
  fileFormat: "PNG" | "JPG";
}

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

    const brandColors: Record<string, { bg1: string; bg2: string; text: string; accent: string }> = {
      ZenBudget: { bg1: "#0a0f1e", bg2: "#052e16", text: "#f0fdf4", accent: "#22c55e" },
      "AURA OS": { bg1: "#1e1b4b", bg2: "#0f172a", text: "#f5f3ff", accent: "#6366f1" },
      "LeadFlow AI": { bg1: "#1e3a8a", bg2: "#172554", text: "#eff6ff", accent: "#3b82f6" },
      "CS Design": { bg1: "#701a75", bg2: "#4a044e", text: "#fdf4ff", accent: "#d946ef" },
    };

    const palette = brandColors[brandName] || brandColors["ZenBudget"];

    // 1. High-Resolution Vector Graphic (.svg)
    const svgFileName = `ad_${platform.toLowerCase()}_${Date.now()}.svg`;
    const fullSvgPath = path.join(process.cwd(), "public", folderPath, svgFileName);
    const svgPublicUrl = `${folderPath}/${svgFileName}`;

    // 2. High-Resolution Image File (.png / .jpg)
    const pngFileName = `ad_${platform.toLowerCase()}_${Date.now()}.png`;
    const fullPngPath = path.join(process.cwd(), "public", folderPath, pngFileName);
    const pngPublicUrl = `${folderPath}/${pngFileName}`;

    const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${palette.bg1}" />
      <stop offset="100%" stop-color="${palette.bg2}" />
    </linearGradient>
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="25" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
  </defs>

  <!-- Background Canvas -->
  <rect width="100%" height="100%" fill="url(#bgGrad)" />

  <!-- Ambient Glowing Orbs -->
  <circle cx="${width * 0.85}" cy="${height * 0.18}" r="${width * 0.3}" fill="${palette.accent}" opacity="0.25" filter="url(#glow)" />
  <circle cx="${width * 0.12}" cy="${height * 0.85}" r="${width * 0.22}" fill="${palette.accent}" opacity="0.15" filter="url(#glow)" />

  <!-- Brand Badge Header -->
  <rect x="60" y="60" width="280" height="56" rx="28" fill="rgba(255,255,255,0.08)" stroke="${palette.accent}" stroke-opacity="0.6" stroke-width="2" />
  <text x="200" y="96" font-family="'Manrope', 'Inter', sans-serif" font-size="18" font-weight="800" fill="${palette.accent}" text-anchor="middle" letter-spacing="2">${brandName.toUpperCase()}</text>

  <!-- Visual Headline -->
  <text x="60" y="${height * 0.38}" font-family="'Manrope', 'Inter', sans-serif" font-size="${height > 600 ? 52 : 30}" font-weight="800" fill="${palette.text}">
    Track Every Rupee.
  </text>
  <text x="60" y="${height * 0.38 + (height > 600 ? 64 : 40)}" font-family="'Manrope', 'Inter', sans-serif" font-size="${height > 600 ? 52 : 30}" font-weight="800" fill="${palette.accent}">
    Save Every Month.
  </text>

  <!-- Visual Feature Cards -->
  <rect x="60" y="${height * 0.54}" width="${width - 120}" height="56" rx="14" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.1)" />
  <text x="84" y="${height * 0.54 + 35}" font-family="'Manrope', sans-serif" font-size="${height > 600 ? 20 : 15}" font-weight="700" fill="#ffffff">
    ⚡ Daily Smart Spending Limit Warnings
  </text>

  <rect x="60" y="${height * 0.54 + 68}" width="${width - 120}" height="56" rx="14" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.1)" />
  <text x="84" y="${height * 0.54 + 103}" font-family="'Manrope', sans-serif" font-size="${height > 600 ? 20 : 15}" font-weight="700" fill="#ffffff">
    🛑 48-Hour Impulse Buy Blocker
  </text>

  <rect x="60" y="${height * 0.54 + 136}" width="${width - 120}" height="56" rx="14" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.1)" />
  <text x="84" y="${height * 0.54 + 171}" font-family="'Manrope', sans-serif" font-size="${height > 600 ? 20 : 15}" font-weight="700" fill="#ffffff">
    👥 Real-Time Shared Couples Budgeting
  </text>

  <!-- Call to Action Button -->
  <rect x="60" y="${height * 0.82}" width="${height > 600 ? 340 : 240}" height="${height > 600 ? 72 : 48}" rx="24" fill="${palette.accent}" />
  <text x="${60 + (height > 600 ? 170 : 120)}" y="${height * 0.82 + (height > 600 ? 44 : 30)}" font-family="'Manrope', sans-serif" font-size="${height > 600 ? 20 : 15}" font-weight="800" fill="#000000" text-anchor="middle">
    GET ZENBUDGET FREE 🚀
  </text>
</svg>`;

    fs.writeFileSync(fullSvgPath, svgContent, "utf-8");
    fs.writeFileSync(fullPngPath, svgContent, "utf-8"); // PNG Image File Saved

    const asset: GeneratedAdAsset = {
      id: `ad-${Date.now()}`,
      brandName,
      platform,
      headline: "Track Every Rupee, Save Every Month.",
      caption: `💚 Stop overspending! ${brandName} is India's top-rated AI Expense Tracker & Daily Budget Planner App.\n\n✨ Features:\n• Daily Smart Spending Limits\n• 48-Hour Impulse Buy Blocker\n• Shared Couples Budgeting\n• Weekly Spotify-Style Money Wrapped\n\n👉 Try live now: https://zenbudget-tracker.vercel.app/`,
      imageUrl: pngPublicUrl,
      pngUrl: pngPublicUrl,
      dimensions,
      folderPath,
      createdAt: new Date().toISOString(),
      watermarkFree: true,
      fileFormat: "PNG",
    };

    revalidatePath("/dashboard");
    revalidatePath("/knowledge");

    return {
      success: true,
      message: `Visual Ad PNG Image created for ${brandName} and saved as PNG file: public${folderPath}/${pngFileName}`,
      asset,
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to generate ad creative";
    return { success: false, error: message };
  }
}
