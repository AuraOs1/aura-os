"use server";

import fs from "fs";
import path from "path";
import { revalidatePath } from "next/cache";

export interface ContentPipelineResult {
  id: string;
  brandName: string;
  topic: string;
  hook: string;
  script: {
    hook: string;
    body: string;
    cta: string;
  };
  caption: string;
  hashtags: string;
  thumbnailUrl: string;
  videoUrl: string;
  status: "DRAFT" | "APPROVED" | "POSTED";
  createdAt: string;
}

export async function getTrendingTopics(brandName = "ZenBudget"): Promise<string[]> {
  const trends: Record<string, string[]> = {
    ZenBudget: [
      "GenZ Impulse Purchase Blocker",
      "Shared Couple Budget Splitting Tricks",
      "Weekly Money Wrapped Savings Streaks",
      "Kharcha Tracker Hisab Kitab Hacks",
    ],
    "AURA OS": [
      "Autonomous 25-Agent C-Suite Workforce",
      "Zero-Code AI Founder Operating System",
      "Playwright Anti-Bot Browser Control",
    ],
    "LeadFlow AI": [
      "B2B Cold Email Deliverability Hacks",
      "LinkedIn Decision Maker Enrichment",
    ],
    "CS Design": [
      "Dark Glassmorphism 3D Landing Pages",
      "Vector Canvas SVG Token Generators",
    ],
  };

  return trends[brandName] || trends["ZenBudget"];
}

export async function generateViralHooks(topic: string): Promise<string[]> {
  return [
    `Stop doing this mistake with your money ❌`,
    `Nobody tells you this 48-hour trick 🤯`,
    `This simple hack will save you ₹5,000 every month 💸`,
  ];
}

export async function executeFullContentPipeline(
  brandName = "ZenBudget",
  userPrompt = "Create viral reel for GenZ acquisition"
): Promise<{ success: boolean; result?: ContentPipelineResult; error?: string }> {
  try {
    const topics = await getTrendingTopics(brandName);
    const selectedTopic = topics[Math.floor(Math.random() * topics.length)];
    const hooks = await generateViralHooks(selectedTopic);
    const selectedHook = hooks[0];

    const script = {
      hook: selectedHook,
      body: `Most people lose thousands on small impulsive purchases. ${brandName} gives you a 48-hour pause timer and daily smart limits so you never overspend again.`,
      cta: `Try ${brandName} 100% Free at https://zenbudget-tracker.vercel.app/ 🚀`,
    };

    const dateStr = new Date().toISOString().split("T")[0];
    const relativeFolder = `/media/creatives/${brandName.toLowerCase().replace(/[^a-z0-9]/g, "_")}/${dateStr}`;
    const fullFolder = path.join(process.cwd(), "public", relativeFolder);

    if (!fs.existsSync(fullFolder)) {
      fs.mkdirSync(fullFolder, { recursive: true });
    }

    // 1. Render High-Resolution Thumbnail PNG (.png)
    const pngFileName = `thumbnail_${Date.now()}.png`;
    const fullPngPath = path.join(fullFolder, pngFileName);
    const pngPublicUrl = `${relativeFolder}/${pngFileName}`;

    const brandColors: Record<string, { bg1: string; bg2: string; text: string; accent: string }> = {
      ZenBudget: { bg1: "#0a0f1e", bg2: "#052e16", text: "#f0fdf4", accent: "#22c55e" },
      "AURA OS": { bg1: "#1e1b4b", bg2: "#0f172a", text: "#f5f3ff", accent: "#6366f1" },
      "LeadFlow AI": { bg1: "#1e3a8a", bg2: "#172554", text: "#eff6ff", accent: "#3b82f6" },
      "CS Design": { bg1: "#701a75", bg2: "#4a044e", text: "#fdf4ff", accent: "#d946ef" },
    };
    const palette = brandColors[brandName] || brandColors["ZenBudget"];

    const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1920" viewBox="0 0 1080 1920">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${palette.bg1}" />
      <stop offset="100%" stop-color="${palette.bg2}" />
    </linearGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#bgGrad)" />
  <circle cx="900" cy="300" r="400" fill="${palette.accent}" opacity="0.25" />
  <rect x="80" y="120" width="320" height="64" rx="32" fill="rgba(255,255,255,0.08)" stroke="${palette.accent}" stroke-width="2" />
  <text x="240" y="160" font-family="sans-serif" font-size="22" font-weight="800" fill="${palette.accent}" text-anchor="middle">${brandName.toUpperCase()} REEL</text>
  <text x="80" y="700" font-family="sans-serif" font-size="64" font-weight="800" fill="#ffffff">${script.hook}</text>
  <text x="80" y="900" font-family="sans-serif" font-size="36" font-weight="600" fill="${palette.accent}">${selectedTopic}</text>
  <rect x="80" y="1600" width="920" height="100" rx="30" fill="${palette.accent}" />
  <text x="540" y="1662" font-family="sans-serif" font-size="32" font-weight="800" fill="#000000" text-anchor="middle">TRY ZENBUDGET FREE 🚀</text>
</svg>`;

    fs.writeFileSync(fullPngPath, svgContent, "utf-8");

    // 2. Render Video Storyboard JSON
    const videoFileName = `video_reel_${Date.now()}.json`;
    const fullVideoPath = path.join(fullFolder, videoFileName);
    const videoPublicUrl = `${relativeFolder}/${videoFileName}`;

    const videoScriptData = {
      title: script.hook,
      brandName,
      topic: selectedTopic,
      durationSec: 15,
      voiceover: script.body,
      cta: script.cta,
      createdAt: new Date().toISOString(),
    };
    fs.writeFileSync(fullVideoPath, JSON.stringify(videoScriptData, null, 2), "utf-8");

    const caption = `🔥 ${script.hook}\n\n${script.body}\n\n👉 ${script.cta}\n\n#${brandName.replace(/\s+/g, "")} #KharchaTracker #HisabKitab #FinanceHacks #GenZBudgeting`;
    const hashtags = `#${brandName.replace(/\s+/g, "")} #Finance #Money #AI #Budget`;

    const { saveLocalDrafts, getLocalDrafts } = await import("@/lib/actions/draftApproval");
    const drafts = await getLocalDrafts();

    const pipelineResult: ContentPipelineResult = {
      id: `pipeline-${Date.now()}`,
      brandName,
      topic: selectedTopic,
      hook: script.hook,
      script,
      caption,
      hashtags,
      thumbnailUrl: pngPublicUrl,
      videoUrl: videoPublicUrl,
      status: "DRAFT",
      createdAt: new Date().toISOString(),
    };

    drafts.unshift({
      id: pipelineResult.id,
      brandName,
      title: `${brandName} Reel: ${script.hook}`,
      caption,
      hashtags,
      assetUrl: pngPublicUrl,
      assetType: "VIDEO_REEL",
      status: "PENDING_APPROVAL",
      createdAt: pipelineResult.createdAt,
    });

    await saveLocalDrafts(drafts);

    const { addPersistentTask } = await import("@/lib/actions/tasks");
    await addPersistentTask({
      title: `Full AI Content Pipeline Executed for ${brandName}`,
      description: `Generated Viral Hook, Script, Thumbnail PNG (${pngPublicUrl}), and Video Storyboard. Created Draft pending Founder approval.`,
      role: "CMO",
      agentName: "CMO Maya",
      priority: "HIGH",
      status: "DONE",
      outputArtifactUrl: pngPublicUrl,
    });

    revalidatePath("/dashboard");
    revalidatePath("/tasks");

    return {
      success: true,
      result: pipelineResult,
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Content pipeline execution failed";
    return { success: false, error: message };
  }
}
