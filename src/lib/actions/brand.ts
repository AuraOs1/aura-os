"use server";

import fs from "fs";
import path from "path";

const BRAND_FILE = path.join(process.cwd(), "brand_guide.json");

export interface BrandGuide {
  mission: string;
  targetAudience: string;
  brandVoice: string;
  products: string;
  pricing: string;
  competitors: string;
  designColors: string;
}

export async function getBrandGuide(): Promise<BrandGuide> {
  try {
    if (fs.existsSync(BRAND_FILE)) {
      const data = fs.readFileSync(BRAND_FILE, "utf-8");
      const parsed = JSON.parse(data);
      return {
        mission: parsed.mission || "Maximize organizational efficiency and strategic alignment.",
        targetAudience: parsed.targetAudience || "SaaS Founders, Business Owners, Indie Hackers",
        brandVoice: parsed.brandVoice || "Professional, minimalist, Apple-like, clean, concise",
        products: parsed.products || "AURA AI Agent Workforce Operations Console",
        pricing: parsed.pricing || "Free local simulation, Pay-as-you-go OpenAI/Gemini/Claude API queries",
        competitors: parsed.competitors || "Traditional agency teams, manual freelancer operations",
        designColors: parsed.designColors || "Primary: #FFFFFF, Accent: #4ADE80, Dark Surface: #111113",
      };
    }
  } catch (e) {
    console.error("Failed to read brand_guide.json:", e);
  }

  return {
    mission: "Maximize organizational efficiency and strategic alignment.",
    targetAudience: "SaaS Founders, Business Owners, Indie Hackers",
    brandVoice: "Professional, minimalist, Apple-like, clean, concise",
    products: "AURA AI Agent Workforce Operations Console",
    pricing: "Free local simulation, Pay-as-you-go OpenAI/Gemini/Claude API queries",
    competitors: "Traditional agency teams, manual freelancer operations",
    designColors: "Primary: #FFFFFF, Accent: #4ADE80, Dark Surface: #111113",
  };
}

export async function saveBrandGuide(guide: Partial<BrandGuide>) {
  try {
    const currentGuide = await getBrandGuide();
    const newGuide = { ...currentGuide, ...guide };
    fs.writeFileSync(BRAND_FILE, JSON.stringify(newGuide, null, 2), "utf-8");
    return { success: true };
  } catch (e) {
    console.error("Failed to save brand_guide.json:", e);
    return { success: false, error: e instanceof Error ? e.message : "Failed to save brand guide" };
  }
}
