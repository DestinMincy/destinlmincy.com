import type { Prisma } from "@/lib/generated/prisma/client";
import type { ProjectStatus } from "@/lib/generated/prisma/enums";
import { projectStatusStartsWork } from "@/lib/client-work/types";
import { prisma } from "@/lib/db/client";
import { PAYMENT_GATE_SATISFIED_STATUSES } from "@/lib/payment-gates/types";

export interface ProjectWriteInput {
  applicationSiteId: string;
  name: string;
  status: ProjectStatus;
  summary: string | null;
  clientDescription: string | null;
  createsNewAsset: boolean;
  startsAt: Date | null;
  targetDate: Date | null;
}

export type ProjectWriteResult =
  | "saved"
  | "relationship-missing"
  | "project-missing"
  | "invalid-asset-selection"
  | "application-not-selectable"
  | "payment-gate-blocked";

async function applicationSiteIsSelectable(
  transaction: Prisma.TransactionClient,
  clientRelationshipId: string,
  applicationSiteId: string,
  currentApplicationSiteId?: string | null,
): Promise<boolean> {
  if (!applicationSiteId) {
    return true;
  }

  const application = await transaction.applicationSite.findFirst({
    where: {
      id: applicationSiteId,
      clientRelationshipId,
      OR: [
        { status: "ACTIVE" },
        ...(currentApplicationSiteId === applicationSiteId
          ? [{ id: applicationSiteId }]
          : []),
      ],
    },
    select: { id: true },
  });

  return Boolean(application);
}

/**
 * A project cannot move from a not-started status into a started one while a
 * gate flagged `requiredBeforeWork` is still unpaid and not waived. Projects
 * that are already running are not pulled back by a gate added later; admin
 * sees that on the project page instead.
 */
async function startIsBlockedByPaymentGate(
  transaction: Prisma.TransactionClient,
  clientRelationshipId: string,
  projectId: string,
  currentStatus: ProjectStatus,
  nextStatus: ProjectStatus,
): Promise<boolean> {
  if (!projectStatusStartsWork(nextStatus)) return false;
  if (projectStatusStartsWork(currentStatus)) return false;

  const blocking = await transaction.paymentGate.findFirst({
    where: {
      clientRelationshipId,
      projectId,
      requiredBeforeWork: true,
      status: { notIn: [...PAYMENT_GATE_SATISFIED_STATUSES] },
    },
    select: { id: true },
  });

  return Boolean(blocking);
}

export async function createProjectForRelationship(
  clientRelationshipId: string,
  input: ProjectWriteInput,
): Promise<ProjectWriteResult> {
  if (input.applicationSiteId && input.createsNewAsset) {
    return "invalid-asset-selection";
  }

  return prisma.$transaction(
    async (transaction) => {
      const relationship = await transaction.clientRelationship.findUnique({
        where: { id: clientRelationshipId },
        select: { id: true },
      });

      if (!relationship) {
        return "relationship-missing";
      }

      if (
        !(await applicationSiteIsSelectable(
          transaction,
          clientRelationshipId,
          input.applicationSiteId,
        ))
      ) {
        return "application-not-selectable";
      }

      await transaction.project.create({
        data: {
          clientRelationshipId,
          applicationSiteId: input.applicationSiteId || null,
          name: input.name,
          status: input.status,
          summary: input.summary,
          clientDescription: input.clientDescription,
          createsNewAsset: input.createsNewAsset,
          startsAt: input.startsAt,
          targetDate: input.targetDate,
        },
        select: { id: true },
      });

      return "saved";
    },
    { isolationLevel: "Serializable" },
  );
}

export async function updateProjectForRelationship(
  clientRelationshipId: string,
  projectId: string,
  input: ProjectWriteInput,
): Promise<ProjectWriteResult> {
  return prisma.$transaction(
    async (transaction) => {
      const existing = await transaction.project.findFirst({
        where: { id: projectId, clientRelationshipId },
        select: { id: true, applicationSiteId: true, status: true },
      });

      if (!existing) {
        return "project-missing";
      }

      if (
        await startIsBlockedByPaymentGate(
          transaction,
          clientRelationshipId,
          projectId,
          existing.status,
          input.status,
        )
      ) {
        return "payment-gate-blocked";
      }

      if (
        !(await applicationSiteIsSelectable(
          transaction,
          clientRelationshipId,
          input.applicationSiteId,
          existing.applicationSiteId,
        ))
      ) {
        return "application-not-selectable";
      }

      const result = await transaction.project.updateMany({
        where: { id: projectId, clientRelationshipId },
        data: {
          applicationSiteId: input.applicationSiteId || null,
          name: input.name,
          status: input.status,
          summary: input.summary,
          clientDescription: input.clientDescription,
          createsNewAsset: input.createsNewAsset,
          startsAt: input.startsAt,
          targetDate: input.targetDate,
        },
      });

      return result.count === 0 ? "project-missing" : "saved";
    },
    { isolationLevel: "Serializable" },
  );
}
