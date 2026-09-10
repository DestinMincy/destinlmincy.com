import { prisma } from "@/lib/db/client";
import type { ApplicationSiteType } from "@/lib/generated/prisma/enums";

export async function listApplicationSites(relationshipId: string) {
  return prisma.applicationSite.findMany({
    where: { clientRelationshipId: relationshipId, archivedAt: null },
    orderBy: { updatedAt: "desc" },
  });
}

export async function getApplicationSite(
  id: string,
  relationshipId: string,
) {
  return prisma.applicationSite.findFirst({
    where: { id, clientRelationshipId: relationshipId },
  });
}

export interface CreateApplicationSiteInput {
  name: string;
  type?: ApplicationSiteType;
  productionUrl?: string | null;
  stagingUrl?: string | null;
  repositoryUrl?: string | null;
  notes?: string | null;
  clientRelationshipId: string;
}

export async function createApplicationSite(data: CreateApplicationSiteInput) {
  return prisma.applicationSite.create({
    data: {
      clientRelationshipId: data.clientRelationshipId,
      name: data.name,
      type: data.type ?? "WEBSITE",
      productionUrl: data.productionUrl ?? null,
      stagingUrl: data.stagingUrl ?? null,
      repositoryUrl: data.repositoryUrl ?? null,
      notes: data.notes ?? null,
    },
    select: { id: true },
  });
}

export type UpdateApplicationSiteInput = Partial<
  Pick<
    CreateApplicationSiteInput,
    "name" | "type" | "productionUrl" | "stagingUrl" | "repositoryUrl" | "notes"
  >
>;

export async function updateApplicationSite(
  id: string,
  relationshipId: string,
  data: UpdateApplicationSiteInput,
) {
  return prisma.applicationSite.updateMany({
    where: { id, clientRelationshipId: relationshipId },
    data,
  });
}

export async function archiveApplicationSite(
  id: string,
  relationshipId: string,
) {
  return prisma.applicationSite.updateMany({
    where: { id, clientRelationshipId: relationshipId, archivedAt: null },
    data: {
      archivedAt: new Date(),
      status: "ARCHIVED",
    },
  });
}

export type ApplicationSiteListItem = Awaited<
  ReturnType<typeof listApplicationSites>
>[number];

export type ApplicationSiteDetail = NonNullable<
  Awaited<ReturnType<typeof getApplicationSite>>
>;
