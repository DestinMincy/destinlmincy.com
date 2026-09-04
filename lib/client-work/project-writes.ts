import type { Prisma } from "@/lib/generated/prisma/client";
import type { ProjectStatus } from "@/lib/generated/prisma/enums";
import { prisma } from "@/lib/db/client";

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
  | "application-not-selectable";

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

export async function createProjectForRelationship(
  clientRelationshipId: string,
  input: ProjectWriteInput,
): Promise<ProjectWriteResult> {
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
        select: { id: true, applicationSiteId: true },
      });

      if (!existing) {
        return "project-missing";
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
