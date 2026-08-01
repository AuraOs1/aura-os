"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { CreateCompanySchema, CreateDepartmentSchema } from "@/lib/schemas";

export async function createCompany(rawInput: unknown) {
  try {
    const validated = CreateCompanySchema.parse(rawInput);

    const company = await prisma.company.create({
      data: {
        workspaceId: validated.workspaceId,
        name: validated.name,
        tagline: validated.tagline,
      },
    });

    revalidatePath("/dashboard");
    return { success: true, company };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to create company";
    return { success: false, error: message };
  }
}

export async function createDepartment(rawInput: unknown) {
  try {
    const validated = CreateDepartmentSchema.parse(rawInput);

    const department = await prisma.department.create({
      data: {
        companyId: validated.companyId,
        name: validated.name,
        description: validated.description,
      },
    });

    revalidatePath("/dashboard");
    return { success: true, department };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to create department";
    return { success: false, error: message };
  }
}

export async function getCompanyHierarchy(companyId: string) {
  try {
    const company = await prisma.company.findUnique({
      where: { id: companyId },
      include: {
        departments: {
          include: {
            agents: true,
          },
        },
        agents: {
          where: {
            departmentId: null, // Top level agents like CEO or independent directors
          },
          include: {
            subordinates: true,
          },
        },
      },
    });

    if (!company) {
      throw new Error("Company not found");
    }

    return { success: true, company };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to retrieve company hierarchy";
    return { success: false, error: message };
  }
}

export async function getDepartments(companyId: string) {
  try {
    const departments = await prisma.department.findMany({
      where: { companyId },
      orderBy: { name: "asc" },
    });
    return { success: true, departments };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to retrieve departments";
    return { success: false, error: message };
  }
}

export async function getDashboardStats(companyId: string) {
  try {
    const [activeAgents, completedTasks, totalTasks, logs] = await Promise.all([
      prisma.agent.count({ where: { companyId } }),
      prisma.task.count({
        where: {
          OR: [
            { project: { companyId } },
            { agent: { companyId } },
          ],
          status: "DONE",
        },
      }),
      prisma.task.count({
        where: {
          OR: [
            { project: { companyId } },
            { agent: { companyId } },
          ],
        },
      }),
      prisma.heartbeatLog.findMany({
        where: {
          agent: { companyId },
        },
        select: {
          tokenUsage: true,
          cost: true,
        },
      }),
    ]);

    const totalTokens = logs.reduce((sum, log) => sum + log.tokenUsage, 0);
    const totalCost = logs.reduce((sum, log) => sum + log.cost, 0);

    return {
      success: true,
      activeAgents,
      completedTasks,
      totalTasks,
      totalTokens,
      totalCost,
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to retrieve dashboard statistics";
    return { success: false, error: message };
  }
}

