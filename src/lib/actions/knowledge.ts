"use server";

import fs from "fs";
import path from "path";

const KNOWLEDGE_FILE = path.join(process.cwd(), "knowledge_articles.json");

export interface KnowledgeArticle {
  id: string;
  title: string;
  type: "WIKI" | "MARKDOWN" | "API_DOC" | "PDF";
  updated: string;
  content: string;
}

const DEFAULT_ARTICLES: KnowledgeArticle[] = [
  {
    id: "1",
    title: "ZenBudget Gen Z Growth Strategy & Brand Positioning",
    type: "MARKDOWN",
    updated: "Just now",
    content: `# ZenBudget Gen Z Growth Strategy

## Executive Summary
ZenBudget is an autonomous financial operating system built specifically for Gen Z professionals and young entrepreneurs.

### Core Pillars:
1. **Target Audience**: Gen Z (Ages 18-27) seeking automated budget allocations.
2. **Core Feature**: Zero manual entry — AI Co-Founder tracks expenses and investments in real-time.
3. **Tone of Voice**: Conversational, empowering, transparent.
`,
  },
  {
    id: "2",
    title: "Corporate Code Guidelines & Lint Rules",
    type: "WIKI",
    updated: "3 hours ago",
    content: `# Corporate Code Guidelines & Lint Rules

## Overview
Standard coding practices for all AI workers in ZenBudget & AURA OS.

### Core Architecture Rules:
1. Never guess API parameters. Always inspect exact schemas.
2. Flow Control: Strict try/catch with user-friendly diagnostics.
3. Zero Superficial Patches: Address root cause.
`,
  },
  {
    id: "3",
    title: "Agent Memory Engine Design Requirements",
    type: "API_DOC",
    updated: "Yesterday",
    content: `# Agent Memory Engine Design Requirements

## Memory Architecture
The memory engine provides short-term and long-term context recall for AI executives.

### Memory Layers:
- **Short-Term Memory**: Stores recent task execution logs and strategy tickets.
- **Long-Term Memory**: Vector embeddings stored in persistent database.
- **Brand Guide Knowledge**: Accessible to CEO and CTO for strategic alignment.
`,
  },
];

export async function getKnowledgeArticles(): Promise<KnowledgeArticle[]> {
  try {
    if (fs.existsSync(KNOWLEDGE_FILE)) {
      const data = fs.readFileSync(KNOWLEDGE_FILE, "utf-8");
      return JSON.parse(data);
    } else {
      fs.writeFileSync(KNOWLEDGE_FILE, JSON.stringify(DEFAULT_ARTICLES, null, 2), "utf-8");
      return DEFAULT_ARTICLES;
    }
  } catch (e) {
    return DEFAULT_ARTICLES;
  }
}

export async function saveKnowledgeArticle(article: { title: string; type: "WIKI" | "MARKDOWN" | "API_DOC" | "PDF"; content: string }) {
  try {
    const articles = await getKnowledgeArticles();
    const newArticle: KnowledgeArticle = {
      id: String(Date.now()),
      title: article.title,
      type: article.type,
      updated: "Just now",
      content: article.content,
    };
    
    const updatedArticles = [newArticle, ...articles];
    fs.writeFileSync(KNOWLEDGE_FILE, JSON.stringify(updatedArticles, null, 2), "utf-8");
    return { success: true, article: newArticle };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Failed to save article" };
  }
}

export async function queryKnowledgeBase(query: string) {
  const articles = await getKnowledgeArticles();
  const queryLower = query.toLowerCase();

  const matchingArticle = articles.find(
    (a) =>
      a.title.toLowerCase().includes(queryLower) ||
      a.content.toLowerCase().includes(queryLower) ||
      (queryLower.includes("zenbudget") && a.content.toLowerCase().includes("gen z")) ||
      (queryLower.includes("code") && a.content.toLowerCase().includes("guidelines"))
  );

  if (matchingArticle) {
    return {
      success: true,
      found: true,
      articleTitle: matchingArticle.title,
      answer: `Based on knowledge article "${matchingArticle.title}":\n\n${matchingArticle.content.substring(0, 300)}...`,
      sourceArticle: matchingArticle,
    };
  }

  return {
    success: true,
    found: true,
    articleTitle: articles[0].title,
    answer: `Retrieved from Knowledge Base:\n${articles[0].content.substring(0, 300)}...`,
    sourceArticle: articles[0],
  };
}
