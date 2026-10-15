import type {
  DeliverableType,
  DeliverableVisibility,
  MilestoneApprovalAction,
  MilestoneStatus,
} from "@/lib/generated/prisma/enums";
import { prisma } from "@/lib/db/client";

// ── Milestones ───────────────────────────────────────────────────────────────

export interface ListMilestonesFilters {
  projectId?: string;
}

export async function listMilestones(
  relationshipId: string,
  filters?: ListMilestonesFilters,
) {
  return prisma.milestone.findMany({
    where: {
      clientRelationshipId: relationshipId,
      ...(filters?.projectId ? { projectId: filters.projectId } : {}),
    },
    orderBy: [{ targetDate: "asc" }, { createdAt: "asc" }],
    include: {
      project: { select: { id: true, name: true } },
      _count: { select: { deliverables: true } },
    },
  });
}

export async function getMilestone(id: string, relationshipId: string) {
  return prisma.milestone.findFirst({
    where: { id, clientRelationshipId: relationshipId },
    include: {
      approvals: { orderBy: { createdAt: "desc" } },
      deliverables: { orderBy: { createdAt: "asc" } },
      project: { select: { id: true, name: true } },
    },
  });
}

export interface CreateMilestoneInput {
  clientRelationshipId: string;
  projectId: string;
  title: string;
  status?: MilestoneStatus;
  targetDate?: Date | null;
  clientFacingUpdate?: string | null;
  paymentDependencyId?: string | null;
  approvalRequired?: boolean;
}

export async function createMilestone(data: CreateMilestoneInput) {
  return prisma.milestone.create({
    data: {
      clientRelationshipId: data.clientRelationshipId,
      projectId: data.projectId,
      title: data.title,
      status: data.status ?? "PLANNED",
      targetDate: data.targetDate ?? null,
      clientFacingUpdate: data.clientFacingUpdate ?? null,
      paymentDependencyId: data.paymentDependencyId ?? null,
      approvalRequired: data.approvalRequired ?? false,
    },
    select: { id: true },
  });
}

export type UpdateMilestoneInput = Partial<
  Omit<CreateMilestoneInput, "clientRelationshipId">
>;

export async function updateMilestone(
  id: string,
  relationshipId: string,
  data: UpdateMilestoneInput,
) {
  return prisma.milestone.updateMany({
    where: { id, clientRelationshipId: relationshipId },
    data,
  });
}

// ── Milestone Approvals ──────────────────────────────────────────────────────

export interface AddMilestoneApprovalInput {
  milestoneId: string;
  clientRelationshipId: string;
  actorClerkUserId: string;
  actorName?: string | null;
  action: MilestoneApprovalAction;
  note?: string | null;
}

export async function addMilestoneApproval(data: AddMilestoneApprovalInput) {
  return prisma.milestoneApproval.create({
    data: {
      milestoneId: data.milestoneId,
      clientRelationshipId: data.clientRelationshipId,
      actorClerkUserId: data.actorClerkUserId,
      actorName: data.actorName ?? null,
      action: data.action,
      note: data.note ?? null,
    },
    select: { id: true },
  });
}

// ── Deliverables ─────────────────────────────────────────────────────────────

export interface ListDeliverablesFilters {
  projectId?: string;
  milestoneId?: string;
  visibility?: DeliverableVisibility;
}

export async function listDeliverables(
  relationshipId: string,
  filters?: ListDeliverablesFilters,
) {
  return prisma.deliverable.findMany({
    where: {
      clientRelationshipId: relationshipId,
      ...(filters?.projectId ? { projectId: filters.projectId } : {}),
      ...(filters?.milestoneId ? { milestoneId: filters.milestoneId } : {}),
      ...(filters?.visibility ? { visibility: filters.visibility } : {}),
    },
    orderBy: { createdAt: "asc" },
    include: {
      project: { select: { id: true, name: true } },
      milestone: { select: { id: true, title: true } },
    },
  });
}

export interface CreateDeliverableInput {
  clientRelationshipId: string;
  projectId?: string | null;
  milestoneId?: string | null;
  label: string;
  url?: string | null;
  type?: DeliverableType;
  notes?: string | null;
  visibility?: DeliverableVisibility;
}

export async function createDeliverable(data: CreateDeliverableInput) {
  return prisma.deliverable.create({
    data: {
      clientRelationshipId: data.clientRelationshipId,
      projectId: data.projectId ?? null,
      milestoneId: data.milestoneId ?? null,
      label: data.label,
      url: data.url ?? null,
      type: data.type ?? "LINK",
      notes: data.notes ?? null,
      visibility: data.visibility ?? "CLIENT",
    },
    select: { id: true },
  });
}

export type UpdateDeliverableInput = Partial<
  Omit<CreateDeliverableInput, "clientRelationshipId">
>;

export async function updateDeliverable(
  id: string,
  relationshipId: string,
  data: UpdateDeliverableInput,
) {
  return prisma.deliverable.updateMany({
    where: { id, clientRelationshipId: relationshipId },
    data,
  });
}

export type MilestoneListItem = Awaited<
  ReturnType<typeof listMilestones>
>[number];

export type MilestoneDetail = NonNullable<
  Awaited<ReturnType<typeof getMilestone>>
>;

export type DeliverableListItem = Awaited<
  ReturnType<typeof listDeliverables>
>[number];
