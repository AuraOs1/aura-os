"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { CreateWorkspaceSchema, InviteMemberSchema } from "@/lib/schemas";
import { createClient } from "@/lib/supabase/server";

// Helper to get or create user profile based on Supabase session
async function getOrCreateSessionUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    // If Supabase keys are not set, fallback to a local mock user for smooth testing
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      let mockUser = await prisma.user.findUnique({
        where: { email: "founder@aura.ai" },
      });
      if (!mockUser) {
        mockUser = await prisma.user.create({
          data: {
            id: "mock-founder-id",
            email: "founder@aura.ai",
            name: "Default Founder",
          },
        });
      }
      return mockUser;
    }
    throw new Error("Unauthorized: Active session required");
  }

  let dbUser = await prisma.user.findUnique({
    where: { id: user.id },
  });

  if (!dbUser) {
    dbUser = await prisma.user.create({
      data: {
        id: user.id,
        email: user.email || "",
        name: user.user_metadata?.full_name || user.email?.split("@")[0] || "Aura User",
        avatarUrl: user.user_metadata?.avatar_url,
      },
    });
  }

  return dbUser;
}

export async function createWorkspace(rawInput: unknown) {
  try {
    const user = await getOrCreateSessionUser();
    const validated = CreateWorkspaceSchema.parse(rawInput);

    // Run creation inside a transaction
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create Workspace
      const workspace = await tx.workspace.create({
        data: {
          name: validated.name,
          slug: validated.slug,
          ownerId: user.id,
        },
      });

      // 2. Add owner membership
      await tx.workspaceMember.create({
        data: {
          workspaceId: workspace.id,
          userId: user.id,
          role: "OWNER",
        },
      });

      // 3. Create default company
      await tx.company.create({
        data: {
          workspaceId: workspace.id,
          name: `${validated.name} AI Corp`,
          tagline: "Autonomous Agent Corporation",
        },
      });

      return workspace;
    });

    revalidatePath("/dashboard");
    return { success: true, workspace: result };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to create workspace";
    return { success: false, error: message };
  }
}

export async function getWorkspaces() {
  try {
    const user = await getOrCreateSessionUser();
    const workspaces = await prisma.workspace.findMany({
      where: {
        members: {
          some: {
            userId: user.id,
          },
        },
      },
      include: {
        companies: true,
      },
    });
    return { success: true, workspaces };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to retrieve workspaces";
    return { success: false, error: message };
  }
}

export async function inviteMember(rawInput: unknown) {
  try {
    const user = await getOrCreateSessionUser();
    const validated = InviteMemberSchema.parse(rawInput);

    // Verify current user has permission to invite (OWNER or ADMIN)
    const member = await prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId: validated.workspaceId,
          userId: user.id,
        },
      },
    });

    if (!member || (member.role !== "OWNER" && member.role !== "ADMIN")) {
      throw new Error("Forbidden: Only owners and admins can invite members");
    }

    const invitation = await prisma.invitation.create({
      data: {
        workspaceId: validated.workspaceId,
        email: validated.email,
        role: validated.role,
        token: Math.random().toString(36).substring(2) + Date.now().toString(36),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
    });

    return { success: true, invitation };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to send invitation";
    return { success: false, error: message };
  }
}
