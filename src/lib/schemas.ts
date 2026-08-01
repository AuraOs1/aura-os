import { z } from "zod";

export const CreateWorkspaceSchema = z.object({
  name: z.string().min(2, "Workspace name must be at least 2 characters").max(50),
  slug: z
    .string()
    .min(2, "Slug must be at least 2 characters")
    .max(30)
    .regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers, and dashes"),
});

export const CreateCompanySchema = z.object({
  name: z.string().min(2, "Company name must be at least 2 characters").max(50),
  tagline: z.string().max(100, "Tagline cannot exceed 100 characters").optional(),
  workspaceId: z.string().min(1, "Invalid workspace ID"),
});

export const InviteMemberSchema = z.object({
  email: z.string().email("Invalid email address"),
  role: z.enum(["OWNER", "ADMIN", "MEMBER"]),
  workspaceId: z.string().min(1, "Invalid workspace ID"),
});

export const CreateDepartmentSchema = z.object({
  name: z.string().min(2, "Department name must be at least 2 characters").max(50),
  description: z.string().max(200, "Description cannot exceed 200 characters").optional(),
  companyId: z.string().min(1, "Invalid company ID"),
});

export const CreateAgentSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(50),
  role: z.enum([
    "CEO",
    "CTO",
    "COO",
    "CMO",
    "CFO",
    "HR",
    "PRODUCT_MANAGER",
    "PROJECT_MANAGER",
    "SOFTWARE_ENGINEER",
    "BACKEND_ENGINEER",
    "FRONTEND_ENGINEER",
    "UI_DESIGNER",
    "UX_RESEARCHER",
    "GRAPHIC_DESIGNER",
    "MOTION_DESIGNER",
    "VIDEO_EDITOR",
    "COPYWRITER",
    "SEO_EXPERT",
    "RESEARCHER",
    "CUSTOMER_SUPPORT",
    "QA_ENGINEER",
    "DEVOPS",
    "FINANCE_ANALYST",
    "SALES_AGENT",
    "LEGAL_AGENT",
  ]),
  companyId: z.string().min(1, "Invalid company ID"),
  departmentId: z.string().min(1, "Invalid department ID").optional().nullable(),
  managerId: z.string().min(1, "Invalid manager ID").optional().nullable(),
  modelProvider: z.string().min(2).default("gemini"),
  modelName: z.string().min(2).default("gemini-2.5-flash"),
  temperature: z.number().min(0).max(2).default(0.7),
  responsibilities: z.array(z.string()).default([]),
  mission: z.string().min(10, "Mission must be at least 10 characters"),
});

export const CreateMemorySchema = z.object({
  agentId: z.string().min(1, "Invalid agent ID"),
  type: z.enum(["SHORT", "LONG", "PROJECT", "COMPANY", "KNOWLEDGE"]),
  content: z.string().min(3, "Memory content must be at least 3 characters"),
  metadata: z.record(z.string(), z.any()).optional().nullable(),
});

export const CreateTaskSchema = z.object({
  title: z.string().min(3, "Task title must be at least 3 characters").max(100),
  description: z.string().max(500, "Description cannot exceed 500 characters").optional().nullable(),
  status: z.enum(["BACKLOG", "TODO", "IN_PROGRESS", "IN_REVIEW", "DONE", "CANCELLED"]).default("TODO"),
  priority: z.enum(["NO_PRIORITY", "LOW", "MEDIUM", "HIGH", "URGENT"]).default("NO_PRIORITY"),
  agentId: z.string().min(1, "Invalid agent ID").optional().nullable(),
  projectId: z.string().min(1, "Invalid project ID").optional().nullable(),
  dueDate: z.string().optional().nullable(),
  dependencies: z.array(z.string().min(1)).default([]),
});

export const UpdateTaskSchema = z.object({
  id: z.string().min(1, "Invalid task ID"),
  title: z.string().min(3).max(100).optional(),
  description: z.string().max(500).optional().nullable(),
  status: z.enum(["BACKLOG", "TODO", "IN_PROGRESS", "IN_REVIEW", "DONE", "CANCELLED"]).optional(),
  priority: z.enum(["NO_PRIORITY", "LOW", "MEDIUM", "HIGH", "URGENT"]).optional(),
  agentId: z.string().min(1).optional().nullable(),
  dueDate: z.string().optional().nullable(),
});
