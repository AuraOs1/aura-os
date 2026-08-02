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
  prompt = "Create high-converting Gen Z financial freedom ad"
) {
  try {
    const folderPath = getCreativeFolder(brandName);
    const dateStr = new Date().toISOString().split("T")[0];

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

    // High-Resolution SVG Watermark-Free Ad Canvas Template
    const fileName = `ad_${platform.toLowerCase()}_${Date.now()}.svg`;
    const fullFilePath = path.join(process.cwd(), "public", folderPath, fileName);
    const publicUrl = `${folderPath}/${fileName}`;

    const brandColors: Record<string, { bg1: string; bg2: string; text: string; accent: string }> = {
      ZenBudget: { bg1: "#064e3b", bg2: "#022c22", text: "#ecfdf5", accent: "#10b981" },
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
      <feGaussianBlur stdDeviation="15" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
  </defs>

  <!-- Background -->
  <rect width="100%" height="100%" fill="url(#bgGrad)" />

  <!-- Decorative Orbs -->
  <circle cx="${width * 0.8}" cy="${height * 0.2}" r="${width * 0.25}" fill="${palette.accent}" opacity="0.15" filter="url(#glow)" />
  <circle cx="${width * 0.15}" cy="${height * 0.85}" r="${width * 0.2}" fill="${palette.accent}" opacity="0.1" filter="url(#glow)" />

  <!-- Grid Pattern overlay -->
  <path d="M 0 50 L ${width} 50 M 0 100 L ${width} 100 M 0 150 L ${width} 150 M 0 200 L ${width} 200" stroke="white" stroke-opacity="0.03" stroke-width="1"/>

  <!-- Brand Badge -->
  <rect x="60" y="60" width="220" height="48" rx="24" fill="rgba(255,255,255,0.08)" stroke="${palette.accent}" stroke-opacity="0.4" stroke-width="1.5" />
  <text x="170" y="90" font-family="'Inter', sans-serif" font-size="16" font-weight="700" fill="${palette.accent}" text-anchor="middle" letter-spacing="2">${brandName.toUpperCase()}</text>

  <!-- Main Headline -->
  <text x="60" y="${height * 0.4}" font-family="'Outfit', 'Inter', sans-serif" font-size="${height > 600 ? 44 : 28}" font-weight="800" fill="${palette.text}">
    Stop Manual Budgeting.
  </text>
  <text x="60" y="${height * 0.4 + (height > 600 ? 55 : 36)}" font-family="'Outfit', 'Inter', sans-serif" font-size="${height > 600 ? 44 : 28}" font-weight="800" fill="${palette.accent}">
    Let AI Automate Your Wealth.
  </text>

  <!-- Subheadline -->
  <text x="60" y="${height * 0.6}" font-family="'Inter', sans-serif" font-size="${height > 600 ? 20 : 14}" font-weight="400" fill="rgba(255,255,255,0.7)">
    Built for Gen Z. Zero manual entry. 100% Autonomous.
  </text>

  <!-- Call to Action Button -->
  <rect x="60" y="${height * 0.72}" width="${height > 600 ? 280 : 200}" height="${height > 600 ? 64 : 44}" rx="16" fill="${palette.accent}" />
  <text x="${60 + (height > 600 ? 140 : 100)}" y="${height * 0.72 + (height > 600 ? 38 : 27)}" font-family="'Inter', sans-serif" font-size="${height > 600 ? 18 : 14}" font-weight="700" fill="#000000" text-anchor="middle">
    GET VIP ACCESS 🚀
  </text>
</svg>`;

    fs.writeFileSync(fullFilePath, svgContent, "utf-8");

    const asset: GeneratedAdAsset = {
      id: `ad-${Date.now()}`,
      brandName,
      platform,
      headline: "Stop Manual Budgeting. Let AI Automate Your Wealth.",
      caption: `🚀 ${brandName} is revolutionary! No manual spreadsheets. AI manages your financial operating system.\n\n👉 Click link in bio to claim early VIP access.\n\n#${brandName.replace(/\s+/g, "")} #GenZFinance #AIOperatingSystem #AutomatedWealth`,
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
      message: `Watermark-Free High-Resolution Ad Asset created and saved into folder: public${folderPath}/${fileName}`,
      asset,
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to generate ad creative";
    return { success: false, error: message };
  }
}
