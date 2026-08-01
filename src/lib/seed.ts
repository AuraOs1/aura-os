import { prisma } from "@/lib/prisma";

export async function ensureSeedData() {
  try {
    const cosExists = await prisma.agent.findFirst({
      where: { role: "CHIEF_OF_STAFF" }
    });

    if (cosExists) {
      return;
    }

    console.log("Seeding Executive Hierarchy & Multi-Brand Operating System...");

    // 1. Create Default User (Founder)
    const user = await prisma.user.upsert({
      where: { id: "mock-founder-id" },
      update: {},
      create: {
        id: "mock-founder-id",
        email: "chandan@zenbudget.ai",
        name: "Chandan Swaraj",
        avatarUrl: null,
      },
    });

    // 2. Create Primary Workspace
    const workspace = await prisma.workspace.upsert({
      where: { id: "default-workspace-id" },
      update: {},
      create: {
        id: "default-workspace-id",
        name: "ZenBudget Global Workspace",
        slug: "zenbudget",
        ownerId: user.id,
      },
    });

    // 3. Add Workspace Member
    await prisma.workspaceMember.upsert({
      where: { id: "mock-member-id" },
      update: {},
      create: {
        id: "mock-member-id",
        workspaceId: workspace.id,
        userId: user.id,
        role: "OWNER",
      },
    });

    // 4. Seed Multi-Brand Companies
    const zenbudgetCompany = await prisma.company.upsert({
      where: { id: "default-company-id" },
      update: {},
      create: {
        id: "default-company-id",
        workspaceId: workspace.id,
        name: "ZenBudget",
        tagline: "Autonomous Budgeting & Financial Operating System",
      },
    });

    await prisma.company.upsert({
      where: { id: "aura-os-company-id" },
      update: {},
      create: {
        id: "aura-os-company-id",
        workspaceId: workspace.id,
        name: "AURA OS",
        tagline: "The AI Operating System for Autonomous Companies",
      },
    });

    await prisma.company.upsert({
      where: { id: "leadflow-company-id" },
      update: {},
      create: {
        id: "leadflow-company-id",
        workspaceId: workspace.id,
        name: "LeadFlow AI",
        tagline: "Autonomous B2B Lead Engine & Acquisition Pipeline",
      },
    });

    await prisma.company.upsert({
      where: { id: "csdesign-company-id" },
      update: {},
      create: {
        id: "csdesign-company-id",
        workspaceId: workspace.id,
        name: "CS Design",
        tagline: "Autonomous UI/UX Design & Studio Production",
      },
    });

    // 5. Create Executive Departments for Primary Company
    const execDept = await prisma.department.upsert({
      where: { id: "exec-dept-id" },
      update: {},
      create: {
        id: "exec-dept-id",
        companyId: zenbudgetCompany.id,
        name: "Executive Council",
        description: "Co-Founder, C-Suite Executives, and Strategic Directors",
      },
    });

    const engDept = await prisma.department.upsert({
      where: { id: "eng-dept-id" },
      update: {},
      create: {
        id: "eng-dept-id",
        companyId: zenbudgetCompany.id,
        name: "Engineering & Systems",
        description: "Software architecture, automation pipelines, and QA",
      },
    });

    const mktDept = await prisma.department.upsert({
      where: { id: "mkt-dept-id" },
      update: {},
      create: {
        id: "mkt-dept-id",
        companyId: zenbudgetCompany.id,
        name: "Marketing & Growth",
        description: "Brand campaigns, SEO, social media, and acquisition",
      },
    });

    // 6. SEED EXECUTIVE HIERARCHY
    const cos = await prisma.agent.create({
      data: {
        id: "cos-agent-id",
        companyId: zenbudgetCompany.id,
        departmentId: execDept.id,
        name: "Aura",
        role: "CHIEF_OF_STAFF",
        responsibilities: [
          "Single Point of Contact for Founder",
          "Synthesize Founder Vision into Strategy",
          "Direct Executive Council (CEO, CTO, CMO, COO)",
          "Generate Daily Executive Briefs"
        ],
        mission: "Act as Founder's AI Co-Founder and orchestrate full company operations.",
        status: "IDLE",
        modelProvider: "openai",
        modelName: "gpt-4o-mini",
        temperature: 0.3,
      },
    });

    const ceo = await prisma.agent.create({
      data: {
        id: "ceo-agent-id",
        companyId: zenbudgetCompany.id,
        departmentId: execDept.id,
        name: "Sarah",
        role: "CEO",
        managerId: cos.id,
        responsibilities: ["Manage Executive Council", "Approve Operational Roadmaps", "Monitor Company Health"],
        mission: "Maximize company execution speed and department alignment.",
        status: "WORKING",
        modelProvider: "gemini",
        modelName: "gemini-2.5-flash",
        temperature: 0.4,
      },
    });

    const cto = await prisma.agent.create({
      data: {
        id: "cto-agent-id",
        companyId: zenbudgetCompany.id,
        departmentId: engDept.id,
        name: "Alex",
        role: "CTO",
        managerId: ceo.id,
        responsibilities: ["Software Architecture", "Engineering Pipeline", "Code Safety"],
        mission: "Build scalable technical architecture and manage engineering squads.",
        status: "WORKING",
        modelProvider: "claude",
        modelName: "claude-3.5-sonnet",
        temperature: 0.5,
      },
    });

    const cmo = await prisma.agent.create({
      data: {
        id: "cmo-agent-id",
        companyId: zenbudgetCompany.id,
        departmentId: mktDept.id,
        name: "Maya",
        role: "CMO",
        managerId: ceo.id,
        responsibilities: ["Growth Campaigns", "Brand Voice", "Customer Acquisition"],
        mission: "Drive viral acquisition and maintain premium brand positioning.",
        status: "IDLE",
        modelProvider: "gemini",
        modelName: "gemini-2.5-flash",
        temperature: 0.7,
      },
    });

    const coo = await prisma.agent.create({
      data: {
        id: "coo-agent-id",
        companyId: zenbudgetCompany.id,
        departmentId: execDept.id,
        name: "David",
        role: "COO",
        managerId: ceo.id,
        responsibilities: ["Workflow Optimization", "Task Routing", "Cross-Department Delivery"],
        mission: "Ensure smooth execution across all company operations.",
        status: "IDLE",
        modelProvider: "gemini",
        modelName: "gemini-2.5-flash",
        temperature: 0.3,
      },
    });

    const cfo = await prisma.agent.create({
      data: {
        id: "cfo-agent-id",
        companyId: zenbudgetCompany.id,
        departmentId: execDept.id,
        name: "Felix",
        role: "CFO",
        managerId: ceo.id,
        responsibilities: ["Token Burn Efficiency", "Compute Cost Audit", "Resource Allocation"],
        mission: "Maintain optimal compute cost efficiency across AI agents.",
        status: "IDLE",
        modelProvider: "gemini",
        modelName: "gemini-2.5-flash",
        temperature: 0.2,
      },
    });

    console.log("Successfully seeded Multi-Brand Companies & Executive Hierarchy.");
  } catch (e) {
    console.error("Failed to seed database hierarchy:", e);
  }
}
