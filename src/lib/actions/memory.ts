"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { CreateMemorySchema } from "@/lib/schemas";
import { type MemoryType, Prisma } from "@prisma/client";

export async function addAgentMemory(rawInput: unknown) {
  try {
    const validated = CreateMemorySchema.parse(rawInput);

    const memory = await prisma.agentMemory.create({
      data: {
        agentId: validated.agentId,
        type: validated.type as MemoryType,
        content: validated.content,
        metadata: (validated.metadata || undefined) as Prisma.InputJsonValue,
      },
    });

    revalidatePath("/agents");
    return { success: true, memory };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to add memory record";
    return { success: false, error: message };
  }
}

export async function getAgentMemories(agentId: string, type?: string) {
  try {
    const memories = await prisma.agentMemory.findMany({
      where: {
        agentId,
        ...(type ? { type: type as MemoryType } : {}),
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    return { success: true, memories };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to retrieve memories";
    return { success: false, error: message };
  }
}

export async function searchAgentMemories(agentId: string, query: string) {
  try {
    if (!query.trim()) {
      return getAgentMemories(agentId);
    }

    const memories = await prisma.agentMemory.findMany({
      where: {
        agentId,
        content: {
          contains: query,
          mode: "insensitive", // case-insensitive search
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return { success: true, memories };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to search memories";
    return { success: false, error: message };
  }
}

export async function deleteAgentMemory(memoryId: string) {
  try {
    const memory = await prisma.agentMemory.delete({
      where: { id: memoryId },
    });

    revalidatePath("/agents");
    return { success: true, memory };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to delete memory record";
    return { success: false, error: message };
  }
}
