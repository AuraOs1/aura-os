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
    title: "Corporate Code Guidelines & Lint Rules",
    type: "WIKI",
    updated: "3 hours ago",
    content: `# Corporate Code Guidelines & Lint Rules

## Overview
This document outlines standard coding practices for all AI workers in ZenBudget.

### Core Architecture Rules:
1. **Never guess API parameters**: Always inspect exact schemas before calling DB or LLM APIs.
2. **Strict Flow Control**: Enforce clean try/catch blocks with user-friendly diagnostics.
3. **No Superficial Symptom Patches**: When an exception occurs, resolve the root cause.

### Frontend Standards:
- Use HSL tailored color variables.
- Maintain glassmorphism design aesthetic across dark interfaces.
`
  },
  {
    id: "2",
    title: "Agent Memory Engine Design Requirements",
    type: "API_DOC",
    updated: "Yesterday",
    content: `# Agent Memory Engine Design Requirements

## Memory Architecture
The memory engine provides short-term and long-term context recall for AI executives.

### Memory Layers:
- **Short-Term Memory**: Stores recent 5 task execution logs and strategy tickets.
- **Long-Term Memory**: Vector embeddings stored in Supabase PostgreSQL tables.
- **Brand Guide Knowledge**: Accessible to CEO and CTO for strategic alignment.
`
  },
  {
    id: "3",
    title: "Framer Motion Spacing Tokens Guide",
    type: "MARKDOWN",
    updated: "3 days ago",
    content: `# Framer Motion Spacing Tokens Guide

## Motion Standards
Use Framer Motion spring transitions for smooth layout changes:

\`\`\`tsx
const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } }
};
\`\`\`
`
  },
  {
    id: "4",
    title: "Supabase Environment Setup Walkthrough",
    type: "PDF",
    updated: "Last week",
    content: `# Supabase Environment Setup Walkthrough

## Setup Instructions
1. Configure \`NEXT_PUBLIC_SUPABASE_URL\` and \`NEXT_PUBLIC_SUPABASE_ANON_KEY\` in \`.env\`.
2. Apply migrations with Prisma ORM: \`npx prisma db push\`.
3. Verify connection with \`npx prisma studio\`.
`
  }
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
    console.error("Failed to read knowledge_articles.json:", e);
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
    console.error("Failed to save knowledge article:", e);
    return { success: false, error: e instanceof Error ? e.message : "Failed to save article" };
  }
}
