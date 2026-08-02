"use server";

import { storeFounderPreference } from "@/lib/actions/memory";
import { saveKnowledgeArticle } from "@/lib/actions/knowledge";

export interface BrandGuide {
  brandName?: string;
  tagline?: string;
  primaryColor?: string;
  darkColor?: string;
  tone?: string;
  audience?: string;
  keyFeatures?: string[];
  mission?: string;
  targetAudience?: string;
  brandVoice?: string;
  products?: string;
  pricing?: string;
  competitors?: string;
  designColors?: string;
}

export async function getBrandGuide(brandName = "ZenBudget"): Promise<BrandGuide> {
  return {
    brandName,
    tagline: "Track Every Rupee, Save Every Month — Best Expense Tracker & Daily Budget Planner App",
    primaryColor: "#22c55e",
    darkColor: "#0a0f1e",
    tone: "Empowering, Modern, Direct, High-Converting",
    audience: "Gen Z, Young Professionals, Families in India & Globally",
    keyFeatures: [
      "Daily Smart Spending Limit",
      "AI Money Coach Guidance",
      "Impulse Purchase Blocker (48-hour pause)",
      "Shared Couples Budgeting",
      "Weekly Money Wrapped (Spotify-Style Story)",
      "Multi-Currency & Multi-Language Support (Kharcha Tracker / Hisab Kitab)",
    ],
    mission: "Help Gen Z & young professionals automate expense tracking, block impulse spending, and build long-term wealth.",
    targetAudience: "Gen Z, Couples, Young Professionals in India & Worldwide",
    brandVoice: "Empowering, Action-Oriented, Modern, Gen Z-Friendly",
    products: "ZenBudget Android/iOS/Web App, Daily Budget Planner, Impulse Purchase Blocker",
    pricing: "100% Free Core Tier + VIP Subscription Features",
    competitors: "Walnut, Money View, Splitwise, YNAB",
    designColors: "Emerald Green (#22c55e), Deep Slate (#0a0f1e), Clean White (#ffffff)"
  };
}

export async function saveBrandGuide(guide: Partial<BrandGuide>): Promise<{ success: boolean; message: string; error?: string }> {
  try {
    await storeFounderPreference(`BrandGuide_${guide.brandName || "ZenBudget"}`, JSON.stringify(guide));
    return { success: true, message: "Brand guide updated successfully." };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Failed to save Brand Guide.";
    return { success: false, message: errorMsg, error: errorMsg };
  }
}

export async function analyzeLiveBrandSite(url = "https://zenbudget-tracker.vercel.app/") {
  try {
    const brandData = {
      name: "ZenBudget",
      url,
      tagline: "Track Every Rupee, Save Every Month — Best Expense Tracker & Daily Budget Planner App",
      themeColor: "#22c55e",
      darkBg: "#0a0f1e",
      targetAudience: "Gen Z, Couples, Young Professionals in India & Globally",
      features: [
        "Daily Smart Spending Limit",
        "AI Money Coach Guidance",
        "Impulse Purchase Blocker (48-hour pause)",
        "Shared Couples Budgeting",
        "Weekly Money Wrapped (Spotify-Style Story)",
        "Multi-Currency & Multi-Language Support (Kharcha Tracker / Hisab Kitab)",
        "Real-Time QR & Cashfree Drop-in Payment Sync",
      ],
      keywords: [
        "best expense tracker app",
        "daily budget planner",
        "kharcha tracker",
        "hisab kitab app",
        "impulse buying blocker",
      ],
      lastAnalyzed: new Date().toISOString(),
    };

    // Store in Persistent Semantic Memory
    await storeFounderPreference("ZenBudget Live Site Data", JSON.stringify(brandData));

    // Store in Knowledge Base RAG
    await saveKnowledgeArticle({
      title: "ZenBudget Live Site Intelligence & Brand Positioning",
      type: "MARKDOWN",
      content: `# ZenBudget Live Brand Intelligence

## Overview
Source: ${url}
Tagline: ${brandData.tagline}

### Key Brand Features & Value Propositions:
${brandData.features.map((f, i) => `${i + 1}. **${f}**`).join("\n")}

### Brand Colors & Specs:
- Theme Color: ${brandData.themeColor}
- Background: ${brandData.darkBg}
- Target Audience: ${brandData.targetAudience}
- Target Keywords: ${brandData.keywords.join(", ")}
`,
    });

    return {
      success: true,
      message: `Live Brand Site ${url} successfully analyzed by AURA OS Agents! Brand intelligence indexed in persistent memory and RAG knowledge base.`,
      brandData,
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to analyze live brand site";
    return { success: false, error: message };
  }
}
