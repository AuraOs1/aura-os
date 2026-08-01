"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { CreateAgentSchema } from "@/lib/schemas";
import { type AgentRole } from "@prisma/client";

export async function createAgent(rawInput: unknown) {
  try {
    const validated = CreateAgentSchema.parse(rawInput);

    const agent = await prisma.agent.create({
      data: {
        companyId: validated.companyId,
        departmentId: validated.departmentId,
        name: validated.name,
        role: validated.role as AgentRole,
        managerId: validated.managerId,
        responsibilities: validated.responsibilities,
        mission: validated.mission,
        modelProvider: validated.modelProvider,
        modelName: validated.modelName,
        temperature: validated.temperature,
      },
    });

    revalidatePath("/agents");
    revalidatePath("/dashboard");
    return { success: true, agent };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to hire agent";
    return { success: false, error: message };
  }
}

export async function getAgents(companyId: string) {
  try {
    const agents = await prisma.agent.findMany({
      where: { companyId },
      include: {
        department: true,
        manager: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    return { success: true, agents };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to retrieve agents";
    return { success: false, error: message };
  }
}

export async function getManagers(companyId: string) {
  try {
    const managers = await prisma.agent.findMany({
      where: {
        companyId,
        role: {
          in: ["CEO", "CTO", "COO", "CMO", "CFO", "PRODUCT_MANAGER", "PROJECT_MANAGER"],
        },
      },
      select: {
        id: true,
        name: true,
        role: true,
      },
    });
    return { success: true, managers };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to retrieve managers";
    return { success: false, error: message };
  }
}

export async function toggleAgentStatus(agentId: string, currentStatus: string) {
  try {
    const nextStatus = currentStatus === "WORKING" ? "IDLE" : "WORKING";
    const agent = await prisma.agent.update({
      where: { id: agentId },
      data: { status: nextStatus as any },
    });
    revalidatePath("/agents");
    revalidatePath("/dashboard");
    return { success: true, agent };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to toggle agent status";
    return { success: false, error: message };
  }
}
