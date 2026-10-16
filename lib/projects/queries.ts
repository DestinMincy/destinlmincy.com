import { prisma } from "@/lib/db/client";
import type { ProjectStatus } from "@/lib/generated/prisma/enums";

export interface ListProjectsFilters {
  applicationSiteId?: string;
}

export async function listProjects(
  relationshipId: string,
  filters?: ListProjectsFilters,
) {
  return prisma.project.findMany({
    where: {
      clientRelationshipId: relationshipId,
      archivedAt: null,
      ...(filters?.applicationSiteId
        ? { applicationSiteId: filters.applicationSiteId }
        : {}),
    },
    orderBy: { updatedAt: "desc" },
    include: {
      applicationSite: { select: { id: true, name: true, status: true } },
    },
  });
}

export async function getProject(id: string, relationshipId: string) {
  return prisma.project.findFirst({
    where: { id, clientRelationshipId: relationshipId },
    include: {
      applicationSite: { select: { id: true, name: true, status: true } },
    },
  });
}

export interface CreateProjectInput {
  name: string;
  clientRelationshipId: string;
  applicationSiteId?: string | null;
  status?: ProjectStatus;
  summary?: string | null;
  startDate?: Date | null;
  targetDate?: Date | null;
  clientFacingDescription?: string | null;
  createsNewAsset?: boolean;
}

export async function createProject(data: CreateProjectInput) {
  return prisma.project.create({
    data: {
      clientRelationshipId: data.clientRelationshipId,
      applicationSiteId: data.applicationSiteId ?? null,
      name: data.name,
      status: data.status ?? "PLANNED",
      summary: data.summary ?? null,
      startDate: data.startDate ?? null,
      targetDate: data.targetDate ?? null,
      clientFacingDescription: data.clientFacingDescription ?? null,
      createsNewAsset: data.createsNewAsset ?? false,
    },
    select: { id: true },
  });
}

export type UpdateProjectInput = Partial<
  Omit<CreateProjectInput, "clientRelationshipId">
>;

export async function updateProject(
  id: string,
  relationshipId: string,
  data: UpdateProjectInput,
) {
  const { clientRelationshipId: _omit, ...rest } = {
    clientRelationshipId: "",
    ...data,
  };
  void _omit;
  return prisma.project.updateMany({
    where: { id, clientRelationshipId: relationshipId },
    data: rest,
  });
}

export async function archiveProject(id: string, relationshipId: string) {
  return prisma.project.updateMany({
    where: { id, clientRelationshipId: relationshipId, archivedAt: null },
    data: { archivedAt: new Date() },
  });
}

export type ProjectListItem = Awaited<
  ReturnType<typeof listProjects>
>[number];

export type ProjectDetail = NonNullable<
  Awaited<ReturnType<typeof getProject>>
>;
