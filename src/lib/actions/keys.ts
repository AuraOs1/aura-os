"use server";

import fs from "fs";
import path from "path";

const KEYS_FILE = path.join(process.cwd(), "keys.json");

export interface ApiKeys {
  geminiApiKey: string;
  openaiApiKey: string;
  anthropicApiKey: string;
  groqApiKey: string;
  ollamaEndpoint: string;
  
  // OAuth App Credentials
  googleClientId?: string;
  googleClientSecret?: string;
  githubClientId?: string;
  githubClientSecret?: string;
  metaAppId?: string;
  metaAppSecret?: string;

  // Connection Toggles & Stored Live Access Tokens
  googleConnected: boolean;
  githubConnected: boolean;
  metaConnected: boolean;
  youtubeConnected: boolean;

  googleAccessToken?: string;
  googleRefreshToken?: string;
  githubAccessToken?: string;
  metaAccessToken?: string;
}

export async function getApiKeys(): Promise<ApiKeys> {
  try {
    if (fs.existsSync(KEYS_FILE)) {
      const data = fs.readFileSync(KEYS_FILE, "utf-8");
      const parsed = JSON.parse(data);
      return {
        geminiApiKey: parsed.geminiApiKey || process.env.GEMINI_API_KEY || "",
        openaiApiKey: parsed.openaiApiKey || process.env.OPENAI_API_KEY || "",
        anthropicApiKey: parsed.anthropicApiKey || process.env.ANTHROPIC_API_KEY || "",
        groqApiKey: parsed.groqApiKey || process.env.GROQ_API_KEY || "",
        ollamaEndpoint: parsed.ollamaEndpoint || process.env.OLLAMA_ENDPOINT || "http://127.0.0.1:11434",
        
        googleClientId: parsed.googleClientId || process.env.GOOGLE_CLIENT_ID || "",
        googleClientSecret: parsed.googleClientSecret || process.env.GOOGLE_CLIENT_SECRET || "",
        githubClientId: parsed.githubClientId || process.env.GITHUB_CLIENT_ID || "",
        githubClientSecret: parsed.githubClientSecret || process.env.GITHUB_CLIENT_SECRET || "",
        metaAppId: parsed.metaAppId || process.env.META_APP_ID || "",
        metaAppSecret: parsed.metaAppSecret || process.env.META_APP_SECRET || "",

        googleConnected: !!parsed.googleConnected,
        githubConnected: !!parsed.githubConnected,
        metaConnected: !!parsed.metaConnected,
        youtubeConnected: !!parsed.youtubeConnected,

        googleAccessToken: parsed.googleAccessToken || "",
        googleRefreshToken: parsed.googleRefreshToken || "",
        githubAccessToken: parsed.githubAccessToken || "",
        metaAccessToken: parsed.metaAccessToken || "",
      };
    }
  } catch (e) {
    console.error("Failed to read keys.json:", e);
  }

  return {
    geminiApiKey: process.env.GEMINI_API_KEY || "",
    openaiApiKey: process.env.OPENAI_API_KEY || "",
    anthropicApiKey: process.env.ANTHROPIC_API_KEY || "",
    groqApiKey: process.env.GROQ_API_KEY || "",
    ollamaEndpoint: process.env.OLLAMA_ENDPOINT || "http://127.0.0.1:11434",

    googleClientId: process.env.GOOGLE_CLIENT_ID || "",
    googleClientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    githubClientId: process.env.GITHUB_CLIENT_ID || "",
    githubClientSecret: process.env.GITHUB_CLIENT_SECRET || "",
    metaAppId: process.env.META_APP_ID || "",
    metaAppSecret: process.env.META_APP_SECRET || "",

    googleConnected: false,
    githubConnected: false,
    metaConnected: false,
    youtubeConnected: false,
  };
}

export async function saveApiKeys(keys: Partial<ApiKeys>) {
  try {
    const currentKeys = await getApiKeys();
    const newKeys = { ...currentKeys, ...keys };
    fs.writeFileSync(KEYS_FILE, JSON.stringify(newKeys, null, 2), "utf-8");
    
    if (keys.geminiApiKey) process.env.GEMINI_API_KEY = keys.geminiApiKey;
    if (keys.openaiApiKey) process.env.OPENAI_API_KEY = keys.openaiApiKey;
    if (keys.anthropicApiKey) process.env.ANTHROPIC_API_KEY = keys.anthropicApiKey;
    if (keys.groqApiKey) process.env.GROQ_API_KEY = keys.groqApiKey;
    if (keys.ollamaEndpoint) process.env.OLLAMA_ENDPOINT = keys.ollamaEndpoint;

    return { success: true };
  } catch (e) {
    console.error("Failed to save keys.json:", e);
    return { success: false, error: e instanceof Error ? e.message : "Failed to save keys" };
  }
}
