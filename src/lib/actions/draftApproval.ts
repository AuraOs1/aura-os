"use server";

import fs from "fs";
import path from "path";
import { revalidatePath } from "next/cache";

export interface ContentDraft {
  id: string;
  brandName: string;
  title: string;
  caption: string;
  hashtags: string;
  assetUrl: string;
  assetType: "IMAGE_PNG" | "VIDEO_REEL";
  status: "PENDING_APPROVAL" | "APPROVED" | "POSTED" | "REJECTED";
  createdAt: string;
}

function getDraftsFilePath(): string {
  const folder = path.join(process.cwd(), "public");
  if (!fs.existsSync(folder)) {
    fs.mkdirSync(folder, { recursive: true });
  }
  return path.join(folder, "content_drafts.json");
}

export async function getLocalDrafts(): Promise<ContentDraft[]> {
  try {
    const filePath = getDraftsFilePath();
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, "utf-8");
      return JSON.parse(data);
    }
  } catch (e) {}
  return [];
}

export async function saveLocalDrafts(drafts: ContentDraft[]) {
  try {
    const filePath = getDraftsFilePath();
    fs.writeFileSync(filePath, JSON.stringify(drafts, null, 2), "utf-8");
  } catch (e) {}
}

export async function generateContentDraft(
  brandName = "ZenBudget",
  contentType: "IMAGE_PNG" | "VIDEO_REEL" = "IMAGE_PNG",
  userPrompt = "Create viral social campaign"
) {
  try {
    const drafts = await getLocalDrafts();

    const dateStr = new Date().toISOString().split("T")[0];
    const assetFolder = `/media/creatives/${brandName.toLowerCase()}/${dateStr}`;
    const fullAssetFolder = path.join(process.cwd(), "public", assetFolder);

    if (!fs.existsSync(fullAssetFolder)) {
      fs.mkdirSync(fullAssetFolder, { recursive: true });
    }

    const { generateAdCreative } = await import("@/lib/actions/adCreative");
    const adRes = await generateAdCreative(brandName, "INSTAGRAM_POST", userPrompt);

    const newDraft: ContentDraft = {
      id: `draft-${Date.now()}`,
      brandName,
      title: `${brandName} ${contentType === "VIDEO_REEL" ? "Reel Video" : "Instagram Graphic"} - ${userPrompt.substring(0, 30)}`,
      caption: adRes.asset?.caption || `🔥 ${brandName} is live! Track Every Rupee, Save Every Month. #ZenBudget #KharchaTracker #HisabKitab`,
      hashtags: "#finance #money #budgeting #ai #zenbudget",
      assetUrl: adRes.asset?.pngUrl || `${assetFolder}/ad_instagram_post.png`,
      assetType: contentType,
      status: "PENDING_APPROVAL",
      createdAt: new Date().toISOString(),
    };

    drafts.unshift(newDraft);
    await saveLocalDrafts(drafts);

    revalidatePath("/dashboard");
    revalidatePath("/tasks");

    return {
      success: true,
      draft: newDraft,
      message: `Content Draft generated for ${brandName}! Waiting for Founder approval on Dashboard.`,
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to generate content draft";
    return { success: false, error: message };
  }
}

export async function approveAndPostDraft(draftId: string) {
  try {
    const drafts = await getLocalDrafts();
    const index = drafts.findIndex((d) => d.id === draftId);

    if (index === -1) {
      throw new Error("Draft not found");
    }

    const targetDraft = drafts[index];
    targetDraft.status = "POSTED";
    await saveLocalDrafts(drafts);

    const { executeStealthInstagramPublish } = await import("@/lib/automation/stealthInstagramPublisher");
    const pubRes = await executeStealthInstagramPublish(
      targetDraft.brandName,
      "STEALTH_AUTO_PUBLISH",
      targetDraft.assetUrl,
      targetDraft.caption
    );

    revalidatePath("/dashboard");
    revalidatePath("/tasks");

    return {
      success: true,
      publishedUrl: pubRes.publishedUrl,
      message: `Draft "${targetDraft.title}" Approved & Published with 100% Anti-Ban Stealth Protection!`,
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to approve and post draft";
    return { success: false, error: message };
  }
}
