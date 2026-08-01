"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getTasks(companyId?: string) {
  try {
    const tasks = await prisma.task.findMany({
      include: {
        agent: true,
        dependencies: true,
        dependents: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return { success: true, tasks };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to retrieve tasks";
    return { success: false, error: message };
  }
}

export async function createTask(data: {
  companyId?: string;
  title: string;
  description?: string;
  priority?: "NO_PRIORITY" | "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  assigneeId?: string;
  creatorId?: string;
}) {
  try {
    const task = await prisma.task.create({
      data: {
        title: data.title,
        description: data.description,
        priority: data.priority || "MEDIUM",
        agentId: data.assigneeId,
        status: "TODO",
      },
    });

    revalidatePath("/tasks");
    revalidatePath("/dashboard");
    return { success: true, task };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to create task";
    return { success: false, error: message };
  }
}

export async function updateTaskStatus(taskId: string, status: "BACKLOG" | "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "DONE" | "CANCELLED") {
  try {
    const task = await prisma.task.update({
      where: { id: taskId },
      data: { status },
    });

    revalidatePath("/tasks");
    revalidatePath("/dashboard");
    return { success: true, task };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to update task status";
    return { success: false, error: message };
  }
}

export async function deleteTask(taskId: string) {
  try {
    await prisma.task.delete({
      where: { id: taskId },
    });

    revalidatePath("/tasks");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to delete task";
    return { success: false, error: message };
  }
}

export async function dispatchFounderInstruction(companyId: string, instruction: string) {
  try {
    const { generateCompletion } = await import("@/lib/ai/providers");
    const { getBrandGuide } = await import("@/lib/actions/brand");
    const brand = await getBrandGuide();

    const cosAgent = await prisma.agent.findFirst({
      where: { role: "CHIEF_OF_STAFF" }
    });

    const recentTasks = await prisma.task.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      select: { title: true, status: true, description: true }
    });

    const recentTasksContext = recentTasks.length > 0 
      ? `\nRecent Workspace Tasks (Short-Term Memory):\n${recentTasks.map(t => `- [${t.status}] ${t.title}: ${t.description}`).join("\n")}`
      : "";

    const systemPrompt = `You are Aura, the Chief of Staff & AI Co-Founder to Founder Chandan Swaraj.
Your job is to receive Founder instructions, analyze strategic priorities, consult CEO Sarah & C-Suite Executives (CTO, CMO, COO, CFO), break down the goal into 3-5 operational department tickets, and delegate them.

Company Brand Guidelines:
- Core Mission: ${brand.mission}
- Target Audience: ${brand.targetAudience}
- Brand Voice: ${brand.brandVoice}
${recentTasksContext}

Available roles to delegate to: CEO, CTO, CMO, COO, CFO, HEAD_OF_PRODUCT, HEAD_OF_DESIGN, HEAD_OF_RESEARCH, FRONTEND_ENGINEER, BACKEND_ENGINEER, UI_DESIGNER, QA_ENGINEER, DEVOPS, COPYWRITER, SEO_EXPERT.

Return your response strictly as a JSON array of objects, with no markdown tags or text, formatted exactly like this:
[
  {
    "title": "Short strategic title",
    "description": "Details of department requirements and target output parameters.",
    "priority": "LOW" | "MEDIUM" | "HIGH" | "URGENT",
    "role": "CTO"
  }
]`;

    const userPrompt = `Founder Chandan ordered: "${instruction}"\n\nConsult executive council, break down into strategic tickets, and return JSON array.`;

    const { getApiKeys } = await import("@/lib/actions/keys");
    const keys = await getApiKeys();
    let provider = "openai";
    let modelName = "gpt-4o-mini";

    if (keys.openaiApiKey) {
      provider = "openai";
    } else if (keys.geminiApiKey) {
      provider = "gemini";
      modelName = "gemini-2.5-flash";
    }

    const res = await generateCompletion(provider, modelName, systemPrompt, userPrompt);
    let parsed: Array<{ title: string; description: string; priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT"; role: string }> = [];

    try {
      const cleanText = res.text.replace(/```json/g, "").replace(/```/g, "").trim();
      parsed = JSON.parse(cleanText);
    } catch (e) {
      console.error("Failed to parse Chief of Staff AI json output:", e, res.text);
      parsed = [
        {
          title: `Analyze Strategic Goal: ${instruction.substring(0, 30)}...`,
          description: `Chief of Staff Aura delegated strategic objective to Executive Council.`,
          priority: "HIGH",
          role: "CEO"
        }
      ];
    }

    const createdTasks = [];
    for (const item of parsed) {
      const assignee = await prisma.agent.findFirst({
        where: { role: item.role as any }
      });

      const task = await prisma.task.create({
        data: {
          title: item.title,
          description: item.description,
          priority: item.priority || "MEDIUM",
          agentId: assignee ? assignee.id : undefined,
          status: "TODO",
        }
      });

      if (cosAgent) {
        await prisma.heartbeatLog.create({
          data: {
            agentId: cosAgent.id,
            action: "DELEGATED_FOUNDER_GOAL",
            details: `Chief of Staff Aura delegated '${item.title}' to ${item.role}`,
            tokenUsage: res.inputTokens + res.outputTokens,
            cost: res.cost,
          }
        });
      }

      createdTasks.push(task);
    }

    revalidatePath("/tasks");
    revalidatePath("/dashboard");
    return { 
      success: true, 
      tasks: createdTasks, 
      chiefOfStaffSummary: `I have received your directive and consulted CEO Sarah & the Executive Council. ${createdTasks.length} strategic department tickets have been assigned and execution is underway.`
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to dispatch instruction";
    return { success: false, error: message };
  }
}
