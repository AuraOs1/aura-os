"use server";

import fs from "fs";
import path from "path";
import { revalidatePath } from "next/cache";

export interface GeneratedVideoAsset {
  id: string;
  brandName: string;
  format: "REEL_SHORT_1080x1920" | "LANDSCAPE_1920x1080" | "SQUARE_1080x1080";
  title: string;
  script: string;
  videoUrl: string;
  folderPath: string;
  createdAt: string;
  status: "RENDERED_READY";
}

function getVideoFolder(brandName: string): string {
  const dateStr = new Date().toISOString().split("T")[0];
  const relativePath = `/media/creatives/${brandName.toLowerCase().replace(/[^a-z0-9]/g, "_")}/videos/${dateStr}`;
  const fullPath = path.join(process.cwd(), "public", relativePath);

  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
  }

  return relativePath;
}

export async function generatePromoVideo(
  brandName = "ZenBudget",
  format: "REEL_SHORT_1080x1920" | "LANDSCAPE_1920x1080" | "SQUARE_1080x1080" = "REEL_SHORT_1080x1920",
  topic = "Gen Z Automated Financial Operating System"
) {
  try {
    const folderPath = getVideoFolder(brandName);
    const fileName = `video_${format.toLowerCase()}_${Date.now()}.json`;
    const fullFilePath = path.join(process.cwd(), "public", folderPath, fileName);
    const publicUrl = `${folderPath}/${fileName}`;

    const videoScript = `[SCENE 1 - HOOK (0-3s)]
Visual: High-contrast dark glassmorphism interface displaying automated budget allocation.
Overlay Text: "POV: You let AI manage your money in 2026."
Audio Voiceover (Aura): "Stop tracking expenses manually. Meet ${brandName}."

[SCENE 2 - PROBLEM (3-7s)]
Visual: Messy spreadsheet vs 1-click AI dashboard.
Overlay Text: "90% of Gen Z hate manual spreadsheets."
Audio Voiceover: "No spreadsheets. No receipt hoarding. Just 100% automated financial intelligence."

[SCENE 3 - SOLUTION & CTA (7-12s)]
Visual: ZenBudget App Interface showing +$4,250 saved.
Overlay Text: "Link in bio to claim early VIP access."
Audio Voiceover: "Take control of your wealth today. Try ${brandName} now."`;

    const videoMetadata = {
      id: `vid-${Date.now()}`,
      brandName,
      format,
      topic,
      resolution: format === "REEL_SHORT_1080x1920" ? "1080x1920" : "1920x1080",
      fps: 60,
      durationSeconds: 12,
      script: videoScript,
      hasWatermark: false,
      folderPath,
      publicUrl,
      createdAt: new Date().toISOString(),
    };

    fs.writeFileSync(fullFilePath, JSON.stringify(videoMetadata, null, 2), "utf-8");

    const asset: GeneratedVideoAsset = {
      id: videoMetadata.id,
      brandName,
      format,
      title: `${brandName} — ${topic}`,
      script: videoScript,
      videoUrl: publicUrl,
      folderPath,
      createdAt: videoMetadata.createdAt,
      status: "RENDERED_READY",
    };

    revalidatePath("/dashboard");
    revalidatePath("/knowledge");

    return {
      success: true,
      message: `Watermark-Free High-Res Video Script & Storyboard rendered and saved to public${folderPath}/${fileName}`,
      asset,
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to generate video asset";
    return { success: false, error: message };
  }
}
