import { prisma } from "@/lib/db/client";

export async function getRelationshipIdentity(clientRelationshipId: string) {
  return prisma.clientRelationship.findUnique({
    where: { id: clientRelationshipId },
    select: {
      id: true,
      name: true,
      _count: {
        select: {
          applications: { where: { status: "ACTIVE" } },
          projects: { where: { status: { not: "ARCHIVED" } } },
        },
      },
    },
  });
}

export async function listApplicationSites(clientRelationshipId: string) {
  return prisma.applicationSite.findMany({
    where: { clientRelationshipId },
    orderBy: [{ status: "asc" }, { updatedAt: "desc" }],
    include: {
      _count: { select: { projects: true } },
    },
  });
}

export async function getApplicationSite(
  clientRelationshipId: string,
  applicationSiteId: string,
) {
  return prisma.applicationSite.findFirst({
    where: { id: applicationSiteId, clientRelationshipId },
  });
}

export async function listApplicationSiteOptions(
  clientRelationshipId: string,
  currentApplicationSiteId?: string | null,
) {
  return prisma.applicationSite.findMany({
    where: {
      clientRelationshipId,
      OR: [
        { status: "ACTIVE" },
        ...(currentApplicationSiteId ? [{ id: currentApplicationSiteId }] : []),
      ],
    },
    orderBy: [{ status: "asc" }, { name: "asc" }],
    select: { id: true, name: true, status: true },
  });
}

export async function listProjects(clientRelationshipId: string) {
  return prisma.project.findMany({
    where: { clientRelationshipId },
    orderBy: [{ status: "asc" }, { updatedAt: "desc" }],
    include: {
      applicationSite: { select: { id: true, name: true, status: true } },
    },
  });
}

export async function getProject(
  clientRelationshipId: string,
  projectId: string,
) {
  return prisma.project.findFirst({
    where: { id: projectId, clientRelationshipId },
    include: {
      applicationSite: { select: { id: true, name: true, status: true } },
    },
  });
}

export async function getClientVisibleWork(clientRelationshipId: string) {
  const [applications, projects] = await Promise.all([
    prisma.applicationSite.findMany({
      where: { clientRelationshipId, status: "ACTIVE" },
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        type: true,
        productionUrl: true,
      },
    }),
    prisma.project.findMany({
      where: { clientRelationshipId, status: { not: "ARCHIVED" } },
      orderBy: [{ targetDate: "asc" }, { name: "asc" }],
      select: {
        id: true,
        name: true,
        status: true,
        clientDescription: true,
        createsNewAsset: true,
        startsAt: true,
        targetDate: true,
        applicationSite: { select: { name: true } },
      },
    }),
  ]);

  return { applications, projects };
}
