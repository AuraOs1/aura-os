import React from "react";
import { Shell } from "@/components/layout/shell";
import { ensureSeedData } from "@/lib/seed";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let companies: any[] = [];
  try {
    // Ensure database seed records exist
    await ensureSeedData();

    companies = await prisma.company.findMany({
      select: {
        id: true,
        name: true,
        tagline: true,
        workspaceId: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    });
  } catch (err) {
    console.warn("Database query notice, using operational memory fallback:", err);
  }

  if (!companies || companies.length === 0) {
    companies = [
      {
        id: "default-company-id",
        name: "ZenBudget",
        tagline: "Autonomous Budgeting & Financial Operating System",
        workspaceId: "default-workspace-id",
      },
      {
        id: "aura-os-company-id",
        name: "AURA OS",
        tagline: "The AI Operating System for Autonomous Companies",
        workspaceId: "default-workspace-id",
      },
      {
        id: "leadflow-company-id",
        name: "LeadFlow AI",
        tagline: "Autonomous B2B Lead Engine & Acquisition Pipeline",
        workspaceId: "default-workspace-id",
      },
      {
        id: "csdesign-company-id",
        name: "CS Design",
        tagline: "Autonomous UI/UX Design & Studio Production",
        workspaceId: "default-workspace-id",
      }
    ];
  }

  return <Shell initialCompanies={companies}>{children}</Shell>;
}
