import React from "react";
import { Shell } from "@/components/layout/shell";
import { ensureSeedData } from "@/lib/seed";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const session = cookieStore.get("aura_session");

  if (!session || session.value !== "authenticated") {
    cookieStore.set("aura_session", "authenticated", {
      path: "/",
      maxAge: 60 * 60 * 24 * 7
    });
  }

  let companies = [];
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
    companies = [
      {
        id: "default-company-id",
        name: "ZenBudget",
        tagline: "Autonomous Budgeting & Financial Operating System",
        workspaceId: "default-workspace-id",
      }
    ];
  }

  if (!companies || companies.length === 0) {
    companies = [
      {
        id: "default-company-id",
        name: "ZenBudget",
        tagline: "Autonomous Budgeting & Financial Operating System",
        workspaceId: "default-workspace-id",
      }
    ];
  }

  return <Shell initialCompanies={companies}>{children}</Shell>;
}
