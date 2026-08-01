"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { CreateAgentSchema } from "@/lib/schemas";

export async function createAgent(rawInput: unknown) {
  try {
    const validated = CreateAgentSchema.parse(rawInput);

    const agent = await prisma.agent.create({
      data: {
        companyId: validated.companyId,
        departmentId: validated.departmentId,
        name: validated.name,
        role: validated.role as any,
        managerId: validated.managerId,
        responsibilities: validated.responsibilities,
        mission: validated.mission,
        status: (validated as any).status || "IDLE",
        modelProvider: validated.modelProvider,
        modelName: validated.modelName,
        temperature: validated.temperature,
      },
    });

    revalidatePath("/agents");
    revalidatePath("/dashboard");
    return { success: true, agent };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to create agent";
    return { success: false, error: message };
  }
}

export async function getAgents(companyId: string) {
  try {
    const agents = await prisma.agent.findMany({
      where: { companyId },
      include: {
        department: {
          select: { name: true },
        },
        manager: {
          select: { name: true },
        },
      },
      orderBy: { createdAt: "desc" },
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
          in: ["CHIEF_OF_STAFF" as any, "CEO" as any, "CTO" as any, "CMO" as any, "COO" as any, "CFO" as any, "HR" as any, "PRODUCT_MANAGER" as any, "PROJECT_MANAGER" as any],
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

export async function toggleAgentStatus(agentId: string, status: "IDLE" | "WORKING" | "SLEEPING") {
  try {
    const agent = await prisma.agent.update({
      where: { id: agentId },
      data: { status },
    });

    revalidatePath("/agents");
    revalidatePath("/dashboard");
    return { success: true, agent };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to update agent status";
    return { success: false, error: message };
  }
}
