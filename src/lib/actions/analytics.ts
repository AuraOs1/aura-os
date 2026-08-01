"use server";

import { prisma } from "@/lib/prisma";

export async function getAnalyticsData(companyId: string) {
  try {
    const logs = await prisma.heartbeatLog.findMany({
      where: {
        agent: { companyId },
      },
      include: {
        agent: {
          select: {
            name: true,
            role: true,
            modelProvider: true,
          },
        },
      },
      orderBy: {
        timestamp: "asc",
      },
    });

    const agentStatsMap: Record<string, { name: string; role: string; cost: number; queries: number; tokens: number }> = {};
    const providerStats = { gemini: 0, claude: 0, openai: 0, simulated: 0 };
    
    let totalCost = 0;
    let totalTokens = 0;
    const totalQueries = logs.length;

    logs.forEach((log) => {
      totalCost += log.cost;
      totalTokens += log.tokenUsage;

      const agentId = log.agentId;
      if (!agentStatsMap[agentId]) {
        agentStatsMap[agentId] = {
          name: log.agent.name,
          role: log.agent.role,
          cost: 0,
          queries: 0,
          tokens: 0,
        };
      }
      agentStatsMap[agentId].cost += log.cost;
      agentStatsMap[agentId].queries += 1;
      agentStatsMap[agentId].tokens += log.tokenUsage;

      const prov = log.agent.modelProvider.toLowerCase();
      if (prov.includes("gemini")) providerStats.gemini += log.cost;
      else if (prov.includes("claude")) providerStats.claude += log.cost;
      else if (prov.includes("openai") || prov.includes("gpt")) providerStats.openai += log.cost;
      else providerStats.simulated += log.cost;
    });

    const agentBreakdown = Object.values(agentStatsMap).sort((a, b) => b.cost - a.cost);

    const timelineDataMap: Record<string, { time: string; cost: number; tokens: number }> = {};
    logs.forEach((log) => {
      const date = new Date(log.timestamp);
      const hours = date.getHours().toString().padStart(2, "0");
      const key = `${date.toLocaleDateString()} ${hours}:00`;
      
      if (!timelineDataMap[key]) {
        timelineDataMap[key] = {
          time: `${hours}:00`,
          cost: 0,
          tokens: 0,
        };
      }
      timelineDataMap[key].cost += log.cost;
      timelineDataMap[key].tokens += log.tokenUsage;
    });

    const timelineData = Object.values(timelineDataMap).slice(-10);

    return {
      success: true,
      totalCost,
      totalTokens,
      totalQueries,
      agentBreakdown,
      providerStats,
      timelineData,
      rawLogs: logs.slice(-20).map(l => ({
        id: l.id,
        timestamp: l.timestamp,
        agentName: l.agent.name,
        agentRole: l.agent.role,
        action: l.action,
        tokenUsage: l.tokenUsage,
        cost: l.cost,
        provider: l.agent.modelProvider
      })).reverse(),
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to retrieve analytics data";
    return { success: false, error: message };
  }
}
