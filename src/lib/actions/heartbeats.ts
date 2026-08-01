"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { generateCompletion } from "@/lib/ai/providers";
import { getRoleProfile } from "@/lib/prompts";
import { type AgentStatus, type TaskStatus } from "@prisma/client";

export async function triggerAgentHeartbeat(agentId: string) {
  try {
    // 1. Fetch agent with their assigned tasks and recent memories
    const agent = await prisma.agent.findUnique({
      where: { id: agentId },
      include: {
        tasks: {
          where: {
            status: {
              in: ["TODO", "IN_PROGRESS"],
            },
          },
          orderBy: {
            createdAt: "asc",
          },
          take: 1,
        },
        memories: {
          orderBy: {
            createdAt: "desc",
          },
          take: 3,
        },
      },
    });

    if (!agent) {
      throw new Error("Agent not found");
    }

    // Update agent status to WORKING
    await prisma.agent.update({
      where: { id: agentId },
      data: { status: "WORKING" as AgentStatus },
    });

    const activeTask = agent.tasks[0];
    const profile = getRoleProfile(agent.role);
    const systemPrompt = `${profile.systemPrompt}\n\nRecent Memory Context:\n${agent.memories.map(m => `- [${m.type}] ${m.content}`).join("\n")}`;

    let completionPrompt = "";
    let actionName = "IDLE_CHECK";
    let logDetails = "";
    let nextStatus: TaskStatus | null = null;

    if (activeTask) {
      actionName = "EXECUTE_TASK";
      completionPrompt = `Current Assigned Task: ${activeTask.title}\nDescription: ${activeTask.description || "No description provided."}\n\nPerform this task. Once completed, indicate how you completed it. Your response will be logged as system telemetry.`;
      
      // Determine next task state transition
      nextStatus = activeTask.status === "TODO" ? "IN_PROGRESS" : "DONE";
      logDetails = `Executed task: "${activeTask.title}". Transitioning status from ${activeTask.status} to ${nextStatus}.`;
    } else {
      completionPrompt = `You currently have no active tasks. Scan the environment, check your memory context, and report your current status or recommendations.`;
      logDetails = "Scanned environment and checked active logs. No tasks in queue.";
    }

    // 2. Call the AI Provider completion route
    const aiResult = await generateCompletion(
      agent.modelProvider,
      agent.modelName,
      systemPrompt,
      completionPrompt,
      agent.temperature
    );

    // 3. Perform database operations in transaction
    await prisma.$transaction(async (tx) => {
      // Create heartbeat log
      await tx.heartbeatLog.create({
        data: {
          agentId,
          action: actionName,
          details: `${logDetails}\n\nAI Response: ${aiResult.text}`,
          tokenUsage: aiResult.inputTokens + aiResult.outputTokens,
          cost: aiResult.cost,
        },
      });

      // Inject memory node
      await tx.agentMemory.create({
        data: {
          agentId,
          type: "SHORT",
          content: activeTask 
            ? `Successfully executed task "${activeTask.title}". Results: ${aiResult.text.substring(0, 100)}...`
            : "Ran routine status review. No active tasks to process.",
        },
      });

      // Update task status if applicable
      if (activeTask && nextStatus) {
        await tx.task.update({
          where: { id: activeTask.id },
          data: { status: nextStatus },
        });
      }

      // Reset agent status to IDLE
      await tx.agent.update({
        where: { id: agentId },
        data: { status: "IDLE" as AgentStatus },
      });
    });

    revalidatePath("/agents");
    revalidatePath("/tasks");
    revalidatePath("/dashboard");
    return { success: true, text: aiResult.text, cost: aiResult.cost };
  } catch (error: unknown) {
    // Reset agent status in case of failure
    try {
      await prisma.agent.update({
        where: { id: agentId },
        data: { status: "IDLE" as AgentStatus },
      });
    } catch {}
    
    const message = error instanceof Error ? error.message : "Failed to run heartbeat pulse";
    return { success: false, error: message };
  }
}

export async function triggerCompanyHeartbeats(companyId: string) {
  try {
    const agents = await prisma.agent.findMany({
      where: { companyId },
      select: { id: true },
    });

    // Execute heartbeats in parallel
    const pulses = agents.map(a => triggerAgentHeartbeat(a.id));
    const results = await Promise.all(pulses);

    const successful = results.filter(r => r.success).length;
    
    revalidatePath("/agents");
    revalidatePath("/tasks");
    revalidatePath("/dashboard");
    return { success: true, message: `Pulsed ${successful} / ${agents.length} active agents successfully.` };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to trigger company heartbeats";
    return { success: false, error: message };
  }
}

export async function getHeartbeatLogs(companyId: string, limit = 20) {
  try {
    const logs = await prisma.heartbeatLog.findMany({
      where: {
        agent: {
          companyId,
        },
      },
      include: {
        agent: {
          select: {
            name: true,
            role: true,
          },
        },
      },
      orderBy: {
        timestamp: "desc",
      },
      take: limit,
    });
    return { success: true, logs };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to retrieve telemetry logs";
    return { success: false, error: message };
  }
}
