"use server";

import fs from "fs";
import path from "path";
import { getApiKeys } from "@/lib/actions/keys";

const OWNER = "AuraOs1";
const REPO = "aura-os";

export async function syncCodebaseToGitHub(commitMessage = "Autonomous AI Agent Code Sync") {
  try {
    const keys = await getApiKeys();
    const token = keys.githubAccessToken || process.env.GITHUB_ACCESS_TOKEN || "";

    if (!token) {
      return { success: false, error: "GitHub access token missing" };
    }

    const baseDir = process.cwd();
    let uploadedCount = 0;

    async function uploadFile(filePath: string, relativePath: string) {
      try {
        const content = fs.readFileSync(filePath);
        const base64Content = content.toString("base64");
        const cleanRelPath = relativePath.replace(/\\/g, "/");

        const url = `https://api.github.com/repos/${OWNER}/${REPO}/contents/${cleanRelPath}`;

        let sha: string | undefined;
        try {
          const getRes = await fetch(url, {
            headers: {
              Authorization: `Bearer ${token}`,
              "User-Agent": "AuraOS-Autonomous-Agent",
              Accept: "application/vnd.github.v3+json",
            },
          });
          if (getRes.ok) {
            const data = await getRes.json();
            sha = data.sha;
          }
        } catch (e) {}

        const body: any = {
          message: `${commitMessage}: ${cleanRelPath}`,
          content: base64Content,
        };
        if (sha) body.sha = sha;

        const putRes = await fetch(url, {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "User-Agent": "AuraOS-Autonomous-Agent",
            "Content-Type": "application/json",
            Accept: "application/vnd.github.v3+json",
          },
          body: JSON.stringify(body),
        });

        if (putRes.ok) {
          uploadedCount++;
        }
      } catch (err) {
        console.error(`Failed to sync file ${relativePath}:`, err);
      }
    }

    async function walkAndSync(dir: string) {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        const relPath = path.relative(baseDir, fullPath);

        if (
          entry.name === ".next" ||
          entry.name === "node_modules" ||
          entry.name === ".git" ||
          entry.name === "scratch" ||
          entry.name === "push.js" ||
          entry.name === "push_api.js"
        ) {
          continue;
        }

        if (entry.isDirectory()) {
          await walkAndSync(fullPath);
        } else {
          await uploadFile(fullPath, relPath);
        }
      }
    }

    await walkAndSync(baseDir);

    return {
      success: true,
      message: `Autonomous AI Agent synced ${uploadedCount} files to GitHub repo ${OWNER}/${REPO}`,
      uploadedCount,
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to sync to GitHub";
    return { success: false, error: message };
  }
}
